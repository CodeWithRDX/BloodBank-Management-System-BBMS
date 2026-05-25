import BloodRequest from '../models/BloodRequest.js';
import BloodInventory from '../models/BloodInventory.js';
import AuditLog from '../models/AuditLog.js';
import NotificationService from '../services/notificationService.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import { subtractFromInventory } from '../services/inventoryService.js';
import { emitRequestUpdate } from '../utils/socketManager.js';
import Staff from '../models/Staff.js';
import StaffLog from '../models/StaffLog.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import {
  sendBloodRequestCreatedEmail,
  sendBloodRequestStatusEmail,
  sendEmergencyBloodRequestEmail
} from '../services/emailService.js';

// Helper to log staff actions
const logStaffAction = async (actorUser, targetBranchId, operationType, previousData, updatedData, req, description = '') => {
  if (!actorUser) return;
  const staffProfile = await Staff.findOne({ userId: actorUser.id });
  if (staffProfile) {
    await StaffLog.create({
      staffId: staffProfile._id,
      branchId: targetBranchId || staffProfile.branchId,
      operationType,
      previousData,
      updatedData,
      ipAddress: req.clientIp || req.ip || '',
      description,
    });
  }
};


export const getRequests = async (req, res, next) => {
  try {
    const baseQuery = {};
    if (req.user.role !== 'admin' && req.user.branchId) baseQuery.branchId = req.user.branchId;
    if (req.query.branchId && req.user.role === 'admin') baseQuery.branchId = req.query.branchId;

    const totalCount = await BloodRequest.countDocuments(baseQuery);
    const features = new ApiFeatures(
      BloodRequest.find(baseQuery)
        .populate('requestedBy', 'name email')
        .populate('approvedBy', 'name')
        .populate('branchId', 'name address.city'),
      req.query
    ).filter().sort().paginate();
    const requests = await features.query;
    res.status(200).json({ success: true, count: requests.length, total: totalCount, pagination: features.pagination, data: requests });
  } catch (error) { next(error); }
};

export const getRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name')
      .populate('branchId', 'name address');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, data: request });
  } catch (error) { next(error); }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user.id })
      .populate('branchId', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) { next(error); }
};

export const createRequest = async (req, res, next) => {
  try {
    req.body.requestedBy = req.user.id;
    // Assign branch if provided or user's branch
    req.body.branchId = req.body.branchId || req.user.branchId || null;

    const request = await BloodRequest.create(req.body);

    await AuditLog.create({
      actionType: 'blood_request_create',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: request.branchId,
      targetType: 'BloodRequest',
      targetId: request._id,
      newData: { bloodGroup: request.bloodGroup, quantity: request.quantity, urgency: request.urgency },
      ipAddress: req.clientIp,
      description: `Blood request ${request.requestId} created for ${request.bloodGroup}`,
    });

    // Notify admins + branch staff for emergency requests
    if (request.urgency === 'emergency') {
      await NotificationService.notifyAdmins({
        title: '🚨 Emergency Blood Request',
        message: `Emergency request for ${request.quantity} units of ${request.bloodGroup}. Patient: ${request.patientName}`,
        type: 'emergency',
        category: 'emergency',
        referenceType: 'BloodRequest',
        referenceId: request._id,
      });

      // Trigger emergency alerts to nearby donors async
      try {
        Branch.findById(request.branchId).then(branch => {
          if (branch) sendEmergencyBloodRequestEmail(request, branch);
        });
      } catch (err) {
        console.error('Error triggering emergency alerts email:', err);
      }
    }

    // Send confirmation email to requester
    sendBloodRequestCreatedEmail({ ...request.toObject(), units: request.quantity }, req.user.email);

    res.status(201).json({ success: true, data: request });
  } catch (error) { next(error); }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const { status, rejectionReason } = req.body;
    const oldStatus = request.status;
    request.status = status;

    if (status === 'approved') {
      request.approvedBy = req.user.id;
      request.approvedAt = new Date();

      // AUTO-SUBTRACT INVENTORY on approval
      try {
        const result = await subtractFromInventory({
          bloodGroup: request.bloodGroup,
          component: request.component,
          quantity: request.quantity,
          branchId: request.branchId,
          performedBy: req.user.id,
          reason: `Blood request approved (${request.requestId})`,
          referenceType: 'BloodRequest',
          referenceId: request._id,
        });
        request.status = 'fulfilled';
        request.fulfilledAt = new Date();
      } catch (inventoryErr) {
        // Not enough stock — keep as approved but flag it
        console.warn(`[Request] Insufficient stock for ${request.requestId}: ${inventoryErr.message}`);
      }
    }

    if (status === 'rejected') {
      request.rejectionReason = rejectionReason || 'No reason provided';
    }
    if (status === 'completed') {
      request.fulfilledAt = new Date();
    }

    await request.save();

    await NotificationService.notifyRequestUpdate(request, request.status);
    emitRequestUpdate(request.requestedBy?.toString(), request.branchId?.toString(), request);

    await AuditLog.create({
      actionType: status === 'approved' ? 'blood_request_approve' : status === 'rejected' ? 'blood_request_reject' : 'blood_request_cancel',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: request.branchId,
      targetType: 'BloodRequest',
      targetId: request._id,
      oldData: { status: oldStatus },
      newData: { status: request.status },
      ipAddress: req.clientIp,
      description: `Request ${request.requestId} status: ${oldStatus} → ${request.status}`,
    });

    await logStaffAction(
      req.user,
      request.branchId,
      'blood_issue_operation',
      { status: oldStatus },
      { status: request.status },
      req,
      `Request ${request.requestId} status updated from ${oldStatus} to ${request.status}`
    );

    // Send email notification to requester
    try {
      const requestedUser = await User.findById(request.requestedBy);
      if (requestedUser && requestedUser.email) {
        sendBloodRequestStatusEmail(
          { ...request.toObject(), units: request.quantity },
          request.status,
          request.rejectionReason || '',
          requestedUser.email
        );
      }
    } catch (e) {
      console.error('Error sending blood request status email:', e);
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) { next(error); }
};

// @desc    Create public emergency blood request with document uploads
// @route   POST /api/requests/public-emergency
// @access  Public (Guest)
export const createPublicEmergencyRequest = async (req, res, next) => {
  try {
    const { patientName, bloodGroup, quantity, reason, emergencyContactName, emergencyContactPhone, branchId, email } = req.body;
    
    if (!patientName || !bloodGroup || !quantity || !reason || !emergencyContactName || !emergencyContactPhone || !branchId || !email) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validGroups.includes(bloodGroup)) {
      return res.status(400).json({ success: false, message: 'Invalid blood group selected' });
    }

    if (parseInt(quantity) < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1 unit' });
    }

    // Check files
    let medicalReportUrl = '';
    let governmentIdUrl = '';

    if (req.files) {
      if (req.files.medicalReport && req.files.medicalReport[0]) {
        medicalReportUrl = `/uploads/${req.files.medicalReport[0].filename}`;
      }
      if (req.files.governmentId && req.files.governmentId[0]) {
        governmentIdUrl = `/uploads/${req.files.governmentId[0].filename}`;
      }
    }

    if (!medicalReportUrl || !governmentIdUrl) {
      return res.status(400).json({ success: false, message: 'Both medical report and government ID proof uploads are mandatory' });
    }

    const targetBranch = await Branch.findById(branchId);
    if (!targetBranch) {
      return res.status(404).json({ success: false, message: 'Target branch center not found' });
    }

    const newRequest = await BloodRequest.create({
      patientName,
      bloodGroup,
      quantity: parseInt(quantity),
      urgency: 'emergency',
      reason,
      branchId,
      medicalReportUrl,
      governmentIdUrl,
      emergencyContact: {
        name: emergencyContactName,
        phone: emergencyContactPhone,
      },
      status: 'pending',
    });

    // Notify admins + branch staff for emergency requests
    await NotificationService.notifyAdmins({
      title: '🚨 Emergency Blood Request (Guest)',
      message: `Emergency request for ${newRequest.quantity} units of ${newRequest.bloodGroup}. Patient: ${newRequest.patientName}. Documents uploaded.`,
      type: 'emergency',
      category: 'emergency',
      referenceType: 'BloodRequest',
      referenceId: newRequest._id,
    });

    // Trigger emergency alerts to nearby donors async
    try {
      sendEmergencyBloodRequestEmail(newRequest, targetBranch);
    } catch (err) {
      console.error('Error triggering emergency alerts email:', err);
    }

    // Send confirmation email to requester
    try {
      sendBloodRequestCreatedEmail({ ...newRequest.toObject(), units: newRequest.quantity }, email);
    } catch (err) {
      console.error('Error sending confirmation email:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Emergency request submitted successfully. Our staff has been alerted.',
      data: newRequest,
    });
  } catch (error) {
    next(error);
  }
};


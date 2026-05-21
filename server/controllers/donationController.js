import Donation from '../models/Donation.js';
import Donor from '../models/Donor.js';
import AuditLog from '../models/AuditLog.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import { addToInventory } from '../services/inventoryService.js';
import Branch from '../models/Branch.js';

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private (Admin, Staff)
export const getDonations = async (req, res, next) => {
  try {
    const baseQuery = {};
    if (req.user.role !== 'admin' && req.user.branchId) baseQuery.branchId = req.user.branchId;
    if (req.query.branchId && req.user.role === 'admin') baseQuery.branchId = req.query.branchId;

    const totalCount = await Donation.countDocuments(baseQuery);
    const features = new ApiFeatures(
      Donation.find(baseQuery)
        .populate('donorId', 'fullName bloodGroup')
        .populate('collectedBy', 'name')
        .populate('branchId', 'name address.city')
        .populate('campId', 'name'),
      req.query
    ).filter().sort().paginate();

    const donations = await features.query;
    res.status(200).json({
      success: true,
      count: donations.length,
      total: totalCount,
      pagination: features.pagination,
      data: donations,
    });
  } catch (error) { next(error); }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
export const getDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'fullName bloodGroup phone')
      .populate('collectedBy', 'name')
      .populate('branchId', 'name')
      .populate('campId', 'name date');
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.status(200).json({ success: true, data: donation });
  } catch (error) { next(error); }
};

// @desc    Get my donations (donor)
// @route   GET /api/donations/my-donations
// @access  Private (Donor)
export const getMyDonations = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found' });
    const donations = await Donation.find({ donorId: donor._id })
      .populate('branchId', 'name')
      .populate('campId', 'name date')
      .sort('-donationDate');
    res.status(200).json({ success: true, count: donations.length, data: donations });
  } catch (error) { next(error); }
};

// @desc    Create donation record
// @route   POST /api/donations
// @access  Private (Admin, Staff)
export const createDonation = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.body.donorId);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

    const component = req.body.component || 'whole_blood';

    // Check eligibility based on component
    const eligibility = donor.checkEligibility(component);
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: `Donor is not eligible. ${eligibility.daysRemaining} days remaining in cooling period.`,
        daysRemaining: eligibility.daysRemaining,
      });
    }

    req.body.bloodGroup = donor.bloodGroup;
    req.body.collectedBy = req.user.id;
    let branchId = req.body.branchId || req.user.branchId;
    if (!branchId) {
      const defaultBranch = await Branch.findOne();
      if (defaultBranch) {
        branchId = defaultBranch._id;
      }
    }
    req.body.branchId = branchId || null;

    const donation = await Donation.create(req.body);

    // Update donor's donation record
    donor.recordDonation(component);
    await donor.save();

    // Auto-add to inventory when status is 'stored' or 'approved'
    if (['stored', 'approved'].includes(donation.status)) {
      const inventoryItem = await addToInventory({
        bloodGroup: donor.bloodGroup,
        component,
        quantity: donation.quantity,
        branchId: donation.branchId,
        donationId: donation._id,
        performedBy: req.user.id,
        reason: `Blood donation (${donation.donationId})`,
        referenceType: 'Donation',
        referenceId: donation._id,
      });

      // Link inventory item to donation
      await Donation.findByIdAndUpdate(donation._id, { inventoryId: inventoryItem._id });
    }

    await AuditLog.create({
      actionType: 'donation_create',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: donation.branchId,
      targetType: 'Donation',
      targetId: donation._id,
      newData: { donorId: donor._id, bloodGroup: donor.bloodGroup, quantity: donation.quantity },
      ipAddress: req.clientIp,
      description: `Donation ${donation.donationId} recorded for ${donor.fullName}`,
    });

    res.status(201).json({ success: true, data: donation });
  } catch (error) { next(error); }
};

// @desc    Update donation status — auto-adds to inventory on approval
// @route   PUT /api/donations/:id
// @access  Private (Admin, Staff)
export const updateDonation = async (req, res, next) => {
  try {
    let donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    const oldStatus = donation.status;
    const donor = await Donor.findById(donation.donorId);

    donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Auto-add to inventory when status changes to 'stored'/'approved' for first time
    if (
      ['stored', 'approved'].includes(donation.status) &&
      !['stored', 'approved'].includes(oldStatus) &&
      !donation.inventoryId
    ) {
      const inventoryItem = await addToInventory({
        bloodGroup: donation.bloodGroup,
        component: donation.component,
        quantity: donation.quantity,
        branchId: donation.branchId,
        donationId: donation._id,
        performedBy: req.user.id,
        reason: `Donation approved (${donation.donationId})`,
        referenceType: 'Donation',
        referenceId: donation._id,
      });
      await Donation.findByIdAndUpdate(donation._id, { inventoryId: inventoryItem._id });
    }

    await AuditLog.create({
      actionType: 'donation_update',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: donation.branchId,
      targetType: 'Donation',
      targetId: donation._id,
      oldData: { status: oldStatus },
      newData: { status: donation.status },
      ipAddress: req.clientIp,
      description: `Donation ${donation.donationId} status changed: ${oldStatus} → ${donation.status}`,
    });

    res.status(200).json({ success: true, data: donation });
  } catch (error) { next(error); }
};

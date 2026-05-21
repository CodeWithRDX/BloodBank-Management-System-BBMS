import Branch from '../models/Branch.js';
import BloodInventory from '../models/BloodInventory.js';
import Donation from '../models/Donation.js';
import BloodRequest from '../models/BloodRequest.js';
import Donor from '../models/Donor.js';
import Camp from '../models/Camp.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';

// @desc    Get admin analytics overview
// @route   GET /api/analytics/overview
// @access  Private (Admin)
export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const [
      totalBranches, activeBranches, pendingBranches,
      totalDonors, totalStaff, totalDonations, totalRequests,
      pendingRequests, totalCamps, upcomingCamps,
    ] = await Promise.all([
      Branch.countDocuments(),
      Branch.countDocuments({ status: 'approved' }),
      Branch.countDocuments({ status: 'pending' }),
      Donor.countDocuments({ status: 'active' }),
      Staff.countDocuments({ isActive: true }),
      Donation.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'pending' }),
      Camp.countDocuments(),
      Camp.countDocuments({ status: 'upcoming', date: { $gte: new Date() } }),
    ]);

    // Blood stock by group
    const bloodStock = await BloodInventory.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$quantity' } } },
      { $sort: { _id: 1 } },
    ]);

    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const stockByGroup = allGroups.map((g) => {
      const found = bloodStock.find((s) => s._id === g);
      return { bloodGroup: g, units: found ? found.totalUnits : 0 };
    });

    res.status(200).json({
      success: true,
      data: {
        totalBranches, activeBranches, pendingBranches,
        totalDonors, totalStaff, totalDonations, totalRequests,
        pendingRequests, totalCamps, upcomingCamps,
        stockByGroup,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Monthly donations chart data
// @route   GET /api/analytics/donations/monthly
// @access  Private (Admin)
export const getMonthlyDonations = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const data = await Donation.aggregate([
      {
        $match: {
          donationDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$donationDate' } },
          count: { $sum: 1 },
          units: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const result = months.map((month, i) => {
      const found = data.find((d) => d._id.month === i + 1);
      return { month, count: found?.count || 0, units: found?.units || 0 };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Blood request stats
// @route   GET /api/analytics/requests/stats
// @access  Private (Admin)
export const getRequestStats = async (req, res, next) => {
  try {
    const byStatus = await BloodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byBloodGroup = await BloodRequest.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byUrgency = await BloodRequest.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
    ]);

    res.status(200).json({ success: true, data: { byStatus, byBloodGroup, byUrgency } });
  } catch (error) {
    next(error);
  }
};

// @desc    Branch performance report
// @route   GET /api/analytics/branches/performance
// @access  Private (Admin)
export const getBranchPerformance = async (req, res, next) => {
  try {
    const branches = await Branch.find({ status: 'approved' }).select('name address.city');

    const branchStats = await Promise.all(
      branches.map(async (branch) => {
        const [donations, requests, staff, inventory, camps] = await Promise.all([
          Donation.countDocuments({ branchId: branch._id }),
          BloodRequest.countDocuments({ branchId: branch._id }),
          Staff.countDocuments({ branchId: branch._id }),
          BloodInventory.aggregate([
            { $match: { branchId: branch._id, status: 'available' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } },
          ]),
          Camp.countDocuments({ branchId: branch._id }),
        ]);

        return {
          branchId: branch._id,
          name: branch.name,
          city: branch.address?.city,
          donations,
          requests,
          staff,
          inventory: inventory[0]?.total || 0,
          camps,
        };
      })
    );

    res.status(200).json({ success: true, data: branchStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Inventory trends
// @route   GET /api/analytics/inventory/trends
// @access  Private (Admin)
export const getInventoryTrends = async (req, res, next) => {
  try {
    const branchId = req.query.branchId;
    const match = { status: 'available' };
    if (branchId) match.branchId = branchId;

    const byComponent = await BloodInventory.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$component',
          totalUnits: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]);

    const expiringIn7Days = await BloodInventory.countDocuments({
      status: 'available',
      expiryDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      ...(branchId ? { branchId } : {}),
    });

    const expired = await BloodInventory.countDocuments({
      status: 'expired',
      ...(branchId ? { branchId } : {}),
    });

    res.status(200).json({
      success: true,
      data: { byComponent, expiringIn7Days, expired },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Camp analytics
// @route   GET /api/analytics/camps
// @access  Private (Admin)
export const getCampAnalytics = async (req, res, next) => {
  try {
    const camps = await Camp.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRegistrations: { $sum: '$totalRegistrations' },
          totalDonations: { $sum: '$totalDonations' },
        },
      },
    ]);

    const topCamps = await Camp.find()
      .sort('-totalDonations')
      .limit(5)
      .populate('branchId', 'name');

    res.status(200).json({ success: true, data: { byStatus: camps, topCamps } });
  } catch (error) {
    next(error);
  }
};

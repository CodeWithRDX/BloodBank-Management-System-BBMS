import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Donation from '../models/Donation.js';
import BloodRequest from '../models/BloodRequest.js';
import BloodInventory from '../models/BloodInventory.js';
import Hospital from '../models/Hospital.js';
import Appointment from '../models/Appointment.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalDonors, totalHospitals, totalDonations, totalRequests, pendingRequests, totalUsers, totalInventory] =
      await Promise.all([
        Donor.countDocuments(),
        Hospital.countDocuments(),
        Donation.countDocuments(),
        BloodRequest.countDocuments(),
        BloodRequest.countDocuments({ status: 'pending' }),
        User.countDocuments(),
        BloodInventory.countDocuments({ status: 'available' }),
      ]);

    const bloodStock = await BloodInventory.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$bloodGroup', total: { $sum: '$quantity' } } },
      { $sort: { _id: 1 } },
    ]);

    const recentDonations = await Donation.find().sort('-createdAt').limit(5)
      .populate('donorId', 'fullName bloodGroup');
    const recentRequests = await BloodRequest.find().sort('-createdAt').limit(5)
      .populate('requestedBy', 'name');

    // Monthly donations for chart
    const monthlyDonations = await Donation.aggregate([
      { $group: { _id: { month: { $month: '$donationDate' }, year: { $year: '$donationDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: { totalDonors, totalHospitals, totalDonations, totalRequests, pendingRequests, totalUsers, totalInventory, bloodStock, recentDonations, recentRequests, monthlyDonations },
    });
  } catch (error) { next(error); }
};

// @desc    Get all users
// @route   GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.keyword) filter.name = { $regex: req.query.keyword, $options: 'i' };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter).skip(skip).limit(limit).sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, total, pagination: { page, limit }, data: users });
  } catch (error) { next(error); }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Donor.findOneAndDelete({ userId: user._id });
    await Hospital.findOneAndDelete({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};

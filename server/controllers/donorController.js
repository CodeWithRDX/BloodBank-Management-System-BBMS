import Donor from '../models/Donor.js';
import User from '../models/User.js';
import ApiFeatures from '../utils/ApiFeatures.js';

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private (Admin, Staff)
export const getDonors = async (req, res, next) => {
  try {
    const totalCount = await Donor.countDocuments();
    const features = new ApiFeatures(Donor.find().populate('userId', 'name email'), req.query)
      .search(['fullName', 'email', 'phone'])
      .filter()
      .sort()
      .paginate();

    const donors = await features.query;

    res.status(200).json({
      success: true,
      count: donors.length,
      total: totalCount,
      pagination: features.pagination,
      data: donors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donor
// @route   GET /api/donors/:id
// @access  Private
export const getDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id).populate('userId', 'name email');
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.status(200).json({ success: true, data: donor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor by user ID (for donor's own profile)
// @route   GET /api/donors/my-profile
// @access  Private (Donor)
export const getMyDonorProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found' });
    }
    res.status(200).json({ success: true, data: donor });
  } catch (error) {
    next(error);
  }
};

// @desc    Create donor profile
// @route   POST /api/donors
// @access  Private (Admin, Staff)
export const createDonor = async (req, res, next) => {
  try {
    const existingDonor = await Donor.findOne({ userId: req.body.userId });
    if (existingDonor) {
      return res.status(400).json({ success: false, message: 'Donor profile already exists for this user' });
    }

    const donor = await Donor.create(req.body);
    res.status(201).json({ success: true, data: donor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor
// @route   PUT /api/donors/:id
// @access  Private (Admin, Staff, Own donor)
export const updateDonor = async (req, res, next) => {
  try {
    let donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Allow only admin/staff or the donor themselves
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'staff' &&
      donor.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: donor });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (Admin)
export const deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    await Donor.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Donor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Check donor eligibility
// @route   GET /api/donors/:id/eligibility
// @access  Private
export const checkEligibility = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const isEligible = donor.checkEligibility();
    const daysSinceLastDonation = donor.lastDonationDate
      ? Math.floor((Date.now() - donor.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    res.status(200).json({
      success: true,
      data: {
        isEligible,
        lastDonationDate: donor.lastDonationDate,
        daysSinceLastDonation,
        daysUntilEligible: isEligible ? 0 : 90 - (daysSinceLastDonation || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

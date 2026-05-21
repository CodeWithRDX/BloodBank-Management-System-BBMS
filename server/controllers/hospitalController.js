import Hospital from '../models/Hospital.js';
import ApiFeatures from '../utils/ApiFeatures.js';

export const getHospitals = async (req, res, next) => {
  try {
    const totalCount = await Hospital.countDocuments();
    const features = new ApiFeatures(Hospital.find().populate('userId', 'name email'), req.query)
      .search(['name', 'email']).filter().sort().paginate();
    const hospitals = await features.query;
    res.status(200).json({ success: true, count: hospitals.length, total: totalCount, pagination: features.pagination, data: hospitals });
  } catch (error) { next(error); }
};

export const getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate('userId', 'name email');
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.status(200).json({ success: true, data: hospital });
  } catch (error) { next(error); }
};

export const getMyHospitalProfile = async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital profile not found' });
    res.status(200).json({ success: true, data: hospital });
  } catch (error) { next(error); }
};

export const createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({ success: true, data: hospital });
  } catch (error) { next(error); }
};

export const updateHospital = async (req, res, next) => {
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: hospital });
  } catch (error) { next(error); }
};

export const deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    await Hospital.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Hospital deleted' });
  } catch (error) { next(error); }
};

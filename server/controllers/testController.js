import TestReport from '../models/TestReport.js';
import Donation from '../models/Donation.js';
import ApiFeatures from '../utils/ApiFeatures.js';

export const getTestReports = async (req, res, next) => {
  try {
    const totalCount = await TestReport.countDocuments();
    const features = new ApiFeatures(
      TestReport.find().populate('donorId', 'fullName bloodGroup').populate('testedBy', 'name'),
      req.query
    ).filter().sort().paginate();
    const reports = await features.query;
    res.status(200).json({ success: true, count: reports.length, total: totalCount, pagination: features.pagination, data: reports });
  } catch (error) { next(error); }
};

export const getTestReport = async (req, res, next) => {
  try {
    const report = await TestReport.findById(req.params.id)
      .populate('donorId', 'fullName bloodGroup').populate('testedBy', 'name');
    if (!report) return res.status(404).json({ success: false, message: 'Test report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (error) { next(error); }
};

export const createTestReport = async (req, res, next) => {
  try {
    req.body.testedBy = req.user.id;
    const report = new TestReport(req.body);
    report.determineSafety();
    await report.save();

    // Update donation status based on test result
    if (report.donationId) {
      await Donation.findByIdAndUpdate(report.donationId, {
        status: report.status === 'safe' ? 'approved' : 'rejected',
      });
    }

    res.status(201).json({ success: true, data: report });
  } catch (error) { next(error); }
};

export const updateTestReport = async (req, res, next) => {
  try {
    let report = await TestReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Test report not found' });
    report = await TestReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: report });
  } catch (error) { next(error); }
};

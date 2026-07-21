const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');

const createReport = async (reportData) => {
  const report = await Report.create(reportData);
  await report.populate('reportedBy', 'fullName email');
  await report.populate('reportType', 'name color');
  return report;
};

const getReports = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    district,
    severity,
    status,
    reportType,
    startDate,
    endDate,
    search,
  } = queryParams;

  const filter = {};

  if (district) filter.district = district;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  if (reportType) filter.reportType = reportType;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
      { address: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reportedBy', 'fullName email')
      .populate('verifiedBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('reportType', 'name color')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

const getReportById = async (reportId) => {
  const report = await Report.findById(reportId)
    .populate('reportedBy', 'fullName email')
    .populate('verifiedBy', 'fullName email')
    .populate('assignedTo', 'fullName email')
    .populate('reportType', 'name color');

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  return report;
};

const updateReport = async (reportId, updateData) => {
  const report = await Report.findByIdAndUpdate(reportId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('reportedBy', 'fullName email')
    .populate('verifiedBy', 'fullName email')
    .populate('assignedTo', 'fullName email')
    .populate('reportType', 'name color');

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  return report;
};

const deleteReport = async (reportId) => {
  const report = await Report.findByIdAndDelete(reportId);

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  return report;
};

const updateReportStatus = async (reportId, status, verifiedBy, remarks) => {
  const updateFields = { status };
  if (verifiedBy) updateFields.verifiedBy = verifiedBy;
  if (remarks !== undefined) updateFields.remarks = remarks;
  if (status === 'Closed') updateFields.assignedTo = null;

  const report = await Report.findByIdAndUpdate(reportId, updateFields, {
    new: true,
    runValidators: true,
  })
    .populate('reportedBy', 'fullName email')
    .populate('verifiedBy', 'fullName email')
    .populate('assignedTo', 'fullName email')
    .populate('reportType', 'name color');

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  return report;
};

const assignToUser = async (reportId, userId) => {
  const report = await Report.findByIdAndUpdate(
    reportId,
    { assignedTo: userId, assignedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate('reportedBy', 'fullName email')
    .populate('verifiedBy', 'fullName email')
    .populate('assignedTo', 'fullName email')
    .populate('reportType', 'name color');

  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  return report;
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
  assignToUser,
};

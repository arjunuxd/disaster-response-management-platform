const reportService = require('../services/reportService');
const notificationService = require('../services/notificationService');
const auditLogService = require('../services/auditLogService');
const User = require('../models/User');

const STATUS_LABELS = {
  'Under Review': 'under_review',
  Verified: 'verified',
  Rejected: 'rejected',
  Resolved: 'resolved',
  Assigned: 'assigned',
  Closed: 'closed',
};

const STATUS_MESSAGES = {
  'Under Review': 'Your report "{title}" is now under review.',
  Verified: 'Your report "{title}" has been verified by an administrator.',
  Rejected: 'Your report "{title}" has been rejected by an administrator.',
  Resolved: 'Your report "{title}" has been marked as resolved.',
  Assigned: 'Your report "{title}" has been assigned to a response team.',
  Closed: 'Your report "{title}" has been closed.',
};

const createReport = async (req, res, next) => {
  try {
    const imagePaths = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const reportData = {
      ...req.body,
      images: imagePaths,
      reportedBy: req.user._id,
    };

    const report = await reportService.createReport(reportData);

    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await notificationService.createNotification({
        user: admin._id,
        type: 'report_submitted',
        title: 'New Report Submitted',
        message: `${req.user.fullName} submitted a new ${(report.reportType?.name || report.reportType)} report: "${report.title}" in ${report.district}.`,
        link: '/admin/reports',
        relatedId: report._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const result = await reportService.getReports(req.query);

    res.status(200).json({
      success: true,
      data: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.id);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const existing = await reportService.getReportById(req.params.id);
    const isOwner = existing.reportedBy?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this report.',
      });
    }

    const updateData = { ...req.body };
    delete updateData.status;
    delete updateData.verifiedBy;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      updateData.images = [...(updateData.images || []), ...newImages];
    }

    const report = await reportService.updateReport(req.params.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    const oldData = {
      title: report.title,
      reportType: report.reportType,
      status: report.status,
      severity: report.severity,
    };

    await reportService.deleteReport(req.params.id);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Report Deleted',
      module: 'Report',
      oldValue: oldData,
      affectedRecordId: report._id,
      affectedRecordModel: 'Report',
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const report = await reportService.updateReportStatus(
      req.params.id,
      status,
      req.user._id,
      remarks
    );

    const actionMap = {
  'Under Review': 'Report Updated',
  Verified: 'Report Approved',
  Rejected: 'Report Rejected',
  Resolved: 'Report Resolved',
  Assigned: 'Report Assigned',
  Closed: 'Report Closed',
};

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: actionMap[status] || 'Report Updated',
      module: 'Report',
      oldValue: { status: 'Pending', remarks: '' },
      newValue: { status, remarks: remarks || '' },
      affectedRecordId: report._id,
      affectedRecordModel: 'Report',
      ipAddress: req.ip,
      remarks: remarks || `Status changed to ${status}`,
    });

    if (report.reportedBy && STATUS_LABELS[status]) {
      await notificationService.createNotification({
        user: report.reportedBy._id || report.reportedBy,
        type: `report_${STATUS_LABELS[status]}`,
        title: `Report ${status.charAt(0) + status.slice(1).toLowerCase()}`,
        message: STATUS_MESSAGES[status].replace('{title}', report.title),
        link: `/reports/${report._id}`,
        relatedId: report._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Report status updated to '${status}'.`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const assignReport = async (req, res, next) => {
  try {
    const { assignedTo, remarks } = req.body;

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: 'Assignee user not found.',
      });
    }

    const report = await reportService.updateReportStatus(
      req.params.id,
      'Assigned',
      req.user._id,
      remarks || `Assigned to ${assignee.fullName}`
    );

    await reportService.assignToUser(req.params.id, assignedTo);

    await auditLogService.log({
      adminId: req.user._id,
      adminName: req.user.fullName,
      action: 'Report Assigned',
      module: 'Report',
      oldValue: { status: report.status, assignedTo: null },
      newValue: { status: 'Assigned', assignedTo: assignee.fullName },
      affectedRecordId: report._id,
      affectedRecordModel: 'Report',
      ipAddress: req.ip,
      remarks: remarks || `Report assigned to ${assignee.fullName}`,
    });

    if (report.reportedBy) {
      await notificationService.createNotification({
        user: report.reportedBy._id || report.reportedBy,
        type: 'report_assigned',
        title: 'Report Assigned',
        message: `Your report "${report.title}" has been assigned to ${assignee.fullName}.`,
        link: `/reports/${report._id}`,
        relatedId: report._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Report assigned to ${assignee.fullName}.`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
  assignReport,
};

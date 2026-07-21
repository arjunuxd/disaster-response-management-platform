import api from './api';

const analyticsService = {
  getOverview: (params = {}) => api.get('/analytics/overview', { params }),
  getPublicOverview: () => api.get('/analytics/public-overview'),
  getReportsByMonth: (params = {}) => api.get('/analytics/reports-by-month', { params }),
  getReportsByDistrict: (params = {}) => api.get('/analytics/reports-by-district', { params }),
  getReportsByType: (params = {}) => api.get('/analytics/reports-by-type', { params }),
  getReportsBySeverity: (params = {}) => api.get('/analytics/reports-by-severity', { params }),
  getReportsByStatus: (params = {}) => api.get('/analytics/reports-by-status', { params }),
  getAlertsByPriority: (params = {}) => api.get('/analytics/alerts-by-priority', { params }),
  getRiskZonesByLevel: (params = {}) => api.get('/analytics/risk-zones-by-level', { params }),
  getSheltersByStatus: (params = {}) => api.get('/analytics/shelters-by-status', { params }),
  getRecentActivity: () => api.get('/analytics/recent-activity'),
  getExportData: (type, params = {}) => api.get(`/analytics/export/${type}`, { params }),
};

export default analyticsService;

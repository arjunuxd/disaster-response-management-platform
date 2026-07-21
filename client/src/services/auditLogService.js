import api from './api';

const auditLogService = {
  getLogs: (params) => api.get('/audit-logs', { params }),
  getLogById: (id) => api.get(`/audit-logs/${id}`),
  getRecentLogs: (limit = 10) => api.get('/audit-logs/recent', { params: { limit } }),
  getModuleStats: () => api.get('/audit-logs/stats/modules'),
  getActionStats: () => api.get('/audit-logs/stats/actions'),
};

export default auditLogService;

import api from './api';

const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),

  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  updateAlert: (id, data) => api.put(`/alerts/${id}`, data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  createAlert: (data) => api.post('/alerts', data),

  updateReportStatus: (id, data) => api.patch(`/reports/${id}/status`, data),
  assignReport: (id, data) => api.patch(`/reports/${id}/assign`, data),
  deleteReport: (id) => api.delete(`/reports/${id}`),

  createRiskZone: (data) => api.post('/risk-zones', data),
  updateRiskZone: (id, data) => api.put(`/risk-zones/${id}`, data),
  deleteRiskZone: (id) => api.delete(`/risk-zones/${id}`),
  getRiskZones: () => api.get('/risk-zones'),
  getRiskZoneById: (id) => api.get(`/risk-zones/${id}`),

  createShelter: (data) => api.post('/shelters', data),
  updateShelter: (id, data) => api.put(`/shelters/${id}`, data),
  deleteShelter: (id) => api.delete(`/shelters/${id}`),
  getShelters: () => api.get('/shelters'),
  getShelterById: (id) => api.get(`/shelters/${id}`),

  getDisasterTypes: () => api.get('/disaster-types/all'),
  createDisasterType: (data) => api.post('/disaster-types', data),
  updateDisasterType: (id, data) => api.put(`/disaster-types/${id}`, data),
  toggleDisasterTypeActive: (id) => api.patch(`/disaster-types/${id}/toggle-active`),
  deleteDisasterType: (id) => api.delete(`/disaster-types/${id}`),
};

export default adminService;

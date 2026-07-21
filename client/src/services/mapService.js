import api from '../services/api';

const mapService = {
  getReports: (params = {}) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),

  getRiskZones: () => api.get('/risk-zones'),
  getRiskZoneById: (id) => api.get(`/risk-zones/${id}`),
  createRiskZone: (data) => api.post('/risk-zones', data),
  updateRiskZone: (id, data) => api.put(`/risk-zones/${id}`, data),
  deleteRiskZone: (id) => api.delete(`/risk-zones/${id}`),

  getShelters: () => api.get('/shelters'),
  getShelterById: (id) => api.get(`/shelters/${id}`),
};

export default mapService;

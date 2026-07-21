import api from './api';

const alertService = {
  getAlerts: (params) => api.get('/alerts', { params }),
  getActiveAlerts: () => api.get('/alerts', { params: { active: 'true' } }),
  getAlertById: (id) => api.get(`/alerts/${id}`),
};

export default alertService;

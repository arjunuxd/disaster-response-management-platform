import api from './api';

const disasterTypeService = {
  getDisasterTypes: () => api.get('/disaster-types'),
  getAllDisasterTypes: () => api.get('/disaster-types/all'),
  getDisasterTypeById: (id) => api.get(`/disaster-types/${id}`),
  createDisasterType: (data) => api.post('/disaster-types', data),
  updateDisasterType: (id, data) => api.put(`/disaster-types/${id}`, data),
  toggleDisasterTypeActive: (id) => api.patch(`/disaster-types/${id}/toggle-active`),
  deleteDisasterType: (id) => api.delete(`/disaster-types/${id}`),
};

export default disasterTypeService;

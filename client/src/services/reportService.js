import api from './api';

const reportService = {
  createReport: (formData) =>
    api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getReports: (params) => api.get('/reports', { params }),

  getReportById: (id) => api.get(`/reports/${id}`),

  updateReport: (id, formData) =>
    api.put(`/reports/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteReport: (id) => api.delete(`/reports/${id}`),
};

export default reportService;

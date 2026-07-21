import api from './api';

const notificationService = {
  getNotifications: (params = {}) => {
    return api.get('/notifications', { params });
  },

  getUnreadCount: () => {
    return api.get('/notifications/unread-count');
  },

  markAsRead: (id) => {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: () => {
    return api.patch('/notifications/read-all');
  },

  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`);
  },
};

export default notificationService;

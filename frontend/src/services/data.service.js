import apiClient from './api';

export default {
  getTicketCategories() {
    return apiClient.get('/data/ticket-categories');
  },
  getTicketStatuses() {
    return apiClient.get('/data/ticket-statuses');
  },
  getAdmins() {
    return apiClient.get('/data/admins');
  }
};
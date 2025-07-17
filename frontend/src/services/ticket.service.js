import apiClient from './api';

export default {
  // Llama a GET /api/tickets. El backend decide qué tickets devolver.
  getTickets() {
    return apiClient.get('/tickets');
  },
  // Llama a GET /api/tickets/:id
  getTicketById(id) {
    return apiClient.get(`/tickets/${id}`);
  },
  // Llama a POST /api/tickets
  createTicket(data) {
    return apiClient.post('/tickets', data);
  },
  // Llama a PUT /api/tickets/:id
  updateTicket(id, data) {
    return apiClient.put(`/tickets/${id}`, data);
  },
  // Llama a POST /api/tickets/:id/comments
  addComment(id, data) {
    return apiClient.post(`/tickets/${id}/comments`, data);
  }
};
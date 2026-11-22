import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    if (error.response?.data?.detail) {
      toast.error(error.response.data.detail)
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
}

// Conversations
export const conversationsAPI = {
  list: (params?: { status?: string; source?: string; page?: number; page_size?: number; search?: string }) =>
    api.get('/conversations', { params }),
  get: (id: string) => api.get(`/conversations/${id}`),
  create: (data: { user_id?: string; department_id?: string; source?: string; subject?: string; tags?: string[] }) =>
    api.post('/conversations', data),
  update: (id: string, data: { agent_id?: string; status?: string; tags?: string[]; subject?: string }) =>
    api.put(`/conversations/${id}`, data),
  close: (id: string) => api.post(`/conversations/${id}/close`),
}

// Messages
export const messagesAPI = {
  list: (conversationId: string, params?: { page?: number; page_size?: number }) =>
    api.get(`/messages/conversation/${conversationId}`, { params }),
  send: (data: { conversation_id: string; sender_id: string; sender_type: string; content: string; type?: string }) =>
    api.post('/messages', data),
}

// Tickets
export const ticketsAPI = {
  list: (params?: { status?: string; priority?: string; page?: number; page_size?: number }) =>
    api.get('/tickets', { params }),
  get: (id: string) => api.get(`/tickets/${id}`),
  create: (data: { user_id?: string; department_id?: string; subject: string; description: string; category?: string; priority?: string }) =>
    api.post('/tickets', data),
  update: (id: string, data: { agent_id?: string; status?: string; priority?: string }) =>
    api.put(`/tickets/${id}`, data),
  addMessage: (id: string, content: string, isInternal?: boolean) =>
    api.post(`/tickets/${id}/messages?content=${encodeURIComponent(content)}&is_internal=${isInternal || false}`),
  getMessages: (id: string) => api.get(`/tickets/${id}/messages`),
}

// Articles (Knowledge Base)
export const articlesAPI = {
  list: (params?: { category_id?: string; status?: string; language?: string; search?: string; page?: number; page_size?: number }) =>
    api.get('/articles', { params }),
  get: (id: string) => api.get(`/articles/${id}`),
  getBySlug: (slug: string) => api.get(`/articles/slug/${slug}`),
  create: (data: { title: string; content: string; slug: string; category_id?: string; status?: string; language?: string }) =>
    api.post('/articles', data),
  update: (id: string, data: { title?: string; content?: string; category_id?: string; status?: string }) =>
    api.put(`/articles/${id}`, data),
}

// Categories
export const categoriesAPI = {
  list: () => api.get('/articles/categories'),
  create: (data: { name: string; slug: string; description?: string; parent_id?: string; icon?: string; display_order?: number }) =>
    api.post('/articles/categories', data),
}

// Departments
export const departmentsAPI = {
  list: () => api.get('/departments'),
  get: (id: string) => api.get(`/departments/${id}`),
  getBySlug: (slug: string) => api.get(`/departments/slug/${slug}`),
  create: (data: { name: string; slug: string; description?: string; email?: string; color?: string; display_order?: number }) =>
    api.post('/departments', data),
  update: (id: string, data: { name: string; slug: string; description?: string; email?: string; color?: string; display_order?: number }) =>
    api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
}

// Dashboard & Reports
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  getReports: () => api.get('/dashboard/reports'),
}

// Chatbot
export const chatbotAPI = {
  listConfigs: () => api.get('/chatbot/configs'),
  createConfig: (data: any) => api.post('/chatbot/configs', data),
  listQnA: (chatbotId: string) => api.get(`/chatbot/qna?chatbot_id=${chatbotId}`),
  createQnA: (data: { chatbot_id: string; question: string; answer: string; category?: string }) =>
    api.post('/chatbot/qna', data),
  listFlows: (chatbotId: string) => api.get(`/chatbot/flows?chatbot_id=${chatbotId}`),
  createFlow: (data: { chatbot_id: string; name: string; description?: string; steps: any[] }) =>
    api.post('/chatbot/flows', data),
  chat: (message: string, conversationId: string, chatbotId?: string) =>
    api.post('/chatbot/chat', { message, conversation_id: conversationId, chatbot_id: chatbotId }),
}

// Notifications
export const notificationsAPI = {
  list: (params?: { limit?: number; unread_only?: boolean }) => api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
}

// Settings
export const settingsAPI = {
  list: (category?: string) => api.get('/settings', { params: { category } }),
  get: (key: string) => api.get(`/settings/key/${key}`),
  update: (data: { key: string; value: string; category?: string }) => api.post('/settings', data),
  bulkUpdate: (data: Record<string, string>, category?: string) =>
    api.put('/settings/bulk', data, { params: { category } }),
}

// Users
export const usersAPI = {
  list: (role?: string) => api.get('/users', { params: { role } }),
  listAgents: () => api.get('/users/agents'),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: { name?: string; phone?: string; language?: string; timezone?: string }) =>
    api.put(`/users/${id}`, data),
}

export default api

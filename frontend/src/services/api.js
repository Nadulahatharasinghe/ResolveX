import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User API helper
export const getUsers = () => api.get('/auth/users');

// Issues API helpers
export const getIssues = (params) => api.get('/issues', { params });
export const getIssueById = (id) => api.get(`/issues/${id}`);
export const createIssue = (issueData) => api.post('/issues', issueData);
export const updateIssue = (id, issueData) => api.put(`/issues/${id}`, issueData);
export const deleteIssue = (id) => api.delete(`/issues/${id}`);

export default api;

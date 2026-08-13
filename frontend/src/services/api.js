import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
// Get all users for assignee dropdown (authenticated users)
export const getUsers = () => api.get('/auth/users');

// ── Issues ────────────────────────────────────────────────────────────────────
export const getIssues    = (params)       => api.get('/issues', { params });
export const getIssueById = (id)           => api.get(`/issues/${id}`);
export const createIssue  = (issueData)    => api.post('/issues', issueData);
export const updateIssue  = (id, issueData)=> api.put(`/issues/${id}`, issueData);
export const deleteIssue  = (id)           => api.delete(`/issues/${id}`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAdminStats      = ()              => api.get('/admin/stats');
export const getAdminUsers      = ()              => api.get('/admin/users');
export const updateUserRole     = (id, role)      => api.put(`/admin/users/${id}/role`, { role });

export default api;

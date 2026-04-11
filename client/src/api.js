import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const getMySnippets = () =>
  api.get('/snippets');

export const getPublicSnippets = (params) =>
  api.get('/snippets/public', { params });

export const getSharedSnippet = (shareId) =>
  api.get(`/snippets/share/${shareId}`);

export const createSnippet = (data) =>
  api.post('/snippets', data);

export const updateSnippet = (id, data) =>
  api.patch(`/snippets/${id}`, data);

export const deleteSnippet = (id) =>
  api.delete(`/snippets/${id}`);

export const explainCode = (code, language) =>
  api.post('/ai/explain', { code, language });

export const improveCode = (code, language) =>
  api.post('/ai/improve', { code, language });

export const generateCode = (description, language) =>
  api.post('/ai/generate', { description, language });
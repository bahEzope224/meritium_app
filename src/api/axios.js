import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Intercepteur pour ajouter le token JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('meritium_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
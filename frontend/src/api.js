import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
});

export const monitorApi = axios.create({
  baseURL: import.meta.env.VITE_MONITOR_URL ?? 'http://localhost:8000',
});

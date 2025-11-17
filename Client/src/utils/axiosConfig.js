// client/src/utils/axiosConfig.js

import axios from "axios";

// This attempts to read the variable VITE_API_BASE_URL (set on Vercel)
// If it fails (e.g., local development), it falls back to "/api".
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// 1. Create a custom Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Attach JWT Token before every request
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// client/src/utils/axiosConfig.js (FINAL DEPLOYMENT VERSION)

import axios from "axios";

// Determine the correct base URL based on the environment.
// 1. In production (on Vercel), this variable is set to the full Express URL (e.g., https://skill-api-xyz.onrender.com/api).
// 2. In local development, it defaults to '/api' to use the local proxy.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// 1. Create a custom Axios instance
const api = axios.create({
  // Use the environment-specific base URL
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Attach JWT Token before every request
api.interceptors.request.use((config) => {
  // Retrieve user data (which includes the token) from local storage
  const userInfo = localStorage.getItem("userInfo");

  if (userInfo) {
    const { token } = JSON.parse(userInfo);

    // Attach the token in the required Bearer format for Express middleware
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

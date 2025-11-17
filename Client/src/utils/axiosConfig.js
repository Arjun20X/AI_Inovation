// client/src/utils/axiosConfig.js (FINAL DEPLOYMENT VERSION)
import axios from "axios";

// TEMPORARY FIX FOR DEPLOYMENT AMBIGUITY: Use the absolute deployed URL
// IMPORTANT: REPLACE THIS with your actual Render Express URL!
const API_BASE_URL = "https://ai-skill-gap-backend.onrender.com/api";
// ^^^^^^^^^^^ Ensure you use the correct HTTPS URL and include /api

// 1. Create a custom Axios instance
const api = axios.create({
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

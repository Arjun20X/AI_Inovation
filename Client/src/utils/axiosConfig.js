// client/src/utils/axiosConfig.js

import axios from "axios";

// 1. Create a custom Axios instance
const api = axios.create({
  // IMPORTANT: This relies on the 'proxy' setting in client/package.json
  // or vite.config.js to direct /api calls to http://localhost:5000
  baseURL: "/api",
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


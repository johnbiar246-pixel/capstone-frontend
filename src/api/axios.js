import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Attach token automatically to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.code === "ECONNABORTED") {
      error.message =
        "Request timeout. Please check your connection and try again.";
    } else if (!error.response) {
      // Network error - no response received
      error.message =
        "Network error. Please check your internet connection and ensure the server is running.";
    } else if (error.response.status === 401) {
      error.message = "Authentication failed. Please log in again.";
      // Clear token on auth error
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    } else if (error.response.status === 403) {
      error.message = "You don't have permission to perform this action.";
    } else if (error.response.status === 404) {
      error.message = "Resource not found.";
    } else if (error.response.status >= 500) {
      error.message = "Server error. Please try again later.";
    }

    return Promise.reject(error);
  },
);

export default API;

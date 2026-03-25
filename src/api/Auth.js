import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance with auth interceptor
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
authApi.interceptors.request.use(
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

export const loginUser = (email, password) =>
  authApi.post("/auth/signin", { email, password });

export const logoutUser = async () => {
  try {
    await authApi.post("/auth/logout", {}, { withCredentials: true });
  } catch (error) {
    console.log("Logout API call failed, proceeding with client logout");
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  }
};

export const createUser = (data) =>
  authApi.post("/auth/create-user", data, { withCredentials: true });

export const getUsers = () =>
  authApi.get("/auth/users", { withCredentials: true });

export const updateUser = (id, data) =>
  authApi.put(`/auth/users/${id}`, data, { withCredentials: true });

export const deleteUser = (id) =>
  authApi.delete(`/auth/users/${id}`, { withCredentials: true });

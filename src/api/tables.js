import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance
const tablesApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
tablesApi.interceptors.request.use(
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

// Generate multiple tables with QR codes
export const generateTables = async (tableNumbers) => {
  const response = await tablesApi.post("/tables", { tableNumbers });
  return response.data;
};

// Get all tables
export const getAllTables = async () => {
  const response = await tablesApi.get("/tables");
  return response.data;
};

// Get table by number
export const getTableByNumber = async (number) => {
  const response = await tablesApi.get(`/tables/${number}`);
  return response.data;
};

// Delete a table
export const deleteTable = async (id) => {
  const response = await tablesApi.delete(`/tables/${id}`);
  return response.data;
};

// Update a table
export const updateTable = async (id, data) => {
  const response = await tablesApi.put(`/tables/${id}`, data);
  return response.data;
};

export default tablesApi;

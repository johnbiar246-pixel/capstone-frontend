import axios from "axios";
import { useAuth } from "../contexts/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance with auth interceptor
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create a sale (complete POS transaction)
export const createSale = async (
  items,
  paymentMethod,
  tableId,
  referenceNo = null,
) => {
  // Get userId if available (for logged in users), otherwise use guest mode
  const userId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId") || null;

  const response = await api.post(`/sales`, {
    ...(userId && { userId }), // Only include userId if available
    paymentMethod,
    items,
    tableId,
    ...(referenceNo && { referenceNo }),
  });
  return response.data;
};

// Get sales with filters
export const getSales = (params) => {
  return api.get("/sales", { params });
};

// Get sales for current user
export const getUserSales = async () => {
  const userId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId") || null;
  const response = await api.get("/sales", {
    params: userId ? { userId } : {},
  });
  return response;
};

// Get sales by table number (for guest users)
export const getSalesByTable = async (tableNumber) => {
  const response = await api.get(`/sales/by-table/${tableNumber}`);
  return response.data;
};

// Update sale status (accept/decline/cancel)
export const updateSaleStatus = async (saleId, status) => {
  const response = await api.patch(`/sales/${saleId}/status`, { status });
  return response.data;
};
// Get recent sales
export const getRecentSales = async (limit = 10) => {
  const response = await api.get(`/sales?_limit=${limit}`);
  return response.data;
};

export default {
  createSale,
  getSales,
  getRecentSales,
};

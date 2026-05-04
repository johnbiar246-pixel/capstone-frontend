import axios from "axios";


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

// Unified checkout - creates Order + Sale atomically
export const checkout = async (items, tableId, paymentMethod, referenceNo = null, amountTendered = null, customerType = "REGULAR") => {
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId") || null;
  
  const res = await api.post("/checkout", {
    ...(userId && { userId }),
    items,
    tableId,
    paymentMethod,
    ...(referenceNo && { referenceNo }),
    ...(amountTendered && { amountTendered }),
    customerType,
  });

  return res.data;
};

// Legacy createSale (deprecated - use checkout)
export const createSale = async (items, paymentMethod, tableId, referenceNo = null, orderId = null) => {
  console.warn("createSale deprecated - use checkout instead");
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId") || null;
  
  const res = await api.post("/sales", {
    ...(userId && { userId }),
    ...(orderId && { orderId }),
    paymentMethod,
    items,
    tableId,
    ...(referenceNo && { referenceNo }),
  });

  return res.data.data;
};


// Get sales with filters
export const getSales = async (params) => {
  const res = await api.get("/sales", { params });
  return res.data.data;
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
// Get sale by ID (for order details)
export const getSaleById = async (saleId) => {
  const res = await api.get(`/sales/${saleId}`);
  return res.data.data;
};


// Get recent sales
export const getRecentSales = async (limit = 10) => {
  const response = await api.get(`/sales?_limit=${limit}`);
  return response.data;
};

export default {
  createSale,
  getSales,
  checkout,
  getSaleById,
  getRecentSales,
};

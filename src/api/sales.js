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
  const userId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId");
  if (!userId) throw new Error("User not logged in - please login again");
  const response = await api.post(`/sales`, {
    userId,
    paymentMethod,
    items,
    tableId,
    ...(referenceNo && { referenceNo }),
  });
  return response.data;
};

// Get sales with filters
export const getSales = (params) => {
  const token = localStorage.getItem("token");

  return axios.get(API_URL + "/sales", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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

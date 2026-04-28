import API from "./axios.js";

// Create a new order (from guest or POS)
export const createOrder = async (
  items,
  tableId,
  status = "PENDING",
  paymentMethod = null,
  referenceNo = null,
  amountTendered = null,
  customerType = "REGULAR",
) => {
  try {
    // Get userId if available (for logged in users), otherwise use guest mode
    const userId =
      localStorage.getItem("userId") ||
      sessionStorage.getItem("userId") ||
      null;

    const requestData = {
      ...(userId && { userId }), // Only include userId if available
      items,
      tableId,
      status,
      customerType,
      ...(paymentMethod && { paymentMethod }),
      ...(referenceNo && { referenceNo }),
      ...(amountTendered && { amountTendered }),
    };

    const response = await API.post("/orders", requestData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get receipt for order
export const getReceipt = async (orderId) => {
  try {
    const response = await API.post(`/orders/${orderId}/receipt`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all orders (for staff)
export const getOrders = async (params) => {
  try {
    const response = await API.get("/orders", { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get orders for current user
export const getUserOrders = async () => {
  try {
    const userId =
      localStorage.getItem("userId") ||
      sessionStorage.getItem("userId") ||
      null;
    const response = await API.get("/orders", {
      params: userId ? { userId } : {},
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get orders by table number (for guest users)
export const getOrdersByTable = async (tableNumber) => {
  try {
    const response = await API.get(`/orders/by-table/${tableNumber}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update order status (accept/preparing/complete/cancel)
export const updateOrderStatus = async (
  orderId,
  status,
  paymentMethod = null,
  referenceNo = null,
) => {
  try {
    const response = await API.patch(`/orders/${orderId}/status`, {
      status,
      ...(paymentMethod && { paymentMethod }),
      ...(referenceNo && { referenceNo }),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  createOrder,
  getReceipt,
  getOrders,
  getUserOrders,
  getOrdersByTable,
  updateOrderStatus,
};


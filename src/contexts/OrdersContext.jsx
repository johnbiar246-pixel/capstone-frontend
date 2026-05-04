import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getUserOrders,
  updateOrderStatus as updateOrderStatusApi,
  completeOrderItem as completeOrderItemApi,
} from "../api/orders.js";

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserOrders();
      if (response.data?.success) {
        const formattedOrders = response.data.data.map((order) => ({
          id: order.id.toString(),
          orderNumber: order.orderNumber,
          status: order.status?.toLowerCase(),
          customerType: order.customerType || "REGULAR",
          totalAmount: Number(order.totalAmount ?? 0),
          serviceCharge: Number(order.serviceCharge ?? 0),
          amountTendered: Number(order.amountTendered ?? 0),
          paymentMethod: order.paymentMethod,
          table: order.table || null,
          tableNumber: order.table?.number || "N/A",
          time: new Date(order.createdAt).toLocaleTimeString(),
          orderItems: order.orderItems.map((i) => ({
            id: i.id, // Use orderItem.id, not productId
            productId: i.productId,
            name: i.product?.name,
            price: i.price,
            quantity: i.quantity,
            servedQuantity: i.servedQuantity || 0,
            categoryId: i.product?.categoryId,
            product: i.product,
          })),
        }));
        setOrders(formattedOrders);
        return formattedOrders;
      }
    } catch (err) {
      setError(err.message || "Failed to load orders");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (
    orderId,
    status,
    paymentMethod = null,
    referenceNo = null,
    amountTendered = null,
    customerType = null
  ) => {
    try {
      const result = await updateOrderStatusApi(orderId, status, paymentMethod, referenceNo, amountTendered, customerType);
      // Refresh orders after status update
      await fetchOrders();
      return result;
    } catch (err) {
      setError(err.message || "Failed to update order status");
      throw err;
    }
  }, [fetchOrders]);

  const completeOrderItem = useCallback(async (orderId, itemId) => {
    try {
      const result = await completeOrderItemApi(orderId, itemId);
      // Refresh orders after item completion
      await fetchOrders();
      return result;
    } catch (err) {
      setError(err.message || "Failed to complete order item");
      throw err;
    }
  }, [fetchOrders]);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        isLoading,
        error,
        fetchOrders,
        updateOrderStatus,
        completeOrderItem,
        setOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};
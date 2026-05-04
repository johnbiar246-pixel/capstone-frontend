import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdCheck,
  MdClose,
  MdAccessTime,
  MdTableBar,
  MdRestaurantMenu,
  MdExpandMore,
  MdExpandLess,
  MdAttachMoney,
  MdPlayArrow,
  MdDone,
  MdCancel,
  MdReceipt,
} from "react-icons/md";
import { FaGlassCheers, FaUtensils } from "react-icons/fa";

import { useOrders } from "../../contexts/OrdersContext.jsx";

import UnifiedPaymentModal from "../modal/UnifiedPaymentModal";
import TenderModal from "../modal/TenderModal";
import ReceiptModal from "../modal/ReceiptModal";
import CancelConfirmModal from "../modal/CancelConfirmModal";
import ProductChecklist from "./ProductChecklist";

import io from "socket.io-client";

/* -------------------- Notification -------------------- */
const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0 }}
      className="fixed top-6 left-1/2 z-[60] px-6 py-4 rounded-xl bg-green-600 text-white shadow-lg flex items-center gap-3"
    >
      <p>{notification.message}</p>
      <button onClick={onClose}>
        <MdClose />
      </button>
    </motion.div>
  );
};

/* -------------------- Order Completion Confirmation Modal -------------------- */
const OrderCompletionConfirmModal = ({ isOpen, onClose, order, onConfirm }) => {
  if (!isOpen || !order) return null;

  const completedItems = order.orderItems?.filter(item => item.servedQuantity >= item.quantity) || [];
  const pendingItems = order.orderItems?.filter(item => item.servedQuantity < item.quantity) || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <h3 className="text-lg font-bold">Complete Order #{order.orderNumber}?</h3>
            <p className="text-blue-100 text-sm">Not all items have been marked as served</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-700 mb-3">Order Summary:</p>
              <div className="bg-gray-50 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Table:</span>
                  <span className="font-medium">{order.tableNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-bold text-lg">₱{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Items Status */}
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  <MdCheck className="w-4 h-4" />
                  Completed Items ({completedItems.length})
                </h4>
                {completedItems.length > 0 ? (
                  <div className="space-y-1 ml-6">
                    {completedItems.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{item.name} ×{item.quantity}</span>
                        <MdCheck className="w-4 h-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 ml-6">No items completed</p>
                )}
              </div>

              {pendingItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                    <MdAccessTime className="w-4 h-4" />
                    Pending Items ({pendingItems.length})
                  </h4>
                  <div className="space-y-1 ml-6">
                    {pendingItems.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{item.name} ×{item.quantity}</span>
                        <span className="text-orange-600">
                          {item.servedQuantity || 0}/{item.quantity} served
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Completing this order will mark it as ready for pickup/delivery,
                even though some items haven't been served yet.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Complete Order Anyway
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Orders = () => {
  const { orders, isLoading: ordersLoading, fetchOrders, updateOrderStatus, completeOrderItem } = useOrders();

  const [notification, setNotification] = useState(null);

  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);

  const [showTenderModal, setShowTenderModal] = useState(false);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptOrderId, setSelectedReceiptOrderId] = useState(null);

  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState(null);

  const [showOrderCompleteModal, setShowOrderCompleteModal] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /* -------------------- SOCKET + FETCH -------------------- */
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3001");

    socket.on("ordersUpdate", fetchOrders);

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [fetchOrders]);

  /* -------------------- ACTIONS -------------------- */
  const handleAcceptClick = (order) => {
    setSelectedOrderForPayment(order);
    setShowUnifiedModal(true);
  };

  const handleUnifiedConfirm = async (total, payment) => {
    if (!selectedOrderForPayment) return;

    try {
      await updateOrderStatus(
        selectedOrderForPayment.id,
        "PREPARING",
        payment.paymentMethod,
        payment.referenceNo,
        payment.amountTendered,
        payment.customerType
      );

      showNotification("Order accepted");
      setShowUnifiedModal(false);
      // Show receipt for the accepted order
      setSelectedReceiptOrderId(selectedOrderForPayment.id);
      setShowReceiptModal(true);
      setSelectedOrderForPayment(null);
      fetchOrders();
    } catch {
      showNotification("Failed to accept order", "error");
    }
  };

  const handleCompleteOrder = (order) => {
    // Check if all items are completed
    const allItemsCompleted = order.orderItems?.every(item => item.servedQuantity >= item.quantity);

    if (!allItemsCompleted) {
      // Show confirmation modal if not all items are completed
      setOrderToComplete(order);
      setShowOrderCompleteModal(true);
    } else {
      // Directly complete the order if all items are done
      completeOrder(order.id);
    }
  };

  const completeOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "COMPLETED");
      showNotification("Order completed successfully");
      fetchOrders();
    } catch (error) {
      console.error("Failed to complete order:", error);
      showNotification("Failed to complete order", "error");
    }
  };

  const handleOrderCompleteConfirm = async () => {
    if (orderToComplete) {
      await completeOrder(orderToComplete.id);
      setShowOrderCompleteModal(false);
      setOrderToComplete(null);
    }
  };

  const handleCompleteItem = async (orderId, itemId) => {
    try {
      await completeOrderItem(orderId, itemId);
      showNotification("Item marked as served");
    } catch (error) {
      console.error("Failed to complete item:", error);
      showNotification("Failed to mark item as served", "error");
    }
  };

  const handleCancel = async () => {
    if (!pendingCancelOrderId) return;

    try {
      await updateOrderStatus(pendingCancelOrderId, "CANCELLED");
      setShowCancelConfirmModal(false);
      setPendingCancelOrderId(null);
      fetchOrders();
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  /* -------------------- FILTERS -------------------- */
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");

  /* -------------------- STATUS COLORS -------------------- */
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "preparing": return "bg-blue-100 border-blue-300 text-blue-800";
      case "completed": return "bg-green-100 border-green-300 text-green-800";
      case "cancelled": return "bg-red-100 border-red-300 text-red-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return <MdAccessTime className="w-4 h-4" />;
      case "preparing": return <FaUtensils className="w-4 h-4" />;
      case "completed": return <MdDone className="w-4 h-4" />;
      case "cancelled": return <MdCancel className="w-4 h-4" />;
      default: return <MdAccessTime className="w-4 h-4" />;
    }
  };

  /* -------------------- ORDER CARD -------------------- */
  const OrderCard = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [checklistExpanded, setChecklistExpanded] = useState(false);

    const hasUnservedItems = order.orderItems?.some(item => item.servedQuantity < item.quantity);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-200 ${getStatusColor(order.status)}`}
      >
        {/* Order Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-800">
              Order #{order.orderNumber}
            </h3>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="capitalize">{order.status}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{order.time}</p>
          </div>
        </div>

        {/* Order Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-700">
              <MdTableBar className="w-4 h-4" />
              <span className="font-medium">Table {order.tableNumber}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <MdRestaurantMenu className="w-4 h-4" />
              <span>{order.orderItems?.length || 0} items</span>
            </div>
          </div>
        </div>

        {/* Product Checklist - Only show for preparing orders with unserved items */}
        {order.status === "preparing" && hasUnservedItems && (
          <ProductChecklist
            orderItems={order.orderItems}
            orderId={order.id}
            onItemComplete={handleCompleteItem}
            onRefetch={fetchOrders}
            isExpanded={checklistExpanded}
            toggleExpanded={() => setChecklistExpanded(!checklistExpanded)}
            allItemsCompleted={!hasUnservedItems}
          />
        )}

        {/* Order Items Preview */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Items:</span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
              {isExpanded ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-2"
            >
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white bg-opacity-50 rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-600">×{item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.servedQuantity === item.quantity && (
                      <MdCheck className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {order.status === "pending" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAcceptClick(order)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MdPlayArrow className="w-4 h-4" />
              Accept Order
            </motion.button>
          )}

          {order.status === "preparing" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCompleteOrder(order)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MdDone className="w-4 h-4" />
              Complete Order
            </motion.button>
          )}

          {order.status === "completed" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedReceiptOrderId(order.id);
                setShowReceiptModal(true);
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MdReceipt className="w-4 h-4" />
              View Receipt
            </motion.button>
          )}

          {(order.status === "pending" || order.status === "preparing") && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setPendingCancelOrderId(order.id);
                setShowCancelConfirmModal(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <MdCancel className="w-4 h-4" />
              Cancel
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kitchen Orders</h1>
        <p className="text-gray-600">Manage incoming orders and track preparation status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <MdAccessTime className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">{pendingOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FaUtensils className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Preparing</p>
              <p className="text-2xl font-bold text-blue-800">{preparingOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {ordersLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading orders...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MdAccessTime className="w-5 h-5 text-yellow-600" />
              Pending Orders ({pendingOrders.length})
            </h2>
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MdAccessTime className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pending orders</p>
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>

          {/* Preparing Orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaUtensils className="w-5 h-5 text-blue-600" />
              Preparing ({preparingOrders.length})
            </h2>
            <div className="space-y-4">
              {preparingOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaUtensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No orders in preparation</p>
                </div>
              ) : (
                preparingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <Notification
            notification={notification}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* MODALS */}
      <UnifiedPaymentModal
        isOpen={showUnifiedModal}
        onClose={() => setShowUnifiedModal(false)}
        onConfirm={handleUnifiedConfirm}
        orderItems={selectedOrderForPayment?.orderItems || []}
        orderId={selectedOrderForPayment?.id || null}
        customerType={selectedOrderForPayment?.customerType || "REGULAR"}
        tableNumber={selectedOrderForPayment?.table?.number || null}
        mode="staff-accept"
        autoFill={true}
      />

      <TenderModal
        isOpen={showTenderModal}
        onClose={() => setShowTenderModal(false)}
        onConfirm={() => {}}
      />

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        orderId={selectedReceiptOrderId}
      />

      <CancelConfirmModal
        isOpen={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        onConfirm={handleCancel}
      />

      <OrderCompletionConfirmModal
        isOpen={showOrderCompleteModal}
        onClose={() => {
          setShowOrderCompleteModal(false);
          setOrderToComplete(null);
        }}
        order={orderToComplete}
        onConfirm={handleOrderCompleteConfirm}
      />
    </div>
  );
};

export default Orders;
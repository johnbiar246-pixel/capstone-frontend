import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdShoppingCart,
  MdCheck,
  MdClose,
  MdAccessTime,
  MdTableBar,
  MdArrowBack,
  MdRestaurantMenu,
  MdExpandMore,
  MdExpandLess,
  MdAttachMoney,
} from "react-icons/md";
import { FaGlassCheers } from "react-icons/fa";
import { getTableByNumber } from "../../api/tables";
import { getUserOrders, updateOrderStatus } from "../../api/orders";

import UnifiedPaymentModal from "../modal/UnifiedPaymentModal";
import TenderModal from "../modal/TenderModal";
import ReceiptModal from "../modal/ReceiptModal";
import CancelConfirmModal from "../modal/CancelConfirmModal";

// Notification component
const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -50, x: "-50%" }}
      className={`fixed top-6 left-1/2 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
        notification.type === "success"
          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
          : notification.type === "error"
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      }`}
    >
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
        {notification.type === "success" ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : notification.type === "error" ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <p className="font-medium">{notification.message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <MdClose className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");

  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

const [showUnifiedModal, setShowUnifiedModal] = useState(false);
const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
const [unifiedLoading, setUnifiedLoading] = useState(false);

  // Tender Modal states
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
const [selectedReceiptOrderId, setSelectedReceiptOrderId] = useState(null);

  // Cancel confirmation modal state
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState(null);
  const [pendingCancelOrder, setPendingCancelOrder] = useState(null);

  // Loading states
  const [orderLoading, setOrderLoading] = useState({});

  // Notification state
  const [notification, setNotification] = useState(null);

  // Dropdown states for order categories
  const [expandedSections, setExpandedSections] = useState({
    upcoming: true, // pending orders
    preparing: true, // preparing orders
    completed: false, // completed orders
  });

  // Show notification helper
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch table data when tableNumber is present in URL
  useEffect(() => {
    if (tableNumber) {
      fetchTableData(tableNumber);
    }
  }, [tableNumber]);

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await getUserOrders();
      if (response.data && response.data.success) {
        // Transform API data to match component format
        const transformedOrders = response.data.data.map((order) => {
          // Safe number parsing with nullish coalescing for all breakdown fields
          const safeNum = (val) => Number(val ?? 0);
          
          return {
          id: order.id.toString(),
          orderNumber: order.orderNumber,
          details: order.orderItems
            .map((item) => `${item.quantity}x ${item.product?.name || "Item"}`)
            .join(", "),
          totalAmount: safeNum(order.totalAmount),
          foodSubtotal: safeNum(order.foodSubtotal),
          nonFoodSubtotal: safeNum(order.nonFoodSubtotal),
          discount: safeNum(order.discount),
          serviceCharge: safeNum(order.serviceCharge),
          amountTendered: safeNum(order.amountTendered),
          customerType: order.customerType || 'REGULAR',
          // Transform orderItems to match CartContext cart format for modal
          orderItems: order.orderItems.map(item => ({
            id: item.productId,
            name: item.product?.name || 'Item',
            price: item.price,
            quantity: item.quantity,
            category: item.product?.category || { name: '' }
          })),
          total: order.orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
          status: order.status?.toLowerCase() || "pending",
          time: new Date(order.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          tableId: order.tableId,
          tableNumber: order.table?.number || "N/A",
          paymentMethod: order.paymentMethod,
          referenceNo: order.referenceNo,
        }
        });
        setOrders(transformedOrders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchTableData = async (number) => {
    setLoading(true);
    setError("");
    try {
      const response = await getTableByNumber(number);
      if (response.success && response.data) {
        setTableData(response.data);
      } else {
        setError(`Table ${number} not found.`);
      }
    } catch (err) {
      console.error("Error fetching table data:", err);
      setError("Failed to load table information.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMenu = () => {
    navigate(`/menu?table=${tableNumber}`);
  };

  const handleClearTable = () => {
    setTableData(null);
    navigate("/user/orders");
  };

const handleAcceptClick = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (order.status === "pending") {
      setSelectedOrderForPayment({
        ...order,
        totalAmount: order.total
      });
      setShowUnifiedModal(true);
    } else if (order.status === "preparing") {
      handleCompleteOrder(orderId);
    }
  };

const handleUnifiedConfirm = async (total, paymentDetails) => {
    if (!selectedOrderForPayment) return;

    setUnifiedLoading(true);

    console.log("Unified confirm called with:", paymentDetails);
    
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Please log in to accept orders.", "error");
      navigate("/login");
      setUnifiedLoading(false);
      return;
    }

    try {
      const response = await updateOrderStatus(
        selectedOrderForPayment.id,
        "PREPARING",
        paymentDetails.paymentMethod,
        paymentDetails.referenceNo,
        paymentDetails.amountTendered
      );
      console.log("Update status response:", response);
      
      if (response.success) {
        setOrders(
          orders.map((order) =>
            order.id === selectedOrderForPayment.id
              ? { ...order, status: "preparing", paymentMethod: paymentDetails.paymentMethod, referenceNo: paymentDetails.referenceNo, amountTendered: paymentDetails.amountTendered }
              : order,
          ),
        );
        setShowUnifiedModal(false);
        setSelectedOrderForPayment(null);
        setShowReceiptModal(true);
        setSelectedReceiptOrderId(selectedOrderForPayment.id);
        showNotification("Order accepted! Receipt ready.", "success");
      } else {
        showNotification(response.message || "Failed to accept order", "error");
      }
    } catch (err) {
      console.error("Error accepting order:", err);
      let errorMessage = err.response?.data?.message || err.message || "Failed to accept order. Please try again.";
      if (err.response?.status === 401) {
        setTimeout(() => navigate("/login"), 2000);
      }
      showNotification(errorMessage, "error");
    } finally {
      setUnifiedLoading(false);
    }
  };

  const handleTenderConfirm = async (paymentMethod, referenceNo, amountTendered) => {
    if (!selectedOrder) return;

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Please log in to accept orders.", "error");
      navigate("/login");
      return;
    }

    try {
      const response = await updateOrderStatus(
        selectedOrder.id,
        "PREPARING",
        paymentMethod,
        referenceNo,
        amountTendered
      );
      if (response.success) {
        setOrders(
          orders.map((order) =>
            order.id === selectedOrder.id
              ? { ...order, status: "preparing", paymentMethod, referenceNo, amountTendered }
              : order,
          ),
        );
        setShowTenderModal(false);
        setSelectedOrder(null);
        setShowReceiptModal(true);
        setSelectedReceiptOrderId(selectedOrder.id);
        showNotification("Order accepted! Receipt ready.", "success");
      } else {
        showNotification(response.message || "Failed to accept order", "error");
      }
    } catch (err) {
      console.error("Error accepting order:", err);

      // Use error message from axios interceptor if available
      let errorMessage =
        err.message || "Failed to accept order. Please try again.";

      // Handle specific auth errors
      if (err.response?.status === 401) {
        setTimeout(() => navigate("/login"), 2000);
      }

      showNotification(errorMessage, "error");
    }
  };

  const handleCompleteOrder = async (orderId) => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Please log in to complete orders.", "error");
      navigate("/login");
      return;
    }

    try {
      const order = orders.find((o) => o.id === orderId);
      // Use stored payment method when completing
      const response = await updateOrderStatus(
        orderId,
        "COMPLETED",
        order.paymentMethod,
        order.referenceNo,
      );
      if (response.success) {
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: "completed" } : order,
          ),
        );
        showNotification("Order marked as completed successfully!", "success");
      } else {
        showNotification(
          response.message || "Failed to complete order",
          "error",
        );
      }
    } catch (err) {
      console.error("Error completing order:", err);

      // Use error message from axios interceptor if available
      let errorMessage =
        err.message || "Failed to complete order. Please try again.";

      // Handle specific auth errors
      if (err.response?.status === 401) {
        setTimeout(() => navigate("/login"), 2000);
      }

      showNotification(errorMessage, "error");
    }
  };

const handleCancelClick = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setPendingCancelOrderId(orderId);
    setPendingCancelOrder(order);
    setShowCancelConfirmModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!pendingCancelOrderId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Please log in to cancel orders.", "error");
      navigate("/login");
      return;
    }

    setOrderLoading((prev) => ({ ...prev, [pendingCancelOrderId]: true }));
    setShowCancelConfirmModal(false);

    try {
      const response = await updateOrderStatus(pendingCancelOrderId, "CANCELLED");
      if (response.success) {
        setOrders(orders.filter((order) => order.id !== pendingCancelOrderId));
        showNotification("Order cancelled successfully!", "success");
      } else {
        showNotification(response.message || "Failed to cancel order", "error");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      let errorMessage = err.message || "Failed to cancel order. Please try again.";
      if (err.response?.status === 401) {
        setTimeout(() => navigate("/login"), 2000);
      }
      showNotification(errorMessage, "error");
    } finally {
      setOrderLoading((prev) => ({ ...prev, [pendingCancelOrderId]: false }));
      setPendingCancelOrderId(null);
      setPendingCancelOrder(null);
    }
  };

  const handleCancelClose = () => {
    setShowCancelConfirmModal(false);
    setPendingCancelOrderId(null);
    setPendingCancelOrder(null);
  };

  // Remove old handleCancel function if present (commented out in current file)


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <MdAccessTime className="w-4 h-4" />;
      case "preparing":
        return <MdAccessTime className="w-4 h-4" />;
      case "completed":
        return <MdCheck className="w-4 h-4" />;
      case "cancelled":
        return <MdClose className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Toggle dropdown sections
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter orders by status
  const upcomingOrders = orders.filter((order) => order.status === "pending");
  const preparingOrders = orders.filter(
    (order) => order.status === "preparing",
  );
  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  );

  // Render order card component
  const renderOrderCard = (order) => (
    <motion.div
      key={order.id}
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      className="border border-gray-200 p-3 sm:p-4 rounded-xl hover:shadow-md transition-all bg-gradient-to-r from-gray-50 to-white"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs sm:text-sm">
            #{order.orderNumber || order.id.slice(-4)}
          </span>
          <div>
            <p className="font-semibold text-gray-900 text-sm sm:text-base">
              Order #{order.orderNumber || order.id.slice(-4)}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">{order.time}</p>
            {/* Table Number Badge for easy navigation */}
            <div className="flex items-center gap-1 mt-1">
              <MdTableBar className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-green-900 bg-green-100 hover:bg-green-200 px-2 sm:px-3 py-1 rounded-full transition-colors cursor-default">
                Table #{order.tableNumber}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}
        >
          {getStatusIcon(order.status)}
          <span className="hidden sm:inline">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </span>
      </div>

      <p className="text-gray-700 mb-2 text-sm">{order.details}</p>

      {/* Payment Method Badge */}
      {order.paymentMethod && (
        <div className="mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              order.paymentMethod === "CASH"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {order.paymentMethod}
          </span>
        </div>
      )}

{order.status !== 'preparing' && (
  <>
    {/* Bill Total */}
    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Service Charge:</span>
        <span className="text-sm font-semibold text-emerald-700">+₱{Number(order.serviceCharge ?? 0).toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-emerald-200">
        <span className="text-lg font-bold text-gray-900">Total Bill</span>
        <span className="text-xl font-black text-emerald-600">₱{Number(order.totalAmount ?? 0).toFixed(2)}</span>
      </div>
      {/* Amount Tendered Display - Read-only for PREPARING/COMPLETED */}
      {(order.status === 'preparing' || order.status === 'completed') && order.amountTendered > 0 && (
        <div className="flex flex-col gap-1 pt-2 mt-2 border-t border-emerald-200 bg-emerald-25 rounded-lg p-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-emerald-800 flex items-center gap-1">
              <MdAttachMoney className="text-emerald-600" />
              Amount Tendered
            </span>
            <span className="font-bold text-emerald-700">₱{Number(order.amountTendered ?? 0).toFixed(2)}</span>
          </div>
          {order.amountTendered > order.totalAmount && (
            <div className="flex justify-between items-center text-xs bg-emerald-100 px-2 py-1 rounded">
              <span className="text-emerald-800 font-medium">Change Due</span>
              <span className="font-bold text-emerald-700">
                ₱{Number((order.amountTendered ?? 0) - (order.totalAmount ?? 0)).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  </>
)}

      {/* Action Buttons - Smaller on mobile */}
      {(order.status === "pending" || order.status === "preparing") && (
        <div className="flex gap-2 mt-2">
          {order.status === "pending" ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAcceptClick(order.id)}
                className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-1"
              >
                <MdCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Accept</span>
                <span className="sm:hidden">Accept</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCancelClick(order.id)}
                disabled={orderLoading[order.id]}
                className={`flex-1 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  orderLoading[order.id]
                    ? 'bg-red-400 cursor-not-allowed text-white/70'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                }`}
              >
                {orderLoading[order.id] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Cancelling...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <MdClose className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                    <span className="sm:hidden">Cancel</span>
                  </>
                )}
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAcceptClick(order.id)}
              className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-1"
            >
              <MdCheck className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Mark as Completed</span>
              <span className="sm:hidden">Complete</span>
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );

  // Render dropdown section
  const renderDropdownSection = (title, ordersList, sectionKey, iconColor) => {
    const isExpanded = expandedSections[sectionKey];
    const count = ordersList.length;

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-all"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`p-2 ${iconColor} rounded-lg`}>
              <FaGlassCheers className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                {title}
              </h3>
              <p className="text-xs text-gray-500">
                {count} {count === 1 ? "order" : "orders"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                {count}
              </span>
            )}
            {isExpanded ? (
              <MdExpandLess className="w-5 h-5 text-gray-500" />
            ) : (
              <MdExpandMore className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 sm:p-4 space-y-3 bg-white">
                {ordersList.length === 0 ? (
                  <p className="text-gray-400 text-center py-4 text-sm">
                    No {title.toLowerCase()} available
                  </p>
                ) : (
                  ordersList.map((order) => renderOrderCard(order))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Notification */}
      <AnimatePresence>
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      </AnimatePresence>

      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-4xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
      >
        Orders
      </motion.h1>

      {/* Table Information Card */}
      {tableNumber && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#254F22] to-[#3C3D37] p-6 rounded-2xl shadow-lg mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <MdTableBar className="text-3xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Table {tableNumber}</h2>
                {loading ? (
                  <p className="text-white/70 text-sm">Loading table info...</p>
                ) : error ? (
                  <p className="text-red-300 text-sm">{error}</p>
                ) : tableData ? (
                  <p className="text-white/70 text-sm">
                    {tableData.orders?.length || 0} active orders
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToMenu}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                <MdRestaurantMenu className="text-lg" />
                <span className="hidden sm:inline">View Menu</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearTable}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <MdClose className="text-lg" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <span className="p-2 sm:p-3 bg-blue-100 rounded-xl">
            <FaGlassCheers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Current Orders
          </h2>
        </div>

        {ordersLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              className="h-8 w-8 border-4 border-[#254F22] border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-500">Loading orders...</p>
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-center py-8"
          >
            No orders available.
          </motion.p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Upcoming Orders Dropdown (Pending) */}
            {renderDropdownSection(
              "Upcoming Orders",
              upcomingOrders,
              "upcoming",
              "bg-yellow-100 text-yellow-600",
            )}

            {/* Preparing Orders Dropdown */}
            {renderDropdownSection(
              "Preparing Orders",
              preparingOrders,
              "preparing",
              "bg-orange-100 text-orange-600",
            )}

            {/* Completed Orders Dropdown */}
            {renderDropdownSection(
              "Completed Orders",
              completedOrders,
              "completed",
              "bg-blue-100 text-blue-600",
            )}
          </div>
        )}
      </motion.div>

      {/* Tender Modal for CASH payments */}
      <TenderModal
        isOpen={showTenderModal}
        onClose={() => {
          setShowTenderModal(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleTenderConfirm}
        totalAmount={selectedOrder?.total || 0}
        orderId={selectedOrder?.orderNumber || selectedOrder?.id}
      />

      <ReceiptModal 
        isOpen={showReceiptModal} 
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedReceiptOrderId(null);
        }} 
        orderId={selectedReceiptOrderId} 
      />

      {/* Cancel Confirmation Modal */}
      <CancelConfirmModal
        isOpen={showCancelConfirmModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        orderNumber={pendingCancelOrder?.orderNumber || pendingCancelOrderId?.slice(-4)}
        orderDetails={pendingCancelOrder?.details || 'Order details not available'}
      />

      {/* Unified Payment Modal for Accept */}
      <UnifiedPaymentModal
        isOpen={showUnifiedModal}
        onClose={() => {
          setShowUnifiedModal(false);
          setSelectedOrderForPayment(null);
        }}
        onConfirm={handleUnifiedConfirm}
        orderItems={selectedOrderForPayment?.orderItems || []}
        customerType={selectedOrderForPayment?.customerType || 'REGULAR'}
        totalAmount={selectedOrderForPayment?.totalAmount || selectedOrderForPayment?.total || 0}
        orderId={selectedOrderForPayment?.orderNumber || selectedOrderForPayment?.id?.slice(-4)}
        tableNumber={selectedOrderForPayment?.tableNumber}
        mode="staff-accept"
      />

    </motion.div>
  );
};

export default Orders;

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
} from "react-icons/md";
import { FaGlassCheers } from "react-icons/fa";
import { getTableByNumber } from "../../api/tables";

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");

  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState([
    {
      id: "1",
      details: "2x Burger, 1x Fries",
      total: 350,
      status: "pending",
      time: "10:30 AM",
    },
    {
      id: "2",
      details: "1x Pizza, 2x Coke",
      total: 420,
      status: "ready",
      time: "10:25 AM",
    },
    {
      id: "3",
      details: "3x Salad, 1x Water",
      total: 280,
      status: "completed",
      time: "10:15 AM",
    },
  ]);

  // Fetch table data when tableNumber is present in URL
  useEffect(() => {
    if (tableNumber) {
      fetchTableData(tableNumber);
    }
  }, [tableNumber]);

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

  const handleAccept = (orderId) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: "ready" } : order,
      ),
    );
  };

  const handleCancel = (orderId) => {
    setOrders(orders.filter((order) => order.id !== orderId));
  };

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
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <MdAccessTime className="w-4 h-4" />;
      case "ready":
        return <MdCheck className="w-4 h-4" />;
      case "completed":
        return <MdCheck className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="p-3 bg-blue-100 rounded-xl">
            <FaGlassCheers className="w-6 h-6 text-blue-600" />
          </span>
          <h2 className="text-xl font-semibold text-gray-800">
            Current Orders
          </h2>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-center py-8"
            >
              No orders available.
            </motion.p>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="border border-gray-200 p-5 rounded-xl hover:shadow-md transition-all bg-gradient-to-r from-gray-50 to-white"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                      #{order.id}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">{order.time}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>

                <p className="text-gray-700 mb-2">{order.details}</p>
                <p className="text-lg font-bold text-green-600 mb-3">
                  Total: ₱{order.total.toFixed(2)}
                </p>

                {order.status === "pending" && (
                  <div className="flex gap-3 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAccept(order.id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                    >
                      <MdCheck className="w-5 h-5" />
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCancel(order.id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <MdClose className="w-5 h-5" />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Orders;

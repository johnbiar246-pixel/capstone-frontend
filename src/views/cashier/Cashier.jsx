import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdRestaurantMenu,
  MdLocalBar,
  MdSearch,
  MdShoppingCart,
  MdAdd,
  MdRemove,
  MdDelete,
  MdPayments,
  MdTableBar,
  MdAttachMoney,
  MdPhoneAndroid,
  MdClose,
} from "react-icons/md";

import { getProducts, getCategories } from "../../api/products.js";
import { getAllTables } from "../../api/tables.js";
import { getPendingOrders } from "../../api/orders.js";
import { createSale } from "../../api/sales.js";
import UnifiedPaymentModal from "../../components/modal/UnifiedPaymentModal";
import ReceiptModal from "../../components/modal/ReceiptModal";
import { useNavigate } from "react-router-dom";
import { MdAccessTime } from "react-icons/md";
import io from 'socket.io-client';


const categories = [
  {
    id: "all",
    name: "All",
    icon: MdRestaurantMenu,
    color: "from-gray-400 to-gray-600",
  },
  {
    id: "main-dishes",
    name: "Main Dishes",
    icon: MdRestaurantMenu,
    color: "from-orange-400 to-red-500",
  },
  {
    id: "appetizers",
    name: "Appetizers",
    icon: MdRestaurantMenu,
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "beers",
    name: "Beers",
    icon: MdLocalBar,
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "spirits",
    name: "Spirits",
    icon: MdLocalBar,
    color: "from-purple-400 to-indigo-600",
  },
  {
    id: "drinks",
    name: "Drinks",
    icon: MdLocalBar,
    color: "from-cyan-400 to-blue-500",
  },
];

const Cashier = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");

  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { cart, addToCart, updateQuantity, removeFromCart, getCartTotal, customerType, setCustomerType, clearCart, calculateCartBreakdown } = useCart();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);  
  const [selectedTableId, setSelectedTableId] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [notification, setNotification] = useState(null);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingOrdersLoading, setPendingOrdersLoading] = useState(false);

  // Load data + Socket.io
  useEffect(() => {
    loadData();
    
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001');
    
    socket.on('ordersUpdate', () => {
      console.log('Real-time orders update - refetching pending');
      fetchPendingOrders();
    });

    // Initial + poll fallback
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const fetchPendingOrders = async () => {
    setPendingOrdersLoading(true);
    try {
      const response = await getPendingOrders();
      if (response.data && response.data.success) {
        const transformedOrders = response.data.data.map(order => ({
          id: order.id.toString(),
          orderNumber: order.orderNumber,
          details: order.orderItems.map(item => `${item.quantity}x ${item.product?.name || "Item"}`).join(", "),
          totalAmount: Number(order.totalAmount ?? 0),
          status: order.status?.toLowerCase() || "preparing",
          time: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tableNumber: order.table?.number || "N/A",
        }));
        setPendingOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    } finally {
      setPendingOrdersLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes, tablesRes] = await Promise.all([
        getProducts(),
        getCategories(),
        getAllTables(),
      ]);
      setProducts(prodsRes.data || []);
      setCategoriesList(catsRes.data || []);
      setTables(tablesRes.data || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  useEffect(() => {
    let filtered = products;
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (p) =>
          p.category?.name?.toLowerCase().replace(/\s+/g, "-") ===
          activeCategory,
      );
    }
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    setFilteredProducts(filtered);
  }, [activeCategory, searchQuery, products]);

  // Cart functions now from useCart() - local overrides removed
  const { placeOrder } = useCart();
  const getTotal = getCartTotal;

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

const handleUnifiedConfirm = async (total, paymentDetails) => {
      try {
        const response = await placeOrder(
          selectedTableId,
          paymentDetails.paymentMethod,
          paymentDetails.referenceNo,
          paymentDetails.amountTendered,
          paymentDetails.customerType,  // Use customerType from modal selection, not context
          undefined,
          "cashier"  // Cashier mode for staff ordering
        );

        clearCart();
        setSelectedTableId("");
        setShowUnifiedModal(false);

        // Show receipt after successful payment
        const orderId = response?.data?.orderId || response?.data?.order?.id;
        if (orderId) {
          setSelectedOrderId(orderId);
          setShowReceiptModal(true);
        } else {
          showNotification(
            `Payment completed! Order #${response?.data?.orderNumber || "N/A"}`,
            "success"
          );
        }
      } catch (error) {
        showNotification("Order creation failed: " + (error.response?.data?.message || error.message), "error");
      }
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading POS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Upcoming Orders Section */}
      {pendingOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-8"
        >
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <MdAccessTime className="w-8 h-8" />
              Upcoming Orders ({pendingOrders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {pendingOrders.map((order) => (
                <motion.div
                  key={order.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg text-gray-900">
                        #{order.orderNumber || order.id.slice(-4)}
                      </p>
                      <p className="text-sm text-gray-600">{order.time}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">
                        Table #{order.tableNumber}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3 text-sm line-clamp-2">{order.details}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl text-gray-900">
                      ₱{order.totalAmount.toFixed(2)}
                    </span>
                    <motion.button
                      onClick={() => navigate(`/user/orders?table=${order.tableNumber}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all"
                    >
                      Accept
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            {pendingOrdersLoading && (
              <div className="text-center py-4 text-white/80">
                Loading upcoming orders...
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
        {/* Middle: Categories + Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 overflow-hidden flex flex-col">
          {/* Search + Category Buttons */}
          <div className="mb-6">
            <div className="relative mb-4">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap min-w-fit ${
                    activeCategory === cat.id
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 hover:shadow-md"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">
                    {cat.icon ? <cat.icon /> : null}
                  </span>
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => addToCart(product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-40 rounded-lg mb-3 object-cover"
                      />
                    ) : (
                      <div className="h-40 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <span className="text-4xl text-gray-600 font-bold">
                          {product.name[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="font-bold text-gray-800 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description || "No description"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-emerald-600">
                        ₱{product.price.toFixed(2)}
                      </span>
                      <MdAdd className="text-2xl text-emerald-500 group-hover:scale-110 transition" />
                    </div>
                    {(() => {
                      const productCategoryId = product.category?.name?.toLowerCase().replace(/\s+/g, "-");
                      return product.stock < 5 && !['main-dishes', 'appetizers'].includes(productCategoryId) && (
                        <div className="mt-2 p-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Low stock: {product.stock}
                        </div>
                      );
                    })()}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart + Payment */}
        <motion.div
          className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 overflow-y-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MdShoppingCart /> Cart {cart.length > 0 && `(${cart.length})`}
          </h2>
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MdShoppingCart className="text-6xl mx-auto mb-4 text-gray-300" />
              <p>Add products to start order</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item, index) => (
                  <div
                    key={`cart-item-${item.id || index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ₱{item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => updateQuantity(item.id, -1)}
                        whileHover={{ scale: 1.1 }}
                      >
                        <MdRemove className="text-xl text-gray-500 hover:text-red-500" />
                      </motion.button>
                      <span className="font-bold text-lg w-8 text-center">
                        {item.quantity}
                      </span>
                      <motion.button
                        onClick={() => updateQuantity(item.id, 1)}
                        whileHover={{ scale: 1.1 }}
                      >
                        <MdAdd className="text-xl text-emerald-500 hover:text-emerald-600" />
                      </motion.button>
                      <motion.button
                        onClick={() => removeFromCart(item.id)}
                        whileHover={{ scale: 1.1 }}
                      >
                        <MdDelete className="text-xl text-red-500 hover:text-red-600" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>₱{getTotal().toFixed(2)}</span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MdTableBar /> Select Table
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Choose a table...</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        Table {table.number}
                      </option>
                    ))}
                  </select>
                </div>
                <motion.button
                  onClick={() => {
                    if (!selectedTableId) {
                      showNotification("Please select a table first", "error");
                      return;
                    }
                    setShowUnifiedModal(true);
                  }}
                  disabled={!selectedTableId || cart.length === 0}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                    !selectedTableId || cart.length === 0
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MdPayments /> Pay Now
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : notification.type === "error" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="font-medium flex-1">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Payment Modal */}
<UnifiedPaymentModal
  isOpen={showUnifiedModal}
  onClose={() => setShowUnifiedModal(false)}
  onConfirm={handleUnifiedConfirm}
  cartItems={cart}
  customerType={customerType}
  tableNumber={
    tables?.find((t) => t.id === selectedTableId)?.number ?? null
  }
  mode="staff-new"
  autoFill={false}
/>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedOrderId("");
        }}
        orderId={selectedOrderId}
      />

    </div>
  );
};

export default Cashier;
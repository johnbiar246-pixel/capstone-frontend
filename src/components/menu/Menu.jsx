import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import CartSidebar from "../cart/CartSidebar";
import { useCart } from "../../contexts/CartContext";
import axios from "axios";
import {
  MdRestaurantMenu,
  MdFastfood,
  MdLocalDrink,
  MdLocalBar,
  MdSearch,
  MdTableBar,
  MdShoppingCart,
  MdQrCodeScanner,
  MdInfo,
  MdRefresh,
} from "react-icons/md";
import StatusBadge from "../orders/StatusBadge";
import { getOrdersByTable } from "../../api/orders";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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
    icon: MdFastfood,
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
    icon: MdLocalDrink,
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
    icon: MdLocalDrink,
    color: "from-cyan-400 to-blue-500",
  },
];

const Menu = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = searchParams.get("table");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const { addToCart, openCart } = useCart();

  // Check if table is scanned - if not, show message but still allow browsing
  const hasTableScanned = !!tableNumber;

  const handleScanTable = () => {
    navigate("/scan-table");
  };

  const fetchOrders = async () => {
    if (!tableNumber) return;
    
    setOrdersLoading(true);
    setOrdersError("");
    try {
    const response = await getOrdersByTable(tableNumber);
    
    // Calculate breakdown for each order (matches CartContext logic)
    const ordersWithBreakdown = response.data.map(order => {
      const subtotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const foodSubtotal = order.orderItems.reduce((sum, item) => {
        const catName = item.product?.category?.name?.toLowerCase().replace(/\s+/g, '-');
        return ['appetizers', 'main-dishes'].includes(catName) ? sum + item.price * item.quantity : sum;
      }, 0);
      const serviceCharge = foodSubtotal * 0.1;
      
      return {
        ...order,
        subtotal,
        serviceCharge,
        total: subtotal + serviceCharge
      };
    });
    
    setOrders(ordersWithBreakdown);
      if (response.success) {
        // Filter preparing, completed, and pending orders (waiting for cashier)
        let relevantOrders = response.data.filter(order => 
          order.status?.toLowerCase() === 'pending' ||
          order.status?.toLowerCase() === 'preparing' || 
          order.status?.toLowerCase() === 'completed'
        );
        
        // Sort: pending first, then preparing, then completed
        relevantOrders.sort((a, b) => {
          const statusOrder = { pending: 1, preparing: 2, completed: 3 };
          return (statusOrder[a.status?.toLowerCase()] || 4) - (statusOrder[b.status?.toLowerCase()] || 4);
        });
        
        setOrders(relevantOrders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrdersError("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`);
        if (response.data.success) {
          // Transform products to match component format
          const transformedProducts = response.data.data.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description || "",
            price: product.price,
            categoryId:
              product.category?.name?.toLowerCase().replace(/\s+/g, "-") ||
              "main-dishes",
            image: product.imageUrl || null,
          }));
          setProducts(transformedProducts);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch orders when tableNumber changes
  useEffect(() => {
    fetchOrders();
    
    // Refresh every 10 seconds if table scanned
    if (tableNumber) {
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [tableNumber]);

  // Filter products based on active category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "all" || product.categoryId === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.color : "from-gray-400 to-gray-600";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    openCart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f7f4] to-[#e9efe7]">
      <Navbar />

      {/* Header */}
      <motion.section
        className="bg-gradient-to-r from-[#3C3D37] to-[#254F22] text-white py-12 md:py-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Table Number Badge */}
          {tableNumber && (
            <motion.div
              className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <MdTableBar className="text-xl" />
              <span className="font-semibold">Table {tableNumber}</span>
            </motion.div>
          )}

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Our Menu
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl mb-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Browse our delicious selection of food and beverages
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="max-w-md mx-auto relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 rounded-full bg-white/95 text-[#254F22] placeholder-[#3C3D37]/70 border border-[#254F22]/20 focus:outline-none focus:ring-2 focus:ring-[#254F22]/40 focus:border-[#254F22]/50 shadow-lg"
            />
            <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#254F22] text-xl" />
          </motion.div>
        </div>
      </motion.section>

      {/* Table Scan Notification */}
      {!hasTableScanned && (
        <motion.div
          className="bg-amber-50 border-b border-amber-200 px-4 py-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
            <MdInfo className="text-amber-600 text-xl flex-shrink-0" />
            <p className="text-amber-800 text-sm md:text-base">
              Please scan a table QR code to place an order
            </p>
            <motion.button
              onClick={handleScanTable}
              className="flex items-center gap-1 bg-[#254F22] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#1f3f1c] transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdQrCodeScanner className="text-sm" />
              Scan Table
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Your Orders Section - only show if table scanned */}
     {hasTableScanned && (
  <motion.section 
    className="bg-gradient-to-r from-orange-50 to-blue-50 border-b border-gray-200 py-6 px-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MdTableBar className="text-orange-600" />
          Table {tableNumber} - Your Orders
        </h2>

        <motion.button
          onClick={fetchOrders}
          className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MdRefresh className="text-sm" />
          Refresh
        </motion.button>
      </div>

      {ordersLoading ? (
        <div className="text-center py-8">
          <div className="h-6 w-6 border-2 border-orange-400 border-t-transparent rounded-full mx-auto mb-2 animate-spin" />
          <p className="text-gray-500 text-sm">Loading orders...</p>
        </div>

      ) : ordersError ? (
        <div className="text-center py-8 text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-4">
          {ordersError}.{" "}
          <button
            onClick={fetchOrders}
            className="underline font-medium hover:no-underline"
          >
            Retry
          </button>
        </div>

      ) : orders.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <MdShoppingCart className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500">
            Your orders will appear here once placed
          </p>
        </motion.div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {orders.map((order) => {
            //  USE PRE-CALCULATED VALUES
            const orderSubtotal = order.subtotal || 0;
            const orderServiceCharge = order.serviceCharge || 0;
            const orderTotal = order.total || 0;

            return (
              <motion.div
                key={order.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                whileHover={{ y: -2 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Order #{order.orderNumber || order.id.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {order.orderItems
                    ?.map(
                      (item) => `${item.quantity}x ${item.product?.name}`
                    )
                    .join(", ") || "Items"}
                </p>

                <div className="flex justify-between items-center">
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>Subtotal:</span>
                      <span>₱{orderSubtotal.toFixed(2)}</span>
                    </div>

                    {orderServiceCharge > 0 && (
                      <div className="text-sm text-emerald-600 font-medium flex justify-between">
                        <span>Service (10%):</span>
                        <span>+₱{orderServiceCharge.toFixed(2)}</span>
                      </div>
                    )}

                    <span className="text-lg font-bold text-[#254F22] block">
                      TOTAL: ₱{orderTotal.toFixed(2)}
                    </span>
                  </div>

                  <StatusBadge
                    status={order.status}
                    className="!text-sm px-3 py-1"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  </motion.section>
)}

      {/* Category Tabs */}
      <section className="bg-white shadow-md sticky top-0 z-10 border-y border-[#254F22]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="md:hidden">
            <label
              htmlFor="category-select"
              className="block text-sm font-semibold text-[#3C3D37] mb-2"
            >
              Categories
            </label>
            <select
              id="category-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full rounded-lg border border-[#254F22]/30 bg-white px-4 py-2.5 text-[#254F22] font-medium focus:outline-none focus:ring-2 focus:ring-[#254F22]/30"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex md:flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap min-w-fit ${
                  activeCategory === category.id
                    ? "bg-[#254F22] text-white shadow-lg"
                    : "bg-[#f1f4ef] text-[#3C3D37] hover:bg-[#dce7d8] hover:text-[#254F22] hover:shadow-md"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">
                  {category.icon && <category.icon />}
                </span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {loading && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-12 w-12 border-4 border-[#254F22] border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-600">Loading menu...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MdRestaurantMenu className="text-6xl text-[#254F22]/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <motion.button
                onClick={() => window.location.reload()}
                className="bg-[#254F22] text-white px-6 py-2 rounded-lg hover:bg-[#3C3D37] transition shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {/* Category Title */}
          {!loading && !error && (
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {activeCategory === "all"
                  ? "All Items"
                  : getCategoryName(activeCategory)}
              </h2>
              <p className="text-gray-600 mt-2">
                {filteredProducts.length} item
                {filteredProducts.length !== 1 ? "s" : ""} available
              </p>
            </motion.div>
          )}

          {/* Products */}
          {!loading && !error && filteredProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden group cursor-pointer"
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.02,
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    onClick={() => hasTableScanned && handleAddToCart(product)}
                  >
                    {/* Image Placeholder */}
                    <div
                      className={`h-48 bg-gradient-to-br ${getCategoryColor(
                        product.categoryId,
                      )} flex items-center justify-center relative overflow-hidden`}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <motion.div
                          initial={{ rotate: 0 }}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <MdRestaurantMenu className="text-6xl text-white/80" />
                        </motion.div>
                      )}
                      {/* Category Badge */}
                      <motion.span
                        className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-gray-700"
                        whileHover={{ scale: 1.1 }}
                      >
                        {getCategoryName(product.categoryId)}
                      </motion.span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#254F22] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#254F22]">
                          ₱{product.price.toFixed(2)}
                        </span>
                        {hasTableScanned ? (
                          <motion.button
                            className="bg-[#254F22] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3C3D37] transition shadow-md flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <MdShoppingCart /> Add
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScanTable();
                            }}
                            className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-400 transition shadow-md flex items-center gap-1 cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Scan table to order"
                          >
                            <MdQrCodeScanner /> Scan to Order
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            !loading &&
            !error && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <MdRestaurantMenu className="text-6xl text-gray-300 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No items found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or category filter
                </p>
              </motion.div>
            )
          )}
        </div>
      </section>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
};

export default Menu;

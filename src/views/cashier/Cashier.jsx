import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "react-icons/md";

import { getProducts, getCategories } from "../../api/products.js";
import { createOrder } from "../../api/orders.js";
import { getAllTables } from "../../api/tables.js";

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [showPayment, setShowPayment] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  // Load data
  useEffect(() => {
    loadData();
  }, []);

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

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === productId) {
            const newQty = Math.max(0, item.quantity + delta);
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const getTotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePayment = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === "GCASH" && !referenceNo.trim()) {
      alert("Reference number is required for GCASH payment.");
      return;
    }
    try {
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      // Create order directly in PREPARING status (bypassing PENDING)
      await createOrder(
        items,
        selectedTableId,
        "PREPARING", // Direct to preparing status
        paymentMethod,
        paymentMethod === "GCASH" ? referenceNo.trim() : null,
      );

      alert(
        `Order created and sent to kitchen! Total: ₱${getTotal().toFixed(2)} (${paymentMethod}${paymentMethod === "GCASH" ? ` - Ref: ${referenceNo}` : ""}) for Table ${tables.find((t) => t.id === selectedTableId)?.number || "N/A"}`,
      );
      setCart([]);
      setSelectedTableId("");
      setReferenceNo("");
      setShowPayment(false);
      loadData(); // Refresh stock
    } catch (error) {
      alert("Order creation failed: " + error.message);
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
                    {product.stock < 5 && (
                      <div className="mt-2 p-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Low stock: {product.stock}
                      </div>
                    )}
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
                {cart.map((item) => (
                  <div
                    key={item.id}
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
                      alert("Please select a table first");
                      return;
                    }
                    setShowPayment(true);
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

      {/* Payment Modal */}
      {showPayment && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPayment(false)}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center">
              <MdPayments /> Complete Sale
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                Total:{" "}
                <span className="font-bold text-2xl text-emerald-600">
                  ₱{getTotal().toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    setPaymentMethod("CASH");
                  }}
                  className={`flex-1 p-3 rounded-xl font-bold transition-all ${paymentMethod === "CASH" ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-100 hover:bg-emerald-100"} flex items-center justify-center gap-2`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MdAttachMoney /> Cash
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPaymentMethod("GCASH");
                  }}
                  className={`flex-1 p-3 rounded-xl font-bold transition-all ${paymentMethod === "GCASH" ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 hover:bg-green-100"} flex items-center justify-center gap-2`}
                >
                  <MdPhoneAndroid /> GCash
                </motion.button>
              </div>
              {paymentMethod === "GCASH" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MdPayments className="text-green-500" /> Reference Number *
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="Enter GCash reference number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <motion.button
                onClick={() => setShowPayment(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handlePayment}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg transition flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <MdPayments /> Complete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Cashier;

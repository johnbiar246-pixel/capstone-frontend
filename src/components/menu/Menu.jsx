import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
} from "react-icons/md";

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
  const tableNumber = searchParams.get("table");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, openCart } = useCart();

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
                    onClick={() => handleAddToCart(product)}
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
                        <motion.button
                          className="bg-[#254F22] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3C3D37] transition shadow-md flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <MdShoppingCart /> Add
                        </motion.button>
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

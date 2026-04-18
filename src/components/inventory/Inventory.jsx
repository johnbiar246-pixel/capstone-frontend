import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdInventory, MdAdd, MdClose, MdEdit, MdDelete } from "react-icons/md";
import productsApi from "../../api/products.js";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageFile: null,
    imageUrl: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [showStock, setShowStock] = useState(true);

  const NO_STOCK_CATEGORIES = ['Main Dishes', 'Appetizers'];

  // Check admin role
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsAdmin(role === "ADMIN");
  }, []);

  // Update showStock based on category
  useEffect(() => {
    if (newProduct.categoryId) {
      const selectedCat = categories.find(cat => cat.id === newProduct.categoryId);
      setShowStock(!NO_STOCK_CATEGORIES.includes(selectedCat?.name || ''));
    } else {
      setShowStock(true);
    }
  }, [newProduct.categoryId, categories]);

  // Clear stock input when no-stock category selected
  useEffect(() => {
    if (!showStock) {
      setNewProduct(prev => ({ ...prev, stock: '' }));
    }
  }, [showStock]);

  useEffect(() => {
    if (editingProduct?.categoryId) {
      const selectedCat = categories.find(cat => cat.id === editingProduct.categoryId);
      setShowStock(!NO_STOCK_CATEGORIES.includes(selectedCat?.name || ''));
    }
  }, [editingProduct?.categoryId, categories]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      imageFile: null,
      imageUrl: "",
    });
    setImagePreview(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, sortField, sortDir]);

  useEffect(() => {
    const filtered = inventory.filter(
      (item) =>
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredInventory(filtered);
  }, [inventory, searchQuery]);

  const fetchInventory = async () => {
    try {
      const filters = {};
      if (selectedCategory) filters.categoryId = selectedCategory;
      if (sortField && sortDir) filters.sort = `${sortField}:${sortDir}`;

      const response = await productsApi.getProducts(filters);
      if (response.success) {
        setInventory(
          response.data.map((product) => ({
            ...product,
            minStock: Math.max(product.stock * 0.2, 5),
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsApi.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAddProduct = () => {
    if (!isAdmin) {
      alert("Admin access required");
      return;
    }
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    if (!isAdmin) {
      alert("Admin access required");
      return;
    }
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("Admin access required");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const response = await productsApi.deleteProduct(id);
      if (response.success) {
        fetchInventory();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct((prev) => ({ ...prev, imageFile: file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingProduct((prev) => ({ ...prev, imageFile: file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      let payload = {
        name: newProduct.name,
        description: newProduct.description || null,
        price: parseFloat(newProduct.price),
        stock: showStock ? parseInt(newProduct.stock || 0) : 0,
        categoryId: newProduct.categoryId,
      };

      if (newProduct.imageFile) {
        const uploadResult = await productsApi.uploadImage(
          newProduct.imageFile,
        );
        if (uploadResult.success) {
          payload.imageUrl = uploadResult.data.url;
        }
      }

      const response = await productsApi.createProduct(payload);
      if (response.success) {
        fetchInventory();
        handleCloseModal();
      }
    } catch (err) {
      console.error("Submit error:", err);
      const errorMsg = err.response?.data?.message || "Failed to add product.";
      alert(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitLoading(true);
    try {
      let payload = {
        name: editingProduct.name,
        description: editingProduct.description || null,
        price: parseFloat(editingProduct.price),
        stock: showStock ? parseInt(editingProduct.stock || 0) : 0,
        categoryId: editingProduct.categoryId,
      };

      if (editingProduct.imageFile) {
        const uploadResult = await productsApi.uploadImage(
          editingProduct.imageFile,
        );
        if (uploadResult.success) {
          payload.imageUrl = uploadResult.data.url;
        }
      }

      const response = await productsApi.updateProduct(
        editingProduct.id,
        payload,
      );
      if (response.success) {
        fetchInventory();
        handleCloseEditModal();
      }
    } catch (err) {
      console.error("Edit error:", err);
      const errorMsg = err.response?.data?.message || "Update failed.";
      alert(errorMsg);
    } finally {
      setEditSubmitLoading(false);
    }
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock * 0.5)
      return {
        color: "bg-red-100 text-red-600",
        label: "Critical",
        icon: true,
      };
    if (stock <= minStock)
      return {
        color: "bg-yellow-100 text-yellow-600",
        label: "Low",
        icon: true,
      };
    return { color: "bg-green-100 text-green-600", label: "Good", icon: false };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
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
        Inventory
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-purple-100 rounded-xl">
              <MdInventory className="w-6 h-6 text-purple-600" />
            </span>
            <h2 className="text-xl font-semibold text-gray-800">
              Stock Levels
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <label className="font-semibold text-gray-700 text-sm hidden sm:block">
                Filter:
              </label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 sm:max-w-md px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
              <div className="flex gap-2">
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={`${sortField}:${sortDir}`}
                  onChange={(e) => {
                    const [field, dir] = e.target.value.split(":");
                    setSortField(field);
                    setSortDir(dir);
                  }}
                  className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value="name:asc">Name A-Z</option>
                  <option value="name:desc">Name Z-A</option>
                  <option value="stock:asc">Stock Low-High</option>
                  <option value="stock:desc">Stock High-Low</option>
                  <option value="price:asc">Price Low-High</option>
                  <option value="price:desc">Price High-Low</option>
                </select>
              </div>
            </div>

            {isAdmin && (
              <motion.button
                onClick={handleAddProduct}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MdAdd className="w-5 h-5" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
            )}
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <motion.div
            className="col-span-full py-12 text-center text-gray-500 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MdInventory className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No products found
            </h3>
            <p className="text-gray-300">
              Try adjusting your search or filters, or add new products
            </p>
          </motion.div>
        ) : (
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredInventory.map((item) => {
              const status = getStockStatus(item.stock, item.minStock);
              return (
                <motion.li
                  key={item.id}
                  variants={itemVariants}
                  className="group"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl border border-gray-100 hover:border-emerald-200 transition-all duration-300 hover:bg-emerald-50/50 relative">
                    <div className="mb-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-56 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-md">
                          <MdImage className="w-20 h-20 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-emerald-700 truncate">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-emerald-600 group-hover:text-emerald-700">
                        ₱{item.price?.toFixed(2)}
                      </span>
                      {NO_STOCK_CATEGORIES.includes(item.category?.name) ? null : (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-xl font-bold text-gray-900">
                            {item.stock}
                          </span>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            in stock
                          </span>
                          {status.icon && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.color}`}
                            >
                              {status.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 absolute top-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <motion.button
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title="Edit"
                        >
                          <MdEdit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title="Delete"
                        >
                          <MdDelete className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </motion.div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Add New Product
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <MdClose className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (₱) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      value={newProduct.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                      required
                    >
                      <option value="">Choose category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {showStock && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="stock"
                        value={newProduct.stock}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-vertical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    Product Image (optional)
                    <span className="text-xs text-gray-500">
                      (JPG, PNG up to 5MB)
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl shadow-md border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    className="flex-1 px-8 py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 shadow-lg transition-all duration-200"
                    onClick={handleCloseModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={submitLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-semibold shadow-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-lg"
                  >
                    {submitLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Product"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Edit Product
                </h2>
                <button
                  onClick={handleCloseEditModal}
                  className="p-2 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <MdClose className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingProduct.name}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (₱) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={editingProduct.price}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      value={editingProduct.categoryId}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      required
                    >
                      <option value="">Choose category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {showStock && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="stock"
                        value={editingProduct.stock}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={editingProduct.description || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    Update Image (optional)
                    <span className="text-xs text-gray-500">
                      (JPG, PNG up to 5MB)
                    </span>
                  </label>
                  {editingProduct.imageUrl && (
                    <div className="mb-3">
                      <img
                        src={editingProduct.imageUrl}
                        alt="Current"
                        className="w-32 h-32 object-cover rounded-xl shadow-md border"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current image
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl shadow-md border"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        New image preview
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    className="flex-1 px-8 py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 shadow-lg transition-all duration-200"
                    onClick={handleCloseEditModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={editSubmitLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold shadow-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-lg"
                  >
                    {editSubmitLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Product"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Inventory;

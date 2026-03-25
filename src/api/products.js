import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Get all products
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.sort) params.append("sort", filters.sort);

  const response = await axios.get(`${API_URL}/products?${params.toString()}`);
  return response.data;
};

// Create new product
export const createProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/products`, productData);
  return response.data;
};

// Update product stock
export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_URL}/products/${id}`, productData);
  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/products/${id}`);
  return response.data;
};

// Upload image to Cloudinary
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axios.post(
    `${API_URL}/products/upload-image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// Get categories for dropdown
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/products/categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, data: [] };
  }
};

// POS/Sales APIs
export const createSale = async (items, paymentMethod) => {
  const userId = localStorage.getItem("userId");
  if (!userId) throw new Error("User not logged in");
  const response = await axios.post(`${API_URL}/sales`, {
    userId,
    paymentMethod,
    items,
  });
  return response.data;
};

export const getProductsByCategory = async (categoryId) => {
  return getProducts({ categoryId });
};

export default {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getCategories,
  getProductsByCategory,
};

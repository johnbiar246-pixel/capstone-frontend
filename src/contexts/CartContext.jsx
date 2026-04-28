import React, { createContext, useContext, useState, useEffect } from "react";
import { createOrder } from "../api/orders";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
// Load cart from localStorage on initial render
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  const [customerType, setCustomerType] = useState("REGULAR");

  // Persist customerType to localStorage
  useEffect(() => {
    localStorage.setItem("customerType", customerType);
  }, [customerType]);

  // Load customerType on init
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedType = localStorage.getItem("customerType") || "REGULAR";
      setCustomerType(savedType);
    }
  }, []); 

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Calculate pricing breakdown (matches backend logic)
  const calculateCartBreakdown = (items = cart, custType = customerType) => {
    let subtotal = 0;
    let foodSubtotal = 0;

    items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      // Food items: appetizers, main-dishes (matches backend)
      const isFood = ['appetizers', 'main-dishes'].includes(
        (item.category?.name || '').toLowerCase()
      );
      if (isFood) {
        foodSubtotal += itemTotal;
      }
    });

    const discount = (custType === 'PWD' || custType === 'SENIOR') 
      ? foodSubtotal * 0.2 
      : 0;
    const serviceCharge = foodSubtotal * 0.1;
    const total = subtotal + serviceCharge - discount;

    return { 
      subtotal: subtotal.toFixed(2), 
      foodSubtotal: foodSubtotal.toFixed(2),
      discount: discount.toFixed(2), 
      serviceCharge: serviceCharge.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const getCartTotal = () => {
    const breakdown = calculateCartBreakdown();
    return parseFloat(breakdown.total);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Remove duplicate getCartTotal - using breakdown version above

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Place order function
  const placeOrder = async (
    tableId,
    paymentMethod = null,
    referenceNo = null,
    amountTendered = null,
    customerTypeParam = null,
  ) => {
    const finalCustomerType = customerTypeParam || customerType;
    if (cart.length === 0) {
      throw new Error("Cart is empty");
    }

    // Transform cart items to API format
    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    // Call API to create order (not sale yet - will become sale when completed)
    // Note: For customer orders, paymentMethod and referenceNo are stored but not required
    const response = await createOrder(items, tableId, "PENDING", paymentMethod, referenceNo, amountTendered, finalCustomerType);

    // Clear cart after successful order
    if (response.success) {
      clearCart();
      closeCart();
    }

    return response;
  };

  const value = {
    cart,
    customerType,
    setCustomerType,
    calculateCartBreakdown,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    openCart,
    closeCart,
    toggleCart,
    placeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { checkout as checkoutApi } from "../api/sales.js";
import { createOrder } from "../api/orders.js";

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
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Validate and clean cart items
          const validCart = parsedCart.filter(item => 
            item && 
            typeof item === 'object' && 
            (item.id || item._id || item.productId) &&
            item.name &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' && item.quantity > 0
          );
          return validCart;
        } catch (error) {
          console.warn('Failed to parse cart from localStorage:', error);
          return [];
        }
      }
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
    // Validate product
    if (!product || typeof product !== 'object') {
      console.warn('Invalid product passed to addToCart:', product);
      return;
    }

    if (!product.id && !product._id && !product.productId) {
      console.warn('Product missing ID:', product);
      return;
    }

    if (!product.name || typeof product.price !== 'number') {
      console.warn('Product missing required fields:', product);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => 
        item.id === product.id || 
        item._id === product._id || 
        item.productId === product.productId
      );
      if (existingItem) {
        return prevCart.map((item) =>
          (item.id === product.id || item._id === product._id || item.productId === product.productId)
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const calculateCartBreakdown = useCallback((items = cart, custType = customerType) => {
    let subtotal = 0;
    let foodSubtotal = 0;

    items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      // Food items: appetizers, main-dishes (matches backend)
      const catName = (item.category?.name || '').toLowerCase();
      const catId = (item.categoryId || '').toLowerCase();
      const isFood = ['appetizers', 'main-dishes'].includes(catName) || ['appetizers', 'main-dishes'].includes(catId);
      if (isFood) {
        foodSubtotal += itemTotal;
      }
    });

    const discountAmount = (custType === 'PWD' || custType === 'SENIOR') 
      ? foodSubtotal * 0.2 
      : 0;
    
    const applicableAmount = subtotal - discountAmount;
    const serviceCharge = applicableAmount * 0.1;
    const total = applicableAmount + serviceCharge;
    const nonFoodSubtotal = subtotal - foodSubtotal;

    return { 
      subtotal: parseFloat(subtotal.toFixed(2)), 
      foodSubtotal: parseFloat(foodSubtotal.toFixed(2)),
      nonFoodSubtotal: parseFloat(nonFoodSubtotal.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)), 
      serviceCharge: parseFloat(serviceCharge.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }, [cart, customerType]);

  const cartBreakdown = useMemo(() => calculateCartBreakdown(cart), [calculateCartBreakdown, cart]);
  const getCartTotal = () => cartBreakdown.total;

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => 
      !(item.id === productId || item._id === productId || item.productId === productId)
    ));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id === productId || item._id === productId || item.productId === productId)
          ? { ...item, quantity } 
          : item,
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
    breakdown = null,
    mode = "customer",  // "customer" | "cashier"
    source = null,  // Optional: explicitly set source, otherwise derived from mode
  ) => {
    const finalCustomerType = customerTypeParam || customerType;
    if (cart.length === 0) {
      throw new Error("Cart is empty");
    }

    // Determine status and source based on mode or explicit source parameter
    let status, finalSource;
    
    if (source) {
      // Explicit source provided
      finalSource = source;
      status = source === "CASHIER" ? "PREPARING" : "PENDING";
    } else {
      // Derive from mode
      if (mode === "cashier") {
        finalSource = "CASHIER";
        status = "PREPARING";
      } else {
        finalSource = "CUSTOMER";
        status = "PENDING";
      }
    }

    // Transform cart items to API format
    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    // Call API to create order
    const response = await createOrder(
      items,
      tableId,
      status,
      paymentMethod,
      referenceNo,
      amountTendered,
      finalCustomerType,
      calculateCartBreakdown(cart, finalCustomerType),
      finalSource
    );

    // Clear cart after successful order
    if (response.success) {
      clearCart();
      closeCart();
      return {
        success: true,
        data: {
          orderNumber: response.data.order?.orderNumber,
          orderId: response.data.order?.id,
          order: response.data.order,
        },
      };
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

import API from "./axios.js";

/**
 * Unified Checkout API
 * Creates Order + Sale in ONE atomic transaction
 */
export const checkoutOrder = async ({
  userId = null,
  items = [],
  tableId = null,
  paymentMethod,
  referenceNo = null,
  amountTendered = null,
  customerType = "REGULAR",
}) => {
  try {
    // Basic validation before request (frontend safety)
    if (!items.length) {
      throw new Error("Cart is empty");
    }

    if (!paymentMethod) {
      throw new Error("Payment method is required");
    }

    const payload = {
      userId:
        userId ||
        localStorage.getItem("userId") ||
        sessionStorage.getItem("userId") ||
        null,

      items: items.map((item) => ({
        productId: item.id || item.productId,
        quantity: item.quantity,
      })),

      tableId,
      paymentMethod,
      referenceNo,
      amountTendered,
      customerType,
    };

    const response = await API.post("/checkout", payload);

    return response.data;
  } catch (error) {
    console.error("Checkout API Error:", error);
    throw error;
  }
};

/**
 * Optional: preview checkout before submitting
 * (useful for UI confirmation modal)
 */
export const previewCheckout = (items, customerType = "REGULAR") => {
  let subtotal = 0;
  let foodSubtotal = 0;

  items.forEach((item) => {
    const price = item.price || 0;
    const qty = item.quantity || 0;

    const itemTotal = price * qty;
    subtotal += itemTotal;

    if (item.isFood !== false) {
      foodSubtotal += itemTotal;
    }
  });

  const discountRate =
    customerType === "PWD" || customerType === "SENIOR" ? 0.2 : 0;

  const discount = foodSubtotal * discountRate;
  const afterDiscount = subtotal - discount;
  const serviceCharge = afterDiscount * 0.1;
  const total = afterDiscount + serviceCharge;

  return {
    subtotal,
    foodSubtotal,
    discount,
    serviceCharge,
    total,
  };
};

export default {
  checkoutOrder,
  previewCheckout,
};
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdRestaurantMenu, MdLocalDining } from "react-icons/md";
import { useCart } from "../../contexts/CartContext";

const CartIcon = () => {
  const { getCartItemCount, toggleCart } = useCart();
  const itemCount = getCartItemCount();

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center gap-2 px-3 py-2 bg-[#254F22]/80 hover:bg-[#254F22] text-white rounded-lg transition-all duration-300 border border-[#F4B860]/30 hover:border-[#F4B860]"
    >
      <div className="relative">
        <MdRestaurantMenu className="text-xl" />
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.span
              className="absolute -top-2 -right-2 bg-[#F4B860] text-[#3C3D37] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="hidden sm:inline text-sm font-medium">My Order</span>
    </button>
  );
};

export default CartIcon;

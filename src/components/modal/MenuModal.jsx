import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdRestaurantMenu, MdClose } from "react-icons/md";
import { FaGlassCheers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MenuModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleViewMenu = () => {
    navigate("/menu");
    onClose();
  };

  const handleOrderNow = () => {
    // Navigate to table scanning page
    navigate("/scan-table");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#254F22] to-[#3C3D37] p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                >
                  <MdClose className="text-2xl" />
                </button>
                <h2 className="text-2xl font-bold mb-2">Explore Our Menu</h2>
                <p className="text-white/80 text-sm">
                  Choose how you'd like to proceed
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Order Now Button */}
                <motion.button
                  onClick={handleOrderNow}
                  className="w-full flex items-center justify-center gap-3 bg-[#F4B860] text-[#3C3D37] px-6 py-4 rounded-xl font-semibold hover:bg-[#e5a950] transition shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaGlassCheers className="text-xl" />
                  Order Now
                </motion.button>

                {/* View Menu Button */}
                <motion.button
                  onClick={handleViewMenu}
                  className="w-full flex items-center justify-center gap-3 bg-[#254F22] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#1f3f1c] transition shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MdRestaurantMenu className="text-xl" />
                  View Menu
                </motion.button>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 text-center">
                <p className="text-gray-500 text-sm">
                  Discover our delicious selection of food and beverages
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuModal;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdRestaurantMenu, MdClose, MdTableBar, MdAccessTime, MdCheck } from "react-icons/md";
import { FaGlassCheers } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getOrdersByTable } from "../../api/orders";

const MenuModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tableNumber, setTableNumber] = useState(searchParams.get("table") || localStorage.getItem("tableNumber"));
  const [statusOrders, setStatusOrders] = useState({ preparing: 0, completed: 0 });
  const [statusLoading, setStatusLoading] = useState(false);

  const handleViewMenu = () => {
    navigate("/menu");
    onClose();
  };

  const handleOrderNow = () => {
    // Navigate to table scanning page
    navigate("/scan-table");
    onClose();
  };

  const handleOrderStatus = async () => {
    if (!tableNumber) {
      navigate("/scan-table");
      onClose();
      return;
    }

    // Quick status check
    setStatusLoading(true);
    try {
      const response = await getOrdersByTable(tableNumber);
      if (response.success) {
        const preparingCount = response.data.filter(o => o.status?.toLowerCase() === 'preparing').length;
        const completedCount = response.data.filter(o => o.status?.toLowerCase() === 'completed').length;
        setStatusOrders({ preparing: preparingCount, completed: completedCount });
        
        // If orders exist, navigate to full orders page
        if (preparingCount > 0 || completedCount > 0) {
          navigate(`/orders?table=${tableNumber}`);
        }
      }
    } catch (err) {
      console.error("Status check failed:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    const storedTable = searchParams.get("table") || localStorage.getItem("tableNumber");
    if (storedTable) {
      setTableNumber(storedTable);
    }
  }, [searchParams]);

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

                {/* Order Status Button */}
                <motion.button
                  onClick={handleOrderStatus}
                  className="w-full flex items-center justify-center gap-3 bg-[#3C3D37]/90 text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#3C3D37] transition shadow-md relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MdTableBar className="text-xl" />
                      Order Status
                      {tableNumber && statusOrders.preparing > 0 && (
                        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {statusOrders.preparing}
                        </div>
                      )}
                    </>
                  )}
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

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";

// Icons
import {
  MdInventory,
  MdTrendingUp,
  MdLogout,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { FaCashRegister } from "react-icons/fa6";
import { FaGlassCheers } from "react-icons/fa";

const MotionLink = motion(Link);

const logout = async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {}
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/login";
};

const menuItems = [
  { id: "cashier", label: "POS", to: "/user/cashier", icon: FaCashRegister },
  { id: "orders", label: "Orders", icon: FaGlassCheers },
  { id: "inventory", label: "Inventory", icon: MdInventory },
  { id: "sales", label: "Sales", icon: MdTrendingUp },
];

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 100,
    },
  }),
};

const UserSidebar = () => {
  const location = useLocation();
  const { sidebarWidth, isMobile, isSidebarOpen, toggleSidebar, closeSidebar } =
    useSidebar();
  const currentSection = location.pathname.split("/").pop() || "dashboard";

  return (
    <>
      {isMobile && (
        <div className="sticky top-0 z-40 bg-[#3C3D37] border-b border-[#254F22]/40 px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold text-white text-lg">Gulp Course</h2>
          <button
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center p-2 rounded-md bg-[#254F22] text-white hover:bg-[#1e3f1c] transition"
          >
            {isSidebarOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>
        </div>
      )}

      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close sidebar backdrop"
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`bg-gradient-to-b from-[#3C3D37]/95 to-[#2a2b25]/95 backdrop-blur-md border-r border-[#254F22]/30 shadow-2xl z-50 ${
          isMobile ? "fixed top-0 left-0 h-screen" : "sticky top-0 min-h-screen"
        }`}
        initial={false}
        animate={
          isMobile
            ? { x: isSidebarOpen ? 0 : -320, width: "16rem" }
            : { x: 0, width: sidebarWidth }
        }
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
      >
        <div className="p-4 md:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-bold text-white text-xl md:text-2xl"
            >
              Gulp Course
            </motion.h2>
            {isMobile && (
              <button
                onClick={closeSidebar}
                className="p-2 rounded-md text-white hover:bg-white/10"
              >
                <MdClose size={20} />
              </button>
            )}
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  custom={index}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <MotionLink
                    to={item.to || `/user/${item.id}`}
                    onClick={() => isMobile && closeSidebar()}
                    className={`w-full px-4 py-3 rounded-xl flex items-center ${
                      currentSection === item.id
                        ? "bg-[#254F22] text-white shadow-lg shadow-[#254F22]/30"
                        : "text-gray-200 hover:bg-[#254F22]/50 hover:text-white"
                    }`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span
                      whileHover={{ scale: 1.08 }}
                      className="flex-shrink-0"
                    >
                      <Icon className="text-xl md:text-2xl mr-3" />
                    </motion.span>

                    <span className="font-medium whitespace-nowrap block ml-3">
                      {item.label}
                    </span>

                    {currentSection === item.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-[#F4B860] rounded-full"
                      />
                    )}
                  </MotionLink>
                </motion.div>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-700/50 sticky bottom-0 bg-gradient-to-b from-transparent to-[#2a2b25]/95">
            <motion.button
              onClick={logout}
              className="w-full px-4 py-3 rounded-xl flex items-center text-red-300 hover:bg-red-500/30"
              whileHover={{ scale: 1.02, x: 4 }}
            >
              <MdLogout className="mr-3 text-xl" />
              <span className="font-medium block">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default UserSidebar;

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import {
  MdInventory,
  MdTableChart,
  MdPersonAdd,
  MdTrendingUp,
  MdMenu,
  MdClose,
} from "react-icons/md";

const menuItems = [
  { id: "create-user", label: "Create User", icon: MdPersonAdd },
  { id: "inventory", label: "Inventory", icon: MdInventory },
  { id: "sales", label: "Sales", icon: MdTrendingUp },
  { id: "tables", label: "Tables", icon: MdTableChart },
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

const AdminSidebar = () => {
  const location = useLocation();
  const { sidebarWidth, isMobile, isSidebarOpen, toggleSidebar, closeSidebar } =
    useSidebar();
  const currentSection = location.pathname.split("/").pop() || "inventory";

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      {isMobile && (
        <motion.button
          onClick={toggleSidebar}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#254F22] text-white shadow-lg hover:bg-[#1e3f1c] transition-colors"
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {isSidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </motion.button>
      )}

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`bg-[#3C3D37] border-r border-[#254F22]/40 shadow-2xl z-50 ${
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
          {/* Mobile Close Button in Sidebar Header */}
          {isMobile && (
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <span className="text-white font-bold text-lg">
                Administrator
              </span>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-md text-white hover:bg-white/10 transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>
          )}

          {/* Desktop Header */}
          {!isMobile && (
            <div className="mb-6 md:mb-8">
              <span className="text-white font-bold text-lg hidden md:block">
                Administrator
              </span>
            </div>
          )}

          <nav className="space-y-2 flex-1 pt-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  custom={index}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-full group"
                >
                  <Link
                    to={`/admin/${item.id}`}
                    onClick={() => isMobile && closeSidebar()}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center no-underline ${
                      currentSection === item.id
                        ? "bg-[#254F22] text-white shadow-lg shadow-[#254F22]/30"
                        : "text-gray-200 hover:bg-[#254F22]/50 hover:text-white"
                    }`}
                    style={{ textDecoration: "none" }}
                  >
                    <motion.span
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex-shrink-0"
                    >
                      <Icon className="text-xl md:text-2xl mr-3" />
                    </motion.span>
                    <span className="font-medium whitespace-nowrap ml-3">
                      {item.label}
                    </span>
                    {currentSection === item.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-[#F4B860] rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;

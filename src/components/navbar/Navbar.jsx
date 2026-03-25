import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CartIcon from "../cart/CartIcon";
import GulpCourseLogo from "../../img/GulpCourse.png";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-[#3C3D37] shadow-lg border-b border-[#254F22]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            {/* Add your logo here */}
            <Link
              to="/"
              className="group flex items-center gap-2 text-xl font-bold text-white transition duration-300 hover:text-[#F4B860]"
            >
              <motion.img
                src={GulpCourseLogo}
                alt="Gulp Course Logo"
                className="h-8 w-8 rounded-full object-cover transition duration-300 group-hover:brightness-110"
                whileTap={{ scale: 0.85, rotate: -8 }}
                animate={{ scale: [1, 1.12, 1], rotate: [0, 6, 0] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.span whileTap={{ scale: 0.96 }}>Gulp Course</motion.span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8"></div>

          {/* Cart Icon / Dashboard & Login/Logout Button */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/user/dashboard"
                className="bg-[#254F22] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1e3f1c] transition duration-300"
              >
                Dashboard
              </Link>
            ) : (
              <CartIcon />
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition duration-300"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-[#254F22] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1e3f1c] transition duration-300"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Cart / Dashboard & Menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/user/dashboard"
                className="bg-[#254F22] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-[#1e3f1c] transition duration-300"
              >
                Dashboard
              </Link>
            ) : (
              <CartIcon />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-[#254F22] inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-[#1e3f1c] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#254F22]"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#3C3D37] border-t border-[#254F22]/40">
            {isAuthenticated ? (
              <>
                <Link
                  to="/user/dashboard"
                  className="text-white hover:text-[#b8c9b0] block px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-300 hover:text-red-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-white hover:text-[#b8c9b0] block px-3 py-2 rounded-md text-base font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

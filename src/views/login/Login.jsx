import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdMailOutline,
  MdLockOutline,
  MdLogin,
  MdAdminPanelSettings,
  MdPointOfSale,
} from "react-icons/md";
import { loginUser } from "../../api/Auth";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/navbar/Navbar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(email, password);

      console.log("LOGIN RESPONSE:", response);

      const { token, user } = response.data;

      login(token, user.role, user.id);

      const redirectPath = user.role === "ADMIN" ? "/admin" : "/user";
      navigate(redirectPath);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-[#eef3ea] to-[#e4ece0] relative overflow-hidden">
      <Navbar />

      {/* Decorative background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-12 w-72 h-72 bg-[#3C3D37]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-80 h-80 bg-[#254F22]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-[#254F22]/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-6 md:p-10 flex items-center justify-center"
      >
        <motion.div
          variants={itemVariants}
          className="max-w-4xl w-full mx-auto grid md:grid-cols-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/70 overflow-hidden"
        >
          {/* Left panel */}
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-[#3C3D37] to-[#254F22] text-white">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium">
                <MdLogin className="w-4 h-4" />
                Staff Access Portal
              </span>
              <h2 className="text-4xl font-bold leading-tight">
                Secure Sign In
                <br />
                for Daily Operations
              </h2>
              <p className="text-[#d7e2d2] text-sm leading-relaxed">
                This system is intended for authorized staff only.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-sm">
                <MdAdminPanelSettings className="w-4 h-4" />
                Admin
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-sm">
                <MdPointOfSale className="w-4 h-4" />
                Cashier
              </span>
            </div>
          </div>

          {/* Right panel / form */}
          <div className="p-7 md:p-10 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-3 bg-[#e7efe3] rounded-2xl">
                  <MdLogin className="w-7 h-7 text-[#254F22]" />
                </span>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#3C3D37] to-[#254F22] bg-clip-text text-transparent"
                >
                  Login
                </motion.h1>
              </div>

              <p className="text-sm md:text-base text-gray-600">
                Authorized access only for{" "}
                <span className="font-semibold text-[#254F22]">Admin</span> and{" "}
                <span className="font-semibold text-[#3C3D37]">Cashier</span>{" "}
                accounts.
              </p>

              <div className="flex flex-wrap gap-2 md:hidden">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e7efe3] text-[#254F22] text-xs font-semibold">
                  <MdAdminPanelSettings className="w-4 h-4" />
                  Admin
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ecefe9] text-[#3C3D37] text-xs font-semibold">
                  <MdPointOfSale className="w-4 h-4" />
                  Cashier
                </span>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-100 group-focus-within:bg-[#e7efe3] transition-colors">
                    <MdMailOutline className="text-gray-500 group-focus-within:text-[#254F22] w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full pl-12 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#254F22]/40 focus:border-[#254F22]/40 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-100 group-focus-within:bg-[#e7efe3] transition-colors">
                    <MdLockOutline className="text-gray-500 group-focus-within:text-[#254F22] w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#254F22]/40 focus:border-[#254F22]/40 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3.5 bg-gradient-to-r from-[#3C3D37] via-[#2f4a2b] to-[#254F22] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#2f302b] hover:to-[#1f431d] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <MdLogin className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;

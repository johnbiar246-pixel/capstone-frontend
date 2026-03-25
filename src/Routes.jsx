import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  BrowserRouter,
} from "react-router-dom";
import { motion } from "framer-motion";

// Importing views and components
import Home from "./views/home/Home";
import Login from "./views/login/Login";
import Dashboard from "./views/dashboard/Dashboard";
import AdminDashboard from "./views/admin/AdminDashboard";
import Menu from "./components/menu/Menu";
import Orders from "./components/orders/Orders";
import Inventory from "./components/inventory/Inventory";
import History from "./components/history/History";
import TableGenerator from "./components/tables/TableGenerator";
import Cashier from "./views/cashier/Cashier";
import CreateUser from "./components/user/CreateUser";
import ScanTable from "./views/scan-table/ScanTable";
import PrivateRoute from "./components/protected/PrivateRoute";
import AdminRoute from "./components/protected/AdminRoute";
// Removed invalid AdminDashboardHome import; not needed for user routes

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/scan-table" element={<ScanTable />} />

        {/* User Dashboard nested routes (protected) */}
        <Route path="/user" element={<PrivateRoute />}>
          <Route element={<Dashboard />}>
            <Route index element={<Navigate to="cashier" replace />} />
            <Route
              path="dashboard"
              element={
                <div className="max-w-4xl mx-auto p-8">
                  <motion.h1
                    className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Welcome to Dashboard
                  </motion.h1>
                  <motion.div
                    className="bg-white rounded-2xl p-8 shadow-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <p className="text-lg text-gray-600 mb-4">
                      Use the sidebar to access POS, Inventory, Orders, and
                      History.
                    </p>
                  </motion.div>
                </div>
              }
            />
            <Route path="cashier" element={<Cashier />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="sales" element={<History />} />
          </Route>
        </Route>

        {/* Admin Dashboard nested routes (protected) */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminDashboard />}>
            <Route index element={<Navigate to="inventory" replace />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales" element={<History />} />
            <Route path="tables" element={<TableGenerator />} />
            <Route path="create-user" element={<CreateUser />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

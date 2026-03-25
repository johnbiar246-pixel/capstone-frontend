import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import Navbar from "../../components/navbar/Navbar";
import { SidebarProvider } from "../../contexts/SidebarContext";

const AdminDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Navbar />
        <div className="flex flex-1 relative">
          <AdminSidebar />
          <main className="flex-1 p-4 md:p-8 overflow-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;

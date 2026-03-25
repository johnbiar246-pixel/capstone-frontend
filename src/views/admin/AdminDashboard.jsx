import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import { SidebarProvider } from "../../contexts/SidebarContext";

const AdminDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <AdminSidebar />
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;

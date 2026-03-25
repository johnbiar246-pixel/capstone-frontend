import React from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "../../components/sidebar/UserSidebar";
import { SidebarProvider } from "../../contexts/SidebarContext";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <UserSidebar />
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

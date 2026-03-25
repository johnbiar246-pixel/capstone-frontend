import React from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "../../components/sidebar/UserSidebar";
import Navbar from "../../components/navbar/Navbar";
import { SidebarProvider } from "../../contexts/SidebarContext";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 relative">
          <UserSidebar />
          <main className="flex-1 p-4 md:p-8 overflow-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./Routes.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
import { SalesProvider } from "./contexts/SalesContext.jsx";
import { OrdersProvider } from "./contexts/OrdersContext.jsx";
import axios from "axios";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <SalesProvider>
          <OrdersProvider>
            <AppRoutes />
          </OrdersProvider>
        </SalesProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);

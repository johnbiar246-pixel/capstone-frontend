import React, { createContext, useContext, useState, useCallback } from "react";
import { getSales, getSaleById } from "../api/sales.js";

const SalesContext = createContext();

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
};

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSales = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const salesData = await getSales(params);
      setSales(Array.isArray(salesData) ? salesData : []);
      return salesData;
    } catch (err) {
      setError(err.message || "Failed to load sales");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSaleDetail = useCallback(async (saleId) => {
    setIsLoading(true);
    setError(null);
    try {
      const sale = await getSaleById(saleId);
      setSelectedSale(sale);
      return sale;
    } catch (err) {
      setError(err.message || "Failed to load sale detail");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SalesContext.Provider
      value={{
        sales,
        selectedSale,
        isLoading,
        error,
        fetchSales,
        fetchSaleDetail,
        setSales,
        setSelectedSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

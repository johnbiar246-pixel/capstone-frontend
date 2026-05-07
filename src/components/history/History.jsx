import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MdHistory,
  MdSearch,
  MdExpandMore,
  MdExpandLess,
  MdLocalOffer,
  MdCheck,
  MdClose,
} from "react-icons/md";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSales } from "../../contexts/SalesContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import SaleDetailModal from "../modal/SaleDetailModal.jsx";
import { useMemo } from "react";
import { MdClear, MdCalendarToday, MdSort, MdPayments } from "react-icons/md";

const PH_TZ = "Asia/Manila";
const PH_OFFSET_MINUTES = 8 * 60;
const PH_OFFSET_MS = PH_OFFSET_MINUTES * 60 * 1000;

const toPhBoundaryUtc = (dateStr, isEnd = false) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  const utcMs =
    Date.UTC(
      year,
      month - 1,
      day,
      isEnd ? 23 : 0,
      isEnd ? 59 : 0,
      isEnd ? 59 : 0,
      isEnd ? 999 : 0,
    ) - PH_OFFSET_MS;
  const dt = new Date(utcMs);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const toPhDayKey = (dateValue) => {
  const d = new Date(dateValue);
  const shifted = new Date(d.getTime() + PH_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
};

const History = () => {
  const [rawSales, setRawSales] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    sortBy: "date",
    sortOrder: "desc",
    paymentFilter: "all",
  });
  const [breakdownFilters, setBreakdownFilters] = useState({
    scope: "all",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [expandedSales, setExpandedSales] = useState({});
  const [todaySales, setTodaySales] = useState([]);
  const [todayProductSummary, setTodayProductSummary] = useState([]);
  const [error, setError] = useState(null);
  const [filteredSales, setFilteredSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  // Modal state
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const { fetchSales: loadSales, fetchSaleDetail: loadSaleDetail } = useSales();
  const { isAdmin } = useAuth();

  const isValidDates =
    !filters.dateFrom ||
    !filters.dateTo ||
    new Date(filters.dateFrom) <= new Date(filters.dateTo);

const fetchSaleDetail = async (saleId) => {
  setModalLoading(true);
  try {
    const sale = await loadSaleDetail(saleId);
    setSelectedSale(sale);
  } catch (err) {
    console.error(err);
  } finally {
    setModalLoading(false);
  }
};

  const openSaleDetail = (saleId) => {
    setSelectedSaleId(saleId);
    fetchSaleDetail(saleId);
  };

  const closeSaleDetail = () => {
    setSelectedSaleId(null);
    setSelectedSale(null);
  };

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (!isAdmin) {
        const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (userId) params.userId = userId;
      }
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const sales = await loadSales(params);
      setRawSales(Array.isArray(sales) ? sales : []);
    } catch (err) {
      setError(err.message || "Failed to load sales");
    } finally {
      setIsLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo, isAdmin, loadSales]);

  const fetchAllSales = useCallback(async () => {
    try {
      const params = {};
      if (!isAdmin) {
        const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (userId) params.userId = userId;
      }
      const sales = await loadSales(params);
      setAllSales(Array.isArray(sales) ? sales : []);
    } catch (err) {
      console.error("FETCH ALL SALES ERROR:", err);
    }
  }, [isAdmin, loadSales]);

  const handleManualRefresh = useCallback(async () => {
    setIsManualRefreshing(true);
    setShowRefreshSuccess(false);
    try {
      await fetchAllSales();
      setShowRefreshSuccess(true);
      setTimeout(() => setShowRefreshSuccess(false), 900);
    } finally {
      setIsManualRefreshing(false);
    }
  }, [fetchAllSales]);

  // Set default to today
  useEffect(() => {
    const today = Intl.DateTimeFormat("sv", { timeZone: PH_TZ }).format(new Date());
    setFilters((prev) => ({ ...prev, dateFrom: today, dateTo: today }));
  }, []);

  // Toggle expanded state for a sale
  const toggleSaleExpand = (saleId) => {
    setExpandedSales((prev) => ({
      ...prev,
      [saleId]: !prev[saleId],
    }));
  };

  // Initial fetch
  useEffect(() => {
    if (filters.dateFrom && filters.dateTo) {
      fetchSales();
    }
  }, [filters.dateFrom, filters.dateTo, fetchSales]);

  useEffect(() => {
    fetchAllSales();
  }, [fetchAllSales]);

  useEffect(() => {
    const intervalId = setInterval(fetchSales, 30000);
    return () => clearInterval(intervalId);
  }, [fetchSales]);

  useEffect(() => {
    const handleFocus = () => fetchSales();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchSales]);

useEffect(() => {
  const todayKey = toPhDayKey(new Date());

  const source = allSales.length ? allSales : rawSales;

  const todaySalesData = [];
  const productSummary = {};

  source.forEach((sale) => {
    const saleDayKey = toPhDayKey(sale.createdAt);

    if (saleDayKey === todayKey) {
      todaySalesData.push(sale);

      sale.saleItems?.forEach((item) => {
        const productId = item.product.id;

        if (!productSummary[productId]) {
          productSummary[productId] = {
            id: productId,
            name: item.product.name,
            quantity: 0,
            totalSales: 0,
          };
        }

        productSummary[productId].quantity += item.quantity;
        productSummary[productId].totalSales += item.price * item.quantity;
      });
    }
  });

  setTodaySales(todaySalesData);
  setTodayProductSummary(Object.values(productSummary));
}, [rawSales, allSales]);

  const filteredSalesMemo = useMemo(() => {
    let tempSales = [...allSales];
    if (filters.dateFrom || filters.dateTo) {
      const fromDate = toPhBoundaryUtc(filters.dateFrom, false);
      const toDate = toPhBoundaryUtc(filters.dateTo, true);
      tempSales = tempSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        if (fromDate && saleDate < fromDate) return false;
        if (toDate && saleDate > toDate) return false;
        return true;
      });
    }
    if (filters.paymentFilter !== "all") {
      tempSales = tempSales.filter(
        (sale) => sale.paymentMethod === filters.paymentFilter,
      );
    }
    tempSales.sort((a, b) => {
      let aVal, bVal;
      if (filters.sortBy === "date") {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else {
        aVal = a.totalAmount;
        bVal = b.totalAmount;
      }
      return filters.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
    return tempSales;
  }, [allSales, filters]);

  useEffect(() => {
    setFilteredSales(filteredSalesMemo);
  }, [filteredSalesMemo]);

  useEffect(() => {
    const monthly = {};
    const breakdownSource = allSales.filter((sale) => {
      if (breakdownFilters.scope === "all") return true;
      const saleDate = new Date(sale.createdAt);
      const saleYear = Number(
        saleDate.toLocaleString("en-US", { timeZone: PH_TZ, year: "numeric" }),
      );
      const saleMonth = Number(
        saleDate.toLocaleString("en-US", { timeZone: PH_TZ, month: "numeric" }),
      );
      return (
        saleYear === Number(breakdownFilters.year) &&
        saleMonth === Number(breakdownFilters.month)
      );
    });
    breakdownSource.forEach((sale) => {
      const date = new Date(sale.createdAt);
      const dayLabel = date.toLocaleDateString("en-US", {
        timeZone: PH_TZ,
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const daySortValue = date.getTime();
      if (!monthly[dayLabel]) {
        monthly[dayLabel] = {
          month: dayLabel,
          orders: 0,
          sales: 0,
          sortValue: daySortValue,
        };
      }
      monthly[dayLabel].orders += 1;
      monthly[dayLabel].sales += sale.totalAmount;
    });
    const grouped = Object.values(monthly).sort(
      (a, b) => a.sortValue - b.sortValue,
    );
    grouped.forEach((item, index) => {
      item.id = String(index + 1);
    });
    setSalesHistory(grouped);
  }, [allSales, breakdownFilters]);

  const monthlyTotalRevenue = salesHistory.reduce(
    (acc, item) => acc + item.sales,
    0,
  );

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 sm:px-6 lg:px-8"
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
      >
        Sales
      </motion.h1>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-6 sm:mb-8"
      >
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 flex-1">
            <div className="flex flex-col">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MdCalendarToday className="w-4 h-4" />
                From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full px-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MdCalendarToday className="w-4 h-4" />
                To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full px-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MdPayments className="w-4 h-4" />
                Payment
              </label>
              <select
                value={filters.paymentFilter}
                onChange={(e) =>
                  setFilters({ ...filters, paymentFilter: e.target.value })
                }
                className="w-full px-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="all">All</option>
                <option value="CASH">Cash</option>
                <option value="GCASH">GCash</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const today = Intl.DateTimeFormat("sv", {
                  timeZone: "Asia/Manila",
                }).format(new Date());
                setFilters({
                  dateFrom: today,
                  dateTo: today,
                  sortBy: "date",
                  sortOrder: "desc",
                  paymentFilter: "all",
                });
                setTimeout(() => fetchSales(), 0);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              <MdCalendarToday className="w-4 h-4" />
              Today
            </button>
            <button
              onClick={() => {
                setFilters({
                  dateFrom: "",
                  dateTo: "",
                  sortBy: "date",
                  sortOrder: "desc",
                  paymentFilter: "all",
                });
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl focus:ring-2 focus:ring-gray-400 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              <MdClear className="w-4 h-4" />
              All Time
            </button>
            <motion.button
              onClick={handleManualRefresh}
              disabled={isLoading || !isValidDates}
              animate={
                showRefreshSuccess
                  ? { scale: [1, 1.08, 1], rotate: [0, -6, 6, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : showRefreshSuccess ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdCheck className="w-4 h-4" />
                </motion.span>
              ) : (
                <MdSearch
                  className={`w-4 h-4 ${isManualRefreshing ? "animate-pulse" : ""}`}
                />
              )}
              {showRefreshSuccess ? "Updated" : "Refresh"}
            </motion.button>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100 border border-red-400 text-red-800 rounded-2xl mb-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 font-bold text-xl p-1 -m-1 rounded hover:bg-red-200"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
          {!isValidDates && (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-xl text-sm col-span-full"
            >
              Date "From" must be before or same as "To"
            </motion.p>
          )}
        </div>
        <div className="mt-4 flex gap-4">
          <div className="flex items-center gap-1">
            <input
              type="radio"
              id="desc"
              name="sortOrder"
              value="desc"
              checked={filters.sortOrder === "desc"}
              onChange={(e) =>
                setFilters({ ...filters, sortOrder: e.target.value })
              }
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
            />
            <label htmlFor="desc" className="text-sm text-gray-700">
              Newest First
            </label>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="radio"
              id="asc"
              name="sortOrder"
              value="asc"
              checked={filters.sortOrder === "asc"}
              onChange={(e) =>
                setFilters({ ...filters, sortOrder: e.target.value })
              }
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
            />
            <label htmlFor="asc" className="text-sm text-gray-700">
              Oldest First
            </label>
          </div>
        </div>
      </motion.div>

      {/* Today's Sales Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100 mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="p-2 sm:p-3 bg-green-100 rounded-xl">
              <MdCalendarToday className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Today's Sales Summary
            </h2>
          </div>
        </div>
        {todaySales.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-green-50 p-4 sm:p-6 rounded-xl border border-green-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  Total Sales
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  ₱
                  {todaySales
                    .reduce((sum, sale) => sum + sale.totalAmount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  Number of Transactions
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {todaySales.length}
                </p>
              </div>
            </div>
            <div className="mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <MdLocalOffer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                Top Products Today
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                        Product
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                        Qty
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayProductSummary.slice(0, 5).map((product, index) => (
                      <tr key={product.id} className="border-b border-gray-100">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-sm sm:text-base">
                          {product.name}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-700 text-sm sm:text-base">
                          {product.quantity}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold text-green-600 text-sm sm:text-base">
                          ₱{product.totalSales.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {todayProductSummary.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-4 sm:py-6 text-center text-gray-500 text-sm sm:text-base"
                        >
                          No products sold today
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 sm:py-8 text-center text-gray-500 text-sm sm:text-base">
            No sales recorded today
          </div>
        )}
      </motion.div>

      {/* Detailed Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100 mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="p-2 sm:p-3 bg-indigo-100 rounded-xl">
              <MdHistory className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Sales Details ({filteredSales.length})
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 cursor-pointer hover:text-green-600 text-sm sm:text-base whitespace-nowrap">
                  #
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 cursor-pointer hover:text-green-600 text-sm sm:text-base whitespace-nowrap">
                  Date
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base whitespace-nowrap">
                  User
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base whitespace-nowrap">
                  Table
                </th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base whitespace-nowrap">
                  Payment
                </th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base whitespace-nowrap">
                  Items
                </th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 cursor-pointer hover:text-green-600 text-sm sm:text-base whitespace-nowrap">
                  Total
                </th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base whitespace-nowrap">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, index) => (
                <React.Fragment key={sale.id}>
                  <motion.tr
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 sm:py-4 px-2 sm:px-4 font-bold text-indigo-600 text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:underline" onClick={() => openSaleDetail(sale.id)}>
                      #{sale.order?.orderNumber || sale.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                      {new Date(sale.createdAt).toLocaleDateString()}{" "}
                      <span className="hidden sm:inline">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                      {sale.order?.user?.name || sale.user?.name || "N/A"}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                      {sale.order?.table ? `Table ${sale.order.table.number}` : sale.table ? `Table ${sale.table.number}` : "Takeaway"}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.paymentMethod === "CASH"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-right text-gray-700 text-xs sm:text-sm">
                      {sale.saleItems?.length || 0}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-right font-semibold text-green-600 text-xs sm:text-sm whitespace-nowrap">
                      ₱{sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                      <button
                        onClick={() => toggleSaleExpand(sale.id)}
                        className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {expandedSales[sale.id] ? (
                          <MdExpandLess className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                        ) : (
                          <MdExpandMore className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                        )}
                      </button>
                    </td>
                  </motion.tr>

                  {expandedSales[sale.id] && (
                    <tr className="bg-gray-50">
                      <td colSpan="8" className="py-3 sm:py-4 px-3 sm:px-6">
                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">
                                  Product
                                </th>
                                <th className="text-right py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">
                                  Qty
                                </th>
                                <th className="text-right py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">
                                  Unit Price
                                </th>
                                <th className="text-right py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700">
                                  Subtotal
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {sale.saleItems?.map((item) => (
                                <tr key={item.id} className="border-t border-gray-100">
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-900">
                                    {item.product?.name || "Unknown Product"}
                                  </td>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm text-gray-700">
                                    {item.quantity}
                                  </td>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                                    ₱{item.price.toLocaleString()}
                                  </td>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm font-semibold text-green-600">
                                    ₱{(item.price * item.quantity).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                              <tr className="border-t border-gray-200 bg-gray-50">
                                <td
                                  colSpan="3"
                                  className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm font-semibold text-gray-800"
                                >
                                  Total:
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm font-bold text-green-600">
                                  ₱{sale.totalAmount.toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredSales.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan="8"
                    className="py-8 sm:py-12 text-center text-gray-500 text-sm sm:text-base"
                  >
                    {rawSales.length === 0
                      ? "No sales created yet. Create some in Cashier!"
                      : "No sales match current filters"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <SaleDetailModal 
          isOpen={!!selectedSaleId}
          onClose={closeSaleDetail}
          sale={selectedSale}
          loading={modalLoading}
        />
      </motion.div>

      {/* Monthly Sales Table */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="p-2 sm:p-3 bg-purple-100 rounded-xl">
              <MdHistory className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Monthly Breakdown
            </h2>
            <div className="inline-flex items-center gap-2 sm:gap-3 rounded-xl bg-green-50 border border-green-100 px-3 sm:px-4 py-2 ml-0 sm:ml-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Total Revenue:
              </span>
              <span className="text-base sm:text-lg font-bold text-green-600">
                ₱{monthlyTotalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <select
              value={breakdownFilters.scope}
              onChange={(e) =>
                setBreakdownFilters((prev) => ({
                  ...prev,
                  scope: e.target.value,
                }))
              }
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm"
            >
              <option value="all">All Time</option>
              <option value="month">Specific Month</option>
            </select>
            {breakdownFilters.scope === "month" && (
              <>
                <select
                  value={breakdownFilters.year}
                  onChange={(e) =>
                    setBreakdownFilters((prev) => ({
                      ...prev,
                      year: Number(e.target.value),
                    }))
                  }
                  className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm"
                >
                  {Array.from({ length: new Date().getFullYear() - 2024 + 1 }, (_, idx) => {
                    const y = 2024 + idx;
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={breakdownFilters.month}
                  onChange={(e) =>
                    setBreakdownFilters((prev) => ({
                      ...prev,
                      month: Number(e.target.value),
                    }))
                  }
                  className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm"
                >
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December",
                  ].map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                  Month
                </th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                  Orders
                </th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {salesHistory.map((month, index) => (
                <motion.tr
                  key={month.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 sm:py-4 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">
                    {month.month}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-right text-gray-700 text-xs sm:text-sm">
                    {month.orders}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-right font-semibold text-green-600 text-xs sm:text-sm whitespace-nowrap">
                    ₱{month.sales.toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default History;

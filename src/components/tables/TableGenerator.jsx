import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import {
  MdQrCode,
  MdTableRestaurant,
  MdDownload,
  MdContentCopy,
  MdDelete,
} from "react-icons/md";
import { generateTables, getAllTables, deleteTable } from "../../api/tables";

const TableGenerator = () => {
  const [numberOfTables, setNumberOfTables] = useState("");
  const [generatedQRs, setGeneratedQRs] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedTables, setSavedTables] = useState([]);

  // Fetch existing tables on component mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await getAllTables();
      if (response.success) {
        setSavedTables(response.data);
        // Convert saved tables to QR format
        const qrs = response.data.map((table) => ({
          tableNumber: table.number,
          url: table.qrValue,
          id: table.id,
        }));
        setGeneratedQRs(qrs);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  };

  const generateQRs = async () => {
    const num = parseInt(numberOfTables);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid number of tables");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generate array of table numbers
      const tableNumbers = [];
      for (let i = 1; i <= num; i++) {
        // Check if table already exists
        const existingTable = savedTables.find((t) => t.number === i);
        if (!existingTable) {
          tableNumbers.push(i);
        }
      }

      if (tableNumbers.length > 0) {
        // Save to backend
        const response = await generateTables(tableNumbers);
        if (response.success) {
          // Refresh tables from backend
          await fetchTables();
        } else {
          setError(response.message || "Failed to generate tables");
        }
      } else {
        // All tables already exist, just show them
        setGeneratedQRs(
          savedTables.map((table) => ({
            tableNumber: table.number,
            url: table.qrValue,
            id: table.id,
          })),
        );
      }

      setNumberOfTables("");
    } catch (err) {
      console.error("Error generating QR codes:", err);
      setError("Failed to generate QR codes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (id, tableNumber) => {
    if (
      !window.confirm(`Are you sure you want to delete Table ${tableNumber}?`)
    ) {
      return;
    }

    try {
      const response = await deleteTable(id);
      if (response.success) {
        await fetchTables();
      }
    } catch (err) {
      console.error("Error deleting table:", err);
      setError("Failed to delete table");
    }
  };

  const copyToClipboard = (url, index) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const qrCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto p-4 sm:p-6"
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
      >
        Table QR Generator
      </motion.h1>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <span className="p-2 sm:p-3 bg-green-100 rounded-xl">
            <MdTableRestaurant className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Generate QR Codes for Your Tables
          </h2>
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Tables
          </label>
          <input
            type="number"
            value={numberOfTables}
            onChange={(e) => setNumberOfTables(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="example: 10"
            min="1"
            onKeyPress={(e) => {
              if (e.key === "Enter") generateQRs();
            }}
          />
        </div>

        <motion.button
          onClick={generateQRs}
          disabled={loading}
          className={`w-fit px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all flex items-center justify-center gap-2 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <span>Generating...</span>
          ) : (
            <>
              <MdQrCode className="w-5 h-5" />
              Generate QR Codes
            </>
          )}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {generatedQRs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 mb-4 sm:mb-6"
            >
              <span className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                <MdQrCode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </span>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Generated QR Codes ({generatedQRs.length} tables)
              </h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {generatedQRs.map((qr, index) => (
                <motion.div
                  key={qr.id || qr.tableNumber}
                  variants={qrCardVariants}
                  className="flex flex-col items-center p-4 sm:p-6 border border-gray-200 rounded-2xl bg-gradient-to-b from-gray-50 to-white hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02, y: -3 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05, type: "spring" }}
                    className="w-28 h-28 sm:w-32 sm:h-32 bg-white p-2 rounded-xl shadow-sm mb-3 sm:mb-4"
                  >
                    <QRCode
                      value={qr.url}
                      size={112}
                      style={{ width: "100%", height: "100%" }}
                      className="sm:hidden"
                    />
                    <QRCode
                      value={qr.url}
                      size={120}
                      style={{ width: "100%", height: "100%" }}
                      className="hidden sm:block"
                    />
                  </motion.div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                    Table {qr.tableNumber}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 sm:mb-3 font-mono break-all text-center px-2">
                    {qr.url}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <motion.button
                      onClick={() => copyToClipboard(qr.url, index)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Copy URL"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copiedIndex === index ? (
                        <span className="text-green-600 text-xs sm:text-sm font-medium">
                          ✓ Copied
                        </span>
                      ) : (
                        <MdContentCopy className="w-4 h-4 text-gray-600" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteTable(qr.id, qr.tableNumber)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete Table"
                    >
                      <MdDelete className="w-4 h-4 text-red-600" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100"
            >
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Tip:</strong> Print these QR codes and place them on
                each table. Customers can scan to view your menu and place
                orders directly.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TableGenerator;

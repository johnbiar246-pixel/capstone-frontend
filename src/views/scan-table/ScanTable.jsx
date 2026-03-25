import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdQrCodeScanner, MdError } from "react-icons/md";
import { getTableByNumber } from "../../api/tables";
import Navbar from "../../components/navbar/Navbar";

const ScanTable = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scannedTable, setScannedTable] = useState(null);

  // Check if table parameter is already in URL (from QR scan)
  useEffect(() => {
    const tableFromUrl = searchParams.get("table");
    if (tableFromUrl) {
      validateAndNavigate(tableFromUrl);
    }
  }, [searchParams]);

  const validateAndNavigate = async (number) => {
    setLoading(true);
    setError("");
    setScannedTable(number);

    try {
      const response = await getTableByNumber(number);

      if (response.success && response.data) {
        // Valid table - navigate to user orders with table number
        navigate(`/user/orders?table=${number}`);
      } else {
        setError(`Table ${number} not found. Please check and try again.`);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error validating table:", err);
      setError("Failed to validate table. Please try again.");
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f7f4] to-[#e9efe7]">
      <Navbar />

      {/* Header */}
      <motion.section
        className="bg-gradient-to-r from-[#3C3D37] to-[#254F22] text-white py-8 md:py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
            whileHover={{ x: -5 }}
          >
            <MdArrowBack className="text-xl" />
            <span>Back</span>
          </motion.button>

          <motion.h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Scan Table QR Code
          </motion.h1>

          <motion.p
            className="text-lg text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Scan the QR code on your table to start ordering
          </motion.p>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
              >
                <MdError className="text-xl flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* QR Scan Instructions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#254F22]/10 rounded-full mb-4">
              <MdQrCodeScanner className="text-4xl text-[#254F22]" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Scan to Order
            </h2>
            <p className="text-gray-500 mb-6">
              Use your phone's camera to scan the QR code on your table
            </p>

            {/* Instructions */}
            <div className="space-y-4 text-left bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#254F22] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <p className="text-gray-600 text-sm pt-1">
                  Open your phone's camera app
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#254F22] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <p className="text-gray-600 text-sm pt-1">
                  Point it at the QR code on your table
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#254F22] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <p className="text-gray-600 text-sm pt-1">
                  Tap the notification to open the menu
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4"
              >
                <motion.div
                  className="h-10 w-10 border-4 border-[#254F22] border-t-transparent rounded-full mx-auto mb-3"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <p className="text-gray-600">
                  {scannedTable
                    ? `Validating Table ${scannedTable}...`
                    : "Processing..."}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Help Text */}
          <motion.p
            className="text-center text-gray-500 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Can't find the QR code? Ask a staff member for assistance.
          </motion.p>
        </div>
      </section>
    </div>
  );
};

export default ScanTable;

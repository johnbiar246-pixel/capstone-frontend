import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdArrowBack,
  MdQrCodeScanner,
  MdError,
  MdCameraswitch,
} from "react-icons/md";
import { Scanner } from "@yudiel/react-qr-scanner";
import { getTableByNumber } from "../../api/tables";
import Navbar from "../../components/navbar/Navbar";

const ScanTable = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scannedTable, setScannedTable] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [cameraError, setCameraError] = useState("");

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
        // Valid table - navigate to menu with table number to place order
        navigate(`/menu?table=${number}`);
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

  const handleScan = async (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0 && scanning && !loading) {
      const rawValue = detectedCodes[0].rawValue;

      // Stop scanning to prevent multiple scans
      setScanning(false);

      // Extract table number from QR code URL
      // Expected format: /scan-table?table=123 or just the table number
      let tableNumber = null;

      try {
        // Try to parse as URL
        if (rawValue.includes("?table=")) {
          const url = new URL(rawValue);
          tableNumber = url.searchParams.get("table");
        } else if (rawValue.includes("/scan-table")) {
          // Extract from path
          const match = rawValue.match(/[?&]table=(\d+)/);
          if (match) {
            tableNumber = match[1];
          }
        } else {
          // Assume it's just the table number
          tableNumber = rawValue.trim();
        }

        if (tableNumber) {
          await validateAndNavigate(tableNumber);
        } else {
          setError("Invalid QR code. Please scan a valid table QR code.");
          setScanning(true);
        }
      } catch (err) {
        console.error("Error parsing QR code:", err);
        setError("Invalid QR code format. Please try again.");
        setScanning(true);
      }
    }
  };

  const handleError = (error) => {
    console.error("Camera error:", error);
    if (error?.name === "NotAllowedError") {
      setCameraError(
        "Camera access denied. Please allow camera access and try again.",
      );
    } else if (error?.name === "NotFoundError") {
      setCameraError(
        "No camera found. Please ensure your device has a camera.",
      );
    } else {
      setCameraError("Camera error. Please try again or use manual entry.");
    }
  };

  const retryScan = () => {
    setError("");
    setCameraError("");
    setScanning(true);
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

            {/* QR Scanner */}
            {scanning && !loading && !cameraError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6"
              >
                <div className="relative rounded-xl overflow-hidden border-2 border-[#254F22]">
                  <Scanner
                    onScan={handleScan}
                    onError={handleError}
                    styles={{
                      container: {
                        width: "100%",
                        height: "300px",
                      },
                      video: {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      },
                    }}
                    scanDelay={500}
                    allowMultiple={false}
                  />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-[#254F22]/30 rounded-xl">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#254F22] rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#254F22] rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#254F22] rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#254F22] rounded-br-lg"></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Point your camera at the QR code on your table
                </p>
              </motion.div>
            )}

            {/* Camera Error */}
            {cameraError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <MdError className="text-xl" />
                  <span className="font-semibold">Camera Error</span>
                </div>
                <p className="text-red-600 text-sm mb-3">{cameraError}</p>
                <button
                  onClick={retryScan}
                  className="w-full bg-[#254F22] text-white py-2 px-4 rounded-lg hover:bg-[#1f3f1c] transition text-sm font-medium"
                >
                  Try Again
                </button>
              </motion.div>
            )}

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

            {/* Retry button for errors */}
            {error && !loading && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={retryScan}
                className="w-full flex items-center justify-center gap-2 bg-[#254F22] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#1f3f1c] transition mb-4"
              >
                <MdCameraswitch className="text-lg" />
                Scan Again
              </motion.button>
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

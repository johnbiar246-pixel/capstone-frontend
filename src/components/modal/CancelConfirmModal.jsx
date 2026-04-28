import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdWarning } from 'react-icons/md';

const CancelConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  orderDetails,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-[65] flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <motion.div
          className="bg-gradient-to-b from-red-50 to-red-100 border-2 border-red-200 rounded-3xl shadow-2xl max-w-md w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/10 border-2 border-red-200 rounded-2xl flex items-center justify-center p-2">
                <MdWarning className="w-6 h-6 text-red-500" />
              </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900">Confirm Cancel</h2>
              <p className="text-red-700">Order #{orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-200 rounded-2xl transition-colors"
          >
            <MdClose className="w-6 h-6 text-red-600" />
          </button>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-8">
            <p className="text-lg text-red-900 font-semibold">
              Are you sure you want to cancel this order?
            </p>
            <div className="bg-white/50 p-4 rounded-2xl border border-red-200">
              <p className="text-sm text-red-800 font-medium mb-2">Items:</p>
              <p className="text-sm text-gray-700">{orderDetails}</p>
            </div>
            <p className="text-sm text-red-700">
              This action cannot be undone. The order will be marked as cancelled.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <motion.button
              onClick={onClose}
              className="flex-1 bg-white border-2 border-red-300 text-red-700 py-3 px-6 rounded-2xl font-semibold hover:bg-red-50 hover:border-red-400 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Yes, Cancel Order
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CancelConfirmModal;

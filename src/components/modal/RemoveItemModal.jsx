import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdDeleteForever, MdShoppingCart } from 'react-icons/md';

const RemoveItemModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 border border-gray-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white rounded-t-3xl relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-xl transition"
            >
              <MdClose className="text-xl" />
            </button>
            <div className="text-center">
              <MdDeleteForever className="text-6xl mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">Remove Item</h2>
              <p className="text-white/90 text-lg">Are you sure?</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <MdShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-800">
                {`"${itemName}" will be removed from your cart`}
              </p>
              <p className="text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 pt-4 bg-gray-50 rounded-b-3xl flex gap-3">
            <motion.button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Remove Item
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default RemoveItemModal;


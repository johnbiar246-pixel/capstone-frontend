import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCheckCircle, MdRadioButtonUnchecked, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

const ProductChecklist = ({ 
  orderItems, 
  orderId, 
  onItemComplete, 
  onRefetch,
  isExpanded, 
  toggleExpanded,
  allItemsCompleted 
}) => {
  const [localItems, setLocalItems] = React.useState(orderItems || []);
  const itemCount = localItems.reduce((sum, item) => sum + item.quantity, 0);
  const servedCount = localItems.reduce((sum, item) => sum + item.servedQuantity, 0);
  const unservedItems = localItems.filter(item => item.servedQuantity < item.quantity);

  React.useEffect(() => {
    setLocalItems(orderItems || []);
  }, [orderItems]);

  const handleCompleteItem = async (itemId) => {
    try {
      // Optimistic update
      setLocalItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, servedQuantity: item.quantity }
          : item
      ));
      
      await onItemComplete(orderId, itemId);
      
      // Refetch to sync with server
      if (onRefetch) onRefetch();
      
    } catch (error) {
      console.error('Failed to complete item:', error);
      // Revert optimistic update on error
      if (onRefetch) onRefetch();
    }
  };

  if (unservedItems.length === 0) return null;

  return (
    <div className="mt-3">
      {/* Checklist Header */}
      <motion.button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 hover:shadow-md transition-all"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <span className="text-lg font-bold text-orange-600">
              {servedCount}/{itemCount}
            </span>
          </div>
          <div>
            <p className="font-semibold text-orange-800 text-sm">
              Order Items Checklist
            </p>
            <p className="text-xs text-orange-600">
              {unservedItems.length === 0 ? 'All items served!' : `${unservedItems.reduce((sum, item) => sum + (item.quantity - item.servedQuantity), 0)} servings remaining`}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <MdKeyboardArrowUp className="w-5 h-5 text-orange-600" />
        ) : (
          <MdKeyboardArrowDown className="w-5 h-5 text-orange-600" />
        )}
      </motion.button>

      {/* Checklist Items - Only show unserved portions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2"
          >
            {unservedItems.map((item) => {
              const remainingQty = item.quantity - item.servedQuantity;
              if (remainingQty <= 0) return null;
              
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg border bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <motion.button
                        onClick={() => handleCompleteItem(item.id)}
                        className="p-1 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 hover:scale-110 transition-all flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MdRadioButtonUnchecked className="w-6 h-6" />
                      </motion.button>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-gray-900">
                          {item.product?.name || item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Quantity: {remainingQty} remaining (of {item.quantity})
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductChecklist;


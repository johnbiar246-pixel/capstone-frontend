import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdDownload, MdPrint, MdReceiptLong } from 'react-icons/md';
import jsPDF from 'jspdf';
import { getReceipt } from '../../api/orders';

const ReceiptModal = ({
  isOpen,
  onClose,
  orderId,
  onPrint,
}) => {
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && orderId) {
      fetchReceipt();
    }
  }, [isOpen, orderId]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await getReceipt(orderId);
      if (response.success) {
        setReceiptData(response.data);
      } else {
        setError('Failed to load receipt');
      }
    } catch (err) {
      setError('Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!receiptData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL RECEIPT', pageWidth / 2, 20, { align: 'center' });

    // Order Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let y = 40;
doc.text(`Order #${receiptData.orderNumber || receiptData.orderId}`, 20, y);
    y += 10;
    doc.text(`Date: ${receiptData.date}`, 20, y);
    y += 10;
    doc.text(`Table: ${receiptData.table}`, 20, y);
    y += 10;
    if (receiptData.customerType !== 'Regular') {
      doc.text(`Customer: ${receiptData.customerType}`, 20, y);
      y += 10;
    }

    // Items
    doc.text('Items:', 20, y);
    y += 10;
    doc.setFontSize(10);
    receiptData.items.forEach((item, index) => {
      doc.text(`${item.quantity}x ${item.name}`, 25, y);
      doc.text(`  ₱${item.total.toFixed(2)}`, 150, y);
      y += 7;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    // Pricing
    y += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 100, y, { align: 'right' });
    doc.text(`₱${receiptData.subtotal.toFixed(2)}`, 170, y);
    y += 8;
    if (receiptData.discount > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Discount:', 100, y, { align: 'right' });
      doc.text(`-₱${receiptData.discount.toFixed(2)}`, 170, y);
      y += 8;
    }
    doc.text('Service Charge:', 100, y, { align: 'right' });
    doc.text(`₱${receiptData.serviceCharge.toFixed(2)}`, 170, y);
    y += 10;

    // Total
    doc.setLineWidth(1);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 100, y, { align: 'right' });
    doc.text(`₱${receiptData.total.toFixed(2)}`, 170, y);

    y += 10;
    if (receiptData.tendered > 0) {
      doc.text('Tendered:', 100, y, { align: 'right' });
      doc.text(`₱${receiptData.tendered.toFixed(2)}`, 170, y);
      y += 8;
      doc.text('Change:', 100, y, { align: 'right' });
      doc.text(`₱${receiptData.change.toFixed(2)}`, 170, y);
      y += 15;
    }

    doc.text(`Cashier: ${receiptData.cashier}`, 20, y);
    doc.text('Thank you for dining with us!', pageWidth / 2, y + 10, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    y += 20;
    doc.text('Generated via Gulp Course', pageWidth / 2, y, { align: 'center' });

    return doc;
  };

  const downloadPDF = () => {
    const doc = generatePDF();
    if (doc) {
doc.save(`receipt-${receiptData?.orderNumber || receiptData?.orderId || orderId}.pdf`);
    }
  };

  const printPDF = () => {
    const doc = generatePDF();
    if (doc) {
      doc.autoPrint();
      doc.save('receipt-print.pdf'); // Fallback download
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <>
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 max-w-4xl w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white rounded-t-3xl relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-xl transition"
              >
                <MdClose className="text-2xl" />
              </button>
              <div className="text-center">
                <MdReceiptLong className="text-5xl mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Official Receipt</h2>
<p className="text-white/90">Order #{receiptData?.orderNumber || orderId}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full mx-auto animate-spin mb-4" />
                  <p>Generating receipt...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600">
                  <p className="text-lg font-semibold mb-4">{error}</p>
                  <button
                    onClick={fetchReceipt}
                    className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : receiptData ? (
                <>
                  {/* Receipt Preview */}
                  <div className="bg-gradient-to-b from-gray-50 to-white p-8 rounded-2xl border-4 border-dashed border-gray-200 max-h-96 overflow-y-auto">
                    <div className="max-w-sm mx-auto text-sm leading-relaxed">
                      <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">OFFICIAL RECEIPT</h1>
                        <p className="text-gray-600">Order #{receiptData.orderNumber || receiptData.orderId}</p>
                        <p className="text-gray-600">{receiptData.date}</p>
                        <p className="font-semibold mt-2">Table {receiptData.table}</p>
                      </div>

                      {/* Items */}
                      <div className="mb-6">
                        {receiptData.items.map((item) => (
                          <div key={item.name} className="flex justify-between mb-1">
                            <span>{item.quantity}x {item.name}</span>
                            <span>₱{item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between font-semibold">
                          <span>Subtotal:</span>
                          <span>₱{receiptData.subtotal.toFixed(2)}</span>
                        </div>
                        {receiptData.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount (20% food):</span>
                            <span>-₱{receiptData.discount.toFixed(2)}</span>
                          </div>
                        )}
                        {receiptData.foodSubtotal > 0 && receiptData.nonFoodSubtotal > 0 && (
                          <div className="flex justify-between text-gray-600 text-xs">
                            <span>Food: ₱{receiptData.foodSubtotal.toFixed(2)}</span>
                            <span>Non-Food: ₱{receiptData.nonFoodSubtotal.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold">
                          <span>Service Charge:</span>
                          <span>₱{receiptData.serviceCharge.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-xl font-bold text-emerald-700">
                            <span>TOTAL:</span>
                            <span>₱{receiptData.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {receiptData.tendered > 0 && (
                        <div className="space-y-1 mb-6">
                          <div className="flex justify-between">
                            <span>Tendered:</span>
                            <span>₱{receiptData.tendered.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-emerald-600 text-lg">
                            <span>CHANGE:</span>
                            <span>₱{receiptData.change.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
                        <p>Cashier: {receiptData.cashier}</p>
                        <p className="mt-2">Thank you for dining with us!</p>
                        <p className="font-semibold mt-4">Gulp Course</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 bg-gray-50 rounded-b-3xl px-4 pb-4">
                    <motion.button
                      onClick={downloadPDF}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MdDownload className="text-xl" />
                      Download PDF
                    </motion.button>
                    <motion.button
                      onClick={printPDF}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MdPrint className="text-xl" />
                      Print Receipt
                    </motion.button>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default ReceiptModal;


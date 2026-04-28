# Orders Component TODO - BLACKBOXAI Task

## Approved Plan Steps (Confirmed: Add 10% service charge fix)

### 1. [ ] Update Orders.jsx
- Import ReceiptModal
- Add state for showReceiptModal and selectedReceiptOrderId
- Add handleShowReceipt(orderId) function
- In handleUnifiedConfirm/handleTenderConfirm success: setShowReceiptModal(true), selectedReceiptOrderId
- Add useEffect polling: fetchOrders every 10s
- Add <ReceiptModal isOpen={showReceiptModal} orderId={selectedReceiptOrderId} onClose={()=>{setShowReceiptModal(false); setSelectedReceiptOrderId(null);}} />

### 2. [ ] Fix Calculations in UnifiedPaymentModal.jsx
- Service charge: 10% of **subtotal** (all items), not just foodSubtotal
- Keep discount: 20% on foodSubtotal only for PWD/SENIOR
- Update calculateBreakdown function
- Ensure total = subtotal + serviceCharge - discount

### 3. [ ] Test Changes
- Place test order via menu
- Go to /user/orders
- Accept payment → verify ReceiptModal shows, order moves to preparing in upcoming, polling refreshes
- Verify calcs: subtotal ₱100 food + ₱50 drink → service ₱15 (15% subtotal), PWD discount ₱20 food → total ₱95

### 4. [ ] Completion
- attempt_completion


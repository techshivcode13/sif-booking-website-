# ⚠️ IMPORTANT: Revert Prices Before Production!

## Current Status: TESTING MODE (₹1 prices)

All room prices are currently set to **₹1 for testing purposes only**.

---

## Original Prices (Production Values)

```javascript
const ROOM_PRICES = {
    'Standard Room': 2500,
    'Shared Dormitory': 2200,
    '4 Beds Room': 2500,
    '10 Beds Room': 2200,
    'Advance Standard Booking': 1000,
    'Advance Dormitory Booking': 600
};
```

---

## Files to Update When Going Live

### 1. [`booking.js`](file:///C:/Users/VICTUS/OneDrive/Desktop/registration%20sif%20web%20site/booking.js)
**Line 9-17**: Update `ROOM_PRICES` object

### 2. [`booking.html`](file:///C:/Users/VICTUS/OneDrive/Desktop/registration%20sif%20web%20site/booking.html)
**Line 326-335**: Update embedded `ROOM_PRICES` object
**Line 45**: Change `₹1` to `₹2,500` and "Testing Price" to "Starting from"
**Line 73**: Change `₹1` to `₹2,200` and "Testing Price" to "Starting from"
**Line 101**: Change `₹1` to `₹1,000` and "Testing Price" to "Advance Payment"
**Line 127**: Change `₹1` to `₹600` and "Testing Price" to "Advance Payment"

### 3. [`netlify/functions/create-payment.js`](file:///C:/Users/VICTUS/OneDrive/Desktop/registration%20sif%20web%20site/netlify/functions/create-payment.js)
**Line 49-59**: Update `VALID_PRICES` object

---

## Quick Revert Commands

Search for this comment in all files:
```
⚠️ TESTING PRICES - REVERT BEFORE PRODUCTION!
```

Then restore the original prices shown in the comments.

---

## After Testing is Complete

1. ✅ Verify email receipt system works
2. ✅ Update all 3 files listed above with original prices
3. ✅ Remove "Testing Price" labels
4. ✅ Deploy to production
5. ✅ Delete this file (REVERT_PRICES.md)

---

**Last Updated**: 2026-02-03 (Testing Mode Active)

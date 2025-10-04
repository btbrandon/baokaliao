# BoLui - New Features Guide

## Recent Updates

We've added several powerful features to make expense tracking more comprehensive and user-friendly:

---

## 🔁 Recurring Expenses

Automatically track monthly bills and subscriptions.

### How to Use:

1. Click "Add Expense"
2. Fill in the basic details
3. Click "Advanced Options"
4. Check "Recurring Expense"
5. Select the day of the month it repeats (1-31)

**Example:** Set rent payment to recur on day 1 of each month.

---

## 📸 Receipt Scanning

Attach receipt images to your expenses for better record-keeping.

### How to Use:

1. In the Add/Edit Expense dialog
2. Click "Advanced Options"
3. Click "Upload Receipt"
4. Select an image file (max 5MB)
5. Preview appears - click X to remove if needed

**Supported formats:** JPEG, PNG, GIF, WebP

---

## 🔍 Search & Filter

Quickly find specific expenses with powerful filtering.

### Available Filters:

- **Search:** Find by description or category
- **Category:** Filter by specific category
- **Amount Range:** Min/Max amount filters
- **Type:** Show only recurring or one-time expenses

### How to Use:

1. Look for the search bar above expense list
2. Type to search instantly
3. Click filter icon for advanced filters
4. Active filter count shown on filter button
5. Click "Clear Filters" to reset

---

## 🌙 Dark Mode

Easy on the eyes for nighttime budgeting.

### How to Toggle:

- Click the sun/moon icon in the top-right of the navigation bar
- Setting is saved and persists across sessions

---

## 💰 Savings Rate

Track how much of your income you're actually saving.

### What It Shows:

- **Percentage Saved:** (Income - Expenses) / Income × 100
- **Color-coded status:**
  - 🟢 Green: 20%+ (Excellent!)
  - 🟠 Orange: 10-20% (Good)
  - 🔴 Red: <10% (Needs improvement)
- **Breakdown:** Income vs Spent comparison

### Tips:

- Aim for at least 20% savings rate
- Appears below budget cards when budget is set
- Updates automatically as you add expenses

---

## 📱 Mobile-Friendly Design

### Responsive Features:

- **Adaptive layouts:** Cards stack on mobile, grid on desktop
- **Touch-friendly:** Larger tap targets for mobile users
- **Optimized text:** Readable font sizes on all screens
- **Collapsible filters:** Save screen space on mobile
- **Floating action button:** Quick "Add Expense" on mobile

### Best Practices:

- Use landscape mode for better chart viewing
- Pinch to zoom on pie charts if needed
- Right-click (long-press on mobile) for expense context menu

---

## 📝 Additional Notes Field

Add extra context to your expenses.

### How to Use:

1. Click "Advanced Options" in expense dialog
2. Type notes in the "Notes" field
3. Use for:
   - Why the expense was necessary
   - Who was with you
   - Event or occasion details
   - Tax-deductible notes

---

## Database Updates

The following fields have been added to expenses:

- `notes` (text, optional)
- `receipt_url` (text, optional)
- `is_recurring` (boolean, default: false)
- `recurring_day` (integer, 1-31, optional)

**Note:** Run Prisma migration to update your database schema:

```bash
npx prisma migrate dev --name add_expense_features
```

---

## Coming Soon

Future enhancements we're considering:

- Expense analytics dashboard
- Budget recommendations based on spending patterns
- Export to CSV/PDF
- Expense categories with custom icons
- Multi-currency support
- Shared budgets for families

---

## Support

If you encounter any issues or have feature requests, please:

1. Check the console for error messages
2. Ensure your database is up-to-date
3. Clear browser cache if styles look broken
4. Contact support with screenshots

Happy budgeting! 💸

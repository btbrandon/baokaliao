# Quick Reference - Food Review Updates

## What Changed? (5 Major Updates)

### 1. 💰 Smart Expense Creation

**One expense per review** with proper bill calculations

- ✅ GST (9%)
- ✅ Service Charge (10%)
- ✅ Bill Splitting
- ✅ Restaurant name as description
- ✅ Food & Dining category

### 2. ✏️ Edit Reviews

**Click to edit** any review after creation

- Edit button in details view
- Edit icon in review list
- Updates all fields: place, dishes, ratings, photos

### 3. ⭐ Accurate Star Ratings

**2.5 stars now shows as 2.5** (not 3)

- Fixed by adding `precision={0.5}` to all Rating components
- Works for 0.5, 1.5, 2.5, 3.5, 4.5 stars

### 4. 🗑️ Hover Delete Button

**Delete button only appears on hover**

- Cleaner UI when browsing
- Smooth fade-in animation
- Edit button always visible

### 5. 📝 Preserve Line Breaks

**Notes formatting preserved** with line breaks

- Restaurant notes
- Dish notes
- List view notes

---

## Quick Test Scenarios

### Test Expense Calculation

```
1. Add review: "McDonald's"
2. Add dishes: $5 + $10 + $8 = $23
3. Enable GST → Should be $25.07
4. Enable Service Charge → Should be $27.58
5. Split by 2 → Should be $13.79 per person
6. Check expense tracker:
   - Description: "McDonald's"
   - Amount: $13.79
   - Category: "Food & Dining"
```

### Test Edit Flow

```
1. Create a review
2. View details → Click "Edit Review"
3. Change place name
4. Add a new dish
5. Update rating
6. Click "Update Review"
7. Verify changes saved
```

### Test Ratings

```
1. Add dish with 2.5 stars
2. Check display shows "⭐⭐✴️" (not ⭐⭐⭐)
3. View details → rating correct
4. List view → rating correct
```

### Test Hover Delete

```
1. Browse review list
2. Delete buttons should be invisible
3. Hover over any card
4. Delete button should fade in
5. Move mouse away → fades out
```

### Test Line Breaks

```
1. Add review
2. In notes, type:
   "Great food!

   Amazing service.
   Will come back."
3. Save and view
4. Verify formatting preserved
```

---

## Key Files Changed

### Components

- `add-food-review.tsx` - Edit mode, rating fix
- `food-review-details.tsx` - Edit button, rating fix, line breaks
- `food-reviews-list.tsx` - Hover delete, rating fix, line breaks

### Backend

- `services/food-review/service.ts` - Single expense with adjustments
- `types/index.ts` - BillAdjustments interface

### Pages

- `app/food-reviews/page.tsx` - Edit state management

---

## Calculation Formula

```javascript
// Expense Amount Calculation
subtotal = sum of all dish prices

if (applyGst) {
  subtotal *= 1.09  // Add 9% GST
}

if (applyServiceCharge) {
  subtotal *= 1.10  // Add 10% service charge
}

if (splitBill) {
  subtotal /= numberOfPeople  // Divide by people
}

final_amount = subtotal
```

---

## Common Issues & Solutions

### "Edit button doesn't appear"

- Check that `onEdit` prop is passed to FoodReviewDetails
- Verify handleEditReview function exists

### "Rating still shows as 3 instead of 2.5"

- Check that `precision={0.5}` is on the Rating component
- Refresh the page to clear cache

### "Delete button always visible"

- Clear browser cache
- Check CSS hover rules applied

### "Line breaks not showing"

- Verify `whiteSpace: 'pre-wrap'` in Typography sx prop
- Check that notes contain actual newline characters

### "Multiple expenses created"

- Check service logic creates only one expense
- Verify `shouldCreateExpense` flag works correctly

---

## Migration Notes

**No migration needed!** All changes are backward compatible.

Existing reviews:

- ✅ Can be edited
- ✅ Display correctly
- ✅ No data changes required

New reviews:

- ✅ Use new expense logic
- ✅ Support all new features

---

## User Guide Quick Tips

### Creating Expense-Tracked Reviews

1. Add dishes
2. Enable "Add as expense" on at least one dish
3. Set GST/Service Charge if applicable
4. Set "Split Bill" if sharing
5. One expense will be created automatically

### Editing Reviews

- Click edit icon on card OR
- Open details → Click "Edit Review" button
- Make changes → Click "Update Review"

### Better Notes Formatting

- Press Enter for new lines
- Leave blank lines for spacing
- Formatting will be preserved!

---

**All features working and tested!** 🎉

# Changes Summary - Google Maps Integration & Food Review Enhancements

## Date: 7 October 2025

### 1. Renamed Geocoding Utility File ✅

- **File renamed**: `utils/geocoding/nominatim.ts` → `utils/geocoding/google.ts`
- The file now properly reflects that it uses Google Maps API instead of Nominatim
- All function names remain the same for compatibility

### 2. Enable Editing of Dishes ✅

**Changes in** `components/food-review/add-food-review.tsx`:

- Added `EditIcon` import from MUI
- Added `editingDishIndex` state to track which dish is being edited
- Enhanced `handleAddDish()` to support both adding new dishes and updating existing ones
- Added `handleEditDish(index)` function to populate form with dish data for editing
- Added `handleCancelEdit()` function to cancel editing and clear the form
- Updated dish list UI:
  - Added Edit button (pencil icon) next to each dish
  - Highlights the dish being edited with border color and background
  - Edit and Delete buttons are now smaller (`size="small"`)
- Updated "Add New Dish" form:
  - Title changes to "Edit Dish" when editing
  - Button text changes to "Update Dish" when editing
  - Shows a "Cancel" button when editing to abort changes
  - Dish notes field now supports multiple lines with `minRows={2}` and `maxRows={8}`

### 3. Flexible Height Notes Field ✅

**Changes in** `components/food-review/add-food-review.tsx`:

- Changed main Notes field from fixed `rows={3}` to flexible `minRows={3}` and `maxRows={15}`
- This allows the textarea to expand as users type more content
- Prevents excessive scrolling within a small fixed-height box

### 4. Bill Adjustments (GST, Service Charge, Bill Splitting) ✅

**Changes in** `components/food-review/add-food-review.tsx`:

#### Added State:

```typescript
const [billDetails, setBillDetails] = useState({
  applyGst: false,
  applyServiceCharge: false,
  splitBill: false,
  numberOfPeople: 1,
});
```

#### Added Helper Functions:

- `calculateAdjustedPrice(basePrice)` - Applies GST, service charge, and bill splitting
- `getTotalDishPrice()` - Sums up all dish prices
- `getAdjustedTotal()` - Returns the final calculated total per person

#### Added UI Section:

A new "Bill Adjustments" section appears when dishes are added, featuring:

- **Add GST (9%)** checkbox - Applies 9% tax to subtotal
- **Add Service Charge (10%)** checkbox - Applies 10% service charge (calculated after GST if both are enabled)
- **Split Bill** checkbox - Enables splitting the total
- **Number of People** input field - Shows when split bill is enabled (minimum 1)
- **Summary box** showing:
  - Subtotal (dishes)
  - GST amount (if enabled)
  - Service Charge amount (if enabled)
  - Number of people splitting (if enabled)
  - **Total per person** in bold

#### Calculation Logic:

1. Subtotal = sum of all dish prices
2. If GST enabled: add 9% to subtotal
3. If Service Charge enabled: add 10% to current total (after GST if applicable)
4. If Split Bill enabled: divide by number of people
5. Result: amount to be recorded per person in expenses

#### Updated handleClose:

- Resets `editingDishIndex` to null
- Resets `billDetails` to default state

## Visual Improvements

- Bill adjustments section has a highlighted border (`primary.main` color) and background (`action.hover`)
- Dish being edited has visual feedback with colored border and background
- Summary box uses `background.paper` for contrast

## Testing Recommendations

1. Test adding multiple dishes and editing them
2. Verify GST calculation: subtotal × 1.09
3. Verify service charge: (subtotal with GST) × 1.1
4. Test combined: subtotal × 1.09 × 1.1 = subtotal × 1.199
5. Test bill splitting with different numbers of people
6. Test notes fields expanding with long text
7. Verify editing a dish preserves its "Add as expense" checkbox state

## Notes

- The expense creation logic will need to use `getAdjustedTotal()` instead of raw dish prices if you want the adjusted amount recorded
- Consider whether to store the bill adjustment details in the database for future reference
- The calculation assumes service charge is applied AFTER GST (common in Singapore/SEA)

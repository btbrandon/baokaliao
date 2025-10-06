# Food Review Form - New Features Guide

## 1. Editing Dishes

Previously, you could only add and delete dishes. Now you can edit them!

### How to Edit a Dish:

1. Click the **pencil icon** (✏️) next to any dish in your list
2. The dish form below will populate with that dish's data
3. The form title changes to "Edit Dish"
4. Make your changes
5. Click "Update Dish" to save, or "Cancel" to abort

### Visual Feedback:

- The dish being edited gets a **blue border** and **highlighted background**
- The form shows a "Cancel" button when editing

---

## 2. Flexible Notes Fields

Both the main review notes and individual dish notes now expand as you type!

### Main Review Notes:

- Starts at 3 rows
- Expands up to 15 rows as you type
- No more scrolling in a tiny box

### Dish Notes:

- Starts at 2 rows
- Expands up to 8 rows
- Perfect for detailed dish descriptions

---

## 3. Bill Adjustments

A new section appears automatically when you add dishes!

### Features:

- **Add GST (9%)** - Singapore tax
- **Add Service Charge (10%)** - Restaurant service charge
- **Split Bill** - Divide total among multiple people

### Example Calculation:

```
2 dishes: $20 + $15 = $35 subtotal
✓ Add GST (9%): $35 × 1.09 = $38.15
✓ Add Service Charge (10%): $38.15 × 1.10 = $41.97
✓ Split by 2 people: $41.97 ÷ 2 = $20.98 per person
```

### Real-time Summary:

The form shows:

- Subtotal (all dishes)
- GST amount (if enabled)
- Service charge amount (if enabled)
- Number of people (if splitting)
- **Total per person** (in bold)

---

## 4. Renamed Geocoding File

Behind the scenes: `nominatim.ts` → `google.ts`

- Now uses Google Maps API instead of OpenStreetMap
- Better search results and place data
- API key stored securely on server

---

## Usage Tips

### Adding Multiple Dishes with Adjustments:

1. Add all your dishes first
2. Then enable GST/Service Charge if applicable
3. Enable "Split Bill" if sharing with friends
4. The expense will be created with the adjusted amount per person

### Editing Workflow:

- Add dishes quickly without worrying about mistakes
- Click edit to fix any errors
- The form remembers whether to add as expense

### Notes Best Practices:

- Use main notes for overall restaurant experience
- Use dish notes for specific dish feedback
- Both expand automatically so write as much as you need

---

## Coming Soon (Possible Future Enhancements)

- Save bill adjustment preferences
- Show per-dish adjusted prices
- Export bill breakdown
- Link expenses directly from review

'use client';

import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  Collapse,
} from '@mui/material';
import { MdUpload, MdClose, MdImage, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { useStores } from '@/stores';

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddExpense = observer(({ open, onClose }: AddExpenseDialogProps) => {
  const { expensesStore, categoriesStore } = useStores();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState('1');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || !description || !category) {
      setError('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const expenseDate = date || new Date().toISOString().split('T')[0];

      // Upload receipt if provided
      let receiptUrl = null;
      if (receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          receiptUrl = uploadData.url;
        }
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountNum,
          description,
          category,
          date: expenseDate,
          notes: notes || null,
          isRecurring,
          recurringDay: isRecurring ? parseInt(recurringDay) : null,
          receiptUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to add expense');
        return;
      }

      const data = await response.json();
      expensesStore.addExpense(data);
      handleClose();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsRecurring(false);
    setRecurringDay('1');
    setReceiptFile(null);
    setReceiptPreview(null);
    setShowAdvanced(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>Add New Expense</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
              placeholder="What did you spend on?"
            />
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              fullWidth
              inputProps={{ step: '0.01', min: '0' }}
              placeholder="0.00"
            />
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              fullWidth
            >
              {categoriesStore.categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date (Optional)"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Leave empty to use today's date"
            />

            {/* Advanced Options Toggle */}
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              startIcon={showAdvanced ? <MdExpandLess /> : <MdExpandMore />}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              Advanced Options
            </Button>

            <Collapse in={showAdvanced}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Recurring Expense */}
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                      />
                    }
                    label="Recurring Expense"
                  />
                  {isRecurring && (
                    <TextField
                      select
                      label="Repeat on day of month"
                      value={recurringDay}
                      onChange={(e) => setRecurringDay(e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <MenuItem key={day} value={day.toString()}>
                          Day {day}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Box>

                {/* Notes */}
                <TextField
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add any additional details..."
                />

                {/* Receipt Upload */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Receipt (Optional)
                  </Typography>
                  {!receiptPreview ? (
                    <Button variant="outlined" component="label" startIcon={<MdUpload />} fullWidth>
                      Upload Receipt
                      <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </Button>
                  ) : (
                    <Box
                      sx={{
                        position: 'relative',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={removeReceipt}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <MdClose />
                      </IconButton>
                      <Box
                        component="img"
                        src={receiptPreview}
                        alt="Receipt preview"
                        sx={{
                          width: '100%',
                          maxHeight: 200,
                          objectFit: 'contain',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Max file size: 5MB
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

export default AddExpense;

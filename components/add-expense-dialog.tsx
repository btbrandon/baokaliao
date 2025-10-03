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
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { useStores } from '@/stores';

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddExpenseDialog = observer(({ open, onClose }: AddExpenseDialogProps) => {
  const supabase = createClient();
  const { userStore, expensesStore, categoriesStore } = useStores();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: userStore.user?.id,
            amount: amountNum,
            description,
            category,
            date,
          },
        ])
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
      } else if (data) {
        expensesStore.addExpense(data);
        handleClose();
      }
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
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
              placeholder="What did you spend on?"
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
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
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

export default AddExpenseDialog;

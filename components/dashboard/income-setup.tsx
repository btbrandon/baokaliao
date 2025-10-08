'use client';

import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { useStores } from '@/stores';

interface IncomeSetupDialogProps {
  open: boolean;
  onClose: () => void;
}

const IncomeSetup = observer(({ open, onClose }: IncomeSetupDialogProps) => {
  const { budgetStore } = useStores();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budgetStore.budget) {
      setMonthlyIncome(budgetStore.budget.monthly_income.toString());
    }
  }, [budgetStore.budget, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      setError('Please enter a valid monthly income');
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const income = parseFloat(monthlyIncome);

      // If budget exists, update it; otherwise create a new one with default percentages
      const response = await fetch('/api/budget', {
        method: budgetStore.budget ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month,
          year,
          monthly_income: income,
          expenses_percentage: budgetStore.budget?.expenses_percentage || 50,
          investments_percentage: budgetStore.budget?.investments_percentage || 20,
          savings_percentage: budgetStore.budget?.savings_percentage || 20,
          other_percentage: budgetStore.budget?.other_percentage || 10,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to save income');
        return;
      }

      const data = await response.json();
      budgetStore.setBudget(data);
      onClose();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', py: 2 }}>
          {budgetStore.budget ? 'Update Monthly Income' : 'Set Monthly Income'}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 1 }}>
            <TextField
              label="Monthly Income / Salary"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              required
              fullWidth
              autoFocus
              inputProps={{ step: '0.01', min: '0' }}
              placeholder="0.00"
              helperText="Enter your total monthly income"
              sx={{
                '& input[type=number]': {
                  MozAppearance: 'textfield',
                },
                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                  {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save Income'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

export default IncomeSetup;

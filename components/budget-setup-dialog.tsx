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
  Typography,
  Paper,
  Stack,
  LinearProgress,
} from '@mui/material';
import { useStores } from '@/stores';

interface BudgetSetupDialogProps {
  open: boolean;
  onClose: () => void;
}

const BudgetSetupDialog = observer(({ open, onClose }: BudgetSetupDialogProps) => {
  const { budgetStore } = useStores();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [expensesAmount, setExpensesAmount] = useState('');
  const [investmentsAmount, setInvestmentsAmount] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');
  const [otherAmount, setOtherAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budgetStore.budget) {
      const income = budgetStore.budget.monthly_income;
      setMonthlyIncome(income.toString());
      setExpensesAmount(((income * budgetStore.budget.expenses_percentage) / 100).toFixed(2));
      setInvestmentsAmount(((income * budgetStore.budget.investments_percentage) / 100).toFixed(2));
      setSavingsAmount(((income * budgetStore.budget.savings_percentage) / 100).toFixed(2));
      setOtherAmount(((income * budgetStore.budget.other_percentage) / 100).toFixed(2));
    }
  }, [budgetStore.budget]);

  const income = parseFloat(monthlyIncome) || 0;
  const expenses = parseFloat(expensesAmount) || 0;
  const investments = parseFloat(investmentsAmount) || 0;
  const savings = parseFloat(savingsAmount) || 0;
  const other = parseFloat(otherAmount) || 0;

  const totalAmount = expenses + investments + savings + other;
  const remaining = income - totalAmount;
  const isValid = income > 0 && Math.abs(remaining) < 0.01; // Allow for small floating point errors

  const calculatePercentage = (amount: number) => {
    if (income === 0) return 0;
    return (amount / income) * 100;
  };

  const expensesPercentage = calculatePercentage(expenses);
  const investmentsPercentage = calculatePercentage(investments);
  const savingsPercentage = calculatePercentage(savings);
  const otherPercentage = calculatePercentage(other);
  const totalPercentage =
    expensesPercentage + investmentsPercentage + savingsPercentage + otherPercentage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      setError('Please enter a valid monthly income');
      return;
    }

    if (!isValid) {
      setError('Please allocate your entire monthly income across all categories');
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const response = await fetch('/api/budget', {
        method: budgetStore.budget ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month,
          year,
          monthly_income: parseFloat(monthlyIncome),
          expenses_percentage: Math.round(expensesPercentage * 100) / 100,
          investments_percentage: Math.round(investmentsPercentage * 100) / 100,
          savings_percentage: Math.round(savingsPercentage * 100) / 100,
          other_percentage: Math.round(otherPercentage * 100) / 100,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to save budget');
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', py: 2 }}>
          {budgetStore.budget ? 'Update Budget' : 'Set Up Monthly Budget'}
        </DialogTitle>
        <DialogContent sx={{ py: 2, maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3, mt: 2 }}>
            <TextField
              label="Monthly Income / Salary"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              required
              fullWidth
              size="small"
              inputProps={{ step: '0.01', min: '0' }}
              placeholder="0.00"
            />
          </Box>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
            Allocate Your Income
          </Typography>

          <Stack spacing={1.5}>
            {/* Expenses */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: 'transparent',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', transform: 'translateX(4px)' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Expenses
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {expensesPercentage.toFixed(1)}%
                </Typography>
              </Box>
              <TextField
                type="number"
                value={expensesAmount}
                onChange={(e) => setExpensesAmount(e.target.value)}
                fullWidth
                inputProps={{ step: '0.01', min: '0' }}
                placeholder="0.00"
                size="small"
              />
            </Paper>

            {/* Investments */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: 'transparent',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', transform: 'translateX(4px)' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Investments
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {investmentsPercentage.toFixed(1)}%
                </Typography>
              </Box>
              <TextField
                type="number"
                value={investmentsAmount}
                onChange={(e) => setInvestmentsAmount(e.target.value)}
                fullWidth
                inputProps={{ step: '0.01', min: '0' }}
                placeholder="0.00"
                size="small"
              />
            </Paper>

            {/* Savings */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: 'transparent',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', transform: 'translateX(4px)' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Savings
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {savingsPercentage.toFixed(1)}%
                </Typography>
              </Box>
              <TextField
                type="number"
                value={savingsAmount}
                onChange={(e) => setSavingsAmount(e.target.value)}
                fullWidth
                inputProps={{ step: '0.01', min: '0' }}
                placeholder="0.00"
                size="small"
              />
            </Paper>

            {/* Other */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: 'transparent',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', transform: 'translateX(4px)' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Other
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {otherPercentage.toFixed(1)}%
                </Typography>
              </Box>
              <TextField
                type="number"
                value={otherAmount}
                onChange={(e) => setOtherAmount(e.target.value)}
                fullWidth
                inputProps={{ step: '0.01', min: '0' }}
                placeholder="0.00"
                size="small"
              />
            </Paper>
          </Stack>

          {/* Total Percentage Indicator */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: 'transparent',
              border: '2px solid',
              borderColor: isValid ? 'success.main' : 'error.main',
              borderRadius: 2,
              transition: 'all 0.3s',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Total Allocated
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color={isValid ? '#10b981' : '#ef4444'}
              >
                ${totalAmount.toFixed(2)} / ${income.toFixed(2)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={income > 0 ? Math.min((totalAmount / income) * 100, 100) : 0}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'action.disabledBackground',
                '& .MuiLinearProgress-bar': {
                  bgcolor: isValid ? 'success.main' : 'error.main',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {totalPercentage.toFixed(1)}% allocated
              </Typography>
              {remaining !== 0 && (
                <Typography variant="caption" color={remaining > 0 ? 'success.main' : 'error.main'}>
                  {remaining > 0
                    ? `$${remaining.toFixed(2)} remaining`
                    : `$${Math.abs(remaining).toFixed(2)} over budget`}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !isValid}>
            {loading ? 'Saving...' : budgetStore.budget ? 'Update Budget' : 'Set Budget'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

export default BudgetSetupDialog;

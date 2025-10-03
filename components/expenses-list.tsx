'use client';

import { observer } from 'mobx-react-lite';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useStores } from '@/stores';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

const ExpensesList = observer(() => {
  const { expensesStore, categoriesStore } = useStores();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (!error) {
      expensesStore.deleteExpense(id);
    }
  };

  if (expensesStore.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (expensesStore.expenses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No expenses yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click the &quot;Add Expense&quot; button to get started
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%' }}>
      {expensesStore.expenses.map((expense) => {
        const category = categoriesStore.getCategoryByName(expense.category);
        return (
          <ListItem
            key={expense.id}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            secondaryAction={
              <Box>
                <IconButton edge="end" onClick={() => handleDelete(expense.id)}>
                  <Delete />
                </IconButton>
              </Box>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: category?.color || 'primary.main' }}>
                {category?.icon || '💰'}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {expense.description}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    ${expense.amount.toFixed(2)}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                  <Chip
                    label={expense.category}
                    size="small"
                    sx={{
                      bgcolor: category?.color || 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(expense.date), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
});

export default ExpensesList;

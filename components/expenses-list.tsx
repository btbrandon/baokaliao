'use client';

import { observer } from 'mobx-react-lite';
import { useState, MouseEvent } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import { MdDelete, MdEdit, MdMoreVert } from 'react-icons/md';
import { useStores } from '@/stores';
import { format } from 'date-fns';
import { Expense } from '@/stores/expense/store';

interface ExpensesListProps {
  onEdit?: (expense: any) => void;
  expenses?: Expense[];
}

const ExpensesList = observer(({ onEdit, expenses }: ExpensesListProps = {}) => {
  const { expensesStore, categoriesStore } = useStores();
  const displayExpenses = expenses || expensesStore.filteredExpenses;
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    expense: any;
  } | null>(null);

  const handleContextMenu = (event: MouseEvent, expense: any) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            expense,
          }
        : null
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleEdit = () => {
    if (contextMenu && onEdit) {
      onEdit(contextMenu.expense);
    }
    handleClose();
  };

  const handleDelete = async (id: string) => {
    handleClose();
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        expensesStore.deleteExpense(id);
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  if (expensesStore.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (displayExpenses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No expenses found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click the &quot;Add Expense&quot; button to add expenses
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', p: 0 }}>
      {displayExpenses.map((expense) => {
        const category = categoriesStore.getCategoryByName(expense.category);
        return (
          <ListItem
            key={expense.id}
            onContextMenu={(e) => handleContextMenu(e, expense)}
            sx={{
              px: 2,
              py: 1,
              mb: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
                transform: 'translateX(4px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              {/* Category Icon */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: category?.color || 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                }}
              >
                {category?.icon || '💰'}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {expense.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 0.25, alignItems: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: category?.color || 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    >
                      {expense.category}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      • {format(new Date(expense.date), 'MMM d')}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    flexShrink: 0,
                    minWidth: 'fit-content',
                    color: 'text.primary',
                  }}
                >
                  ${expense.amount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </ListItem>
        );
      })}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
        slotProps={{
          paper: {
            sx: {
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 2,
              minWidth: 150,
            },
          },
        }}
      >
        {onEdit && (
          <MenuItem
            onClick={handleEdit}
            sx={{
              gap: 1.5,
              py: 1,
              px: 2,
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              },
            }}
          >
            <MdEdit size={18} />
            <Typography variant="body2">Edit</Typography>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (contextMenu) {
              handleDelete(contextMenu.expense.id);
            }
          }}
          sx={{
            gap: 1.5,
            py: 1,
            px: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'error.contrastText',
            },
          }}
        >
          <MdDelete size={18} />
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>
    </List>
  );
});

export default ExpensesList;

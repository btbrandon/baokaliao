'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  MdClose,
  MdCalendarToday,
  MdCategory,
  MdAttachMoney,
  MdRepeat,
  MdReceipt,
  MdNotes,
} from 'react-icons/md';
import { format } from 'date-fns';
import { Expense } from '@/stores/expense/store';

interface ExpenseDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
}

const ExpenseDetails = ({ open, onClose, expense }: ExpenseDetailsDialogProps) => {
  if (!expense) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: '1.25rem',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} sx={{ minWidth: 'auto', p: 0.5 }}>
          <MdClose size={24} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            pr: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {expense.description}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            ${expense.amount.toFixed(2)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Category */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MdCategory size={20} color="gray" />
            <Typography variant="subtitle2" color="text.secondary">
              Category
            </Typography>
          </Box>
          <Chip label={expense.category} color="primary" size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Date */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MdCalendarToday size={20} color="gray" />
            <Typography variant="subtitle2" color="text.secondary">
              Date
            </Typography>
          </Box>
          <Typography variant="body1">
            {format(new Date(expense.date), 'EEEE, MMMM d, yyyy')}
          </Typography>
        </Box>

        {/* Recurring */}
        {expense.is_recurring && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MdRepeat size={20} color="gray" />
                <Typography variant="subtitle2" color="text.secondary">
                  Recurring
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label="Recurring" color="info" size="small" />
                {expense.recurring_day && (
                  <Typography variant="body2" color="text.secondary">
                    • Day {expense.recurring_day} of each month
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        )}

        {/* Notes */}
        {expense.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MdNotes size={20} color="gray" />
                <Typography variant="subtitle2" color="text.secondary">
                  Notes
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {expense.notes}
              </Typography>
            </Box>
          </>
        )}

        {/* Receipt */}
        {expense.receipt_url && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MdReceipt size={20} color="gray" />
                <Typography variant="subtitle2" color="text.secondary">
                  Receipt
                </Typography>
              </Box>
              <Box
                component="img"
                src={expense.receipt_url}
                alt="Receipt"
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            </Box>
          </>
        )}

        {/* Created/Updated */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Created: {format(new Date(expense.created_at), 'MMM d, yyyy h:mm a')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetails;

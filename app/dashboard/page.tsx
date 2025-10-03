'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Fab,
  CircularProgress,
} from '@mui/material';
import { Add, AccountCircle, Logout, TrendingUp, TrendingDown, Receipt } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { useStores } from '@/stores';
import AddExpenseDialog from '@/components/add-expense-dialog';
import ExpensesList from '@/components/expenses-list';
import { format } from 'date-fns';

const DashboardPage = observer(() => {
  const router = useRouter();
  const supabase = createClient();
  const { userStore, expensesStore } = useStores();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async (userId: string) => {
      expensesStore.setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        expensesStore.setError(error.message);
      } else {
        expensesStore.setExpenses(data || []);
      }
      expensesStore.setLoading(false);
    };

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        userStore.setUser(user);
        await fetchExpenses(user.id);
      }
      setLoading(false);
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    userStore.clearUser();
    router.push('/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}
          >
            BoLui
          </Typography>
          <IconButton onClick={handleMenuOpen} size="large">
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {userStore.userEmail}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt sx={{ mr: 1 }} />
                <Typography variant="h6">Total Expenses</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                ${expensesStore.totalExpenses.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {expensesStore.expenses.length} transactions
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">This Month</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                $0.00
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Coming soon
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDown sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Categories</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {Object.keys(expensesStore.expensesByCategory).length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Active categories
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography variant="h5" fontWeight={600}>
                Recent Expenses
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddExpense(true)}
              >
                Add Expense
              </Button>
            </Box>
            <ExpensesList />
          </CardContent>
        </Card>
      </Container>

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={() => setOpenAddExpense(true)}
      >
        <Add />
      </Fab>

      <AddExpenseDialog open={openAddExpense} onClose={() => setOpenAddExpense(false)} />
    </Box>
  );
});

export default DashboardPage;

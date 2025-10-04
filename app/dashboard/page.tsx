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
import {
  MdAdd,
  MdAccountCircle,
  MdLogout,
  MdTrendingUp,
  MdTrendingDown,
  MdReceipt,
  MdSettings,
  MdDarkMode,
  MdLightMode,
} from 'react-icons/md';
import { createClient } from '@/lib/supabase/client';
import { useStores } from '@/stores';
import { useTheme as useCustomTheme } from '@/contexts/theme-context';
import AddExpenseDialog from '@/components/add-expense-dialog';
import EditExpenseDialog from '@/components/edit-expense-dialog';
import ExpensesList from '@/components/expenses-list';
import BudgetSetupDialog from '@/components/budget-setup-dialog';
import BudgetOverview from '@/components/budget-overview';
import MonthSelector from '@/components/month-selector';
import SavingsRateCard from '@/components/savings-rate-card';
import ExpenseFilters, { FilterState } from '@/components/expense-filters';
import { format } from 'date-fns';

const DashboardPage = observer(() => {
  const router = useRouter();
  const supabase = createClient();
  const { userStore, expensesStore, budgetStore } = useStores();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openEditExpense, setOpenEditExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [openBudgetSetup, setOpenBudgetSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    sortBy: 'date-desc',
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      expensesStore.setLoading(true);
      try {
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const data = await response.json();
          expensesStore.setExpenses(data || []);
        } else {
          expensesStore.setError('Failed to fetch expenses');
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
        expensesStore.setError('Failed to fetch expenses');
      }
      expensesStore.setLoading(false);
    };

    const fetchBudget = async () => {
      budgetStore.setLoading(true);
      budgetStore.setError(null); // Clear any previous errors
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const response = await fetch(`/api/budget?month=${month}&year=${year}`);
        if (response.ok) {
          const data = await response.json();
          budgetStore.setBudget(data);
        } else if (response.status === 404) {
          // Silently handle missing budget - this is expected
          budgetStore.setBudget(null);
        } else {
          console.error('Unexpected error fetching budget:', response.status);
          budgetStore.setError('Failed to fetch budget');
        }
      } catch (error) {
        console.error('Error fetching budget:', error);
        budgetStore.setError('Failed to fetch budget');
      }
      budgetStore.setLoading(false);
    };

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        userStore.setUser(user);
        await Promise.all([fetchExpenses(), fetchBudget()]);
      }
      setLoading(false);
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthChange = async (date: Date) => {
    expensesStore.setSelectedMonth(date);

    // Fetch budget for selected month
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    budgetStore.setLoading(true);
    budgetStore.setError(null); // Clear any previous errors
    try {
      const response = await fetch(`/api/budget?month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        budgetStore.setBudget(data);
      } else if (response.status === 404) {
        // Silently handle missing budget - this is expected behavior
        budgetStore.setBudget(null);
      } else {
        // Only log non-404 errors
        console.error('Unexpected error fetching budget:', response.status);
        budgetStore.setError('Failed to fetch budget');
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      budgetStore.setError('Failed to fetch budget');
    }
    budgetStore.setLoading(false);
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setOpenEditExpense(true);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const filteredExpenses = expensesStore.filteredExpenses
    .filter((expense) => {
      // Search query - searches across description, category, and type (recurring/one-time)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const description = expense.description.toLowerCase();
        const category = expense.category.toLowerCase();
        const type = expense.is_recurring ? 'recurring' : 'one-time';

        return description.includes(query) || category.includes(query) || type.includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      // Sorting logic
      switch (filters.sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'description-asc':
          return a.description.localeCompare(b.description);
        case 'description-desc':
          return b.description.localeCompare(a.description);
        default:
          return 0;
      }
    });

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
        sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}
          >
            BoLui
          </Typography>
          <IconButton onClick={toggleTheme} size="large" sx={{ mr: 1 }}>
            {isDarkMode ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
          </IconButton>
          <IconButton onClick={handleMenuOpen} size="large">
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <MdAccountCircle size={24} />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {userStore.userEmail}
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                setOpenBudgetSetup(true);
              }}
            >
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <MdSettings size={18} />
              </Box>
              Budget Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <MdLogout size={18} />
              </Box>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'flex-start' },
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
                sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}
              >
                Dashboard
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
              >
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>

            {/* Month Selector - Top Right */}
            <Box sx={{ width: { xs: '100%', md: 300 } }}>
              <MonthSelector
                selectedDate={expensesStore.selectedMonth}
                onDateChange={handleMonthChange}
              />
            </Box>
          </Box>

          {!budgetStore.budget && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<MdSettings />}
                onClick={() => setOpenBudgetSetup(true)}
                fullWidth
              >
                Set Up Budget
              </Button>
            </Box>
          )}
        </Box>

        {budgetStore.budget && (
          <Box sx={{ mb: 4 }}>
            <BudgetOverview />
          </Box>
        )}

        <Card>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Expenses
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(expensesStore.selectedMonth, 'MMMM yyyy')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<MdAdd />}
                onClick={() => setOpenAddExpense(true)}
                size="small"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Add Expense
              </Button>
            </Box>

            {/* Search and Filters */}
            <ExpenseFilters onFilterChange={handleFilterChange} />

            {/* Summary for selected month */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                mb: 2,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 1.5,
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Total Expenses ({filteredExpenses.length})
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                ${filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
              </Typography>
            </Box>

            <ExpensesList onEdit={handleEditExpense} expenses={filteredExpenses} />
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
        <MdAdd size={24} />
      </Fab>

      <AddExpenseDialog open={openAddExpense} onClose={() => setOpenAddExpense(false)} />
      <EditExpenseDialog
        open={openEditExpense}
        onClose={() => {
          setOpenEditExpense(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
      />
      <BudgetSetupDialog open={openBudgetSetup} onClose={() => setOpenBudgetSetup(false)} />
    </Box>
  );
});

export default DashboardPage;

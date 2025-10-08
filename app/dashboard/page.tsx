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
  Fab,
  CircularProgress,
} from '@mui/material';
import { MdAdd, MdSettings } from 'react-icons/md';
import { createClient } from '@/lib/supabase/client';
import { useStores } from '@/stores';
import { AppNavigation } from '@/components/app-navigation';
import AddExpense from '@/components/dashboard/add-expense';
import EditExpense from '@/components/dashboard/edit-expense';
import ExpenseDetails from '@/components/dashboard/expense-details';
import ExpensesList from '@/components/dashboard/expenses-list';
import BudgetSetup from '@/components/dashboard/budget-setup';
import IncomeSetup from '@/components/dashboard/income-setup';
import BudgetOverview from '@/components/dashboard/budget-overview';
import MonthSelector from '@/components/dashboard/month-selector';
import ExpenseFilters, { FilterState } from '@/components/dashboard/expense-filters';
import { format } from 'date-fns';
import { Expense } from '@/stores/expense/store';

const DashboardPage = observer(() => {
  const router = useRouter();
  const supabase = createClient();
  const { userStore, expensesStore, budgetStore } = useStores();
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openEditExpense, setOpenEditExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [openBudgetSetup, setOpenBudgetSetup] = useState(false);
  const [openIncomeSetup, setOpenIncomeSetup] = useState(false);
  const [openExpenseDetails, setOpenExpenseDetails] = useState(false);
  const [selectedExpenseForDetails, setSelectedExpenseForDetails] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    sortBy: 'date-desc',
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        userStore.setUser(user);

        // Fetch expenses (will use cache if already loaded)
        await expensesStore.fetchExpenses();

        // Fetch budget for current month (will use cache if already loaded)
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        await budgetStore.fetchBudget(month, year);
      }
      setLoading(false);
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthChange = async (date: Date) => {
    expensesStore.setSelectedMonth(date);

    // Fetch budget for selected month (will use cache if already loaded)
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    await budgetStore.fetchBudget(month, year);
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setOpenEditExpense(true);
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpenseForDetails(expense);
    setOpenExpenseDetails(true);
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
    // Clear all stores on logout
    userStore.clearUser();
    expensesStore.clear();
    budgetStore.clear();
    router.push('/login');
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppNavigation />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          mt: 8, // Account for fixed AppBar height
        }}
      >
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
                  onClick={() => setOpenIncomeSetup(true)}
                  fullWidth
                >
                  Set Up Budget
                </Button>
              </Box>
            )}
          </Box>

          {budgetStore.budget && (
            <Box sx={{ mb: 4 }}>
              <BudgetOverview
                onEditIncome={() => setOpenIncomeSetup(true)}
                onEditCategories={() => setOpenBudgetSetup(true)}
              />
            </Box>
          )}

          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
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

              <ExpensesList
                onEdit={handleEditExpense}
                expenses={filteredExpenses}
                onExpenseClick={handleExpenseClick}
              />
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

        <AddExpense open={openAddExpense} onClose={() => setOpenAddExpense(false)} />
        <EditExpense
          open={openEditExpense}
          onClose={() => {
            setOpenEditExpense(false);
            setSelectedExpense(null);
          }}
          expense={selectedExpense}
        />
        <ExpenseDetails
          open={openExpenseDetails}
          onClose={() => {
            setOpenExpenseDetails(false);
            setSelectedExpenseForDetails(null);
          }}
          expense={selectedExpenseForDetails}
        />
        <BudgetSetup open={openBudgetSetup} onClose={() => setOpenBudgetSetup(false)} />
        <IncomeSetup open={openIncomeSetup} onClose={() => setOpenIncomeSetup(false)} />
      </Box>
    </Box>
  );
});

export default DashboardPage;

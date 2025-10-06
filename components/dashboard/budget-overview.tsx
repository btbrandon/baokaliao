'use client';

import { observer } from 'mobx-react-lite';
import { Box, Card, CardContent, Typography, LinearProgress, IconButton } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useStores } from '@/stores';
import { MdAccountBalance, MdPieChart, MdShowChart, MdEdit } from 'react-icons/md';

interface BudgetOverviewProps {
  onEditIncome?: () => void;
  onEditCategories?: () => void;
}

const BudgetOverview = observer(({ onEditIncome, onEditCategories }: BudgetOverviewProps) => {
  const { budgetStore, expensesStore } = useStores();

  if (!budgetStore.budget) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        <Card
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
        >
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              💰 Budget Overview
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              No budget set for this month
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const currentMonthExpenses = expensesStore.totalExpenses;
  const expensesAllocation =
    (budgetStore.budget.monthly_income * budgetStore.budget.expenses_percentage) / 100;
  const expensesUsedPercentage = (currentMonthExpenses / expensesAllocation) * 100;

  // Define vibrant colors for each allocation category
  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  // Prepare data for pie chart
  const pieData = budgetStore.allocations.map((allocation, index) => {
    const amount = (budgetStore.budget!.monthly_income * allocation.percentage) / 100;
    return {
      id: index,
      value: allocation.percentage,
      label: `${allocation.category} (${allocation.percentage}%)`,
      color: colors[index % colors.length],
      amount: amount,
    };
  });

  const monthYearLabel = new Date(
    budgetStore.budget.year,
    budgetStore.budget.month - 1
  ).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* Card 1: Monthly Income */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          '&:hover .edit-button': {
            opacity: 1,
          },
        }}
      >
        <CardContent>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MdAccountBalance size={24} style={{ marginRight: 8 }} />
              <Typography variant="h6">Monthly Income</Typography>
            </Box>
            {onEditIncome && (
              <IconButton
                className="edit-button"
                onClick={onEditIncome}
                size="small"
                sx={{
                  color: 'white',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <MdEdit size={20} />
              </IconButton>
            )}
          </Box>
          <Typography variant="h3" fontWeight={700}>
            ${budgetStore.budget.monthly_income.toFixed(0)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            {monthYearLabel}
          </Typography>
        </CardContent>
      </Card>

      {/* Card 2: Budget Breakdown (Pie Chart) */}
      <Card
        sx={{
          position: 'relative',
          '&:hover .edit-button': {
            opacity: 1,
          },
        }}
      >
        <CardContent>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MdPieChart size={24} style={{ marginRight: 8 }} />
              <Typography variant="h6">Budget Breakdown</Typography>
            </Box>
            {onEditCategories && (
              <IconButton
                className="edit-button"
                onClick={onEditCategories}
                size="small"
                sx={{
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <MdEdit size={20} />
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: -1 }}>
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 25,
                  outerRadius: 60,
                  paddingAngle: 2,
                  cornerRadius: 3,
                  valueFormatter: (item) => {
                    const dataItem = pieData.find((d) => d.value === item.value);
                    return `$${dataItem?.amount.toFixed(2) || 0}`;
                  },
                },
              ]}
              width={240}
              height={180}
              margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Card 3: Budget Spent (Bar Chart) */}
      <Card
        sx={{
          background:
            expensesUsedPercentage > 100
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : expensesUsedPercentage > 80
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MdShowChart size={24} style={{ marginRight: 8 }} />
            <Typography variant="h6">Budget Spent</Typography>
          </Box>
          <Typography variant="h3" fontWeight={700}>
            {expensesUsedPercentage.toFixed(0)}%
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            ${currentMonthExpenses.toFixed(0)} of ${expensesAllocation.toFixed(0)}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={expensesUsedPercentage > 100 ? 100 : expensesUsedPercentage}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'white',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
});

export default BudgetOverview;

'use client';

import { Box, Typography, Paper, Select, MenuItem, FormControl } from '@mui/material';
import { isThisMonth } from 'date-fns';

interface MonthSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const MonthSelector = ({ selectedDate, onDateChange }: MonthSelectorProps) => {
  const currentDate = new Date();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handleMonthChange = (month: number) => {
    const newDate = new Date(selectedYear, month, 1);
    if (newDate <= currentDate) {
      onDateChange(newDate);
    }
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(year, selectedMonth, 1);
    // Don't allow future dates
    if (newDate <= currentDate) {
      onDateChange(newDate);
    }
  };

  const handleCurrentMonth = () => {
    onDateChange(new Date());
  };

  const isCurrentMonth = isThisMonth(selectedDate);

  // Generate year options (from 2020 to current year)
  const yearOptions = [];
  for (let year = 2020; year <= currentYear; year++) {
    yearOptions.push(year);
  }

  // Month names
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 1.5,
        bgcolor: isCurrentMonth ? 'primary.main' : 'background.paper',
        color: isCurrentMonth ? 'white' : 'text.primary',
        borderRadius: 2,
        border: '1px solid',
        borderColor: isCurrentMonth ? 'primary.main' : 'divider',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            sx={{
              color: isCurrentMonth ? 'white' : 'inherit',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isCurrentMonth ? 'rgba(255,255,255,0.5)' : 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isCurrentMonth ? 'white' : 'primary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: isCurrentMonth ? 'white' : 'primary.main',
              },
              '& .MuiSvgIcon-root': {
                color: isCurrentMonth ? 'white' : 'inherit',
              },
            }}
          >
            {monthNames.map((monthName, index) => {
              const isDisabled = selectedYear === currentYear && index > currentMonth;
              return (
                <MenuItem key={index} value={index} disabled={isDisabled}>
                  {monthName}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            sx={{
              color: isCurrentMonth ? 'white' : 'inherit',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isCurrentMonth ? 'rgba(255,255,255,0.5)' : 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isCurrentMonth ? 'white' : 'primary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: isCurrentMonth ? 'white' : 'primary.main',
              },
              '& .MuiSvgIcon-root': {
                color: isCurrentMonth ? 'white' : 'inherit',
              },
            }}
          >
            {yearOptions.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {!isCurrentMonth && (
        <Typography
          variant="caption"
          onClick={handleCurrentMonth}
          sx={{
            position: 'absolute',
            right: 16,
            cursor: 'pointer',
            textDecoration: 'underline',
            opacity: 0.8,
            whiteSpace: 'nowrap',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          Current Month
        </Typography>
      )}
    </Paper>
  );
};

export default MonthSelector;

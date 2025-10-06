'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import { MdSearch, MdSort } from 'react-icons/md';

interface ExpenseFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  searchQuery: string;
  sortBy:
    | 'date-desc'
    | 'date-asc'
    | 'amount-desc'
    | 'amount-asc'
    | 'description-asc'
    | 'description-desc';
}

const ExpenseFilters = ({ onFilterChange }: ExpenseFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    sortBy: 'date-desc',
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by description, category, or type (recurring/one-time)..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            label="Sort By"
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <MdSort />
              </InputAdornment>
            }
          >
            <MenuItem value="date-desc">Date (Newest First)</MenuItem>
            <MenuItem value="date-asc">Date (Oldest First)</MenuItem>
            <MenuItem value="amount-desc">Amount (High to Low)</MenuItem>
            <MenuItem value="amount-asc">Amount (Low to High)</MenuItem>
            <MenuItem value="description-asc">Description (A-Z)</MenuItem>
            <MenuItem value="description-desc">Description (Z-A)</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default ExpenseFilters;

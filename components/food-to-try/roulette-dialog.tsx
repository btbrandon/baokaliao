'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Casino as CasinoIcon, Place as PlaceIcon } from '@mui/icons-material';
import { FoodToTry } from '@/types/food-to-try';
import { getCuisineFlag } from '@/utils/country-flags';

interface RouletteDialogProps {
  open: boolean;
  onClose: () => void;
  items: FoodToTry[];
  onSelectItem: (item: FoodToTry) => void;
}

export function RouletteDialog({ open, onClose, items, onSelectItem }: RouletteDialogProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentItem, setCurrentItem] = useState<FoodToTry | null>(null);
  const [selectedItem, setSelectedItem] = useState<FoodToTry | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get unique cuisines from items - useMemo to prevent recalculation
  const uniqueCuisines = useMemo(
    () => Array.from(new Set(items.map((item) => item.cuisine))).sort(),
    [items]
  );

  // Filter items based on selected cuisines
  const filteredItems = useMemo(
    () =>
      selectedCuisines.length > 0
        ? items.filter((item) => selectedCuisines.includes(item.cuisine))
        : items,
    [items, selectedCuisines]
  );

  useEffect(() => {
    if (!open) {
      setIsSpinning(false);
      setCurrentItem(null);
      setSelectedItem(null);
      setSelectedCuisines([]);
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    }
  }, [open]);

  // Separate effect to initialize selected cuisines when dialog opens
  useEffect(() => {
    if (open && selectedCuisines.length === 0) {
      setSelectedCuisines(uniqueCuisines);
    }
  }, [open, uniqueCuisines, selectedCuisines.length]);

  const handleSpin = () => {
    if (filteredItems.length === 0) return;

    setIsSpinning(true);
    setSelectedItem(null);

    const totalSpins = 60 + Math.floor(Math.random() * 20); // 60-80 spins
    let count = 0;

    const spinNext = () => {
      if (count >= totalSpins) {
        // Final selection
        const finalIndex = Math.floor(Math.random() * filteredItems.length);
        const winner = filteredItems[finalIndex];
        setCurrentItem(winner);
        setSelectedItem(winner);
        setIsSpinning(false);
        return;
      }

      // Show random item
      const randomIndex = Math.floor(Math.random() * filteredItems.length);
      setCurrentItem(filteredItems[randomIndex]);
      count++;

      // Calculate delay with progressive slowdown
      let delay = 50; // Base speed - keep fast
      const progress = count / totalSpins;
      const remaining = totalSpins - count;

      if (remaining <= 3) {
        // Last 3 items - very dramatic slowdown
        delay = 400 + (3 - remaining) * 200; // 400ms, 600ms, 800ms
      } else if (remaining <= 10) {
        // Last 10 items - start slowing down significantly
        delay = 100 + (10 - remaining) * 40; // 100ms to 380ms
      } else if (progress > 0.85) {
        // 85-90% - slight slowdown
        delay = 70;
      } else {
        // First 85% - keep it fast!
        delay = 50;
      }

      // Schedule next spin
      intervalRef.current = setTimeout(spinNext, delay) as any;
    };

    // Start spinning
    spinNext();
  };

  const handleViewDetails = () => {
    if (selectedItem) {
      onSelectItem(selectedItem);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CasinoIcon />
          Food Roulette
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
          {items.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No items available to spin. Add some food to try first!
            </Typography>
          ) : (
            <>
              <FormControl size="small" fullWidth>
                <InputLabel>Filter by Cuisines</InputLabel>
                <Select<string[]>
                  multiple
                  value={selectedCuisines}
                  label="Filter by Cuisines"
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCuisines(typeof value === 'string' ? value.split(',') : value);
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip
                          key={value}
                          label={`${getCuisineFlag(value)} ${value}`}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {uniqueCuisines.map((cuisine) => (
                    <MenuItem key={cuisine} value={cuisine}>
                      {getCuisineFlag(cuisine)} {cuisine}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Spin the roulette to randomly select from {filteredItems.length} options
                {selectedCuisines.length < uniqueCuisines.length &&
                  ` (${selectedCuisines.length} cuisines selected)`}
              </Typography>

              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: selectedItem ? 'success.light' : 'background.paper',
                  transition: 'all 0.3s ease',
                  border: 2,
                  borderColor: selectedItem ? 'success.main' : 'divider',
                }}
              >
                {!currentItem && !selectedItem && (
                  <Typography variant="h6" color="text.secondary">
                    Click Spin to start!
                  </Typography>
                )}

                {currentItem && (
                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          animation: isSpinning ? 'pulse 0.5s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                            '50%': { opacity: 0.7, transform: 'scale(1.05)' },
                          },
                        }}
                      >
                        {getCuisineFlag(currentItem.cuisine)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h4"
                      gutterBottom
                      sx={{
                        animation: isSpinning ? 'pulse 0.5s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
                        },
                      }}
                    >
                      {currentItem.name}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                      <Chip label={currentItem.cuisine} color="primary" size="small" />
                    </Box>

                    {currentItem.location && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          justifyContent: 'center',
                        }}
                      >
                        <PlaceIcon fontSize="small" />
                        <Typography variant="body2">{currentItem.location}</Typography>
                      </Box>
                    )}

                    {currentItem.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {currentItem.description}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSpin}
                disabled={isSpinning}
                startIcon={<CasinoIcon />}
                fullWidth
              >
                {isSpinning ? 'Spinning...' : selectedItem ? 'Spin Again' : 'Spin the Wheel'}
              </Button>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {selectedItem && (
          <Button onClick={handleViewDetails} variant="outlined">
            View Details
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

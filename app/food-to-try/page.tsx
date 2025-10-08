'use client';

import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  Map as MapIcon,
  Casino as CasinoIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useStores } from '@/stores';
import { FoodToTryList } from '@/components/food-to-try/food-to-try-list';
import { AddFoodToTry } from '@/components/food-to-try/add-food-to-try';
import { FoodToTryDetails } from '@/components/food-to-try/food-to-try-details';
import { FoodToTryMapView } from '@/components/food-to-try/food-to-try-map-view';
import { RouletteDialog } from '@/components/food-to-try/roulette-dialog';
import { AppNavigation } from '@/components/app-navigation';
import { FoodToTry, CreateFoodToTryInput } from '@/types/food-to-try';

export default observer(function FoodToTryPage() {
  const { foodToTryStore } = useStores();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [rouletteDialogOpen, setRouletteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodToTry | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');

  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'cuisine'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    foodToTryStore.fetchItems();
  }, [foodToTryStore]);

  useEffect(() => {
    foodToTryStore.setFilters({
      cuisine: selectedCuisine || undefined,
      location: selectedLocation || undefined,
      searchQuery: searchQuery || undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
  }, [selectedCuisine, selectedLocation, searchQuery, sortBy, sortOrder, foodToTryStore]);

  const handleAdd = () => {
    setEditingItem(null);
    setAddDialogOpen(true);
  };

  const handleEdit = (item: FoodToTry) => {
    setEditingItem(item);
    setAddDialogOpen(true);
    setDetailsDialogOpen(false);
  };

  const handleSave = async (data: CreateFoodToTryInput) => {
    if (editingItem) {
      await foodToTryStore.updateItem(editingItem.id, data);
    } else {
      await foodToTryStore.createItem(data);
    }
    setAddDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    await foodToTryStore.deleteItem(id);
    setDetailsDialogOpen(false);
  };

  const handleItemClick = (item: FoodToTry) => {
    foodToTryStore.setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const clearFilters = () => {
    setSelectedCuisine('');
    setSelectedLocation('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCuisine || selectedLocation || searchQuery;

  return (
    <>
      <AppNavigation />
      <Box sx={{ ml: { xs: 0, sm: '72px', md: '260px' }, mt: 8, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Food to Try</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="list">
                <ListIcon sx={{ mr: 0.5 }} /> List
              </ToggleButton>
              <ToggleButton value="grid">
                <GridIcon sx={{ mr: 0.5 }} /> Grid
              </ToggleButton>
              <ToggleButton value="map">
                <MapIcon sx={{ mr: 0.5 }} /> Map
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              startIcon={<CasinoIcon />}
              onClick={() => setRouletteDialogOpen(true)}
              disabled={foodToTryStore.filteredItems.length === 0}
            >
              Roulette
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Add Food
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            placeholder="Search name, description..."
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Cuisine</InputLabel>
            <Select
              value={selectedCuisine}
              label="Cuisine"
              onChange={(e) => setSelectedCuisine(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {foodToTryStore.uniqueCuisines.map((cuisine) => (
                <MenuItem key={cuisine} value={cuisine}>
                  {cuisine}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Country</InputLabel>
            <Select
              value={selectedLocation}
              label="Country"
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {foodToTryStore.uniqueCountries.map((country) => (
                <MenuItem key={country || ''} value={country || ''}>
                  {getCountryFlag(country)} {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'cuisine')}
              startAdornment={<SortIcon sx={{ mr: 0.5, ml: 1 }} fontSize="small" />}
            >
              <MenuItem value="date">Date Added</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="cuisine">Cuisine</MenuItem>
            </Select>
          </FormControl>

          <Button
            size="small"
            variant="outlined"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            sx={{ minWidth: 100 }}
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </Button>

          {hasActiveFilters && (
            <Button size="small" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Content */}
        {foodToTryStore.loading && <Typography>Loading...</Typography>}
        {foodToTryStore.error && <Typography color="error">{foodToTryStore.error}</Typography>}

        {!foodToTryStore.loading && foodToTryStore.filteredItems.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <Typography variant="h5" gutterBottom color="text.secondary">
              {hasActiveFilters ? 'No items match your filters' : 'No food items yet'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {hasActiveFilters
                ? 'Try adjusting your filters or clear them to see all items.'
                : 'Start adding places you want to try!'}
            </Typography>
            {!hasActiveFilters && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                Add Your First Item
              </Button>
            )}
            {hasActiveFilters && (
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Box>
        )}

        {!foodToTryStore.loading &&
          foodToTryStore.filteredItems.length > 0 &&
          viewMode === 'list' && (
            <FoodToTryList
              items={foodToTryStore.filteredItems}
              onItemClick={handleItemClick}
              viewLayout="list"
            />
          )}

        {!foodToTryStore.loading &&
          foodToTryStore.filteredItems.length > 0 &&
          viewMode === 'grid' && (
            <FoodToTryList
              items={foodToTryStore.filteredItems}
              onItemClick={handleItemClick}
              viewLayout="grid"
            />
          )}

        {!foodToTryStore.loading &&
          foodToTryStore.filteredItems.length > 0 &&
          viewMode === 'map' && (
            <FoodToTryMapView items={foodToTryStore.filteredItems} onItemClick={handleItemClick} />
          )}

        {/* Dialogs */}
        <AddFoodToTry
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
          initialData={editingItem ? (editingItem as CreateFoodToTryInput) : undefined}
        />

        <FoodToTryDetails
          item={foodToTryStore.selectedItem}
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <RouletteDialog
          open={rouletteDialogOpen}
          onClose={() => setRouletteDialogOpen(false)}
          items={foodToTryStore.filteredItems}
          onSelectItem={handleItemClick}
        />
      </Box>
    </>
  );
});

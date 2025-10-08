'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Rating,
  Typography,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CreateFoodReviewInput, CreateDishInput, CreateRatingInput, FoodReview } from '@/types';
import { DEFAULT_RATING_CATEGORIES, validateRating } from '@/utils/food-review/utils';
import { useStores } from '@/stores';
import { observer } from 'mobx-react-lite';
import { PlaceSearch } from './place-search';
import { PhotoUpload } from './photo-upload';

interface AddFoodReviewProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reviewId?: string | null;
}

export const AddFoodReview = observer(
  ({ open, onClose, onSuccess, reviewId }: AddFoodReviewProps) => {
    const { foodReviewStore } = useStores();
    const isEditMode = !!reviewId;

    const [formData, setFormData] = useState({
      placeName: '',
      placeAddress: '',
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
      googlePlaceId: undefined as string | undefined,
      overallRating: 3,
      notes: '',
      visitDate: new Date().toISOString().split('T')[0],
    });

    const [dishes, setDishes] = useState<CreateDishInput[]>([]);
    const [ratings, setRatings] = useState<CreateRatingInput[]>(
      DEFAULT_RATING_CATEGORIES.map((cat) => ({ category: cat, rating: 3 }))
    );
    const [photos, setPhotos] = useState<string[]>([]);

    const [newDish, setNewDish] = useState<{
      name: string;
      price: string;
      notes: string;
      rating: number | null;
      createExpense: boolean;
    }>({
      name: '',
      price: '',
      notes: '',
      rating: 3,
      createExpense: true,
    });

    const [editingDishIndex, setEditingDishIndex] = useState<number | null>(null);

    const [billDetails, setBillDetails] = useState({
      applyGst: false,
      applyServiceCharge: false,
      splitBill: false,
      numberOfPeople: 1,
    });

    // Load review data when in edit mode
    useEffect(() => {
      if (open && reviewId && isEditMode) {
        const loadReview = async () => {
          await foodReviewStore.getReview(reviewId);
          const review = foodReviewStore.selectedReview;
          if (review) {
            setFormData({
              placeName: review.place_name,
              placeAddress: review.place_address || '',
              latitude: review.latitude,
              longitude: review.longitude,
              googlePlaceId: review.google_place_id,
              overallRating: review.overall_rating,
              notes: review.notes || '',
              visitDate: review.visit_date,
            });
            if (review.dishes) {
              setDishes(
                review.dishes.map((d) => ({
                  name: d.name,
                  price: d.price,
                  notes: d.notes,
                  rating: d.rating,
                  create_expense: !!d.expense_id,
                }))
              );
            }
            if (review.ratings) {
              setRatings(review.ratings.map((r) => ({ category: r.category, rating: r.rating })));
            }
            if (review.photos) {
              setPhotos(review.photos.map((p) => p.url));
            }
            // Load bill adjustments if they exist
            if (review.bill_adjustments) {
              setBillDetails({
                applyGst: review.bill_adjustments.apply_gst,
                applyServiceCharge: review.bill_adjustments.apply_service_charge,
                splitBill: review.bill_adjustments.split_bill,
                numberOfPeople: review.bill_adjustments.number_of_people,
              });
            }
          }
        };
        loadReview();
      }
    }, [open, reviewId, isEditMode]);

    const handleAddDish = () => {
      if (!newDish.name || !newDish.price) return;

      if (editingDishIndex !== null) {
        // Update existing dish
        setDishes(
          dishes.map((dish, i) =>
            i === editingDishIndex
              ? {
                  name: newDish.name,
                  price: parseFloat(newDish.price),
                  notes: newDish.notes || undefined,
                  rating:
                    newDish.rating !== null && newDish.rating !== undefined
                      ? newDish.rating
                      : undefined,
                  create_expense: newDish.createExpense,
                }
              : dish
          )
        );
        setEditingDishIndex(null);
      } else {
        // Add new dish
        setDishes([
          ...dishes,
          {
            name: newDish.name,
            price: parseFloat(newDish.price),
            notes: newDish.notes || undefined,
            rating:
              newDish.rating !== null && newDish.rating !== undefined ? newDish.rating : undefined,
            create_expense: newDish.createExpense,
          },
        ]);
      }

      setNewDish({
        name: '',
        price: '',
        notes: '',
        rating: 3,
        createExpense: true,
      });
    };

    const handleEditDish = (index: number) => {
      const dish = dishes[index];
      setNewDish({
        name: dish.name,
        price: dish.price.toString(),
        notes: dish.notes || '',
        rating: dish.rating || 3,
        createExpense: dish.create_expense || true,
      });
      setEditingDishIndex(index);
    };

    const handleCancelEdit = () => {
      setNewDish({
        name: '',
        price: '',
        notes: '',
        rating: 3,
        createExpense: true,
      });
      setEditingDishIndex(null);
    };

    const handleRemoveDishWithEditCheck = (index: number) => {
      // If we're removing the dish being edited, cancel edit first
      if (editingDishIndex === index) {
        handleCancelEdit();
      } else if (editingDishIndex !== null && editingDishIndex > index) {
        // Adjust edit index if we're removing a dish before the one being edited
        setEditingDishIndex(editingDishIndex - 1);
      }
      setDishes(dishes.filter((_, i) => i !== index));
    };

    const handleRatingChange = (category: string, value: number) => {
      setRatings(ratings.map((r) => (r.category === category ? { ...r, rating: value } : r)));
    };

    const calculateAdjustedPrice = (basePrice: number): number => {
      let total = basePrice;
      if (billDetails.applyGst) {
        total *= 1.09; // Add 9% GST
      }
      if (billDetails.applyServiceCharge) {
        total *= 1.1; // Add 10% service charge
      }
      if (billDetails.splitBill && billDetails.numberOfPeople > 1) {
        total /= billDetails.numberOfPeople;
      }
      return total;
    };

    const getTotalDishPrice = (): number => {
      return dishes.reduce((sum, dish) => sum + dish.price, 0);
    };

    const getAdjustedTotal = (): number => {
      return calculateAdjustedPrice(getTotalDishPrice());
    };

    const handleSubmit = async () => {
      if (!formData.placeName || !formData.placeAddress) {
        alert('Please fill in required fields');
        return;
      }

      if (!validateRating(formData.overallRating)) {
        alert('Invalid rating');
        return;
      }

      const input: CreateFoodReviewInput = {
        place_name: formData.placeName,
        place_address: formData.placeAddress,
        overall_rating: formData.overallRating,
        notes: formData.notes || undefined,
        visit_date: formData.visitDate,
        latitude: formData.latitude,
        longitude: formData.longitude,
        google_place_id: formData.googlePlaceId,
        dishes,
        ratings,
        photos: photos.length > 0 ? photos : undefined,
        bill_adjustments: {
          apply_gst: billDetails.applyGst,
          apply_service_charge: billDetails.applyServiceCharge,
          split_bill: billDetails.splitBill,
          number_of_people: billDetails.numberOfPeople,
        },
      };

      try {
        if (isEditMode && reviewId) {
          await foodReviewStore.updateReview(reviewId, input);
        } else {
          await foodReviewStore.createReview(input);
        }
        handleClose();
        onSuccess?.();
      } catch (error) {
        console.error('Error saving review:', error);
        alert(`Failed to ${isEditMode ? 'update' : 'create'} review`);
      }
    };

    const handlePlaceSelect = (place: any) => {
      setFormData({
        ...formData,
        placeName: place.name,
        placeAddress: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        googlePlaceId: place.place_id,
      });
    };

    const handleClose = () => {
      setFormData({
        placeName: '',
        placeAddress: '',
        latitude: undefined,
        longitude: undefined,
        googlePlaceId: undefined,
        overallRating: 3,
        notes: '',
        visitDate: new Date().toISOString().split('T')[0],
      });
      setDishes([]);
      setRatings(DEFAULT_RATING_CATEGORIES.map((cat) => ({ category: cat, rating: 3 })));
      setPhotos([]);
      setNewDish({
        name: '',
        price: '',
        notes: '',
        rating: 3,
        createExpense: true,
      });
      setEditingDishIndex(null);
      setBillDetails({
        applyGst: false,
        applyServiceCharge: false,
        splitBill: false,
        numberOfPeople: 1,
      });
      onClose();
    };

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Food Review' : 'Add Food Review'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <PlaceSearch onSelect={handlePlaceSelect} value={formData.placeName} />

            <TextField
              label="Place Name"
              required
              value={formData.placeName}
              onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
              fullWidth
            />

            <TextField
              label="Address"
              required
              value={formData.placeAddress}
              onChange={(e) => setFormData({ ...formData, placeAddress: e.target.value })}
              fullWidth
            />

            <TextField
              label="Visit Date"
              type="date"
              required
              value={formData.visitDate}
              onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <Box>
              <Typography component="legend">Overall Rating</Typography>
              <Rating
                value={formData.overallRating}
                precision={0.5}
                onChange={(_, value) => setFormData({ ...formData, overallRating: value || 0 })}
              />
            </Box>

            <TextField
              label="Notes"
              multiline
              minRows={3}
              maxRows={15}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Category Ratings
            </Typography>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
            >
              {ratings.map((rating) => (
                <Box key={rating.category}>
                  <Typography component="legend">{rating.category}</Typography>
                  <Rating
                    value={rating.rating}
                    precision={0.5}
                    onChange={(_, value) => handleRatingChange(rating.category, value || 0)}
                  />
                </Box>
              ))}
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Dishes
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {dishes.map((dish, index) =>
                editingDishIndex === index ? (
                  // Render edit form inline when editing this dish
                  <Box
                    key={index}
                    sx={{
                      border: 1,
                      borderColor: 'primary.main',
                      borderRadius: 1,
                      p: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 3 }}>
                      Edit Dish
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        label="Dish Name"
                        size="small"
                        value={newDish.name}
                        onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                      />
                      <TextField
                        label="Price"
                        type="number"
                        size="small"
                        value={newDish.price}
                        onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                      />
                      <TextField
                        label="Notes"
                        size="small"
                        multiline
                        minRows={2}
                        maxRows={8}
                        value={newDish.notes}
                        onChange={(e) => setNewDish({ ...newDish, notes: e.target.value })}
                      />
                      <Box>
                        <Typography component="legend" variant="caption">
                          Dish Rating
                        </Typography>
                        <Rating
                          value={newDish.rating}
                          precision={0.5}
                          onChange={(_, value) => setNewDish({ ...newDish, rating: value })}
                          size="large"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button variant="text" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleAddDish}
                          disabled={!newDish.name || !newDish.price}
                        >
                          Update
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  // Render normal dish display
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'primary.light',
                      },
                      '&:hover .dish-delete-button': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }} onClick={() => handleEditDish(index)}>
                      <Typography variant="subtitle1">{dish.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${dish.price.toFixed(2)}
                        {dish.notes && ` - ${dish.notes}`}
                      </Typography>
                      {dish.rating !== undefined && dish.rating !== null && (
                        <Rating value={dish.rating} readOnly size="small" precision={0.5} />
                      )}
                    </Box>
                    <IconButton
                      className="dish-delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDishWithEditCheck(index);
                      }}
                      color="error"
                      size="small"
                      sx={{ opacity: 0, transition: 'opacity 0.2s' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )
              )}

              {editingDishIndex === null && (
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {editingDishIndex !== null ? 'Edit Dish' : 'Add New Dish'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      label="Dish Name"
                      size="small"
                      value={newDish.name}
                      onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                    />
                    <TextField
                      label="Price"
                      type="number"
                      size="small"
                      value={newDish.price}
                      onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                    />
                    <TextField
                      label="Notes"
                      size="small"
                      multiline
                      minRows={2}
                      maxRows={8}
                      value={newDish.notes}
                      onChange={(e) => setNewDish({ ...newDish, notes: e.target.value })}
                    />
                    <Box>
                      <Typography component="legend" variant="caption">
                        Dish Rating
                      </Typography>
                      <Rating
                        value={newDish.rating}
                        precision={0.5}
                        onChange={(_, value) => setNewDish({ ...newDish, rating: value || 0 })}
                        size="small"
                      />
                    </Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={newDish.createExpense}
                          onChange={(e) =>
                            setNewDish({ ...newDish, createExpense: e.target.checked })
                          }
                        />
                      }
                      label="Add as expense"
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddDish}
                        disabled={!newDish.name || !newDish.price}
                        sx={{ flex: 1 }}
                      >
                        {editingDishIndex !== null ? 'Update Dish' : 'Add Dish'}
                      </Button>
                      {editingDishIndex !== null && (
                        <Button variant="text" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {dishes.length > 0 && (
              <Box
                sx={{
                  border: 1,
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  p: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Bill Adjustments
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={billDetails.applyGst}
                        onChange={(e) =>
                          setBillDetails({ ...billDetails, applyGst: e.target.checked })
                        }
                      />
                    }
                    label="Add GST (9%)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={billDetails.applyServiceCharge}
                        onChange={(e) =>
                          setBillDetails({ ...billDetails, applyServiceCharge: e.target.checked })
                        }
                      />
                    }
                    label="Add Service Charge (10%)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={billDetails.splitBill}
                        onChange={(e) =>
                          setBillDetails({ ...billDetails, splitBill: e.target.checked })
                        }
                      />
                    }
                    label="Split Bill"
                  />
                  {billDetails.splitBill && (
                    <TextField
                      label="Number of People"
                      type="number"
                      size="small"
                      value={billDetails.numberOfPeople}
                      onChange={(e) =>
                        setBillDetails({
                          ...billDetails,
                          numberOfPeople: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      inputProps={{ min: 1 }}
                      sx={{ maxWidth: 200 }}
                    />
                  )}
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal (dishes): ${getTotalDishPrice().toFixed(2)}
                    </Typography>
                    {billDetails.applyGst && (
                      <Typography variant="body2" color="text.secondary">
                        GST (9%): ${(getTotalDishPrice() * 0.09).toFixed(2)}
                      </Typography>
                    )}
                    {billDetails.applyServiceCharge && (
                      <Typography variant="body2" color="text.secondary">
                        Service Charge (10%): $
                        {(getTotalDishPrice() * (billDetails.applyGst ? 1.09 : 1) * 0.1).toFixed(2)}
                      </Typography>
                    )}
                    {billDetails.splitBill && (
                      <Typography variant="body2" color="text.secondary">
                        Split by: {billDetails.numberOfPeople}{' '}
                        {billDetails.numberOfPeople === 1 ? 'person' : 'people'}
                      </Typography>
                    )}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                      Total per person: ${getAdjustedTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Typography variant="h6" sx={{ mt: 2 }}>
              Photos
            </Typography>
            <PhotoUpload onPhotosChange={setPhotos} existingPhotos={photos} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          {isEditMode && reviewId && (
            <Button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this review?')) {
                  await foodReviewStore.deleteReview(reviewId);
                  handleClose();
                  onSuccess?.();
                }
              }}
              color="error"
              variant="outlined"
            >
              Delete Review
            </Button>
          )}
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {isEditMode ? 'Update Review' : 'Create Review'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  }
);

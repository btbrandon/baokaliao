'use client';

import { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Chip,
  IconButton,
  CardActions,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { formatPrice, getTotalDishesPrice } from '@/utils/food-review/utils';
import { format } from 'date-fns';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface FoodReviewsListProps {
  onEdit?: (reviewId: string) => void;
  onView?: (reviewId: string) => void;
}

export const FoodReviewsList = observer(({ onEdit, onView }: FoodReviewsListProps) => {
  const { foodReviewStore } = useStores();

  useEffect(() => {
    foodReviewStore.fetchReviews();
  }, []);

  const handleDelete = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await foodReviewStore.deleteReview(reviewId);
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  if (foodReviewStore.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading reviews...</Typography>
      </Box>
    );
  }

  if (foodReviewStore.reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No food reviews yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start adding reviews of places you've eaten at!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {foodReviewStore.reviews.map((review) => (
        <Card
          key={review.id}
          sx={{
            cursor: onView ? 'pointer' : 'default',
            position: 'relative',
          }}
          onClick={() => onView?.(review.id)}
        >
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{review.place_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {review.place_address}
                </Typography>
                <Rating value={review.overall_rating} readOnly precision={0.5} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(review.visit_date), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Mini Map */}
            {review.latitude && review.longitude && (
              <Box
                sx={{ height: '150px', width: '100%', borderRadius: 1, overflow: 'hidden', mb: 2 }}
              >
                <Map
                  initialViewState={{
                    longitude: review.longitude,
                    latitude: review.latitude,
                    zoom: 14,
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                  interactive={false}
                >
                  <Marker longitude={review.longitude} latitude={review.latitude} color="#1976d2" />
                </Map>
              </Box>
            )}

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <ImageList cols={3} gap={4} sx={{ margin: 0 }}>
                  {review.photos.slice(0, 3).map((photo, idx) => (
                    <ImageListItem key={photo.id || idx}>
                      <img
                        src={photo.url}
                        alt={`Photo ${idx + 1}`}
                        loading="lazy"
                        style={{ borderRadius: 4, height: 100, objectFit: 'cover' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
                {review.photos.length > 3 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    +{review.photos.length - 3} more photos
                  </Typography>
                )}
              </Box>
            )}

            {review.notes && (
              <Typography variant="body2" sx={{ mt: 2, mb: 2, whiteSpace: 'pre-wrap' }}>
                {review.notes}
              </Typography>
            )}

            {review.dishes && review.dishes.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Dishes ({review.dishes.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {review.dishes.map((dish) => (
                    <Box
                      key={dish.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body2">{dish.name}</Typography>
                        {dish.rating && (
                          <Rating value={dish.rating} readOnly size="small" precision={0.5} />
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {formatPrice(dish.price)}
                      </Typography>
                    </Box>
                  ))}
                  <Box
                    sx={{ textAlign: 'right', mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Subtotal: {formatPrice(getTotalDishesPrice(review.dishes))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      GST (9%): {formatPrice(getTotalDishesPrice(review.dishes) * 0.09)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Service Charge (10%):{' '}
                      {formatPrice(getTotalDishesPrice(review.dishes) * 1.09 * 0.1)}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 0.5 }}>
                      Total: {formatPrice(getTotalDishesPrice(review.dishes) * 1.09 * 1.1)}
                    </Typography>
                  </Box>
                </Box>
                {review.dishes.some((d) => d.expense_id) && (
                  <Chip label="Added to Expenses" size="small" color="primary" sx={{ mt: 1 }} />
                )}
              </Box>
            )}

            {review.ratings && review.ratings.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {review.ratings.map((rating) => (
                  <Chip
                    key={rating.id}
                    label={`${rating.category}: ${rating.rating.toFixed(1)}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
});

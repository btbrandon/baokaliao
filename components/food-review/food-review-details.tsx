'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Rating,
  Chip,
  ImageList,
  ImageListItem,
  Divider,
} from '@mui/material';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { formatPrice, getTotalDishesPrice } from '@/utils/food-review/utils';
import { getRatingColor, getRatingBgColor } from '@/utils/food-review/rating-colors';
import { format } from 'date-fns';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface FoodReviewDetailsProps {
  reviewId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (reviewId: string) => void;
}

export const FoodReviewDetails = observer(
  ({ reviewId, open, onClose, onEdit }: FoodReviewDetailsProps) => {
    const { foodReviewStore } = useStores();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
      if (reviewId && open) {
        foodReviewStore.getReview(reviewId);
      }
    }, [reviewId, open]);

    useEffect(() => {
      if (!open) {
        setSelectedImage(null);
      }
    }, [open]);

    const review = foodReviewStore.selectedReview;

    if (!review) {
      return null;
    }

    return (
      <>
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantIcon />
              <Typography variant="h6">{review.place_name}</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {review.place_address}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Visited: {format(new Date(review.visit_date), 'MMMM d, yyyy')}
                </Typography>
              </Box>

              {review.latitude && review.longitude && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Location
                  </Typography>
                  <Box sx={{ height: '500px', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                    <Map
                      initialViewState={{
                        longitude: review.longitude,
                        latitude: review.latitude,
                        zoom: 15,
                      }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                      interactive={true}
                    >
                      <Marker
                        longitude={review.longitude}
                        latitude={review.latitude}
                        color="#1976d2"
                      />
                    </Map>
                  </Box>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Overall Rating
                </Typography>
                <Rating value={review.overall_rating} readOnly precision={0.5} size="large" />
              </Box>

              {review.notes && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {review.notes}
                  </Typography>
                </Box>
              )}

              {review.ratings && review.ratings.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Category Ratings
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {review.ratings.map((rating) => (
                      <Box
                        key={rating.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: getRatingBgColor(rating.rating),
                          border: 1,
                          borderColor: getRatingColor(rating.rating),
                        }}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {rating.category}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating
                            value={rating.rating}
                            readOnly
                            precision={0.5}
                            size="small"
                            sx={{
                              '& .MuiRating-iconFilled': {
                                color: getRatingColor(rating.rating),
                              },
                            }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: getRatingColor(rating.rating), minWidth: 30 }}
                          >
                            {rating.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Divider />

              {review.dishes && review.dishes.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Dishes ({review.dishes.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {review.dishes.map((dish) => (
                      <Box
                        key={dish.id}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle1">{dish.name}</Typography>
                          <Typography variant="h6" color="primary">
                            {formatPrice(dish.price)}
                          </Typography>
                        </Box>
                        {dish.notes && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1, whiteSpace: 'pre-wrap' }}
                          >
                            {dish.notes}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {dish.rating && (
                            <Rating value={dish.rating} readOnly size="small" precision={0.5} />
                          )}
                        </Box>
                      </Box>
                    ))}
                    <Box sx={{ textAlign: 'right', mt: 1 }}>
                      <Typography variant="h6">
                        Total: {formatPrice(getTotalDishesPrice(review.dishes))}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {review.photos && review.photos.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Photos ({review.photos.length})
                  </Typography>
                  <ImageList cols={3} gap={8}>
                    {review.photos.map((photo) => (
                      <ImageListItem
                        key={photo.id}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setSelectedImage(photo.url)}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Food photo'}
                          loading="lazy"
                          style={{ borderRadius: 8, height: 240, objectFit: 'cover' }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            {onEdit && (
              <Button
                onClick={() => {
                  onEdit(review.id);
                  onClose();
                }}
                variant="outlined"
              >
                Edit Review
              </Button>
            )}
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Image Lightbox */}
        <Dialog
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              boxShadow: 'none',
            },
          }}
        >
          <DialogContent
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              minHeight: '80vh',
            }}
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: 8,
                }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
            <Button onClick={() => setSelectedImage(null)} sx={{ color: 'white' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

'use client';

import { Box, Typography, Rating, Chip } from '@mui/material';
import { observer } from 'mobx-react-lite';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState, useMemo } from 'react';
import { useStores } from '@/stores';
import { format } from 'date-fns';
import { FoodReview } from '@/types';

interface ReviewsMapProps {
  onViewReview?: (reviewId: string) => void;
}

export const ReviewsMap = observer(({ onViewReview }: ReviewsMapProps) => {
  const { foodReviewStore } = useStores();
  const [selectedReview, setSelectedReview] = useState<FoodReview | null>(null);

  const reviewsWithLocation = useMemo(
    () => foodReviewStore.reviews.filter((r) => r.latitude && r.longitude),
    [foodReviewStore.reviews]
  );

  const bounds = useMemo(() => {
    if (reviewsWithLocation.length === 0) return null;

    const lats = reviewsWithLocation.map((r) => r.latitude!);
    const lngs = reviewsWithLocation.map((r) => r.longitude!);

    return {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  }, [reviewsWithLocation]);

  const initialViewState = useMemo(() => {
    if (!bounds || reviewsWithLocation.length === 0) {
      return {
        longitude: 103.8198,
        latitude: 1.3521,
        zoom: 11,
      };
    }

    if (reviewsWithLocation.length === 1) {
      return {
        longitude: reviewsWithLocation[0].longitude!,
        latitude: reviewsWithLocation[0].latitude!,
        zoom: 14,
      };
    }

    const centerLng = (bounds.minLng + bounds.maxLng) / 2;
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;

    const lngDiff = bounds.maxLng - bounds.minLng;
    const latDiff = bounds.maxLat - bounds.minLat;
    const maxDiff = Math.max(lngDiff, latDiff);

    let zoom = 11;
    if (maxDiff < 0.01) zoom = 15;
    else if (maxDiff < 0.05) zoom = 13;
    else if (maxDiff < 0.1) zoom = 12;
    else if (maxDiff < 0.5) zoom = 10;

    return {
      longitude: centerLng,
      latitude: centerLat,
      zoom,
    };
  }, [bounds, reviewsWithLocation]);

  if (foodReviewStore.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading map...</Typography>
      </Box>
    );
  }

  if (reviewsWithLocation.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No reviews with location data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add reviews with location information to see them on the map
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '600px', width: '100%', position: 'relative' }}>
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        {reviewsWithLocation.map((review) => (
          <Marker
            key={review.id}
            longitude={review.longitude!}
            latitude={review.latitude!}
            color="#1976d2"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedReview(review);
            }}
            style={{ cursor: 'pointer' }}
          />
        ))}

        {selectedReview && selectedReview.latitude && selectedReview.longitude && (
          <Popup
            longitude={selectedReview.longitude}
            latitude={selectedReview.latitude}
            onClose={() => setSelectedReview(null)}
            closeOnClick={false}
            anchor="bottom"
            offset={25}
            maxWidth="320px"
          >
            <Box
              sx={{
                minWidth: 250,
                maxWidth: 320,
                cursor: onViewReview ? 'pointer' : 'default',
                '&:hover': {
                  '& .view-details': {
                    textDecoration: 'underline',
                  },
                },
              }}
              onClick={() => {
                if (onViewReview && selectedReview) {
                  onViewReview(selectedReview.id);
                  setSelectedReview(null);
                }
              }}
            >
              {selectedReview.photos && selectedReview.photos.length > 0 && (
                <Box
                  component="img"
                  src={selectedReview.photos[0].url}
                  alt={selectedReview.place_name}
                  sx={{
                    width: '100%',
                    height: 140,
                    objectFit: 'cover',
                    borderRadius: '4px 4px 0 0',
                    mb: 1,
                  }}
                />
              )}
              <Box sx={{ px: 0.5, pb: 0.5 }}>
                <Typography variant="subtitle1" fontWeight="600" sx={{ lineHeight: 1.3, mb: 0.5 }}>
                  {selectedReview.place_name}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.75,
                  }}
                >
                  <Rating
                    value={Number(selectedReview.overall_rating)}
                    readOnly
                    size="small"
                    precision={0.5}
                    sx={{ fontSize: '1rem' }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {Number(selectedReview.overall_rating).toFixed(1)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    mb: 0.75,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                  >
                    {format(new Date(selectedReview.visit_date), 'MMM d, yyyy')}
                  </Typography>
                  {selectedReview.dishes && selectedReview.dishes.length > 0 && (
                    <>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        •
                      </Typography>
                      <Chip
                        label={`${selectedReview.dishes.length} ${selectedReview.dishes.length === 1 ? 'dish' : 'dishes'}`}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.7rem',
                          bgcolor: 'grey.200',
                          color: 'text.primary',
                          fontWeight: 500,
                        }}
                      />
                    </>
                  )}
                </Box>
                {selectedReview.notes && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 0.75,
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {selectedReview.notes}
                  </Typography>
                )}
                {onViewReview && (
                  <Typography
                    className="view-details"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      mt: 0.5,
                    }}
                  >
                    View Details →
                  </Typography>
                )}
              </Box>
            </Box>
          </Popup>
        )}
      </Map>
    </Box>
  );
});

'use client';

import { Box, Typography, Card, CardContent, Rating, Chip } from '@mui/material';
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
          >
            <Card
              sx={{
                minWidth: 250,
                maxWidth: 300,
                cursor: onViewReview ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (onViewReview && selectedReview) {
                  onViewReview(selectedReview.id);
                  setSelectedReview(null);
                }
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedReview.place_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  {format(new Date(selectedReview.visit_date), 'MMM d, yyyy')}
                </Typography>
                <Rating
                  value={selectedReview.overall_rating}
                  readOnly
                  size="small"
                  precision={0.5}
                />
                {selectedReview.dishes && selectedReview.dishes.length > 0 && (
                  <Chip
                    label={`${selectedReview.dishes.length} dishes`}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
                {onViewReview && (
                  <Typography variant="caption" color="primary" display="block" sx={{ mt: 1 }}>
                    Click to view details
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Popup>
        )}
      </Map>
    </Box>
  );
});

'use client';

import { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import { FoodToTry } from '@/types/food-to-try';
import { Place as PlaceIcon } from '@mui/icons-material';
import { getCuisineFlag } from '@/utils/country-flags';

interface FoodToTryMapViewProps {
  items: FoodToTry[];
  onItemClick: (item: FoodToTry) => void;
}

export function FoodToTryMapView({ items, onItemClick }: FoodToTryMapViewProps) {
  const [selectedItem, setSelectedItem] = useState<FoodToTry | null>(null);

  const itemsWithLocation = items.filter((item) => {
    const hasCoords =
      item.latitude != null &&
      item.longitude != null &&
      !isNaN(Number(item.latitude)) &&
      !isNaN(Number(item.longitude)) &&
      Number(item.latitude) !== 0 &&
      Number(item.longitude) !== 0;
    return hasCoords;
  });

  const initialViewState =
    itemsWithLocation.length > 0
      ? {
          longitude: Number(itemsWithLocation[0].longitude!),
          latitude: Number(itemsWithLocation[0].latitude!),
          zoom: 12,
        }
      : {
          longitude: 103.8198,
          latitude: 1.3521,
          zoom: 11,
        };

  const getMarkerColor = () => {
    return '#2196f3'; // blue - all items are 'to try'
  };

  return (
    <Box sx={{ height: 'calc(100vh - 250px)', borderRadius: 1, overflow: 'hidden' }}>
      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        interactive={true}
      >
        {itemsWithLocation.map((item) => (
          <Marker
            key={item.id}
            longitude={Number(item.longitude!)}
            latitude={Number(item.latitude!)}
            anchor="bottom"
            color={getMarkerColor()}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedItem(item);
            }}
          />
        ))}

        {selectedItem && selectedItem.latitude && selectedItem.longitude && (
          <Popup
            longitude={Number(selectedItem.longitude)}
            latitude={Number(selectedItem.latitude)}
            onClose={() => setSelectedItem(null)}
            closeOnClick={false}
            anchor="bottom"
            offset={25}
            maxWidth="320px"
          >
            <Box
              sx={{
                minWidth: 250,
                maxWidth: 320,
                cursor: 'pointer',
                '&:hover': {
                  '& .view-details': {
                    textDecoration: 'underline',
                  },
                },
              }}
              onClick={() => {
                onItemClick(selectedItem);
                setSelectedItem(null);
              }}
            >
              {selectedItem.image_url && (
                <Box
                  component="img"
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                    {getCuisineFlag(selectedItem.cuisine)}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ lineHeight: 1.3 }}>
                    {selectedItem.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75, flexWrap: 'wrap' }}>
                  <Chip 
                    label={selectedItem.cuisine} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 500,
                    }} 
                  />
                </Box>
                {selectedItem.location && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.75 }}>
                    <PlaceIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.8rem', 
                        color: 'text.secondary',
                        lineHeight: 1.3,
                      }}
                    >
                      {selectedItem.location}
                    </Typography>
                  </Box>
                )}
                {selectedItem.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 1,
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {selectedItem.description}
                  </Typography>
                )}
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
              </Box>
            </Box>
          </Popup>
        )}
      </Map>

      {itemsWithLocation.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No items with location data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add location information to items to see them on the map
          </Typography>
        </Box>
      )}
    </Box>
  );
}

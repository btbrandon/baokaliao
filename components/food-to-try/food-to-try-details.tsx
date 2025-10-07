'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Link,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Place as PlaceIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { FoodToTry } from '@/types/food-to-try';
import { format } from 'date-fns';
import Map, { Marker } from 'react-map-gl/maplibre';
import { getCuisineFlag } from '@/utils/country-flags';

interface FoodToTryDetailsProps {
  item: FoodToTry | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: FoodToTry) => void;
  onDelete: (id: string) => void;
}

export function FoodToTryDetails({ item, open, onClose, onEdit, onDelete }: FoodToTryDetailsProps) {
  if (!item) return null;

  const hasLocation = item.latitude && item.longitude;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            '&:hover .action-buttons': {
              opacity: 1,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4">{getCuisineFlag(item.cuisine)}</Typography>
            <Typography variant="h5">{item.name}</Typography>
          </Box>
          <Box
            className="action-buttons"
            sx={{
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
          >
            <IconButton onClick={() => onEdit(item)} size="small" sx={{ mr: 0.5 }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(item.id)} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {item.image_url && (
            <Box
              component="img"
              src={item.image_url}
              alt={item.name}
              sx={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip label={item.cuisine} color="primary" />
          </Box>

          {item.description && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2">{item.description}</Typography>
            </Box>
          )}

          {item.location && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Location
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PlaceIcon fontSize="small" />
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    item.location + (item.address ? ', ' + item.address : '')
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {item.location} <OpenIcon fontSize="small" />
                </Link>
              </Box>
              {item.address && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.address}
                </Typography>
              )}
            </Box>
          )}

          {hasLocation && (
            <Box sx={{ height: 500, borderRadius: 1, overflow: 'hidden' }}>
              <Map
                initialViewState={{
                  longitude: Number(item.longitude!),
                  latitude: Number(item.latitude!),
                  zoom: 14,
                }}
                mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                interactive={true}
              >
                <Marker
                  longitude={Number(item.longitude!)}
                  latitude={Number(item.latitude!)}
                  anchor="bottom"
                  color="red"
                />
              </Map>
            </Box>
          )}

          {(item.tiktok_url || item.video_url) && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Videos
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {item.tiktok_url && (
                  <Link
                    href={item.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    TikTok Video <OpenIcon fontSize="small" />
                  </Link>
                )}
                {item.video_url && (
                  <Link
                    href={item.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    Other Video <OpenIcon fontSize="small" />
                  </Link>
                )}
              </Box>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            Added on {format(new Date(item.created_at), 'PPP')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

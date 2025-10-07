'use client';

import { observer } from 'mobx-react-lite';
import {
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  PlayCircle as VideoIcon,
  Place as PlaceIcon,
  CalendarToday as DateIcon,
} from '@mui/icons-material';
import { FoodToTry } from '@/types/food-to-try';
import { getCuisineFlag } from '@/utils/country-flags';
import { format } from 'date-fns';

interface FoodToTryListProps {
  items: FoodToTry[];
  onItemClick: (item: FoodToTry) => void;
  viewLayout: 'grid' | 'list';
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'to_try':
      return 'primary';
    case 'visited':
      return 'success';
    case 'skipped':
      return 'default';
    default:
      return 'default';
  }
};

export const FoodToTryList = observer(({ items, onItemClick, viewLayout }: FoodToTryListProps) => {
  if (viewLayout === 'list') {
    // List View
    return (
      <List sx={{ bgcolor: 'background.paper' }}>
        {items.map((item) => (
          <ListItem
            key={item.id}
            disablePadding
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <ListItemButton onClick={() => onItemClick(item)}>
              <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center' }}>
                {item.image_url && (
                  <Box
                    component="img"
                    src={item.image_url}
                    alt={item.name}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" component="span">
                      {getCuisineFlag(item.cuisine)}
                    </Typography>
                    <Typography variant="h6" noWrap>
                      {item.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                    <Chip label={item.cuisine} size="small" color="primary" variant="outlined" />
                  </Box>
                  {item.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                    {item.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlaceIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {item.location}
                        </Typography>
                      </Box>
                    )}
                    {(item.tiktok_url || item.video_url) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VideoIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Video
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DateIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(item.created_at), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  }

  // Grid View
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 2,
      }}
    >
      {items.map((item) => (
        <Card key={item.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardActionArea onClick={() => onItemClick(item)} sx={{ flexGrow: 1 }}>
            {item.image_url && (
              <CardMedia
                component="img"
                height="200"
                image={item.image_url}
                alt={item.name}
                sx={{ objectFit: 'cover' }}
              />
            )}
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h5" component="span">
                  {getCuisineFlag(item.cuisine)}
                </Typography>
                <Typography variant="h6" component="div">
                  {item.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                <Chip label={item.cuisine} size="small" color="primary" />
              </Box>
              {item.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.description}
                </Typography>
              )}
              {item.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <PlaceIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {item.location}
                  </Typography>
                </Box>
              )}
              {(item.tiktok_url || item.video_url) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <VideoIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Video available
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <DateIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Added {format(new Date(item.created_at), 'MMM d, yyyy')}
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
});

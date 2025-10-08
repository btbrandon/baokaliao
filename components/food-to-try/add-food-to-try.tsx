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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CreateFoodToTryInput } from '@/types/food-to-try';
import { PlaceSearch } from './place-search';

interface AddFoodToTryProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateFoodToTryInput) => Promise<void>;
  initialData?: CreateFoodToTryInput;
}

const CUISINE_OPTIONS = [
  'American',
  'Argentinian',
  'Australian',
  'Austrian',
  'Belgian',
  'British',
  'Canadian',
  'Chinese',
  'Colombian',
  'Czech',
  'Danish',
  'Dutch',
  'Eastern European',
  'Egyptian',
  'Ethiopian',
  'Filipino',
  'French',
  'Fusion',
  'German',
  'Greek',
  'Hawaiian',
  'Indian',
  'Indonesian',
  'Irish',
  'Italian',
  'Japanese',
  'Korean',
  'Malaysian',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Moroccan',
  'Nepalese',
  'Norwegian',
  'Portuguese',
  'Russian',
  'Scandinavian',
  'Scottish',
  'Singaporean',
  'Spanish',
  'Swedish',
  'Swiss',
  'Taiwanese',
  'Thai',
  'Turkish',
  'Vietnamese',
  'Other',
];

export function AddFoodToTry({ open, onClose, onSave, initialData }: AddFoodToTryProps) {
  const [formData, setFormData] = useState<CreateFoodToTryInput>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    cuisine: initialData?.cuisine || '',
    location: initialData?.location || '',
    address: initialData?.address || '',
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
    google_place_id: initialData?.google_place_id || '',
    tiktok_url: initialData?.tiktok_url || '',
    video_url: initialData?.video_url || '',
    image_url: initialData?.image_url || '',
    status: initialData?.status || 'to_try',
  });

  const [loading, setLoading] = useState(false);

  // Reset form data when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData?.name || '',
        description: initialData?.description || '',
        cuisine: initialData?.cuisine || '',
        location: initialData?.location || '',
        address: initialData?.address || '',
        latitude: initialData?.latitude,
        longitude: initialData?.longitude,
        google_place_id: initialData?.google_place_id || '',
        tiktok_url: initialData?.tiktok_url || '',
        video_url: initialData?.video_url || '',
        image_url: initialData?.image_url || '',
        status: initialData?.status || 'to_try',
      });
    }
  }, [open, initialData]);

  const handleChange = (field: keyof CreateFoodToTryInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceSelect = (
    placeName: string,
    address: string,
    latitude: number,
    longitude: number,
    placeId?: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      location: placeName,
      address,
      latitude,
      longitude,
      google_place_id: placeId,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.cuisine) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
      setFormData({
        name: '',
        description: '',
        cuisine: '',
        location: '',
        address: '',
        latitude: undefined,
        longitude: undefined,
        google_place_id: '',
        tiktok_url: '',
        video_url: '',
        image_url: '',
        status: 'to_try',
      });
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData ? 'Edit Food to Try' : 'Add Food to Try'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={2}
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel>Cuisine</InputLabel>
            <Select
              value={formData.cuisine}
              label="Cuisine"
              onChange={(e) => handleChange('cuisine', e.target.value)}
            >
              {CUISINE_OPTIONS.map((cuisine) => (
                <MenuItem key={cuisine} value={cuisine}>
                  {cuisine}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <PlaceSearch onPlaceSelect={handlePlaceSelect} />

          <TextField
            label="Location Name"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Enter location manually or search above"
            fullWidth
            helperText="You can enter a location name even if not found in search"
          />

          <TextField
            label="TikTok URL"
            value={formData.tiktok_url}
            onChange={(e) => handleChange('tiktok_url', e.target.value)}
            placeholder="https://www.tiktok.com/@username/video/..."
            fullWidth
          />

          <TextField
            label="Video URL"
            value={formData.video_url}
            onChange={(e) => handleChange('video_url', e.target.value)}
            placeholder="Other video URL (YouTube, Instagram, etc.)"
            fullWidth
          />

          <TextField
            label="Image URL"
            value={formData.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="https://..."
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || !formData.cuisine || loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

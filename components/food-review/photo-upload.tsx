'use client';

import { useState, useRef } from 'react';
import { Box, Button, IconButton, ImageList, ImageListItem, CircularProgress } from '@mui/material';
import { PhotoCamera, Delete as DeleteIcon } from '@mui/icons-material';

interface PhotoUploadProps {
  onPhotosChange: (photoUrls: string[]) => void;
  maxPhotos?: number;
  existingPhotos?: string[];
}

export const PhotoUpload = ({
  onPhotosChange,
  maxPhotos = 10,
  existingPhotos = [],
}: PhotoUploadProps) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/food-photos', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload photo');
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newPhotos = [...photos, ...uploadedUrls];
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <Button
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={20} /> : <PhotoCamera />}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || photos.length >= maxPhotos}
        fullWidth
      >
        {uploading ? 'Uploading...' : `Upload Photos (${photos.length}/${maxPhotos})`}
      </Button>

      {photos.length > 0 && (
        <ImageList cols={3} gap={8} sx={{ mt: 2 }}>
          {photos.map((photo, index) => (
            <ImageListItem key={index} sx={{ position: 'relative' }}>
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                loading="lazy"
                style={{ borderRadius: 8, height: 150, objectFit: 'cover' }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'error.main', color: 'white' },
                }}
                size="small"
                onClick={() => handleRemovePhoto(index)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
};

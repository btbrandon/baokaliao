'use client';

import { useState } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import { searchPlaces, GeocodingResult } from '@/utils/geocoding/google';

interface PlaceSearchProps {
  onPlaceSelect: (
    placeName: string,
    address: string,
    latitude: number,
    longitude: number,
    placeId?: string
  ) => void;
}

export function PlaceSearch({ onPlaceSelect }: PlaceSearchProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchPlaces(query);
      setOptions(results);
    } catch (error) {
      console.error('Error searching places:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      inputValue={inputValue}
      onInputChange={(_, newValue) => {
        setInputValue(newValue);
        handleSearch(newValue);
      }}
      onChange={(_, value) => {
        if (value) {
          const placeName = value.name || value.display_name.split(',')[0];
          onPlaceSelect(placeName, value.display_name, value.lat, value.lon, value.place_id);
        }
      }}
      getOptionLabel={(option) => option.display_name}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Location"
          placeholder="Type to search..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { TextField, Autocomplete, CircularProgress, Box, Typography } from '@mui/material';
import { debounce } from '@mui/material/utils';

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface PlaceSearchProps {
  onSelect: (place: PlaceResult) => void;
  value?: string;
}

export const PlaceSearch = ({ onSelect, value }: PlaceSearchProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPlaces = useCallback(
    debounce(async (input: string) => {
      if (!input || input.length < 3) {
        setOptions([]);
        return;
      }

      setLoading(true);

      try {
        // Call our server-side proxy which uses Google Maps Places API
        const response = await fetch(`/api/geocode/search?` + new URLSearchParams({ q: input }));
        if (!response.ok) throw new Error('Failed to search places');
        const data = await response.json();

        const places: PlaceResult[] = (data.results || []).map((item: any) => ({
          place_id: item.place_id,
          name: item.name,
          formatted_address: item.formatted_address,
          geometry: item.geometry,
        }));

        setOptions(places);
      } catch (error) {
        console.error('Error searching places:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (inputValue) {
      searchPlaces(inputValue);
    } else {
      setOptions([]);
    }
  }, [inputValue, searchPlaces]);

  return (
    <Autocomplete
      fullWidth
      options={options}
      loading={loading}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
      filterOptions={(x) => x}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue !== 'string') {
          onSelect(newValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search for a place (name, address, or postal code)"
          placeholder="e.g., 123 Main St, 10001, or Restaurant Name"
          helperText="Powered by Google Maps"
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
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Typography variant="body1">{option.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.formatted_address}
            </Typography>
          </Box>
        </Box>
      )}
    />
  );
};

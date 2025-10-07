/**
 * Get color based on rating value
 * Red: 0-2.5 (poor)
 * Yellow/Orange: 2.5-3.5 (average)
 * Green: 3.5-5 (good)
 */
export const getRatingColor = (rating: number): string => {
  if (rating >= 3.5) {
    return '#22c55e'; // Green
  } else if (rating >= 2.5) {
    return '#f59e0b'; // Orange/Yellow
  } else {
    return '#ef4444'; // Red
  }
};

/**
 * Get MUI color name based on rating value
 */
export const getRatingColorMui = (rating: number): 'success' | 'warning' | 'error' => {
  if (rating >= 3.5) {
    return 'success'; // Green
  } else if (rating >= 2.5) {
    return 'warning'; // Orange/Yellow
  } else {
    return 'error'; // Red
  }
};

/**
 * Get background color for rating chips
 */
export const getRatingBgColor = (rating: number): string => {
  if (rating >= 3.5) {
    return 'rgba(34, 197, 94, 0.1)'; // Light green
  } else if (rating >= 2.5) {
    return 'rgba(245, 158, 11, 0.1)'; // Light orange
  } else {
    return 'rgba(239, 68, 68, 0.1)'; // Light red
  }
};

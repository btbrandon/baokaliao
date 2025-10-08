'use client';

import { useEffect } from 'react';
import { Box, Container, Typography, Button, Paper, Alert } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const isMissingEnvVars = error.message?.includes('Missing Supabase environment variables');

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 600,
          }}
        >
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />

          <Typography variant="h4" gutterBottom>
            Something went wrong!
          </Typography>

          {isMissingEnvVars ? (
            <Alert severity="error" sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Missing Environment Variables
              </Typography>
              <Typography variant="body2" paragraph>
                The application is missing required Supabase configuration.
              </Typography>
              <Typography variant="body2" component="div">
                <strong>If you're the developer:</strong>
                <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                  <li>Go to Cloudflare Pages Dashboard</li>
                  <li>Navigate to Settings → Environment variables</li>
                  <li>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  <li>Redeploy the application</li>
                </ol>
              </Typography>
            </Alert>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error.message || 'An unexpected error occurred. Please try again.'}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={reset} size="large">
              Try Again
            </Button>
            <Button variant="outlined" href="/" size="large">
              Go Home
            </Button>
          </Box>

          {error.digest && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
              Error ID: {error.digest}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

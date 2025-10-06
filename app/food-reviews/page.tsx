'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Fab,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Add as AddIcon, List as ListIcon, Map as MapIcon } from '@mui/icons-material';
import { AppNavigation } from '@/components/app-navigation';
import { AddFoodReview } from '@/components/food-review/add-food-review';
import { FoodReviewsList } from '@/components/food-review/food-reviews-list';
import { ReviewsMap } from '@/components/food-review/reviews-map';
import { FoodReviewDetails } from '@/components/food-review/food-review-details';
import { createClient } from '@/lib/supabase/client';
import { useStores } from '@/stores';

export default function FoodReviewsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { userStore } = useStores();
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        userStore.setUser(user);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleViewReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setDetailsDialogOpen(true);
  };

  const handleEditReview = (reviewId: string) => {
    setEditReviewId(reviewId);
    setAddDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedReviewId(null);
  };

  const handleCloseAdd = () => {
    setAddDialogOpen(false);
    setEditReviewId(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppNavigation />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          mt: 8, // Account for fixed AppBar height
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
          >
            <Typography variant="h4" component="h1">
              Food Reviews
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="list" aria-label="list view">
                  <ListIcon sx={{ mr: 1 }} />
                  List
                </ToggleButton>
                <ToggleButton value="map" aria-label="map view">
                  <MapIcon sx={{ mr: 1 }} />
                  Map
                </ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Add Review
              </Button>
            </Box>
          </Box>

          {viewMode === 'list' ? (
            <FoodReviewsList onView={handleViewReview} onEdit={handleEditReview} />
          ) : (
            <ReviewsMap onViewReview={handleViewReview} />
          )}

          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              display: { xs: 'flex', sm: 'none' },
            }}
            onClick={() => setAddDialogOpen(true)}
          >
            <AddIcon />
          </Fab>

          <AddFoodReview
            open={addDialogOpen}
            onClose={handleCloseAdd}
            onSuccess={handleCloseAdd}
            reviewId={editReviewId}
          />

          <FoodReviewDetails
            reviewId={selectedReviewId}
            open={detailsDialogOpen}
            onClose={handleCloseDetails}
            onEdit={handleEditReview}
          />
        </Container>
      </Box>
    </Box>
  );
}

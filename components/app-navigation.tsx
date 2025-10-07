'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  MdMenu,
  MdAccountCircle,
  MdLogout,
  MdDashboard,
  MdRestaurant,
  MdDarkMode,
  MdLightMode,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import { Menu as MenuIcon } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { useStores } from '@/stores';
import { useTheme as useCustomTheme } from '@/contexts/theme-context';

const DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 72;

export const AppNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { userStore, expensesStore, budgetStore, foodReviewStore } = useStores();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Load drawer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setDrawerOpen(savedState === 'true');
    }
  }, []);

  // Save drawer state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', drawerOpen.toString());
  }, [drawerOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear all stores on logout
    userStore.clearUser();
    expensesStore.clear();
    budgetStore.clear();
    foodReviewStore.clear();
    router.push('/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <MdDashboard size={24} /> },
    { label: 'Food Reviews', path: '/food-reviews', icon: <MdRestaurant size={24} /> },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {/* Permanent Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: drawerOpen ? 'space-between' : 'center',
            px: drawerOpen ? 2 : 1,
            py: 2,
            minHeight: 64,
          }}
        >
          {drawerOpen && (
            <Box>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                BaoKaLiao
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Your all-in-one app
              </Typography>
            </Box>
          )}
          <IconButton
            onClick={toggleDrawer(!drawerOpen)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {drawerOpen ? <MdChevronLeft size={24} /> : <MdChevronRight size={24} />}
          </IconButton>
        </Box>

        <Divider />

        {/* Navigation Items */}
        <List sx={{ px: 1, py: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={pathname === item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    bgcolor: pathname === item.path ? undefined : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: pathname === item.path ? 'white' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        {/* Theme Toggle at Bottom */}
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <ListItemButton
            onClick={toggleTheme}
            sx={{
              minHeight: 48,
              justifyContent: drawerOpen ? 'initial' : 'center',
              px: 2.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: drawerOpen ? 2 : 'auto',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              {isDarkMode ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
            </ListItemIcon>
            {drawerOpen && <ListItemText primary={isDarkMode ? 'Light Mode' : 'Dark Mode'} />}
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer - 1,
          width: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)`,
          ml: `${drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px`,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <IconButton onClick={handleMenuOpen} size="large">
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <MdAccountCircle size={20} />
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {userStore.userEmail}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <MdLogout size={18} />
              </Box>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </>
  );
};

import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Adjust path as needed

const DashboardHeader = ({ toggleSidebar }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary?.third || theme.palette.primary.contrastText, // fallback
        padding: '0 16px',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <IconButton edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
          <MenuIcon fontSize="large" />
        </IconButton>

        <Typography variant="h6">
          Hello, {user?.name || 'Guest'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton>
            <AccountCircleIcon fontSize="large" />
          </IconButton>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              ml: 2,
              color: theme.palette.secondary?.third || theme.palette.primary.contrastText,
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;

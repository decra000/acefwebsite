import React, { useState } from 'react';
import Sidebar from './SideBar';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import { Box } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Header */}
      <DashboardHeader toggleSidebar={toggleSidebar} handleLogout={handleLogout} />

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Outlet /> {/* This renders nested page routes */}
        </Box>
      </Box>

      {/* Footer */}
      <DashboardFooter />
    </Box>
  );
};

export default AdminDashboard;

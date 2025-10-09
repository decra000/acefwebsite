import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
import { Box, Alert, Typography, Button } from '@mui/material';
import { Lock as LockIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// UPDATED: Route configuration with synchronized permission requirements
const ROUTE_PERMISSIONS = {
  // --- Admin only routes ---
  '/admin/dashboard/users': { roles: ['admin'], permission: null },
  '/admin/dashboard/countries': { roles: ['admin'], permission: null },
  '/admin/dashboard/generator': { roles: ['admin'], permission: null },
  '/admin/dashboard/manage-transactions': { roles: ['admin'], permission: null },
  '/admin/dashboard/whatsapp': { roles: ['admin'], permission: null },
  '/admin/dashboard/managedonate': { roles: ['admin'], permission: null },
  '/admin/dashboard/manage-logo': { roles: ['admin'], permission: null },

  // --- Admin + Assistant Admin routes (Core CMS) ---
  '/admin/dashboard/manage-blogs': { roles: ['admin', 'Assistant Admin', 'Content Manager'], permission: 'manage_content' },
  '/admin/dashboard/projects': { roles: ['admin', 'Assistant Admin'], permission: 'manage_projects' },
  '/admin/dashboard/JobManager': { roles: ['admin', 'Assistant Admin'], permission: 'manage_jobs' },
  '/admin/dashboard/jobs': { roles: ['admin', 'Assistant Admin'], permission: 'manage_jobs' },
  '/admin/dashboard/team': { roles: ['admin', 'Assistant Admin'], permission: 'manage_team' },
  '/admin/dashboard/partners': { roles: ['admin', 'Assistant Admin'], permission: 'manage_partners' },
  '/admin/dashboard/newsletter': { roles: ['admin', 'Assistant Admin'], permission: 'manage_newsletter' },
  '/admin/dashboard/manage-videos': { roles: ['admin', 'Assistant Admin'], permission: 'manage_videos' },
  '/admin/dashboard/contacts': { roles: ['admin', 'Assistant Admin'], permission: 'manage_contacts' },
  '/admin/dashboard/volunteers': { roles: ['admin', 'Assistant Admin'], permission: 'manage_volunteers' },
  '/admin/dashboard/impact': { roles: ['admin', 'Assistant Admin'], permission: 'manage_impact' },
  '/admin/dashboard/categories': { roles: ['admin'], permission: null },

  // --- Newly added permission-based routes (FIXED KEYS) ---
  '/admin/dashboard/pillars': { roles: ['admin', 'Assistant Admin'], permission: 'pillars' },
  '/admin/dashboard/events': { roles: ['admin', 'Assistant Admin'], permission: 'events' },
  '/admin/dashboard/collaboration': { roles: ['admin', 'Assistant Admin'], permission: 'collaboration' },
  '/admin/dashboard/highlights': { roles: ['admin', 'Assistant Admin'], permission: 'highlights' },
  '/admin/dashboard/gallerymanager': { roles: ['admin', 'Assistant Admin'], permission: 'gallerymanager' },
  '/admin/dashboard/adminmanagegeneraltestimonials': { roles: ['admin', 'Assistant Admin'], permission: 'adminmanagegeneraltestimonials' },
  '/admin/dashboard/mission-vision': { roles: ['admin', 'Assistant Admin'], permission: 'mission-vision' },
  '/admin/dashboard/AdminManageCoreValues': { roles: ['admin', 'Assistant Admin'], permission: 'AdminManageCoreValues' },
  '/admin/dashboard/AdminManageEmailAccounts': { roles: ['admin', 'Assistant Admin'], permission: 'AdminManageEmailAccounts' },
  '/admin/dashboard/AdminManageGithubTokens': { roles: ['admin', 'Assistant Admin'], permission: 'AdminManageGithubTokens' },

  // --- Dashboard overview (general access for authenticated users) ---
  '/admin/dashboard': { roles: ['admin', 'Assistant Admin', 'Content Manager'], permission: null }
};

// Helper: readable route names
const getRouteDisplayName = (path) => {
  const routeNames = {
    '/admin/dashboard/users': 'User Management',
    '/admin/dashboard/countries': 'Country Management',
    '/admin/dashboard/categories': 'Category Management',
    '/admin/dashboard/manage-blogs': 'Blog Management',
    '/admin/dashboard/projects': 'Project Management',
    '/admin/dashboard/JobManager': 'Job Management',
    '/admin/dashboard/jobs': 'Job Management',
    '/admin/dashboard/team': 'Team Management',
    '/admin/dashboard/partners': 'Partner Management',
    '/admin/dashboard/newsletter': 'Newsletter Management',
    '/admin/dashboard/manage-videos': 'Video Management',
    '/admin/dashboard/contacts': 'Contact Management',
    '/admin/dashboard/volunteers': 'Volunteer Management',
    '/admin/dashboard/impact': 'Impact Management',
    '/admin/dashboard/generator': 'Badge Generator',
    '/admin/dashboard/manage-logo': 'Logo Management',
    '/admin/dashboard/manage-transactions': 'Transaction Management',
    '/admin/dashboard/whatsapp': 'WhatsApp Management',
    '/admin/dashboard/managedonate': 'Donation Management',

    // New route names
    '/admin/dashboard/pillars': 'Pillars Management',
    '/admin/dashboard/events': 'Event Management',
    '/admin/dashboard/collaboration': 'Collaboration Reports',
    '/admin/dashboard/highlights': 'Highlights Management',
    '/admin/dashboard/gallerymanager': 'Gallery Management',
    '/admin/dashboard/adminmanagegeneraltestimonials': 'General Testimonials Management',
    '/admin/dashboard/mission-vision': 'Mission & Vision',
    '/admin/dashboard/AdminManageCoreValues': 'Core Values Management',
    '/admin/dashboard/AdminManageEmailAccounts': 'Email Accounts Management',
    '/admin/dashboard/AdminManageGithubTokens': 'Model Tokens Management'
  };
  return routeNames[path] || 'this page';
};

// Permission denied component
const PermissionDeniedPage = ({ routeName, requiredPermission }) => {
  const { user } = useAuth();

  const getPermissionDisplayName = (permission) => {
    const permissionMap = {
      'manage_content': 'Content Management',
      'manage_projects': 'Project Management',
      'manage_team': 'Team Management',
      'manage_partners': 'Partner Management',
      'manage_contacts': 'Contact Management',
      'manage_volunteers': 'Volunteer Management',
      'manage_newsletter': 'Newsletter Management',
      'view_donations': 'Donation Viewing',
      'manage_videos': 'Video Management',
      'manage_impact': 'Impact Management',
      'manage_jobs': 'Job Management',
      'pillars': 'Pillars Management',
      'events': 'Event Management',
      'collaboration': 'Collaboration Reports',
      'highlights': 'Highlights Management',
      'gallerymanager': 'Gallery Management',
      'adminmanagegeneraltestimonials': 'General Testimonials Management',
      'mission-vision': 'Mission & Vision Editing',
      'AdminManageCoreValues': 'Core Values Management',
      'AdminManageEmailAccounts': 'Email Accounts Management',
      'AdminManageGithubTokens': 'Model Tokens Management',
      'AdminVolunteerManagement': 'Volunteer Admin Management',
      'manage_users': 'User Management'
    };
    return permissionMap[permission] || permission;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 4
      }}
    >
      <LockIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />

      <Typography variant="h4" gutterBottom color="textPrimary">
        Permission Required
      </Typography>

      <Typography variant="body1" sx={{ mb: 2, maxWidth: 500 }}>
        {user?.role === 'Assistant Admin'
          ? `You need the "${getPermissionDisplayName(requiredPermission)}" permission to access ${routeName || 'this page'}.`
          : `Your ${user?.role} role doesn't have access to ${routeName || 'this page'}.`}
      </Typography>

      {user?.role === 'Assistant Admin' && (
        <Alert severity="info" sx={{ mb: 3, maxWidth: 500 }}>
          <Typography variant="body2">
            Contact your administrator to request the <strong>{getPermissionDisplayName(requiredPermission)}</strong> permission.
          </Typography>
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={() => window.history.back()}
        sx={{ mt: 2 }}
      >
        Go Back
      </Button>
    </Box>
  );
};

// Auth routes
export const PrivateRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

// Permission-based protection
export const PermissionRoute = ({ path, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const routeConfig = ROUTE_PERMISSIONS[path];
  if (!routeConfig) return children ? children : <Outlet />;

  if (!routeConfig.roles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;

  if (user.role === 'admin') return children ? children : <Outlet />;

  if (routeConfig.permission) {
    if (user.role === 'Assistant Admin') {
      if (!user.permissions || !user.permissions.includes(routeConfig.permission)) {
        return <PermissionDeniedPage routeName={getRouteDisplayName(path)} requiredPermission={routeConfig.permission} />;
      }
    }

    if (user.role === 'Content Manager') {
      if (routeConfig.permission === 'manage_content') {
        return children ? children : <Outlet />;
      }
      return <PermissionDeniedPage routeName={getRouteDisplayName(path)} requiredPermission={routeConfig.permission} />;
    }
  }

  return children ? children : <Outlet />;
};

// Component-level wrapper
export const ProtectedComponent = ({ children, requiredRole = null, requiredPermission = null }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && !requiredRole.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  if (user.role === 'admin') return children;

  if (requiredPermission) {
    if (user.role === 'Assistant Admin') {
      if (!user.permissions || !user.permissions.includes(requiredPermission)) {
        return <PermissionDeniedPage requiredPermission={requiredPermission} />;
      }
    } else if (user.role === 'Content Manager') {
      if (requiredPermission !== 'manage_content') {
        return <PermissionDeniedPage requiredPermission={requiredPermission} />;
      }
    }
  }

  return children;
};

export default {
  PrivateRoute,
  AdminRoute,
  PermissionRoute,
  ProtectedComponent
};
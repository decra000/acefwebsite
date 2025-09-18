import React, { useState, useEffect } from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Typography, Box, Avatar, IconButton, Skeleton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Work as WorkIcon,
  ChevronLeft as ChevronLeftIcon,
  Newspaper as NewspaperIcon,
  Image as ImageIcon,
  Group as TeamIcon,
  Business as PartnersIcon,
  ContactMail as ContactIcon,
  WhatsApp as WhatsAppIcon,
  VolunteerActivism as VolunteerIcon,
  Assessment as ImpactIcon,
  MonetizationOn as DonationIcon,
  Email as NewsletterIcon,
  VideoLibrary as VideoIcon,
  AutoFixHigh as GeneratorIcon,
  Receipt as TransactionIcon,
  Public as CountryIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../../context/AuthContext';
import { useLogo } from '../../../context/LogoContext';

// Define all possible menu items with their permission requirements
const ALL_MENU_ITEMS = [
  {
    id: 'overview',
    text: 'Overview',
    icon: <DashboardIcon />,
    path: '/admin/dashboard',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: null, // Always available for admin and assistant admin
    order: 1
  },
  {
    id: 'manage_blogs',
    text: 'Manage Blogs',
    icon: <NewspaperIcon />,
    path: '/admin/dashboard/manage-blogs',
    requiredRole: ['admin', 'Assistant Admin', 'Content Manager'],
    requiredPermission: 'manage_content',
    order: 2
  },
  {
    id: 'projects',
    text: 'Projects',
    icon: <ArticleIcon />,
    path: '/admin/dashboard/projects',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'manage_projects',
    order: 3
  },
  {
    id: 'jobs',
    text: 'Jobs',
    icon: <WorkIcon />,
    path: '/admin/dashboard/jobmanager',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'manage_jobs',
    order: 4
  },
  {
    id: 'users',
    text: 'Users',
    icon: <PeopleIcon />,
    path: '/admin/dashboard/users',
    requiredRole: ['admin'],
    requiredPermission: null, // Admin only - no permission needed
    order: 5
  },
  {
    id: 'countries',
    text: 'Countries',
    icon: <CountryIcon />,
    path: '/admin/dashboard/countries',
    requiredRole: ['admin'],
    requiredPermission: null,
    order: 6
  },
  {
    id: 'categories',
    text: 'Focus Areas',
    icon: <CategoryIcon />,
    path: '/admin/dashboard/categories',
    requiredRole: ['admin'],
    requiredPermission: null,
    order: 7
  },
  {
    id: 'team',
    text: 'Team',
    icon: <TeamIcon />,
    path: '/admin/dashboard/team',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'manage_team',
    order: 8
  },
  {
    id: 'partners',
    text: 'Partners',
    icon: <PartnersIcon />,
    path: '/admin/dashboard/partners',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'manage_partners',
    order: 9
  },
  {
    id: 'generator',
    text: 'Generator',
    icon: <GeneratorIcon />,
    path: '/admin/dashboard/generator',
    requiredRole: ['admin'],
    requiredPermission: null,
    order: 10
  },
  {
    id: 'newsletter',
    text: 'Newsletter',
    icon: <NewsletterIcon />,
    path: '/admin/dashboard/newsletter',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'manage_newsletter',
    order: 11
  },
  {
    id: 'videos',
    text: 'Videos',
    icon: <VideoIcon />,
    path: '/admin/dashboard/manage-videos',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'manage_videos',
    order: 12
  },

  {
    id: 'logo',
    text: 'Logo Management',
    icon: <ImageIcon />,
    path: '/admin/dashboard/manage-logo',
    requiredRole: ['admin'],
    requiredPermission: null,
    order: 13
  },
  {
    id: 'transactions',
    text: 'Transaction Details',
    icon: <TransactionIcon />,
    path: '/admin/dashboard/manage-transactions',
    requiredRole: ['admin'],
    requiredPermission: null,
    order: 14
  },
  {
    id: 'contacts',
    text: 'Contact Details',
    icon: <ContactIcon />,
    path: '/admin/dashboard/contacts',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'manage_contacts',
    order: 15
  },
  {
    id: 'whatsapp',
    text: 'WhatsApp Chat Contact',
    icon: <WhatsAppIcon />,
    path: '/admin/dashboard/whatsapp',
    requiredRole: ['admin'],
    requiredPermission: null,
    order: 16
  },
  {
    id: 'volunteers',
    text: 'Volunteer Forms',
    icon: <VolunteerIcon />,
    path: '/admin/dashboard/volunteers',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'manage_volunteers',
    order: 17
  },
  {
    id: 'impact',
    text: 'Impact Statistics',
    icon: <ImpactIcon />,
    path: '/admin/dashboard/impact',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'manage_impact',
    order: 18
  },
  {
    id: 'donations',
    text: 'Manage Donation',
    icon: <DonationIcon />,
    path: '/admin/dashboard/managedonate',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'view_donations',
    order: 19
  },
    {
    id: 'pillars',
    text: 'Pillars',
    icon: <VideoIcon />,
    path: '/admin/dashboard/pillars',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'pillars',
    order: 20
  },
     {
    id: 'events',
    text: 'Events',
    icon: <VideoIcon />,
    path: '/admin/dashboard/events',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'events',
    order: 21
  },
    {
    id: 'collaboration',
    text: 'Collaboration Reports',
    icon: <VideoIcon />,
    path: '/admin/dashboard/collaboration',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'collaboration',
    order: 22
  },
   {
    id: 'highlights',
    text: 'Highlights',
    icon: <VideoIcon />,
    path: '/admin/dashboard/highlights',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'highlights',
    order: 23
  },
  {
    id: 'gallerymanager',
    text: 'Gallery Manager',
    icon: <VideoIcon />,
    path: '/admin/dashboard/gallerymanager',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'gallerymanager',
    order: 24
  },
    {
    id: 'adminmanagegeneraltestimonials',
    text: 'General Testimonials',
    icon: <VideoIcon />,
    path: '/admin/dashboard/adminmanagegeneraltestimonials',
    requiredRole: ['admin', 'Assistant Admin'],
    requiredPermission: 'adminmanagegeneraltestimonials',
    order: 25
  },



];
const Sidebar = ({ open, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [selectedPath, setSelectedPath] = useState(location.pathname);
  const { user } = useAuth();
  
  // Use Logo Context
  const { currentLogo, loading: logoLoading, refreshLogo } = useLogo();

  // Function to check if user has access to a menu item
  const hasAccess = (menuItem) => {
    if (!user) return false;

    // Check role requirement
    if (!menuItem.requiredRole.includes(user.role)) {
      return false;
    }

    // If it's admin role, they have access to everything
    if (user.role === 'admin') {
      return true;
    }

    // If no specific permission is required, user has access
    if (!menuItem.requiredPermission) {
      return true;
    }

    // For Assistant Admin, check if they have the required permission
    if (user.role === 'Assistant Admin') {
      return user.permissions && user.permissions.includes(menuItem.requiredPermission);
    }

    // For Content Manager, check specific permissions
    if (user.role === 'Content Manager') {
      // Content managers can always access blogs
      if (menuItem.id === 'manage_blogs') {
        return true;
      }
      // Add any other Content Manager specific access here
      return false;
    }

    return false;
  };

  // Get filtered menu items based on user permissions
  const getMenuItems = () => {
    if (!user) return [];

    const accessibleItems = ALL_MENU_ITEMS
      .filter(hasAccess)
      .sort((a, b) => a.order - b.order);

    // Always add logout at the end
    accessibleItems.push({
      id: 'logout',
      text: 'Logout',
      icon: <LogoutIcon />,
      path: '/login',
      requiredRole: ['admin', 'Assistant Admin', 'Content Manager'],
      requiredPermission: null,
      order: 999
    });

    return accessibleItems;
  };

  // Refresh logo when navigating to/from logo management page
  useEffect(() => {
    if (location.pathname === '/admin/dashboard/manage-logo') {
      const timer = setTimeout(refreshLogo, 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, refreshLogo]);

  const handleNavigation = (path) => {
    // Handle logout separately
    if (path === '/login') {
      // You might want to call a logout function here
      // logout(); // Uncomment if you have a logout function in AuthContext
    }
    
    navigate(path);
    setSelectedPath(path);
    
    // If navigating away from logo management, refresh logo to catch any changes
    if (selectedPath === '/admin/dashboard/manage-logo' && path !== '/admin/dashboard/manage-logo') {
      setTimeout(refreshLogo, 100);
    }
  };

  const handleLogoClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard/manage-logo');
      setSelectedPath('/admin/dashboard/manage-logo');
    }
  };

  // Determine logo source
  const getLogoSrc = () => {
    if (currentLogo?.full_url) {
      return currentLogo.full_url;
    }
    return "/assets/ELP.png";
  };

  const getLogoAlt = () => {
    if (currentLogo?.alt_text) {
      return currentLogo.alt_text;
    }
    return "ACEF Logo";
  };

  // Get user role display with permissions info
  const getUserRoleDisplay = () => {
    if (!user) return '';
    
    let roleText = user.role;
    if (user.role === 'Assistant Admin' && user.permissions?.length > 0) {
      roleText += ` (${user.permissions.length} perms)`;
    }
    return roleText;
  };

  const menuItems = getMenuItems();

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? 240 : 0,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.secondary.third,
          transition: 'width 0.3s ease'
        },
      }}
    >
      {/* Sidebar Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {logoLoading ? (
            <Skeleton variant="circular" width={60} height={60} sx={{ mr: 1 }} />
          ) : (
            <Avatar 
              src={getLogoSrc()}
              alt={getLogoAlt()}
              sx={{ 
                width: 60, 
                height: 60, 
                mr: 1,
                cursor: user?.role === 'admin' ? 'pointer' : 'default',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                border: '2px solid rgba(255,255,255,0.2)',
                '&:hover': user?.role === 'admin' ? {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.4)',
                } : {}
              }}
              onClick={handleLogoClick}
              title={user?.role === 'admin' ? 'Click to manage logo' : getLogoAlt()}
            />
          )}
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>ACEF</Typography>
            {user && (
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.7, 
                  fontSize: '0.7rem',
                  display: 'block',
                  lineHeight: 1
                }}
              >
                {user.role === 'admin' && 'Click logo to edit'}
                {user.role !== 'admin' && getUserRoleDisplay()}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={toggleSidebar}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      {/* User Info Section */}
      {user && (
        <Box sx={{ px: 2, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.8rem' }}>
            Logged in as:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>
            {user.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.7rem' }}>
            {getUserRoleDisplay()}
          </Typography>
        </Box>
      )}

      {/* Sidebar Menu */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            sx={{
              backgroundColor: selectedPath === item.path ? theme.palette.secondary.third : 'inherit',
              color: selectedPath === item.path ? '#fff' : theme.palette.secondary.third,
              cursor: 'pointer',
              mx: 1,
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: selectedPath === item.path 
                  ? theme.palette.secondary.third 
                  : 'rgba(255,255,255,0.1)',
                color: '#fff'
              }
            }}
            component="div"
          >
            <ListItemIcon sx={{ 
              color: selectedPath === item.path ? '#fff' : theme.palette.secondary.third,
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: selectedPath === item.path ? 'medium' : 'normal'
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Debug info for development (remove in production) */}
      {process.env.NODE_ENV === 'development' && user && (
        <Box sx={{ px: 2, py: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.6rem' }}>
            Debug: {user.role}
            {user.permissions && user.permissions.length > 0 && (
              <span> | Perms: {user.permissions.length}</span>
            )}
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

// Export the menu items configuration for use in other components
export { ALL_MENU_ITEMS };
export default Sidebar;
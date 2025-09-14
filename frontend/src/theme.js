// Enhanced theme.js - Complete theme system with Material-UI integration
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

// --- Color palette ---
export const colors = {
  primary: '#0a451c',
  secondary: '#facf3c',
  accent: '#9ccf9f',
  primaryLight: '#1a5a2c',
  primaryDark: '#052310',
  secondaryLight: '#fbd96b',
  secondaryDark: '#d4a920',
  accentLight: '#b8dfbb',
  accentDark: '#7ab87f',
  white: '#ffffffff',
  black: '#000000',
  gray50: '#ffffffff',
  gray100: '#ffffffff',
  gray200: '#ffffffff',
  gray300: '#ffffffff',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// --- Utility functions ---
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

// --- Custom theme definitions ---
export const lightTheme = {
  colors: {
    ...colors,
    background: colors.white,
    backgroundSecondary: colors.white,
    surface: colors.white,
    surfaceSecondary: colors.white,
    text: colors.gray900,
    textSecondary: colors.gray600,
    textMuted: colors.gray500,
    textInverse: colors.white,
    border: colors.gray200,
    borderLight: colors.gray100,
    borderHover: colors.gray300,
    headerBg: 'rgba(255, 255, 255, 0.95)',
    headerBgScrolled: 'rgba(255, 255, 255, 0.98)',
    headerBorder: `rgba(${hexToRgb(colors.primary)}, 0.1)`,
    headerShadow: 'rgba(0, 0, 0, 0.1)',
    cardBg: colors.white,
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    overlayBg: 'rgba(0, 0, 0, 0.5)',
  },
  name: 'light',
};

export const darkTheme = {
  colors: {
    ...colors,
    background: colors.black,
    backgroundSecondary: colors.black,
    surface: colors.black,
    surfaceSecondary: colors.black,
    text: colors.gray50,
    textSecondary: colors.gray300,
    textMuted: colors.gray400,
    textInverse: colors.gray900,
    border: colors.gray700,
    borderLight: colors.gray600,
    borderHover: colors.gray500,
    headerBg: colors.black,
    headerBgScrolled: colors.gray600,
    headerBorder: `rgba(${hexToRgb(colors.accent)}, 0.2)`,
    headerShadow: 'rgba(0, 0, 0, 0.3)',
    cardBg: colors.gray800,
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    overlayBg: 'rgba(0, 0, 0, 0.7)',
  },
  name: 'dark',
};

// --- Material-UI theme integration ---
export const createMuiTheme = (isDarkMode) => {
  const themeColors = isDarkMode ? darkTheme.colors : lightTheme.colors;
  
  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: themeColors.primary,
        light: themeColors.primaryLight,
        dark: themeColors.primaryDark,
        contrastText: themeColors.white,
      },
      secondary: {
        main: themeColors.secondary,
        light: themeColors.secondaryLight,
        dark: themeColors.secondaryDark,
        contrastText: themeColors.black,
      },
      background: {
        default: themeColors.background,
        paper: themeColors.surface,
      },
      text: {
        primary: themeColors.text,
        secondary: themeColors.textSecondary,
        disabled: themeColors.textMuted,
      },
      divider: themeColors.border,
      success: {
        main: themeColors.success,
      },
      warning: {
        main: themeColors.warning,
      },
      error: {
        main: themeColors.error,
      },
      info: {
        main: themeColors.info,
      },
    },
    typography: {

      fontFamily: '"Nunito Sans", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        color: themeColors.text,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
        color: themeColors.text,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
        color: themeColors.text,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
        color: themeColors.text,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
        color: themeColors.text,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.4,
        color: themeColors.text,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        color: themeColors.text,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
        color: themeColors.textSecondary,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 20px',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px rgba(${hexToRgb(themeColors.primary)}, 0.3)`,
            },
          },
          contained: {
            boxShadow: `0 2px 8px rgba(${hexToRgb(themeColors.primary)}, 0.2)`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: themeColors.cardBg,
            boxShadow: `0 4px 20px ${themeColors.cardShadow}`,
            border: `1px solid ${themeColors.border}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 30px ${themeColors.cardShadow}`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: themeColors.surface,
            borderRadius: 8,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: themeColors.headerBg,
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${themeColors.headerBorder}`,
            boxShadow: `0 2px 20px ${themeColors.headerShadow}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: themeColors.surface,
              '& fieldset': {
                borderColor: themeColors.border,
              },
              '&:hover fieldset': {
                borderColor: themeColors.borderHover,
              },
              '&.Mui-focused fieldset': {
                borderColor: themeColors.primary,
              },
            },
          },
        },
      },
    },
  });
};

// --- CSS variables generator ---
export const generateCSSVariables = (theme) => {
  const vars = {};
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
  });
  return vars;
};

// --- Theme context ---
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// --- Enhanced ThemeProvider ---
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem('acef-theme');
        if (savedTheme) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // Use system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDarkMode(prefersDark);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
        setIsDarkMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (isLoading) return;

    const theme = isDarkMode ? darkTheme : lightTheme;
    const cssVars = generateCSSVariables(theme);
    
    // Apply CSS variables
    Object.entries(cssVars).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    
    // Save preference
    try {
      localStorage.setItem('acef-theme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
    
    // Apply body class
    document.body.className = `theme-${theme.name}`;
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.primary);
    }
  }, [isDarkMode, isLoading]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('acef-theme');
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setTheme = (theme) => {
    setIsDarkMode(theme === 'dark');
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  const muiTheme = createMuiTheme(isDarkMode);

  const contextValue = {
    theme: currentTheme,
    muiTheme,
    colors: currentTheme.colors,
    isDarkMode,
    isLoading,
    toggleTheme,
    setTheme,
  };

  if (isLoading) {
    // Prevent flash of unstyled content
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDarkMode ? colors.gray900 : colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `4px solid ${colors.primary}`,
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- Theme utilities ---
export const getThemeColor = (colorKey, theme) => {
  return theme.colors[colorKey] || colorKey;
};

export const createGradient = (color1, color2, direction = 'to right') => {
  return `linear-gradient(${direction}, ${color1}, ${color2})`;
};

export const withOpacity = (color, opacity) => {
  if (color.startsWith('rgba')) return color;
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    return `rgba(${rgb}, ${opacity})`;
  }
  return color;
};
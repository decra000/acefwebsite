import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Alert,
  Container, InputAdornment, IconButton, Card, CardContent
} from '@mui/material';
import {
  Visibility, VisibilityOff, Lock as LockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const API_BASE = 'http://localhost:5000';

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('🔍 Validating token:', token);
        
        // FIXED: Use correct route
        const res = await fetch(`${API_BASE}/api/auth/validate-token/${token}`, {
          method: 'GET'
        });
        
        console.log('📡 Token validation response:', res.status);
        const data = await res.json();
        console.log('📦 Token validation data:', data);
        
        if (res.ok) {
          setTokenValid(true);
          setUserInfo(data.user);
          console.log('✅ Token is valid, user info:', data.user);
        } else {
          setTokenValid(false);
          setError(data.message || 'Invalid or expired activation link');
          console.log('❌ Token validation failed:', data.message);
        }
      } catch (err) {
        console.error('❌ Token validation error:', err);
        setTokenValid(false);
        setError('Unable to validate activation link');
      }
    };

    if (token) {
      validateToken();
    } else {
      console.log('❌ No token provided in URL');
      setTokenValid(false);
      setError('No activation token provided');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Activating account with token:', token);
      
      // FIXED: Use correct route
      const res = await fetch(`${API_BASE}/api/auth/activate/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      console.log('📡 Activation response:', res.status);
      const data = await res.json();
      console.log('📦 Activation data:', data);

      if (res.ok) {
        setSuccess(true);
        console.log('✅ Account activated successfully');
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Account activated successfully! Please log in.' }
          });
        }, 2000);
      } else {
        console.log('❌ Activation failed:', data.message);
        setError(data.message || 'Account activation failed');
      }
    } catch (err) {
      console.error('❌ Activation network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 25, text: 'Weak', color: 'error.main' };
    if (password.length < 8) return { strength: 50, text: 'Fair', color: 'warning.main' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 100, text: 'Strong', color: 'success.main' };
    }
    return { strength: 75, text: 'Good', color: 'info.main' };
  };

  const passwordStrength = getPasswordStrength();

  if (tokenValid === null) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Validating activation link...</Typography>
        </Paper>
      </Container>
    );
  }

  if (tokenValid === false) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Invalid or expired activation link'}
          </Alert>
          <Typography variant="h6" gutterBottom>
            Activation Link Invalid
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            This activation link is either invalid or has expired. Please contact your administrator for a new invitation.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="success.main">
            Account Activated Successfully!
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Your account has been activated. Redirecting to login...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LockIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Activate Your Account
            </Typography>
            {userInfo && (
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                Welcome <strong>{userInfo.name}</strong>! You're joining as <strong>{userInfo.role}</strong>.
              </Alert>
            )}
            <Typography variant="body1" color="textSecondary">
              Welcome to ACEF! Please set your password to complete your account activation.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />
              
              {password && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        height: 4,
                        flex: 1,
                        bgcolor: 'grey.200',
                        borderRadius: 2,
                        mr: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${passwordStrength.strength}%`,
                          bgcolor: passwordStrength.color,
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: passwordStrength.color }}>
                      {passwordStrength.text}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={confirmPassword && password !== confirmPassword}
              helperText={
                confirmPassword && password !== confirmPassword 
                  ? 'Passwords do not match' 
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? 'Activating Account...' : 'Activate Account'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Button 
                variant="text" 
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ActivateAccount;

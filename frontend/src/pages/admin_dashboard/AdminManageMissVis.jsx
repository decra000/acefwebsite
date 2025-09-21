import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { API_URL, STATIC_URL } from '../../config';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const ImageUploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '10',
    borderColor: theme.palette.primary.dark,
  },
}));

const PreviewImage = styled('img')({
  maxWidth: '100%',
  height: 'auto',
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
});

const HiddenInput = styled('input')({
  display: 'none',
});

const AdminManageMissVis = () => {
  // State Management
  const [data, setData] = useState({
    mission_text: '',
    vision_text: '',
    mission_image: null,
    vision_image: null,
    mission_image_url: null,
    vision_image_url: null
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [previewDialog, setPreviewDialog] = useState({ open: false, image: null, title: '' });
  const [newImages, setNewImages] = useState({ mission: null, vision: null });

  // Fetch Data
  useEffect(() => {
    fetchMissionVision();
  }, []);

  // Enhanced image URL generation to match display component
  const getImageUrl = (imageUrl) => {
    console.log('Admin - Processing image URL:', imageUrl);
    
    if (!imageUrl) return null;
    
    // Handle absolute URLs
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Handle data URLs
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // Handle blob URLs (for newly uploaded files)
    if (imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    
    // Check if it's a default/fallback image
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('/uploads')) {
      return imageUrl;
    }
    
    // Handle uploads - if it starts with /uploads, prepend STATIC_URL
    if (imageUrl.startsWith('/uploads/')) {
      const fullUrl = `${STATIC_URL}${imageUrl}`;
      console.log('Admin - Upload URL processed:', imageUrl, '->', fullUrl);
      return fullUrl;
    }
    
    // Handle just filename
    if (!imageUrl.includes('/')) {
      const fullUrl = `${STATIC_URL}/uploads/mission-vision/${imageUrl}`;
      console.log('Admin - Filename processed:', imageUrl, '->', fullUrl);
      return fullUrl;
    }
    
    // Fallback
    const fallbackUrl = `${STATIC_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    console.log('Admin - Fallback URL:', imageUrl, '->', fallbackUrl);
    return fallbackUrl;
  };

  // Fetch mission and vision data
  const fetchMissionVision = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/mission-vision`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Admin - Mission Vision data loaded:', result.data);
        setData(result.data);
      } else {
        showAlert('Failed to fetch Mission & Vision data', 'error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle save with enhanced error handling
  const handleSave = async () => {
    if (!data.mission_text.trim() || !data.vision_text.trim()) {
      showAlert('Both Mission and Vision text are required', 'error');
      return;
    }

    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('mission_text', data.mission_text.trim());
      formData.append('vision_text', data.vision_text.trim());
      
      if (newImages.mission) {
        formData.append('mission_image', newImages.mission);
      }
      if (newImages.vision) {
        formData.append('vision_image', newImages.vision);
      }

      const response = await fetch(`${API_URL}/mission-vision`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('Admin - Save successful:', result.data);
        setData(result.data);
        setNewImages({ mission: null, vision: null });
        showAlert('Mission & Vision updated successfully!', 'success');
      } else {
        showAlert(result.message || 'Failed to update Mission & Vision', 'error');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      showAlert('Error saving changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle remove image
  const handleRemoveImage = async (type) => {
    try {
      const response = await fetch(`${API_URL}/mission-vision/image/${type}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(prev => ({
          ...prev,
          [`${type}_image`]: null,
          [`${type}_image_url`]: null
        }));
        setNewImages(prev => ({
          ...prev,
          [type]: null
        }));
        showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} image removed successfully`, 'success');
      } else {
        showAlert(result.message || 'Failed to remove image', 'error');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      showAlert('Error removing image', 'error');
    }
  };

  // Handle Text Changes
  const handleTextChange = (field) => (event) => {
    setData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle Image Upload
  const handleImageUpload = (type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Image size should be less than 5MB', 'error');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showAlert('Only JPEG, PNG, and WebP images are allowed', 'error');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setNewImages(prev => ({
        ...prev,
        [type]: file
      }));

      setData(prev => ({
        ...prev,
        [`${type}_image_url`]: previewUrl
      }));
    }
  };

  // Preview Image
  const handlePreviewImage = (imageUrl, title) => {
    const processedUrl = getImageUrl(imageUrl);
    setPreviewDialog({ open: true, image: processedUrl, title });
  };

  // Show Alert
  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  // Render Image Section
  const renderImageSection = (type, title) => {
    const imageUrl = data[`${type}_image_url`];
    const processedImageUrl = getImageUrl(imageUrl);
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title} Image
        </Typography>
        
        {processedImageUrl ? (
          <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            <PreviewImage 
              src={processedImageUrl}
              alt={`${title} Preview`}
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
              onError={(e) => {
                console.error(`Image load error for ${type}:`, e.target.src);
              }}
            />
            <Box sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              display: 'flex', 
              gap: 1 
            }}>
              <IconButton
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' } 
                }}
                onClick={() => handlePreviewImage(imageUrl, title)}
              >
                <PreviewIcon />
              </IconButton>
              <IconButton
                size="small"
                sx={{ 
                  bgcolor: 'rgba(244,67,54,0.9)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(244,67,54,1)' } 
                }}
                onClick={() => handleRemoveImage(type)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <ImageUploadBox onClick={() => document.getElementById(`${type}-upload`).click()}>
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" color="primary.main" sx={{ fontWeight: 500 }}>
              Click to upload {title} image
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              PNG, JPG, WebP up to 5MB
            </Typography>
          </ImageUploadBox>
        )}
        
        <HiddenInput
          id={`${type}-upload`}
          type="file"
          accept="image/*"
          onChange={handleImageUpload(type)}
        />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Manage Mission & Vision
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Update your organization's mission statement, vision, and associated images
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Mission Section */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EditIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Mission Statement
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Mission Text"
                placeholder="Enter your organization's mission statement..."
                value={data.mission_text}
                onChange={handleTextChange('mission_text')}
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 1000 }}
                helperText={`${data.mission_text.length}/1000 characters`}
              />
              
              <Divider sx={{ my: 3 }} />
              
              {renderImageSection('mission', 'Mission')}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Vision Section */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PreviewIcon sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Vision Statement
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Vision Text"
                placeholder="Enter your organization's vision statement..."
                value={data.vision_text}
                onChange={handleTextChange('vision_text')}
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 1000 }}
                helperText={`${data.vision_text.length}/1000 characters`}
              />
              
              <Divider sx={{ my: 3 }} />
              
              {renderImageSection('vision', 'Vision')}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ 
            px: 6, 
            py: 1.5, 
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 600
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Image Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, image: null, title: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {previewDialog.title} Image Preview
        </DialogTitle>
        <DialogContent>
          {previewDialog.image && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={previewDialog.image}
                alt="Preview"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '70vh', 
                  objectFit: 'contain',
                  borderRadius: 8
                }}
                onError={(e) => {
                  console.error('Preview image load error:', e.target.src);
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPreviewDialog({ open: false, image: null, title: '' })}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlert({ ...alert, open: false })} 
          severity={alert.severity}
          variant="filled"
          sx={{ minWidth: 300 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminManageMissVis;
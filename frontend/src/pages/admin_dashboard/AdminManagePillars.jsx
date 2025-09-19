import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  List, ListItem, IconButton, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, FormControl, InputLabel,
  Select, MenuItem, OutlinedInput, Checkbox, ListItemText,
  Alert, CircularProgress, Grid, CardMedia, Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";

import { API_URL, STATIC_URL } from '../../config';

const API_BASE = API_URL;

// FIXED: Use a placeholder that actually exists or create a data URL
const DEFAULT_PILLAR_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEg5MFYxNDBIODBWNjBaTTExMCA2MEgxMjBWMTQwSDExMFY2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHBhdGggZD0iTTUgOEg5VjEySDE1VjE2SDVWOFoiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4KPC9zdmc+';

const AdminManagePillars = () => {
  const { user } = useAuth();
  
  // State management
  const [pillars, setPillars] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    focusAreaIds: [],
    image: null
  });
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState(null);
  // Add loading states for individual images
  const [imageLoadStates, setImageLoadStates] = useState({});

  // FIXED: Enhanced image URL generation with proper error handling
  const getPillarImageUrl = (pillar) => {
    // Return default immediately if no image
    if (!pillar?.image) {
      return DEFAULT_PILLAR_IMAGE;
    }
    
    // Handle absolute URLs (external images)
    if (pillar.image.startsWith('http://') || pillar.image.startsWith('https://')) {
      return pillar.image;
    }
    
    // Handle data URLs
    if (pillar.image.startsWith('data:')) {
      return pillar.image;
    }
    
    // Handle relative URLs - assume they're already properly formatted from backend
    if (pillar.image.startsWith('/uploads/')) {
      return `${STATIC_URL}${pillar.image}`;
    }
    
    // Handle just filename - construct full path for pillars
    if (!pillar.image.includes('/')) {
      return `${STATIC_URL}/uploads/pillars/${pillar.image}`;
    }
    
    // Fallback - prepend API_BASE to whatever we have
    return `${STATIC_URL}${pillar.image.startsWith('/') ? '' : '/'}${pillar.image}`;
  };

  // ADDED: Function to handle image load success
  const handleImageLoad = (pillarId) => {
    setImageLoadStates(prev => ({
      ...prev,
      [pillarId]: 'loaded'
    }));
  };

  // FIXED: Enhanced image error handler with better logging
  const handleImageError = (pillarId, event) => {
    const failedUrl = event.target.src;
    console.error(`Image failed to load for pillar ${pillarId}:`, {
      failedUrl,
      pillar: pillars.find(p => p.id === pillarId)
    });
    
    setImageLoadStates(prev => ({
      ...prev,
      [pillarId]: 'error'
    }));
    
    // Only set to default if it's not already the default to prevent infinite loops
    if (event.target.src !== DEFAULT_PILLAR_IMAGE) {
      event.target.src = DEFAULT_PILLAR_IMAGE;
    }
  };

  // Enhanced error handling function
  const handleApiError = async (response, operation) => {
    let errorMessage = `Failed to ${operation}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      console.error(`API Error (${operation}):`, {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      
      if (errorData.details) {
        console.error('Error details:', errorData.details);
        errorMessage += ` (${errorData.details.code || 'Unknown error'})`;
      }
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
      errorMessage = `${operation} failed (Status: ${response.status})`;
    }
    
    return errorMessage;
  };

  // ENHANCED: Fetch data with better error handling
  const fetchData = async () => {
    try {
      setError('');
      
      console.log('Fetching pillars and focus areas...');
      console.log('API_BASE:', API_BASE);
      
      const [pillarsRes, focusAreasRes] = await Promise.all([
        fetch(`${API_BASE}/pillars`, { 
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        }),
        fetch(`${API_BASE}/pillars/meta/focus-areas`, { 
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        })
      ]);
      
      console.log('Pillars response:', { status: pillarsRes.status, ok: pillarsRes.ok });
      console.log('Focus areas response:', { status: focusAreasRes.status, ok: focusAreasRes.ok });
      
      if (!pillarsRes.ok) {
        const errorMessage = await handleApiError(pillarsRes, 'load pillars');
        throw new Error(errorMessage);
      }
      
      if (!focusAreasRes.ok) {
        const errorMessage = await handleApiError(focusAreasRes, 'load focus areas');
        throw new Error(errorMessage);
      }
      
      const pillarsData = await pillarsRes.json();
      const focusAreasData = await focusAreasRes.json();
      
      console.log('Raw pillars data:', pillarsData);
      console.log('Raw focus areas data:', focusAreasData);
      
      // Enhanced data processing with better logging
      const pillarsArray = pillarsData.data || [];
      const focusAreasArray = focusAreasData.data || [];
      
      // Log image processing for debugging
      pillarsArray.forEach(pillar => {
        console.log(`Pillar ${pillar.id} image processing:`, {
          originalImage: pillar.image,
          processedUrl: getPillarImageUrl(pillar)
        });
      });
      
      setPillars(pillarsArray);
      setFocusAreas(focusAreasArray);
      
      // Reset image load states when data changes
      setImageLoadStates({});
      
      console.log('Data loaded successfully:', { 
        pillars: pillarsArray.length, 
        focusAreas: focusAreasArray.length 
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch data: ' + err.message);
    } finally {
    }
  };

  // Reset feedback messages
  const resetFeedback = () => {
    setError('');
    setSuccess('');
  };

  // Handle image file selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  // Open dialog for creating new pillar
  const handleAdd = () => {
    resetFeedback();
    setEditingPillar(null);
    setFormData({ name: '', description: '', focusAreaIds: [], image: null });
    setImagePreview(null);
    setDialogOpen(true);
  };

  // FIXED: Better handling of edit dialog image preview
  const handleEdit = (pillar) => {
    resetFeedback();
    setEditingPillar(pillar);
    
    console.log('Editing pillar:', pillar);
    
    let focusAreaIds = [];
    if (pillar.focus_areas && Array.isArray(pillar.focus_areas)) {
      focusAreaIds = pillar.focus_areas
        .filter(fa => fa && fa.id !== null && fa.id !== undefined)
        .map(fa => fa.id);
    }
    
    setFormData({
      name: pillar.name || '',
      description: pillar.description || '',
      focusAreaIds: focusAreaIds,
      image: null // Don't pre-populate file input
    });
    
    // FIXED: Better image preview handling for existing images
    const currentImageUrl = getPillarImageUrl(pillar);
    setImagePreview(currentImageUrl !== DEFAULT_PILLAR_IMAGE ? currentImageUrl : null);
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPillar(null);
    setFormData({ name: '', description: '', focusAreaIds: [], image: null });
    setImagePreview(null);
    resetFeedback();
  };

  // Handle form submission with image upload
  const handleSubmit = async () => {
    resetFeedback();
    
    if (!formData.name.trim()) {
      setError('Pillar name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Pillar description is required');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingPillar 
        ? `${API_BASE}/pillars/${editingPillar.id}`
        : `${API_BASE}/pillars`;
      
      const method = editingPillar ? 'PUT' : 'POST';
      
      // Use FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('focusAreaIds', JSON.stringify(
        formData.focusAreaIds
          .filter(id => id !== null && id !== undefined && id !== '')
          .map(id => parseInt(id))
          .filter(id => !isNaN(id))
      ));
      
      // Add image if selected
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      console.log('Submitting request:', { url, method, editingPillar: editingPillar?.id });

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend
      });

      console.log('Response received:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, editingPillar ? 'update pillar' : 'create pillar');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      setSuccess(editingPillar ? 'Pillar updated successfully!' : 'Pillar created successfully!');
      handleCloseDialog();
      
      await fetchData();
    } catch (err) {
      console.error('Submit error:', err);
      
      let userMessage = err.message;
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        userMessage = 'Network error - please check your connection and try again';
      } else if (err.message.includes('500')) {
        userMessage = 'Server error - please try again or contact support';
      }
      
      setError(userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete pillar with enhanced error handling
  const handleDelete = async (pillar) => {
    if (!window.confirm(`Are you sure you want to delete "${pillar.name}"? This action cannot be undone.`)) {
      return;
    }

    resetFeedback();
    setSubmitting(true);

    try {
      console.log('Deleting pillar:', pillar.id);
      
      const response = await fetch(`${API_BASE}/pillars/${pillar.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      console.log('Delete response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'delete pillar');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Delete success:', result);
      
      setSuccess('Pillar deleted successfully!');
      await fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete pillar: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle focus area selection change
  const handleFocusAreaChange = (event) => {
    const value = event.target.value;
    const cleanedValue = Array.isArray(value) 
      ? value.filter(id => id !== null && id !== undefined && id !== '')
      : [];
    
    setFormData(prev => ({
      ...prev,
      focusAreaIds: cleanedValue
    }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Access control
  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
        <Alert severity="error">Access Denied - Admin privileges required</Alert>
      </Box>
    );
  }

 

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Manage Programme Pillars</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={submitting}
          >
            Add New Pillar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/dashboard/categories')}
            disabled={submitting}
          >
            Add New Focus Area
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {pillars.map((pillar) => {
          const imageUrl = getPillarImageUrl(pillar);
          const hasImageError = imageLoadStates[pillar.id] === 'error';
          
          return (
            <Grid item xs={12} md={6} lg={4} key={pillar.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8]
                }
              }}>
                {/* REFINED: Enhanced Pillar Image Section */}
                <Box sx={{ 
                  position: 'relative', 
                  height: 200, 
                  bgcolor: 'grey.50',
                  overflow: 'hidden'
                }}>
              
                  <CardMedia
                    component="img"
                    height="200"
                    image={imageUrl}
                    alt={pillar.name || 'Pillar image'}
                    sx={{ 
                      objectFit: 'cover',
                      bgcolor: 'grey.100',
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                    onLoad={() => handleImageLoad(pillar.id)}
                    onError={(e) => handleImageError(pillar.id, e)}
                  />
                  
                  {/* Action buttons overlay */}
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                    opacity: 0.9
                  }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(pillar)}
                      disabled={submitting}
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&:disabled': { bgcolor: 'grey.400' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(pillar)}
                      disabled={submitting}
                      sx={{ 
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' },
                        '&:disabled': { bgcolor: 'grey.400' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  {hasImageError && (
                    <Box sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      bgcolor: 'warning.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}>
                      Default Image
                    </Box>
                  )}
                </Box>
                
                {/* REFINED: Enhanced Card Content Section */}
                <CardContent sx={{ 
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3
                }}>
                  {/* Title Section */}
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 2,
                      color: 'primary.main',
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '2.4em' // Ensure consistent height
                    }}
                  >
                    {pillar.name || 'Untitled Pillar'}
                  </Typography>
                  
                  {/* Description Section */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3,
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.5,
                      minHeight: '4.5em' // Ensure consistent height
                    }}
                  >
                    {pillar.description || 'No description available'}
                  </Typography>
                  
                  {/* Focus Areas Section */}
                  <Box sx={{ mt: 'auto' }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        mb: 1.5, 
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      Focus Areas ({pillar.focus_areas?.length || 0}):
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.5,
                      minHeight: '32px', // Ensure consistent height even with no chips
                      alignItems: 'flex-start'
                    }}>
                      {pillar.focus_areas && pillar.focus_areas.length > 0 ? (
                        pillar.focus_areas
                          .filter(fa => fa && fa.name) // Filter out any invalid focus areas
                          .slice(0, 4) // Show max 4 chips
                          .map((fa) => (
                            <Chip 
                              key={fa.id} 
                              label={fa.name} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                              sx={{ 
                                fontSize: '0.75rem',
                                height: '24px'
                              }}
                            />
                          ))
                      ) : (
                        <Chip 
                          label="No focus areas" 
                          size="small" 
                          variant="outlined"
                          color="default"
                          sx={{ 
                            fontSize: '0.75rem',
                            height: '24px',
                            fontStyle: 'italic'
                          }}
                        />
                      )}
                      {pillar.focus_areas && pillar.focus_areas.length > 4 && (
                        <Chip 
                          label={`+${pillar.focus_areas.length - 4} more`}
                          size="small" 
                          variant="filled"
                          color="secondary"
                          sx={{ 
                            fontSize: '0.75rem',
                            height: '24px'
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {pillars.length === 0 &&  (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8,
          p: 4,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '2px dashed',
          borderColor: 'grey.300'
        }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Programme Pillars Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Get started by creating your first programme pillar to organize your content.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAdd}
            size="large"
          >
            Create Your First Pillar
          </Button>
        </Box>
      )}

      {/* Create/Edit Dialog with Image Upload */}
      <Dialog 
        open={dialogOpen} 
        onClose={submitting ? undefined : handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPillar ? 'Edit Pillar' : 'Add New Pillar'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Pillar Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              margin="normal"
              required
              disabled={submitting}
              error={!formData.name.trim() && formData.name !== ''}
              helperText={!formData.name.trim() && formData.name !== '' ? 'Pillar name is required' : ''}
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              required
              disabled={submitting}
              error={!formData.description.trim() && formData.description !== ''}
              helperText={!formData.description.trim() && formData.description !== '' ? 'Description is required' : ''}
            />
            
            {/* Image Upload Section */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Pillar Image (Optional)
              </Typography>
              
              {imagePreview && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={imagePreview}
                    sx={{ width: 100, height: 100 }}
                    variant="rounded"
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={removeImage}
                    disabled={submitting}
                    size="small"
                  >
                    Remove Image
                  </Button>
                </Box>
              )}
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
                disabled={submitting}
                sx={{ mb: 1 }}
              >
                {imagePreview ? 'Change Image' : 'Select Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              
              <Typography variant="caption" display="block" color="text.secondary">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
              </Typography>
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Focus Areas</InputLabel>
              <Select
                multiple
                value={formData.focusAreaIds}
                onChange={handleFocusAreaChange}
                input={<OutlinedInput label="Focus Areas" />}
                disabled={submitting}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const focusArea = focusAreas.find(fa => fa.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={focusArea?.name || `ID: ${value}`} 
                          size="small" 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {focusAreas.map((focusArea) => (
                  <MenuItem key={focusArea.id} value={focusArea.id}>
                    <Checkbox checked={formData.focusAreaIds.indexOf(focusArea.id) > -1} />
                    <ListItemText primary={focusArea.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {submitting && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {editingPillar ? 'Updating pillar...' : 'Creating pillar...'}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<CancelIcon />}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={submitting ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={submitting || !formData.name.trim() || !formData.description.trim()}
          >
            {submitting 
              ? (editingPillar ? 'Updating...' : 'Creating...') 
              : (editingPillar ? 'Update' : 'Create')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagePillars;
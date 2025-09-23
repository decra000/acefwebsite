import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardMedia, CardContent, CardActions,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Chip, Switch,
  FormControlLabel, Alert, CircularProgress, IconButton, Menu,
  Divider, Tabs, Tab, Autocomplete, Avatar, Tooltip, Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Reorder as ReorderIcon,
  WifiProtectedSetup as ProtectedIcon,
  Public as PublicIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { useAuth } from '../../context/AuthContext';
import { API_URL, STATIC_URL } from '../../config';
const API_BASE = API_URL;

// Protected section configurations
const PROTECTED_SECTIONS = {
  home_hero_slides: {
    label: 'Home Hero Slides',
    description: 'Main carousel images on homepage',
    maxImages: 4,
    requiredDimensions: '1920x1080'
  },
  impact_hero: {
    label: 'Impact Hero Background',
    description: 'Background image for Impact page',
    maxImages: 1,
    requiredDimensions: '1920x1080'
  },
  country_images: {
    label: 'Country-Specific Images',
    description: 'Hero images for country pages',
    maxImages: 3,
    requiredDimensions: '1920x1080',
    requiresCountry: true
  },
  get_involved_dark: {
    label: 'Get Involved (Dark Mode)',
    description: 'Background for Get Involved page in dark mode',
    maxImages: 1,
    requiredDimensions: '1920x1080'
  },
  get_involved_light: {
    label: 'Get Involved (Light Mode)',
    description: 'Background for Get Involved page in light mode',
    maxImages: 1,
    requiredDimensions: '1920x1080'
  }
};

const GalleryManager = () => {
  const { user } = useAuth();
  
  // Main state
  const [currentTab, setCurrentTab] = useState(0); // 0 = Protected, 1 = Unprotected
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt_text: '',
    category: '',
    country_name: '',
    is_active: true,
    image: null
  });
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProtectedSection, setSelectedProtectedSection] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  
  // UI states
  const [imagePreview, setImagePreview] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      alt_text: '',
      category: '',
      country_name: '',
      is_active: true,
      image: null
    });
    setImagePreview(null);
    setEditingImage(null);
  };

  // Handle API errors
  const handleApiError = async (response, operation) => {
    let errorMessage = `Failed to ${operation}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = `${operation} failed (Status: ${response.status})`;
    }
    return errorMessage;
  };

  // Fetch data functions
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/gallery/categories`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/countries`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const countryList = Array.isArray(data) ? data : data.data || [];
        setCountries(countryList);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  }, []);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const endpoint = currentTab === 0 ? '/gallery/protected' : '/gallery/unprotected';
      const params = new URLSearchParams();
      
      // Add filters
      if (currentTab === 0 && selectedProtectedSection !== 'all') {
        params.append('section', selectedProtectedSection);
      }
      if (currentTab === 1 && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedCountry !== 'all') {
        params.append('country', selectedCountry);
      }
      
      const url = `${API_BASE}${endpoint}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'fetch images');
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setImages(data.data || []);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTab, selectedCategory, selectedProtectedSection, selectedCountry]);

  // Form handlers
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB');
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

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    
    if (currentTab === 1 && !editingImage && !formData.image) {
      setError('Image is required for new uploads');
      return;
    }
    
    // Check if country is required for certain protected sections
    if (currentTab === 0 && formData.category === 'country_images' && !formData.country_name) {
      setError('Country is required for country-specific images');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('alt_text', formData.alt_text || formData.title.trim());
      formDataToSend.append('category', formData.category);
      
      if (formData.country_name) {
        formDataToSend.append('country_name', formData.country_name);
      }
      
      if (currentTab === 1) {
        formDataToSend.append('is_active', formData.is_active);
      }
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      const endpoint = currentTab === 0 ? '/gallery/protected' : '/gallery/unprotected';
      const url = editingImage 
        ? `${API_BASE}${endpoint}/${editingImage.id}`
        : `${API_BASE}${endpoint}`;
      
      const method = editingImage ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, editingImage ? 'update image' : 'create image');
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      setSuccess(result.message || `Image ${editingImage ? 'updated' : 'created'} successfully!`);
      
      setDialogOpen(false);
      resetForm();
      fetchImages();
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      title: image.title || '',
      description: image.description || '',
      alt_text: image.alt_text || '',
      category: image.category || '',
      country_name: image.country_name || '',
      is_active: image.is_active !== undefined ? image.is_active : true,
      image: null
    });
    
    // Set preview to current image
    if (image.image_url) {
      const imageUrl = image.image_url.startsWith('http') 
        ? image.image_url 
        : `${STATIC_URL}${image.image_url}`;
      setImagePreview(imageUrl);
    }
    
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;
    
    setError('');
    setSuccess('');
    
    try {
      const endpoint = currentTab === 0 ? '/gallery/protected' : '/gallery/unprotected';
      const response = await fetch(`${API_BASE}${endpoint}/${imageToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'delete image');
        throw new Error(errorMessage);
      }
      
      setSuccess('Image deleted successfully!');
      setDeleteDialogOpen(false);
      setImageToDelete(null);
      fetchImages();
      
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  };

  const handleReorder = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update display order
    const updatedItems = items.map((item, index) => ({
      id: item.id,
      display_order: index + 1
    }));
    
    setImages(items);
    
    try {
      const response = await fetch(`${API_BASE}/gallery/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ images: updatedItems })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      
      setSuccess('Image order updated successfully!');
    } catch (err) {
      console.error('Reorder error:', err);
      setError('Failed to update image order');
      fetchImages(); // Revert on error
    }
  };

  const getImageUrl = (image) => {
    if (!image?.image_url) return '/placeholder-image.jpg';
    
    if (image.image_url.startsWith('http')) {
      return image.image_url;
    }
    
    return `${STATIC_URL}${image.image_url}`;
  };

  const getFilteredCategories = () => {
    if (currentTab === 0) {
      return categories.filter(cat => cat.is_protected);
    }
    return categories.filter(cat => !cat.is_protected);
  };

  // Effects
  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, [fetchCategories, fetchCountries]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchImages();
    }
  }, [fetchImages, categories.length]);

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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Gallery Manager
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {images.length > 0 && (
            <Button
              variant={reorderMode ? "contained" : "outlined"}
              startIcon={<ReorderIcon />}
              onClick={() => setReorderMode(!reorderMode)}
              size="small"
            >
              {reorderMode ? 'Exit Reorder' : 'Reorder'}
            </Button>
          )}
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            disabled={loading}
          >
            Add Image
          </Button>
        </Box>
      </Box>

      {/* Status Messages */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab 
            icon={<ProtectedIcon />} 
            label="Protected Images" 
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            icon={<PublicIcon />} 
            label="Unprotected Images" 
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        {currentTab === 0 ? (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Protected Section</InputLabel>
            <Select
              value={selectedProtectedSection}
              label="Protected Section"
              onChange={(e) => setSelectedProtectedSection(e.target.value)}
            >
              <MenuItem value="all">All Sections</MenuItem>
              {Object.entries(PROTECTED_SECTIONS).map(([key, config]) => (
                <MenuItem key={key} value={key}>{config.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {getFilteredCategories().map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Country</InputLabel>
          <Select
            value={selectedCountry}
            label="Country"
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <MenuItem value="all">All Countries</MenuItem>
            {countries.map((country) => (
              <MenuItem key={country.id} value={country.name}>{country.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" sx={{ ml: 'auto', color: 'text.secondary' }}>
          {images.length} image{images.length !== 1 ? 's' : ''} found
        </Typography>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Images Grid */}
      {!loading && (
        <DragDropContext onDragEnd={handleReorder}>
          <Droppable droppableId="images" isDropDisabled={!reorderMode}>
            {(provided) => (
              <Grid 
                container 
                spacing={3} 
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {images.map((image, index) => (
                  <Draggable 
                    key={image.id} 
                    draggableId={image.id.toString()} 
                    index={index}
                    isDragDisabled={!reorderMode}
                  >
                    {(provided, snapshot) => (
                      <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={4} 
                        lg={3}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card 
                          sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                            boxShadow: snapshot.isDragging ? 6 : 1,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="200"
                              image={getImageUrl(image)}
                              alt={image.alt_text || image.title}
                              sx={{ 
                                objectFit: 'cover',
                                bgcolor: 'grey.100'
                              }}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                              }}
                            />
                            
                            {/* Status indicators */}
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              left: 8,
                              display: 'flex',
                              gap: 1
                            }}>
                              {currentTab === 0 && (
                                <Chip
                                  icon={<ProtectedIcon />}
                                  label="Protected"
                                  size="small"
                                  color="error"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              )}
                              
                              {image.country_name && (
                                <Chip
                                  label={image.country_name}
                                  size="small"
                                  color="info"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              )}
                              
                              {currentTab === 1 && !image.is_active && (
                                <Chip
                                  label="Inactive"
                                  size="small"
                                  color="default"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              )}
                            </Box>

                            {/* Actions menu */}
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8 
                            }}>
                              <IconButton
                                size="small"
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              
                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                              >
                                <MenuItem onClick={() => {
                                  window.open(getImageUrl(image), '_blank');
                                  setAnchorEl(null);
                                }}>
                                  <ViewIcon sx={{ mr: 1 }} fontSize="small" />
                                  View Full Size
                                </MenuItem>
                                
                                <MenuItem onClick={() => {
                                  handleEdit(image);
                                  setAnchorEl(null);
                                }}>
                                  <EditIcon sx={{ mr: 1 }} fontSize="small" />
                                  Edit
                                </MenuItem>
                                
                                {currentTab === 1 && (
                                  <MenuItem onClick={() => {
                                    setImageToDelete(image);
                                    setDeleteDialogOpen(true);
                                    setAnchorEl(null);
                                  }}>
                                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                                    Delete
                                  </MenuItem>
                                )}
                              </Menu>
                            </Box>
                          </Box>
                          
                          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                            <Typography variant="h6" sx={{ 
                              fontSize: '1rem',
                              fontWeight: 600,
                              mb: 1,
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {image.title}
                            </Typography>
                            
                            {image.description && (
                              <Typography variant="body2" color="text.secondary" sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mb: 1
                              }}>
                                {image.description}
                              </Typography>
                            )}
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                              <Chip
                                label={image.category}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                              
                              {reorderMode && (
                                <Chip
                                  label={`Order: ${image.display_order || index + 1}`}
                                  size="small"
                                  color="secondary"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </CardContent>
                          
                          <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(image)}
                            >
                              {currentTab === 0 ? 'Update' : 'Edit'}
                            </Button>
                            
                            {currentTab === 1 && (
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                  setImageToDelete(image);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Grid>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Empty state */}
      {!loading && images.length === 0 && (
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
            No Images Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {currentTab === 0 
              ? 'Protected images are system-managed sections that can only be updated.'
              : 'Start building your gallery by uploading your first image.'
            }
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            size="large"
          >
            {currentTab === 0 ? 'Update Protected Image' : 'Upload First Image'}
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingImage ? 'Edit Image' : 'Add New Image'}
          {currentTab === 0 && editingImage && (
            <Chip 
              icon={<ProtectedIcon />}
              label="Protected Section"
              size="small"
              color="error"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Image Upload */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Image {editingImage ? '(Optional - leave empty to keep current)' : '*'}
                </Typography>
                
                <Box sx={{ border: '2px dashed #ddd', borderRadius: 2, p: 3, textAlign: 'center' }}>
                  {imagePreview ? (
                    <Box>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<UploadIcon />}
                        >
                          Change Image
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Click to upload or drag and drop
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                      >
                        Select Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </Button>
                    </Box>
                  )}
                </Box>
                
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Supported: JPEG, PNG, GIF, WebP (Max 10MB)
                </Typography>
              </Grid>
              
              {/* Form Fields */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  fullWidth
                  margin="normal"
                  required
                />
                
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
                
                <TextField
                  label="Alt Text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                  fullWidth
                  margin="normal"
                  helperText="For accessibility (defaults to title if empty)"
                />
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {currentTab === 0 ? (
                      Object.entries(PROTECTED_SECTIONS).map(([key, config]) => (
                        <MenuItem key={key} value={key}>
                          {config.label} - {config.description}
                        </MenuItem>
                      ))
                    ) : (
                      getFilteredCategories().map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                          {cat.name} - {cat.description}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                
                {(formData.category === 'country_images' || 
                  PROTECTED_SECTIONS[formData.category]?.requiresCountry) && (
                  <Autocomplete
                    options={countries}
                    getOptionLabel={(option) => option.name}
                    value={countries.find(c => c.name === formData.country_name) || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        country_name: newValue ? newValue.name : '' 
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Country" 
                        margin="normal"
                        required={formData.category === 'country_images'}
                      />
                    )}
                  />
                )}
                
                {currentTab === 1 && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          is_active: e.target.checked 
                        }))}
                      />
                    }
                    label="Active"
                    sx={{ mt: 2 }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!formData.title || !formData.category}
          >
            {editingImage ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setImageToDelete(null);
        }}
      >
        <DialogTitle>Delete Image</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{imageToDelete?.title}"? 
            This action cannot be undone.
          </Typography>
          {imageToDelete && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img
                src={getImageUrl(imageToDelete)}
                alt={imageToDelete.title}
                style={{
                  maxWidth: '200px',
                  maxHeight: '150px',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setImageToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GalleryManager;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardMedia, CardContent, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, 
  MenuItem, Select, FormControl, InputLabel, Paper, Tabs, Tab, Fab,
  Alert, CircularProgress, Chip, Stack, InputAdornment, Checkbox,
  CardActions, Menu, MenuList, MenuItem as MuiMenuItem, Divider,
  Pagination, Tooltip, ImageList, ImageListItem, ImageListItemBar,
  SpeedDial, SpeedDialAction, SpeedDialIcon, Autocomplete, Badge
} from '@mui/material';

import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Folder as FolderIcon,
  Public as PublicIcon,
  PhotoLibrary as LibraryIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import ViewListIcon from '@mui/icons-material/ViewList';

// Mock API configuration
const API_URL = 'http://localhost:5000/api';
const STATIC_URL = 'http://localhost:5000';

// Image categories based on your upload structure
const IMAGE_CATEGORIES = [
  { value: 'all', label: 'All Images', folder: '', editable: false },
  { value: 'team', label: 'Team Photos', folder: 'team', editable: true },
  { value: 'blogs', label: 'Blog Images', folder: 'blogs', editable: true },
  { value: 'projects', label: 'Project Images', folder: 'projects', editable: true },
  { value: 'partners', label: 'Partner Logos', folder: 'partners', editable: true },
  { value: 'logos', label: 'Website Logos', folder: 'logos', editable: false }, // System managed
  { value: 'transaction-logos', label: 'Transaction Logos', folder: 'transaction-logos', editable: false },
  { value: 'testimonials', label: 'Testimonial Images', folder: 'testimonials', editable: true },
  { value: 'events', label: 'Event Photos', folder: 'events', editable: true },
  { value: 'highlights', label: 'Highlights', folder: 'highlights', editable: true },
  { value: 'resumes', label: 'Resume Files', folder: 'resumes', editable: false },
  { value: 'general', label: 'General Images', folder: 'general', editable: true }
];

// View modes
const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  MASONRY: 'masonry'
};

// Image sources
const IMAGE_SOURCES = {
  UPLOADED: 'uploaded',
  EXTERNAL: 'external'
};

const GalleryManager = () => {
  // Main state
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  
  // Gallery data
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedImages, setSelectedImages] = useState(new Set());
  
  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(24);
  
  // Upload modal
  const [uploadModal, setUploadModal] = useState({ open: false, category: 'general' });
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // External image search
  const [externalSearchModal, setExternalSearchModal] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  
  // Image preview/edit modal
  const [previewModal, setPreviewModal] = useState({ open: false, image: null });
  const [editingImage, setEditingImage] = useState(null);
  
  // Bulk operations
  const [bulkActionMenu, setBulkActionMenu] = useState(null);

  // Fetch all images from various folders
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const allImages = [];
      
      // Fetch images from each category folder
      for (const category of IMAGE_CATEGORIES) {
        if (category.value === 'all') continue;
        
        try {
          console.log(`Fetching images from category: ${category.folder}`);
          const response = await fetch(`${API_URL}/gallery/${category.folder}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Found ${data.images?.length || 0} images in ${category.folder}`);
            
            const categoryImages = (data.images || []).map(img => ({
              ...img,
              id: `${category.value}-${img.id || img.filename || Date.now()}`,
              category: category.value,
              categoryLabel: category.label,
              source: IMAGE_SOURCES.UPLOADED,
              url: img.path ? `${STATIC_URL}${img.path}` : `${STATIC_URL}/uploads/${category.folder}/${img.filename}`,
              thumbnail: img.path ? `${STATIC_URL}${img.path}` : `${STATIC_URL}/uploads/${category.folder}/${img.filename}`,
              editable: category.editable,
              created_at: img.created_at || img.uploadDate || new Date().toISOString(),
              name: img.name || img.originalname || img.filename || 'Unnamed Image',
              alt: img.alt || img.description || '',
              tags: img.tags || []
            }));
            
            allImages.push(...categoryImages);
          } else {
            console.warn(`Failed to fetch from ${category.folder}:`, response.status, response.statusText);
          }
        } catch (err) {
          console.warn(`Error fetching images from ${category.folder}:`, err.message);
        }
      }
      
      console.log(`Total images loaded: ${allImages.length}`);
      setImages(allImages);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Filter images based on search and category
  useEffect(() => {
    let filtered = images;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(img =>
        img.name?.toLowerCase().includes(searchLower) ||
        img.alt?.toLowerCase().includes(searchLower) ||
        img.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        img.categoryLabel?.toLowerCase().includes(searchLower)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(img => img.category === categoryFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(img => {
          const imgDate = new Date(img.created_at);
          return imgDate >= filterDate;
        });
      }
    }

    setFilteredImages(filtered);
    setPage(1);
  }, [images, searchTerm, categoryFilter, dateFilter]);

  // Handle file upload
  const handleFileUpload = async (files, category) => {
    if (!files.length) return;
    
    const categoryInfo = IMAGE_CATEGORIES.find(cat => cat.value === category);
    if (!categoryInfo?.editable) {
      setError('Cannot upload to this category. It is system-managed.');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('images', file);
    });
    
    try {
      const response = await fetch(`${API_URL}/gallery/upload/${categoryInfo.folder}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchImages(); // Refresh the gallery
        setUploadModal({ open: false, category: 'general' });
        setUploadFiles([]);
        setError(''); // Clear any previous errors
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Failed to upload images: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle external image import via URL
  const handleUrlImport = async (url, category) => {
    if (!url.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    const categoryInfo = IMAGE_CATEGORIES.find(cat => cat.value === category);
    if (!categoryInfo?.editable) {
      setError('Cannot import to this category. It is system-managed.');
      return;
    }

    try {
      setUploading(true);
      const response = await fetch(`${API_URL}/gallery/import-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: url,
          category: categoryInfo.folder,
          name: `Imported from URL - ${new Date().toLocaleDateString()}`
        }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchImages();
        setExternalSearchModal(false);
        setExternalUrl('');
        setError('');
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(`Failed to import image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle image deletion (only for editable categories)
  const handleImageDelete = async (image) => {
    if (!image.editable) {
      setError('Cannot delete this image. It is system-managed.');
      return;
    }

    if (!window(`Are you sure you want to delete "${image.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/gallery/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId: image.id,
          category: image.category,
          filename: image.filename || image.name
        }),
        credentials: 'include'
      });

      if (response.ok) {
        await fetchImages();
        setPreviewModal({ open: false, image: null });
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete image: ${err.message}`);
    }
  };

  // Handle bulk operations
  const handleBulkAction = async (action) => {
    if (selectedImages.size === 0) return;
    
    const selectedImageObjects = images.filter(img => selectedImages.has(img.id));
    
    if (action === 'delete') {
      const editableImages = selectedImageObjects.filter(img => img.editable);
      if (editableImages.length === 0) {
        setError('No editable images selected for deletion.');
        setBulkActionMenu(null);
        return;
      }

      if (!window(`Delete ${editableImages.length} selected images?`)) {
        setBulkActionMenu(null);
        return;
      }
    }
    
    try {
      switch (action) {
        case 'delete':
          const editableIds = selectedImageObjects
            .filter(img => img.editable)
            .map(img => ({ id: img.id, category: img.category, filename: img.filename || img.name }));
          
          await fetch(`${API_URL}/gallery/bulk-delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: editableIds }),
            credentials: 'include'
          });
          
          await fetchImages();
          break;
        
        case 'download':
          // Create download URLs for each image
          selectedImageObjects.forEach(img => {
            const link = document.createElement('a');
            link.href = img.url;
            link.download = img.name || 'image';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
          break;
        
        default:
          return;
      }
      
      setSelectedImages(new Set());
    } catch (err) {
      console.error('Bulk operation error:', err);
      setError(`Failed to ${action} selected images: ${err.message}`);
    }
    
    setBulkActionMenu(null);
  };

  // Pagination
  const paginatedImages = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredImages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredImages, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

  // Toggle image selection
  const toggleImageSelection = (imageId) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedImages(newSelection);
  };

  // Select all visible images
  const selectAllVisible = () => {
    const allVisible = new Set([...selectedImages, ...paginatedImages.map(img => img.id)]);
    setSelectedImages(allVisible);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  // Render image grid
  const renderImageGrid = () => {
    if (viewMode === VIEW_MODES.MASONRY) {
      return (
        <ImageList variant="masonry" cols={4} gap={8}>
          {paginatedImages.map((image) => (
            <ImageListItem key={image.id}>
              <img
                src={image.thumbnail}
                alt={image.name}
                loading="lazy"
                style={{ cursor: 'pointer' }}
                onClick={() => setPreviewModal({ open: true, image })}
                onError={(e) => {
                  e.target.src = '/api/placeholder/300/200';
                }}
              />
              <ImageListItemBar
                title={image.name}
                subtitle={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{image.categoryLabel}</span>
                    {!image.editable && <LockIcon sx={{ fontSize: 16 }} />}
                  </Box>
                }
                actionIcon={
                  <Checkbox
                    checked={selectedImages.has(image.id)}
                    onChange={() => toggleImageSelection(image.id)}
                    sx={{ color: 'white' }}
                  />
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      );
    }

    return (
      <Grid container spacing={2}>
        {paginatedImages.map((image) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
            <Card 
              sx={{ 
                position: 'relative',
                '&:hover': { transform: 'translateY(-4px)' },
                transition: 'transform 0.2s'
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={image.thumbnail}
                  alt={image.name}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setPreviewModal({ open: true, image })}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/300/200';
                  }}
                />
                
                <Checkbox
                  checked={selectedImages.has(image.id)}
                  onChange={() => toggleImageSelection(image.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    borderRadius: '50%'
                  }}
                />
                
                <Box sx={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 1 }}>
                  <Chip
                    label={image.source}
                    size="small"
                    color="primary"
                    sx={{ fontSize: '0.7rem' }}
                  />
                  {!image.editable && (
                    <Chip
                      icon={<LockIcon sx={{ fontSize: '12px !important' }} />}
                      label="Protected"
                      size="small"
                      color="warning"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </Box>
              
              <CardContent>
                <Typography variant="subtitle2" noWrap title={image.name}>
                  {image.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {image.categoryLabel}
                </Typography>
              </CardContent>
              
              <CardActions>
                <IconButton size="small" onClick={() => setPreviewModal({ open: true, image })}>
                  <ViewIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  component="a" 
                  href={image.url} 
                  target="_blank" 
                  download={image.name}
                >
                  <DownloadIcon />
                </IconButton>
                {image.editable && (
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleImageDelete(image)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading gallery images...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gallery Manager
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GridViewIcon />}
            onClick={() => setViewMode(VIEW_MODES.GRID)}
            color={viewMode === VIEW_MODES.GRID ? 'primary' : 'inherit'}
          >
            Grid
          </Button>
          <Button
            variant="outlined"
            startIcon={<ViewListIcon />}
            onClick={() => setViewMode(VIEW_MODES.MASONRY)}
            color={viewMode === VIEW_MODES.MASONRY ? 'primary' : 'inherit'}
          >
            Masonry
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats and Selection */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {filteredImages.length} images • {selectedImages.size} selected
          </Typography>
          
          {selectedImages.size > 0 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={(e) => setBulkActionMenu(e.currentTarget)}
                endIcon={<SettingsIcon />}
              >
                Bulk Actions
              </Button>
              <Button size="small" onClick={clearSelection}>
                Clear Selection
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon /> Search & Filters
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search images"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, tags, or description..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                {IMAGE_CATEGORIES.map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category.label}
                      {!category.editable && category.value !== 'all' && 
                        <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      }
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={selectAllVisible}
              disabled={paginatedImages.length === 0}
            >
              Select All
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ImageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {images.length === 0 ? 'No images found in gallery' : 'No images match your search'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {images.length === 0 
              ? 'Upload some images to get started'
              : 'Try adjusting your search filters'
            }
          </Typography>
          {images.length === 0 && (
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadModal({ open: true, category: 'general' })}
            >
              Upload Images
            </Button>
          )}
        </Box>
      ) : (
        <>
          {renderImageGrid()}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Speed Dial for Actions */}
      <SpeedDial
        ariaLabel="Gallery actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<UploadIcon />}
          tooltipTitle="Upload Images"
          onClick={() => setUploadModal({ open: true, category: 'general' })}
        />
        <SpeedDialAction
          icon={<PublicIcon />}
          tooltipTitle="Import from URL"
          onClick={() => setExternalSearchModal(true)}
        />
      </SpeedDial>

      {/* Upload Modal */}
      <Dialog
        open={uploadModal.open}
        onClose={() => setUploadModal({ open: false, category: 'general' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Images</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={uploadModal.category}
                onChange={(e) => setUploadModal({ ...uploadModal, category: e.target.value })}
                label="Category"
              >
                {IMAGE_CATEGORIES.filter(cat => cat.value !== 'all' && cat.editable).map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Paper
              variant="outlined"
              sx={{ 
                p: 4, 
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'grey.50' }
              }}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Choose Images to Upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports JPG, PNG, GIF, WebP • Max 10MB per file
              </Typography>
              
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                style={{ display: 'none' }}
              />
            </Paper>
            
            {uploadFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files ({uploadFiles.length}):
                </Typography>
                <Stack spacing={1}>
                  {uploadFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`}
                      onDelete={() => setUploadFiles(files => files.filter((_, i) => i !== index))}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadModal({ open: false, category: 'general' })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleFileUpload(uploadFiles, uploadModal.category)}
            variant="contained"
            disabled={uploadFiles.length === 0 || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* External Image Import Modal */}
      <Dialog
        open={externalSearchModal}
        onClose={() => setExternalSearchModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Image from URL</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Image URL"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Import to Category</InputLabel>
              <Select
                value="general"
                label="Import to Category"
                disabled
              >
                {IMAGE_CATEGORIES.filter(cat => cat.value !== 'all' && cat.editable).map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Only direct image URLs are supported (JPG, PNG, GIF, WebP). The image will be downloaded and stored locally.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExternalSearchModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleUrlImport(externalUrl, 'general')}
            variant="contained"
            disabled={!externalUrl.trim() || uploading}
          >
            {uploading ? 'Importing...' : 'Import Image'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkActionMenu}
        open={Boolean(bulkActionMenu)}
        onClose={() => setBulkActionMenu(null)}
      >
        <MuiMenuItem onClick={() => handleBulkAction('download')}>
          <DownloadIcon sx={{ mr: 1 }} /> Download Selected
        </MuiMenuItem>
        <Divider />
        <MuiMenuItem 
          onClick={() => handleBulkAction('delete')} 
          sx={{ color: 'error.main' }}
          disabled={!Array.from(selectedImages).some(id => {
            const img = images.find(i => i.id === id);
            return img && img.editable;
          })}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete Selected
        </MuiMenuItem>
      </Menu>

      {/* Image Preview Modal */}
      <Dialog
        open={previewModal.open}
        onClose={() => setPreviewModal({ open: false, image: null })}
        maxWidth="lg"
        fullWidth
      >
        {previewModal.image && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">
                    {previewModal.image.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip 
                      label={previewModal.image.categoryLabel} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={previewModal.image.source} 
                      size="small" 
                      color="primary" 
                    />
                    {!previewModal.image.editable && (
                      <Chip 
                        icon={<LockIcon />}
                        label="Protected" 
                        size="small" 
                        color="warning" 
                      />
                    )}
                  </Box>
                </Box>
                <IconButton onClick={() => setPreviewModal({ open: false, image: null })}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img
                  src={previewModal.image.url}
                  alt={previewModal.image.name}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '70vh', 
                    height: 'auto', 
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/400/300';
                  }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Category:</strong> {previewModal.image.categoryLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Source:</strong> {previewModal.image.source}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Uploaded:</strong> {new Date(previewModal.image.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  {previewModal.image.alt && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Description:</strong> {previewModal.image.alt}
                    </Typography>
                  )}
                  {previewModal.image.tags && previewModal.image.tags.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Tags:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {previewModal.image.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {!previewModal.image.editable && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      This image is system-managed and cannot be modified or deleted.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<DownloadIcon />}
                component="a"
                href={previewModal.image.url}
                target="_blank"
                download={previewModal.image.name}
              >
                Download
              </Button>
              {previewModal.image.editable && (
                <Button 
                  startIcon={<DeleteIcon />} 
                  color="error"
                  onClick={() => handleImageDelete(previewModal.image)}
                >
                  Delete
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GalleryManager;
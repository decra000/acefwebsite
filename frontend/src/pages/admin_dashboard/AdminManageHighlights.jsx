import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Stack,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';

const AdminManageHighlights = () => {
  // State management
  const [highlights, setHighlights] = useState({});
  const [validYears, setValidYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  
  // Form states
  const [selectedYear, setSelectedYear] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, highlight: null });
  const [expandedYear, setExpandedYear] = useState(null);

  const API_URL = 'http://localhost:5000/api'; // Replace with your API URL
  const STATIC_URL = 'http://localhost:5000'; // Replace with your static files URL

  // Fetch all data
  const fetchHighlights = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch highlights and years
      const [highlightsRes, yearsRes] = await Promise.all([
        fetch(`${API_URL}/highlights`, { credentials: 'include' }),
        fetch(`${API_URL}/highlights/years`, { credentials: 'include' })
      ]);

      if (!highlightsRes.ok || !yearsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const highlightsData = await highlightsRes.json();
      const yearsData = await yearsRes.json();

      setHighlights(highlightsData.data || {});
      setValidYears(yearsData.data?.validYears || []);
      setError('');
      
      // Auto-expand most recent year with highlights
      const years = Object.keys(highlightsData.data || {}).sort((a, b) => b - a);
      if (years.length > 0) {
        setExpandedYear(parseInt(years[0]));
      }
    } catch (err) {
      console.error('Error fetching highlights:', err);
      setError('Failed to load highlights');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  // Reset form
  const resetForm = () => {
    setSelectedYear('');
    setTitle('');
    setDescription('');
    setImage(null);
    setImagePreview('');
    setCurrentImageUrl('');
    setSubmitError('');
    setSubmitSuccess(false);
    setEditMode(false);
    setEditingHighlight(null);
  };

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Open add modal
  const handleAddHighlight = () => {
    resetForm();
    setSelectedYear(validYears[0] || '');
    setModalOpen(true);
  };

  // Open edit modal
  const handleEditHighlight = (highlight) => {
    setEditMode(true);
    setEditingHighlight(highlight);
    setSelectedYear(highlight.year.toString());
    setTitle(highlight.title);
    setDescription(highlight.description || '');
    setCurrentImageUrl(highlight.image_url || '');
    setImage(null);
    setImagePreview('');
    setSubmitError('');
    setSubmitSuccess(false);
    setModalOpen(true);
  };

  // Close modal
  const handleModalClose = () => {
    setModalOpen(false);
    resetForm();
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedYear || !title.trim()) {
      setSubmitError('Year and title are required');
      return;
    }

    if (!editMode && !image) {
      setSubmitError('Image is required for new highlights');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const formData = new FormData();
      formData.append('year', selectedYear);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      
      if (image) {
        formData.append('image', image);
      }

      const url = editMode 
        ? `${API_URL}/highlights/${editingHighlight.id}`
        : `${API_URL}/highlights`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save highlight');
      }

      setSubmitSuccess(true);
      fetchHighlights();
      
      setTimeout(() => {
        handleModalClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving highlight:', err);
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete highlight
  const handleDeleteClick = (highlight) => {
    setDeleteDialog({ open: true, highlight });
  };

  const handleDeleteConfirm = async () => {
    const { highlight } = deleteDialog;
    if (!highlight) return;

    try {
      const response = await fetch(`${API_URL}/highlights/${highlight.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete highlight');
      }

      fetchHighlights();
      setDeleteDialog({ open: false, highlight: null });
    } catch (err) {
      console.error('Error deleting highlight:', err);
      setError('Failed to delete highlight');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, highlight: null });
  };

  // Toggle year accordion
  const handleAccordionChange = (year) => (event, isExpanded) => {
    setExpandedYear(isExpanded ? year : null);
  };

  // Get total highlights count
  const getTotalHighlights = () => {
    return Object.values(highlights).reduce((total, yearHighlights) => total + yearHighlights.length, 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TimelineIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Highlights Management
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage organization achievements and milestones by year
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {getTotalHighlights()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Highlights
                  </Typography>
                </Box>
                <StarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {Object.keys(highlights).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Years
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {new Date().getFullYear()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Current Year
                  </Typography>
                </Box>
                <TimelineIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Highlights by Year
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddHighlight}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            Add New Highlight
          </Button>
        </Box>

        {Object.keys(highlights).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <TimelineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No highlights found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first organizational highlight to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddHighlight}
            >
              Add First Highlight
            </Button>
          </Box>
        ) : (
          <Box>
            {Object.keys(highlights)
              .sort((a, b) => b - a) // Sort years descending
              .map((year) => (
                <Accordion
                  key={year}
                  expanded={expandedYear === parseInt(year)}
                  onChange={handleAccordionChange(parseInt(year))}
                  sx={{ mb: 2, '&:before': { display: 'none' } }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderRadius: '8px 8px 0 0',
                      '&.Mui-expanded': {
                        borderRadius: '8px 8px 0 0'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <CalendarIcon />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {year}
                      </Typography>
                      <Chip
                        label={`${highlights[year].length} highlights`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails sx={{ p: 3 }}>
                    {highlights[year].length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No highlights for {year}
                      </Typography>
                    ) : (
                      <ImageList variant="masonry" cols={3} gap={16}>
                        {highlights[year].map((highlight, index) => (
                          <ImageListItem key={highlight.id}>
                            <Card elevation={3} sx={{ height: '100%' }}>
                              {highlight.image_url && (
                                <CardMedia
                                  component="img"
                                  height="200"
                                  image={`${STATIC_URL}${highlight.image_url}`}
                                  alt={highlight.title}
                                  sx={{ objectFit: 'cover' }}
                                />
                              )}
                              
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <DragIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                  <Chip
                                    label={`#${highlight.display_order || index + 1}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                                
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                  {highlight.title}
                                </Typography>
                                
                                {highlight.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      mb: 2
                                    }}
                                  >
                                    {highlight.description}
                                  </Typography>
                                )}
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditHighlight(highlight)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(highlight)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </ImageListItem>
                        ))}
                      </ImageList>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
          </Box>
        )}
      </Paper>

      {/* Add/Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editMode ? 'Edit Highlight' : 'Add New Highlight'}
          </Typography>
          <IconButton onClick={handleModalClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Highlight {editMode ? 'updated' : 'created'} successfully!
            </Alert>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    label="Year"
                    disabled={submitLoading || submitSuccess}
                  >
                    {validYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Highlight Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                  disabled={submitLoading || submitSuccess}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={submitLoading || submitSuccess}
                  placeholder="Describe this achievement or milestone..."
                />
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ImageIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Highlight Image {!editMode && <span style={{ color: 'red' }}>*</span>}
                      </Typography>
                    </Box>

                    {(currentImageUrl && !imagePreview) && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Current image:
                        </Typography>
                        <img
                          src={`${STATIC_URL}${currentImageUrl}`}
                          alt="Current highlight"
                          style={{
                            width: '200px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      </Box>
                    )}

                    {imagePreview && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          New image preview:
                        </Typography>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: '200px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      </Box>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!editMode}
                      disabled={submitLoading || submitSuccess}
                      style={{
                        padding: '12px',
                        border: '2px dashed #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#fafafa'
                      }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      Supported formats: JPG, PNG, GIF, WebP (Max: 10MB)
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleModalClose}
            disabled={submitLoading}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitLoading || submitSuccess}
            variant="contained"
            size="large"
            startIcon={submitLoading ? <CircularProgress size={16} /> : null}
          >
            {submitLoading
              ? (editMode ? 'Updating...' : 'Creating...')
              : (editMode ? 'Update Highlight' : 'Create Highlight')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Delete Highlight</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.highlight?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Add Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddHighlight}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' }
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default AdminManageHighlights;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, TextField, IconButton, MenuItem,
  Select, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel,
  Chip, Alert, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, InputAdornment,
  TablePagination, Paper, Stack, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { API_URL, STATIC_URL } from '../../config';

const AdminManageGeneralTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add testimonial modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [testimonialText, setTestimonialText] = useState('');
  const [image, setImage] = useState(null);
  const [type, setType] = useState('community');
  const [featured, setFeatured] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editTestimonialText, setEditTestimonialText] = useState('');
  const [editType, setEditType] = useState('community');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const fetchTestimonials = useCallback(async () => {
    try {
      setFetchingData(true);
      const res = await axios.get(`${API_URL}/generaltestimonials`, { withCredentials: true });
      
      // Sort testimonials by featured first, then by name
      const sortedTestimonials = res.data.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      });
      
      setTestimonials(sortedTestimonials);
      setError('');
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials');
      setTestimonials([]);
    } finally {
      setFetchingData(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Filter and search logic
  useEffect(() => {
    let filtered = testimonials;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(testimonial =>
        `${testimonial.first_name} ${testimonial.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.testimonial.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(testimonial => 
        (testimonial.type || 'community').toLowerCase() === typeFilter
      );
    }

    // Apply featured filter
    if (featuredFilter) {
      if (featuredFilter === 'featured') {
        filtered = filtered.filter(testimonial => testimonial.featured);
      } else if (featuredFilter === 'not-featured') {
        filtered = filtered.filter(testimonial => !testimonial.featured);
      }
    }

    // Sort filtered results (featured first)
    filtered = filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    });

    setFilteredTestimonials(filtered);
    setPage(0); // Reset to first page when filters change
  }, [testimonials, searchTerm, typeFilter, featuredFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setFeaturedFilter('');
  };

  // Modal form reset
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setTestimonialText('');
    setImage(null);
    setType('community');
    setFeatured(false);
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // Add testimonial functionality
  const handleAddModalOpen = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !testimonialText || !type) {
      setSubmitError('First name, last name, testimonial, and type are required');
      return;
    }
    
    const formData = new FormData();
    formData.append('first_name', firstName.trim());
    formData.append('last_name', lastName.trim());
    formData.append('testimonial', testimonialText.trim());
    formData.append('type', type.toLowerCase());
    formData.append('featured', featured);
    
    if (image) {
      formData.append('image', image);
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      await axios.post(`${API_URL}/generaltestimonials`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSubmitSuccess(true);
      fetchTestimonials(); // Refresh the testimonials list
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleModalClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error adding testimonial:', err);
      
      if (err.response?.status === 413) {
        setSubmitError('File too large. Please choose a smaller image.');
      } else if (err.response?.data?.message) {
        setSubmitError(`Failed to add testimonial: ${err.response.data.message}`);
      } else {
        setSubmitError('Failed to add testimonial. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    
    try {
      await axios.delete(`${API_URL}/generaltestimonials/${id}`, { withCredentials: true });
      fetchTestimonials();
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      setError('Failed to delete testimonial');
    }
  };

  const handleTypeChange = async (id, newType) => {
    try {
      await axios.put(`${API_URL}/generaltestimonials/${id}/type`, { 
        type: newType.toLowerCase() 
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      fetchTestimonials();
    } catch (err) {
      console.error('Failed to update type:', err);
      setError('Could not update testimonial type.');
    }
  };

  const handleFeaturedToggle = async (id, currentFeatured) => {
    try {
      await axios.put(`${API_URL}/generaltestimonials/${id}/featured`, { 
        featured: !currentFeatured 
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      fetchTestimonials();
    } catch (err) {
      console.error('Failed to update featured status:', err);
      setError('Could not update featured status.');
    }
  };

  const handleEditClick = (testimonial) => {
    setEditingTestimonial(testimonial);
    setEditFirstName(testimonial.first_name);
    setEditLastName(testimonial.last_name);
    setEditTestimonialText(testimonial.testimonial);
    setEditType(testimonial.type || 'community');
    setEditFeatured(testimonial.featured || false);
    setEditImage(null);
    setCurrentImageUrl(testimonial.image);
    setSubmitError('');
    setSubmitSuccess(false);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editFirstName.trim() || !editLastName.trim() || !editTestimonialText.trim()) {
      setSubmitError('First name, last name, and testimonial are required');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('first_name', editFirstName.trim());
      formData.append('last_name', editLastName.trim());
      formData.append('testimonial', editTestimonialText.trim());
      formData.append('type', editType.toLowerCase());
      formData.append('featured', editFeatured);
      
      if (editImage) {
        formData.append('image', editImage);
      }

      await axios.put(`${API_URL}/generaltestimonials/${editingTestimonial.id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSubmitSuccess(true);
      fetchTestimonials();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleEditCancel();
      }, 2000);
      
    } catch (err) {
      console.error('Error updating testimonial:', err);
      setSubmitError(`Failed to update testimonial: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingTestimonial(null);
    setEditFirstName('');
    setEditLastName('');
    setEditTestimonialText('');
    setEditType('community');
    setEditFeatured(false);
    setEditImage(null);
    setCurrentImageUrl('');
    setSubmitError('');
    setSubmitSuccess(false);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated data
  const paginatedTestimonials = filteredTestimonials.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getTypeColor = (type) => {
    const colors = {
      'community': 'primary',
      'volunteers': 'secondary',
      'collaborators': 'success'
    };
    return colors[type?.toLowerCase()] || 'default';
  };

  const getTypeDisplayName = (type) => {
    const names = {
      'community': 'Community',
      'volunteers': 'Volunteers',
      'collaborators': 'Collaborators'
    };
    return names[type?.toLowerCase()] || 'Community';
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (fetchingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Testimonials Management ({testimonials.length} total, {filteredTestimonials.length} shown)
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddModalOpen}
          size="large"
        >
          Add Testimonial
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon /> Search & Filters
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search testimonials"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or testimonial..."
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

          {/* Type Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Filter by Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="community">Community</MenuItem>
                <MenuItem value="volunteers">Volunteers</MenuItem>
                <MenuItem value="collaborators">Collaborators</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Featured Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="featured">Featured Only</MenuItem>
                <MenuItem value="not-featured">Not Featured</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Clear Filters */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              disabled={!searchTerm && !typeFilter && !featuredFilter}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {(searchTerm || typeFilter || featuredFilter) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Active filters:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {searchTerm && (
                <Chip
                  label={`Search: "${searchTerm}"`}
                  onDelete={() => setSearchTerm('')}
                  size="small"
                  color="primary"
                />
              )}
              {typeFilter && (
                <Chip
                  label={`Type: ${getTypeDisplayName(typeFilter)}`}
                  onDelete={() => setTypeFilter('')}
                  size="small"
                  color="secondary"
                />
              )}
              {featuredFilter && (
                <Chip
                  label={`Status: ${featuredFilter === 'featured' ? 'Featured' : 'Not Featured'}`}
                  onDelete={() => setFeaturedFilter('')}
                  size="small"
                  color="success"
                />
              )}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Testimonials Table */}
      {filteredTestimonials.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {testimonials.length === 0 ? 'No testimonials found' : 'No testimonials match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {testimonials.length === 0 
              ? 'Click the "Add Testimonial" button to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </Typography>
          {(searchTerm || typeFilter || featuredFilter) && (
            <Button variant="outlined" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </Box>
      ) : (
        <Paper elevation={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Person</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 300 }}>Testimonial</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100, textAlign: 'center' }}>Featured</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Photo</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTestimonials.map((testimonial) => (
                  <TableRow 
                    key={testimonial.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f9f9f9' 
                      },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    {/* Person Name */}
                    <TableCell>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.first_name} {testimonial.last_name}
                      </Typography>
                    </TableCell>

                    {/* Testimonial Text */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {truncateText(testimonial.testimonial, 150)}
                      </Typography>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Chip
                        label={getTypeDisplayName(testimonial.type)}
                        color={getTypeColor(testimonial.type)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>

                    {/* Featured Status */}
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleFeaturedToggle(testimonial.id, testimonial.featured)}
                        color={testimonial.featured ? "primary" : "default"}
                        size="small"
                        title={testimonial.featured ? "Remove from featured" : "Mark as featured"}
                        disabled={loading}
                      >
                        {testimonial.featured ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </TableCell>

                    {/* Photo */}
                    <TableCell>
                      <Avatar
                        src={testimonial.image ? `${STATIC_URL}/uploads/testimonials/${testimonial.image}` : ''}
                        alt={`${testimonial.first_name} ${testimonial.last_name}`}
                        sx={{ 
                          width: 50, 
                          height: 50,
                          backgroundColor: '#f5f5f5',
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleEditClick(testimonial)} 
                          color="info"
                          size="small"
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'info.light',
                              color: 'white'
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        
                        <IconButton 
                          onClick={() => handleDelete(testimonial.id)} 
                          color="error"
                          size="small"
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'error.light',
                              color: 'white'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredTestimonials.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid #e0e0e0' }}
          />
        </Paper>
      )}

      {/* Add Testimonial Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            maxHeight: '95vh',
            m: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6">
            Add New Testimonial
          </Typography>
          <IconButton onClick={handleModalClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Testimonial added successfully! Closing...
            </Alert>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  fullWidth
                  required
                  disabled={submitLoading || submitSuccess}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  fullWidth
                  required
                  disabled={submitLoading || submitSuccess}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Testimonial"
                  value={testimonialText}
                  onChange={e => setTestimonialText(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  disabled={submitLoading || submitSuccess}
                  placeholder="Enter the testimonial text..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    label="Type"
                    disabled={submitLoading || submitSuccess}
                  >
                    <MenuItem value="community">Community</MenuItem>
                    <MenuItem value="volunteers">Volunteers</MenuItem>
                    <MenuItem value="collaborators">Collaborators</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      color="primary"
                      disabled={submitLoading || submitSuccess}
                    />
                  }
                  label="Featured Testimonial"
                />
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Person's Photo (Optional)
                  </Typography>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setImage(e.target.files[0])}
                    disabled={submitLoading || submitSuccess}
                    style={{
                      padding: '12px',
                      border: '2px dashed #e0e0e0',
                      borderRadius: '8px',
                      width: '100%',
                      backgroundColor: '#fafafa'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Recommended: Square image (1:1 ratio), maximum 2MB. Leave empty for default avatar.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #e0e0e0',
          gap: 2
        }}>
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
            variant="contained"
            disabled={submitLoading || submitSuccess}
            size="large"
          >
            {submitLoading ? 'Adding...' : 'Add Testimonial'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Testimonial Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleEditCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            maxHeight: '95vh',
            m: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6">
            Edit Testimonial
          </Typography>
          <IconButton onClick={handleEditCancel} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Testimonial updated successfully! Closing...
            </Alert>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                required
                fullWidth
                disabled={submitLoading || submitSuccess}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                required
                fullWidth
                disabled={submitLoading || submitSuccess}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Testimonial"
                value={editTestimonialText}
                onChange={(e) => setEditTestimonialText(e.target.value)}
                required
                fullWidth
                multiline
                rows={4}
                disabled={submitLoading || submitSuccess}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={submitLoading || submitSuccess}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editType}
                  label="Type"
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <MenuItem value="community">Community</MenuItem>
                  <MenuItem value="volunteers">Volunteers</MenuItem>
                  <MenuItem value="collaborators">Collaborators</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    color="primary"
                    disabled={submitLoading || submitSuccess}
                  />
                }
                label="Featured Testimonial"
              />
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Update Photo
                </Typography>
                
                {editingTestimonial && currentImageUrl && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Current photo:
                    </Typography>
                    <Avatar
                      src={`${STATIC_URL}/uploads/testimonials/${currentImageUrl}`}
                      alt="Current photo"
                      sx={{
                        width: 80,
                        height: 80,
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </Box>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                  disabled={submitLoading || submitSuccess}
                  style={{
                    padding: '12px',
                    border: '2px dashed #e0e0e0',
                    borderRadius: '8px',
                    width: '100%',
                    backgroundColor: '#fafafa'
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Leave empty to keep current photo. Upload new image to replace.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #e0e0e0',
          gap: 2
        }}>
          <Button 
            onClick={handleEditCancel} 
            disabled={submitLoading}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={submitLoading || submitSuccess}
            size="large"
          >
            {submitLoading ? 'Updating...' : 'Update Testimonial'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManageGeneralTestimonials;
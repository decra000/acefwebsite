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
import BusinessIcon from '@mui/icons-material/Business';
import { API_URL, STATIC_URL } from '../../config';

const AdminManagePartners = () => {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
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

  // Add partner modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState(null);
  const [type, setType] = useState('partner');
  const [featured, setFeatured] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('partner');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editLogo, setEditLogo] = useState(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');

  const fetchPartners = useCallback(async () => {
    try {
      setFetchingData(true);
      const res = await axios.get(`${API_URL}/partners`, { withCredentials: true });
      
      // Sort partners by featured first, then by name
      const sortedPartners = res.data.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setPartners(sortedPartners);
      setError('');
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to load partners');
      setPartners([]);
    } finally {
      setFetchingData(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Filter and search logic
  useEffect(() => {
    let filtered = partners;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(partner => 
        (partner.type || 'partner').toLowerCase() === typeFilter
      );
    }

    // Apply featured filter
    if (featuredFilter) {
      if (featuredFilter === 'featured') {
        filtered = filtered.filter(partner => partner.featured);
      } else if (featuredFilter === 'not-featured') {
        filtered = filtered.filter(partner => !partner.featured);
      }
    }

    // Sort filtered results (featured first)
    filtered = filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });

    setFilteredPartners(filtered);
    setPage(0); // Reset to first page when filters change
  }, [partners, searchTerm, typeFilter, featuredFilter]);

  // Get unique types for filter dropdown
  const types = [...new Set(partners.map(partner => partner.type || 'partner'))].filter(Boolean);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setFeaturedFilter('');
  };

  // Modal form reset
  const resetForm = () => {
    setName('');
    setLogo(null);
    setType('partner');
    setFeatured(false);
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // Add partner functionality
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
    
    if (!name || !logo || !type) {
      setSubmitError('All fields are required');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('logo', logo);
    formData.append('type', type.toLowerCase());
    formData.append('featured', featured);

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      await axios.post(`${API_URL}/partners`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSubmitSuccess(true);
      fetchPartners(); // Refresh the partners list
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleModalClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error uploading partner:', err);
      
      if (err.response?.status === 413) {
        setSubmitError('File too large. Please choose a smaller image.');
      } else if (err.response?.data?.message) {
        setSubmitError(`Failed to add partner: ${err.response.data.message}`);
      } else {
        setSubmitError('Failed to add partner. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this partner?')) return;
    
    try {
      await axios.delete(`${API_URL}/partners/${id}`, { withCredentials: true });
      fetchPartners();
    } catch (err) {
      console.error('Error deleting partner:', err);
      setError('Failed to delete partner');
    }
  };

  const handleTypeChange = async (id, newType) => {
    try {
      await axios.put(`${API_URL}/partners/${id}/type`, { 
        type: newType.toLowerCase() 
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      fetchPartners();
    } catch (err) {
      console.error('Failed to update type:', err);
      setError('Could not update partner type.');
    }
  };

  const handleFeaturedToggle = async (id, currentFeatured) => {
    try {
      await axios.put(`${API_URL}/partners/${id}/featured`, { 
        featured: !currentFeatured 
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      fetchPartners();
    } catch (err) {
      console.error('Failed to update featured status:', err);
      setError('Could not update featured status.');
    }
  };

  const handleEditClick = (partner) => {
    setEditingPartner(partner);
    setEditName(partner.name);
    setEditType(partner.type || 'partner');
    setEditFeatured(partner.featured || false);
    setEditLogo(null);
    setCurrentLogoUrl(partner.logo);
    setSubmitError('');
    setSubmitSuccess(false);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editName.trim()) {
      setSubmitError('Name is required');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('type', editType.toLowerCase());
      formData.append('featured', editFeatured);
      
      if (editLogo) {
        formData.append('logo', editLogo);
      }

      await axios.put(`${API_URL}/partners/${editingPartner.id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSubmitSuccess(true);
      fetchPartners();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleEditCancel();
      }, 2000);
      
    } catch (err) {
      console.error('Error updating partner:', err);
      setSubmitError(`Failed to update partner: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingPartner(null);
    setEditName('');
    setEditType('partner');
    setEditFeatured(false);
    setEditLogo(null);
    setCurrentLogoUrl('');
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
  const paginatedPartners = filteredPartners.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getTypeColor = (type) => {
    const colors = {
      'partner': 'primary',
      'accreditator': 'secondary',
      'both': 'success'
    };
    return colors[type?.toLowerCase()] || 'default';
  };

  const getTypeDisplayName = (type) => {
    const names = {
      'partner': 'Partner',
      'accreditator': 'Accreditator',
      'both': 'Both'
    };
    return names[type?.toLowerCase()] || 'Partner';
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
          Partners Management ({partners.length} total, {filteredPartners.length} shown)
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddModalOpen}
          size="large"
        >
          Add Partner
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
              label="Search partners"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
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
                <MenuItem value="partner">Partner</MenuItem>
                <MenuItem value="accreditator">Accreditator</MenuItem>
                <MenuItem value="both">Both</MenuItem>
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

      {/* Partners Table */}
      {filteredPartners.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {partners.length === 0 ? 'No partners found' : 'No partners match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {partners.length === 0 
              ? 'Click the "Add Partner" button to get started'
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
                  <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Partner</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100, textAlign: 'center' }}>Featured</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Logo</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPartners.map((partner) => (
                  <TableRow 
                    key={partner.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f9f9f9' 
                      },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    {/* Partner Name */}
                    <TableCell>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {partner.name}
                      </Typography>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Chip
                        label={getTypeDisplayName(partner.type)}
                        color={getTypeColor(partner.type)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>

                    {/* Featured Status */}
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleFeaturedToggle(partner.id, partner.featured)}
                        color={partner.featured ? "primary" : "default"}
                        size="small"
                        title={partner.featured ? "Remove from featured" : "Mark as featured"}
                        disabled={loading}
                      >
                        {partner.featured ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </TableCell>

                    {/* Logo */}
                    <TableCell>
                      <Avatar
                        src={`${STATIC_URL}/uploads/partners/${partner.logo}`}
                        alt={partner.name}
                        variant="rounded"
                        sx={{ 
                          width: 60, 
                          height: 40,
                          backgroundColor: '#f5f5f5',
                          '& img': {
                            objectFit: 'contain'
                          }
                        }}
                      >
                        <BusinessIcon />
                      </Avatar>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleEditClick(partner)} 
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
                          onClick={() => handleDelete(partner.id)} 
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
            count={filteredPartners.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid #e0e0e0' }}
          />
        </Paper>
      )}

      {/* Add Partner Modal */}
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
            Add New Partner
          </Typography>
          <IconButton onClick={handleModalClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Partner added successfully! Closing...
            </Alert>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Partner Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  fullWidth
                  required
                  disabled={submitLoading || submitSuccess}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    label="Type"
                    disabled={submitLoading || submitSuccess}
                  >
                    <MenuItem value="partner">Partner</MenuItem>
                    <MenuItem value="accreditator">Accreditator</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
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
                  label="Featured Partner"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Partner Logo <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setLogo(e.target.files[0])}
                    required
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
                    Recommended: PNG or SVG format, transparent background, maximum 2MB
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
            {submitLoading ? 'Adding...' : 'Add Partner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Partner Modal */}
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
            Edit Partner
          </Typography>
          <IconButton onClick={handleEditCancel} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Partner updated successfully! Closing...
            </Alert>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Partner Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                fullWidth
                disabled={submitLoading || submitSuccess}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={submitLoading || submitSuccess} sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editType}
                  label="Type"
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <MenuItem value="partner">Partner</MenuItem>
                  <MenuItem value="accreditator">Accreditator</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
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
                label="Featured Partner"
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Update Logo
                </Typography>
                
                {editingPartner && currentLogoUrl && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Current logo:
                    </Typography>
                    <img 
                      src={`${STATIC_URL}/uploads/partners/${currentLogoUrl}`}
                      alt="Current logo"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '100px',
                        objectFit: 'contain',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        padding: '8px',
                        backgroundColor: '#fafafa'
                      }}
                    />
                  </Box>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditLogo(e.target.files[0])}
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
                  Leave empty to keep current logo. Upload new image to replace.
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
            {submitLoading ? 'Updating...' : 'Update Partner'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagePartners;
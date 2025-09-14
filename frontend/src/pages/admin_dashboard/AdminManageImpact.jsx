import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Card, CardContent, CardActions, Grid, Chip, IconButton,
  Alert, Snackbar, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Avatar, Tooltip
} from '@mui/material';
import {
  Add, Edit, Delete, TrendingUp, People, LocationCity, CheckCircle,
  Handshake, AttachMoney, VolunteerActivism, Assessment, Refresh,
  Visibility, VisibilityOff, Star, StarBorder
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const API_BASE = API_URL;

// Icon mapping for impact types
const iconMap = {
  people: People,
  location_city: LocationCity,
  check_circle: CheckCircle,
  handshake: Handshake,
  attach_money: AttachMoney,
  volunteer_activism: VolunteerActivism,
  assessment: Assessment,
  trending_up: TrendingUp
};

const AdminManageImpact = () => {
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImpact, setEditingImpact] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    is_active: '',
    is_featured: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Enhanced form state with better validation
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    starting_value: 0,
    current_value: 0,
    unit: '',
    icon: 'assessment',
    color: '#1976d2',
    order_index: 0,
    is_active: true,
    is_featured: false
  });

  const [formErrors, setFormErrors] = useState({});

  const colorOptions = [
    { value: '#1976d2', label: 'Blue', color: '#1976d2' },
    { value: '#2196F3', label: 'Light Blue', color: '#2196F3' },
    { value: '#4CAF50', label: 'Green', color: '#4CAF50' },
    { value: '#FF9800', label: 'Orange', color: '#FF9800' },
    { value: '#9C27B0', label: 'Purple', color: '#9C27B0' },
    { value: '#F44336', label: 'Red', color: '#F44336' },
    { value: '#00BCD4', label: 'Cyan', color: '#00BCD4' },
    { value: '#795548', label: 'Brown', color: '#795548' },
    { value: '#607D8B', label: 'Blue Grey', color: '#607D8B' }
  ];

  const iconOptions = [
    { value: 'people', label: 'People', icon: People },
    { value: 'location_city', label: 'Communities', icon: LocationCity },
    { value: 'check_circle', label: 'Projects', icon: CheckCircle },
    { value: 'handshake', label: 'Partnerships', icon: Handshake },
    { value: 'attach_money', label: 'Funding', icon: AttachMoney },
    { value: 'volunteer_activism', label: 'Volunteers', icon: VolunteerActivism },
    { value: 'assessment', label: 'Assessment', icon: Assessment },
    { value: 'trending_up', label: 'Growth', icon: TrendingUp }
  ];

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchImpacts(),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
        showSnackbar('Error loading data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchImpacts();
    }
  }, [filters]);

  const fetchImpacts = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') queryParams.append(key, value);
      });

      const url = `${API_BASE}/impacts${queryParams.toString() ? `?${queryParams}` : ''}`;
      console.log('Fetching impacts from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched impacts data:', data);
      
      if (data.success) {
        setImpacts(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error('Unexpected response format:', data);
        setImpacts([]);
        showSnackbar(data.message || 'Unexpected response format from server', 'warning');
      }
    } catch (error) {
      console.error('Error fetching impacts:', error);
      setImpacts([]);
      showSnackbar(`Error fetching impacts: ${error.message}`, 'error');
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from:', `${API_BASE}/impacts/stats`);
      const response = await fetch(`${API_BASE}/impacts/stats`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Stats response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Stats data:', data);
        if (data.success) {
          setStats(data.data || {});
        } else {
          console.warn('Stats fetch unsuccessful:', data.message);
        }
      } else {
        const errorText = await response.text();
        console.warn('Stats fetch failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      starting_value: 0,
      current_value: 0,
      unit: '',
      icon: 'assessment',
      color: '#1976d2',
      order_index: 0,
      is_active: true,
      is_featured: false
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Impact name is required';
    }
    
    if (formData.starting_value < 0) {
      errors.starting_value = 'Starting value cannot be negative';
    }
    
    if (editingImpact && formData.current_value < 0) {
      errors.current_value = 'Current value cannot be negative';
    }
    
    if (formData.order_index < 0) {
      errors.order_index = 'Order index cannot be negative';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (impact = null) => {
    if (impact) {
      setEditingImpact(impact);
      setFormData({
        name: impact.name || '',
        description: impact.description || '',
        starting_value: impact.starting_value || 0,
        current_value: impact.current_value || 0,
        unit: impact.unit || '',
        icon: impact.icon || 'assessment',
        color: impact.color || '#1976d2',
        order_index: impact.order_index || 0,
        is_active: Boolean(impact.is_active),
        is_featured: Boolean(impact.is_featured)
      });
    } else {
      setEditingImpact(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingImpact(null);
    resetForm();
    setSubmitting(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the form errors', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingImpact 
        ? `${API_BASE}/impacts/${editingImpact.id}`
        : `${API_BASE}/impacts`;
      
      const method = editingImpact ? 'PUT' : 'POST';

      // Prepare the data payload with explicit type conversion
      const payload = {
        name: String(formData.name).trim(),
        description: String(formData.description || '').trim(),
        starting_value: Number(formData.starting_value) || 0,
        unit: String(formData.unit || '').trim(),
        icon: String(formData.icon || 'assessment'),
        color: String(formData.color || '#1976d2'),
        order_index: Number(formData.order_index) || 0,
        is_active: Boolean(formData.is_active),
        is_featured: Boolean(formData.is_featured)
      };

      // Only include current_value for updates
      if (editingImpact) {
        payload.current_value = Number(formData.current_value) || 0;
      }

      console.log('Submitting to URL:', url);
      console.log('Method:', method);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid response format from server');
      }

      if (data.success) {
        showSnackbar(
          `Impact ${editingImpact ? 'updated' : 'created'} successfully`, 
          'success'
        );
        handleCloseDialog();
        await fetchImpacts();
        await fetchStats();
      } else {
        showSnackbar(data.message || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error submitting impact:', error);
      showSnackbar(`Error submitting impact: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this impact? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/impacts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar('Impact deleted successfully', 'success');
        await fetchImpacts();
        await fetchStats();
      } else {
        showSnackbar(data.message || 'Delete failed', 'error');
      }
    } catch (error) {
      console.error('Error deleting impact:', error);
      showSnackbar(`Error deleting impact: ${error.message}`, 'error');
    }
  };

  const handleRecalculateTotals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/impacts/recalculate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar('Impact totals recalculated successfully', 'success');
        await fetchImpacts();
        await fetchStats();
      } else {
        showSnackbar(data.message || 'Recalculation failed', 'error');
      }
    } catch (error) {
      console.error('Error recalculating totals:', error);
      showSnackbar(`Error recalculating totals: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const renderIcon = (iconName, color = '#1976d2') => {
    const IconComponent = iconMap[iconName] || Assessment;
    return <IconComponent style={{ color }} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          📊 Manage Impact Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRecalculateTotals}
            disabled={loading}
          >
            Recalculate
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            Add Impact
          </Button>
        </Box>
      </Box>

      {/* Enhanced Statistics Summary with featured impacts */}
      {stats && Object.keys(stats).length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Impacts
                </Typography>
                <Typography variant="h5">
                  {stats.total_impacts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Impacts
                </Typography>
                <Typography variant="h5">
                  {stats.active_impacts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Featured Impacts
                </Typography>
                <Typography variant="h5">
                  {stats.featured_impacts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Impact Value
                </Typography>
                <Typography variant="h5">
                  {formatNumber(stats.total_impact_value || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Projects with Impact
                </Typography>
                <Typography variant="h5">
                  {stats.projects_with_impacts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.is_active}
                onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
              >
                <MenuItem value="">All Impacts</MenuItem>
                <MenuItem value="true">Active Only</MenuItem>
                <MenuItem value="false">Inactive Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Featured</InputLabel>
              <Select
                value={filters.is_featured}
                onChange={(e) => setFilters(prev => ({ ...prev, is_featured: e.target.value }))}
              >
                <MenuItem value="">All Impacts</MenuItem>
                <MenuItem value="true">Featured Only</MenuItem>
                <MenuItem value="false">Not Featured</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              onClick={() => setFilters({ is_active: '', is_featured: '' })}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Impacts Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : impacts.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Impact</TableCell>
                <TableCell>Starting Value</TableCell>
                <TableCell>Current Value</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="center">Projects</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Featured</TableCell>
                <TableCell align="center">Order</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {impacts.map((impact) => (
                <TableRow key={impact.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: impact.color, width: 40, height: 40 }}>
                        {renderIcon(impact.icon, '#ffffff')}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {impact.name}
                          {impact.is_featured && (
                            <Star sx={{ ml: 1, fontSize: 16, color: '#FFD700' }} />
                          )}
                        </Typography>
                        {impact.description && (
                          <Typography variant="caption" color="text.secondary">
                            {impact.description.length > 50 
                              ? `${impact.description.substring(0, 50)}...`
                              : impact.description
                            }
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatNumber(impact.starting_value || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color={impact.color}>
                      {formatNumber(impact.current_value || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={impact.unit || 'units'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={impact.project_count || 0} 
                      size="small" 
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={impact.is_active ? 'Active' : 'Inactive'}
                      color={impact.is_active ? 'success' : 'default'}
                      size="small"
                      icon={impact.is_active ? <Visibility /> : <VisibilityOff />}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={impact.is_featured ? 'Featured' : 'Not Featured'}
                      color={impact.is_featured ? 'warning' : 'default'}
                      size="small"
                      icon={impact.is_featured ? <Star /> : <StarBorder />}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {impact.order_index}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Edit Impact">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(impact)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={impact.project_count > 0 ? "Cannot delete: Impact has associated projects" : "Delete Impact"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(impact.id)}
                            disabled={impact.project_count > 0}
                          >
                            <Delete />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No impact metrics found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by creating your first impact metric to track project outcomes
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Impact Metric
          </Button>
        </Box>
      )}

      {/* Enhanced Create/Edit Dialog with featuring option */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingImpact ? 'Edit Impact Metric' : 'Create New Impact Metric'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Impact Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name || 'e.g., "People Served", "Communities Reached"'}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                helperText="Brief description of what this impact measures"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Starting Value"
                type="number"
                fullWidth
                value={formData.starting_value}
                onChange={(e) => handleInputChange('starting_value', parseInt(e.target.value) || 0)}
                error={!!formErrors.starting_value}
                helperText={formErrors.starting_value || "Initial/baseline value before any project contributions"}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Current Value"
                type="number"
                fullWidth
                value={formData.current_value}
                onChange={(e) => handleInputChange('current_value', parseInt(e.target.value) || 0)}
                error={!!formErrors.current_value}
                helperText={editingImpact 
                  ? (formErrors.current_value || "Current total (starting value + project contributions)")
                  : "Will be automatically set to starting value for new impacts"
                }
                disabled={!editingImpact}
                InputProps={{
                  readOnly: !editingImpact
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Unit"
                fullWidth
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                helperText="e.g., people, communities, projects, USD"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                >
                  {iconOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <option.icon />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                >
                  {colorOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 20, 
                            height: 20, 
                            backgroundColor: option.color,
                            borderRadius: '50%'
                          }} 
                        />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Order Index"
                type="number"
                fullWidth
                value={formData.order_index}
                onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)}
                error={!!formErrors.order_index}
                helperText={formErrors.order_index || "Lower numbers appear first"}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  />
                }
                label="Featured"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={submitting || Object.keys(formErrors).length > 0}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting 
              ? (editingImpact ? 'Updating...' : 'Creating...') 
              : (editingImpact ? 'Update' : 'Create') + ' Impact'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminManageImpact;
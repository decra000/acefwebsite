import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  List, ListItem, IconButton, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, FormControl, InputLabel,
  Select, MenuItem, OutlinedInput, Checkbox, ListItemText,
  Alert, CircularProgress, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";

import { API_URL } from '../../config';

const API_BASE = API_URL;

const AdminManagePillars = () => {
  const { user } = useAuth();
  
  // State management
  const [pillars, setPillars] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [loading, setLoading] = useState(true);
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
    focusAreaIds: []
  });

  // Enhanced error handling function
  const handleApiError = async (response, operation) => {
    let errorMessage = `Failed to ${operation}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      // Log detailed error information
      console.error(`API Error (${operation}):`, {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      
      // If there are detailed error messages, include them
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

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching pillars and focus areas...');
      
      // Fetch pillars and focus areas in parallel
      const [pillarsRes, focusAreasRes] = await Promise.all([
        fetch(`${API_BASE}/pillars`, { credentials: 'include' }),
        fetch(`${API_BASE}/pillars/meta/focus-areas`, { credentials: 'include' })
      ]);
      
      // Handle pillars response
      if (!pillarsRes.ok) {
        const errorMessage = await handleApiError(pillarsRes, 'load pillars');
        throw new Error(errorMessage);
      }
      
      // Handle focus areas response
      if (!focusAreasRes.ok) {
        const errorMessage = await handleApiError(focusAreasRes, 'load focus areas');
        throw new Error(errorMessage);
      }
      
      const pillarsData = await pillarsRes.json();
      const focusAreasData = await focusAreasRes.json();
      
      setPillars(pillarsData.data || []);
      setFocusAreas(focusAreasData.data || []);
      
      console.log('Data loaded successfully:', { 
        pillars: pillarsData.data?.length, 
        focusAreas: focusAreasData.data?.length 
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset feedback messages
  const resetFeedback = () => {
    setError('');
    setSuccess('');
  };

  // Open dialog for creating new pillar
  const handleAdd = () => {
    resetFeedback();
    setEditingPillar(null);
    setFormData({ name: '', description: '', focusAreaIds: [] });
    setDialogOpen(true);
  };

  // Open dialog for editing existing pillar
  const handleEdit = (pillar) => {
    resetFeedback();
    setEditingPillar(pillar);
    
    console.log('Editing pillar:', pillar);
    console.log('Focus areas structure:', pillar.focus_areas);
    
    // Safely extract focus area IDs, filtering out null/invalid values
    let focusAreaIds = [];
    if (pillar.focus_areas && Array.isArray(pillar.focus_areas)) {
      focusAreaIds = pillar.focus_areas
        .filter(fa => fa && fa.id !== null && fa.id !== undefined)
        .map(fa => fa.id);
    }
    
    console.log('Extracted focus area IDs:', focusAreaIds);
    
    setFormData({
      name: pillar.name || '',
      description: pillar.description || '',
      focusAreaIds: focusAreaIds
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPillar(null);
    setFormData({ name: '', description: '', focusAreaIds: [] });
    resetFeedback();
  };

  // Handle form submission with enhanced error handling
  const handleSubmit = async () => {
    resetFeedback();
    
    // Validation
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
      
      // Prepare request body with type safety
      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        focusAreaIds: formData.focusAreaIds
          .filter(id => id !== null && id !== undefined && id !== '')
          .map(id => parseInt(id))
          .filter(id => !isNaN(id)) // Remove any NaN values
      };
      
      console.log('Submitting request:', {
        url,
        method,
        body: requestBody,
        editingPillar: editingPillar?.id
      });

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, editingPillar ? 'update pillar' : 'create pillar');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      setSuccess(editingPillar ? 'Pillar updated successfully!' : 'Pillar created successfully!');
      handleCloseDialog();
      
      // Refresh data after successful operation
      await fetchData();
    } catch (err) {
      console.error('Submit error:', err);
      
      // Provide more user-friendly error messages
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
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Delete response:', {
        status: response.status,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'delete pillar');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Delete success:', result);
      
      setSuccess('Pillar deleted successfully!');
      await fetchData(); // Refresh data
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
    console.log('Focus area change:', value);
    
    // Filter out null/undefined values and ensure we have valid IDs
    const cleanedValue = Array.isArray(value) 
      ? value.filter(id => id !== null && id !== undefined && id !== '')
      : [];
    
    console.log('Cleaned focus area IDs:', cleanedValue);
    
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Manage Programme Pillars</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={submitting}
          sx={{ mb: 2 }}
        >
          Add New Pillar
        </Button>
       <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => navigate('/admin/dashboard/categories')}
      disabled={submitting}
      sx={{ mb: 2 }}
    >
      Add New Focus Area
    </Button>


      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {pillars.map((pillar) => (
          <Grid item xs={12} md={6} lg={4} key={pillar.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                    {pillar.name}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(pillar)}
                      color="primary"
                      disabled={submitting}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(pillar)}
                      color="error"
                      disabled={submitting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pillar.description}
                </Typography>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Focus Areas:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {pillar.focus_areas && pillar.focus_areas.length > 0 ? (
                      pillar.focus_areas.map((fa) => (
                        <Chip 
                          key={fa.id} 
                          label={fa.name} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No focus areas assigned
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {pillars.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No pillars found. Click "Add New Pillar" to get started.
          </Typography>
        </Box>
      )}

      {/* Create/Edit Dialog with loading states */}
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
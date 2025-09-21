import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  List, ListItem, IconButton, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Alert, CircularProgress, 
  Grid, Paper, ListItemText, Accordion, AccordionSummary, AccordionDetails,
  Tooltip, Badge
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReorderIcon from '@mui/icons-material/Reorder';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const AdminManageCoreValues = () => {
  const { user } = useAuth();
  
  // State management
  const [coreValues, setCoreValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

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
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
      errorMessage = `${operation} failed (Status: ${response.status})`;
    }
    
    return errorMessage;
  };

  // Fetch core values
  const fetchCoreValues = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching core values...');
      console.log('API_URL:', API_URL);
      
      const response = await fetch(`${API_URL}/core-values`, { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Core values response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'load core values');
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Raw core values data:', data);
      
      const coreValuesArray = data.data || [];
      setCoreValues(coreValuesArray);
      
      console.log('Core values loaded successfully:', { 
        count: coreValuesArray.length
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch core values: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset feedback messages
  const resetFeedback = () => {
    setError('');
    setSuccess('');
  };

  // Open dialog for creating new core value
  const handleAdd = () => {
    resetFeedback();
    setEditingValue(null);
    setFormData({ title: '', description: '' });
    setDialogOpen(true);
  };

  // Open dialog for editing core value
  const handleEdit = (coreValue) => {
    resetFeedback();
    setEditingValue(coreValue);
    setFormData({
      title: coreValue.title || '',
      description: coreValue.description || ''
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingValue(null);
    setFormData({ title: '', description: '' });
    resetFeedback();
  };

  // Handle form submission
  const handleSubmit = async () => {
    resetFeedback();
    
    if (!formData.title.trim()) {
      setError('Core value title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Core value description is required');
      return;
    }

    if (formData.title.trim().length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }

    if (formData.description.trim().length > 500) {
      setError('Description must be less than 500 characters');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingValue 
        ? `${API_URL}/core-values/${editingValue.id}`
        : `${API_URL}/core-values`;
      
      const method = editingValue ? 'PUT' : 'POST';
      
      console.log('Submitting request:', { url, method, editingValue: editingValue?.id });

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim()
        })
      });

      console.log('Response received:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, editingValue ? 'update core value' : 'create core value');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      setSuccess(editingValue ? 'Core value updated successfully!' : 'Core value created successfully!');
      handleCloseDialog();
      
      await fetchCoreValues();
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

  // Delete core value
  const handleDelete = async (coreValue) => {
    if (!window.confirm(`Are you sure you want to delete "${coreValue.title}"? This action cannot be undone.`)) {
      return;
    }

    resetFeedback();
    setSubmitting(true);

    try {
      console.log('Deleting core value:', coreValue.id);
      
      const response = await fetch(`${API_URL}/core-values/${coreValue.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      console.log('Delete response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'delete core value');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Delete success:', result);
      
      setSuccess('Core value deleted successfully!');
      await fetchCoreValues();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete core value: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCoreValues();
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
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Core Values...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Manage Core Values
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Define and organize your organization's core values (Maximum: 10 values)
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Badge 
              badgeContent={coreValues.length} 
              max={10}
              color={coreValues.length >= 10 ? "error" : "secondary"}
              sx={{ mr: 2 }}
            >
              <Chip 
                label={`${coreValues.length}/10`}
                color={coreValues.length >= 10 ? "error" : "default"}
                variant="filled"
              />
            </Badge>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={submitting || coreValues.length >= 10}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Add Core Value
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Core Values List */}
      {coreValues.length > 0 ? (
        <Grid container spacing={3}>
          {coreValues.map((coreValue, index) => (
            <Grid item xs={12} md={6} key={coreValue.id}>
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
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Header with order badge and actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <DragIndicatorIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit core value">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(coreValue)}
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
                      </Tooltip>
                      <Tooltip title="Delete core value">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(coreValue)}
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
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Title */}
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
                      minHeight: '2.4em'
                    }}
                  >
                    {coreValue.title || 'Untitled Value'}
                  </Typography>
                  
                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '6.4em'
                    }}
                  >
                    {coreValue.description || 'No description available'}
                  </Typography>

                  {/* Metadata */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(coreValue.created_at).toLocaleDateString()}
                      {coreValue.updated_at !== coreValue.created_at && (
                        <> • Updated: {new Date(coreValue.updated_at).toLocaleDateString()}</>
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
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
            No Core Values Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Define your organization's core values to guide your mission and culture.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAdd}
            size="large"
          >
            Create Your First Core Value
          </Button>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={submitting ? undefined : handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingValue ? 'Edit Core Value' : 'Add New Core Value'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Core Value Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              margin="normal"
              required
              disabled={submitting}
              inputProps={{ maxLength: 100 }}
              helperText={`${formData.title.length}/100 characters`}
              error={!formData.title.trim() && formData.title !== ''}
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
              inputProps={{ maxLength: 500 }}
              helperText={`${formData.description.length}/500 characters`}
              error={!formData.description.trim() && formData.description !== ''}
            />
            
            {!editingValue && coreValues.length >= 9 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                You are approaching the maximum limit of 10 core values. 
                {coreValues.length === 9 && " This will be your last core value."}
              </Alert>
            )}
            
            {submitting && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {editingValue ? 'Updating core value...' : 'Creating core value...'}
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
            disabled={submitting || !formData.title.trim() || !formData.description.trim()}
          >
            {submitting 
              ? (editingValue ? 'Updating...' : 'Creating...') 
              : (editingValue ? 'Update' : 'Create')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManageCoreValues;
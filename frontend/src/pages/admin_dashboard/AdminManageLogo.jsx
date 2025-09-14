import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useLogo } from '../../context/LogoContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const AdminManageLogo = () => {
  const { currentLogo, loading, refreshLogo, updateLogo, clearLogo } = useLogo();
  
  // State management
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [altText, setAltText] = useState('');
  const [logoHistory, setLogoHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const fileInputRef = useRef(null);

  // Initialize alt text when logo loads
  useEffect(() => {
    if (currentLogo?.alt_text) {
      setAltText(currentLogo.alt_text);
    }
  }, [currentLogo]);

  // Clear messages after delay
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Upload logo handler - FIXED with fetch
  const handleUploadLogo = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('alt_text', altText || 'ACEF Logo');

      console.log('Uploading file:', file.name, 'Size:', file.size);

      // FIXED: Use axios with proper configuration like AdminManageTeam
      const response = await axios.post(`${API_URL}/logos`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data;

      if (data.success) {
        setSuccess('Logo uploaded successfully!');
        updateLogo(data.data);
        refreshLogo();
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  // Update logo metadata - FIXED with fetch
  const handleUpdateLogo = async () => {
    if (!currentLogo?.id) {
      setError('No logo selected to update');
      return;
    }

    if (!altText.trim()) {
      setError('Alt text is required');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      // FIXED: Use axios with proper configuration like AdminManageTeam
      const response = await axios.put(`${API_URL}/logos/${currentLogo.id}`, 
        { alt_text: altText.trim() },
        { withCredentials: true }
      );

      const data = response.data;

      if (data.success) {
        setSuccess('Logo updated successfully!');
        updateLogo(data.data);
        setEditMode(false);
        refreshLogo();
      } else {
        throw new Error(data.message || 'Update failed');
      }

    } catch (error) {
      console.error('Update failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      setError(`Update failed: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  // Delete logo handler - FIXED with fetch
  const handleDeleteLogo = async () => {
    if (!currentLogo?.id) {
      setError('No logo selected to delete');
      return;
    }

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      // FIXED: Use axios with proper configuration like AdminManageTeam
      const response = await axios.delete(`${API_URL}/logos/${currentLogo.id}`, {
        withCredentials: true
      });

      const data = response.data;

      if (data.success) {
        setSuccess('Logo deleted successfully!');
        clearLogo();
        setDeleteDialogOpen(false);
        refreshLogo();
      } else {
        throw new Error(data.message || 'Delete failed');
      }

    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Delete failed';
      setError(`Delete failed: ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  // Fetch logo history - FIXED with fetch
  const handleFetchHistory = async () => {
    setLoadingHistory(true);
    setError('');

    try {
      // FIXED: Use axios with proper configuration like AdminManageTeam
      const response = await axios.get(`${API_URL}/logos/history`, {
        withCredentials: true
      });

      const data = response.data;

      if (data.success) {
        setLogoHistory(data.data || []);
        setShowHistory(true);
      } else {
        throw new Error(data.message || 'Failed to fetch history');
      }

    } catch (error) {
      console.error('Failed to fetch history:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch history';
      setError(`Failed to fetch history: ${errorMessage}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(false);
    setAltText(currentLogo?.alt_text || '');
  };

  // Render logo preview
  const renderLogoPreview = () => {
    if (loading) {
      return <Skeleton variant="rectangular" width={200} height={200} />;
    }

    if (!currentLogo) {
      return (
        <Box
          sx={{
            width: 200,
            height: 200,
            border: '2px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No logo uploaded
          </Typography>
        </Box>
      );
    }

    return (
      <Avatar
        src={currentLogo.full_url}
        alt={currentLogo.alt_text}
        sx={{
          width: 200,
          height: 200,
          border: '2px solid #e0e0e0',
          '& img': {
            objectFit: 'contain'
          }
        }}
      />
    );
  };



  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Logo Management
      </Typography>

      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Logo Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Logo
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              {renderLogoPreview()}

              {currentLogo && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  {editMode ? (
                    <TextField
                      label="Alt Text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      placeholder="Enter descriptive text for the logo"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Alt Text: {currentLogo.alt_text}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Uploaded: {new Date(currentLogo.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {!editMode && currentLogo && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    size="small"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleting}
                    size="small"
                  >
                    {deleting ? <CircularProgress size={20} /> : 'Delete'}
                  </Button>
                </>
              )}

              {editMode && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleUpdateLogo}
                    disabled={updating}
                    size="small"
                  >
                    {updating ? <CircularProgress size={20} /> : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    size="small"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload New Logo
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                label="Alt Text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                fullWidth
                placeholder="Enter descriptive text for the logo"
                helperText="This text will be used for accessibility and SEO"
              />
            </Box>

            <input
              type="file"
              accept="image/*"
              onChange={handleUploadLogo}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />

            <Button
              variant="contained"
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              fullWidth
              size="large"
            >
              {uploading ? 'Uploading...' : 'Choose Logo File'}
            </Button>

            <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center' }}>
              Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
            </Typography>
          </Paper>
        </Grid>

        {/* History Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Logo History
              </Typography>
              <Button
                variant="outlined"
                startIcon={loadingHistory ? <CircularProgress size={20} /> : <HistoryIcon />}
                onClick={handleFetchHistory}
                disabled={loadingHistory}
              >
                {loadingHistory ? 'Loading...' : 'Load History'}
              </Button>
            </Box>

            {showHistory && (
              <Grid container spacing={2}>
                {logoHistory.map((logo) => (
                  <Grid item xs={12} sm={6} md={4} key={logo.id}>
                    <Card>
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          src={logo.full_url}
                          alt={logo.alt_text}
                          sx={{ width: 80, height: 80 }}
                        />
                      </Box>
                      <CardContent sx={{ pt: 0 }}>
                        <Typography variant="body2" noWrap>
                          {logo.alt_text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(logo.created_at).toLocaleDateString()}
                        </Typography>
                        {logo.is_active && (
                          <Chip
                            label="Active"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {logoHistory.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No logo history found
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the current logo? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteLogo}
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : undefined}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManageLogo;
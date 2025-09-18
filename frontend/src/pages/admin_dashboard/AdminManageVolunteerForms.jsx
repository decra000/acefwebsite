import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Tooltip,
  // Card,
  // CardContent,
  // Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  // BarChart as StatsIcon,
  PowerSettingsNew as ToggleIcon,
} from '@mui/icons-material';
import { API_URL } from '../../config';

const API_BASE = API_URL;

const AdminManageVolunteerForms = () => {
  const [forms, setForms] = useState([]);
  const [countries, setCountries] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [, setStats] = useState({});
  const [, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedForm, setSelectedForm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    country_id: '',
    form_url: '',
    form_title: '',
    description: '',
    is_active: true,
  });

  // 🔄 Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, countriesRes, availableRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/volunteer-forms`, { credentials: 'omit' }),
        fetch(`${API_BASE}/countries`, { credentials: 'omit' }),
        fetch(`${API_BASE}/volunteer-forms/countries/available`, { credentials: 'omit' }),
        fetch(`${API_BASE}/volunteer-forms/stats/overview`, { credentials: 'omit' }),
      ]);

      const formsData = await formsRes.json();
      const countriesData = await countriesRes.json();
      const availableData = await availableRes.json();
      const statsData = await statsRes.json();

      setForms(formsData.data || []);
      setCountries(countriesData || []);
      setAvailableCountries(availableData.data || []);
      setStats(statsData.data || {});
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Handle form submission
  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!formData.country_id || !formData.form_url || !formData.form_title) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const method = dialogMode === 'create' ? 'POST' : 'PUT';
      const url = dialogMode === 'create' 
        ? `${API_BASE}/volunteer-forms`
        : `${API_BASE}/volunteer-forms/${selectedForm.id}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setSuccess(`Form ${dialogMode === 'create' ? 'created' : 'updated'} successfully`);
      setOpenDialog(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // 🗑️ Delete form
  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE}/volunteer-forms/${confirmDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete form');

      setSuccess('Form deleted successfully');
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔄 Toggle form status - FIXED VERSION
  const handleToggleStatus = async (form) => {
    try {
      // Use the same PUT endpoint that works in edit mode
      const toggledFormData = {
        country_id: form.country_id,
        form_url: form.form_url,
        form_title: form.form_title,
        description: form.description || '',
        is_active: !form.is_active, // Toggle the status
      };

      const response = await fetch(`${API_BASE}/volunteer-forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(toggledFormData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Failed to toggle status');

      setSuccess(`Form status ${!form.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (err) {
      setError(err.message);
      console.error('Toggle status error:', err);
    }
  };

  // 🔄 Reset form
  const resetForm = () => {
    setFormData({
      country_id: '',
      form_url: '',
      form_title: '',
      description: '',
      is_active: true,
    });
    setSelectedForm(null);
  };

  // 📖 Open dialog
  const openFormDialog = (mode, form = null) => {
    setDialogMode(mode);
    setSelectedForm(form);
    
    if (form) {
      setFormData({
        country_id: form.country_id,
        form_url: form.form_url,
        form_title: form.form_title,
        description: form.description || '',
        is_active: form.is_active,
      });
    } else {
      resetForm();
    }
    
    setOpenDialog(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📋 Manage Volunteer Forms
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Add Form Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openFormDialog('create')}
          disabled={availableCountries.length === 0}
        >
          Add Volunteer Form
        </Button>
        {availableCountries.length === 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            All countries have volunteer forms assigned
          </Typography>
        )}
      </Box>

      {/* Forms Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell>Form Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell>{form.country_name}</TableCell>
                <TableCell>{form.form_title}</TableCell>
                <TableCell>
                  <Chip
                    label={form.is_active ? 'Active' : 'Inactive'}
                    color={form.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(form.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="View">
                    <IconButton onClick={() => openFormDialog('view', form)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => openFormDialog('edit', form)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle Status">
                    <IconButton onClick={() => handleToggleStatus(form)}>
                      <ToggleIcon color={form.is_active ? 'success' : 'error'} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => setConfirmDelete(form.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && '➕ Add Volunteer Form'}
          {dialogMode === 'edit' && '✏️ Edit Volunteer Form'}
          {dialogMode === 'view' && '👁️ View Volunteer Form'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Country *</InputLabel>
              <Select
                value={formData.country_id}
                onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                disabled={dialogMode === 'view' || dialogMode === 'edit'}
              >
                {dialogMode === 'create' 
                  ? availableCountries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.name}
                      </MenuItem>
                    ))
                  : countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.name}
                      </MenuItem>
                    ))
                }
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Form Title *"
              value={formData.form_title}
              onChange={(e) => setFormData({ ...formData, form_title: e.target.value })}
              sx={{ mb: 2 }}
              disabled={dialogMode === 'view'}
            />

            <TextField
              fullWidth
              label="Form URL *"
              value={formData.form_url}
              onChange={(e) => setFormData({ ...formData, form_url: e.target.value })}
              sx={{ mb: 2 }}
              disabled={dialogMode === 'view'}
              placeholder="https://docs.google.com/forms/d/e/..."
              helperText="Enter the complete Google Form URL or any HTTPS form URL"
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
              disabled={dialogMode === 'view'}
              multiline
              rows={3}
              placeholder="Brief description of the volunteer opportunity..."
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  disabled={dialogMode === 'view'}
                />
              }
              label="Active"
            />

            {dialogMode === 'view' && selectedForm && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Additional Information:
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(selectedForm.created_at).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {new Date(selectedForm.updated_at).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Form ID:</strong> {selectedForm.id}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'create' ? 'Create' : 'Update'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>🗑️ Delete Volunteer Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this volunteer form? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManageVolunteerForms;
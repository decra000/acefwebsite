import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  List, ListItem, ListItemText, IconButton, Divider,
  Select, MenuItem, FormControl, InputLabel, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Avatar, FormControlLabel, Switch, Autocomplete,
  InputAdornment, Paper, Stack, Fade, Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import StoreIcon from '@mui/icons-material/Store';
import { useAuth } from '../../context/AuthContext';

import { API_URL, STATIC_URL } from '../../config';

const API_BASE = API_URL;

// Country list - you can expand this or fetch from an API
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
  'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Cambodia',
  'Cameroon', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica',
  'Croatia', 'Czech Republic', 'Denmark', 'Ecuador', 'Egypt', 'Estonia',
  'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Guatemala', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania',
  'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand',
  'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore',
  'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka',
  'Sweden', 'Switzerland', 'Tanzania', 'Thailand', 'Turkey', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Venezuela', 'Vietnam', 'Zimbabwe'
];

const TransactionDetails = () => {
  const { user } = useAuth();
  const [transactionMethods, setTransactionMethods] = useState([]);
  const [filteredMethods, setFilteredMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  
  // Form states
  const [formData, setFormData] = useState({
    type: 'bank_transfer',
    name: '',
    logo_file: null,
    is_country_specific: false,
    country: null,
    fields: [{ label: '', value: '' }]
  });

  const transactionTypes = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: AccountBalanceIcon, color: '#1976d2' },
    { value: 'paypal', label: 'PayPal Donate', icon: PaymentIcon, color: '#ed6c02' },
    { value: 'local_merchant', label: 'Local Transfer & Other Merchants', icon: StoreIcon, color: '#2e7d32' }
  ];

  const fetchTransactionMethods = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/transaction-details`);
      const data = await res.json();
      console.log('✅ Raw transaction methods data:', data);

      if (!res.ok) throw new Error(data.message || 'Failed to load transaction methods');
      
      const processedData = Array.isArray(data) ? data : [];
      
      console.log('✅ Processed transaction methods:', processedData);
      setTransactionMethods(processedData);
      setFilteredMethods(processedData);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Failed to fetch transaction methods.');
    } finally {
      setLoading(false);
    }
  };

  // Search and filter functionality
  useEffect(() => {
    let filtered = transactionMethods;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(method => 
        method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (method.country && method.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (method.fields && method.fields.some(field => 
          field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.value.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(method => method.type === filterType);
    }

    // Apply country filter
    if (filterCountry !== 'all') {
      filtered = filtered.filter(method => method.country === filterCountry);
    }

    setFilteredMethods(filtered);
  }, [searchTerm, filterType, filterCountry, transactionMethods]);

  const resetFeedback = () => {
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setFormData({
      type: 'bank_transfer',
      name: '',
      logo_file: null,
      is_country_specific: false,
      country: null,
      fields: [{ label: '', value: '' }]
    });
    setEditingMethod(null);
  };

  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, { label: '', value: '' }]
    }));
  };

  const handleRemoveField = (index) => {
    if (formData.fields.length > 1) {
      setFormData(prev => ({
        ...prev,
        fields: prev.fields.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFieldChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required.');
      return false;
    }

    // Validate country selection for country-specific methods
    if (formData.is_country_specific && !formData.country) {
      setError('Please select a country for country-specific payment methods.');
      return false;
    }

    if (formData.type === 'paypal') {
      // For PayPal, automatically set the two required fields
      const requiredFields = [
        { label: 'Donation Link', value: formData.fields.find(f => f.label === 'Donation Link')?.value || '' },
        { label: 'PayPal Email', value: formData.fields.find(f => f.label === 'PayPal Email')?.value || '' }
      ];
      
      if (!requiredFields[0].value || !requiredFields[1].value) {
        setError('PayPal requires both Donation Link and PayPal Email.');
        return false;
      }
    } else {
      // For bank transfer and local merchants, check if at least one field is complete
      const hasValidField = formData.fields.some(field => 
        field.label.trim() && field.value.trim()
      );
      if (!hasValidField) {
        setError('At least one complete field (label and value) is required.');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    resetFeedback();
    
    if (!validateForm()) return;

    // Prepare fields based on type
    let fieldsToSend;
    if (formData.type === 'paypal') {
      fieldsToSend = [
        { label: 'Donation Link', value: formData.fields.find(f => f.label === 'Donation Link')?.value || '' },
        { label: 'PayPal Email', value: formData.fields.find(f => f.label === 'PayPal Email')?.value || '' }
      ].filter(field => field.value.trim());
    } else {
      fieldsToSend = formData.fields.filter(field => 
        field.label.trim() && field.value.trim()
      );
    }

    try {
      const url = editingMethod 
        ? `${API_BASE}/transaction-details/${editingMethod.id}`
        : `${API_BASE}/transaction-details`;
      
      const method = editingMethod ? 'PUT' : 'POST';

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('is_country_specific', formData.is_country_specific);
      if (formData.is_country_specific && formData.country) {
        formDataToSend.append('country', formData.country);
      }
      formDataToSend.append('fields', JSON.stringify(fieldsToSend));
      
      // DEBUG: Log what we're about to send
      console.log('Form Data Debug:', {
        type: formData.type,
        name: formData.name.trim(),
        is_country_specific: formData.is_country_specific,
        country: formData.country,
        hasLogoFile: !!formData.logo_file,
        logoFileName: formData.logo_file?.name,
        fieldsCount: fieldsToSend.length
      });

      // Only append logo for local merchants
      if (formData.type === 'local_merchant' && formData.logo_file) {
        formDataToSend.append('logo', formData.logo_file);
        console.log('Logo file appended to form data:', formData.logo_file.name);
      }

      const res = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend,
      });

      const result = await res.json();
      console.log('Server response:', result);

      if (!res.ok) throw new Error(result.message || 'Error saving transaction method');

      setSuccess(editingMethod ? 'Transaction method updated.' : 'Transaction method added.');
      setOpenDialog(false);
      resetForm();
      fetchTransactionMethods();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
    }
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    
    let fieldsToEdit;
    if (method.type === 'paypal') {
      // For PayPal, ensure we have the two required fields
      const existingLink = method.fields.find(f => f.label === 'Donation Link')?.value || '';
      const existingEmail = method.fields.find(f => f.label === 'PayPal Email')?.value || '';
      fieldsToEdit = [
        { label: 'Donation Link', value: existingLink },
        { label: 'PayPal Email', value: existingEmail }
      ];
    } else {
      fieldsToEdit = method.fields && method.fields.length > 0 
        ? method.fields 
        : [{ label: '', value: '' }];
    }

    setFormData({
      type: method.type,
      name: method.name,
      logo_file: null, // Don't pre-populate file input
      is_country_specific: !!method.country, // Set to true if country exists
      country: method.country || null,
      fields: fieldsToEdit
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    resetFeedback();
    if (!window.confirm('Are you sure you want to delete this transaction method?')) return;

    try {
      const res = await fetch(`${API_BASE}/transaction-details/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error deleting');

      setSuccess('🗑️ Transaction method deleted.');
      fetchTransactionMethods();
    } catch (err) {
      console.error('❌ Delete error:', err);
      setError(err.message);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCountry('all');
  };

  const getUniqueCountries = () => {
    const countries = transactionMethods
      .filter(method => method.country)
      .map(method => method.country)
      .filter((country, index, arr) => arr.indexOf(country) === index)
      .sort();
    return countries;
  };

  const renderMethodCard = (method) => {
    // Debug logging
    console.log('Rendering method:', {
      id: method.id,
      name: method.name,
      type: method.type,
      country: method.country,
      logo_url: method.logo_url,
      hasLogo: !!method.logo_url
    });

    // Logo URL construction
    let logoUrl = null;
    if (method.logo_url) {
      if (method.logo_url.startsWith('http') || method.logo_url.startsWith('/uploads/')) {
        logoUrl = method.logo_url.startsWith('http') ? method.logo_url : `${STATIC_URL}${method.logo_url}`;
      } 
      else if (method.logo_url.startsWith('/')) {
        logoUrl = `${STATIC_URL}${method.logo_url}`;
      }
      else {
        logoUrl = `${STATIC_URL}/transaction-logos/${method.logo_url}`;
      }
    }

    const typeInfo = transactionTypes.find(t => t.value === method.type);
    const TypeIcon = typeInfo?.icon || PaymentIcon;

    return (
      <Fade in={true} key={method.id}>
        <Card 
          sx={{ 
            mb: 2, 
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4
            },
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                {logoUrl ? (
                  <Avatar 
                    src={logoUrl} 
                    alt={method.name}
                    sx={{ 
                      width: 56, 
                      height: 56,
                      border: '2px solid',
                      borderColor: typeInfo?.color || 'primary.main'
                    }}
                    onError={(e) => {
                      console.error('Failed to load image:', logoUrl);
                      const alternatives = [
                        `${STATIC_URL}/transaction-logos/${method.logo_url.split('/').pop()}`,
                        `${STATIC_URL}${method.logo_url}`,
                        method.logo_url
                      ];
                      
                      let tried = e.target.getAttribute('data-tried') || 0;
                      tried = parseInt(tried) + 1;
                      
                      if (tried < alternatives.length) {
                        e.target.setAttribute('data-tried', tried);
                        e.target.src = alternatives[tried];
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      bgcolor: typeInfo?.color || 'primary.main',
                      border: '2px solid',
                      borderColor: typeInfo?.color || 'primary.main'
                    }}
                  >
                    <TypeIcon />
                  </Avatar>
                )}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {method.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      icon={<TypeIcon />}
                      label={typeInfo?.label || method.type}
                      size="small"
                      sx={{ 
                        bgcolor: typeInfo?.color || 'primary.main',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                    {method.country && (
                      <Chip
                        icon={<PublicIcon />}
                        label={method.country}
                        size="small"
                        variant="outlined"
                        color="secondary"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </Stack>
                </Box>
              </Box>
              <Stack direction="row" spacing={1}>
                <IconButton 
                  onClick={() => handleEdit(method)} 
                  color="primary"
                  sx={{
                    bgcolor: 'primary.50',
                    '&:hover': { bgcolor: 'primary.100' }
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(method.id)} 
                  color="error"
                  sx={{
                    bgcolor: 'error.50',
                    '&:hover': { bgcolor: 'error.100' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Box>

            {method.fields && method.fields.length > 0 && (
              <Paper 
                sx={{ 
                  bgcolor: 'grey.50', 
                  p: 2, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                  Payment Details
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {method.fields.map((field, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{field.label}:</strong> {field.value}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  useEffect(() => {
    fetchTransactionMethods();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            💳 Transaction Methods
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your payment and donation methods
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Add New Method
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
          <Typography color="error.main" sx={{ fontWeight: 500 }}>
            {error}
          </Typography>
        </Paper>
      )}
      {success && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
          <Typography color="success.main" sx={{ fontWeight: 500 }}>
            {success}
          </Typography>
        </Paper>
      )}

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search methods, countries, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter by Type"
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="all">All Types</MenuItem>
                {transactionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Country</InputLabel>
              <Select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                label="Filter by Country"
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="all">All Countries</MenuItem>
                {getUniqueCountries().map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearAllFilters}
              disabled={searchTerm === '' && filterType === 'all' && filterCountry === 'all'}
              sx={{ py: 1.5 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Loading...' : `Showing ${filteredMethods.length} of ${transactionMethods.length} methods`}
        </Typography>
      </Box>

      {/* Content */}
      <Box>
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : filteredMethods.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {transactionMethods.length === 0 
                ? 'No transaction methods configured yet.' 
                : 'No methods match your current filters.'
              }
            </Typography>
            {transactionMethods.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get started by adding your first payment method.
              </Typography>
            ) : (
              <Button onClick={clearAllFilters} sx={{ mt: 2 }}>
                Clear filters to see all methods
              </Button>
            )}
          </Paper>
        ) : (
          filteredMethods.map(renderMethodCard)
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {editingMethod ? 'Edit Transaction Method' : 'Add New Transaction Method'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  label="Transaction Type"
                >
                  {transactionTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <type.icon sx={{ fontSize: 20 }} />
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Method Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                placeholder="e.g., Standard Bank, PayPal, M-Pesa"
              />
            </Grid>

            {/* Country-specific toggle and selection */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_country_specific}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        is_country_specific: e.target.checked,
                        country: e.target.checked ? prev.country : null
                      }))}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Country-specific payment method
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enable if this method is only available in specific countries
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </Grid>

            {formData.is_country_specific && (
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={COUNTRIES}
                  value={formData.country}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, country: newValue }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Country"
                      placeholder="Search for a country..."
                    />
                  )}
                />
              </Grid>
            )}

            {formData.type === 'local_merchant' && (
              <Grid item xs={12}>
                <TextField
                  label="Logo Image"
                  type="file"
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_file: e.target.files[0] }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ accept: 'image/*' }}
                  helperText="Upload a logo image for this service (recommended size: 200x200px)"
                />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {formData.type === 'bank_transfer' && '🏦 Bank Details'}
              {formData.type === 'paypal' && '💰 PayPal Information'}
              {formData.type === 'local_merchant' && '🏪 Service Details'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formData.type === 'paypal' 
                ? 'Provide your PayPal donation link and email address'
                : 'Add the payment details that donors will need to transfer funds'
              }
            </Typography>
          </Box>






          {formData.type === 'paypal' ? (
            // Fixed PayPal fields
            <>
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  label="Donation Link"
                  value={formData.fields.find(f => f.label === 'Donation Link')?.value || ''}
                  onChange={(e) => {
                    const newFields = [...formData.fields];
                    const linkIndex = newFields.findIndex(f => f.label === 'Donation Link');
                    if (linkIndex >= 0) {
                      newFields[linkIndex] = { label: 'Donation Link', value: e.target.value };
                    } else {
                      newFields.push({ label: 'Donation Link', value: e.target.value });
                    }
                    setFormData(prev => ({ ...prev, fields: newFields }));
                  }}
                  sx={{ flex: 1 }}
                  placeholder="https://www.paypal.com/donate/?hosted_button_id=..."
                />
              </Box>
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  label="PayPal Email"
                  value={formData.fields.find(f => f.label === 'PayPal Email')?.value || ''}
                  onChange={(e) => {
                    const newFields = [...formData.fields];
                    const emailIndex = newFields.findIndex(f => f.label === 'PayPal Email');
                    if (emailIndex >= 0) {
                      newFields[emailIndex] = { label: 'PayPal Email', value: e.target.value };
                    } else {
                      newFields.push({ label: 'PayPal Email', value: e.target.value });
                    }
                    setFormData(prev => ({ ...prev, fields: newFields }));
                  }}
                  sx={{ flex: 1 }}
                  placeholder="donations@yourorg.com"
                />
              </Box>
            </>
          ) : (
            // Dynamic fields for other types
            <>
              {formData.fields.map((field, index) => (
                <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
                  <TextField
                    label="Field Label"
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Field Value"
                    value={field.value}
                    onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                    sx={{ flex: 2 }}
                  />
                  <IconButton
                    onClick={() => handleRemoveField(index)}
                    disabled={formData.fields.length === 1}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                </Box>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={handleAddField}
                sx={{ mt: 1 }}
              >
                Add Another Field
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            {editingMethod ? 'Update' : 'Add'} Method
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionDetails;
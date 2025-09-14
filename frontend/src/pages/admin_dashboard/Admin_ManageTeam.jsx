import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Grid, Card, CardContent, IconButton, Link, Chip, 
  Alert, CircularProgress, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Button, TextField, MenuItem, 
  Select, FormControl, InputLabel, Paper, Autocomplete, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, 
  InputAdornment, TablePagination, Stack, Tabs, Tab, Fab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import BusinessIcon from '@mui/icons-material/Business';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { API_URL, STATIC_URL } from "../../config";

// Mock constants - replace with your actual config

const AdminManageTeam = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Team list states
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, member: null });
  const [countries, setCountries] = useState([]);

  // Department states
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentDialog, setDepartmentDialog] = useState({ 
    open: false, 
    mode: 'add', 
    department: null 
  });
  const [departmentDeleteDialog, setDepartmentDeleteDialog] = useState({ 
    open: false, 
    department: null 
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add/Edit member modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [country, setCountry] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Department form states
  const [deptName, setDeptName] = useState('');
  const [deptDescription, setDeptDescription] = useState('');
  const [deptOrderIndex, setDeptOrderIndex] = useState(0);
  const [deptSubmitLoading, setDeptSubmitLoading] = useState(false);
  const [deptSubmitError, setDeptSubmitError] = useState('');

  // Fetch functions
  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/team`, { withCredentials: true });
      const data = res.data;
      
      if (Array.isArray(data)) {
        setMembers(data);
      } else if (Array.isArray(data.members)) {
        setMembers(data.members);
      } else if (Array.isArray(data.data)) {
        setMembers(data.data);
      } else {
        console.warn('Unexpected team response:', data);
        setMembers([]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Failed to load team members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      setDepartmentsLoading(true);
      const res = await axios.get(`${API_URL}/team/departments`, { withCredentials: true });
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
        fetchCountries();

    fetchDepartments();
  }, [fetchTeam, fetchDepartments]);

  // Filter and search logic for team members
  useEffect(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    if (countryFilter) {
      filtered = filtered.filter(member => member.country === countryFilter);
    }

    setFilteredMembers(filtered);
    setPage(0);
  }, [members, searchTerm, departmentFilter, countryFilter]);
    // Show message function
  const showMessage = (type, text, duration = 5000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), duration);
  };
  // Fetch countries
  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/countries`);
      setCountries(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
      showMessage('error', 'Failed to fetch countries. Please try again.');
    }
  };

  // Get unique departments and countries for filter dropdowns
  const memberDepartments = [...new Set(members.map(member => member.department))].filter(Boolean);
  // const countries = [...new Set(members.map(member => member.country))].filter(Boolean);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setCountryFilter('');
  };

  // DEPARTMENT MANAGEMENT FUNCTIONS

  const handleDepartmentAdd = () => {
    setDeptName('');
    setDeptDescription('');
    setDeptOrderIndex(0);
    setDeptSubmitError('');
    setDepartmentDialog({ open: true, mode: 'add', department: null });
  };

  const handleDepartmentEdit = (dept) => {
    setDeptName(dept.name);
    setDeptDescription(dept.description || '');
    setDeptOrderIndex(dept.order_index || 0);
    setDeptSubmitError('');
    setDepartmentDialog({ open: true, mode: 'edit', department: dept });
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    
    if (!deptName.trim()) {
      setDeptSubmitError('Department name is required');
      return;
    }

    setDeptSubmitLoading(true);
    setDeptSubmitError('');

    try {
      const data = {
        name: deptName.trim(),
        description: deptDescription.trim(),
        order_index: parseInt(deptOrderIndex) || 0
      };

      if (departmentDialog.mode === 'edit') {
        await axios.put(`${API_URL}/team/departments/${departmentDialog.department.id}`, data, {
          withCredentials: true
        });
      } else {
        await axios.post(`${API_URL}/team/departments`, data, {
          withCredentials: true
        });
      }

      fetchDepartments();
      setDepartmentDialog({ open: false, mode: 'add', department: null });
    } catch (err) {
      console.error('Error saving department:', err);
      setDeptSubmitError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setDeptSubmitLoading(false);
    }
  };

  const handleDepartmentDelete = (dept) => {
    setDepartmentDeleteDialog({ open: true, department: dept });
  };

  const confirmDepartmentDelete = async () => {
    const { department } = departmentDeleteDialog;
    if (!department) return;

    try {
      await axios.delete(`${API_URL}/team/departments/${department.id}`, {
        withCredentials: true
      });
      fetchDepartments();
      setDepartmentDeleteDialog({ open: false, department: null });
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err.response?.data?.message || 'Failed to delete department');
    }
  };

  // TEAM MEMBER FUNCTIONS

  const handleDeleteClick = (member) => {
    setDeleteDialog({ open: true, member });
  };

  const handleDeleteConfirm = async () => {
    const { member } = deleteDialog;
    if (!member) return;

    try {
      await axios.delete(`${API_URL}/team/${member.id}`, { withCredentials: true });
      fetchTeam();
      setDeleteDialog({ open: false, member: null });
    } catch (err) {
      console.error('Error deleting member:', err);
      setError('Failed to delete team member');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, member: null });
  };

  const resetForm = () => {
    setName('');
    setDepartment('');
    setPosition('');
    setBio('');
    setEmail('');
    setLinkedin('');
    setCountry(null);
    setPhoto(null);
    setCurrentImageUrl('');
    setSubmitError('');
    setSubmitSuccess(false);
    setEditMode(false);
    setEditingMember(null);
  };

  const handleAddModalOpen = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEditClick = (member) => {
    setEditMode(true);
    setEditingMember(member);
    setName(member.name);
    setDepartment(member.department);
    setPosition(member.position);
    setBio(member.bio || '');
    setEmail(member.email || '');
    setLinkedin(member.linkedin_url || '');
    
    const memberCountry = countries.find(c => c.name === member.country);
    setCountry(memberCountry || null);
    
    setCurrentImageUrl(member.image_url);
    setPhoto(null);
    setSubmitError('');
    setSubmitSuccess(false);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !position || !department || !bio) {
      setSubmitError('Name, department, position, and bio are required.');
      return;
    }

    if (!editMode && !photo) {
      setSubmitError('Photo is required when adding a new member.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('department', department);
    formData.append('position', position);
    formData.append('bio', bio);
    formData.append('email', email);
    formData.append('linkedin_url', linkedin);
    
    if (country) {
      formData.append('country', country.name);
    }
    
    if (photo) {
      formData.append('image', photo);
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      let response;
      if (editMode && editingMember) {
        response = await axios.put(`${API_URL}/team/${editingMember.id}`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axios.post(`${API_URL}/team`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSubmitSuccess(true);
      fetchTeam();
      
      setTimeout(() => {
        handleModalClose();
      }, 2000);
    } catch (err) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} team member:`, err);
      setSubmitError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} team member`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Founder': 'error',
      'Director': 'warning',
      'Management': 'info',
      'Country Director': 'success',
      'Operations': 'primary',
      'Technical': 'secondary',
      'Creative': 'default',
      'Other': 'default'
    };
    return colors[department] || 'default';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedMembers = filteredMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Team Management
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={`Team Members (${members.length})`}
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Departments (${departments.length})`}
            icon={<BusinessIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Team Members Tab */}
      {activeTab === 0 && (
        <>
          {/* Add Member Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {filteredMembers.length} members shown
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddModalOpen}
              size="large"
            >
              Add Team Member
            </Button>
          </Box>

          {/* Search and Filter Controls */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon /> Search & Filters
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search members"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, position, email, or bio..."
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
                  <InputLabel>Filter by Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    label="Filter by Department"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {memberDepartments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Country</InputLabel>
                  <Select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    label="Filter by Country"
                  >
                    <MenuItem value="">All Countries</MenuItem>
                    {countries.map(country => (
                      <MenuItem key={country} value={country}>
                        🌍 {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  disabled={!searchTerm && !departmentFilter && !countryFilter}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(searchTerm || departmentFilter || countryFilter) && (
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
                  {departmentFilter && (
                    <Chip
                      label={`Department: ${departmentFilter}`}
                      onDelete={() => setDepartmentFilter('')}
                      size="small"
                      color="secondary"
                    />
                  )}
                  {countryFilter && (
                    <Chip
                      label={`Country: ${countryFilter}`}
                      onDelete={() => setCountryFilter('')}
                      size="small"
                      color="success"
                    />
                  )}
                </Stack>
              </Box>
            )}
          </Paper>

          {/* Team Members Table */}
          {filteredMembers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {members.length === 0 ? 'No team members found' : 'No members match your filters'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {members.length === 0 
                  ? 'Click the "Add Team Member" button to get started'
                  : 'Try adjusting your search or filter criteria'
                }
              </Typography>
              {(searchTerm || departmentFilter || countryFilter) && (
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
                      <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Member</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Position</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Country</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Bio</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMembers.map((member) => (
                      <TableRow 
                        key={member.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: '#f9f9f9' 
                          },
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={`${STATIC_URL}${member.image_url}`}
                              alt={member.name}
                              sx={{ width: 50, height: 50 }}
                            >
                              {member.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {member.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {member.position}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={member.department}
                            color={getDepartmentColor(member.department)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>

                        <TableCell>
                          {member.country ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>🌍</span>
                              <Typography variant="body2">
                                {member.country}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not specified
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Box>
                            {member.email && (
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                {member.email}
                              </Typography>
                            )}
                            {member.linkedin_url && (
                              <Link 
                                href={member.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#0077b5' }}
                              >
                                <LinkedInIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption">LinkedIn</Typography>
                              </Link>
                            )}
                            {!member.email && !member.linkedin_url && (
                              <Typography variant="body2" color="text.secondary">
                                No contact info
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.4,
                              maxWidth: 200
                            }}
                          >
                            {member.bio}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <IconButton 
                              onClick={() => handleEditClick(member)} 
                              color="info"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            
                            <IconButton 
                              onClick={() => handleDeleteClick(member)} 
                              color="error"
                              size="small"
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

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredMembers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: '1px solid #e0e0e0' }}
              />
            </Paper>
          )}
        </>
      )}

      {/* Departments Tab */}
      {activeTab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Manage Departments
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleDepartmentAdd}
              size="large"
            >
              Add Department
            </Button>
          </Box>

          {departmentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : departments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No departments found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Click "Add Department" to create your first department
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {departments.map((dept, index) => (
                <Grid item xs={12} sm={6} md={4} key={dept.id}>
                  <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <DragIndicatorIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {dept.name}
                        </Typography>
                        <Chip 
                          label={`#${dept.order_index || 0}`} 
                          size="small" 
                          color="default" 
                        />
                      </Box>
                      
                      {dept.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {dept.description}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(dept.created_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        startIcon={<EditIcon />}
                        onClick={() => handleDepartmentEdit(dept)}
                        sx={{ flex: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDepartmentDelete(dept)}
                        sx={{ flex: 1 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Add/Edit Member Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6">
            {editMode ? 'Edit Team Member' : 'Add New Team Member'}
          </Typography>
          <IconButton onClick={handleModalClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Team member {editMode ? 'updated' : 'added'} successfully! Closing...
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
                  label="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  fullWidth
                  required
                  disabled={submitLoading || submitSuccess}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Position/Title"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  fullWidth
                  required
                  disabled={submitLoading || submitSuccess}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    label="Department"
                    disabled={submitLoading || submitSuccess}
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  value={country}
                  onChange={(event, newValue) => setCountry(newValue)}
                  disabled={submitLoading || submitSuccess}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country"
                      placeholder="Select country..."
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  disabled={submitLoading || submitSuccess}
                  placeholder="member@acef.org"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Short Bio"
                  multiline
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  fullWidth
                  required
                  disabled={submitLoading || submitSuccess}
                  placeholder="Write a brief description about this team member..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="LinkedIn Profile URL"
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  fullWidth
                  disabled={submitLoading || submitSuccess}
                  placeholder="https://linkedin.com/in/username"
                />
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Profile Photo {!editMode && <span style={{ color: 'red' }}>*</span>}
                  </Typography>
                  
                  {editMode && currentImageUrl && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Current photo:
                      </Typography>
                      <img 
                        src={`${STATIC_URL}${currentImageUrl}`}
                        alt="Current profile"
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #e0e0e0'
                        }}
                      />
                    </Box>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setPhoto(e.target.files[0])}
                    required={!editMode}
                    disabled={submitLoading || submitSuccess}
                    style={{
                      padding: '12px',
                      border: '2px dashed #e0e0e0',
                      borderRadius: '8px',
                      width: '100%',
                      backgroundColor: '#fafafa'
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', gap: 2 }}>
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
            {submitLoading 
              ? (editMode ? 'Updating...' : 'Adding...') 
              : (editMode ? 'Update Member' : 'Add Member')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Department Add/Edit Dialog */}
      <Dialog
        open={departmentDialog.open}
        onClose={() => setDepartmentDialog({ open: false, mode: 'add', department: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {departmentDialog.mode === 'edit' ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
        
        <DialogContent>
          {deptSubmitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {deptSubmitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleDepartmentSubmit} sx={{ pt: 2 }}>
            <TextField
              label="Department Name"
              value={deptName}
              onChange={e => setDeptName(e.target.value)}
              fullWidth
              required
              disabled={deptSubmitLoading}
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Description (Optional)"
              value={deptDescription}
              onChange={e => setDeptDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={deptSubmitLoading}
              sx={{ mb: 3 }}
              placeholder="Brief description of this department..."
            />
            
            <TextField
              label="Order Index"
              type="number"
              value={deptOrderIndex}
              onChange={e => setDeptOrderIndex(e.target.value)}
              fullWidth
              disabled={deptSubmitLoading}
              placeholder="0"
              helperText="Lower numbers appear first in lists"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDepartmentDialog({ open: false, mode: 'add', department: null })}
            disabled={deptSubmitLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDepartmentSubmit}
            variant="contained"
            disabled={deptSubmitLoading}
          >
            {deptSubmitLoading 
              ? (departmentDialog.mode === 'edit' ? 'Updating...' : 'Adding...') 
              : (departmentDialog.mode === 'edit' ? 'Update Department' : 'Add Department')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Member Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Team Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{deleteDialog.member?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Department Confirmation Dialog */}
      <Dialog open={departmentDeleteDialog.open} onClose={() => setDepartmentDeleteDialog({ open: false, department: null })}>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the department{' '}
            <strong>{departmentDeleteDialog.department?.name}</strong>? 
            This action cannot be undone and will fail if there are team members assigned to this department.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepartmentDeleteDialog({ open: false, department: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDepartmentDelete} color="error" variant="contained">
            Delete Department
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManageTeam;
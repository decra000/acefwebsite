import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Select, MenuItem, IconButton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Paper, Grid, Alert, Snackbar, TableContainer, Chip,
  FormControl, InputLabel, FormControlLabel, Checkbox,
  FormGroup, Divider, Card, CardContent
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Add as AddIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

// Mock config for demo
const API_BASE = 'http://localhost:5000';

// Mock useAuth hook for demo
const useAuth = () => ({
  user: { role: 'admin', id: 1, name: 'Admin User', email: 'admin@example.com' }
});

// Define available permissions for Assistant Admin role
const AVAILABLE_PERMISSIONS = [
  { key: 'manage_content', label: 'Manage Content & Blogs', description: 'Create, edit, and delete blog posts and content' },
  { key: 'manage_projects', label: 'Manage Projects', description: 'Create and update project information' },
  { key: 'manage_team', label: 'Manage Team Members', description: 'Add and edit team member profiles' },
  { key: 'manage_partners', label: 'Manage Partners', description: 'Add and edit partner information' },
  { key: 'manage_contacts', label: 'View Contacts', description: 'Access contact form submissions' },
  { key: 'manage_volunteers', label: 'Manage Volunteers', description: 'View and manage volunteer applications' },
  { key: 'manage_newsletter', label: 'Newsletter Management', description: 'Manage newsletter subscribers and campaigns' },
  { key: 'view_donations', label: 'View Donations', description: 'View donation statistics and reports' },
  { key: 'manage_videos', label: 'Manage Videos', description: 'Upload and manage video content' },
  { key: 'manage_impact', label: 'Manage Impact Data', description: 'Update impact statistics and metrics' },
  { key: 'manage_jobs', label: 'Manage Job Postings', description: 'Create and edit job opportunities' }
];

const AdminManageUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Content Manager',
    permissions: []
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/users`, {
        credentials: 'include',
      });

      const data = await res.json();

      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.warn('Unexpected response format:', data);
      }
    } catch (err) {
      console.error('Error fetching users:', err.message);
      showSnackbar('Failed to fetch users', 'error');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
        showSnackbar('Role updated successfully');
        
        // If changing to Assistant Admin, open permissions dialog
        if (newRole === 'Assistant Admin') {
          const currentUser = users.find(u => u.id === id);
          setSelectedUser(currentUser);
          setSelectedPermissions(currentUser.permissions || []);
          setPermissionsOpen(true);
        }
      } else {
        showSnackbar('Failed to update role', 'error');
      }
    } catch (err) {
      console.error('Error updating role:', err.message);
      showSnackbar('Failed to update role', 'error');
    }
  };

  const handlePermissionsUpdate = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${selectedUser.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ permissions: selectedPermissions }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, permissions: selectedPermissions } 
            : u
        ));
        setPermissionsOpen(false);
        showSnackbar('Permissions updated successfully');
      } else {
        showSnackbar('Failed to update permissions', 'error');
      }
    } catch (err) {
      console.error('Error updating permissions:', err.message);
      showSnackbar('Failed to update permissions', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        setConfirmOpen(false);
        setSelectedUser(null);
        showSnackbar('User deleted successfully');
      } else {
        showSnackbar('Failed to delete user', 'error');
      }
    } catch (err) {
      console.error('Error deleting user:', err.message);
      showSnackbar('Failed to delete user', 'error');
    }
  };

  const handleEditStart = (user) => {
    setEditingUser(user.id);
    setEditedData({
      name: user.name,
      email: user.email
    });
  };

  const handleEditSave = async (userId) => {
    if (!editedData.name || !editedData.email) {
      showSnackbar('Name and email cannot be empty.', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editedData),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, ...editedData } : u
        ));
        setEditingUser(null);
        setEditedData({});
        showSnackbar('User updated successfully');
      } else {
        const errorData = await res.json();
        showSnackbar(errorData.message || 'Failed to update user', 'error');
      }
    } catch (err) {
      console.error('Network Error:', err);
      showSnackbar('Network error: Failed to update user', 'error');
    }
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditedData({});
  };

  const handleAddUser = async () => {
  console.log('🚀 Frontend: Starting invitation process...');
  console.log('📋 New user data:', newUser);
  console.log('👤 Current user:', user);

  try {
    // First test the simple endpoint
    console.log('🧪 Testing simple endpoint first...');
    
    const testResponse = await fetch(`${API_BASE}/api/auth/test-invite`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ test: 'data', name: newUser.name, email: newUser.email }),
    });

    console.log('🧪 Test response status:', testResponse.status);
    const testData = await testResponse.json();
    console.log('🧪 Test response data:', testData);

    if (!testResponse.ok) {
      console.error('❌ Test endpoint failed');
      showSnackbar(`Test failed: ${testData.message}`, 'error');
      return;
    }

    console.log('✅ Test endpoint successful, now trying real invitation...');

    // Now try the real invitation
    const inviteResponse = await fetch(`${API_BASE}/api/auth/invite-user`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        invitedBy: user.name,
        permissions: newUser.role === 'Assistant Admin' ? newUser.permissions : []
      }),
    });

    console.log('📡 Invite response status:', inviteResponse.status);
    console.log('📡 Invite response headers:', inviteResponse.headers);

    const inviteData = await inviteResponse.json();
    console.log('📦 Invite response data:', inviteData);

    if (inviteResponse.ok) {
      showSnackbar(inviteData.message || 'User invitation sent successfully!');
      setAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'Content Manager', permissions: [] });
      fetchUsers();
    } else {
      console.error('❌ Invitation failed:', inviteData);
      showSnackbar(inviteData.message || `Failed to send invitation (${inviteResponse.status})`, 'error');
    }

  } catch (err) {
    console.error('❌ Network/Parse error:', err);
    showSnackbar(`Network error: ${err.message}`, 'error');
  }
};

  const handlePermissionToggle = (permissionKey) => {
    if (addUserOpen) {
      // For new user creation
      setNewUser(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionKey)
          ? prev.permissions.filter(p => p !== permissionKey)
          : [...prev.permissions, permissionKey]
      }));
    } else {
      // For editing existing user permissions
      setSelectedPermissions(prev => 
        prev.includes(permissionKey)
          ? prev.filter(p => p !== permissionKey)
          : [...prev, permissionKey]
      );
    }
  };

  const openPermissionsDialog = (user) => {
    setSelectedUser(user);
    setSelectedPermissions(user.permissions || []);
    setPermissionsOpen(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'Assistant Admin': return 'warning';
      case 'Content Manager': return 'primary';
      default: return 'default';
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ mt: 4, px: 2 }}>
        <Alert severity="error">Access Denied - Admin privileges required</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Manage Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddUserOpen(true)}
          sx={{ mb: 2 }}
        >
          Invite New User
        </Button>
      </Box>

      {/* Role Legend */}
      <Card sx={{ mb: 3, background: '#f8f9fa' }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ mr: 1 }} />
            User Roles
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Chip label="Admin" color="error" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary">
                Full system access and user management
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Chip label="Assistant Admin" color="warning" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary">
                Limited admin privileges with custom permissions
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Chip label="Content Manager" color="primary" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary">
                Manage content, blogs, and projects
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Permissions</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  {editingUser === u.id ? (
                    <TextField
                      value={editedData.name || ''}
                      onChange={(e) => setEditedData(prev => ({ ...prev, name: e.target.value }))}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    u.name || '—'
                  )}
                </TableCell>
                <TableCell>
                  {editingUser === u.id ? (
                    <TextField
                      value={editedData.email || ''}
                      onChange={(e) => setEditedData(prev => ({ ...prev, email: e.target.value }))}
                      size="small"
                      fullWidth
                      type="email"
                    />
                  ) : (
                    u.email || '—'
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    size="small"
                    disabled={editingUser === u.id}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="Assistant Admin">Assistant Admin</MenuItem>
                    <MenuItem value="Content Manager">Content Manager</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  {u.role === 'Assistant Admin' ? (
                    <Box>
                      {(u.permissions || []).slice(0, 2).map(permission => {
                        const permObj = AVAILABLE_PERMISSIONS.find(p => p.key === permission);
                        return (
                          <Chip 
                            key={permission} 
                            label={permObj?.label || permission} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                            color="secondary"
                          />
                        );
                      })}
                      {(u.permissions || []).length > 2 && (
                        <Chip 
                          label={`+${(u.permissions || []).length - 2} more`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {(u.permissions || []).length > 0 && (
                        <Button
                          size="small"
                          onClick={() => openPermissionsDialog(u)}
                          sx={{ ml: 1 }}
                        >
                          View All
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Chip 
                      label={u.role === 'admin' ? 'Full Access' : 'Standard Access'} 
                      color={getRoleColor(u.role)}
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={u.isActive ? 'Active' : 'Pending'} 
                    color={u.isActive ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {editingUser === u.id ? (
                      <>
                        <IconButton 
                          onClick={() => handleEditSave(u.id)}
                          color="primary"
                          size="small"
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton 
                          onClick={handleEditCancel}
                          color="secondary"
                          size="small"
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton 
                          onClick={() => handleEditStart(u)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        {u.role === 'Assistant Admin' && (
                          <IconButton 
                            onClick={() => openPermissionsDialog(u)}
                            color="info"
                            size="small"
                            title="Manage Permissions"
                          >
                            <SecurityIcon />
                          </IconButton>
                        )}
                        {!u.isActive && (
                          <IconButton 
                            onClick={() => handleResendInvitation(u)}
                            color="warning"
                            size="small"
                            title="Resend Invitation"
                          >
                            <EmailIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          onClick={() => {
                            setSelectedUser(u);
                            setConfirmOpen(true);
                          }}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {users.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No users found
          </Typography>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user "{selectedUser?.name || selectedUser?.email}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onClose={() => setAddUserOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonAddIcon sx={{ mr: 1 }} />
            Invite New User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  label="Role"
                  onChange={(e) => setNewUser(prev => ({ 
                    ...prev, 
                    role: e.target.value,
                    permissions: e.target.value === 'Assistant Admin' ? prev.permissions : []
                  }))}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="Assistant Admin">Assistant Admin</MenuItem>
                  <MenuItem value="Content Manager">Content Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Temporary Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                fullWidth
                required
                helperText="User will set their own password via email activation"
              />
            </Grid>

            {/* Permissions for Assistant Admin */}
            {newUser.role === 'Assistant Admin' && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  Assistant Admin Permissions
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <Grid item xs={12} md={6} key={permission.key}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={newUser.permissions.includes(permission.key)}
                              onChange={() => handlePermissionToggle(permission.key)}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {permission.label}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {permission.description}
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddUser}
            disabled={!newUser.name || !newUser.email || !newUser.password}
            startIcon={<EmailIcon />}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog open={permissionsOpen} onClose={() => setPermissionsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ mr: 1 }} />
            Manage Permissions - {selectedUser?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Assistant Admins have limited administrative access. Select specific permissions below.
          </Alert>
          <FormGroup>
            <Grid container spacing={2}>
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <Grid item xs={12} md={6} key={permission.key}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(permission.key)}
                        onChange={() => handlePermissionToggle(permission.key)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {permission.label}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {permission.description}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handlePermissionsUpdate}
            color="primary"
          >
            Update Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );

  // Helper function to resend invitation
  async function handleResendInvitation(user) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        showSnackbar('Invitation resent successfully!');
      } else {
        showSnackbar('Failed to resend invitation', 'error');
      }
    } catch (err) {
      console.error('Error resending invitation:', err);
      showSnackbar('Failed to resend invitation', 'error');
    }
  }
};

export default AdminManageUsers;
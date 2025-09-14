import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button,
  List, ListItem, ListItemText, IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../../context/AuthContext';

import { API_URL } from '../../config';

const API_BASE = API_URL;
const AdminAddCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      console.log('✅ Categories fetched:', data);

      if (!res.ok) throw new Error(data.message || 'Failed to load categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Failed to fetch categories.');
    }
  };

  const resetFeedback = () => {
    setError('');
    setSuccess('');
  };

  const handleAdd = async () => {
    resetFeedback();
    const trimmed = newCategory.trim();
    if (!trimmed) return setError('Focus Area name required.');

    const alreadyExists = categories.find(cat => cat.name.toLowerCase() === trimmed.toLowerCase());
    if (alreadyExists) return setError('Focus Area already exists.');

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: trimmed }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error adding Focus Area');

      setSuccess('✅ Focus Area added successfully.');
      setNewCategory('');
      fetchCategories(); // refetch actual DB data
    } catch (err) {
      console.error('❌ Add error:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    resetFeedback();
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error deleting');

      setSuccess('🗑️ Focus Area deleted.');
      fetchCategories();
    } catch (err) {
      console.error('❌ Delete error:', err);
      setError(err.message);
    }
  };

  const handleSaveEdit = async (id) => {
    resetFeedback();
    const trimmed = editValue.trim();
    if (!trimmed) return setError('Updated name cannot be empty.');

    const alreadyExists = categories.find(
      cat => cat.name.toLowerCase() === trimmed.toLowerCase() && cat.id !== id
    );
    if (alreadyExists) return setError('Another Focus Area with this name already exists.');

    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: trimmed }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error updating');

      setSuccess('✏️ Focus Area updated.');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error('❌ Update error:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (!user || user.role !== 'admin') {
    return <Typography variant="h6" color="error">Access Denied</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>🗂️ Manage Focus Areas</Typography>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {success && <Typography color="success.main" sx={{ mb: 2 }}>{success}</Typography>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="New Focus Area"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleAdd}>Add</Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List>
        {categories.map((cat) => (
          <ListItem key={cat.id} sx={{ gap: 1 }}>
            {editingId === cat.id ? (
              <>
                <TextField
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  fullWidth
                />
                <IconButton onClick={() => handleSaveEdit(cat.id)}><SaveIcon /></IconButton>
                <IconButton onClick={() => setEditingId(null)}><CancelIcon /></IconButton>
              </>
            ) : (
              <>
                <ListItemText primary={cat.name} />
                <IconButton onClick={() => { setEditingId(cat.id); setEditValue(cat.name); }}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDelete(cat.id)}><DeleteIcon /></IconButton>
              </>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AdminAddCategories;

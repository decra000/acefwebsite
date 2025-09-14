import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import rawCountryOptions from '../../data/countries.json';

import { API_URL } from '../../config';

const API_BASE = API_URL;

// 🧠 Ensure options have 'label' for Autocomplete
const countryOptions = rawCountryOptions.map((name) => ({ label: name }));

const AdminAddCountries = () => {
  const { user } = useAuth();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // 🔁 Fetch countries from backend
  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/countries`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error('Invalid response format');

      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setCountries(sorted);
      setStatus('📦 Countries fetched from database successfully.');
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('❌ Failed to load countries.');
    } finally {
      setLoading(false);
    }
  };

  // ➕ Add new country
  const handleAdd = async () => {
    setError('');
    setStatus('');

    const name = selectedCountry?.label?.trim();
    if (!name) {
      return setError('⚠️ Please select a country to add.');
    }

    const alreadyExists = countries.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (alreadyExists) {
      return setError('🚫 This country is already in the database.');
    }

    try {
      const res = await fetch(`${API_BASE}/countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error(await res.text());

      setSelectedCountry(null);
      setStatus(`✅ ${name} added to database successfully.`);
      fetchCountries();
    } catch (err) {
      console.error('❌ Add country error:', err);
      setError(`❌ ${err.message}`);
    }
  };

  // 🗑 Confirm delete
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_BASE}/countries/${confirmDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());

      setConfirmDelete(null);
      fetchCountries();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  if (!user || user.role !== 'admin') {
    return <Typography variant="h6" color="error">Access Denied</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>🌍 Manage Countries</Typography>

      {status && <Alert severity="success" sx={{ mb: 2 }}>{status}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Autocomplete
          options={countryOptions}
          value={selectedCountry}
          onChange={(e, newValue) => setSelectedCountry(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select Country" fullWidth />
          )}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleAdd}>Add</Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {countries.map((country) => (
            <ListItem
              key={country.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => setConfirmDelete(country.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={country.name} />
            </ListItem>
          ))}
        </List>
      )}

      {/* 🧾 Delete confirmation dialog */}
      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete this country?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAddCountries;

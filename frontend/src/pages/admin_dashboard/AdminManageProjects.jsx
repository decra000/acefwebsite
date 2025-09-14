import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Card, CardContent, CardActions, CardMedia, Grid, Chip, IconButton,
  Alert, Snackbar, CircularProgress, Tabs, Tab, Divider, Avatar,
  List, ListItem, ListItemText, ListItemSecondaryAction, ListItemAvatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Tooltip, Badge, OutlinedInput, Checkbox, ListItemIcon
} from '@mui/material';
import {
  Add, Edit, Delete, Star, StarBorder, Image, Collections,
  LocationOn, DateRange, Category, Public, Assessment, Visibility, VisibilityOff,
  TrendingUp, Remove, ViewList, ViewModule, AccountTree
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { API_URL, STATIC_URL } from '../../config';
const API_BASE = API_URL;

const AdminManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [countries, setCountries] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [filters, setFilters] = useState({
    status: '',
    categoryId: '',
    pillarId: '',
    featured: '',
    hidden: ''
  });

  const [galleryManagement, setGalleryManagement] = useState({
    adding: false,
    removing: null,
    clearing: false
  });

  // Form state - Updated to include pillarId and selectedFocusAreas
  const [formData, setFormData] = useState({
    title: '',
    pillarId: '',
    selectedFocusAreas: [], // Multiple focus areas from selected pillar
    categoryId: '', // Keep for backward compatibility if needed
    countryId: '',
    description: '',
    short_description: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    sdg_goals: [],
    testimonials: [],
    project_impacts: [],
    order_index: 0,
    is_featured: false,
    is_hidden: false
  });
  const [files, setFiles] = useState({
    featured_image: null,
    gallery: []
  });

  // Available focus areas based on selected pillar
  const [availableFocusAreas, setAvailableFocusAreas] = useState([]);

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: 'default' },
    { value: 'ongoing', label: 'Ongoing', color: 'primary' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'on_hold', label: 'On Hold', color: 'warning' }
  ];

  const sdgOptions = [
    { value: 1, label: 'No Poverty' },
    { value: 2, label: 'Zero Hunger' },
    { value: 3, label: 'Good Health and Well-being' },
    { value: 4, label: 'Quality Education' },
    { value: 5, label: 'Gender Equality' },
    { value: 6, label: 'Clean Water and Sanitation' },
    { value: 7, label: 'Affordable and Clean Energy' },
    { value: 8, label: 'Decent Work and Economic Growth' },
    { value: 9, label: 'Industry, Innovation and Infrastructure' },
    { value: 10, label: 'Reduced Inequalities' },
    { value: 11, label: 'Sustainable Cities and Communities' },
    { value: 12, label: 'Responsible Consumption and Production' },
    { value: 13, label: 'Climate Action' },
    { value: 14, label: 'Life Below Water' },
    { value: 15, label: 'Life on Land' },
    { value: 16, label: 'Peace, Justice and Strong Institutions' },
    { value: 17, label: 'Partnerships for the Goals' }
  ];

  // Fetch data on mount and when filters change
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchPillars(),
        fetchCountries(),
        fetchImpacts()
      ]);
      await fetchProjects();
      setLoading(false);
    };
    
    initializeData();
  }, []);

  // Separate effect for filter changes
  useEffect(() => {
    if (!loading) {
      fetchProjects();
    }
  }, [filters]);

  // Effect to update available focus areas when pillar changes
  useEffect(() => {
  if (formData.pillarId) {
    const selectedPillar = pillars.find(p => p.id === parseInt(formData.pillarId));
    if (selectedPillar && selectedPillar.focus_areas) {
      setAvailableFocusAreas(selectedPillar.focus_areas);
      
      // Only clear selected focus areas if we're creating a new project (not editing)
      if (!editingProject) {
        setFormData(prev => ({ ...prev, selectedFocusAreas: [] }));
      }
    } else {
      setAvailableFocusAreas([]);
      if (!editingProject) {
        setFormData(prev => ({ ...prev, selectedFocusAreas: [] }));
      }
    }
  } else {
    setAvailableFocusAreas([]);
    if (!editingProject) {
      setFormData(prev => ({ ...prev, selectedFocusAreas: [] }));
    }
  }
}, [formData.pillarId, pillars, editingProject]); // Include editingProject in dependencies







  const fetchProjects = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') queryParams.append(key, value);
      });

      const url = `${API_BASE}/projects${queryParams.toString() ? `?${queryParams}` : ''}`;
      console.log('Fetching projects from:', url);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Projects response:', data);
      
      if (data.success) {
        setProjects(Array.isArray(data.data) ? data.data : []);
      } else if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.error('Unexpected response format:', data);
        setProjects([]);
        showSnackbar('Unexpected response format from server', 'warning');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      showSnackbar(`Error fetching projects: ${error.message}`, 'error');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Categories response:', data);
      
      if (data.success) {
        setCategories(Array.isArray(data.data) ? data.data : []);
      } else if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchPillars = async () => {
    try {
      const response = await fetch(`${API_BASE}/pillars`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Pillars response:', data);
      
      if (data.success) {
        setPillars(Array.isArray(data.data) ? data.data : []);
      } else if (Array.isArray(data)) {
        setPillars(data);
      } else {
        setPillars([]);
      }
    } catch (error) {
      console.error('Error fetching pillars:', error);
      setPillars([]);
    }
  };

const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_BASE}/countries`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Countries response:', data);
      
      // Handle response format similar to AdminAddCountries component
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from countries API');
      }

      // Sort countries alphabetically by name
      const sortedCountries = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setCountries(sortedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
      showSnackbar(`Error fetching countries: ${error.message}`, 'warning');
    }
  };

  const fetchImpacts = async () => {
    try {
      const response = await fetch(`${API_BASE}/impacts?is_active=true`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Impacts response:', data);
      
      if (data.success) {
        setImpacts(Array.isArray(data.data) ? data.data : []);
      } else if (Array.isArray(data)) {
        setImpacts(data);
      } else {
        setImpacts([]);
      }
    } catch (error) {
      console.error('Error fetching impacts:', error);
      setImpacts([]);
    }
  };

  const fetchProjectImpacts = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}/impacts`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Project impacts response:', data);
      
      if (data.success) {
        return Array.isArray(data.data) ? data.data : [];
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching project impacts:', error);
      return [];
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      pillarId: '',
      selectedFocusAreas: [],
      categoryId: '',
      countryId: '',
      description: '',
      short_description: '',
      location: '',
      start_date: '',
      end_date: '',
      status: 'planning',
      sdg_goals: [],
      testimonials: [],
      project_impacts: [],
      order_index: 0,
      is_featured: false,
      is_hidden: false
    });
    setFiles({ featured_image: null, gallery: [] });
    setAvailableFocusAreas([]);
  };

// Replace the existing handleOpenDialog function with this corrected version:

const handleOpenDialog = async (project = null) => {
  if (project) {
    setEditingProject(project);
    
    // Handle testimonials
    let testimonials = [];
    if (project.testimonials && Array.isArray(project.testimonials)) {
      testimonials = project.testimonials;
    } else if (project.testimonial_text || project.testimonial_author || project.testimonial_position) {
      testimonials = [{
        text: project.testimonial_text || '',
        author: project.testimonial_author || '',
        position: project.testimonial_position || ''
      }];
    }

    // Fetch project impacts for editing
    const projectImpacts = await fetchProjectImpacts(project.id);

    // Handle pillar and focus areas - FIXED LOGIC
    const pillarId = project.pillarId || '';
    const categoryId = project.categoryId || project.category_id || '';
    
    // Set available focus areas if pillar exists
    if (pillarId) {
      const selectedPillar = pillars.find(p => p.id === parseInt(pillarId));
      if (selectedPillar && selectedPillar.focus_areas) {
        setAvailableFocusAreas(selectedPillar.focus_areas);
      }
    }
    
    // Set selected focus areas based on the categoryId (since focus areas ARE categories)
    let selectedFocusAreas = [];
    if (categoryId) {
      selectedFocusAreas = [parseInt(categoryId)];
    }

    setFormData({
      title: project.title || '',
      pillarId: pillarId,
      selectedFocusAreas: selectedFocusAreas, // This should now work correctly
      categoryId: categoryId, // Keep for backward compatibility
      countryId: project.countryId || project.country_id || '',
      description: project.description || '',
      short_description: project.short_description || '',
      location: project.location || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      status: project.status || 'planning',
      sdg_goals: Array.isArray(project.sdg_goals) ? project.sdg_goals : 
                 (typeof project.sdg_goals === 'string' ? JSON.parse(project.sdg_goals || '[]') : []),
      testimonials: testimonials,
      project_impacts: projectImpacts,
      order_index: project.order_index || 0,
      is_featured: Boolean(project.is_featured),
      is_hidden: Boolean(project.is_hidden)
    });
  } else {
    setEditingProject(null);
    resetForm();
  }
  setDialogOpen(true);
};




  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    resetForm();
    setTabValue(0);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, files) => {
    setFiles(prev => ({ ...prev, [field]: files }));
  };

  const handleSDGChange = (sdgGoal) => {
    setFormData(prev => ({
      ...prev,
      sdg_goals: prev.sdg_goals.includes(sdgGoal)
        ? prev.sdg_goals.filter(goal => goal !== sdgGoal)
        : [...prev.sdg_goals, sdgGoal]
    }));
  };

  // Handle focus area selection change
  const handleFocusAreaChange = (event) => {
    const value = event.target.value;
    const cleanedValue = Array.isArray(value) 
      ? value.filter(id => id !== null && id !== undefined && id !== '')
      : [];
    
    setFormData(prev => ({
      ...prev,
      selectedFocusAreas: cleanedValue,
      // For backward compatibility, set the first selected focus area as categoryId
      categoryId: cleanedValue.length > 0 ? cleanedValue[0] : ''
    }));
  };

  // Project impacts management functions
  const addProjectImpact = () => {
    setFormData(prev => ({
      ...prev,
      project_impacts: [...prev.project_impacts, { 
        impact_id: '', 
        contribution_value: 0,
        impact_name: '',
        unit: ''
      }]
    }));
  };

  const updateProjectImpact = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      project_impacts: prev.project_impacts.map((impact, i) => {
        if (i === index) {
          if (field === 'impact_id') {
            const selectedImpact = impacts.find(imp => imp.id === parseInt(value));
            return { 
              ...impact, 
              impact_id: value,
              impact_name: selectedImpact?.name || '',
              unit: selectedImpact?.unit || ''
            };
          }
          return { ...impact, [field]: value };
        }
        return impact;
      })
    }));
  };

  const removeProjectImpact = (index) => {
    setFormData(prev => ({
      ...prev,
      project_impacts: prev.project_impacts.filter((_, i) => i !== index)
    }));
  };

  // Testimonial management functions
  const addTestimonial = () => {
    setFormData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { text: '', author: '', position: '' }]
    }));
  };

  const updateTestimonial = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map((testimonial, i) => 
        i === index ? { ...testimonial, [field]: value } : testimonial
      )
    }));
  };

  const removeTestimonial = (index) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        showSnackbar('Project title is required', 'error');
        return;
      }
      if (!formData.description.trim()) {
        showSnackbar('Project description is required', 'error');
        return;
      }
      if (!formData.pillarId) {
        showSnackbar('Please select a pillar for this project', 'error');
        setTabValue(0); // Switch to Basic Info tab
        return;
      }
      if (formData.selectedFocusAreas.length === 0) {
        showSnackbar('Please select at least one focus area', 'error');
        setTabValue(0); // Switch to Basic Info tab
        return;
      }

      // Validate project impacts for duplicates
      if (formData.project_impacts && formData.project_impacts.length > 0) {
        const impactIds = formData.project_impacts
          .filter(impact => impact.impact_id)
          .map(impact => parseInt(impact.impact_id));
        
        const duplicates = impactIds.filter((id, index) => impactIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
          showSnackbar('Duplicate impacts detected. Each impact can only be added once per project.', 'error');
          setTabValue(4); // Switch to Project Impacts tab
          return;
        }

        const invalidImpacts = formData.project_impacts.filter(impact => 
          !impact.impact_id || !impact.contribution_value || impact.contribution_value <= 0
        );
        
        if (invalidImpacts.length > 0) {
          showSnackbar('All project impacts must have both an impact type selected and a positive contribution value.', 'error');
          setTabValue(4); // Switch to Project Impacts tab
          return;
        }
      }

      // Clean project impacts data before submission
      const cleanedProjectImpacts = formData.project_impacts
        .filter(impact => impact.impact_id && impact.contribution_value > 0)
        .map(impact => ({
          impact_id: parseInt(impact.impact_id),
          contribution_value: parseInt(impact.contribution_value)
        }));

      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'project_impacts') {
          submitData.append(key, JSON.stringify(cleanedProjectImpacts));
        } else if (key === 'selectedFocusAreas') {
          // Convert selected focus areas to categoryIds for backend compatibility
          if (value.length > 0) {
            // For now, send the first selected focus area as categoryId
            // You might want to update your backend to handle multiple focus areas
            submitData.append('categoryId', value[0]);
            submitData.append('focus_area_ids', JSON.stringify(value));
          }
        } else if (key === 'sdg_goals' || key === 'testimonials') {
          submitData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined && key !== 'categoryId') {
          // Skip categoryId since we handle it above
          submitData.append(key, value);
        }
      });

      // Add files
      if (files.featured_image) {
        submitData.append('featured_image', files.featured_image);
      }
      if (files.gallery && files.gallery.length > 0) {
        Array.from(files.gallery).forEach(file => {
          submitData.append('gallery', file);
        });
      }

      const url = editingProject 
        ? `${API_BASE}/projects/${editingProject.id}`
        : `${API_BASE}/projects`;
      
      const method = editingProject ? 'PUT' : 'POST';

      console.log(`${method} request to:`, url);

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: submitData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Submit response:', data);

      if (data.success) {
        showSnackbar(
          `Project ${editingProject ? 'updated' : 'created'} successfully`, 
          'success'
        );
        handleCloseDialog();
        await fetchProjects();
      } else {
        showSnackbar(data.message || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      showSnackbar(`Error submitting project: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar('Project deleted successfully', 'success');
        await fetchProjects();
      } else {
        showSnackbar(data.message || 'Delete failed', 'error');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      showSnackbar(`Error deleting project: ${error.message}`, 'error');
    }
  };

  // Gallery management functions
  const handleAddGalleryImage = async (projectId, file) => {
    try {
      setGalleryManagement(prev => ({ ...prev, adding: true }));
      
      const formData = new FormData();
      formData.append('gallery', file);

      const response = await fetch(`${API_BASE}/projects/${projectId}/gallery/add`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar('Gallery image added successfully', 'success');
        await fetchProjects();
        
        // Update the editing project if in edit mode
        if (editingProject && editingProject.id === projectId) {
          setEditingProject(data.data);
        }
      } else {
        showSnackbar(data.message || 'Failed to add image', 'error');
      }
    } catch (error) {
      console.error('Error adding gallery image:', error);
      showSnackbar(`Error adding image: ${error.message}`, 'error');
    } finally {
      setGalleryManagement(prev => ({ ...prev, adding: false }));
    }
  };

  const handleRemoveGalleryImage = async (projectId, imageIndex) => {
    try {
      setGalleryManagement(prev => ({ ...prev, removing: imageIndex }));
      
      const response = await fetch(`${API_BASE}/projects/${projectId}/gallery/${imageIndex}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar('Gallery image removed successfully', 'success');
        await fetchProjects();
        
        // Update the editing project if in edit mode
        if (editingProject && editingProject.id === projectId) {
          setEditingProject(data.data);
        }
      } else {
        showSnackbar(data.message || 'Failed to remove image', 'error');
      }
    } catch (error) {
      console.error('Error removing gallery image:', error);
      showSnackbar(`Error removing image: ${error.message}`, 'error');
    } finally {
      setGalleryManagement(prev => ({ ...prev, removing: null }));
    }
  };

  const handleClearGallery = async (projectId) => {
    if (!window.confirm('Are you sure you want to remove all gallery images? This action cannot be undone.')) {
      return;
    }

    try {
      setGalleryManagement(prev => ({ ...prev, clearing: true }));
      
      const response = await fetch(`${API_BASE}/projects/${projectId}/gallery`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar('Gallery cleared successfully', 'success');
        await fetchProjects();
        
        // Update the editing project if in edit mode
        if (editingProject && editingProject.id === projectId) {
          setEditingProject(data.data);
        }
      } else {
        showSnackbar(data.message || 'Failed to clear gallery', 'error');
      }
    } catch (error) {
      console.error('Error clearing gallery:', error);
      showSnackbar(`Error clearing gallery: ${error.message}`, 'error');
    } finally {
      setGalleryManagement(prev => ({ ...prev, clearing: false }));
    }
  };

  // Updated toggle functions using the main project endpoint
  const handleToggleFeatured = async (projectId) => {
    try {
      console.log('Toggling featured status for project:', projectId);
      
      // Find the project to get current data
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        showSnackbar('Project not found', 'error');
        return;
      }

      // Create form data with updated featured status
      const submitData = new FormData();
      
      // Add all current project data
      submitData.append('title', project.title || '');
      submitData.append('description', project.description || '');
      submitData.append('short_description', project.short_description || '');
      submitData.append('location', project.location || '');
      submitData.append('status', project.status || 'planning');
      submitData.append('pillarId', project.pillarId || '');
      submitData.append('categoryId', project.categoryId || project.category_id || '');
      submitData.append('countryId', project.countryId || project.country_id || '');
      submitData.append('start_date', project.start_date || '');
      submitData.append('end_date', project.end_date || '');
      submitData.append('order_index', project.order_index || 0);
      submitData.append('is_hidden', project.is_hidden || false);
      
      // Toggle the featured status
      submitData.append('is_featured', !project.is_featured);
      
      // Add existing arrays as JSON
      submitData.append('sdg_goals', JSON.stringify(project.sdg_goals || []));
      submitData.append('testimonials', JSON.stringify(project.testimonials || []));
      
      // Get project impacts
      const projectImpacts = await fetchProjectImpacts(projectId);
      const cleanedProjectImpacts = projectImpacts
        .filter(impact => impact.impact_id && impact.contribution_value > 0)
        .map(impact => ({
          impact_id: parseInt(impact.impact_id),
          contribution_value: parseInt(impact.contribution_value)
        }));
      submitData.append('project_impacts', JSON.stringify(cleanedProjectImpacts));

      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PUT',
        credentials: 'include',
        body: submitData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar(
          `Project ${!project.is_featured ? 'featured' : 'unfeatured'} successfully`, 
          'success'
        );
        await fetchProjects();
      } else {
        showSnackbar(data.message || 'Featured toggle failed', 'error');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      showSnackbar(`Error toggling featured status: ${error.message}`, 'error');
    }
  };

  const handleToggleHidden = async (projectId) => {
    try {
      console.log('Toggling hidden status for project:', projectId);
      
      // Find the project to get current data
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        showSnackbar('Project not found', 'error');
        return;
      }

      // Create form data with updated hidden status
      const submitData = new FormData();
      
      // Add all current project data
      submitData.append('title', project.title || '');
      submitData.append('description', project.description || '');
      submitData.append('short_description', project.short_description || '');
      submitData.append('location', project.location || '');
      submitData.append('status', project.status || 'planning');
      submitData.append('pillarId', project.pillarId || '');
      submitData.append('categoryId', project.categoryId || project.category_id || '');
      submitData.append('countryId', project.countryId || project.country_id || '');
      submitData.append('start_date', project.start_date || '');
      submitData.append('end_date', project.end_date || '');
      submitData.append('order_index', project.order_index || 0);
      submitData.append('is_featured', project.is_featured || false);
      
      // Toggle the hidden status
      submitData.append('is_hidden', !project.is_hidden);
      
      // Add existing arrays as JSON
      submitData.append('sdg_goals', JSON.stringify(project.sdg_goals || []));
      submitData.append('testimonials', JSON.stringify(project.testimonials || []));
      
      // Get project impacts
      const projectImpacts = await fetchProjectImpacts(projectId);
      const cleanedProjectImpacts = projectImpacts
        .filter(impact => impact.impact_id && impact.contribution_value > 0)
        .map(impact => ({
          impact_id: parseInt(impact.impact_id),
          contribution_value: parseInt(impact.contribution_value)
        }));
      submitData.append('project_impacts', JSON.stringify(cleanedProjectImpacts));

      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PUT',
        credentials: 'include',
        body: submitData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar(
          `Project ${!project.is_hidden ? 'hidden' : 'shown'} successfully`, 
          'success'
        );
        await fetchProjects();
      } else {
        showSnackbar(data.message || 'Visibility toggle failed', 'error');
      }
    } catch (error) {
      console.error('Error toggling hidden status:', error);
      showSnackbar(`Error toggling visibility: ${error.message}`, 'error');
    }
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'default';
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const getPillarName = (pillarId) => {
    const pillar = pillars.find(p => p.id === parseInt(pillarId));
    return pillar ? pillar.name : 'Unknown Pillar';
  };

  const getFocusAreaNames = (selectedFocusAreas) => {
    if (!Array.isArray(selectedFocusAreas) || selectedFocusAreas.length === 0) {
      return 'No focus areas';
    }
    
    const names = selectedFocusAreas
      .map(id => {
        // Look through all pillars to find the focus area
        for (const pillar of pillars) {
          if (pillar.focus_areas) {
            const focusArea = pillar.focus_areas.find(fa => fa.id === parseInt(id));
            if (focusArea) return focusArea.name;
          }
        }
        return `ID: ${id}`;
      })
      .filter(name => name);
    
    return names.join(', ');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Manage Projects
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            size="small"
            startIcon={<ViewList />}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            size="small"
            startIcon={<ViewModule />}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Project
          </Button>
        </Box>
      </Box>

      {/* Debug Info */}
      {process.env.NODE_ENV !== 'production' && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Debug: API_BASE = {API_BASE}, Projects Count = {projects.length}, Pillars Count = {pillars.length}, Impacts Count = {impacts.length}, Loading = {loading.toString()}
          </Typography>
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Pillar</InputLabel>
              <Select
                value={filters.pillarId}
                onChange={(e) => handleFilterChange('pillarId', e.target.value)}
              >
                <MenuItem value="">All Pillars</MenuItem>
                {pillars.map(pillar => (
                  <MenuItem key={pillar.id} value={pillar.id}>
                    {pillar.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Featured</InputLabel>
              <Select
                value={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
              >
                <MenuItem value="">All Projects</MenuItem>
                <MenuItem value="true">Featured Only</MenuItem>
                <MenuItem value="false">Non-Featured</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Visibility</InputLabel>
              <Select
                value={filters.hidden}
                onChange={(e) => handleFilterChange('hidden', e.target.value)}
              >
                <MenuItem value="">All Projects</MenuItem>
                <MenuItem value="false">Visible Only</MenuItem>
                <MenuItem value="true">Hidden Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setFilters({ status: '', categoryId: '', pillarId: '', featured: '', hidden: '' });
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Projects Display */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : projects.length > 0 ? (
        <>
          {/* List View */}
          {viewMode === 'list' && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Pillar</TableCell>
                    <TableCell>Focus Areas</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Content</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow 
                      key={project.id} 
                      sx={{ 
                        opacity: project.is_hidden ? 0.6 : 1,
                        bgcolor: project.is_hidden ? 'grey.50' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {project.featured_image && (
                            <Avatar
                              variant="rounded"
                              sx={{ width: 60, height: 60 }}
                              src={project.featured_image.startsWith('http') 
                                ? project.featured_image 
                                : `${process.env.REACT_APP_STATIC_URL || ''}${project.featured_image}`}
                            />
                          )}
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {project.title}
                              {project.is_featured && (
                                <Star fontSize="small" color="warning" sx={{ ml: 0.5 }} />
                              )}
                              {project.is_hidden && (
                                <VisibilityOff fontSize="small" color="error" sx={{ ml: 0.5 }} />
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {project.short_description || (project.description && project.description.substring(0, 80) + '...') || 'No description'}
                            </Typography>
                            {project.country_name && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Public fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {project.country_name}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusOptions.find(opt => opt.value === project.status)?.label || project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {project.pillarId ? (
                          <Chip
                            icon={<AccountTree />}
                            label={getPillarName(project.pillarId)}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {(project.category_name || project.categoryName) ? (
                          <Chip
                            icon={<Category />}
                            label={project.category_name || project.categoryName}
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {project.location || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {project.gallery && Array.isArray(project.gallery) && project.gallery.length > 0 && (
                            <Tooltip title={`${project.gallery.length} gallery images`}>
                              <Badge badgeContent={project.gallery.length} color="primary" max={99}>
                                <Collections fontSize="small" color="action" />
                              </Badge>
                            </Tooltip>
                          )}
                          {project.testimonials && Array.isArray(project.testimonials) && project.testimonials.length > 0 && (
                            <Tooltip title={`${project.testimonials.length} testimonials`}>
                              <Badge badgeContent={project.testimonials.length} color="secondary" max={99}>
                                <Avatar sx={{ width: 20, height: 20, fontSize: 12 }}>T</Avatar>
                              </Badge>
                            </Tooltip>
                          )}
                          {project.project_impacts && Array.isArray(project.project_impacts) && project.project_impacts.length > 0 && (
                            <Tooltip title={`${project.project_impacts.length} impact metrics`}>
                              <Badge badgeContent={project.project_impacts.length} color="success" max={99}>
                                <TrendingUp fontSize="small" color="action" />
                              </Badge>
                            </Tooltip>
                          )}
                          {project.sdg_goals && Array.isArray(project.sdg_goals) && project.sdg_goals.length > 0 && (
                            <Tooltip title={`SDG Goals: ${project.sdg_goals.join(', ')}`}>
                              <Badge badgeContent={project.sdg_goals.length} color="info" max={99}>
                                <Assessment fontSize="small" color="action" />
                              </Badge>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title={project.is_featured ? "Remove from featured" : "Make featured"}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleFeatured(project.id)}
                              color={project.is_featured ? 'warning' : 'default'}
                            >
                              {project.is_featured ? <Star /> : <StarBorder />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={project.is_hidden ? "Show project" : "Hide project"}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleHidden(project.id)}
                              color={project.is_hidden ? 'error' : 'default'}
                            >
                              {project.is_hidden ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit project">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(project)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete project">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(project.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid item xs={12} md={6} lg={4} key={project.id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    opacity: project.is_hidden ? 0.6 : 1,
                    border: project.is_hidden ? '2px dashed #ccc' : 'none'
                  }}>
                    {project.featured_image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={project.featured_image.startsWith('http') 
                          ? project.featured_image 
                          : `${process.env.REACT_APP_STATIC_URL || ''}${project.featured_image}`}
                        alt={project.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1, mr: 1 }}>
                          {project.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleFeatured(project.id)}
                          color={project.is_featured ? 'warning' : 'default'}
                        >
                          {project.is_featured ? <Star /> : <StarBorder />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleHidden(project.id)}
                          color={project.is_hidden ? 'error' : 'default'}
                        >
                          {project.is_hidden ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={statusOptions.find(opt => opt.value === project.status)?.label || project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                        {project.is_hidden && (
                          <Chip
                            label="Hidden"
                            color="error"
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )}
                        {project.pillarId && (
                          <Chip
                            icon={<AccountTree />}
                            label={getPillarName(project.pillarId)}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )}
                        {(project.category_name || project.categoryName) && (
                          <Chip
                            icon={<Category />}
                            label={project.category_name || project.categoryName}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )}
                        {(project.country_name || project.countryName) && (
                          <Chip
                            icon={<Public />}
                            label={project.country_name || project.countryName}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.short_description || (project.description && project.description.substring(0, 100) + '...') || 'No description available'}
                      </Typography>

                      {project.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {project.location}
                          </Typography>
                        </Box>
                      )}

                      {project.sdg_goals && Array.isArray(project.sdg_goals) && project.sdg_goals.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            SDG Goals: {project.sdg_goals.join(', ')}
                          </Typography>
                        </Box>
                      )}

                      {project.project_impacts && Array.isArray(project.project_impacts) && project.project_impacts.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                            Impacts: {project.project_impacts.length}
                          </Typography>
                        </Box>
                      )}

                      {project.testimonials && Array.isArray(project.testimonials) && project.testimonials.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Testimonials: {project.testimonials.length}
                          </Typography>
                        </Box>
                      )}

                      {project.gallery && Array.isArray(project.gallery) && project.gallery.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Collections fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            {project.gallery.length} images
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleOpenDialog(project)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(project.id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters or create a new project'
              : 'Start by creating your first project'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Project
          </Button>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle>
          {editingProject ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Basic Info" />
            <Tab label="Details" />
            <Tab label="Media" />
            <Tab label="Testimonials" />
            <Tab label="Project Impacts" />
          </Tabs>

          {/* Basic Info Tab */}
          {tabValue === 0 && (
            <Box>
              <TextField
                label="Project Title"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                sx={{ mb: 2 }}
                error={!formData.title.trim()}
                helperText={!formData.title.trim() ? 'Title is required' : ''}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Programme Pillar</InputLabel>
                    <Select
                      value={formData.pillarId}
                      onChange={(e) => handleInputChange('pillarId', e.target.value)}
                      error={!formData.pillarId}
                    >
                      <MenuItem value="">Select Pillar</MenuItem>
                      {pillars.map(pillar => (
                        <MenuItem key={pillar.id} value={pillar.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccountTree sx={{ mr: 1, fontSize: 18 }} />
                            {pillar.name}
                            {pillar.focus_areas && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                ({pillar.focus_areas.length} focus areas)
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {!formData.pillarId && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                        Please select a pillar first
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={formData.countryId}
                      onChange={(e) => handleInputChange('countryId', e.target.value)}
                    >
                      <MenuItem value="">Select Country</MenuItem>
                      {countries.map(country => (
                        <MenuItem key={country.id} value={country.id}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Focus Areas Selection */}
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Focus Areas</InputLabel>
                  <Select
                    multiple
                    value={formData.selectedFocusAreas}
                    onChange={handleFocusAreaChange}
                    input={<OutlinedInput label="Focus Areas" />}
                    disabled={!formData.pillarId || availableFocusAreas.length === 0}
                    error={formData.pillarId && formData.selectedFocusAreas.length === 0}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const focusArea = availableFocusAreas.find(fa => fa.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={focusArea?.name || `ID: ${value}`} 
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableFocusAreas.map((focusArea) => (
                      <MenuItem key={focusArea.id} value={focusArea.id}>
                        <Checkbox checked={formData.selectedFocusAreas.indexOf(focusArea.id) > -1} />
                        <ListItemText primary={focusArea.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  {!formData.pillarId ? (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                      Select a pillar first to see available focus areas
                    </Typography>
                  ) : availableFocusAreas.length === 0 ? (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, ml: 1 }}>
                      No focus areas available for selected pillar
                    </Typography>
                  ) : formData.selectedFocusAreas.length === 0 ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      Please select at least one focus area
                    </Typography>
                  ) : null}
                </FormControl>
              </Box>

              {/* Show selected pillar info */}
              {formData.pillarId && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="primary.dark" sx={{ mb: 1 }}>
                    <AccountTree fontSize="small" sx={{ mr: 1 }} />
                    Selected Pillar: <strong>{getPillarName(formData.pillarId)}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Available Focus Areas: {availableFocusAreas.length} ({availableFocusAreas.map(fa => fa.name).join(', ')})
                  </Typography>
                </Box>
              )}

              <TextField
                label="Short Description"
                fullWidth
                multiline
                rows={2}
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                sx={{ mb: 2 }}
                helperText="Brief summary for project cards"
              />

              <TextField
                label="Full Description"
                fullWidth
                multiline
                rows={4}
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                sx={{ mb: 2 }}
                error={!formData.description.trim()}
                helperText={!formData.description.trim() ? 'Description is required' : ''}
              />
            </Box>
          )}

          {/* Details Tab */}
          {tabValue === 1 && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      {statusOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Order Index"
                    type="number"
                    fullWidth
                    value={formData.order_index}
                    onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)}
                    helperText="Lower numbers appear first"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_featured}
                        onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      />
                    }
                    label="Featured Project"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_hidden}
                        onChange={(e) => handleInputChange('is_hidden', e.target.checked)}
                      />
                    }
                    label="Hide Project"
                  />
                </Grid>
              </Grid>

              <TextField
                label="Location"
                fullWidth
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                SDG Goals
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {sdgOptions.map(sdg => (
                  <Grid item key={sdg.value}>
                    <Chip
                      label={`${sdg.value}. ${sdg.label}`}
                      clickable
                      color={formData.sdg_goals.includes(sdg.value) ? 'primary' : 'default'}
                      onClick={() => handleSDGChange(sdg.value)}
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Media Tab */}
          {tabValue === 2 && (
            <Box>
              {/* Featured Image Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Featured Image
                </Typography>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('featured_image', e.target.files[0])}
                  style={{ marginBottom: '16px', width: '100%' }}
                />

                {editingProject && editingProject.featured_image && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Current Featured Image:
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={editingProject.featured_image.startsWith('http') 
                          ? editingProject.featured_image 
                          : `${process.env.REACT_APP_STATIC_URL || ''}${editingProject.featured_image}`}
                        alt="Current featured"
                        style={{ 
                          maxWidth: '300px', 
                          maxHeight: '200px', 
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Gallery Section */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">
                    Gallery Images ({editingProject ? (editingProject.gallery?.length || 0) : 0}/10)
                  </Typography>
                  {editingProject && (
                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                        component="label"
                        disabled={galleryManagement.adding || (editingProject.gallery?.length || 0) >= 10}
                        sx={{ mr: 1 }}
                      >
                        Add Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleAddGalleryImage(editingProject.id, e.target.files[0]);
                              e.target.value = ''; // Reset input
                            }
                          }}
                        />
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={galleryManagement.clearing ? <CircularProgress size={16} /> : <Delete />}
                        onClick={() => handleClearGallery(editingProject.id)}
                        disabled={galleryManagement.clearing || !editingProject.gallery?.length}
                      >
                        Clear All
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* Gallery Upload for New Projects */}
                {!editingProject && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Upload multiple images for new project (Max 10):
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange('gallery', e.target.files)}
                      style={{ marginBottom: '16px', width: '100%' }}
                    />
                  </Box>
                )}

                {/* Gallery Display and Management */}
                {editingProject && editingProject.gallery && Array.isArray(editingProject.gallery) && editingProject.gallery.length > 0 ? (
                  <Grid container spacing={2}>
                    {editingProject.gallery.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Card sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="120"
                            image={image.startsWith('http') 
                              ? image 
                              : `${process.env.REACT_APP_STATIC_URL || ''}${image}`}
                            alt={`Gallery ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg'; // Fallback image
                              e.target.style.opacity = '0.5';
                            }}
                          />
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 4, 
                            right: 4,
                            display: 'flex',
                            gap: 0.5
                          }}>
                            <IconButton
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.9)', 
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                boxShadow: 1
                              }}
                              onClick={() => handleRemoveGalleryImage(editingProject.id, index)}
                              disabled={galleryManagement.removing === index}
                            >
                              {galleryManagement.removing === index ? 
                                <CircularProgress size={16} /> : 
                                <Delete fontSize="small" color="error" />
                              }
                            </IconButton>
                          </Box>
                          <Box sx={{ 
                            position: 'absolute', 
                            bottom: 4, 
                            left: 4,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}>
                            {index + 1}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : editingProject ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    border: '2px dashed #ddd'
                  }}>
                    <Collections fontSize="large" color="disabled" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No gallery images yet
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      component="label"
                      disabled={galleryManagement.adding}
                    >
                      Add First Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleAddGalleryImage(editingProject.id, e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                      />
                    </Button>
                  </Box>
                ) : null}

                {/* Gallery Constraints Info */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Gallery Management:
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Maximum 10 images per project</li>
                    <li>Supported formats: JPG, PNG, GIF, WebP</li>
                    <li>Individual images can be added/removed in edit mode</li>
                    <li>Images are automatically optimized for web display</li>
                  </ul>
                </Alert>

                {galleryManagement.adding && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Adding image to gallery...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Testimonials Tab */}
          {tabValue === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">
                  Testimonials ({formData.testimonials.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addTestimonial}
                >
                  Add Testimonial
                </Button>
              </Box>

              {formData.testimonials.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No testimonials added yet. Click "Add Testimonial" to start collecting client feedback.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {formData.testimonials.map((testimonial, index) => (
                    <Card key={index} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2">
                          Testimonial {index + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeTestimonial(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      <TextField
                        label="Testimonial Text"
                        fullWidth
                        multiline
                        rows={3}
                        value={testimonial.text}
                        onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                        sx={{ mb: 2 }}
                        placeholder="Enter the testimonial text..."
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Author Name"
                            fullWidth
                            value={testimonial.author}
                            onChange={(e) => updateTestimonial(index, 'author', e.target.value)}
                            placeholder="Name of person giving testimonial"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Author Position"
                            fullWidth
                            value={testimonial.position}
                            onChange={(e) => updateTestimonial(index, 'position', e.target.value)}
                            placeholder="Job title or role"
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Project Impacts Tab */}
          {tabValue === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">
                  Project Impacts ({formData.project_impacts.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addProjectImpact}
                  disabled={impacts.length === 0 || formData.project_impacts.length >= impacts.length}
                >
                  Add Impact
                </Button>
              </Box>

              {impacts.length === 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No impacts available. Please create impacts in the system first before linking them to projects.
                </Alert>
              )}

              {formData.project_impacts.length >= impacts.length && impacts.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  All available impacts have been added to this project.
                </Alert>
              )}

              {formData.project_impacts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No project impacts added yet. Click "Add Impact" to link this project to global impact metrics.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {formData.project_impacts.map((projectImpact, index) => {
                    const selectedImpactIds = formData.project_impacts
                      .map((impact, i) => i !== index ? parseInt(impact.impact_id) : null)
                      .filter(id => id !== null);

                    const availableImpacts = impacts.filter(impact => 
                      !selectedImpactIds.includes(impact.id) || 
                      parseInt(projectImpact.impact_id) === impact.id
                    );

                    return (
                      <Card key={index} sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle2">
                            Impact {index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeProjectImpact(index)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!projectImpact.impact_id}>
                              <InputLabel>Impact Type</InputLabel>
                              <Select
                                value={projectImpact.impact_id || ''}
                                onChange={(e) => updateProjectImpact(index, 'impact_id', e.target.value)}
                              >
                                <MenuItem value="">Select Impact</MenuItem>
                                {availableImpacts.map(impact => (
                                  <MenuItem key={impact.id} value={impact.id}>
                                    {impact.name} {impact.unit ? `(${impact.unit})` : ''}
                                  </MenuItem>
                                ))}
                              </Select>
                              {!projectImpact.impact_id && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                  Please select an impact type
                                </Typography>
                              )}
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Contribution Value"
                              type="number"
                              fullWidth
                              value={projectImpact.contribution_value || 0}
                              onChange={(e) => updateProjectImpact(index, 'contribution_value', parseInt(e.target.value) || 0)}
                              placeholder="How much this project contributes"
                              helperText={projectImpact.unit ? `Unit: ${projectImpact.unit}` : ''}
                              inputProps={{ min: 0 }}
                            />
                          </Grid>
                        </Grid>

                        {projectImpact.impact_name && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <TrendingUp fontSize="small" sx={{ mr: 1 }} />
                              Contributing to: <strong>{projectImpact.impact_name}</strong>
                              {projectImpact.unit && ` (${projectImpact.unit})`}
                            </Typography>
                          </Box>
                        )}

                        {/* Show validation error if duplicate */}
                        {formData.project_impacts.filter(impact => 
                          impact.impact_id && parseInt(impact.impact_id) === parseInt(projectImpact.impact_id)
                        ).length > 1 && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            This impact has already been added to the project. Please select a different impact or remove the duplicate.
                          </Alert>
                        )}
                      </Card>
                    );
                  })}
                </Box>
              )}

              {formData.project_impacts.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="primary.dark">
                    <Assessment fontSize="small" sx={{ mr: 1 }} />
                    This project will contribute to {formData.project_impacts.length} global impact metric(s).
                    Values will be added to the global totals when the project is saved.
                  </Typography>
                </Box>
              )}

              {/* Show summary of selected impacts */}
              {formData.project_impacts.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Impact Summary:
                  </Typography>
                  {formData.project_impacts
                    .filter(impact => impact.impact_name && impact.contribution_value > 0)
                    .map((impact, index) => (
                      <Chip
                        key={index}
                        label={`${impact.impact_name}: ${impact.contribution_value.toLocaleString()} ${impact.unit || ''}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  }
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.description.trim() || !formData.pillarId || formData.selectedFocusAreas.length === 0}
          >
            {editingProject ? 'Update' : 'Create'} Project
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

export default AdminManageProjects;
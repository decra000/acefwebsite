import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Switch, Snackbar, Alert,
  CircularProgress, Paper, TableContainer, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Checkbox, FormControlLabel,
  Chip, Grid, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PhotoIcon from '@mui/icons-material/Photo';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';
const API_BASE = API_URL;

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewsDialog, setOpenNewsDialog] = useState(false);
  const [newsDialogBlog, setNewsDialogBlog] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [updating, setUpdating] = useState({}); 
  const [originalData, setOriginalData] = useState({});
  const [changedFields, setChangedFields] = useState([]);
  const [newsConfig, setNewsConfig] = useState({
    news_type: 'general',
    target_countries: []
  });
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: null,
    is_featured: false,
    is_news: false,
    news_type: 'general',
    target_countries: [],
    status: 'draft',
    approved: false,
    meta_title: '',
    meta_description: '',
    tags: []
  });
  const [errors, setErrors] = useState({});

  // Add refs to track real-time form values
  const titleRef = useRef('');
  const contentRef = useRef('');
  const excerptRef = useRef('');
  const metaTitleRef = useRef('');
  const metaDescriptionRef = useRef('');

  const getImageUrl = (filename) => {
    if (!filename) return '/placeholder.jpg';
    
    let cleanFilename = filename;
    cleanFilename = cleanFilename.replace(/^\/+/, '');
    cleanFilename = cleanFilename.replace(/^uploads\//, '');
    cleanFilename = cleanFilename.replace(/^blogs\//, '');
    
    const fullUrl = `${STATIC_URL}/uploads/blogs/${cleanFilename}`;
    console.log('Image URL constructed:', { filename, cleanFilename, fullUrl });
    return fullUrl;
  };

  const getAuthorDisplay = (blog) => {
    let authorName = 'Unknown Author';
    let authorId = null;
    let isCurrentUser = false;
    let authorRole = 'user';
    
    if (blog.author_name && blog.author_name.trim() !== '') {
      authorName = blog.author_name;
    } else if (blog.authorName && blog.authorName.trim() !== '') {
      authorName = blog.authorName;
    } else if (blog.author?.name && blog.author.name.trim() !== '') {
      authorName = blog.author.name;
      authorRole = blog.author.role || 'user';
    } else if (blog.user?.name && blog.user.name.trim() !== '') {
      authorName = blog.user.name;
      authorRole = blog.user.role || 'user';
    } else if (blog.creator?.name && blog.creator.name.trim() !== '') {
      authorName = blog.creator.name;
      authorRole = blog.creator.role || 'user';
    } else if (blog.author_id) {
      authorId = blog.author_id;
      const userIdMap = {
        1: { name: 'ACEF Admin', role: 'admin' },
        2: { name: 'Content Manager', role: 'Content Manager' },
        3: { name: 'Assistant Admin', role: 'Assistant Admin' }
      };
      const userData = userIdMap[blog.author_id];
      if (userData) {
        authorName = userData.name;
        authorRole = userData.role;
      } else {
        authorName = `User #${blog.author_id}`;
      }
    }
    
    return {
      name: authorName,
      id: authorId || blog.author_id,
      isCurrentUser,
      role: authorRole
    };
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettingsIcon sx={{ fontSize: 16, color: '#ff5722' }} />;
      case 'Content Manager':
        return <EditNoteIcon sx={{ fontSize: 16, color: '#2196f3' }} />;
      case 'Assistant Admin':
        return <ManageAccountsIcon sx={{ fontSize: 16, color: '#9c27b0' }} />;
      default:
        return <PersonIcon sx={{ fontSize: 16, color: '#757575' }} />;
    }
  };

  const getNewsTypeDisplay = (blog) => {
    if (!blog.is_news) return null;
    
    if (blog.news_type === 'general') {
      return (
        <Chip
          icon={<PublicIcon sx={{ fontSize: 14 }} />}
          label="General News"
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    } else if (blog.news_type === 'country_specific') {
      const targetCountries = blog.target_countries ? 
        (typeof blog.target_countries === 'string' ? 
          JSON.parse(blog.target_countries) : blog.target_countries) : [];
      
      const countryNames = targetCountries.map(code => {
        const country = countries.find(c => c.code === code || c.name === code);
        return country ? country.name : code;
      }).join(', ');

      return (
        <Chip
          icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
          label={`Country: ${countryNames || 'None'}`}
          size="small"
          color="secondary"
          variant="outlined"
        />
      );
    }
    
    return null;
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const apiCall = async (method, endpoint, data = null, options = {}) => {
    try {
      console.log('API Call:', method, endpoint);
      console.log('Data being sent:', data, 'Type:', typeof data, 'Is FormData:', data instanceof FormData);
      
      const config = {
        method,
        credentials: 'include',
        ...options
      };

      if (data) {
        if (data instanceof FormData) {
          // For FormData, don't set Content-Type header - let browser set it with boundary
          config.body = data;
          console.log('Sending FormData');
        } else {
          // For JSON data
          config.headers = {
            'Content-Type': 'application/json',
            ...config.headers
          };
          config.body = JSON.stringify(data);
          console.log('Sending JSON:', JSON.stringify(data));
        }
      }

      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('API Response success:', response.status, result);
      
      return result;
    } catch (error) {
      console.error('API Error:', {
        method,
        endpoint,
        message: error.message,
        stack: error.stack
      });

      throw new Error(error.message || 'An error occurred');
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_BASE}/countries`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const sortedCountries = data.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
        console.log('Countries loaded:', sortedCountries.length);
      } else {
        console.warn('Countries response is not an array:', data);
        setCountries([]);
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setCountries([]);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      excerpt: '',
      content: '',
      featured_image: null,
      is_featured: false,
      is_news: false,
      news_type: 'general',
      target_countries: [],
      status: 'draft',
      approved: false,
      meta_title: '',
      meta_description: '',
      tags: []
    });
    
    // Reset refs too
    titleRef.current = '';
    contentRef.current = '';
    excerptRef.current = '';
    metaTitleRef.current = '';
    metaDescriptionRef.current = '';
    
    setErrors({});
    setImagePreview(null);
    setExistingImageUrl(null);
    setEditMode(false);
    setCurrentBlogId(null);
    setOriginalData({});
    setChangedFields([]);
  };

  const fetchBlogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await apiCall('GET', '/blogs/admin');
      
      const blogsWithAuthors = (response.data || []).map(blog => {
        const authorInfo = getAuthorDisplay(blog);
        
        const normalizedBlog = {
          ...blog,
          author_name: authorInfo.name,
          author_info: authorInfo,
          views: blog.views || 0
        };

        if (normalizedBlog.status === 'published' && !normalizedBlog.approved) {
          console.warn(`Blog ${blog.id}: Published but not approved - fixing to approved=true`);
          normalizedBlog.approved = true;
        } else if (normalizedBlog.status === 'draft' && normalizedBlog.approved) {
          console.warn(`Blog ${blog.id}: Draft but approved - fixing to approved=false`);
          normalizedBlog.approved = false;
        }
        
        return normalizedBlog;
      });
      
      setBlogs(blogsWithAuthors);
      if (!silent) {
        console.log('Fetched blogs:', blogsWithAuthors.length);
      }
      
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      if (!silent) {
        showSnackbar(err.message || 'Error loading blogs', 'error');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Simple initialization - run once only
  useEffect(() => {
    console.log('Component initializing...');
    
    const init = async () => {
      await Promise.all([
        fetchBlogs(),
        fetchCountries()
      ]);
    };
    
    init();
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []); // EMPTY array - run once only

  // Handle auto-refresh interval
  useEffect(() => {
    if (!openDialog) {
      const interval = setInterval(() => {
        fetchBlogs(true);
      }, 30000);
      
      setRefreshInterval(interval);
      
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [openDialog]);

  const handleNewsToggle = async (blogId, currentValue) => {
    if (currentValue) {
      // Turning OFF news - directly update to regular post
      await updateBlogField(blogId, {
        is_news: false,
        news_type: 'general',
        target_countries: []
      });
    } else {
      // Turning ON news - open modal for configuration
      const blog = blogs.find(b => b.id === blogId);
      setNewsDialogBlog(blog);
      setNewsConfig({
        news_type: 'general',
        target_countries: []
      });
      setOpenNewsDialog(true);
    }
  };

  const handleNewsConfigSave = async () => {
    if (!newsDialogBlog) return;

    const updateData = {
      is_news: true,
      news_type: newsConfig.news_type,
      target_countries: newsConfig.news_type === 'country_specific' ? newsConfig.target_countries : []
    };

    await updateBlogField(newsDialogBlog.id, updateData);
    setOpenNewsDialog(false);
    setNewsDialogBlog(null);
  };

  const updateBlogField = async (id, updateData) => {
    const fields = Object.keys(updateData);
    const updateKey = `${id}-${fields.join('-')}`;
    
    if (updating[updateKey]) {
      console.log(`Update already in progress for blog ${id}`);
      return;
    }

    setUpdating(prev => ({ ...prev, [updateKey]: true }));

    try {
      console.log(`Updating blog ${id} with data:`, updateData);

      // Optimistic update
      setBlogs(prev => prev.map(b => (
        b.id === id ? { ...b, ...updateData } : b
      )));
      
      const response = await apiCall('PUT', `/blogs/${id}`, updateData);
      
      // Determine success message
      let message = 'Blog updated successfully';
      if ('is_news' in updateData) {
        message = updateData.is_news ? 'Blog converted to news post' : 'Blog converted to regular post';
      } else if ('approved' in updateData) {
        message = updateData.approved ? 'Blog approved and published' : 'Blog disapproved and moved to draft';
      } else if ('is_featured' in updateData) {
        message = updateData.is_featured ? 'Blog featured' : 'Blog unfeatured';
      }
      
      showSnackbar(message);
      
      // Refresh after delay to get updated data
      setTimeout(() => {
        fetchBlogs(true);
      }, 1500);
      
    } catch (err) {
      console.error(`Failed to update blog ${id}:`, err);
      showSnackbar(err.message || 'Failed to update blog', 'error');
      // Revert optimistic update on error
      fetchBlogs(true);
    } finally {
      setUpdating(prev => {
        const newState = { ...prev };
        delete newState[updateKey];
        return newState;
      });
    }
  };

  const updateField = async (id, field, value) => {
    // Handle news toggle specially
    if (field === 'is_news') {
      return handleNewsToggle(id, value);
    }
    
    // For other fields, use the regular update
    await updateBlogField(id, { [field]: value });
  };

  const handleDelete = async (id) => {
    const blogToDelete = blogs.find(b => b.id === id);
    
    if (!window.confirm(`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`)) return;

    try {
      await apiCall('DELETE', `/blogs/${id}`);
      setBlogs(prev => prev.filter(b => b.id !== id));
      showSnackbar('Blog deleted successfully');
    } catch (err) {
      console.error('Failed to delete blog:', err);
      showSnackbar(err.message || 'Failed to delete blog', 'error');
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await apiCall('GET', `/blogs/${id}`);
      const blog = response.data;
      
      let status = blog.status || 'draft';
      let approved = blog.approved || false;
      
      if (status === 'published' && !approved) {
        console.warn('Fixing inconsistent state: published but not approved');
        approved = true;
      } else if (status === 'draft' && approved) {
        console.warn('Fixing inconsistent state: draft but approved');
        approved = false;
      }

      // Parse target_countries
      let targetCountries = [];
      if (blog.target_countries) {
        try {
          targetCountries = typeof blog.target_countries === 'string' 
            ? JSON.parse(blog.target_countries) 
            : blog.target_countries;
          if (!Array.isArray(targetCountries)) {
            targetCountries = [];
          }
        } catch (error) {
          console.error('Error parsing target_countries:', error);
          targetCountries = [];
        }
      }
      
      const formData = {
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featured_image: null,
        is_featured: blog.is_featured || false,
        is_news: blog.is_news || false,
        news_type: blog.news_type || 'general',
        target_countries: targetCountries,
        status: status,
        approved: approved,
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
        tags: blog.tags ? (typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags) : []
      };

      setForm(formData);
      
      // Update refs with loaded data
      titleRef.current = formData.title;
      contentRef.current = formData.content;
      excerptRef.current = formData.excerpt;
      metaTitleRef.current = formData.meta_title;
      metaDescriptionRef.current = formData.meta_description;
      
      setOriginalData({...formData});
      setChangedFields([]);
      
      if (blog.featured_image) {
        const fullImageUrl = getImageUrl(blog.featured_image);
        setImagePreview(fullImageUrl);
        setExistingImageUrl(fullImageUrl);
      } else {
        setImagePreview(null);
        setExistingImageUrl(null);
      }
      
      setEditMode(true);
      setCurrentBlogId(id);
      setOpenDialog(true);
    } catch (err) {
      console.error('Failed to fetch blog for editing:', err);
      showSnackbar(err.message || 'Failed to load blog for editing', 'error');
    }
  };

  const handleFormChange = (field, value) => {
    console.log(`Updating ${field} to:`, value);
    
    // Update refs immediately for validation
    switch(field) {
      case 'title':
        titleRef.current = value;
        break;
      case 'content':
        contentRef.current = value;
        break;
      case 'excerpt':
        excerptRef.current = value;
        break;
      case 'meta_title':
        metaTitleRef.current = value;
        break;
      case 'meta_description':
        metaDescriptionRef.current = value;
        break;
    }
    
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      console.log('New form state:', newForm);
      
      // Track changes for highlighting
      if (editMode && originalData[field] !== undefined) {
        const hasChanged = JSON.stringify(originalData[field]) !== JSON.stringify(value);
        setChangedFields(prevFields => {
          const updatedFields = prevFields.filter(f => f !== field);
          if (hasChanged) {
            updatedFields.push(field);
          }
          return updatedFields;
        });
      }
      
      // Auto-sync approved and status fields
      if (field === 'approved') {
        if (value) {
          newForm.status = 'published';
        } else {
          newForm.status = 'draft';
        }
      }

      // Reset target_countries when switching to general news
      if (field === 'news_type' && value === 'general') {
        newForm.target_countries = [];
      }

      // Reset news fields when switching off news
      if (field === 'is_news' && !value) {
        newForm.news_type = 'general';
        newForm.target_countries = [];
      }
      
      return newForm;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showSnackbar('Please select a valid image file', 'error');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Image file must be less than 5MB', 'error');
        return;
      }
      
      handleFormChange('featured_image', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setExistingImageUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    console.log("Starting form submission...");

    const title = (form.title || "").trim();
    const content = (form.content || "").trim();
    const excerpt = (form.excerpt || "").trim();
    const metaTitle = (form.meta_title || "").trim();
    const metaDescription = (form.meta_description || "").trim();

    const newErrors = {};

    if (!title || title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!content || content.length < 10) {
      newErrors.content = "Content must be at least 10 characters";
    }

    if (excerpt && excerpt.length > 500) {
      newErrors.excerpt = "Excerpt must be less than 500 characters";
    }

    if (metaTitle && metaTitle.length > 200) {
      newErrors.meta_title = "Meta title must be less than 200 characters";
    }

    if (metaDescription && metaDescription.length > 300) {
      newErrors.meta_description = "Meta description must be less than 300 characters";
    }

    // Validate news-specific fields
    if (form.is_news && form.news_type === 'country_specific') {
      if (!form.target_countries || form.target_countries.length === 0) {
        newErrors.target_countries = "Please select at least one country for country-specific news";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showSnackbar("Please fix the validation errors", "error");
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("excerpt", excerpt);
      formData.append("meta_title", metaTitle);
      formData.append("meta_description", metaDescription);
      formData.append("is_featured", form.is_featured || false);
      formData.append("is_news", form.is_news || false);
      formData.append("news_type", form.news_type || 'general');
      formData.append("target_countries", JSON.stringify(form.target_countries || []));
      formData.append("status", form.status || "draft");
      formData.append("approved", form.approved || false);
      formData.append("tags", JSON.stringify(form.tags || []));

      if (form.featured_image) {
        formData.append("featured_image", form.featured_image);
      }

      let response;
      if (editMode) {
        response = await apiCall("PUT", `/blogs/${currentBlogId}`, formData);
        showSnackbar(response.message || "Blog updated successfully");
      } else {
        response = await apiCall("POST", "/blogs", formData);
        showSnackbar(response.message || "Blog created successfully");
      }

      setOpenDialog(false);
      await fetchBlogs();
      resetForm();
    } catch (err) {
      console.error("Failed to save blog:", err);
      showSnackbar(err.message || `Failed to ${editMode ? "update" : "create"} blog`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (submitting) return;
    setOpenDialog(false);
    resetForm();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusDisplay = (blog) => {
    if (blog.status === 'published' && blog.approved) {
      return { color: 'success', label: 'Published' };
    } else if (blog.status === 'published' && !blog.approved) {
      return { color: 'warning', label: 'Published (Not Approved)' };
    } else if (blog.status === 'draft' && blog.approved) {
      return { color: 'warning', label: 'Draft (Approved)' };
    } else {
      return { color: 'default', label: 'Draft' };
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading blogs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">
            Manage Blog Posts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {blogs.length} blogs | Countries: {countries.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              fetchBlogs();
              fetchCountries();
            }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            startIcon={<AddIcon />} 
            variant="contained" 
            onClick={() => setOpenDialog(true)}
            size="large"
          >
            Create New Blog
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Author</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Views</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell><strong>Featured</strong></TableCell>
              <TableCell><strong>News</strong></TableCell>
              <TableCell><strong>Approved</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No blogs found. Click "Create New Blog" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => {
                const statusDisplay = getStatusDisplay(blog);
                const isUpdatingApproved = updating[`${blog.id}-approved`];
                const isUpdatingFeatured = updating[`${blog.id}-is_featured`];
                const isUpdatingNews = updating[`${blog.id}-is_news`] || updating[`${blog.id}-is_news-news_type-target_countries`];
                const authorInfo = blog.author_info || getAuthorDisplay(blog);
                const newsTypeDisplay = getNewsTypeDisplay(blog);
                
                return (
                  <TableRow key={blog.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, maxWidth: 200 }}>
                          {blog.title}
                        </Typography>
                        {blog.excerpt && (
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                            {blog.excerpt.substring(0, 50)}...
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRoleIcon(authorInfo.role)}
                        <Typography variant="body2">
                          {authorInfo.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusDisplay.label}
                        color={statusDisplay.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {newsTypeDisplay}
                        {!blog.is_news && (
                          <Chip
                            label="Regular Post"
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatViews(blog.views || 0)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(blog.created_at)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={!!blog.is_featured}
                        onChange={(e) => updateField(blog.id, 'is_featured', e.target.checked)}
                        disabled={isUpdatingFeatured}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={!!blog.is_news}
                        onChange={(e) => updateField(blog.id, 'is_news', !!blog.is_news)}
                        disabled={isUpdatingNews}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={!!blog.approved}
                        onChange={(e) => updateField(blog.id, 'approved', e.target.checked)}
                        color="success"
                        disabled={isUpdatingApproved}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={() => handleEdit(blog.id)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(blog.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* News Configuration Modal */}
      <Dialog open={openNewsDialog} onClose={() => setOpenNewsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure News Post</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              "{newsDialogBlog?.title}"
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
              <InputLabel>News Type</InputLabel>
              <Select
                value={newsConfig.news_type}
                label="News Type"
                onChange={(e) => setNewsConfig(prev => ({ 
                  ...prev, 
                  news_type: e.target.value,
                  target_countries: e.target.value === 'general' ? [] : prev.target_countries
                }))}
              >
                <MenuItem value="general">General News</MenuItem>
                <MenuItem value="country_specific">Country Specific</MenuItem>
              </Select>
            </FormControl>

            {newsConfig.news_type === 'country_specific' && (
              <Autocomplete
                multiple
                options={countries}
                getOptionLabel={(option) => option.name}
                value={countries.filter(country => newsConfig.target_countries.includes(country.id))}
                onChange={(event, newValue) => {
                  setNewsConfig(prev => ({
                    ...prev,
                    target_countries: newValue.map(country => country.id)
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Target Countries"
                    placeholder="Select countries..."
                    helperText="Select which countries this news applies to"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewsDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleNewsConfigSave}
            disabled={newsConfig.news_type === 'country_specific' && newsConfig.target_countries.length === 0}
          >
            Convert to News
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Blog Post' : 'Create New Blog Post'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Title *" 
                value={form.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Excerpt" 
                multiline 
                rows={2}
                value={form.excerpt}
                onChange={(e) => handleFormChange('excerpt', e.target.value)}
                error={!!errors.excerpt}
                helperText={errors.excerpt}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Content *" 
                multiline 
                rows={6}
                value={form.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                error={!!errors.content}
                helperText={errors.content}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button 
                component="label" 
                variant="outlined"
                startIcon={<PhotoIcon />}
                fullWidth
              >
                Upload Featured Image
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e.target.files[0])} 
                />
              </Button>
              {(imagePreview || existingImageUrl) && (
                <Box sx={{ mt: 2 }}>
                  <img 
                    src={imagePreview || existingImageUrl} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={form.is_news}
                      onChange={(e) => handleFormChange('is_news', e.target.checked)}
                    />
                  }
                  label="News Post"
                />
                
                {form.is_news && (
                  <FormControl fullWidth size="small">
                    <InputLabel>News Type</InputLabel>
                    <Select
                      value={form.news_type}
                      label="News Type"
                      onChange={(e) => handleFormChange('news_type', e.target.value)}
                    >
                      <MenuItem value="general">General News</MenuItem>
                      <MenuItem value="country_specific">Country Specific</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {form.is_news && form.news_type === 'country_specific' && (
                  <Autocomplete
                    multiple
                    options={countries}
                    getOptionLabel={(option) => option.name}
                    value={countries.filter(country => form.target_countries.includes(country.id))}
                    onChange={(event, newValue) => {
                      handleFormChange('target_countries', newValue.map(country => country.id));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Target Countries"
                        placeholder="Select countries..."
                        error={!!errors.target_countries}
                        helperText={errors.target_countries}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option.id}
                        />
                      ))
                    }
                  />
                )}
                
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={form.approved}
                      onChange={(e) => handleFormChange('approved', e.target.checked)}
                    />
                  }
                  label="Approved"
                />
                
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.status}
                    label="Status"
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Meta Title" 
                value={form.meta_title}
                onChange={(e) => handleFormChange('meta_title', e.target.value)}
                error={!!errors.meta_title}
                helperText={errors.meta_title}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Meta Description" 
                multiline
                rows={2}
                value={form.meta_description}
                onChange={(e) => handleFormChange('meta_description', e.target.value)}
                error={!!errors.meta_description}
                helperText={errors.meta_description}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              editMode ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageBlogs;
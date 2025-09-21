import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Upload, Image, Shield, Eye, EyeOff, Edit3, Trash2, 
  Filter, Grid, List, Download, Settings, Plus, ChevronDown,
  AlertTriangle, Check, X, Loader2, Tag, Calendar, FileText,
  Camera, Zap, MoreVertical, Copy, ExternalLink
} from 'lucide-react';

const GalleryManager = () => {
  // State Management
  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [currentItem, setCurrentItem] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Filter and Pagination States
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    is_protected: undefined,
    is_active: 'true',
    sort_by: 'updated_at',
    sort_order: 'DESC'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    alt_text: '',
    category: 'general',
    usage_locations: [],
    is_active: true
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Stats State
  const [stats, setStats] = useState({
    total_items: 0,
    protected_items: 0,
    active_items: 0,
    total_file_size: 0
  });

  // API Base URL
  const API_BASE = '/api/gallery';

  // Show notification
  const showNotification = (message, type = 'success') => {
    // You can replace this with your notification system
    const className = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${className} text-white px-4 py-2 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  // Fetch Gallery Items
  const fetchGalleryItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== undefined && value !== '')
        )
      });

      const response = await fetch(`${API_BASE}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setGalleryItems(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch gallery items');
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      showNotification('Failed to fetch gallery items: ' + error.message, 'error');
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories/list`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set default categories if API fails
      setCategories([
        { name: 'general', color: '#6B7280', item_count: 0 },
        { name: 'hero', color: '#EF4444', item_count: 0 },
        { name: 'about', color: '#10B981', item_count: 0 }
      ]);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/usage/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data?.overall || {
          total_items: 0,
          protected_items: 0,
          active_items: 0,
          total_file_size: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  // Handle Filter Changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (modalType === 'create' && !selectedFile) {
      errors.image = 'Image file is required for new items';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle File Selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);

      // Auto-fill alt text if empty
      if (!formData.alt_text) {
        setFormData(prev => ({ 
          ...prev, 
          alt_text: file.name.replace(/\.[^/.]+$/, "")
        }));
      }
      
      // Clear image error if it exists
      if (formErrors.image) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fix form errors', 'error');
      return;
    }

    try {
      setProcessing(true);
      
      const formDataObj = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'usage_locations') {
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else {
          formDataObj.append(key, formData[key]);
        }
      });

      // Add file if selected
      if (selectedFile) {
        formDataObj.append('image', selectedFile);
      }

      const url = modalType === 'create' 
        ? API_BASE 
        : `${API_BASE}/${currentItem.id}`;
      
      const method = modalType === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        body: formDataObj
      });

      const data = await response.json();

      if (data.success) {
        showNotification(data.message || `Image ${modalType === 'create' ? 'created' : 'updated'} successfully`);
        setShowModal(false);
        resetForm();
        fetchGalleryItems();
        fetchStats();
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      alt_text: '',
      category: 'general',
      usage_locations: [],
      is_active: true
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setCurrentItem(null);
    setFormErrors({});
  };

  // Open Modal
  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    
    if (type === 'edit' && item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        alt_text: item.alt_text || '',
        category: item.category || 'general',
        usage_locations: item.usage_locations ? 
          (typeof item.usage_locations === 'string' ? 
            JSON.parse(item.usage_locations) : 
            item.usage_locations
          ) : [],
        is_active: item.is_active
      });
      setPreviewUrl(item.image_url);
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  // Toggle Protection
  const toggleProtection = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/${id}/protection`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_protected: !currentStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchGalleryItems();
        showNotification(data.message || `Item ${!currentStatus ? 'protected' : 'unprotected'} successfully`);
      } else {
        throw new Error(data.message || 'Failed to toggle protection');
      }
    } catch (error) {
      console.error('Error toggling protection:', error);
      showNotification('Error: ' + error.message, 'error');
    }
  };

  // Delete Item
  const deleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchGalleryItems();
        fetchStats();
        showNotification('Item deleted successfully');
      } else {
        throw new Error(data.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('Error: ' + error.message, 'error');
    }
  };

  // Bulk Operations
  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      showNotification('No items selected', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedItems.length} item(s)?`)) {
      return;
    }

    try {
      const endpoint = action === 'delete' ? '/bulk/delete' : '/bulk/update';
      const body = action === 'delete' 
        ? { ids: selectedItems }
        : { 
            ids: selectedItems, 
            updates: action === 'activate' 
              ? { is_active: true } 
              : { is_active: false }
          };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: action === 'delete' ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        fetchGalleryItems();
        fetchStats();
        setSelectedItems([]);
        showNotification(data.message || `Bulk ${action} completed successfully`);
      } else {
        throw new Error(data.message || `Failed to ${action} items`);
      }
    } catch (error) {
      console.error(`Error with bulk ${action}:`, error);
      showNotification('Error: ' + error.message, 'error');
    }
  };

  // Add usage location
  const addUsageLocation = () => {
    setFormData(prev => ({ 
      ...prev, 
      usage_locations: [...prev.usage_locations, ''] 
    }));
  };

  // Remove usage location
  const removeUsageLocation = (index) => {
    setFormData(prev => ({
      ...prev,
      usage_locations: prev.usage_locations.filter((_, i) => i !== index)
    }));
  };

  // Update usage location
  const updateUsageLocation = (index, value) => {
    setFormData(prev => {
      const newLocations = [...prev.usage_locations];
      newLocations[index] = value;
      return { ...prev, usage_locations: newLocations };
    });
  };

  // Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Get Category Color
  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#6B7280';
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.length === galleryItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(galleryItems.map(item => item.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-600" />
                Gallery Manager
              </h1>
              <p className="text-gray-600 mt-1">
                Manage website images and media assets
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => openModal('create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Image
              </button>
              
              <div className="flex items-center gap-2 border-l pl-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total_items || 0}</p>
                </div>
                <Image className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active Items</p>
                  <p className="text-2xl font-bold text-green-900">{stats.active_items || 0}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Protected</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.protected_items || 0}</p>
                </div>
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Size</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatFileSize(stats.total_file_size)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search images by name, description, or alt text..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.item_count || 0})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange('is_active', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>

            {/* Protection Filter */}
            <select
              value={filters.is_protected || 'all'}
              onChange={(e) => handleFilterChange('is_protected', e.target.value === 'all' ? undefined : e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Protection</option>
              <option value="true">Protected Only</option>
              <option value="false">Unprotected Only</option>
            </select>

            {/* Sort */}
            <select
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(e) => {
                const [sort_by, sort_order] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sort_by, sort_order }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="updated_at-DESC">Latest Updated</option>
              <option value="created_at-DESC">Latest Created</option>
              <option value="name-ASC">Name A-Z</option>
              <option value="name-DESC">Name Z-A</option>
              <option value="file_size-DESC">Largest File</option>
              <option value="file_size-ASC">Smallest File</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-blue-800 font-medium">
                {selectedItems.length} item(s) selected
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded text-sm transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Items */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading gallery items...</span>
            </div>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gallery items found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first image'
              }
            </p>
            <button
              onClick={() => openModal('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Image
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Select All */}
            {galleryItems.length > 0 && (
              <div className="p-4 border-b border-gray-200">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === galleryItems.length}
                    onChange={selectAllItems}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Select all ({galleryItems.length} items)
                </label>
              </div>
            )}

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {galleryItems.map(item => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    categories={categories}
                    selectedItems={selectedItems}
                    onToggleSelection={toggleItemSelection}
                    onEdit={() => openModal('edit', item)}
                    onView={() => openModal('view', item)}
                    onToggleProtection={() => toggleProtection(item.id, item.is_protected)}
                    onDelete={() => deleteItem(item.id, item.name)}
                    getCategoryColor={getCategoryColor}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {galleryItems.map(item => (
                  <GalleryListItem
                    key={item.id}
                    item={item}
                    categories={categories}
                    selectedItems={selectedItems}
                    onToggleSelection={toggleItemSelection}
                    onEdit={() => openModal('edit', item)}
                    onView={() => openModal('view', item)}
                    onToggleProtection={() => toggleProtection(item.id, item.is_protected)}
                    onDelete={() => deleteItem(item.id, item.name)}
                    getCategoryColor={getCategoryColor}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`px-3 py-2 text-sm rounded ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalType === 'create' && 'Add New Image'}
                    {modalType === 'edit' && 'Edit Image'}
                    {modalType === 'view' && 'Image Details'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {modalType === 'view' && currentItem ? (
                <ImageDetailsView 
                  item={currentItem} 
                  categories={categories} 
                  formatFileSize={formatFileSize} 
                  getCategoryColor={getCategoryColor}
                />
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Image Upload/Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image {modalType === 'create' && <span className="text-red-500">*</span>}
                    </label>
                    
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl('');
                            setSelectedFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload image</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </label>
                    )}
                    {formErrors.image && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., hero_slide_1"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Unique identifier for this image (used in code references)
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this image is used for..."
                    />
                  </div>

                  {/* Alt Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descriptive text for accessibility"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Usage Locations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Locations
                    </label>
                    <div className="space-y-2">
                      {formData.usage_locations.map((location, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => updateUsageLocation(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., homepage_hero"
                          />
                          <button
                            type="button"
                            onClick={() => removeUsageLocation(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addUsageLocation}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Usage Location
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Where this image is used on the website
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active (visible in gallery)
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={processing}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {modalType === 'create' ? 'Creating...' : 'Updating...'}
                        </>
                      ) : (
                        <>
                          {modalType === 'create' ? <Plus className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          {modalType === 'create' ? 'Create Image' : 'Update Image'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Gallery Card Component (Grid View)
const GalleryCard = ({ 
  item, 
  categories, 
  selectedItems, 
  onToggleSelection, 
  onEdit, 
  onView, 
  onToggleProtection, 
  onDelete, 
  getCategoryColor, 
  formatFileSize 
}) => {
  const isSelected = selectedItems.includes(item.id);

  return (
    <div className={`group relative bg-white border-2 rounded-lg overflow-hidden transition-all ${
      isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(item.id)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>

      {/* Protection Badge */}
      {item.is_protected && (
        <div className="absolute top-2 right-2 z-10">
          <Shield className="w-5 h-5 text-yellow-500 bg-white rounded-full p-1" />
        </div>
      )}

      {/* Image */}
      <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative">
        <img
          src={item.image_url}
          alt={item.alt_text || item.name}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={onView}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
          }}
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate" title={item.name}>
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 truncate" title={item.description}>
              {item.description || 'No description'}
            </p>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {!item.is_active && <EyeOff className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: getCategoryColor(item.category) }}
          >
            <Tag className="w-3 h-3 mr-1" />
            {item.category}
          </span>
          
          <span className="text-xs text-gray-500">
            {formatFileSize(item.file_size)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleProtection}
              className={`p-1 rounded ${
                item.is_protected 
                  ? 'text-yellow-600 hover:text-yellow-800' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={item.is_protected ? 'Unprotect' : 'Protect'}
            >
              <Shield className="w-4 h-4" />
            </button>
            
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800 p-1 rounded"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            
            {!item.is_protected && (
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-800 p-1 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <span className="text-xs text-gray-400">
            {item.usage_count || 0} use{(item.usage_count || 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

// Gallery List Item Component (List View)
const GalleryListItem = ({ 
  item, 
  categories, 
  selectedItems, 
  onToggleSelection, 
  onEdit, 
  onView, 
  onToggleProtection, 
  onDelete, 
  getCategoryColor, 
  formatFileSize 
}) => {
  const isSelected = selectedItems.includes(item.id);

  return (
    <div className={`p-4 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      <div className="flex items-center gap-4">
        {/* Selection */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(item.id)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />

        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={item.image_url}
            alt={item.alt_text || item.name}
            className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer"
            onClick={onView}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+';
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
            {item.is_protected && <Shield className="w-4 h-4 text-yellow-500" />}
            {!item.is_active && <EyeOff className="w-4 h-4 text-gray-400" />}
          </div>
          
          <p className="text-sm text-gray-600 truncate mb-1">
            {item.description || 'No description'}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getCategoryColor(item.category) }}
            >
              {item.category}
            </span>
            <span>{formatFileSize(item.file_size)}</span>
            <span>{item.width} × {item.height}</span>
            <span>{item.usage_count || 0} use{(item.usage_count || 0) !== 1 ? 's' : ''}</span>
            <span>{new Date(item.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={onToggleProtection}
            className={`p-2 rounded ${
              item.is_protected 
                ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={item.is_protected ? 'Unprotect' : 'Protect'}
          >
            <Shield className="w-4 h-4" />
          </button>
          
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-100"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          {!item.is_protected && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-100"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Image Details View Component
const ImageDetailsView = ({ item, categories, formatFileSize, getCategoryColor }) => {
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      // Show notification or use your notification system
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Copied to clipboard!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Image Preview */}
      <div className="text-center">
        <img
          src={item.image_url}
          alt={item.alt_text || item.name}
          className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-200"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
          }}
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                {item.name}
              </span>
              <button
                onClick={() => copyToClipboard(item.name)}
                className="text-gray-500 hover:text-gray-700"
                title="Copy name"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <p className="text-gray-900">{item.description || 'No description'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
            <p className="text-gray-900">{item.alt_text || 'No alt text'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: getCategoryColor(item.category) }}
            >
              <Tag className="w-4 h-4 mr-1" />
              {item.category}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
            <p className="text-gray-900">{formatFileSize(item.file_size)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
            <p className="text-gray-900">{item.width} × {item.height} pixels</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex items-center gap-2">
              {item.is_active ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Eye className="w-3 h-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Inactive
                </span>
              )}
              
              {item.is_protected && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Protected
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
            <p className="text-gray-900">{new Date(item.created_at).toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
            <p className="text-gray-900">{new Date(item.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Usage Locations */}
      {item.usage_locations && item.usage_locations !== '[]' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Usage Locations</label>
          <div className="space-y-2">
            {(typeof item.usage_locations === 'string' ? 
              JSON.parse(item.usage_locations) : 
              item.usage_locations
            ).map((location, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                  {location}
                </span>
                <button
                  onClick={() => copyToClipboard(location)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Copy usage location"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded text-sm flex-1 truncate">
            {item.image_url}
          </span>
          <button
            onClick={() => copyToClipboard(item.image_url)}
            className="text-gray-500 hover:text-gray-700"
            title="Copy URL"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={item.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Usage Statistics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Usage Statistics</label>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Currently used in:</span>
            <span className="font-medium text-gray-900">
              {item.usage_count || 0} location{(item.usage_count || 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryManager;
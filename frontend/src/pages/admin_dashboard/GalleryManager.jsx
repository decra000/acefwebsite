import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { 
  Search, 
  Upload, 
  Edit3, 
  Trash2, 
  Shield, 
  ShieldOff, 
  Eye, 
  EyeOff, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  X, 
  Save, 
  AlertTriangle,
  ImageIcon,
  Tag,
  Clock,
  FileText,
  Download
} from 'lucide-react';
import { API_URL, STATIC_URL } from '../../config';

const GalleryManager = () => {
  // State management
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI States
  const [viewMode, setViewMode] = useState('grid');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [currentImage, setCurrentImage] = useState(null);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [protectionFilter, setProtectionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form states
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
  const fileInputRef = useRef(null);

  // Predefined usage locations for your specific use cases
  const usageLocationOptions = [
    { value: 'hero-section', label: 'Hero Section Slides', description: 'Homepage hero slider images' },
    { value: 'about-acefinfo', label: 'About AcefInfo Section', description: 'Homepage about section' },
    { value: 'others-board', label: 'Others Board Section', description: 'Homepage board section' },
    { value: 'mission-card', label: 'Mission Card', description: 'About Us mission card' },
    { value: 'vision-card', label: 'Vision Card', description: 'About Us vision card' },
    { value: 'impact-hero', label: 'Impact Hero Image', description: 'Impact page hero' },
    { value: 'get-involved-hero', label: 'Get Involved Hero', description: 'Get Involved page hero' }
  ];

  // API Functions
  const apiCall = async (endpoint, options = {}) => {
    try {
    const response = await fetch(`${API_URL}/gallery${endpoint}`, {
      

        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: categoryFilter,
        is_active: statusFilter,
        is_protected: protectionFilter,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      const response = await apiCall(`/?${queryParams}`);
      setImages(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      setError('Failed to fetch images: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiCall('/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // CRUD Operations
  const createImage = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('image', selectedFile);
    formDataObj.append('name', formData.name);
    formDataObj.append('description', formData.description);
    formDataObj.append('alt_text', formData.alt_text || formData.name);
    formDataObj.append('category', formData.category);
    formDataObj.append('usage_locations', JSON.stringify(formData.usage_locations));

    try {
      setLoading(true);

      await fetch(`${API_URL}/gallery`, {
        method: 'POST',
        body: formDataObj
      });
      
      setSuccess('Image uploaded successfully');
      setShowModal(false);
      resetForm();
      fetchImages();
    } catch (error) {
      setError('Failed to upload image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateImage = async () => {
    const formDataObj = new FormData();
    if (selectedFile) {
      formDataObj.append('image', selectedFile);
    }
    formDataObj.append('name', formData.name);
    formDataObj.append('description', formData.description);
    formDataObj.append('alt_text', formData.alt_text);
    formDataObj.append('category', formData.category);
    formDataObj.append('usage_locations', JSON.stringify(formData.usage_locations));
    formDataObj.append('is_active', formData.is_active);

    try {
      setLoading(true);
      await fetch(`${API_URL}/gallery, {currentImage.id}`, {
        method: 'PUT',
        body: formDataObj
      });
      
      setSuccess('Image updated successfully');
      setShowModal(false);
      resetForm();
      fetchImages();
    } catch (error) {
      setError('Failed to update image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id) => {
    showConfirmation('Are you sure you want to delete this image?', async () => {
      try {
        await apiCall(`/${id}`, { method: 'DELETE' });
        setSuccess('Image deleted successfully');
        fetchImages();
      } catch (error) {
        setError('Failed to delete image: ' + error.message);
      }
    });
  };

  const toggleProtection = async (id, isProtected) => {
    try {
      await apiCall(`/${id}/protection`, {
        method: 'PUT',
        body: JSON.stringify({ is_protected: !isProtected })
      });
      setSuccess(`Image ${!isProtected ? 'protected' : 'unprotected'} successfully`);
      fetchImages();
    } catch (error) {
      setError('Failed to toggle protection: ' + error.message);
    }
  };

  const bulkUpdate = async (updates) => {
    if (selectedImages.length === 0) {
      setError('Please select images to update');
      return;
    }





    
    try {
      await apiCall('/bulk/update', {
        method: 'PUT',
        body: JSON.stringify({
          ids: selectedImages,
          updates
        })
      });
      setSuccess(`${selectedImages.length} images updated successfully`);
      setSelectedImages([]);
      fetchImages();
    } catch (error) {
      setError('Bulk update failed: ' + error.message);
    }
  };

  // Utility functions
  const showConfirmation = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

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
    setCurrentImage(null);
  };

  const openModal = (mode, image = null) => {
    setModalMode(mode);
    setCurrentImage(image);
    
    if (image) {
      setFormData({
        name: image.name,
        description: image.description || '',
        alt_text: image.alt_text || '',
        category: image.category,
        usage_locations: JSON.parse(image.usage_locations || '[]'),
        is_active: image.is_active === 1
      });
      setPreviewUrl(image.image_url);
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
      
      // Auto-fill name if empty
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name.split('.')[0] }));
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Effects
  useEffect(() => {
    fetchImages();
  }, [currentPage, searchTerm, categoryFilter, statusFilter, protectionFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Gallery Manager</h1>
          <button
            onClick={() => openModal('create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Image
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={protectionFilter}
            onChange={(e) => setProtectionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Protection</option>
            <option value="true">Protected</option>
            <option value="false">Unprotected</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedImages.length > 0 && (
          <div className="flex gap-2 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800">
              {selectedImages.length} selected
            </span>
            <button
              onClick={() => bulkUpdate({ is_active: true })}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded"
            >
              Activate
            </button>
            <button
              onClick={() => bulkUpdate({ is_active: false })}
              className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
            >
              Deactivate
            </button>
            <button
              onClick={() => bulkUpdate({ is_protected: true })}
              className="text-xs bg-yellow-600 text-white px-2 py-1 rounded"
            >
              Protect
            </button>
            <button
              onClick={() => setSelectedImages([])}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Images Grid/List */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No images found. Upload your first image to get started!</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
                {images.map((image) => (
                  <div key={image.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square relative">
                      <img
                        src={image.image_url}
                        alt={image.alt_text}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/200/200';
                        }}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            onClick={() => openModal('view', image)}
                            className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('edit', image)}
                            className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!image.is_protected && (
                            <button
                              onClick={() => deleteImage(image.id)}
                              className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Status indicators */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {image.is_protected && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                            Protected
                          </span>
                        )}
                        {!image.is_active && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Selection checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedImages([...selectedImages, image.id]);
                          } else {
                            setSelectedImages(selectedImages.filter(id => id !== image.id));
                          }
                        }}
                        className="absolute top-2 right-2 w-4 h-4"
                      />
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 truncate">{image.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{image.category}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">
                          {image.file_size && formatFileSize(image.file_size)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleProtection(image.id, image.is_protected)}
                            className={`p-1 rounded ${image.is_protected ? 'text-yellow-600' : 'text-gray-400'}`}
                          >
                            {image.is_protected ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                          </button>
                          <span className={`w-2 h-2 rounded-full ${image.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {images.map((image) => (
                  <div key={image.id} className="p-4 hover:bg-gray-50 flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedImages([...selectedImages, image.id]);
                        } else {
                          setSelectedImages(selectedImages.filter(id => id !== image.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-12 h-12 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{image.name}</h3>
                        {image.is_protected && <Shield className="w-4 h-4 text-yellow-600" />}
                        {!image.is_active && <EyeOff className="w-4 h-4 text-red-600" />}
                      </div>
                      <p className="text-sm text-gray-500">{image.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span>{image.category}</span>
                        <span>{image.file_size && formatFileSize(image.file_size)}</span>
                        <span>{image.width}x{image.height}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('view', image)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit', image)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleProtection(image.id, image.is_protected)}
                        className={`p-2 ${image.is_protected ? 'text-yellow-600' : 'text-gray-400'} hover:text-yellow-700`}
                      >
                        {image.is_protected ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                      </button>
                      {!image.is_protected && (
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {modalMode === 'create' && 'Upload New Image'}
                  {modalMode === 'edit' && 'Edit Image'}
                  {modalMode === 'view' && 'View Image'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              )}

              {modalMode !== 'view' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg h-24"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    disabled={modalMode === 'view'}
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Locations
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {usageLocationOptions.map(option => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.usage_locations.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                usage_locations: [...prev.usage_locations, option.value]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                usage_locations: prev.usage_locations.filter(loc => loc !== option.value)
                              }));
                            }
                          }}
                          disabled={modalMode === 'view'}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {modalMode === 'edit' && (
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                )}

                {/* Display current image details in view mode */}
                {modalMode === 'view' && currentImage && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File Size:</span>
                      <span className="ml-2">{currentImage.file_size ? formatFileSize(currentImage.file_size) : 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Dimensions:</span>
                      <span className="ml-2">{currentImage.width}x{currentImage.height}</span>
                    </div>
                    <div>
                      <span className="font-medium">File Type:</span>
                      <span className="ml-2">{currentImage.file_type}</span>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{new Date(currentImage.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${currentImage.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {currentImage.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Protected:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${currentImage.is_protected ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {currentImage.is_protected ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {modalMode !== 'view' && (
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel









                    
                  </button>
                  <button
                    onClick={modalMode === 'create' ? createImage : updateImage}
                    disabled={loading || !formData.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {modalMode === 'create' ? 'Upload' : 'Update'}
                  </button>
                </div>
              )}

              {/* View Mode Actions */}
              {modalMode === 'view' && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="flex gap-2">
                    <a
                      href={currentImage?.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <button
                      onClick={() => toggleProtection(currentImage.id, currentImage.is_protected)}
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                        currentImage.is_protected 
                          ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100' 
                          : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {currentImage.is_protected ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                      {currentImage.is_protected ? 'Unprotect' : 'Protect'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalMode('edit')}
                      className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
            </div>
            
            <p className="text-gray-700 mb-6">{confirmMessage}</p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Images</p>
              <p className="text-xl font-semibold">{images.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-xl font-semibold">{images.filter(img => img.is_active).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Protected</p>
              <p className="text-xl font-semibold">{images.filter(img => img.is_protected).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-xl font-semibold">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Location Quick Access */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Access by Usage Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usageLocationOptions.map(location => {
            const locationImages = images.filter(img => {
              const usageLocations = JSON.parse(img.usage_locations || '[]');
              return usageLocations.includes(location.value);
            });
            
            return (
              <div key={location.value} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{location.label}</h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {locationImages.length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{location.description}</p>
                
                {locationImages.length > 0 ? (
                  <div className="flex -space-x-2 overflow-hidden">
                    {locationImages.slice(0, 4).map((img, index) => (
                      <img
                        key={img.id}
                        src={img.image_url}
                        alt={img.alt_text}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover cursor-pointer hover:z-10 hover:scale-110 transition-transform"
                        onClick={() => openModal('view', img)}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/32/32';
                        }}
                      />
                    ))}
                    {locationImages.length > 4 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-600">+{locationImages.length - 4}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        usage_locations: [location.value] 
                      }));
                      openModal('create');
                    }}
                    className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Image
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GalleryManager;
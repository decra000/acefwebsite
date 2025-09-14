import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, AlertCircle, CheckCircle, Star, Search, Filter, Grid, List, Calendar, Clock, Video, Tags, Settings, Globe } from 'lucide-react';

// useCountries hook (inline for artifact)
const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/countries`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid response format");
        setCountries(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  return { countries, loading, error };
};

const AdminManageVideos = () => {
  const [videoSections, setVideoSections] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Countries hook
  const { countries, loading: countriesLoading, error: countriesError } = useCountries();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const [formData, setFormData] = useState({
    tag: '',
    country_id: '',
    title: '',
    description: '',
    youtube_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchVideoSections();
    fetchTagOptions();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchVideoSections = async () => {
    try {
      console.log('Fetching video sections from:', `${API_URL}/video-sections/admin`);
      const response = await fetch(`${API_URL}/video-sections/admin`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Video sections response:', data);
      
      if (data.success) {
        setVideoSections(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch video sections');
      }
    } catch (err) {
      console.error('Error fetching video sections:', err);
      setError(`Failed to fetch video sections: ${err.message}`);
    }
  };

  const fetchTagOptions = async () => {
    try {
      console.log('Fetching tag options from:', `${API_URL}/video-sections/tags/options`);
      const response = await fetch(`${API_URL}/video-sections/tags/options`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Tag options response:', data);
      
      if (data.success) {
        setTagOptions(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch tag options');
      }
    } catch (err) {
      console.error('Error fetching tag options:', err);
      setError(`Failed to fetch tag options: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setSubmitLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const url = editingId 
        ? `${API_URL}/video-sections/${editingId}`
        : `${API_URL}/video-sections`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      // Prepare data with country_id as null if empty
      const submitData = {
        ...formData,
        country_id: formData.country_id || null
      };
      
      console.log(`${method} request to:`, url, 'with data:', submitData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Submit response:', data);
      
      if (data.success) {
        await fetchVideoSections();
        resetForm();
        setSuccess(editingId ? 'Video section updated successfully!' : 'Video section created successfully!');
      } else {
        setError(data.message || 'Failed to save video section');
      }
    } catch (err) {
      console.error('Error saving video section:', err);
      setError(`Failed to save video section: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (video) => {
    setEditingId(video.id);
    setFormData({
      tag: video.tag,
      country_id: video.country_id || '',
      title: video.title,
      description: video.description,
      youtube_url: video.youtube_url,
      is_active: video.is_active
    });
    setShowAddForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video section? This action cannot be undone.')) {
      return;
    }
    
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_URL}/video-sections/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchVideoSections();
        setSuccess('Video section deleted successfully!');
      } else {
        setError(data.message || 'Failed to delete video section');
      }
    } catch (err) {
      console.error('Error deleting video section:', err);
      setError(`Failed to delete video section: ${err.message}`);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_URL}/video-sections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchVideoSections();
        setSuccess(`Video section ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(`Failed to update status: ${err.message}`);
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    setError(null);
    setSuccess(null);
    
    try {
      const endpoint = currentStatus ? 'unfeature' : 'feature';
      const response = await fetch(`${API_URL}/video-sections/${id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchVideoSections();
        setSuccess(currentStatus ? 'Video unfeatured successfully!' : 'Video featured successfully!');
      } else {
        setError(data.message || 'Failed to update featured status');
      }
    } catch (err) {
      console.error('Error updating featured status:', err);
      setError(`Failed to update featured status: ${err.message}`);
    }
  };

  const addNewTag = async () => {
    if (!newTag.trim()) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Adding new tag:', newTag.trim(), 'to URL:', `${API_URL}/video-sections/tags/options`);
      
      const response = await fetch(`${API_URL}/video-sections/tags/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag_name: newTag.trim() }),
      });

      console.log('Add tag response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Add tag error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Add tag response data:', data);
      
      if (data.success) {
        await fetchTagOptions();
        setNewTag('');
        setShowAddTag(false);
        setSuccess('Tag option added successfully!');
      } else {
        setError(data.message || 'Failed to add tag option');
      }
    } catch (err) {
      console.error('Error adding tag option:', err);
      setError(`Failed to add tag option: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      tag: '',
      country_id: '',
      title: '',
      description: '',
      youtube_url: '',
      is_active: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setSelectedCountry('');
    setStatusFilter('');
    setFeaturedFilter('');
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const isFormValid = () => {
    return formData.tag && formData.title && formData.description && formData.youtube_url;
  };

  const isValidYouTubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return regex.test(url) && extractVideoId(url);
  };

  // Get country name by ID
  const getCountryName = (countryId) => {
    if (!countryId) return 'General';
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : 'Unknown';
  };

  // Filter and search logic
  const filteredVideos = videoSections.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tag.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || video.tag === selectedTag;
    const matchesCountry = !selectedCountry || 
                          (selectedCountry === 'general' && !video.country_id) ||
                          (selectedCountry !== 'general' && video.country_id === parseInt(selectedCountry));
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && video.is_active) ||
                         (statusFilter === 'inactive' && !video.is_active);
    const matchesFeatured = !featuredFilter || 
                           (featuredFilter === 'featured' && video.is_featured) ||
                           (featuredFilter === 'not-featured' && !video.is_featured);
    
    return matchesSearch && matchesTag && matchesCountry && matchesStatus && matchesFeatured;
  });

  // Sort videos to show featured first
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Statistics
  const stats = {
    total: videoSections.length,
    active: videoSections.filter(v => v.is_active).length,
    inactive: videoSections.filter(v => !v.is_active).length,
    featured: videoSections.filter(v => v.is_featured).length
  };

  if (loading || countriesLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading video management...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Admin Header */}
      <div style={styles.adminHeader}>
        <div style={styles.adminHeaderContent}>
          <div style={styles.adminTitle}>
            <Video size={32} style={styles.adminIcon} />
            <div>
              <h1 style={styles.mainTitle}>Video Content Manager</h1>
              <p style={styles.adminSubtitle}>Manage and organize video content across your platform</p>
            </div>
          </div>
          <div style={styles.adminStats}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.total}</div>
              <div style={styles.statLabel}>Total Videos</div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statNumber, color: '#10b981'}}>{stats.active}</div>
              <div style={styles.statLabel}>Active</div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statNumber, color: '#f59e0b'}}>{stats.featured}</div>
              <div style={styles.statLabel}>Featured</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Control Panel */}
        <div style={styles.controlPanel}>
          <div style={styles.controlLeft}>
            <div style={styles.searchContainer}>
              <Search size={20} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search videos by title, description, or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.filterContainer}>
              <div style={styles.filterGroup}>
                <Tags size={16} style={styles.filterIcon} />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Tags</option>
                  {tagOptions.map(option => (
                    <option key={option.id} value={option.tag_name}>
                      {option.tag_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.filterGroup}>
                <Globe size={16} style={styles.filterIcon} />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Countries</option>
                  <option value="general">General</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.filterGroup}>
                <Eye size={16} style={styles.filterIcon} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div style={styles.filterGroup}>
                <Star size={16} style={styles.filterIcon} />
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Videos</option>
                  <option value="featured">Featured</option>
                  <option value="not-featured">Not Featured</option>
                </select>
              </div>
              
              {(searchTerm || selectedTag || selectedCountry || statusFilter || featuredFilter) && (
                <button
                  onClick={clearFilters}
                  style={styles.clearFiltersButton}
                  title="Clear all filters"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div style={styles.controlRight}>
            <div style={styles.viewControls}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'list' ? styles.activeViewButton : {})
                }}
                title="List view"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('card')}
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'card' ? styles.activeViewButton : {})
                }}
                title="Card view"
              >
                <Grid size={18} />
              </button>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              style={styles.primaryButton}
            >
              <Plus size={20} />
              Add Video
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div style={styles.successMessage}>
            <CheckCircle size={20} />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} style={styles.messageClose}>
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={styles.messageClose}>
              <X size={16} />
            </button>
          </div>
        )}

        {countriesError && (
          <div style={styles.errorMessage}>
            <AlertCircle size={20} />
            <span>Failed to load countries: {countriesError}</span>
          </div>
        )}

        {/* Results Info */}
        <div style={styles.resultsInfo}>
          <span style={styles.resultsText}>
            Showing {sortedVideos.length} of {videoSections.length} videos
          </span>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>
                <Settings size={20} />
                {editingId ? 'Edit Video Section' : 'Add New Video Section'}
              </h3>
              <button onClick={resetForm} style={styles.formClose}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.formContent}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category *</label>
                  <div style={styles.tagInputContainer}>
                    <select
                      value={formData.tag}
                      onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                      style={styles.select}
                      required
                    >
                      <option value="">Select category</option>
                      {tagOptions.map(option => (
                        <option key={option.id} value={option.tag_name}>
                          {option.tag_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddTag(true)}
                      style={styles.addTagButton}
                      title="Add new category"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Globe size={16} />
                    Target Country
                  </label>
                  <select
                    value={formData.country_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, country_id: e.target.value }))}
                    style={styles.select}
                  >
                    <option value="">General (All Countries)</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div style={styles.fieldNote}>
                    Leave blank or select "General" to show this video to all countries
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    style={styles.select}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Video Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  style={styles.input}
                  placeholder="Enter a descriptive title for the video"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  style={{...styles.input, ...styles.textarea}}
                  placeholder="Provide a detailed description of the video content"
                  required
                />
                <div style={styles.charCount}>
                  {formData.description.length}/500 characters
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  YouTube Embed URL *
                  <span style={styles.labelNote}>(Must be embed format, not watch URL)</span>
                </label>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  style={{
                    ...styles.input,
                    ...(formData.youtube_url && !isValidYouTubeUrl(formData.youtube_url) ? styles.inputError : {})
                  }}
                  required
                />
                {formData.youtube_url && !isValidYouTubeUrl(formData.youtube_url) && (
                  <div style={styles.validationError}>
                    <AlertCircle size={16} />
                    Please enter a valid YouTube URL
                  </div>
                )}
                
                {formData.youtube_url && extractVideoId(formData.youtube_url) && (
                  <div style={styles.previewContainer}>
                    <div style={styles.previewHeader}>
                      <span style={styles.previewLabel}>Video Preview</span>
                      <span style={styles.previewNote}>Preview how it will appear</span>
                    </div>
                    <iframe
                      src={`https://www.youtube.com/embed/${extractVideoId(formData.youtube_url)}`}
                      style={styles.previewIframe}
                      allowFullScreen
                      title="Video preview"
                    />
                  </div>
                )}
              </div>

              <div style={styles.formActions}>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || submitLoading}
                  style={{
                    ...styles.submitButton,
                    ...((!isFormValid() || submitLoading) ? styles.disabledButton : {})
                  }}
                >
                  {submitLoading ? (
                    <>
                      <div style={styles.miniSpinner}></div>
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingId ? 'Update Video' : 'Create Video'}
                    </>
                  )}
                </button>
                <button
                  onClick={resetForm}
                  style={styles.secondaryButton}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Tag Modal */}
        {showAddTag && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Add New Category</h3>
                <button onClick={() => { setShowAddTag(false); setNewTag(''); }} style={styles.modalClose}>
                  <X size={20} />
                </button>
              </div>
              <div style={styles.modalContent}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter category name (e.g., Tutorials, Reviews)"
                  style={styles.input}
                  onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
                  autoFocus
                />
              </div>
              <div style={styles.modalActions}>
                <button
                  onClick={addNewTag}
                  disabled={!newTag.trim()}
                  style={{
                    ...styles.submitButton,
                    ...(!newTag.trim() ? styles.disabledButton : {})
                  }}
                >
                  Add Category
                </button>
                <button
                  onClick={() => { setShowAddTag(false); setNewTag(''); }}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Content */}
        <div style={styles.contentArea}>
          {sortedVideos.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                {videoSections.length === 0 ? <Video size={48} /> : <Search size={48} />}
              </div>
              <h3 style={styles.emptyTitle}>
                {videoSections.length === 0 ? 'No videos yet' : 'No matching videos'}
              </h3>
              <p style={styles.emptySubtitle}>
                {videoSections.length === 0 
                  ? 'Get started by adding your first video content' 
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {videoSections.length === 0 ? (
                <button onClick={() => setShowAddForm(true)} style={styles.primaryButton}>
                  <Plus size={20} />
                  Add Your First Video
                </button>
              ) : (
                <button onClick={clearFilters} style={styles.secondaryButton}>
                  Clear All Filters
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            /* Enhanced List View */
            <div style={styles.listView}>
              <div style={styles.listHeader}>
                <div style={styles.listHeaderCell}>Video</div>
                <div style={styles.listHeaderCell}>Category</div>
                <div style={styles.listHeaderCell}>Country</div>
                <div style={styles.listHeaderCell}>Status</div>
                <div style={styles.listHeaderCell}>Created</div>
                <div style={styles.listHeaderCell}>Actions</div>
              </div>
              {sortedVideos.map((video) => (
                <div key={video.id} style={styles.listItem}>
                  <div style={styles.listCell}>
                    <div style={styles.videoListInfo}>
                      <div style={styles.videoThumbnail}>
                        {extractVideoId(video.youtube_url) ? (
                          <img
                            src={`https://img.youtube.com/vi/${extractVideoId(video.youtube_url)}/mqdefault.jpg`}
                            alt={video.title}
                            style={styles.thumbnailImage}
                          />
                        ) : (
                          <div style={styles.noThumbnail}>
                            <Video size={24} />
                          </div>
                        )}
                      </div>
                      <div style={styles.videoDetails}>
                        <h4 style={styles.videoListTitle}>
                          {video.is_featured && <Star size={14} style={styles.featuredStar} />}
                          {video.title}
                        </h4>
                        <p style={styles.videoListDescription}>
                          {video.description.length > 80 
                            ? `${video.description.substring(0, 80)}...` 
                            : video.description
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={styles.listCell}>
                    <span style={styles.categoryBadge}>{video.tag}</span>
                  </div>
                  <div style={styles.listCell}>
                    <span style={styles.countryBadge}>
                      <Globe size={12} />
                      {getCountryName(video.country_id)}
                    </span>
                  </div>
                  <div style={styles.listCell}>
                    <div style={styles.statusColumn}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(video.is_active ? styles.statusActive : styles.statusInactive)
                      }}>
                        {video.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {video.is_featured && (
                        <span style={styles.featuredBadge}>Featured</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.listCell}>
                    <div style={styles.dateInfo}>
                      <Clock size={14} style={styles.dateIcon} />
                      <span style={styles.dateText}>
                        {new Date(video.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: new Date(video.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        })}
                      </span>
                    </div>
                  </div>
                  <div style={styles.listCell}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => toggleFeatured(video.id, video.is_featured)}
                        style={{
                          ...styles.actionButton,
                          ...(video.is_featured ? styles.actionFeatured : styles.actionNormal)
                        }}
                        title={video.is_featured ? 'Remove from featured' : 'Set as featured'}
                      >
                        <Star size={16} />
                      </button>
                      <button
                        onClick={() => toggleActive(video.id, video.is_active)}
                        style={{
                          ...styles.actionButton,
                          ...(video.is_active ? styles.actionActive : styles.actionInactive)
                        }}
                        title={video.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {video.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => handleEdit(video)}
                        style={{...styles.actionButton, ...styles.actionEdit}}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        style={{...styles.actionButton, ...styles.actionDelete}}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Enhanced Card View */
            <div style={styles.cardGrid}>
              {sortedVideos.map((video) => (
                <div key={video.id} style={{
                  ...styles.videoCard,
                  ...(video.is_featured ? styles.featuredCard : {})
                }}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardBadges}>
                      <span style={styles.categoryBadge}>{video.tag}</span>
                      <span style={styles.countryBadge}>
                        <Globe size={12} />
                        {getCountryName(video.country_id)}
                      </span>
                      {video.is_featured && (
                        <span style={styles.featuredBadge}>
                          <Star size={12} />
                          Featured
                        </span>
                      )}
                      <span style={{
                        ...styles.statusBadge,
                        ...(video.is_active ? styles.statusActive : styles.statusInactive)
                      }}>
                        {video.is_active ? 'Live' : 'Draft'}
                      </span>
                    </div>
                    
                    <div style={styles.cardActions}>
                      <button
                        onClick={() => toggleFeatured(video.id, video.is_featured)}
                        style={{
                          ...styles.actionButton,
                          ...(video.is_featured ? styles.actionFeatured : styles.actionNormal)
                        }}
                        title={video.is_featured ? 'Remove from featured' : 'Set as featured'}
                      >
                        <Star size={16} />
                      </button>
                      <button
                        onClick={() => toggleActive(video.id, video.is_active)}
                        style={{
                          ...styles.actionButton,
                          ...(video.is_active ? styles.actionActive : styles.actionInactive)
                        }}
                        title={video.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {video.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => handleEdit(video)}
                        style={{...styles.actionButton, ...styles.actionEdit}}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        style={{...styles.actionButton, ...styles.actionDelete}}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>{video.title}</h3>
                    <p style={styles.cardDescription}>{video.description}</p>
                    
                    <div style={styles.cardMeta}>
                      <div style={styles.metaItem}>
                        <Calendar size={14} style={styles.metaIcon} />
                        <span>Created {new Date(video.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: new Date(video.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        })}</span>
                      </div>
                      {video.updated_at !== video.created_at && (
                        <div style={styles.metaItem}>
                          <Clock size={14} style={styles.metaIcon} />
                          <span>Updated {new Date(video.updated_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Preview */}
                  {extractVideoId(video.youtube_url) && (
                    <div style={styles.cardPreview}>
                      <div style={styles.previewHeader}>
                        <span style={styles.previewLabel}>Preview</span>
                        <a
                          href={video.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.youtubeLink}
                        >
                          View on YouTube →
                        </a>
                      </div>
                      <iframe
                        src={`https://www.youtube.com/embed/${extractVideoId(video.youtube_url)}`}
                        style={styles.cardIframe}
                        allowFullScreen
                        title={video.title}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  
  // Loading States
  loadingContainer: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  miniSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '16px',
    fontWeight: '500'
  },

  // Admin Header
  adminHeader: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  adminHeaderContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  adminTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  adminIcon: {
    color: '#3b82f6'
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0',
    lineHeight: '1.1'
  },
  adminSubtitle: {
    color: '#64748b',
    margin: '0',
    fontSize: '16px',
    fontWeight: '400'
  },
  adminStats: {
    display: 'flex',
    gap: '24px'
  },
  statCard: {
    textAlign: 'center',
    minWidth: '80px'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '4px'
  },

  // Main Content
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px'
  },

  // Control Panel
  controlPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  controlLeft: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: '1'
  },
  controlRight: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },

  // Search
  searchContainer: {
    position: 'relative',
    minWidth: '320px'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },

  // Filters
  filterContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  filterIcon: {
    color: '#64748b'
  },
  filterSelect: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: '#374151',
    outline: 'none',
    cursor: 'pointer'
  },
  clearFiltersButton: {
    padding: '8px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  },

  // View Controls
  viewControls: {
    display: 'flex',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  viewButton: {
    padding: '10px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },
  activeViewButton: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  // Messages
  successMessage: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #bbf7d0',
    color: '#065f46',
    padding: '16px 20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '16px 20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  messageClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },

  // Results Info
  resultsInfo: {
    marginBottom: '20px'
  },
  resultsText: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500'
  },

  // Form
  formCard: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0 24px'
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  formClose: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  },
  formContent: {
    padding: '24px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  labelNote: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '400'
  },
  fieldNote: {
    fontSize: '12px',
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: '4px'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },
  textarea: {
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit'
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    cursor: 'pointer'
  },
  tagInputContainer: {
    display: 'flex',
    gap: '8px'
  },
  addTagButton: {
    padding: '12px',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#3b82f6',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  charCount: {
    fontSize: '12px',
    color: '#64748b',
    textAlign: 'right'
  },
  validationError: {
    color: '#ef4444',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px'
  },
  previewContainer: {
    marginTop: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  previewHeader: {
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0'
  },
  previewLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  previewNote: {
    fontSize: '12px',
    color: '#64748b'
  },
  previewIframe: {
    width: '100%',
    height: '240px',
    border: 'none'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  },
  submitButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    color: '#9ca3af',
    cursor: 'not-allowed'
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '420px',
    maxWidth: '90vw',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0 24px'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
    color: '#0f172a'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px'
  },
  modalContent: {
    padding: '20px 24px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    padding: '0 24px 24px 24px'
  },

  // Content Area
  contentArea: {
    minHeight: '400px'
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  emptyIcon: {
    color: '#94a3b8',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 8px 0'
  },
  emptySubtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: '0 0 24px 0',
    lineHeight: '1.5'
  },

  // List View
  listView: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 120px 100px 120px 120px 140px',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  listHeaderCell: {
    display: 'flex',
    alignItems: 'center'
  },
  listItem: {
    display: 'grid',
    gridTemplateColumns: '2fr 120px 100px 120px 120px 140px',
    gap: '16px',
    padding: '20px',
    borderBottom: '1px solid #f1f5f9',
    transition: 'all 0.2s ease'
  },
  listCell: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px'
  },

  // Video List Info
  videoListInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    width: '100%'
  },
  videoThumbnail: {
    width: '80px',
    height: '45px',
    borderRadius: '6px',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#f1f5f9'
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noThumbnail: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8'
  },
  videoDetails: {
    flex: '1',
    minWidth: 0
  },
  videoListTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    lineHeight: '1.3'
  },
  featuredStar: {
    color: '#f59e0b',
    flexShrink: 0
  },
  videoListDescription: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.4',
    margin: '0'
  },

  // Badges and Status
  categoryBadge: {
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '12px',
    borderRadius: '6px',
    fontWeight: '500'
  },
  countryBadge: {
    padding: '4px 8px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    fontSize: '12px',
    borderRadius: '6px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  statusColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statusBadge: {
    padding: '4px 8px',
    fontSize: '12px',
    borderRadius: '6px',
    fontWeight: '500',
    textAlign: 'center'
  },
  statusActive: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  featuredBadge: {
    padding: '3px 6px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: '10px',
    borderRadius: '4px',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  // Date Info
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    fontSize: '13px'
  },
  dateIcon: {
    color: '#94a3b8'
  },
  dateText: {
    fontWeight: '500'
  },

  // Action Buttons
  actionButtons: {
    display: 'flex',
    gap: '6px'
  },
  actionButton: {
    padding: '8px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionFeatured: {
    color: '#f59e0b',
    backgroundColor: '#fef3c7'
  },
  actionNormal: {
    color: '#9ca3af',
    backgroundColor: '#f1f5f9'
  },
  actionActive: {
    color: '#10b981',
    backgroundColor: '#ecfdf5'
  },
  actionInactive: {
    color: '#6b7280',
    backgroundColor: '#f3f4f6'
  },
  actionEdit: {
    color: '#3b82f6',
    backgroundColor: '#dbeafe'
  },
  actionDelete: {
    color: '#ef4444',
    backgroundColor: '#fee2e2'
  },

  // Card View
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px'
  },
  videoCard: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  featuredCard: {
    border: '2px solid #fbbf24',
    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.1)'
  },
  cardHeader: {
    padding: '20px 20px 16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  cardBadges: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-start'
  },
  cardActions: {
    display: 'flex',
    gap: '6px'
  },
  cardContent: {
    padding: '0 20px 16px 20px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 8px 0',
    lineHeight: '1.3'
  },
  cardDescription: {
    color: '#64748b',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
    fontSize: '14px'
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#64748b'
  },
  metaIcon: {
    color: '#94a3b8'
  },
  cardPreview: {
    borderTop: '1px solid #f1f5f9'
  },
  cardIframe: {
    width: '100%',
    height: '225px',
    border: 'none'
  },
transition: 'color 0.2s ease',



  
  mainCard: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  subtitle: {
    color: '#64748b',
    margin: '0',
    fontSize: '16px'
  },
  addButton: {
    backgroundColor: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  successMessage: {
    margin: '24px',
    padding: '16px',
    backgroundColor: '#dcfce7',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#166534'
  },
  errorMessage: {
    margin: '24px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#dc2626',
    position: 'relative'
  },
  dismissButton: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    padding: '4px'
  },
  formContainer: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 24px 0'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
    outline: 'none'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  textarea: {
    resize: 'vertical',
    minHeight: '100px'
  },
  select: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: 'white',
    outline: 'none'
  },
  tagInputContainer: {
    display: 'flex',
    gap: '8px'
  },
  addTagButton: {
    padding: '12px',
    border: '1px solid #22c55e',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#22c55e',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  validationError: {
    color: '#ef4444',
    fontSize: '14px',
    margin: '4px 0 0 0'
  },
  previewContainer: {
    marginTop: '12px',
    padding: '16px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px'
  },
  previewLabel: {
    fontSize: '14px',
    color: '#1e40af',
    margin: '0 0 8px 0',
    fontWeight: '500'
  },
  previewIframe: {
    width: '100%',
    height: '200px',
    borderRadius: '8px',
    border: 'none'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  submitButton: {
    backgroundColor: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    color: '#9ca3af',
    cursor: 'not-allowed'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    width: '400px',
    maxWidth: '90vw'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: '#1e293b'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },
  videoList: {
    padding: '24px'
  },
  listTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '18px',
    color: '#64748b',
    margin: '0 0 8px 0'
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: '0'
  },
  videoCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    backgroundColor: 'white',
    transition: 'all 0.2s ease'
  },
  featuredCard: {
    border: '2px solid #fbbf24',
    backgroundColor: '#fffbeb',
    boxShadow: '0 4px 6px rgba(251, 191, 36, 0.1)'
  },
  videoCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '16px'
  },
  videoInfo: {
    flex: 1
  },
  videoBadges: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  tagBadge: {
    padding: '6px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontSize: '12px',
    borderRadius: '20px',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '20px',
    fontWeight: '500'
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  inactiveBadge: {
    backgroundColor: '#fef2f2',
    color: '#dc2626'
  },
  featuredBadge: {
    padding: '6px 12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: '12px',
    borderRadius: '20px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  videoTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 8px 0',
    lineHeight: '1.3'
  },
  videoDescription: {
    color: '#64748b',
    lineHeight: '1.5',
    margin: '0 0 12px 0'
  },
  videoMeta: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  videoActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0
  },
  actionButton: {
    padding: '8px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featuredActionButton: {
    color: '#f59e0b',
    backgroundColor: '#fef3c7'
  },
  unfeaturedActionButton: {
    color: '#9ca3af',
    backgroundColor: '#f1f5f9'
  },
  activeActionButton: {
    color: '#22c55e',
    backgroundColor: '#dcfce7'
  },
  inactiveActionButton: {
    color: '#9ca3af',
    backgroundColor: '#f1f5f9'
  },
  editButton: {
    color: '#3b82f6',
    backgroundColor: '#dbeafe'
  },
  deleteButton: {
    color: '#ef4444',
    backgroundColor: '#fef2f2'
  },
  videoPreview: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  videoPreviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  previewTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1e293b',
    margin: '0'
  },
  youtubeLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px'
  },
  videoIframe: {
    width: '100%',
    height: '300px',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }

};

export default AdminManageVideos;
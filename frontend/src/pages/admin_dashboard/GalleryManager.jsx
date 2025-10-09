import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Shield, 
  Globe, 
  Home, 
  TrendingUp, 
  MapPin, 
  Users, 
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { API_URL, STATIC_URL } from '../../config';

const API_BASE = API_URL;

const PROTECTED_SECTIONS = {
  home_hero_slides: {
    label: 'Home Hero Slides',
    description: 'Main carousel images on homepage',
    maxImages: 4,
    requiredDimensions: '1920x1080',
    icon: Home
  },
  impact_hero: {
    label: 'Impact Hero Background',
    description: 'Background image for Impact page',
    maxImages: 1,
    requiredDimensions: '1920x1080',
    icon: TrendingUp
  },
  country_images: {
    label: 'Country-Specific Images',
    description: 'Hero images for country pages',
    maxImages: 3,
    requiredDimensions: '1920x1080',
    requiresCountry: true,
    icon: MapPin
  },
  get_involved_dark: {
    label: 'Get Involved (Dark Mode)',
    description: 'Background for Get Involved page in dark mode',
    maxImages: 1,
    requiredDimensions: '1920x1080',
    icon: Users
  },
  get_involved_light: {
    label: 'Get Involved (Light Mode)',
    description: 'Background for Get Involved page in light mode',
    maxImages: 1,
    requiredDimensions: '1920x1080',
    icon: Users
  },
    home_about: {
    label: 'Home About Section',
    description: 'Second Section of homepage',
    maxImages: 1,
    requiredDimensions: '1920x1080',
    icon: Users
  },
    volunteer_banner: {
    label: 'Volunteer Banner Image',
    description: 'Volunteer Banner',
    maxImages: 1,
    requiredDimensions: '1920x1080',
    icon: Users
  }

};

const GalleryManager = () => {
  const { user } = useAuth();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt_text: '',
    category: '',
    country_name: '',
    is_active: true,
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const handleApiError = async (response, operation) => {
    let errorMessage = `Failed to ${operation}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = `${operation} failed (Status: ${response.status})`;
    }
    return errorMessage;
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/gallery/categories`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/countries`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const countryList = Array.isArray(data) ? data : data.data || [];
        setCountries(countryList);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  }, []);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const endpoint = currentTab === 0 ? '/gallery/protected' : '/gallery/unprotected';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'fetch images');
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setImages(data.data || []);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTab]);

  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, [fetchCategories, fetchCountries]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchImages();
    }
  }, [fetchImages, categories.length]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      alt_text: '',
      category: '',
      country_name: '',
      is_active: true,
      image: null
    });
    setImagePreview(null);
    setEditingImage(null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      if (file.size > 15 * 1024 * 1024) {
        setError('Image file size must be less than 15MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async () => {
  setError('');
  setSuccess('');
  
  if (!formData.title?.trim()) {
    setError('Title is required');
    return;
  }
  
  if (!formData.category) {
    setError('Category is required');
    return;
  }
  
  if (currentTab === 1 && !editingImage && !formData.image) {
    setError('Image is required for new uploads');
    return;
  }
  
  if (currentTab === 0 && formData.category === 'country_images' && !formData.country_name) {
    setError('Country is required for country-specific images');
    return;
  }
  
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title.trim());
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('alt_text', formData.alt_text || formData.title.trim());
    formDataToSend.append('category', formData.category);
    
    if (formData.country_name) {
      formDataToSend.append('country_name', formData.country_name);
    }
    
    if (currentTab === 1) {
      formDataToSend.append('is_active', formData.is_active);
    }
    
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
    
    const endpoint = currentTab === 0 ? '/gallery/protected' : '/gallery/unprotected';
    
    let url, method;
    
    if (editingImage) {
      // Always PUT when editing existing image
      url = `${API_BASE}${endpoint}/${editingImage.id}`;
      method = 'PUT';
    } else if (currentTab === 0) {
      // Protected sections always use PUT - find the placeholder to update
      if (formData.category === 'country_images') {
        // First, refresh the images to get any newly created placeholders
        await fetchImages();
        
        // Find existing placeholder for this country
        const existingImages = getImagesBySection('country_images');
        const countryPlaceholder = existingImages.find(img => img.country_name === formData.country_name);
        
        if (!countryPlaceholder) {
          // Try to sync placeholders and refetch
          try {
            await fetch(`${API_BASE}/gallery/sync-country-placeholders`, {
              method: 'POST',
              credentials: 'include'
            });
            await fetchImages();
            
            // Try again to find the placeholder
            const refreshedImages = getImagesBySection('country_images');
            const newPlaceholder = refreshedImages.find(img => img.country_name === formData.country_name);
            
            if (!newPlaceholder) {
              setError(`Unable to create country placeholder for ${formData.country_name}. Please try again or contact administrator.`);
              return;
            }
            
            url = `${API_BASE}${endpoint}/${newPlaceholder.id}`;
          } catch (syncError) {
            setError(`Failed to create country placeholder: ${syncError.message}`);
            return;
          }
        } else {
          url = `${API_BASE}${endpoint}/${countryPlaceholder.id}`;
        }
        method = 'PUT';
      } else {
        // Find existing placeholder for this protected section
        const existingImages = getImagesBySection(formData.category);
        
        if (existingImages.length === 0) {
          setError(`Protected section placeholder for ${formData.category} not found. Please contact administrator to set up the placeholder.`);
          return;
        }
        
        // Update the first placeholder (or implement logic to select which one)
        url = `${API_BASE}${endpoint}/${existingImages[0].id}`;
        method = 'PUT';
      }
    } else {
      // Unprotected gallery - always POST for new images
      url = `${API_BASE}${endpoint}`;
      method = 'POST';
    }
    
    const response = await fetch(url, {
      method,
      credentials: 'include',
      body: formDataToSend
    });
    
    if (!response.ok) {
      const errorMessage = await handleApiError(response, currentTab === 0 ? 'update protected image' : (editingImage ? 'update image' : 'create image'));
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    setSuccess(result.message || `Image ${currentTab === 0 || editingImage ? 'updated' : 'created'} successfully!`);
    
    setDialogOpen(false);
    resetForm();
    fetchImages();
    
  } catch (err) {
    console.error('Submit error:', err);
    setError(err.message);
  }
};
  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      title: image.title || '',
      description: image.description || '',
      alt_text: image.alt_text || '',
      category: image.category || '',
      country_name: image.country_name || '',
      is_active: image.is_active !== undefined ? image.is_active : true,
      image: null
    });
    
    if (image.image_url) {
      const imageUrl = image.image_url.startsWith('http') 
        ? image.image_url 
        : `${STATIC_URL}${image.image_url}`;
      setImagePreview(imageUrl);
    }
    
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;
    
    setError('');
    setSuccess('');
    
    try {
      const endpoint = currentTab === 0 ? '/gallery/protected' : '/gallery/unprotected';
      const response = await fetch(`${API_BASE}${endpoint}/${imageToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response, 'delete image');
        throw new Error(errorMessage);
      }
      
      setSuccess('Image deleted successfully!');
      setDeleteDialogOpen(false);
      setImageToDelete(null);
      fetchImages();
      
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  };

  const getImageUrl = (image) => {
    if (!image?.image_url) return '/placeholder-image.jpg';
    
    if (image.image_url.startsWith('http')) {
      return image.image_url;
    }
    
    return `${STATIC_URL}${image.image_url}`;
  };

  const getImagesBySection = (sectionKey) => {
    return images.filter(img => img.category === sectionKey);
  };

  const getImagesByCategory = (categoryName) => {
    return images.filter(img => img.category === categoryName);
  };

  const getFilteredCategories = () => {
    if (currentTab === 0) {
      return categories.filter(cat => cat.is_protected);
    }
    return categories.filter(cat => !cat.is_protected);
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const ImageCard = ({ image, showCountry = false }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative' }}>
        <img 
          src={getImageUrl(image)} 
          alt={image.alt_text || image.title}
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
            backgroundColor: '#f3f4f6'
          }}
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
        
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          display: 'flex',
          gap: '4px'
        }}>
          {showCountry && image.country_name && (
            <span style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '4px'
            }}>
              {image.country_name}
            </span>
          )}
          
          {!image.is_active && (
            <span style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#6b7280',
              color: 'white',
              borderRadius: '4px'
            }}>
              Inactive
            </span>
          )}
        </div>
      </div>
      
      <div style={{ padding: '18px' }}>
        <h4 style={{
          fontWeight: '600',
          fontSize: '14px',
          marginBottom: '4px',
          lineHeight: '1.2'
        }}>
          {image.title}
        </h4>
        
        {image.description && (
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            {image.description}
          </p>
        )}
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={() => handleEdit(image)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 12px',
              fontSize: '12px',
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <Edit3 size={12} />
            {currentTab === 0 ? 'Update' : 'Edit'}
          </button>
          
          {currentTab === 1 && (
            <button
              onClick={() => {
                setImageToDelete(image);
                setDeleteDialogOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 12px',
                fontSize: '12px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const CountryImagePlaceholders = () => {
    const countryImages = getImagesBySection('country_images');
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {countries.map((country) => {
          const existingImage = countryImages.find(img => img.country_name === country.name);
          
          return (
            <div 
              key={country.id}
              style={{
                padding: '24px',
                textAlign: 'center',
                border: '2px dashed',
                borderColor: existingImage ? '#10b981' : '#d1d5db',
                backgroundColor: existingImage ? '#ecfdf5' : '#f9fafb',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (existingImage) {
                  handleEdit(existingImage);
                } else {
                  setFormData(prev => ({ ...prev, category: 'country_images', country_name: country.name }));
                  setDialogOpen(true);
                }
              }}
            >
              {existingImage ? (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <img 
                      src={getImageUrl(existingImage)} 
                      alt={existingImage.title}
                      style={{
                        width: '100%',
                        height: '96px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#065f46',
                    marginBottom: '4px'
                  }}>
                    {country.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '8px'
                  }}>
                    {existingImage.title}
                  </p>
                  <button style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    <Edit3 size={12} />
                    Update Image
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon size={48} style={{ margin: '0 auto 12px', color: '#9ca3af' }} />
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {country.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '12px'
                  }}>
                    No image uploaded
                  </p>
                  <button style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    <Plus size={12} />
                    Add Image
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

 
  return (
    <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '16px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '30px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0
        }}>
          Gallery Manager
        </h1>
        
        <button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          disabled={loading}
        >
          <Plus size={20} />
          Add Image
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{
          marginBottom: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          marginBottom: '16px',
          backgroundColor: '#d1fae5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 16px',
          borderRadius: '4px'
        }}>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <nav style={{ display: 'flex', gap: '32px' }}>
          <button
            onClick={() => setCurrentTab(0)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 4px',
              borderBottom: currentTab === 0 ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: '500',
              fontSize: '14px',
              color: currentTab === 0 ? '#2563eb' : '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Shield size={18} />
            Protected Sections
          </button>
          
          <button
            onClick={() => setCurrentTab(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 4px',
              borderBottom: currentTab === 1 ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: '500',
              fontSize: '14px',
              color: currentTab === 1 ? '#2563eb' : '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Globe size={18} />
            Unprotected Gallery
          </button>
        </nav>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '32px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      {/* Protected Sections */}
      {currentTab === 0 && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(PROTECTED_SECTIONS).map(([sectionKey, config]) => {
            const sectionImages = getImagesBySection(sectionKey);
            const isExpanded = expandedSections[sectionKey];
            const IconComponent = config.icon;
            
            return (
              <div key={sectionKey} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <button
                  onClick={() => toggleSection(sectionKey)}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IconComponent size={20} style={{ color: '#6b7280' }} />
                    <div>
                      <h3 style={{
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0,
                        marginBottom: '4px'
                      }}>
                        {config.label}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {config.description}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {sectionImages.length}/{config.maxImages}
                    </span>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div style={{ padding: '0 24px 24px' }}>
                    {sectionKey === 'country_images' ? (
                      <CountryImagePlaceholders />
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px'
                      }}>
                        {sectionImages.map(image => (
                          <ImageCard 
                            key={image.id} 
                            image={image} 
                            showCountry={sectionKey === 'country_images'}
                          />
                        ))}
                        
                        {sectionImages.length < config.maxImages && (
                          <div 
                            style={{
                              border: '2px dashed #d1d5db',
                              borderRadius: '8px',
                              padding: '24px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              minHeight: '200px'
                            }}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category: sectionKey }));
                              setDialogOpen(true);
                            }}
                          >
                            <Plus size={48} style={{ color: '#9ca3af', marginBottom: '8px' }} />
                            <p style={{
                              fontWeight: '600',
                              color: '#6b7280',
                              margin: '0 0 4px 0'
                            }}>
                              Add Image
                            </p>
                            <p style={{
                              fontSize: '12px',
                              color: '#9ca3af',
                              margin: 0
                            }}>
                              {sectionImages.length}/{config.maxImages} used
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Unprotected Gallery */}
      {currentTab === 1 && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categories.filter(cat => !cat.is_protected).map((category) => {
            const categoryImages = getImagesByCategory(category.name);
            const isExpanded = expandedSections[category.name];
            
            return (
              <div key={category.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <button
                  onClick={() => toggleSection(category.name)}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Globe size={20} style={{ color: '#6b7280' }} />
                    <div>
                      <h3 style={{
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0,
                        marginBottom: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {category.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {categoryImages.length} images
                    </span>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div style={{ padding: '0 24px 24px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '16px'
                    }}>
                      {categoryImages.map(image => (
                        <ImageCard key={image.id} image={image} />
                      ))}
                      
                      <div 
                        style={{
                          border: '2px dashed #d1d5db',
                          borderRadius: '8px',
                          padding: '24px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '180px'
                        }}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: category.name }));
                          setDialogOpen(true);
                        }}
                      >
                        <Plus size={48} style={{ color: '#9ca3af', marginBottom: '8px' }} />
                        <p style={{
                          fontWeight: '600',
                          color: '#6b7280',
                          margin: '0 0 4px 0'
                        }}>
                          Add Image
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          margin: 0
                        }}>
                          to {category.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && images.length === 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '64px',
          padding: '32px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '2px dashed #d1d5db'
        }}>
          <h2 style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            No Images Found
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            {currentTab === 0 
              ? 'Protected images are system-managed sections that can only be updated.'
              : 'Start building your gallery by uploading your first image.'
            }
          </p>
          <button 
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            <Plus size={20} />
            {currentTab === 0 ? 'Update Protected Image' : 'Upload First Image'}
          </button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {dialogOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  {editingImage ? 'Edit Image' : 'Add New Image'}
                </h2>
                {currentTab === 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    <Shield size={12} />
                    Protected Section
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                style={{
                  color: '#9ca3af',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {/* Image Upload */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Image {editingImage ? '(Optional - leave empty to keep current)' : '*'}
                  </label>
                  
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    {imagePreview ? (
                      <div>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '240px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            marginBottom: '16px'
                          }}
                        />
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                          <Upload size={16} />
                          Change Image
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    ) : (
                      <div>
                        <Upload size={48} style={{
                          margin: '0 auto 16px',
                          color: '#9ca3af'
                        }} />
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '16px'
                        }}>
                          Click to upload or drag and drop
                        </p>
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                          <Upload size={16} />
                          Select Image
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Supported: JPEG, PNG, GIF, WebP (Max 10MB)
                  </p>
                </div>
                
                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      SubTitle
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      placeholder="For accessibility (defaults to title if empty)"
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                      required
                    >
                      <option value="">Select category</option>
                      {currentTab === 0 ? (
                        Object.entries(PROTECTED_SECTIONS).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))
                      ) : (
                        getFilteredCategories().map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name} - {cat.description}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  {(formData.category === 'country_images' || 
                    PROTECTED_SECTIONS[formData.category]?.requiresCountry) && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        Country *
                      </label>
                      <select
                        value={formData.country_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, country_name: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: 'white',
                          boxSizing: 'border-box'
                        }}
                        required
                      >
                        <option value="">Select country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {currentTab === 1 && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          is_active: e.target.checked 
                        }))}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: '#2563eb',
                          marginRight: '8px'
                        }}
                      />
                      <label htmlFor="is_active" style={{
                        fontSize: '14px',
                        color: '#111827'
                      }}>
                        Active
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <button
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.category}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: (!formData.title || !formData.category) ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (!formData.title || !formData.category) ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                <Save size={16} />
                {editingImage ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <div style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Delete Image
              </h3>
              <p style={{
                color: '#6b7280',
                marginBottom: '16px'
              }}>
                Are you sure you want to delete "{imageToDelete?.title}"? 
                This action cannot be undone.
              </p>
              {imageToDelete && (
                <div style={{
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  <img
                    src={getImageUrl(imageToDelete)}
                    alt={imageToDelete.title}
                    style={{
                      maxWidth: '200px',
                      maxHeight: '120px',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setImageToDelete(null);
                }}
                style={{
                  padding: '8px 16px',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default GalleryManager;
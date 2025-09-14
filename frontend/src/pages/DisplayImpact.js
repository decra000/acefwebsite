import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Globe, Leaf, Heart, Award, ChevronLeft, ChevronRight } from 'lucide-react';

const DisplayImpact = ({ 
  title = "Our Impact",
  subtitle = "Making a difference through measurable outcomes",
  showCategories = true,
  maxItems = 8,
  layout = "grid", // grid, carousel, featured
  className = ""
}) => {
  const [impacts, setImpacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch impacts on component mount
  useEffect(() => {
    fetchImpacts();
    if (showCategories) {
      fetchCategories();
    }
  }, []);

  const fetchImpacts = async () => {
    try {
      const endpoint = layout === 'featured' ? '/api/impacts/featured' : '/api/impacts/public';
      const url = maxItems ? `${endpoint}?limit=${maxItems}` : endpoint;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setImpacts(data.data);
      } else {
        setError('Failed to load impact data');
      }
    } catch (err) {
      setError('Unable to fetch impact statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/impacts/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchByCategory = async (category) => {
    if (!category) {
      fetchImpacts();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/impacts/category/${category}`);
      const data = await response.json();
      
      if (data.success) {
        setImpacts(data.data);
      }
    } catch (err) {
      setError('Failed to fetch category data');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    fetchByCategory(category);
    setCurrentSlide(0);
  };

  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toLocaleString();
  };

  const getIconForCategory = (category) => {
    const iconMap = {
      'environment': <Leaf className="h-6 w-6" />,
      'social': <Users className="h-6 w-6" />,
      'economic': <TrendingUp className="h-6 w-6" />,
      'education': <Award className="h-6 w-6" />,
      'health': <Heart className="h-6 w-6" />,
      'community': <Globe className="h-6 w-6" />,
    };
    return iconMap[category.toLowerCase()] || <TrendingUp className="h-6 w-6" />;
  };

  const nextSlide = () => {
    if (layout === 'carousel') {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(impacts.length / 4));
    }
  };

  const prevSlide = () => {
    if (layout === 'carousel') {
      setCurrentSlide((prev) => (prev - 1 + Math.ceil(impacts.length / 4)) % Math.ceil(impacts.length / 4));
    }
  };

  if (loading) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (impacts.length === 0) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-8">{subtitle}</p>
          <div className="bg-white rounded-lg shadow-lg p-12">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No impact statistics available at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        {/* Category Filter */}
        {showCategories && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Impact Display */}
        {layout === 'carousel' ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(impacts.length / 4) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="min-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {impacts.slice(slideIndex * 4, (slideIndex + 1) * 4).map((impact) => (
                      <ImpactCard key={impact.id} impact={impact} getIconForCategory={getIconForCategory} formatNumber={formatNumber} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Controls */}
            {Math.ceil(impacts.length / 4) > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
                
                {/* Dots Indicator */}
                <div className="flex justify-center space-x-2 mt-8">
                  {Array.from({ length: Math.ceil(impacts.length / 4) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : layout === 'featured' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.slice(0, 4).map((impact) => (
              <FeaturedImpactCard key={impact.id} impact={impact} getIconForCategory={getIconForCategory} formatNumber={formatNumber} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map((impact) => (
              <ImpactCard key={impact.id} impact={impact} getIconForCategory={getIconForCategory} formatNumber={formatNumber} />
            ))}
          </div>
        )}

        {/* View More Button */}
        {impacts.length >= maxItems && (
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              View All Impact Statistics
              <TrendingUp className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// Regular Impact Card Component
const ImpactCard = ({ impact, getIconForCategory, formatNumber }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: impact.color + '20', color: impact.color }}
        >
          {impact.icon ? (
            <span className="text-2xl">{impact.icon}</span>
          ) : (
            getIconForCategory(impact.category)
          )}
        </div>
        <span 
          className="px-3 py-1 text-xs font-medium rounded-full capitalize"
          style={{ 
            backgroundColor: impact.color + '20', 
            color: impact.color 
          }}
        >
          {impact.category}
        </span>
      </div>
      
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {formatNumber(impact.value)} {impact.unit}
        </h3>
        <h4 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
          {impact.title}
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          {impact.description}
        </p>
      </div>
    </div>
  );
};

// Featured Impact Card Component (larger, more prominent)
const FeaturedImpactCard = ({ impact, getIconForCategory, formatNumber }) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 group border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div 
          className="p-4 rounded-xl shadow-sm"
          style={{ backgroundColor: impact.color, color: 'white' }}
        >
          {impact.icon ? (
            <span className="text-3xl">{impact.icon}</span>
          ) : (
            getIconForCategory(impact.category)
          )}
        </div>
        <span 
          className="px-4 py-2 text-sm font-medium rounded-full capitalize border"
          style={{ 
            backgroundColor: 'white',
            color: impact.color,
            borderColor: impact.color + '40'
          }}
        >
          {impact.category}
        </span>
      </div>
      
      <div className="text-center mb-6">
        <h3 className="text-4xl font-bold mb-2" style={{ color: impact.color }}>
          {formatNumber(impact.value)}
        </h3>
        <span className="text-lg text-gray-500 font-medium">{impact.unit}</span>
      </div>
      
      <div>
        <h4 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors text-center">
          {impact.title}
        </h4>
        <p className="text-gray-600 leading-relaxed text-center">
          {impact.description}
        </p>
      </div>
    </div>
  );
};

export default DisplayImpact;
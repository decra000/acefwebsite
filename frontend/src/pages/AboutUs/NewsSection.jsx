// NewsLoader.js - Reusable News Loading Component
import React, { useState, useEffect } from 'react';
import { Globe, Calendar, TrendingUp, Loader, AlertCircle, ChevronRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';

const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e3f2fd'/%3E%3Ccircle cx='320' cy='60' r='35' fill='%23ffeb3b'/%3E%3Cpath d='M0 200 Q100 140 200 200 T400 200 V300 H0 Z' fill='%23a5d6a7'/%3E%3Cpath d='M0 230 Q120 170 250 230 T400 230 V300 H0 Z' fill='%238bc34a'/%3E%3Crect x='90' y='150' width='18' height='70' fill='%236d4c41'/%3E%3Ccircle cx='99' cy='140' r='40' fill='%234caf50'/%3E%3Crect x='280' y='160' width='16' height='60' fill='%236d4c41'/%3E%3Ccircle cx='288' cy='145' r='35' fill='%23389e3c'/%3E%3C/svg%3E";

const NewsLoader = ({ 
  countryCode, 
  countryName, 
  limit = 6,
  onArticleClick // Custom callback for navigation
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countryNews, setCountryNews] = useState([]);
  const [generalNews, setGeneralNews] = useState([]);
  const [hasCountryNews, setHasCountryNews] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      if (!countryCode && !countryName) {
        setError('No country information provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const identifier = countryCode || countryName;
        
        console.log(`Fetching news for: ${identifier}`);
        
        // Fetch country-specific news (without general)
        const countryResponse = await fetch(
          `${API_URL}/blogs/news/country/${encodeURIComponent(identifier)}?limit=${limit}&include_general=false`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          }
        );

        let countryData = { data: [] };
        if (countryResponse.ok) {
          countryData = await countryResponse.json();
          console.log('Country news response:', countryData);
        } else {
          console.warn('Country news fetch failed:', countryResponse.status);
        }

        const countryArticles = Array.isArray(countryData.data) ? countryData.data : [];
        
        // Fetch general news
        const generalResponse = await fetch(
          `${API_URL}/blogs/news?type=general&limit=${limit}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          }
        );

        let generalData = { data: [] };
        if (generalResponse.ok) {
          generalData = await generalResponse.json();
          console.log('General news response:', generalData);
        } else {
          console.warn('General news fetch failed:', generalResponse.status);
        }

        const generalArticles = Array.isArray(generalData.data) ? generalData.data : [];

        // Process articles
        const processedCountryNews = countryArticles
          .filter(article => article && article.id)
          .map(article => ({
            ...article,
            news_type: 'country_specific'
          }));

        const processedGeneralNews = generalArticles
          .filter(article => article && article.id)
          .map(article => ({
            ...article,
            news_type: 'general'
          }));

        setCountryNews(processedCountryNews);
        setGeneralNews(processedGeneralNews);
        setHasCountryNews(processedCountryNews.length > 0);

        console.log('News processing complete:', {
          countryNews: processedCountryNews.length,
          generalNews: processedGeneralNews.length,
          hasCountryNews: processedCountryNews.length > 0
        });

      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err.message || 'Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [countryCode, countryName, limit]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return DEFAULT_IMAGE;
    
    let cleanPath = imagePath.replace(/^\/+/, '');
    
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    }
    
    if (cleanPath.includes('uploads/blogs/')) {
      return `${STATIC_URL}/${cleanPath}`;
    } else if (cleanPath.includes('uploads/')) {
      return `${STATIC_URL}/${cleanPath}`;
    } else if (cleanPath.includes('blogs/')) {
      return `${STATIC_URL}/uploads/${cleanPath}`;
    } else {
      return `${STATIC_URL}/uploads/blogs/${cleanPath}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  const handleArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      // Default behavior: navigate to blogs page with article ID
      if (article && article.id) {
        window.location.href = `/blogs?article=${article.id}&section=news`;
      }
    }
  };

  if (loading) {
    return (
      <div className="news-loading-container">
        <Loader className="news-spinner" />
        <p className="news-loading-text">Loading news updates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-error-container">
        <AlertCircle className="news-error-icon" />
        <h3 className="news-error-title">Unable to load news</h3>
        <p className="news-error-text">{error}</p>
      </div>
    );
  }

  // Determine main news to display
  const mainNews = hasCountryNews ? countryNews : generalNews;
  const recommendedNews = hasCountryNews ? generalNews : [];

  if (mainNews.length === 0 && recommendedNews.length === 0) {
    return (
      <div className="news-empty-container">
        <Globe className="news-empty-icon" />
        <h3 className="news-empty-title">No news available</h3>
        <p className="news-empty-text">
          Check back soon for the latest updates from {countryName || 'your region'}.
        </p>
      </div>
    );
  }

  return (
    <section className="news-loader-section">
      {/* Main News Section */}
      <div className="news-section-header">
        <Globe className="news-section-icon" />
        <div>
          <h2 className="news-section-title">
            {hasCountryNews 
              ? `Latest News from ${countryName}`
              : 'Latest Climate News'
            }
          </h2>
          <p className="news-section-description">
            {hasCountryNews
              ? `Stay updated with the latest developments from ${countryName}`
              : 'Stay informed with global climate action updates'
            }
          </p>
        </div>
      </div>

      <div className="news-grid">
        {mainNews.map(article => (
          <article
            key={article.id}
            className="news-card"
            onClick={() => handleArticleClick(article)}
          >
            {article.featured_image && (
              <div className="news-image">
                <img 
                  src={getImageUrl(article.featured_image)}
                  alt={article.title}
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                    e.target.onerror = null;
                  }}
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="news-content">
              {hasCountryNews && (
                <div className="news-country-badge">
                  {countryName} News
                </div>
              )}
              
              <h3 className="news-title">{article.title}</h3>
              
              {article.excerpt && (
                <p className="news-excerpt">
                  {article.excerpt.length > 120
                    ? `${article.excerpt.substring(0, 120)}...`
                    : article.excerpt}
                </p>
              )}
              
              <div className="news-meta">
                <div className="news-date">
                  <Calendar size={14} />
                  <span>{formatDate(article.created_at || article.published_at)}</span>
                </div>
                {article.author_name && (
                  <span className="news-author">{article.author_name}</span>
                )}
                <div className="news-read-more">
                  Read More <ChevronRight size={14} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Recommended News Section */}
      {recommendedNews.length > 0 && (
        <div className="news-recommended-section">
          <div className="news-recommended-header">
            <TrendingUp className="news-recommended-icon" />
            <div>
              <h3 className="news-recommended-title">More Climate News</h3>
              <p className="news-recommended-subtitle">
                Other news and updates you might find interesting
              </p>
            </div>
          </div>

          <div className="news-recommended-grid">
            {recommendedNews.slice(0, 3).map(article => (
              <article
                key={article.id}
                className="news-recommended-card"
                onClick={() => handleArticleClick(article)}
              >
                <div className="news-recommended-content">
                  {article.featured_image && (
                    <div className="news-recommended-image">
                      <img 
                        src={getImageUrl(article.featured_image)}
                        alt={article.title}
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                          e.target.onerror = null;
                        }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  <div className="news-recommended-text">
                    <h4 className="news-recommended-card-title">{article.title}</h4>
                    {article.excerpt && (
                      <p className="news-recommended-excerpt">
                        {article.excerpt.length > 80
                          ? `${article.excerpt.substring(0, 80)}...`
                          : article.excerpt}
                      </p>
                    )}
                    <div className="news-recommended-meta">
                      <Calendar size={12} />
                      <span>{formatDate(article.created_at || article.published_at)}</span>
                      <span className="news-global-badge">Global</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .news-loader-section {
          width: 100%;
          padding: 32px 0;
        }

        .news-loading-container,
        .news-error-container,
        .news-empty-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          gap: 16px;
          text-align: center;
        }

        .news-spinner {
          width: 40px;
          height: 40px;
          color: #22c55e;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .news-loading-text {
          color: #6b7280;
          fontSize: 14px;
          margin: 0;
        }

        .news-error-icon {
          width: 48px;
          height: 48px;
          color: #ef4444;
        }

        .news-error-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .news-error-text {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .news-empty-icon {
          width: 64px;
          height: 64px;
          color: #d1d5db;
        }

        .news-empty-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .news-empty-text {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .news-section-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 32px;
        }

        .news-section-icon {
          width: 32px;
          height: 32px;
          color: #22c55e;
          flex-shrink: 0;
        }

        .news-section-title {
          font-size: 28px;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .news-section-description {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        @media (max-width: 768px) {
          .news-grid {
            grid-template-columns: 1fr;
          }
        }

        .news-card {
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .news-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .news-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background-color: #f3f4f6;
        }

        .news-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .news-content {
          padding: 20px;
        }

        .news-country-badge {
          display: inline-block;
          background-color: #dcfce7;
          color: #16a34a;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .news-title {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .news-excerpt {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .news-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
          flex-wrap: wrap;
        }

        .news-date {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .news-author {
          font-weight: 500;
        }

        .news-read-more {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #22c55e;
          font-weight: 600;
          margin-left: auto;
        }

        .news-recommended-section {
          margin-top: 48px;
        }

        .news-recommended-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        }

        .news-recommended-icon {
          width: 24px;
          height: 24px;
          color: #f59e0b;
          flex-shrink: 0;
        }

        .news-recommended-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .news-recommended-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .news-recommended-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        @media (max-width: 768px) {
          .news-recommended-grid {
            grid-template-columns: 1fr;
          }
        }

        .news-recommended-card {
          background-color: #f9fafb;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }

        .news-recommended-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .news-recommended-content {
          display: flex;
          gap: 12px;
          padding: 16px;
        }

        .news-recommended-image {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          border-radius: 8px;
          overflow: hidden;
          background-color: #e5e7eb;
        }

        .news-recommended-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .news-recommended-text {
          flex: 1;
          min-width: 0;
        }

        .news-recommended-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .news-recommended-excerpt {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
          margin: 0 0 8px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .news-recommended-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #9ca3af;
        }

        .news-global-badge {
          background-color: #dbeafe;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
        }
      `}</style>
    </section>
  );
};

export default NewsLoader;
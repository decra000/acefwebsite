import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, ArrowRight, Clock, Star, Tag, MapPin, Users, Newspaper, BookOpen, Mail, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../../theme';
import LatestEvent from '../Events/LatestEvent';
import { subscribeToNewsletter } from '../../services/newsletterService';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';

// Default placeholder image
const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e3f2fd'/%3E%3Ccircle cx='320' cy='60' r='35' fill='%23ffeb3b'/%3E%3Cpath d='M0 200 Q100 140 200 200 T400 200 V300 H0 Z' fill='%23a5d6a7'/%3E%3Cpath d='M0 230 Q120 170 250 230 T400 230 V300 H0 Z' fill='%238bc34a'/%3E%3Crect x='90' y='150' width='18' height='70' fill='%236d4c41'/%3E%3Ccircle cx='99' cy='140' r='40' fill='%234caf50'/%3E%3Crect x='280' y='160' width='16' height='60' fill='%236d4c41'/%3E%3Ccircle cx='288' cy='145' r='35' fill='%23389e3c'/%3E%3C/svg%3E";

const getImageUrl = (filename) => {
  if (!filename) return DEFAULT_IMAGE;
  
  let cleanFilename = filename;
  cleanFilename = cleanFilename.replace(/^\/+/, '');
  cleanFilename = cleanFilename.replace(/^uploads\//, '');
  cleanFilename = cleanFilename.replace(/^blogs\//, '');
  
  return `${STATIC_URL}/uploads/blogs/${cleanFilename}`;
};

// Newsletter Subscription Component - Using AcefAboutInfo design
const NewsletterSubscription = () => {
  const { colors, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubscribe = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setStatus('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    const result = await subscribeToNewsletter(email);
    setStatus(result.message);
    if (result.success) {
      setEmail('');
      // Clear success message after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    }
    setIsSubmitting(false);
  };

  const emailInputStyle = {
    flex: 1,
    padding: '1rem 1.25rem',
    border: 'none',
    fontSize: '1rem',
    outline: 'none',
    background: colors.surface,
    color: colors.text,
    borderRadius: window.innerWidth <= 768 ? '0.5rem 0.5rem 0 0' : '0',
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const buttonStyle = {
    background: isSubmitting ? colors.gray400 : colors.primary,
    color: colors.white,
    border: 'none',
    padding: '1rem 2rem',
    fontWeight: 600,
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    whiteSpace: 'nowrap',
    borderRadius: window.innerWidth <= 768 ? '0 0 0.5rem 0.5rem' : '0',
    opacity: isSubmitting ? 0.7 : 1,
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <Mail 
          size={20} 
          style={{ 
            color: colors.primary, 
            marginBottom: '8px' 
          }} 
        />
        <h4
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 4px 0',
            lineHeight: '1.3',
            fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Stay Connected
        </h4>
        <p
          style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: '0',
            lineHeight: '1.4',
            fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Get our latest news and stories delivered to your inbox
        </p>
      </div>

      <div 
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: '1rem',
          boxShadow: `0 10px 25px ${colors.cardShadow}`,
          borderRadius: '0.5rem',
          overflow: 'hidden',
          maxWidth: '100%',
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '450px',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          margin: '0 auto'
        }}
      >
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          style={{
            ...emailInputStyle,
            '::placeholder': {
              color: `${colors.textMuted} !important`
            }
          }}
        />
        <button 
          type="button"
          onClick={handleSubscribe}
          disabled={isSubmitting || !email}
          style={buttonStyle}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = `0 4px 12px ${colors.cardShadow}`;
              e.target.style.backgroundColor = colors.primaryLight || colors.primary;
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
            e.target.style.backgroundColor = isSubmitting ? colors.gray400 : colors.primary;
          }}
        >
          {isSubmitting ? 'Connecting...' : 'Stay Connected'}
        </button>
      </div>

      {/* Status Message */}
      {status && (
        <div
          style={{
            textAlign: 'center',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: status.includes('success') || status.includes('subscribed') 
              ? `${colors.success || '#10b981'}15` 
              : `${colors.error}15`,
            color: status.includes('success') || status.includes('subscribed')
              ? colors.success || '#10b981' 
              : colors.error,
            fontSize: '13px',
            fontWeight: '500',
            marginTop: '8px',
            fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

// Fallback Content Component when no events are available
const FallbackContent = ({ onArticleClick, latestNews, latestBlogs }) => {
  const { colors, isDarkMode } = useTheme();

  const handleArticleClick = useCallback((article) => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      const params = new URLSearchParams({
        article: article.id,
        section: article.is_news ? 'news' : 'blogs'
      });
      
      window.location.href = `/insights?${params.toString()}`;
    }
  }, [onArticleClick]);

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? colors.surface : colors.white,
        borderRadius: '16px',
        padding: 'clamp(20px, 3vw, 24px)',
        border: `1px solid ${colors.border}20`,
        height: 'fit-content'
      }}
    >
      <div
        style={{
          marginBottom: 'clamp(16px, 2vw, 20px)'
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            backgroundColor: `${colors.primary}15`,
            borderRadius: '12px',
            marginBottom: '8px',
            fontSize: '10px',
            fontWeight: '500',
            color: colors.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Latest Updates
        </div>
        
        <h4
          style={{
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            fontWeight: '600',
            color: colors.text,
            lineHeight: '1.3',
            marginBottom: '4px'
          }}
        >
          Stay Informed
        </h4>
        
        <p
          style={{
            color: colors.textSecondary,
            fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
            lineHeight: '1.4',
            margin: '0 0 16px 0'
          }}
        >
          Latest news and stories
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Latest News */}
        {latestNews && (
          <div
            onClick={() => handleArticleClick(latestNews)}
            style={{
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.gray50,
              border: `1px solid ${colors.border}20`,
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: isDarkMode ? colors.border : colors.gray100,
                transform: 'translateY(-1px)'
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? colors.border : colors.gray100;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? colors.backgroundSecondary : colors.gray50;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '6px'
              }}
            >
              <Newspaper size={12} style={{ color: colors.error }} />
              <span
                style={{
                  fontSize: '10px',
                  color: colors.error,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                News
              </span>
            </div>
            
            <h5
              style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                fontWeight: '600',
                color: colors.text,
                margin: '0',
                lineHeight: '1.3',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {latestNews.title}
            </h5>
          </div>
        )}

        {/* Latest Blogs */}
        {latestBlogs.map((blog, index) => (
          <div
            key={blog.id || index}
            onClick={() => handleArticleClick(blog)}
            style={{
              cursor: 'pointer',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.gray50,
              border: `1px solid ${colors.border}20`,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? colors.border : colors.gray100;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? colors.backgroundSecondary : colors.gray50;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '6px'
              }}
            >
              <BookOpen size={12} style={{ color: colors.primary }} />
              <span
                style={{
                  fontSize: '10px',
                  color: colors.primary,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Blog
              </span>
            </div>
            
            <h5
              style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                fontWeight: '600',
                color: colors.text,
                margin: '0',
                lineHeight: '1.3',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {blog.title}
            </h5>
          </div>
        ))}
      </div>
    </div>
  );
};

const LatestNewsSection = ({ 
  onArticleClick, 
  onNavigateToNews, 
  onNavigateToBlogs
}) => {
  const { colors, isDarkMode } = useTheme();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasEvent, setHasEvent] = useState(true); // Track if event is available

  // Listen for event availability from LatestEvent component
  const handleEventStatus = useCallback((eventExists) => {
    setHasEvent(eventExists);
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoints = ['/blogs', '/blogs/published', '/articles'];
      let response = null;
      
      for (const endpoint of endpoints) {
        try {
          const fullUrl = `${API_URL}${endpoint}`;
          response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            break;
          }
        } catch (endpointError) {
          console.error(`Endpoint ${endpoint} failed:`, endpointError);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch articles. Status: ${response?.status || 'N/A'}`);
      }
      
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse response: ${parseError.message}`);
      }
      
      let articlesArray = [];
      if (Array.isArray(data)) {
        articlesArray = data;
      } else if (data?.data && Array.isArray(data.data)) {
        articlesArray = data.data;
      } else if (data?.articles && Array.isArray(data.articles)) {
        articlesArray = data.articles;
      } else if (data?.blogs && Array.isArray(data.blogs)) {
        articlesArray = data.blogs;
      }
      
      const publishedArticles = articlesArray.filter(blog => 
        blog.status === 'published' || 
        blog.is_published === true || 
        blog.published === true ||
        (!blog.status && !blog.is_published && !blog.published)
      );
      
      const processedArticles = publishedArticles.map(blog => ({
        ...blog,
        id: blog.id || blog._id || Math.random().toString(36),
        title: blog.title || 'Untitled Article',
        excerpt: blog.excerpt || blog.summary || '',
        content: blog.content || blog.body || '',
        featured_image: blog.featured_image || blog.image || blog.thumbnail || '',
        created_at: blog.created_at || blog.createdAt || new Date().toISOString(),
        published_at: blog.published_at || blog.publishedAt || blog.created_at || blog.createdAt,
        is_featured: blog.is_featured || blog.featured || false,
        is_news: blog.is_news || blog.category === 'news' || blog.type === 'news' || false,
        views: blog.views || Math.floor(Math.random() * 500) + 50,
        tags: blog.tags || [],
        likes: blog.likes || Math.floor(Math.random() * 100),
        comments: blog.comments || Math.floor(Math.random() * 20)
      }));

      const sortedArticles = processedArticles.sort((a, b) => {
        if (a.is_news && !b.is_news) return -1;
        if (!a.is_news && b.is_news) return 1;
        return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
      });

      setContent(sortedArticles.slice(0, 4)); // Limit to 4 articles to make room for events
      
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError(`Error loading articles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const formatDate = useCallback((date) => {
    if (!date) return 'Recent';
    const now = new Date();
    const articleDate = new Date(date);
    const diffTime = Math.abs(now - articleDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return articleDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }, []);

  const getReadingTime = useCallback((content) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, []);

  const handleImageError = useCallback((e) => {
    e.target.src = DEFAULT_IMAGE;
    e.target.onerror = null;
  }, []);

  const handleArticleClick = useCallback((article) => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      const params = new URLSearchParams({
        article: article.id,
        section: article.is_news ? 'news' : 'blogs'
      });
      
      window.location.href = `/insights?${params.toString()}`;
    }
  }, [onArticleClick]);

  const handleViewAllClick = useCallback(() => {
    if (onNavigateToNews) {
      onNavigateToNews();
    } else {
      window.location.href = '/insights';
    }
  }, [onNavigateToNews]);

  // Loading state
  if (loading) {
    return (
      <section
        style={{
          backgroundColor: colors.background,
          padding: 'clamp(80px, 12vw, 140px) 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <div
          style={{
            width: '2px',
            height: '60px',
            background: `linear-gradient(180deg, transparent, ${colors.primary}, transparent)`,
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section
        style={{
          backgroundColor: colors.background,
          padding: 'clamp(80px, 12vw, 140px) 0',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            color: colors.textSecondary
          }}
        >
          <h3 style={{ color: colors.text, marginBottom: '16px' }}>
            Unable to load content
          </h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  // No content state
  if (!content.length) {
    return (
      <section
        style={{
          backgroundColor: colors.background,
          padding: 'clamp(80px, 12vw, 140px) 0',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            color: colors.textSecondary
          }}
        >
          <h3 style={{ color: colors.text, marginBottom: '16px' }}>
            No content available
          </h3>
          <p>Check back soon for updates!</p>
        </div>
      </section>
    );
  }

  const [featuredArticle, ...otherArticles] = content;

  // Get latest news and blogs for fallback
  const latestNews = content.find(item => item.is_news);
  const latestBlogs = content.filter(item => !item.is_news).slice(0, 2);

  return (
    <section
      style={{
        backgroundColor: colors.background,
        padding: 'clamp(80px, 12vw, 140px) 0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 80% 20%, ${colors.primary}04 0%, transparent 50%), 
                      radial-gradient(circle at 20% 80%, ${colors.secondary}03 0%, transparent 50%)`,
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(20px, 5vw, 40px)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Clean Section Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(60px, 8vw, 80px)',
            maxWidth: '800px',
            margin: '0 auto clamp(60px, 8vw, 80px) auto'
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: `${colors.primary}15`,
              borderRadius: '20px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Latest Updates
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '300',
              color: colors.text,
              marginBottom: '24px',
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}
          >
            News & <span style={{ fontWeight: '700', color: colors.primary }}>Stories</span>
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: colors.textSecondary,
              lineHeight: '1.6',
              fontWeight: '300'
            }}
          >
            Stay informed about our latest environmental initiatives and impact stories
          </p>
        </div>

        {/* Main Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'clamp(40px, 6vw, 60px)',
            marginBottom: 'clamp(60px, 8vw, 80px)'
          }}
          className="content-grid"
        >
          {/* Featured Section - News + Events Layout */}
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%'
            }}
            className="featured-section"
          >
            {/* Featured Article */}
            {featuredArticle && (
              <article
                onClick={() => handleArticleClick(featuredArticle)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="featured-article"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Content and Events Row - 3/4 and 1/4 split */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 1fr',
                    gap: 'clamp(32px, 5vw, 48px)',
                    alignItems: 'start'
                  }}
                  className="content-events-row"
                >
                  {/* Article Content Section - 3/4 width */}
                  <div>
                    {/* Article Image - constrained to 3/4 area */}
                    <div
                      style={{
                        height: 'clamp(300px, 40vw, 400px)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: `0 20px 60px -10px ${colors.primary}15`,
                        marginBottom: 'clamp(20px, 3vw, 24px)'
                      }}
                    >
                      <img
                        src={featuredArticle.featured_image ? getImageUrl(featuredArticle.featured_image) : DEFAULT_IMAGE}
                        alt={featuredArticle.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={handleImageError}
                      />
                      
                      {/* Category Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '20px',
                          left: '20px',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          backgroundColor: featuredArticle.is_news ? colors.error : colors.primary,
                          color: colors.white,
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {featuredArticle.is_news ? 'News' : 'Story'}
                      </div>
                    </div>

                    {/* Article Text Content */}
                    <div>
                      <h3
                        style={{
                          fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                          fontWeight: '600',
                          color: colors.text,
                          marginBottom: '16px',
                          lineHeight: '1.3',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {featuredArticle.title}
                      </h3>

                      {featuredArticle.excerpt && (
                        <p
                          style={{
                            color: colors.textSecondary,
                            fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                            lineHeight: '1.7',
                            marginBottom: '24px',
                            fontWeight: '300'
                          }}
                        >
                          {featuredArticle.excerpt}
                        </p>
                      )}

                      {/* Meta Information */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '24px',
                          flexWrap: 'wrap',
                          fontSize: '14px',
                          color: colors.textSecondary,
                          marginBottom: '32px'
                        }}
                        className="article-meta"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} />
                          <span>{formatDate(featuredArticle.published_at || featuredArticle.created_at)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} />
                          <span>{getReadingTime(featuredArticle.content)} min read</span>
                        </div>
                        {featuredArticle.is_featured && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.warning }}>
                            <Star size={14} fill="currentColor" />
                          </div>
                        )}
                      </div>

                      {/* Newsletter Subscription */}
                      <NewsletterSubscription />

                      {/* Clean View All Button */}
                      <div style={{ textAlign: 'center' }}>
                        <button
                          onClick={handleViewAllClick}
                          style={{
                            background: 'transparent',
                            color: colors.primary,
                            border: `1px solid ${colors.primary}30`,
                            padding: '14px 32px',
                            borderRadius: '6px',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.primary;
                            e.target.style.color = colors.white;
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = colors.primary;
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          View All Stories
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Events/Fallback Sidebar - 1/4 width */}
                  {hasEvent ? (
                    <div
                      style={{
                        backgroundColor: isDarkMode ? colors.surface : colors.white,
                        borderRadius: '16px',
                        padding: 'clamp(20px, 3vw, 24px)',
                        border: `1px solid ${colors.border}20`,
                        position: 'relative',
                        height: 'fit-content'
                      }}
                    >
                      <div
                        style={{
                          marginBottom: 'clamp(16px, 2vw, 20px)'
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            backgroundColor: `${colors.secondary}15`,
                            borderRadius: '12px',
                            marginBottom: '8px',
                            fontSize: '10px',
                            fontWeight: '500',
                            color: colors.secondary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Events
                        </div>
                        
                        <h4
                          style={{
                            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                            fontWeight: '600',
                            color: colors.text,
                            lineHeight: '1.3',
                            marginBottom: '4px'
                          }}
                        >
                          Join Us
                        </h4>
                        
                        <p
                          style={{
                            color: colors.textSecondary,
                            fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                            lineHeight: '1.4',
                            margin: 0
                          }}
                        >
                          Upcoming initiatives
                        </p>
                      </div>
                      
                      <LatestEvent onEventStatus={handleEventStatus} />
                    </div>
                  ) : (
                    <FallbackContent 
                      onArticleClick={onArticleClick}
                      latestNews={latestNews}
                      latestBlogs={latestBlogs}
                    />
                  )}
                </div>
              </article>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Mobile optimization */
        @media (max-width: 760px) {
          .content-grid {
            gap: 32px !important;
          }
          
          .featured-section {
            gap: 24px !important;
          }
          
          .content-events-row {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          
          .articles-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          .article-meta {
            gap: 16px !important;
            flex-wrap: wrap !important;
          }
        }

        /* Tablet optimization */
        @media (min-width: 769px) and (max-width: 1024px) {
          .content-events-row {
            grid-template-columns: 2fr 1fr !important;
            gap: 32px !important;
          }
          
          .articles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        /* Desktop optimization */
        @media (min-width: 1025px) {
          .content-events-row {
            grid-template-columns: 3fr 1fr !important;
            gap: 48px !important;
          }
        }

        /* Animation keyframes */
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scaleY(0.8);
          }
          50% { 
            opacity: 1; 
            transform: scaleY(1);
          }
        }

        /* Smooth transitions */
        * {
          transition: all 0.2s ease !important;
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 48px !important;
            padding: 16px 36px !important;
          }
        }

        /* Print styles */
        @media print {
          button, .category-badge {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default LatestNewsSection;
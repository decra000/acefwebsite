import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../theme';
import LatestEvent from '../Events/LatestEvent';
import { subscribeToNewsletter } from '../../services/newsletterService';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';

const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e3f2fd'/%3E%3Ccircle cx='320' cy='60' r='35' fill='%23ffeb3b'/%3E%3Cpath d='M0 200 Q100 140 200 200 T400 200 V300 H0 Z' fill='%23a5d6a7'/%3E%3Cpath d='M0 230 Q120 170 250 230 T400 230 V300 H0 Z' fill='%238bc34a'/%3E%3Crect x='90' y='150' width='18' height='70' fill='%236d4c41'/%3E%3Ccircle cx='99' cy='140' r='40' fill='%234caf50'/%3E%3Crect x='280' y='160' width='16' height='60' fill='%236d4c41'/%3E%3Ccircle cx='288' cy='145' r='35' fill='%23389e3c'/%3E%3C/svg%3E";

const getImageUrl = (filename) => {
  if (!filename) return DEFAULT_IMAGE;
  
  let cleanFilename = filename;
  cleanFilename = cleanFilename.replace(/^\/+/, '');
  cleanFilename = cleanFilename.replace(/^uploads\//, '');
  cleanFilename = cleanFilename.replace(/^blogs\//, '');
  
  return `${STATIC_URL}/uploads/blogs/${cleanFilename}`;
};

// Optimized Newsletter Subscription
const NewsletterSubscription = () => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubscribe = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const result = await subscribeToNewsletter(email);
    setStatus(result.message);
    if (result.success) {
      setEmail('');
      setTimeout(() => setStatus(null), 3000);
    }
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      style={{ 
        marginBottom: isMobile ? '20px' : '24px',
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '10px' : '0',
          boxShadow: `0 4px 12px ${colors.cardShadow}`,
          borderRadius: '4px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%'
        }}
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          style={{
            flex: 1,
            padding: isMobile ? '12px 14px' : '12px 16px',
            border: 'none',
            fontSize: isMobile ? '14px' : '14px',
            outline: 'none',
            background: colors.surface,
            color: colors.text,
            borderRadius: isMobile ? '4px' : '0',
            width: isMobile ? '100%' : 'auto',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease'
          }}
        />
        <button 
          type="button"
          onClick={handleSubscribe}
          disabled={isSubmitting || !email}
          style={{
            background: colors.primary,
            color: colors.white,
            border: 'none',
            padding: isMobile ? '12px 16px' : '12px 20px',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: isSubmitting ? 0.7 : 1,
            borderRadius: isMobile ? '4px' : '0',
            width: isMobile ? '100%' : 'auto',
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting && !isMobile) {
              e.target.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.opacity = '1';
            }
          }}
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            textAlign: 'center',
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: status.includes('success') ? `${colors.success || '#10b981'}15` : `${colors.error}15`,
            color: status.includes('success') ? colors.success || '#10b981' : colors.error,
            fontSize: '12px',
            marginTop: '8px',
            wordWrap: 'break-word'
          }}
        >
          {status}
        </motion.div>
      )}
    </motion.div>
  );
};

// Optimized Article Card - Updated to hide image when isCompact
const ArticleCard = ({ article, onArticleClick, isCompact = false }) => {
  const { colors } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  
  const handleClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      const params = new URLSearchParams({
        article: article.id,
        section: article.is_news ? 'news' : 'blogs'
      });
      window.location.href = `/insights?${params.toString()}`;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Recent';
    const diffDays = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        height: '100%',
        width: '100%',
        transition: 'transform 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!prefersReducedMotion) {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Only show image if NOT compact */}
      {!isCompact && (
        <div
          style={{
            height: '160px',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '12px',
            position: 'relative',
            width: '100%'
          }}
        >
          <img
            src={article.featured_image ? getImageUrl(article.featured_image) : DEFAULT_IMAGE}
            alt={article.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onError={(e) => {
              e.target.src = DEFAULT_IMAGE;
              e.target.onerror = null;
            }}
            onMouseEnter={(e) => {
              if (!prefersReducedMotion) {
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
          
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: article.is_news ? colors.error : colors.primary,
              color: colors.white,
              fontSize: '10px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}
          >
            {article.is_news ? 'News' : 'Story'}
          </div>
        </div>
      )}

      {/* Badge for compact view */}
      {isCompact && (
        <div
          style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: '3px',
            backgroundColor: article.is_news ? colors.error : colors.primary,
            color: colors.white,
            fontSize: '9px',
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}
        >
          {article.is_news ? 'News' : 'Story'}
        </div>
      )}

      <h4
        style={{
          fontSize: isCompact ? '14px' : '16px',
          fontWeight: '600',
          color: colors.text,
          marginBottom: '8px',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordWrap: 'break-word',
          hyphens: 'auto'
        }}
      >
        {article.title}
      </h4>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '11px',
          color: colors.textSecondary,
          flexWrap: 'wrap'
        }}
      >
        <span>{formatDate(article.published_at || article.created_at)}</span>
        <span>{Math.ceil((article.content?.split(' ').length || 200) / 200)} min</span>
      </div>
    </motion.div>
  );
};

const LatestNewsSection = ({ 
  onArticleClick, 
  onNavigateToNews
}) => {
  const { colors, isDarkMode } = useTheme();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasEvent, setHasEvent] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleEventStatus = useCallback((eventExists) => {
    setHasEvent(eventExists);
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const endpoints = ['/blogs', '/blogs/published', '/articles'];
      let response = null;
      
      for (const endpoint of endpoints) {
        try {
          response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          if (response.ok) break;
        } catch (e) {
          console.error(`Endpoint ${endpoint} failed:`, e);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      let articlesArray = [];
      
      if (Array.isArray(data)) articlesArray = data;
      else if (data?.data && Array.isArray(data.data)) articlesArray = data.data;
      else if (data?.articles && Array.isArray(data.articles)) articlesArray = data.articles;
      else if (data?.blogs && Array.isArray(data.blogs)) articlesArray = data.blogs;
      
      const publishedArticles = articlesArray.filter(blog => 
        blog.status === 'published' || blog.is_published === true || !blog.status
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
        is_news: blog.is_news || blog.category === 'news' || false
      }));

      const sortedArticles = processedArticles
        .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
        .slice(0, 5);

      setContent(sortedArticles);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleViewAllClick = useCallback(() => {
    if (onNavigateToNews) {
      onNavigateToNews();
    } else {
      window.location.href = '/insights';
    }
  }, [onNavigateToNews]);

  const handleArticleNavigation = useCallback((article) => {
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

  if (loading) {
    return (
      <section
        style={{
          backgroundColor: colors.background,
          padding: isMobile ? '40px 0' : '80px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: isMobile ? '200px' : '400px'
        }}
      >
        <div style={{ color: colors.textSecondary }}>Loading...</div>
      </section>
    );
  }

  if (error || !content.length) {
    return null;
  }

  const [featuredArticle, ...otherArticles] = content;
  
  // Get recommended articles for when there's no event
  const recommendedArticles = otherArticles.slice(0, 3);

  return (
    <section
      style={{
        backgroundColor: colors.background,
        padding: isMobile ? '40px 0' : '80px 0',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 12px' : isTablet ? '0 16px' : '0 20px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <motion.div 
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          style={{ 
            textAlign: 'center', 
            marginBottom: isMobile ? '32px' : '60px',
            padding: isMobile ? '0 8px' : '0'
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? '24px' : isTablet ? '32px' : 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: '600',
              color: colors.text,
              marginBottom: '12px',
              lineHeight: '1.2',
              wordWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            Latest <span style={{ color: colors.primary }}>Updates</span>
          </h2>
          <p
            style={{
              fontSize: isMobile ? '15px' : '18px',
              color: colors.textSecondary,
              maxWidth: isMobile ? '100%' : '500px',
              margin: '0 auto',
              lineHeight: '1.5',
              wordWrap: 'break-word',
              padding: isMobile ? '0 4px' : '0'
            }}
          >
            Stay informed about our environmental initiatives
          </p>
        </motion.div>

        {/* Main Content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: isMobile ? '20px' : isTablet ? '30px' : '40px',
            marginBottom: isMobile ? '32px' : '50px',
            width: '100%'
          }}
        >
          {/* Featured Article */}
          {featuredArticle && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              onClick={() => handleArticleNavigation(featuredArticle)}
              style={{ 
                cursor: 'pointer',
                width: '100%',
                minWidth: 0
              }}
            >
              <div
                style={{
                  height: isMobile ? '180px' : isTablet ? '240px' : '300px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  position: 'relative',
                  width: '100%',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!prefersReducedMotion && !isMobile) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img
                  src={featuredArticle.featured_image ? getImageUrl(featuredArticle.featured_image) : DEFAULT_IMAGE}
                  alt={featuredArticle.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onError={(e) => { 
                    e.target.src = DEFAULT_IMAGE; 
                    e.target.onerror = null; 
                  }}
                  onMouseEnter={(e) => {
                    if (!prefersReducedMotion) {
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                />
                
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: isMobile ? '4px 8px' : '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: featuredArticle.is_news ? colors.error : colors.primary,
                    color: colors.white,
                    fontSize: isMobile ? '10px' : '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {featuredArticle.is_news ? 'News' : 'Featured'}
                </div>
              </div>

              <h3
                style={{
                  fontSize: isMobile ? '18px' : isTablet ? '24px' : 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: '12px',
                  lineHeight: '1.3',
                  wordWrap: 'break-word',
                  hyphens: 'auto',
                  overflow: 'hidden'
                }}
              >
                {featuredArticle.title}
              </h3>

              {featuredArticle.excerpt && (
                <p
                  style={{
                    color: colors.textSecondary,
                    fontSize: isMobile ? '14px' : '16px',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    wordWrap: 'break-word',
                    hyphens: 'auto',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: isMobile ? 3 : 4,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {featuredArticle.excerpt.length > (isMobile ? 80 : 120) 
                    ? `${featuredArticle.excerpt.substring(0, isMobile ? 80 : 120)}...` 
                    : featuredArticle.excerpt}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '12px' : '16px',
                  fontSize: isMobile ? '12px' : '14px',
                  color: colors.textSecondary,
                  marginBottom: '20px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  <Calendar size={isMobile ? 12 : 14} />
                  <span>
                    {new Date(featuredArticle.published_at || featuredArticle.created_at)
                      .toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        ...(isMobile ? {} : { year: 'numeric' })
                      })}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  <Clock size={isMobile ? 12 : 14} />
                  <span>{Math.ceil((featuredArticle.content?.split(' ').length || 200) / 200)} min</span>
                </div>
              </div>

              <NewsletterSubscription />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewAllClick();
                }}
                style={{
                  marginTop: isMobile ? '24px' : '50px',
                  background: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}40`,
                  padding: isMobile ? '10px 16px' : '8px 16px',
                  borderRadius: '4px',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: isMobile ? '100%' : 'auto',
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.borderColor = colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.borderColor = `${colors.primary}40`;
                }}
              >
                View All Stories <ArrowRight size={isMobile ? 12 : 14} />
              </button>
            </motion.div>
          )}

          {/* Event Card or Recommended Articles */}
          {hasEvent ? (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                backgroundColor: isDarkMode ? colors.surface : colors.white,
                borderRadius: '8px',
                padding: isMobile ? '14px' : isTablet ? '16px' : '20px',
                border: `1px solid ${colors.border}20`,
                height: 'fit-content',
                width: '100%',
                boxSizing: 'border-box',
                boxShadow: `0 4px 20px ${colors.cardShadow}20`,
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!prefersReducedMotion && !isMobile) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ 
                marginBottom: '14px', 
                textAlign: 'center'
              }}>
                <h4 style={{ 
                  fontSize: isMobile ? '16px' : '16px', 
                  fontWeight: '600', 
                  color: colors.text, 
                  margin: '0 0 6px 0',
                  wordWrap: 'break-word'
                }}>
                  Upcoming Event
                </h4>
                <p style={{ 
                  fontSize: isMobile ? '13px' : '13px', 
                  color: colors.textSecondary, 
                  margin: 0,
                  wordWrap: 'break-word'
                }}>
                  Join our next initiative
                </p>
              </div>
              
              <LatestEvent onEventStatus={handleEventStatus} />
            </motion.div>
          ) : (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                backgroundColor: isDarkMode ? colors.surface : colors.white,
                borderRadius: '8px',
                padding: isMobile ? '14px' : isTablet ? '16px' : '20px',
                border: `1px solid ${colors.border}20`,
                height: 'fit-content',
                order: isMobile ? -1 : 0,
                width: '100%',
                boxSizing: 'border-box',
                boxShadow: `0 4px 20px ${colors.cardShadow}20`
              }}
            >
              <div style={{ 
                marginBottom: '16px', 
                textAlign: 'center'
              }}>


                <h4 style={{ 
                  fontSize: isMobile ? '16px' : '16px', 
                  fontWeight: '600', 
                  color: colors.text, 
                  margin: '0 0 6px 0',
                  wordWrap: 'break-word'
                }}>
                  Recommended for You
                </h4>
                <p style={{ 
                  fontSize: isMobile ? '13px' : '13px', 
                  color: colors.textSecondary, 
                  margin: 0,
                  wordWrap: 'break-word'
                }}>
                  More stories you might like
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {recommendedArticles.map((article, index) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onArticleClick={handleArticleNavigation}
                    isCompact={true}
                  />
                ))}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewAllClick();
                }}
                style={{
                  marginTop: '16px',
                  background: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}40`,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.backgroundColor = `${colors.primary}05`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = `${colors.primary}40`;
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                View More <ArrowRight size={12} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestNewsSection;
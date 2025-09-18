import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LatestNewsSection = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Use theme context
  const { colors, isDarkMode } = useTheme();

  const fetchLatestArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoints = ['/blogs', '/blogs/published', '/articles'];
      let response = null;
      
      for (const endpoint of endpoints) {
        try {
          response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.ok) break;
        } catch (endpointError) {
          console.error(`Endpoint ${endpoint} failed:`, endpointError);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      
      // Handle different response structures
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
      
      // Get the latest published article
      const latestArticle = articlesArray
        .filter(blog => 
          blog.status === 'published' || 
          blog.is_published === true || 
          blog.published === true ||
          (!blog.status && !blog.is_published && !blog.published)
        )
        .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
        [0];
      
      if (latestArticle) {
        setArticle({
          ...latestArticle,
          id: latestArticle.id || latestArticle._id || Math.random().toString(36),
          title: latestArticle.title || 'Untitled Article',
          excerpt: latestArticle.excerpt || latestArticle.summary || '',
          content: latestArticle.content || latestArticle.body || '',
          created_at: latestArticle.created_at || latestArticle.createdAt || new Date().toISOString(),
          published_at: latestArticle.published_at || latestArticle.publishedAt || latestArticle.created_at || latestArticle.createdAt,
          is_featured: latestArticle.is_featured || latestArticle.featured || false,
          is_news: latestArticle.is_news || latestArticle.category === 'news' || latestArticle.type === 'news' || false,
        });
      }
      
    } catch (err) {
      console.error('Failed to fetch latest article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestArticle();
  }, [fetchLatestArticle]);

  const formatDate = useCallback((date) => {
    if (!date) return 'Recent';
    const now = new Date();
    const articleDate = new Date(date);
    const diffTime = Math.abs(now - articleDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return articleDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }, []);

  const handleArticleClick = useCallback(() => {
    if (article) {
      // Navigate to the insights page and trigger the article view
      // We'll use URL parameters to identify which article to show
      navigate(`/insights?article=${article.id}`);
    }
  }, [article, navigate]);

  const handleNewsroomClick = useCallback(() => {
    // Navigate to insights page with news section active
    navigate('/insights?section=news');
  }, [navigate]);

  const styles = {
    section: {
      padding: '60px 0 40px',
      backgroundColor: isDarkMode ? colors.background : colors.background,
      position: 'relative'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '24px'
    },
    newsroomLink: {
      color: colors.primary,
      fontSize: '14px',
      fontWeight: 600,
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      padding: '8px 0',
      borderBottom: '2px solid transparent'
    },
    contentWrapper: {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      padding: '32px',
      borderRadius: '16px',
      background: isDarkMode 
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(0, 0, 0, 0.02)',
      border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
      backdropFilter: 'blur(10px)'
    },
    title: {
      fontSize: 'clamp(24px, 4vw, 36px)',
      fontWeight: 700,
      color: colors.text,
      margin: '0 0 16px 0',
      lineHeight: '1.3'
    },
    excerpt: {
      color: colors.textSecondary,
      fontSize: '16px',
      lineHeight: '1.6',
      margin: '0 0 24px 0'
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: colors.textSecondary,
      fontSize: '14px',
      fontWeight: 500
    },
    readButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      color: colors.textSecondary
    },
    error: {
      textAlign: 'center',
      padding: '40px 0',
      color: colors.error
    },
    empty: {
      textAlign: 'center',
      padding: '40px 0',
      color: colors.textSecondary
    }
  };

  if (loading) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.loading}>
            <p>Loading latest news...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.error}>
            <p>Unable to load content: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.empty}>
            <p>No articles available. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            onClick={handleNewsroomClick}
            style={styles.newsroomLink}
            onMouseEnter={(e) => {
              e.target.style.color = colors.primaryDark || colors.primary;
              e.target.style.borderBottomColor = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.color = colors.primary;
              e.target.style.borderBottomColor = 'transparent';
            }}
          >
            Go to Newsroom
          </button>
        </div>

        <div 
          onClick={handleArticleClick}
          style={styles.contentWrapper}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.background = isDarkMode 
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.04)';
            e.currentTarget.style.border = `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = isDarkMode 
              ? 'rgba(255, 255, 255, 0.02)'
              : 'rgba(0, 0, 0, 0.02)';
            e.currentTarget.style.border = `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`;
          }}
        >
          <h3 style={styles.title}>
            {article.title}
          </h3>
          
          {article.excerpt && (
            <p style={styles.excerpt}>
              {article.excerpt}
            </p>
          )}

          <div style={styles.footer}>
            <div style={styles.meta}>
              <Calendar size={16} style={{ color: colors.primary }} />
              <span>{formatDate(article.published_at || article.created_at)}</span>
            </div>

            <button 
              style={styles.readButton}
              onClick={(e) => {
                e.stopPropagation();
                handleArticleClick();
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.primaryDark || colors.primary;
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.primary;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Learn More
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .footer {
            flex-direction: column !important;
            align-items: center !important;
            gap: 16px !important;
          }
          
          .contentWrapper {
            padding: 24px !important;
          }
          
          .title {
            font-size: 22px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default LatestNewsSection;
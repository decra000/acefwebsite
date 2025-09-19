import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, ArrowRight, Clock, Star, Tag } from 'lucide-react';

// Import the actual theme hook
import { useTheme } from '../../theme';

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

const LatestNewsSection = ({ onArticleClick, onNavigateToNews, onNavigateToBlogs }) => {
  const { colors, isDarkMode } = useTheme();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      
      // Filter for published articles and process them
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

      // Sort: News first, then by date
      const sortedArticles = processedArticles.sort((a, b) => {
        // First priority: News articles
        if (a.is_news && !b.is_news) return -1;
        if (!a.is_news && b.is_news) return 1;
        
        // Second priority: Date (most recent first)
        return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
      });

      setContent(sortedArticles.slice(0, 5)); // Limit to 5 articles for the homepage section
      
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
      // Navigate to news/blog page with article selected
      // Based on your BlogUserPage navigation pattern
      const params = new URLSearchParams({
        article: article.id,
        section: article.is_news ? 'news' : 'blogs'
      });
      // Navigate to your blog page (adjust path as needed)
      window.location.href = `/insights?${params.toString()}`;
    }
  }, [onArticleClick]);

  const styles = {
    section: {
      backgroundColor: isDarkMode ? colors.background : colors.gray50,
      padding: '80px 0',
      position: 'relative'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '64px'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: colors.primary + '15',
      color: colors.primary,
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '16px'
    },
    title: {
      fontSize: 'clamp(28px, 5vw, 48px)',
      fontWeight: 800,
      color: colors.text,
      margin: '0 0 16px 0',
      lineHeight: '1.2'
    },
    subtitle: {
      fontSize: '16px',
      color: colors.textSecondary,
      margin: '0 auto',
      maxWidth: '600px',
      lineHeight: '1.6'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '40px',
      alignItems: 'start'
    },
    featuredCard: {
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      borderRadius: '8px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
      position: 'relative',
      height: 'fit-content'
    },
    featuredImage: {
      width: '100%',
      height: '320px',
      objectFit: 'cover',
      backgroundColor: isDarkMode ? colors.border : colors.gray200
    },
    featuredContent: {
      padding: '32px'
    },
    featuredBadge: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    newsBadge: {
      backgroundColor: colors.error,
      color: colors.white
    },
    blogBadge: {
      backgroundColor: colors.primary,
      color: colors.white
    },
    featuredTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: colors.text,
      margin: '0 0 16px 0',
      lineHeight: '1.3'
    },
    featuredExcerpt: {
      color: colors.textSecondary,
      fontSize: '16px',
      lineHeight: '1.6',
      margin: '0 0 24px 0',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    featuredMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      paddingTop: '24px',
      borderTop: `1px solid ${isDarkMode ? colors.border : colors.gray100}`,
      flexWrap: 'wrap'
    },
    metaItem: {
      color: colors.textSecondary,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    sidebarList: {
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      borderRadius: '8px',
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
      overflow: 'hidden',
      height: 'fit-content'
    },
    sidebarHeader: {
      padding: '24px 24px 0 24px',
      borderBottom: 'none'
    },
    sidebarTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: colors.text,
      margin: '0 0 16px 0'
    },
    sidebarItem: {
      padding: '20px 24px',
      borderBottom: `1px solid ${isDarkMode ? colors.border : colors.gray100}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    sidebarItemLast: {
      borderBottom: 'none'
    },
    sidebarItemTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: colors.text,
      margin: '0 0 8px 0',
      lineHeight: '1.4',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    sidebarItemMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '12px',
      color: colors.textSecondary
    },
    sidebarBadge: {
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '9px',
      fontWeight: 600,
      textTransform: 'uppercase'
    },
    footer: {
      textAlign: 'center',
      marginTop: '48px'
    },
    viewAllButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '16px 32px',
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
    loadingState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '16px'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: `3px solid ${isDarkMode ? colors.border : colors.gray200}`,
      borderTop: `3px solid ${colors.primary}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    errorState: {
      textAlign: 'center',
      padding: '40px',
      color: colors.textSecondary
    }
  };

  if (loading) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <p style={{ color: colors.textSecondary }}>Loading latest updates...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.errorState}>
            <h3 style={{ color: colors.text, margin: '0 0 16px 0' }}>Unable to load content</h3>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!content.length) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.errorState}>
            <h3 style={{ color: colors.text, margin: '0 0 16px 0' }}>No content available</h3>
            <p>Check back soon for updates!</p>
          </div>
        </div>
      </section>
    );
  }

  const [featuredArticle, ...sidebarArticles] = content;

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>
            Latest Updates
          </div>
          <h2 style={styles.title}>
            News & Environmental Stories
          </h2>
          <p style={styles.subtitle}>
            Stay informed about our latest environmental initiatives and impact stories from across Africa
          </p>
        </div>

        {/* Content Grid */}
        <div style={styles.grid}>
          {/* Featured Article */}
          <article 
            style={styles.featuredCard}
            onClick={() => handleArticleClick(featuredArticle)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = `0 20px 60px -12px ${colors.primary}25`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={featuredArticle.featured_image ? getImageUrl(featuredArticle.featured_image) : DEFAULT_IMAGE}
                alt={featuredArticle.title}
                style={styles.featuredImage}
                onError={handleImageError}
              />
              <div style={{
                ...styles.featuredBadge,
                ...(featuredArticle.is_news ? styles.newsBadge : styles.blogBadge)
              }}>
                {featuredArticle.is_news ? 'Featured' : 'Blog'}
              </div>
            </div>
            
            <div style={styles.featuredContent}>
              <h3 style={styles.featuredTitle}>
                {featuredArticle.title}
              </h3>
              
              {featuredArticle.excerpt && (
                <p style={styles.featuredExcerpt}>
                  {featuredArticle.excerpt}
                </p>
              )}

              <div style={styles.featuredMeta}>
                <div style={styles.metaItem}>
                  <Calendar size={14} />
                  <span>{formatDate(featuredArticle.published_at || featuredArticle.created_at)}</span>
                </div>
                <div style={styles.metaItem}>
                  <Clock size={14} />
                  <span>{getReadingTime(featuredArticle.content)} min read</span>
                </div>
                {featuredArticle.is_featured && (
                  <div style={{
                    ...styles.metaItem,
                    color: colors.warning
                  }}>
                    <Star size={14} fill="currentColor" />
                    <span>Featured</span>
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Sidebar List */}
          <div style={styles.sidebarList}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>More Stories</h3>
            </div>
            
            {sidebarArticles.map((article, index) => (
              <div
                key={article.id}
                style={{
                  ...styles.sidebarItem,
                  ...(index === sidebarArticles.length - 1 ? styles.sidebarItemLast : {})
                }}
                onClick={() => handleArticleClick(article)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? colors.border + '20' : colors.gray50;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <h4 style={styles.sidebarItemTitle}>
                  {article.title}
                </h4>
                
                <div style={styles.sidebarItemMeta}>
                  <span style={{
                    ...styles.sidebarBadge,
                    backgroundColor: article.is_news ? colors.error + '20' : colors.primary + '20',
                    color: article.is_news ? colors.error : colors.primary
                  }}>
                    {article.is_news ? 'News' : 'Blog'}
                  </span>
                  <span>{formatDate(article.published_at || article.created_at)}</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={10} />
                    <span>{getReadingTime(article.content)}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.viewAllButton}
            onClick={() => {
              if (onNavigateToNews) {
                onNavigateToNews();
              } else {
                window.location.href = '/news';
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.primaryDark || colors.primary;
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.primary;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Read More
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          
          .featured-content {
            padding: 24px !important;
          }
          
          .featured-title {
            font-size: 20px !important;
          }
          
          .featured-excerpt {
            font-size: 14px !important;
          }
          
          .featured-meta {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          
          .sidebar-item {
            padding: 16px 20px !important;
          }
          
          .sidebar-item-meta {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
        }
        
        @media (max-width: 480px) {
          .featured-image {
            height: 240px !important;
          }
          
          .sidebar-header {
            padding: 20px 20px 0 20px !important;
          }
          
          .sidebar-title {
            font-size: 18px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default LatestNewsSection;
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Calendar, ArrowRight, Clock, Tag, Volume2, Square, Share2
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MailList from '../../components/MailList';
// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';

// Default placeholder image
const DEFAULT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e3f2fd'/%3E%3Ccircle cx='320' cy='60' r='35' fill='%23ffeb3b'/%3E%3Cpath d='M0 200 Q100 140 200 200 T400 200 V300 H0 Z' fill='%23a5d6a7'/%3E%3Cpath d='M0 230 Q120 170 250 230 T400 230 V300 H0 Z' fill='%238bc34a'/%3E%3Crect x='90' y='150' width='18' height='70' fill='%236d4c41'/%3E%3Ccircle cx='99' cy='140' r='40' fill='%234caf50'/%3E%3Crect x='280' y='160' width='16' height='60' fill='%236d4c41'/%3E%3Ccircle cx='288' cy='145' r='35' fill='%23389e3c'/%3E%3C/svg%3E";

const getImageUrl = (filename) => {
  if (!filename) return DEFAULT_IMAGE;
  
  let cleanFilename = filename;
  cleanFilename = cleanFilename.replace(/^\/+/, '');
  cleanFilename = cleanFilename.replace(/^uploads\//, '');
  cleanFilename = cleanFilename.replace(/^blogs\//, '');
  
  return `${STATIC_URL}/uploads/blogs/${cleanFilename}`;
};

const IndividualArticlePage = () => {
  const colors = {
    primary: '#2E7D32',
    accent: '#1E3A8A',
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    white: '#FFFFFF',
    error: '#EF4444',
    warning: '#F59E0B',
    border: '#E5E7EB'
  };
  
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Audio management
  const currentUtteranceRef = useRef(null);
  const isAudioActiveRef = useRef(false);
  const shouldCancelRef = useRef(false);

  // Get article ID or slug from URL
  const getArticleIdentifier = () => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);
    const identifier = parts[parts.length - 1];
    
    if (!identifier || identifier === 'blog') {
      return null;
    }
    
    return identifier;
  };

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Audio cleanup
  const cleanupAudio = useCallback(() => {
    shouldCancelRef.current = true;
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }, 100);
    }

    setIsReading(false);
    currentUtteranceRef.current = null;
    isAudioActiveRef.current = false;
    
    setTimeout(() => {
      shouldCancelRef.current = false;
    }, 300);
  }, []);

  // Fetch article
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const identifier = getArticleIdentifier();
        
        if (!identifier) {
          setError('No article specified');
          setLoading(false);
          return;
        }
        
        const isNumeric = /^\d+$/.test(identifier);
        
        // Try to fetch by slug first, then by ID
        let endpoint = isNumeric 
          ? `${API_URL}/blogs/${identifier}`
          : `${API_URL}/blogs/slug/${identifier}`;
        
        let response = await fetch(endpoint);
        let data = await response.json();
        
        // If slug endpoint fails, try ID endpoint
        if (!data.success && !isNumeric) {
          endpoint = `${API_URL}/blogs/${identifier}`;
          response = await fetch(endpoint);
          data = await response.json();
        }
        
        if (data.success && data.data) {
          setArticle(data.data);
          
          // Track view
          if (data.data.id) {
            fetch(`${API_URL}/blogs/${data.data.id}/view`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            }).catch(err => console.error('Error tracking view:', err));
          }
          
          // Fetch related articles
          fetchRelatedArticles(data.data);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, []);

  // Fetch related articles
  const fetchRelatedArticles = async (currentArticle) => {
    try {
      const response = await fetch(`${API_URL}/blogs?limit=3`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const filtered = data.data
          .filter(a => a.id !== currentArticle.id)
          .slice(0, 3);
        setRelatedArticles(filtered);
      }
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  // Handle voice reading
  const handleVoice = useCallback(() => {
    if (!window.speechSynthesis || !article) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isReading) {
      cleanupAudio();
      return;
    }

    cleanupAudio();

    let textToRead = '';
    if (article.title) textToRead += article.title + '. ';
    if (article.excerpt) textToRead += article.excerpt + '. ';
    if (article.content) textToRead += article.content;
    
    const cleanText = textToRead
      .replace(/<[^>]*>/g, ' ')
      .replace(/[^\w\s.,!?;:'-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000);

    if (!cleanText) {
      alert('No text content available to read.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';
    
    utterance.onstart = () => {
      if (!shouldCancelRef.current) {
        setIsReading(true);
        currentUtteranceRef.current = utterance;
        isAudioActiveRef.current = true;
      }
    };
    
    utterance.onend = () => {
      if (!shouldCancelRef.current) {
        setIsReading(false);
        currentUtteranceRef.current = null;
        isAudioActiveRef.current = false;
      }
    };
    
    utterance.onerror = () => {
      setIsReading(false);
      currentUtteranceRef.current = null;
      isAudioActiveRef.current = false;
    };

    setTimeout(() => {
      if (!shouldCancelRef.current) {
        window.speechSynthesis.speak(utterance);
      }
    }, 100);
  }, [isReading, article, cleanupAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupAudio();
  }, [cleanupAudio]);

  const formatDate = (date) => {
    if (!date) return 'Recent';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getReadingTime = (content) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.gray50,
      color: colors.text
    },
    backButton: {
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 600,
      border: `2px solid ${colors.gray200}`,
      borderRadius: '10px',
      backgroundColor: colors.white,
      color: colors.text,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '24px'
    },
    articleContainer: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: isMobile ? '20px 16px 60px' : '40px 24px 80px'
    },
    articleCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.gray200}`,
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '48px'
    },
    imageContainer: {
      width: '100%',
      height: isMobile ? '300px' : '500px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: colors.gray100
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    contentContainer: {
      padding: isMobile ? '24px 20px' : '48px 40px'
    },
    badge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginRight: '8px',
      marginBottom: '16px'
    },
    title: {
      fontSize: isMobile ? '28px' : '42px',
      fontWeight: 800,
      lineHeight: '1.2',
      margin: '0 0 20px 0',
      color: colors.text
    },
    excerpt: {
      fontSize: isMobile ? '16px' : '20px',
      lineHeight: '1.6',
      color: colors.textSecondary,
      margin: '0 0 32px 0'
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: `1px solid ${colors.gray200}`,
      flexWrap: 'wrap'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: colors.textSecondary,
      fontSize: '14px'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      marginBottom: '40px',
      flexWrap: 'wrap'
    },
    actionButton: {
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 600,
      border: `2px solid ${colors.gray200}`,
      borderRadius: '10px',
      backgroundColor: colors.white,
      color: colors.text,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    activeButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: colors.white
    },
    content: {
      fontSize: isMobile ? '16px' : '18px',
      lineHeight: '1.8',
      color: colors.text,
      marginBottom: '40px'
    },
    paragraph: {
      marginBottom: '24px'
    },
    tagsSection: {
      paddingTop: '32px',
      borderTop: `1px solid ${colors.gray200}`
    },
    tagsTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
      color: colors.textSecondary,
      fontSize: '14px',
      fontWeight: 600
    },
    tagsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    tag: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      backgroundColor: colors.gray100,
      color: colors.primary
    },
    relatedSection: {
      marginTop: '64px'
    },
    relatedTitle: {
      fontSize: isMobile ? '24px' : '32px',
      fontWeight: 700,
      marginBottom: '32px',
      color: colors.text
    },
    relatedGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px'
    },
    relatedCard: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.gray200}`,
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    relatedImage: {
      width: '100%',
      height: '180px',
      objectFit: 'cover'
    },
    relatedContent: {
      padding: '20px'
    },
    relatedCardTitle: {
      fontSize: '16px',
      fontWeight: 700,
      margin: '0 0 8px 0',
      color: colors.text,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    relatedExcerpt: {
      fontSize: '14px',
      color: colors.textSecondary,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
                                  <Header/>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${colors.primary}`,
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !article) {
    return (

      <div style={styles.container}>
        <div style={styles.articleContainer}>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ color: colors.text, marginBottom: '16px' }}>
              {error || 'Article not found'}
            </h2>
            <button
              onClick={() => window.location.href = '/blog'}
              style={{
                ...styles.actionButton,
                ...styles.activeButton
              }}
            >
              <ArrowRight style={{ transform: 'rotate(180deg)' }} size={16} />
              Back to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.articleContainer}>
        <button
          onClick={() => window.location.href = '/insights'}
          style={styles.backButton}
        >
          <ArrowRight style={{ transform: 'rotate(180deg)' }} size={16} />
          Back to Articles
        </button>

        <article style={styles.articleCard}>
          <div style={styles.imageContainer}>
            <img
              src={article.featured_image ? getImageUrl(article.featured_image) : DEFAULT_IMAGE}
              alt={article.title}
              style={styles.image}
              onError={(e) => e.target.src = DEFAULT_IMAGE}
            />
          </div>

          <div style={styles.contentContainer}>
            {/* Badges */}
            <div>
              <span style={{
                ...styles.badge,
                backgroundColor: article.is_news ? colors.error : colors.primary,
                color: colors.white
              }}>
                {article.is_news ? 'News' : 'Article'}
              </span>
              {article.is_featured && (
                <span style={{
                  ...styles.badge,
                  backgroundColor: colors.warning + '20',
                  color: colors.warning
                }}>
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={styles.title}>{article.title}</h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p style={styles.excerpt}>{article.excerpt}</p>
            )}

            {/* Meta information */}
            <div style={styles.meta}>
              <div style={styles.metaItem}>
                <Calendar size={16} />
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
              <div style={styles.metaItem}>
                <Clock size={16} />
                <span>{getReadingTime(article.content)} min read</span>
              </div>
              {article.author_name && (
                <div style={styles.metaItem}>
                  <span>By {article.author_name}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={styles.actionButtons}>
              <button
                onClick={handleVoice}
                style={{
                  ...styles.actionButton,
                  ...(isReading ? styles.activeButton : {})
                }}
              >
                {isReading ? (
                  <>
                    <Square size={16} />
                    Stop Reading
                  </>
                ) : (
                  <>
                    <Volume2 size={16} />
                    Listen to Article
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                style={styles.actionButton}
              >
                <Share2 size={16} />
                Share
              </button>
            </div>

            {/* Article content */}
            <div style={styles.content}>
              {article.content && article.content.split('\n').map((paragraph, i) => (
                paragraph.trim() && (
                  <p key={i} style={styles.paragraph}>
                    {paragraph}
                  </p>
                )
              ))}
            </div>

            {/* Tags */}
            {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
              <div style={styles.tagsSection}>
                <div style={styles.tagsTitle}>
                  <Tag size={16} />
                  <span>Tags</span>
                </div>
                <div style={styles.tagsList}>
                  {article.tags.map((tag, i) => (
                    <span key={i} style={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div style={styles.relatedSection}>
            <h2 style={styles.relatedTitle}>Related Articles</h2>
            <div style={styles.relatedGrid}>
              {relatedArticles.map((related) => (
                <div
                  key={related.id}
                  style={styles.relatedCard}
                  onClick={() => window.location.href = `/blog/${related.slug || related.id}`}
                >
                  <img
                    src={related.featured_image ? getImageUrl(related.featured_image) : DEFAULT_IMAGE}
                    alt={related.title}
                    style={styles.relatedImage}
                    onError={(e) => e.target.src = DEFAULT_IMAGE}
                  />
                  <div style={styles.relatedContent}>
                    <h3 style={styles.relatedCardTitle}>{related.title}</h3>
                    {related.excerpt && (
                      <p style={styles.relatedExcerpt}>{related.excerpt}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
                                      <MailList/>


      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
                  <Footer/>

    </div>
    
  );
};

export default IndividualArticlePage;
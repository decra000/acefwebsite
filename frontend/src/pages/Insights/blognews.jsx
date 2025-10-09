import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Calendar, Search, Star, ArrowRight, Clock, Tag, Sparkles,
  TrendingUp, Volume2, Square, Grid3X3, List,
  Video, ChevronDown, ChevronUp, AlignCenter, Newspaper, BookOpen
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MailList from '../../components/MailList';
import { colors } from '../../theme';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';
const API_BASE = API_URL;

// Constants for pagination
const INITIAL_ARTICLES_PER_PAGE_MOBILE = 4;
const INITIAL_ARTICLES_PER_PAGE_DESKTOP = 6;
const ARTICLES_LOAD_INCREMENT_MOBILE = 4;
const ARTICLES_LOAD_INCREMENT_DESKTOP = 6;
const INITIAL_VIDEOS_PER_PAGE = 3;
const VIDEOS_LOAD_INCREMENT = 3;

// Default placeholder image
const DEFAULT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e3f2fd'/%3E%3Ccircle cx='320' cy='60' r='35' fill='%23ffeb3b'/%3E%3Cpath d='M0 200 Q100 140 200 200 T400 200 V300 H0 Z' fill='%23a5d6a7'/%3E%3Cpath d='M0 230 Q120 170 250 230 T400 230 V300 H0 Z' fill='%238bc34a'/%3E%3Crect x='90' y='150' width='18' height='70' fill='%236d4c41'/%3E%3Ccircle cx='99' cy='140' r='40' fill='%234caf50'/%3E%3Crect x='280' y='160' width='16' height='60' fill='%236d4c41'/%3E%3Ccircle cx='288' cy='145' r='35' fill='%23389e3c'/%3E%3C/svg%3E";

const getImageUrl = (filename) => {
  if (!filename) return DEFAULT_IMAGE;
  
  let cleanFilename = filename;
  cleanFilename = cleanFilename.replace(/^\/+/, '');
  cleanFilename = cleanFilename.replace(/^uploads\//, '');
  cleanFilename = cleanFilename.replace(/^blogs\//, '');
  
  const fullUrl = `${STATIC_URL}/uploads/blogs/${cleanFilename}`;
  return fullUrl;
};

const BlogUserPage = () => {

  
  const isDarkMode = false;
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [readingId, setReadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewedArticles, setViewedArticles] = useState(new Set());
  const [activeSection, setActiveSection] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [isMobile, setIsMobile] = useState(false);
  
  // Incremental pagination states
  const [visibleArticles, setVisibleArticles] = useState(INITIAL_ARTICLES_PER_PAGE_MOBILE);
  const [visibleVideos, setVisibleVideos] = useState(INITIAL_VIDEOS_PER_PAGE);
  
  // Video integration
  const [videoData, setVideoData] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [allVideos, setAllVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [filteredVideos, setFilteredVideos] = useState([]);
  
  // Audio management
  const currentUtteranceRef = useRef(null);
  const audioTimeoutRef = useRef(null);
  const isAudioActiveRef = useRef(false);
  const shouldCancelRef = useRef(false);
  const audioCleanupInProgressRef = useRef(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && visibleArticles === INITIAL_ARTICLES_PER_PAGE_DESKTOP) {
        setVisibleArticles(INITIAL_ARTICLES_PER_PAGE_MOBILE);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [visibleArticles]);

  // Action banner handlers
  const handleBlogsAction = () => {
    setActiveSection('blogs');
    setSearchTerm('');
    setFilter('all');
  };

  const handleNewsAction = () => {
    setActiveSection('news');
    setSearchTerm('');
    setFilter('all');
  };

  // Video utility functions
  const getYouTubeVideoId = useCallback((url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);

  const getEmbedUrl = useCallback((videoData) => {
    if (!videoData) return null;
    
    const url = videoData.youtube_url || videoData.video_url || videoData.url;
    if (!url) return null;
    
    if (url.includes('embed')) {
      return url;
    }
    
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    }
    
    return url;
  }, [getYouTubeVideoId]);

  // Enhanced audio cleanup
  const cleanupAudio = useCallback(() => {
    if (audioCleanupInProgressRef.current) {
      return;
    }

    audioCleanupInProgressRef.current = true;
    shouldCancelRef.current = true;
    
    try {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
        audioTimeoutRef.current = null;
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        
        setTimeout(() => {
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
          }
        }, 50);

        setTimeout(() => {
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
          }
        }, 200);
      }

      setIsReading(false);
      setReadingId(null);
      currentUtteranceRef.current = null;
      isAudioActiveRef.current = false;
      
    } catch (error) {
      console.error('Error during audio cleanup:', error);
      setIsReading(false);
      setReadingId(null);
      currentUtteranceRef.current = null;
      isAudioActiveRef.current = false;
    } finally {
      setTimeout(() => {
        shouldCancelRef.current = false;
        audioCleanupInProgressRef.current = false;
      }, 300);
    }
  }, []);

  // Fetch video data
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setVideoLoading(true);
        const response = await fetch(`${API_URL}/video-sections/latest`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const embedUrl = getEmbedUrl(data.data);
          if (embedUrl) {
            setVideoData({
              ...data.data,
              embedUrl
            });
          }
        }
      } catch (err) {
        console.error('Error fetching video data:', err);
      } finally {
        setVideoLoading(false);
      }
    };

    fetchVideoData();
  }, [getEmbedUrl]);

  // Fetch all videos
  useEffect(() => {
    const fetchAllVideos = async () => {
      try {
        setVideosLoading(true);
        const response = await fetch(`${API_URL}/video-sections`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          const processedVideos = data.data.map(video => ({
            ...video,
            embedUrl: getEmbedUrl(video),
            searchText: `${video.title || ''} ${video.description || ''} ${video.tag || ''}`.toLowerCase()
          })).filter(video => video.embedUrl);
          
          setAllVideos(processedVideos);
        }
      } catch (err) {
        console.error('Error fetching all videos:', err);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchAllVideos();
  }, [getEmbedUrl]);

  // Enhanced cleanup on component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupAudio();
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden && isAudioActiveRef.current) {
        cleanupAudio();
      }
    };

    const handlePageHide = () => {
      cleanupAudio();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const trackView = useCallback(async (articleId) => {
    if (viewedArticles.has(articleId)) return;

    try {
      const response = await fetch(`${API_BASE}/blogs/${articleId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (response.ok) {
        setViewedArticles(prev => new Set([...prev, articleId]));
        setContent(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, views: (article.views || 0) + 1 }
            : article
        ));
      }
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }, [viewedArticles]);

  const fetchArticles = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      
      const endpoints = ['/blogs', '/blogs/published', '/articles'];
      let response = null;
      
      for (const endpoint of endpoints) {
        try {
          const fullUrl = `${API_BASE}${endpoint}`;
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
      
      const processedArticles = publishedArticles.map(blog => {
        return {
          ...blog,
          id: blog.id || blog._id || Math.random().toString(36),
          slug: blog.slug || blog.id || blog._id,
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
          comments: blog.comments || Math.floor(Math.random() * 20),
          searchText: `${blog.title || ''} ${blog.excerpt || ''} ${blog.content || ''} ${(blog.tags || []).join(' ')}`.toLowerCase()
        };
      });

      setContent(processedArticles);
      
      if (!silent) {
        console.log('Successfully fetched articles:', processedArticles);
      }
      
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      
      if (!silent) {
        setError(`Error loading articles: ${err.message}`);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Enhanced filtering logic
  useEffect(() => {
    let filteredArticles = [...content];
    let filteredVids = [...allVideos];

    if (activeSection === 'blogs') {
      filteredArticles = filteredArticles.filter(i => !i.is_news);
    } else if (activeSection === 'news') {
      filteredArticles = filteredArticles.filter(i => i.is_news);
    } else if (activeSection === 'featured') {
      filteredArticles = filteredArticles.filter(i => i.is_featured);
    }

    if (filter === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredArticles = filteredArticles.filter(i => new Date(i.published_at || i.created_at) >= weekAgo);
    } else if (filter === 'popular') {
      filteredArticles = filteredArticles.filter(i => i.views > 100);
    } else if (filter === 'trending') {
      filteredArticles = filteredArticles.filter(i => i.likes > 50 || i.comments > 10);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      
      filteredArticles = filteredArticles.filter(i =>
        i.searchText.includes(lower)
      );
      
      filteredVids = filteredVids.filter(video =>
        video.searchText.includes(lower)
      );
    }

    filteredArticles.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
      } else if (sortBy === 'popular') {
        return (b.views || 0) - (a.views || 0);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    filteredVids.sort((a, b) => new Date(b.created_at || new Date()) - new Date(a.created_at || new Date()));

    setFilteredContent(filteredArticles);
    setFilteredVideos(filteredVids);
    
    setVisibleArticles(isMobile ? INITIAL_ARTICLES_PER_PAGE_MOBILE : INITIAL_ARTICLES_PER_PAGE_DESKTOP);
    setVisibleVideos(INITIAL_VIDEOS_PER_PAGE);
  }, [searchTerm, filter, content, activeSection, sortBy, allVideos, isMobile]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('article');
    const section = urlParams.get('section');
    
    if (articleId && content.length > 0) {
      const article = content.find(item => item.id === articleId || item.slug === articleId);
      if (article) {
        setSelectedArticle(article);
        trackView(article.id);
      }
    }
    
    if (section) {
      setActiveSection(section);
    }
  }, [content, trackView]);

  // Updated navigation handler - now navigates to individual page
const handleArticleClick = useCallback((article) => {
    cleanupAudio();
    
    // Navigate to individual article page
    const articleUrl = `/blog/${article.slug || article.id}`;
    window.location.href = articleUrl;
  }, [trackView, cleanupAudio]);

  // Enhanced voice function
  const handleVoice = useCallback(async (article, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (readingId === article.id && isReading) {
      cleanupAudio();
      return;
    }

    cleanupAudio();
    await new Promise(resolve => setTimeout(resolve, 350));

    if (shouldCancelRef.current) {
      shouldCancelRef.current = false;
      return;
    }

    let textToRead = '';
    if (article.title) textToRead += article.title + '. ';
    if (article.excerpt) textToRead += article.excerpt + '. ';
    if (article.content) textToRead += article.content;
    
    const cleanText = textToRead
      .replace(/<[^>]*>/g, ' ')
      .replace(/[^\w\s.,!?;:'-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000);

    if (!cleanText) {
      alert('No text content available to read.');
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      
      utterance.onstart = () => {
        if (!shouldCancelRef.current) {
          setIsReading(true);
          setReadingId(article.id);
          currentUtteranceRef.current = utterance;
          isAudioActiveRef.current = true;
        } else {
          window.speechSynthesis.cancel();
        }
      };
      
      utterance.onend = () => {
        if (!shouldCancelRef.current) {
          setIsReading(false);
          setReadingId(null);
          currentUtteranceRef.current = null;
          isAudioActiveRef.current = false;
        }
      };
      
      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn(`Speech error: ${event.error}`);
        }
        setIsReading(false);
        setReadingId(null);
        currentUtteranceRef.current = null;
        isAudioActiveRef.current = false;
      };

      const startSpeech = () => {
        if (shouldCancelRef.current || audioCleanupInProgressRef.current) return;

        try {
          const voices = window.speechSynthesis.getVoices();
          
          if (voices.length > 0) {
            const preferredVoice = 
              voices.find(voice => 
                voice.lang === 'en-US' && 
                voice.localService
              ) ||
              voices.find(voice => voice.lang === 'en-US') ||
              voices.find(voice => voice.lang.startsWith('en-')) ||
              voices[0];
            
            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }
          }

          if (shouldCancelRef.current || audioCleanupInProgressRef.current) return;

          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            setTimeout(() => {
              if (!shouldCancelRef.current && !audioCleanupInProgressRef.current) {
                currentUtteranceRef.current = utterance;
                window.speechSynthesis.speak(utterance);
              }
            }, 150);
          } else {
            currentUtteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
          }
          
        } catch (error) {
          console.error('Error starting speech:', error);
          setIsReading(false);
          setReadingId(null);
          currentUtteranceRef.current = null;
          isAudioActiveRef.current = false;
        }
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        startSpeech();
      } else {
        let voicesLoaded = false;
        const handleVoicesChanged = () => {
          if (!voicesLoaded && !shouldCancelRef.current) {
            voicesLoaded = true;
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            startSpeech();
          }
        };
        
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        
        setTimeout(() => {
          if (!voicesLoaded && !shouldCancelRef.current) {
            voicesLoaded = true;
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            startSpeech();
          }
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error in speech synthesis setup:', error);
      setIsReading(false);
      setReadingId(null);
      currentUtteranceRef.current = null;
      isAudioActiveRef.current = false;
    }
  }, [isReading, readingId, cleanupAudio]);

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

  const handleLoadMoreArticles = () => {
    const increment = isMobile ? ARTICLES_LOAD_INCREMENT_MOBILE : ARTICLES_LOAD_INCREMENT_DESKTOP;
    setVisibleArticles(prev => Math.min(prev + increment, filteredContent.length));
  };

  const handleLoadMoreVideos = () => {
    setVisibleVideos(prev => Math.min(prev + VIDEOS_LOAD_INCREMENT, filteredVideos.length));
  };

  const displayedArticles = filteredContent.slice(0, visibleArticles);
  const displayedVideos = filteredVideos.slice(0, visibleVideos);

  const getHeroContent = () => {
    if (activeSection === 'news') {
      return {
        title: "Latest Climate News",
        subtitle: "Stay updated with breaking news and developments in climate action, environmental policies, and sustainability initiatives across Africa."
      };
    } else if (activeSection === 'blogs') {
      return {
        title: "ACEF Blog Insights",
        subtitle: "Discover in-depth articles about climate action, environmental research, and community impact stories from across Africa."
      };
    } else {
      return {
        title: "ACEF Insights & Updates",
        subtitle: "Stay informed with the latest climate action stories, environmental insights, and community impact updates from across Africa."
      };
    }
  };

  const heroContent = getHeroContent();

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: isDarkMode ? colors.background : colors.gray50,
      color: colors.text,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },
    hero: {
      background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(0, 0, 0, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
          : colors.accent,
      padding: isMobile ? '60px 20px 40px' : '80px 24px 60px',
      position: 'relative',
      overflow: 'hidden'
    },
    heroPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: isDarkMode ? 0.05 : 0.08,
      background: `
        radial-gradient(circle at 25% 25%, ${colors.primary} 2px, transparent 2px),
        radial-gradient(circle at 75% 75%, ${colors.primary} 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 20px 20px'
    },
    heroContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center',
      position: 'relative',
      zIndex: 2
    },
    heroTitle: {
       fontSize: 'clamp(2rem, 5vw, 3.5rem)',
       fontWeight: '800',
       lineHeight: '1.2',
       color: colors.primary,
       marginBottom: '24px',
       letterSpacing: '-0.02em',
       fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
     
    },
    heroSubtitle: {
      fontSize: isMobile ? '14px' : '18px',
      color: colors.textSecondary,
      margin: '0 auto 32px auto',
      maxWidth: isMobile ? '90%' : '600px',
      lineHeight: '1.6',
      textAlign: 'center',
      padding: isMobile ? '0 10px' : '0'
    },
    
    controlsSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '24px 16px' : '40px 24px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
      gap: isMobile ? '16px' : '24px',
      alignItems: 'center'
    },
  
    searchContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: isMobile ? '100%' : '500px'
    },
    searchInput: {
      width: '100%',
      padding: isMobile ? '14px 14px 14px 48px' : '16px 16px 16px 50px',
      fontSize: '16px',
      border: `2px solid ${isDarkMode ? colors.border : colors.gray200}`,
      borderRadius: '12px',
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      color: colors.text,
      outline: 'none',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit'
    },
  
    filterControls: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      justifyContent: isMobile ? 'space-between' : 'flex-start'
    },
    filterButton: {
      padding: isMobile ? '10px 14px' : '12px 16px',
      fontSize: '14px',
      fontWeight: 600,
      border: `2px solid ${isDarkMode ? colors.border : colors.gray200}`,
      borderRadius: '10px',
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      color: colors.text,
      outline: 'none',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      cursor: 'pointer',
      minHeight: '44px'
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: colors.white
    },

    // Action Banners
    actionBannersSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0 16px 24px' : '0 24px 40px'
    },
    actionBanners: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: isMobile ? '16px' : '20px',
      marginBottom: isMobile ? '24px' : '32px'
    },
    actionBanner: {
      background: isDarkMode 
        ? `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.accent}20 100%)`
        : `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.accent}10 100%)`,
      border: `2px solid ${colors.primary}30`,
      borderRadius: '16px',
      padding: isMobile ? '20px' : '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      minHeight: isMobile ? 'auto' : '160px'
    },
    actionBannerActive: {
      background: isDarkMode 
        ? `linear-gradient(135deg, ${colors.primary}40 0%, ${colors.accent}40 100%)`
        : `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.accent}20 100%)`,
      border: `2px solid ${colors.primary}`,
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${colors.primary}25`
    },
    bannerIcon: {
      marginBottom: '12px'
    },
    bannerTitle: {
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: 700,
      color: colors.text,
      margin: '0 0 8px 0'
    },
    bannerDescription: {
      fontSize: isMobile ? '13px' : '14px',
      color: colors.textSecondary,
      margin: '0 0 16px 0',
      lineHeight: '1.5'
    },
    bannerStats: {
      fontSize: '12px',
      color: colors.primary,
      fontWeight: 600
    },

    tabsContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0 16px' : '0 24px'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '8px',
      WebkitOverflowScrolling: 'touch'
    },
    tab: {
      padding: isMobile ? '10px 16px' : '12px 20px',
      fontSize: '14px',
      fontWeight: 600,
      border: `2px solid ${isDarkMode ? colors.border : colors.gray200}`,
      borderRadius: '25px',
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      color: colors.text,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap',
      minWidth: 'fit-content',
      minHeight: '44px'
    },
    tabActive: {
      backgroundColor: colors.primary,
      color: colors.white,
      borderColor: colors.primary,
      boxShadow: `0 2px 8px ${colors.primary}25`
    },

    contentSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0 16px 60px' : '0 24px 80px'
    },
    
    // Video Section
    videoSection: {
      marginBottom: isMobile ? '32px' : '48px',
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      borderRadius: '16px',
      padding: isMobile ? '20px' : '32px',
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`
    },
    videoHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: isMobile ? '16px' : '24px'
    },
    videoTitle: {
      fontSize: isMobile ? '18px' : '24px',
      fontWeight: 700,
      color: colors.text,
      margin: 0
    },
    videoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: isMobile ? '20px' : '24px'
    },
    
    // Articles Grid
    articlesGrid: {
      display: 'grid',
      gridTemplateColumns: viewMode === 'grid' 
        ? (isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))')
        : '1fr',
      gap: isMobile ? '20px' : '24px',
      marginTop: isMobile ? '24px' : '32px'
    },
    articleCard: {
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
      position: 'relative'
    },
    articleImage: {
      width: '100%',
      height: (viewMode === 'grid' && !isMobile) ? '220px' : (isMobile ? '200px' : '300px'),
      objectFit: 'cover'
    },
    articleContent: {
      padding: isMobile ? '20px' : '24px'
    },
    articleMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: isMobile ? '12px' : '16px',
      flexWrap: 'wrap'
    },
    articleTitle: {
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: 700,
      color: colors.text,
      margin: '0 0 12px 0',
      lineHeight: '1.4',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    articleExcerpt: {
      color: colors.textSecondary,
      fontSize: isMobile ? '13px' : '14px',
      lineHeight: '1.6',
      margin: '0 0 16px 0',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    articleFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: isMobile ? '12px' : '16px',
      borderTop: `1px solid ${isDarkMode ? colors.border : colors.gray100}`,
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? '12px' : '0'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px'
    },
    iconButton: {
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      color: colors.textSecondary,
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '40px',
      minHeight: '40px'
    },
    emptyState: {
      textAlign: 'center',
      padding: isMobile ? '60px 20px' : '80px 24px'
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
    
    // Video Cards
    videoCard: {
      backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.gray50,
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`
    },
    
    // Load More Button
    loadMoreContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: isMobile ? '32px' : '40px'
    },
    loadMoreButton: {
      padding: isMobile ? '12px 24px' : '14px 32px',
      fontSize: '14px',
      fontWeight: 600,
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      minWidth: isMobile ? '100%' : '200px',
      minHeight: '48px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p style={{ color: colors.textSecondary }}>Loading content...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.emptyState}>
          <h3 style={{ color: colors.text, margin: '0 0 16px 0' }}>Something went wrong</h3>
          <p style={{ color: colors.textSecondary, margin: '0 0 24px 0' }}>{error}</p>
          <button 
            onClick={() => fetchArticles(false)}
            style={{
              ...styles.filterButton,
              ...styles.filterButtonActive
            }}
          >
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: isMobile ? '20px 16px' : '40px 24px' 
        }}>
          <button 
            onClick={() => {
              cleanupAudio();
              setSelectedArticle(null);
            }}
            style={{
              ...styles.filterButton,
              marginTop: isMobile ? '20px' : '40px',
              marginBottom: isMobile ? '24px' : '32px'
            }}
          >
            <ArrowRight style={{ transform: 'rotate(180deg)' }} size={16} />
            Back to Articles
          </button>

          <article style={{
            backgroundColor: isDarkMode ? colors.surface : colors.white,
            border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: isMobile ? '250px' : '400px',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.gray100
            }}>
              <img 
                src={selectedArticle.featured_image ? getImageUrl(selectedArticle.featured_image) : DEFAULT_IMAGE}
                alt={selectedArticle.title} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={handleImageError}
              />
            </div>
            
            <div style={{ padding: isMobile ? '24px 20px' : '40px' }}>
              <div style={styles.articleMeta}>
                <span style={{
                  ...styles.badge,
                  backgroundColor: selectedArticle.is_news ? colors.error : colors.primary,
                  color: colors.white
                }}>
                  {selectedArticle.is_news ? 'News' : 'Article'}
                </span>
                {selectedArticle.is_featured && (
                  <span style={{
                    ...styles.badge,
                    backgroundColor: colors.warning + '20',
                    color: colors.warning
                  }}>
                    <Star size={10} style={{ marginRight: '4px' }} />
                    Featured
                  </span>
                )}
                <span style={{
                  color: colors.textSecondary,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={12} />
                  {getReadingTime(selectedArticle.content)} min read
                </span>
              </div>

              <h1 style={{ 
                color: colors.text,
                fontSize: isMobile ? '24px' : '36px',
                fontWeight: 800,
                lineHeight: '1.2',
                margin: '0 0 16px 0'
              }}>
                {selectedArticle.title}
              </h1>
              
              {selectedArticle.excerpt && (
                <p style={{ 
                  color: colors.textSecondary,
                  fontSize: isMobile ? '15px' : '18px',
                  lineHeight: '1.6',
                  margin: '0 0 24px 0'
                }}>
                  {selectedArticle.excerpt}
                </p>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: isMobile ? '24px' : '32px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  color: colors.textSecondary,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Calendar size={14} />
                  <span>{formatDate(selectedArticle.published_at || selectedArticle.created_at)}</span>
                </div>
              </div>

              <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
                <button 
                  onClick={() => handleVoice(selectedArticle)} 
                  style={{
                    ...styles.filterButton,
                    ...(isReading && readingId === selectedArticle.id ? styles.filterButtonActive : {}),
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  {isReading && readingId === selectedArticle.id ? (
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
              </div>

              <div style={{ 
                fontSize: isMobile ? '15px' : '16px',
                lineHeight: '1.8',
                color: colors.text
              }}>
                {selectedArticle.content && selectedArticle.content.split('\n').map((paragraph, i) => (
                  paragraph.trim() && (
                    <p key={i} style={{ 
                      marginBottom: '24px'
                    }}>
                      {paragraph}
                    </p>
                  )
                ))}
              </div>

              {selectedArticle.tags && Array.isArray(selectedArticle.tags) && selectedArticle.tags.length > 0 && (
                <div style={{ 
                  paddingTop: isMobile ? '24px' : '32px',
                  borderTop: `1px solid ${isDarkMode ? colors.border : colors.gray100}`,
                  marginTop: isMobile ? '24px' : '32px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <Tag size={16} style={{ color: colors.textSecondary }} />
                    <span style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: 600 }}>
                      Tags
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {selectedArticle.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        style={{
                          ...styles.badge,
                          backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.gray100,
                          color: colors.primary
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
        <Footer />
      </div>
    );
  }
 
  const blogsCount = content.filter(item => !item.is_news).length;
  const newsCount = content.filter(item => item.is_news).length;

  return (
    <div style={styles.container}>
      <Header />
      
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroPattern} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            {heroContent.title}
          </h1>
          <p style={styles.heroSubtitle}>
            {heroContent.subtitle}
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div style={styles.controlsSection}>
        <div style={styles.searchContainer}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textSecondary,
              zIndex: 1
            }} 
          />
          <input
            type="text"
            placeholder={isMobile ? "Search..." : "Search articles, news, videos, and updates..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterControls}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              ...styles.filterButton,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
              paddingRight: '32px',
              flex: isMobile ? '1' : 'auto'
            }}
          >
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="title">A-Z</option>
          </select>

          {!isMobile && (
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                ...styles.filterButton,
                backgroundColor: colors.primary + '10',
                borderColor: colors.primary
              }}
            >
              {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Action Banners Section */}
      <div style={styles.actionBannersSection}>
        <div style={styles.actionBanners}>
          <div 
            onClick={handleBlogsAction}
            style={{
              ...styles.actionBanner,
              ...(activeSection === 'blogs' ? styles.actionBannerActive : {})
            }}
          >
            <div style={styles.bannerIcon}>
              <BookOpen size={isMobile ? 28 : 32} style={{ color: colors.primary }} />
            </div>
            <h3 style={styles.bannerTitle}>Explore Our Blogs</h3>
            <p style={styles.bannerDescription}>
              Discover in-depth articles about climate action, sustainability, and environmental insights.
            </p>
            <div style={styles.bannerStats}>
              {blogsCount} Articles Available
            </div>
          </div>

          <div 
            onClick={handleNewsAction}
            style={{
              ...styles.actionBanner,
              ...(activeSection === 'news' ? styles.actionBannerActive : {})
            }}
          >
            <div style={styles.bannerIcon}>
              <Newspaper size={isMobile ? 28 : 32} style={{ color: colors.primary }} />
            </div>
            <h3 style={styles.bannerTitle}>Latest News</h3>
            <p style={styles.bannerDescription}>
              Stay updated with the latest news and developments in climate action across Africa.
            </p>
            <div style={styles.bannerStats}>
              {newsCount} News Updates
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabs}>
          {[
            { key: 'all', label: 'All Content', icon: Sparkles, count: content.length }
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              style={{
                ...styles.tab,
                ...(activeSection === key ? styles.tabActive : {})
              }}
            >
              <Icon size={16} />
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div style={styles.contentSection}>

        {/* Featured Video Section */}
        {(!searchTerm || (searchTerm && filteredVideos.length > 0)) && videoData && !videoLoading && (
          <div style={styles.videoSection}>
            <div style={styles.videoHeader}>
              <Video size={isMobile ? 20 : 24} style={{ color: colors.primary }} />
              <h2 style={styles.videoTitle}>Latest Video Updates</h2>
            </div>
            
            <div style={{
              backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.gray50,
              borderRadius: '16px',
              padding: isMobile ? '16px' : '24px',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 1fr) 1.5fr',
              gap: isMobile ? '20px' : '32px',
              alignItems: 'center'
            }}>
              <div>
                {videoData.tag && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: colors.primary + '15',
                    color: colors.primary,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: colors.error,
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    }} />
                    {videoData.tag}
                  </div>
                )}
                
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: 700,
                  color: colors.text,
                  margin: '0 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {videoData.title || 'ACEF Video Update'}
                </h3>
                
                {videoData.description && (
                  <p style={{
                    color: colors.textSecondary,
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: '0 0 20px 0'
                  }}>
                    {videoData.description}
                  </p>
                )}
                
                <button
                  onClick={() => setShowVideoPlayer(true)}
                  style={{
                    ...styles.filterButton,
                    ...styles.filterButtonActive,
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  <Volume2 size={16} />
                  Watch Video
                </button>
              </div>
              
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%',
                height: 0,
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: colors.primary + '10',
                cursor: 'pointer'
              }}
              onClick={() => setShowVideoPlayer(true)}
              >
                {videoData.embedUrl ? (
                  <iframe
                    src={videoData.embedUrl.replace('autoplay=0', 'autoplay=0')}
                    title={videoData.title || 'ACEF Video'}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primary,
                    color: colors.white
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <Volume2 size={48} style={{ marginBottom: '12px' }} />
                      <p style={{ margin: 0, fontSize: '14px' }}>Video Preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          overflowX: isMobile ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'recent', label: 'Recent' },
            { key: 'popular', label: 'Popular' },
            { key: 'trending', label: 'Trending' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                ...styles.filterButton,
                ...(filter === key ? styles.filterButtonActive : {}),
                minWidth: isMobile ? '80px' : 'auto'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {filteredContent.length === 0 && filteredVideos.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📰</div>
            <h3 style={{ color: colors.text, margin: '0 0 16px 0' }}>
              No content found
            </h3>
            <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>
              {content.length === 0 
                ? "We're working on bringing you great content. Check back soon!"
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            {(searchTerm || filter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setActiveSection('all');
                }} 
                style={{
                  ...styles.filterButton,
                  ...styles.filterButtonActive
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Articles Section */}
            {displayedArticles.length > 0 && (
              <>
                <div style={styles.articlesGrid}>
                  {displayedArticles.map((article) => (
                    <article 
                      key={article.id} 
                      onClick={() => handleArticleClick(article)}
                      style={{
                        ...styles.articleCard,
                        ...(viewMode === 'list' && !isMobile ? {
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'stretch'
                        } : {})
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = `0 12px 40px ${colors.cardShadow || 'rgba(0, 0, 0, 0.15)'}`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <div style={{
                        ...(viewMode === 'list' && !isMobile ? {
                          width: '300px',
                          flexShrink: 0
                        } : {
                          width: '100%',
                          height: styles.articleImage.height
                        }),
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.gray100
                      }}>
                        <img 
                          src={article.featured_image ? getImageUrl(article.featured_image) : DEFAULT_IMAGE}
                          alt={article.title}
                          style={{
                            ...styles.articleImage,
                            ...(viewMode === 'list' && !isMobile ? { height: '100%' } : {})
                          }}
                          onError={handleImageError}
                          loading="lazy"
                        />
                      </div>

                      <div style={styles.articleContent}>
                        <h3 style={styles.articleTitle}>
                          {article.title}
                        </h3>
                        
                        {article.excerpt && (
                          <p style={styles.articleExcerpt}>
                            {article.excerpt}
                          </p>
                        )}

                        <div style={styles.articleFooter}>
                          <div style={styles.articleMeta}>
                            <span style={{
                              color: colors.textSecondary,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Calendar size={12} />
                              {formatDate(article.published_at || article.created_at)}
                            </span>
                            <span style={{
                              color: colors.textSecondary,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Clock size={12} />
                              {getReadingTime(article.content)} min
                            </span>
                          </div>

                          <div style={styles.actionButtons}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVoice(article);
                              }}
                              style={{
                                ...styles.iconButton,
                                ...(isReading && readingId === article.id ? {
                                  backgroundColor: colors.primary,
                                  color: colors.white
                                } : {})
                              }}
                              title="Listen to article"
                            >
                              {isReading && readingId === article.id ? <Square size={14} /> : <Volume2 size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Load More Button for Articles */}
                {visibleArticles < filteredContent.length && (
                  <div style={styles.loadMoreContainer}>
                    <button
                      onClick={handleLoadMoreArticles}
                      style={styles.loadMoreButton}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.target.style.backgroundColor = colors.primaryDark || colors.primary;
                          e.target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.target.style.backgroundColor = colors.primary;
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <ChevronDown size={16} />
                      Load More ({Math.min(isMobile ? ARTICLES_LOAD_INCREMENT_MOBILE : ARTICLES_LOAD_INCREMENT_DESKTOP, filteredContent.length - visibleArticles)} more)
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Videos Section */}
            {displayedVideos.length > 0 && (
              <div style={{
                marginTop: displayedArticles.length > 0 ? (isMobile ? '48px' : '60px') : '0',
                backgroundColor: isDarkMode ? colors.surface : colors.white,
                borderRadius: '16px',
                padding: isMobile ? '20px' : '32px',
                border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`
              }}>
                <div style={styles.videoHeader}>
                  <Video size={isMobile ? 20 : 24} style={{ color: colors.primary }} />
                  <h2 style={styles.videoTitle}>Video Library</h2>
                </div>
                
                <div style={styles.videoGrid}>
                  {displayedVideos.map((video, index) => (
                    <div key={video.id || index} style={styles.videoCard}>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '56.25%',
                        height: 0,
                        overflow: 'hidden'
                      }}>
                        {video.embedUrl ? (
                          <iframe
                            src={video.embedUrl}
                            title={video.title || `ACEF Video ${index + 1}`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none'
                            }}
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: colors.primary + '20',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.primary
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <Volume2 size={32} style={{ marginBottom: '8px' }} />
                              <p style={{ margin: 0, fontSize: '12px' }}>Video Preview</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ padding: '16px' }}>
                        {video.tag && (
                          <div style={{
                            display: 'inline-block',
                            backgroundColor: colors.primary + '15',
                            color: colors.primary,
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 600,
                            marginBottom: '8px',
                            textTransform: 'uppercase'
                          }}>
                            {video.tag}
                          </div>
                        )}
                        
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: colors.text,
                          margin: '0 0 8px 0',
                          lineHeight: '1.3',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {video.title || 'ACEF Video Update'}
                        </h4>
                        
                        {video.description && (
                          <p style={{
                            color: colors.textSecondary,
                            fontSize: '12px',
                            lineHeight: '1.4',
                            margin: '0 0 12px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {video.description}
                          </p>
                        )}
                        
                        {video.created_at && (
                          <div style={{
                            color: colors.textSecondary,
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Calendar size={10} />
                            {formatDate(video.created_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button for Videos */}
                {visibleVideos < filteredVideos.length && (
                  <div style={styles.loadMoreContainer}>
                    <button
                      onClick={handleLoadMoreVideos}
                      style={styles.loadMoreButton}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.target.style.backgroundColor = colors.primaryDark || colors.primary;
                          e.target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.target.style.backgroundColor = colors.primary;
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <ChevronDown size={16} />
                      Load More Videos ({Math.min(VIDEOS_LOAD_INCREMENT, filteredVideos.length - visibleVideos)} more)
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && videoData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '10px' : '20px'
        }}>
          <div style={{
            backgroundColor: isDarkMode ? colors.surface : colors.white,
            borderRadius: '16px',
            padding: '0',
            maxWidth: isMobile ? '100%' : '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowVideoPlayer(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                color: colors.white,
                cursor: 'pointer',
                fontSize: '24px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              ×
            </button>
            
            {videoData.embedUrl ? (
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%',
                height: 0
              }}>
                <iframe
                  src={videoData.embedUrl.replace('autoplay=0', 'autoplay=1')}
                  title={videoData.title || 'ACEF Video Update'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '16px'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '400px',
                backgroundColor: colors.backgroundSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                color: colors.textSecondary
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Video size={64} style={{ marginBottom: '16px' }} />
                  <h3 style={{ margin: '0 0 8px 0', color: colors.text }}>
                    {videoData.title || 'ACEF Video Update'}
                  </h3>
                  <p style={{ margin: 0 }}>
                    Video content will be available soon
                  </p>
                </div>
              </div>
            )}
            
            {(videoData.title || videoData.description) && (
              <div style={{ padding: isMobile ? '20px' : '24px' }}>
                {videoData.title && (
                  <h3 style={{ 
                    color: colors.text, 
                    margin: '0 0 12px 0',
                    fontSize: isMobile ? '18px' : '20px',
                    fontWeight: 700
                  }}>
                    {videoData.title}
                  </h3>
                )}
                
                {videoData.description && (
                  <p style={{ 
                    color: colors.textSecondary,
                    margin: 0,
                    lineHeight: '1.6',
                    fontSize: '14px'
                  }}>
                    {videoData.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <MailList/>
      <Footer />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        
        /* Hide scrollbar for mobile tabs */
        .tabs::-webkit-scrollbar {
          display: none;
        }
        
        .tabs {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
export default BlogUserPage;

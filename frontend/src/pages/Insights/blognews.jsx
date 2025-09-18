import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Calendar, Search, Star, ArrowRight, Clock, Tag, Sparkles,
  TrendingUp, Volume2, Square, Grid3X3, List,
  Video, ChevronDown, ChevronUp, AlignCenter, Newspaper, BookOpen
} from 'lucide-react';
import { useTheme } from '../../theme';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MailList from '../../components/MailList';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';
const API_BASE = API_URL;

// Constants for pagination
const INITIAL_ARTICLES_PER_PAGE = 6;
const ARTICLES_LOAD_INCREMENT = 6;
const INITIAL_VIDEOS_PER_PAGE = 3;
const VIDEOS_LOAD_INCREMENT = 3;

// Default placeholder image as base64 data URL
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
  const { colors, isDarkMode } = useTheme();
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
  
  // Incremental pagination states
  const [visibleArticles, setVisibleArticles] = useState(INITIAL_ARTICLES_PER_PAGE);
  const [visibleVideos, setVisibleVideos] = useState(INITIAL_VIDEOS_PER_PAGE);
  
  // Video integration
  const [videoData, setVideoData] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [allVideos, setAllVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [filteredVideos, setFilteredVideos] = useState([]);
  
  // Audio management - Enhanced refs
  const currentUtteranceRef = useRef(null);
  const audioTimeoutRef = useRef(null);
  const isAudioInitializedRef = useRef(false);
  const speechCancelledRef = useRef(false);

  // Video utility functions - memoized with useCallback
  const getYouTubeVideoId = useCallback((url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);

  const getEmbedUrl = useCallback((videoData) => {
    if (!videoData) return null;
    
    // Check for different URL fields
    const url = videoData.youtube_url || videoData.video_url || videoData.url;
    if (!url) return null;
    
    // If it's already an embed URL, return it
    if (url.includes('embed')) {
      return url;
    }
    
    // If it's a YouTube URL, convert to embed
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    }
    
    // For other video formats, return as is
    return url;
  }, [getYouTubeVideoId]);

  // Enhanced audio cleanup function with better error handling
  const cleanupAudio = useCallback(() => {
    try {
      // Set cancellation flag to prevent error alerts
      speechCancelledRef.current = true;
      
      // Clear any existing timeouts
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
        audioTimeoutRef.current = null;
      }

      // Cancel any ongoing speech with proper error handling
      if (window.speechSynthesis) {
        // Cancel current speech
        window.speechSynthesis.cancel();
        
        // Wait a moment and cancel again if still speaking
        setTimeout(() => {
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
          }
          // Reset cancellation flag after cleanup
          setTimeout(() => {
            speechCancelledRef.current = false;
          }, 500);
        }, 100);
      }

      // Reset states
      setIsReading(false);
      setReadingId(null);
      currentUtteranceRef.current = null;
      isAudioInitializedRef.current = false;
      
    } catch (error) {
      console.error('Error during audio cleanup:', error);
      // Force reset states even if cleanup fails
      setIsReading(false);
      setReadingId(null);
      currentUtteranceRef.current = null;
      speechCancelledRef.current = false;
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
          // Validate that we have usable video data
          const embedUrl = getEmbedUrl(data.data);
          if (embedUrl) {
            setVideoData({
              ...data.data,
              embedUrl
            });
          } else {
            console.warn('No valid video URL found in data:', data.data);
          }
        } else {
          console.warn('Video data fetch failed:', data.message || 'No video data');
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
            // Add searchable text for videos
            searchText: `${video.title || ''} ${video.description || ''} ${video.tag || ''}`.toLowerCase()
          })).filter(video => video.embedUrl);
          
          setAllVideos(processedVideos);
        } else {
          console.warn('Videos fetch failed:', data.message || 'No videos data');
        }
      } catch (err) {
        console.error('Error fetching all videos:', err);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchAllVideos();
  }, [getEmbedUrl]);

  // Enhanced cleanup on component unmount and visibility changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupAudio();
    };

    const handleVisibilityChange = () => {
      if (document.hidden && (isReading || window.speechSynthesis?.speaking)) {
        cleanupAudio();
      }
    };

    const handlePageHide = () => {
      cleanupAudio();
    };

    // Add multiple event listeners for comprehensive cleanup
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      cleanupAudio();
    };
  }, [isReading, cleanupAudio]);

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
      
      // Filter for published articles and process them
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
          // Add searchable text
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

  // Enhanced filtering logic for articles and videos
  useEffect(() => {
    let filteredArticles = [...content];
    let filteredVids = [...allVideos];

    // Section filter for articles
    if (activeSection === 'blogs') {
      filteredArticles = filteredArticles.filter(i => !i.is_news);
    } else if (activeSection === 'news') {
      filteredArticles = filteredArticles.filter(i => i.is_news);
    } else if (activeSection === 'featured') {
      filteredArticles = filteredArticles.filter(i => i.is_featured);
    }
    // 'all' shows everything

    // Content filter for articles
    if (filter === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredArticles = filteredArticles.filter(i => new Date(i.published_at || i.created_at) >= weekAgo);
    } else if (filter === 'popular') {
      filteredArticles = filteredArticles.filter(i => i.views > 100);
    } else if (filter === 'trending') {
      filteredArticles = filteredArticles.filter(i => i.likes > 50 || i.comments > 10);
    }

    // Search filter for both articles and videos
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      
      // Filter articles
      filteredArticles = filteredArticles.filter(i =>
        i.searchText.includes(lower)
      );
      
      // Filter videos
      filteredVids = filteredVids.filter(video =>
        video.searchText.includes(lower)
      );
    }

    // Sort articles
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

    // Sort videos by date
    filteredVids.sort((a, b) => new Date(b.created_at || new Date()) - new Date(a.created_at || new Date()));

    setFilteredContent(filteredArticles);
    setFilteredVideos(filteredVids);
    
    // Reset pagination when content changes
    setVisibleArticles(INITIAL_ARTICLES_PER_PAGE);
    setVisibleVideos(INITIAL_VIDEOS_PER_PAGE);
  }, [searchTerm, filter, content, activeSection, sortBy, allVideos]);

  // Add this to your BlogUserPage component, after your existing useEffect hooks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('article');
    const section = urlParams.get('section');
    
    // Handle article selection
    if (articleId && content.length > 0) {
      const article = content.find(item => item.id === articleId);
      if (article) {
        setSelectedArticle(article);
        trackView(article.id);
      }
    }
    
    // Handle section filtering
    if (section) {
      setActiveSection(section);
    }
  }, [content, trackView]);

  const handleArticleClick = useCallback(async (article) => {
    // Clean up any ongoing audio before navigation
    cleanupAudio();
    
    await trackView(article.id);
    setSelectedArticle(article);
  }, [trackView, cleanupAudio]);

  // Enhanced voice function with auto-open functionality
  const handleVoice = useCallback(async (article) => {
    // Check if speech synthesis is available
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    // If article is not open, open it first
    if (!selectedArticle || selectedArticle.id !== article.id) {
      await trackView(article.id);
      setSelectedArticle(article);
    }

    // If currently reading this article, stop it
    if (readingId === article.id && isReading) {
      cleanupAudio();
      return;
    }

    // Clean up any existing audio first
    cleanupAudio();

    // Wait for cleanup to complete before starting new speech
    setTimeout(() => {
      // Reset cancellation flag
      speechCancelledRef.current = false;

      // Prepare text to read
      let textToRead = '';
      if (article.title) textToRead += article.title + '. ';
      if (article.excerpt) textToRead += article.excerpt + '. ';
      if (article.content) textToRead += article.content;
      
      // Clean and limit the text
      const cleanText = textToRead
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/[^\w\s.,!?;:'-]/g, ' ') // Keep basic punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, 1000); // Increased limit for better experience

      if (!cleanText) {
        alert('No text content available to read.');
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Configure utterance with optimized settings
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        utterance.lang = 'en-US';
        
        // Enhanced event handlers with better state management
        utterance.onstart = () => {
          console.log('Speech started for:', article.title);
          if (!speechCancelledRef.current) {
            setIsReading(true);
            setReadingId(article.id);
            currentUtteranceRef.current = utterance;
            isAudioInitializedRef.current = true;
          }
        };
        
        utterance.onend = () => {
          console.log('Speech ended for:', article.title);
          // Always reset states on end, regardless of cancellation
          setIsReading(false);
          setReadingId(null);
          currentUtteranceRef.current = null;
          isAudioInitializedRef.current = false;
        };
        
        utterance.onerror = (event) => {
          console.error('Speech error:', event.error, event);
          
          // Reset states on any error
          setIsReading(false);
          setReadingId(null);
          currentUtteranceRef.current = null;
          isAudioInitializedRef.current = false;
          
          // Only show alert for actual errors, not interruptions
          if (event.error !== 'interrupted' && 
              event.error !== 'canceled' && 
              event.error !== 'cancelled' &&
              !speechCancelledRef.current) {
            // Wait a bit before showing alert to avoid multiple alerts
            setTimeout(() => {
              if (!speechCancelledRef.current) {
                console.warn(`Speech error: ${event.error}. Continuing...`);
              }
            }, 100);
          }
        };

        // Function to start speech with proper voice selection
        const startSpeech = () => {
          if (speechCancelledRef.current) {
            return;
          }

          try {
            // Get available voices
            const voices = window.speechSynthesis.getVoices();
            
            if (voices.length > 0) {
              // Improved voice selection logic
              const preferredVoice = 
                // First try: Local English US voice (not Microsoft if possible)
                voices.find(voice => 
                  voice.lang === 'en-US' && 
                  voice.localService && 
                  !voice.name.toLowerCase().includes('microsoft')
                ) ||
                // Second try: Any local English US voice
                voices.find(voice => 
                  voice.lang === 'en-US' && 
                  voice.localService
                ) ||
                // Third try: Any English US voice
                voices.find(voice => 
                  voice.lang === 'en-US'
                ) ||
                // Fourth try: Any English voice
                voices.find(voice => 
                  voice.lang.startsWith('en-')
                ) ||
                // Fallback: First available voice
                voices[0];
              
              if (preferredVoice) {
                utterance.voice = preferredVoice;
                console.log('Selected voice:', preferredVoice.name, preferredVoice.lang);
              }
            }

            // Final check before speaking
            if (speechCancelledRef.current) {
              return;
            }

            // Ensure speech synthesis is ready
            if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
              console.log('Speech synthesis busy, canceling existing...');
              window.speechSynthesis.cancel();
              
              // Wait for cancel to complete
              setTimeout(() => {
                if (!speechCancelledRef.current) {
                  currentUtteranceRef.current = utterance;
                  window.speechSynthesis.speak(utterance);
                  console.log('Speech synthesis started after cleanup');
                }
              }, 100);
            } else {
              currentUtteranceRef.current = utterance;
              window.speechSynthesis.speak(utterance);
              console.log('Speech synthesis started immediately');
            }
            
          } catch (error) {
            console.error('Error starting speech:', error);
            if (!speechCancelledRef.current) {
              setIsReading(false);
              setReadingId(null);
              currentUtteranceRef.current = null;
            }
          }
        };

        // Handle voice loading
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          startSpeech();
        } else {
          // Wait for voices to load
          let voicesLoaded = false;
          const maxWaitTime = 2000;
          
          const handleVoicesChanged = () => {
            if (!voicesLoaded && !speechCancelledRef.current) {
              voicesLoaded = true;
              window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
              startSpeech();
            }
          };
          
          window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
          
          // Fallback timeout
          setTimeout(() => {
            if (!voicesLoaded && !speechCancelledRef.current) {
              voicesLoaded = true;
              window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
              console.log('Voice loading timeout, starting with default voice');
              startSpeech();
            }
          }, maxWaitTime);
        }
        
      } catch (error) {
        console.error('Error in speech synthesis setup:', error);
        if (!speechCancelledRef.current) {
          setIsReading(false);
          setReadingId(null);
          currentUtteranceRef.current = null;
        }
      }
    }, 200); // Reduced delay for better responsiveness
  }, [isReading, readingId, cleanupAudio, selectedArticle, trackView]);

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

  // Enhanced image error handler
  const handleImageError = useCallback((e) => {
    e.target.src = DEFAULT_IMAGE;
    e.target.onerror = null; // Prevent infinite loop
  }, []);

  // Incremental load more handlers
  const handleLoadMoreArticles = () => {
    setVisibleArticles(prev => Math.min(prev + ARTICLES_LOAD_INCREMENT, filteredContent.length));
  };

  const handleLoadMoreVideos = () => {
    setVisibleVideos(prev => Math.min(prev + VIDEOS_LOAD_INCREMENT, filteredVideos.length));
  };

  // Calculate displayed items
  const displayedArticles = filteredContent.slice(0, visibleArticles);
  const displayedVideos = filteredVideos.slice(0, visibleVideos);

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

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: isDarkMode ? colors.background : colors.gray50,
      color: colors.text,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },
    hero: {
      background: isDarkMode 
        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      padding: '80px 24px 60px',
      position: 'relative',
      overflow: 'hidden'
    },
    heroPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      background: `
        radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
        radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
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
      fontSize: 'clamp(32px, 6vw, 64px)',
      fontWeight: 800,
      color: colors.white,
      margin: '0 0 16px 0',
      lineHeight: '1.1',
      letterSpacing: '-0.02em'
    },
    heroSubtitle: {
      fontSize: '18px',
      color: colors.white,
      opacity: 0.9,
      margin: '0 auto 32px auto',
      maxWidth: '600px',
      lineHeight: '1.6',
      textAlign: 'center'
    },
    
    controlsSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '24px',
      alignItems: 'center'
    },
  
    searchContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '500px'
    },
    searchInput: {
      width: '100%',
      padding: '16px 16px 16px 50px',
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
      alignItems: 'center'
    },
    filterButton: {
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 600,
      border: `2px solid ${isDarkMode ? colors.border : colors.gray200}`,
      borderRadius: '10px',
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      color: colors.text,
      outline: 'none',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      cursor: 'pointer'
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
      padding: '0 24px 40px'
    },
    actionBanners: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    actionBanner: {
      background: isDarkMode 
        ? `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.accent}20 100%)`
        : `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.accent}10 100%)`,
      border: `2px solid ${colors.primary}30`,
      borderRadius: '16px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
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
      fontSize: '18px',
      fontWeight: 700,
      color: colors.text,
      margin: '0 0 8px 0'
    },
    bannerDescription: {
      fontSize: '14px',
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
      padding: '0 24px'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '8px'
    },
    tab: {
      padding: '12px 20px',
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
      minWidth: 'fit-content'
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
      padding: '0 24px 80px'
    },
    
    // Video Section (Modular)
    videoSection: {
      marginBottom: '48px',
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      borderRadius: '16px',
      padding: '32px',
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`
    },
    videoHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px'
    },
    videoTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: colors.text,
      margin: 0
    },
    videoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    
    // Articles Grid
    articlesGrid: {
      display: 'grid',
      gridTemplateColumns: viewMode === 'grid' 
        ? 'repeat(auto-fit, minmax(350px, 1fr))' 
        : '1fr',
      gap: '24px',
      marginTop: '32px'
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
      height: viewMode === 'grid' ? '220px' : '300px',
      objectFit: 'cover'
    },
    articleContent: {
      padding: '24px'
    },
    articleMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    articleTitle: {
      fontSize: '18px',
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
      fontSize: '14px',
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
      paddingTop: '16px',
      borderTop: `1px solid ${isDarkMode ? colors.border : colors.gray100}`
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
      justifyContent: 'center'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 24px'
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
      marginTop: '40px'
    },
    loadMoreButton: {
      padding: '14px 32px',
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
      minWidth: '200px'
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
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
          <button 
            onClick={() => {
              cleanupAudio(); // Stop audio when closing article
              setSelectedArticle(null);
            }}
            style={{
              ...styles.filterButton,
              marginTop: '40px',
              marginBottom: '32px'
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
              height: '400px',
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
            
            <div style={{ padding: '40px' }}>
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
                fontSize: '36px',
                fontWeight: 800,
                lineHeight: '1.2',
                margin: '0 0 16px 0'
              }}>
                {selectedArticle.title}
              </h1>
              
              {selectedArticle.excerpt && (
                <p style={{ 
                  color: colors.textSecondary,
                  fontSize: '18px',
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
                marginBottom: '32px',
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

              <div style={{ marginBottom: '32px' }}>
                <button 
                  onClick={() => handleVoice(selectedArticle)} 
                  style={{
                    ...styles.filterButton,
                    ...(isReading && readingId === selectedArticle.id ? styles.filterButtonActive : {})
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
                fontSize: '16px',
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
                  paddingTop: '32px',
                  borderTop: `1px solid ${isDarkMode ? colors.border : colors.gray100}`,
                  marginTop: '32px'
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
            ACEF Insights & Updates
          </h1>
          <p style={styles.heroSubtitle}>
            Stay informed with the latest climate action stories, environmental insights, 
            and community impact updates from across Africa.
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
            placeholder="Search articles, news, videos, and updates..."
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
              paddingRight: '32px'
            }}
          >
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="title">A-Z</option>
          </select>

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
              <BookOpen size={32} style={{ color: colors.primary }} />
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
              <Newspaper size={32} style={{ color: colors.primary }} />
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

        {/* Featured Video Section - Only show if no search or videos match search */}
        {(!searchTerm || (searchTerm && filteredVideos.length > 0)) && videoData && !videoLoading && (
          <div style={styles.videoSection}>
            <div style={styles.videoHeader}>
              <Video size={24} style={{ color: colors.primary }} />
              <h2 style={styles.videoTitle}>Latest Video Updates</h2>
            </div>
            
            <div style={{
              backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.gray50,
              borderRadius: '16px',
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr',
              gap: '32px',
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
                  fontSize: '20px',
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
                    ...styles.filterButtonActive
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
          flexWrap: 'wrap'
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
                ...(filter === key ? styles.filterButtonActive : {})
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
                        ...(viewMode === 'list' ? {
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'stretch'
                        } : {})
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 12px 40px ${colors.cardShadow || 'rgba(0, 0, 0, 0.15)'}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        ...(viewMode === 'list' ? {
                          width: '300px',
                          flexShrink: 0
                        } : {
                          width: '100%',
                          height: '220px'
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
                            ...(viewMode === 'list' ? { height: '100%' } : {})
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
                        e.target.style.backgroundColor = colors.primaryDark || colors.primary;
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = colors.primary;
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <ChevronDown size={16} />
                      Load More Articles ({Math.min(ARTICLES_LOAD_INCREMENT, filteredContent.length - visibleArticles)} more)
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Videos Section - Only show if there are filtered videos */}
            {displayedVideos.length > 0 && (
              <div style={{
                marginTop: displayedArticles.length > 0 ? '60px' : '0',
                backgroundColor: isDarkMode ? colors.surface : colors.white,
                borderRadius: '16px',
                padding: '32px',
                border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`
              }}>
                <div style={styles.videoHeader}>
                  <Video size={24} style={{ color: colors.primary }} />
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
                        e.target.style.backgroundColor = colors.primaryDark || colors.primary;
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = colors.primary;
                        e.target.style.transform = 'translateY(0)';
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
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: isDarkMode ? colors.surface : colors.white,
            borderRadius: '16px',
            padding: '0',
            maxWidth: '900px',
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
              <div style={{ padding: '24px' }}>
                {videoData.title && (
                  <h3 style={{ 
                    color: colors.text, 
                    margin: '0 0 12px 0',
                    fontSize: '20px',
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
        
        @media (max-width: 768px) {
          .controls-section {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .filter-controls {
            justify-content: center;
          }
          
          .tabs {
            flex-wrap: wrap;
          }
          
          .tab {
            min-width: 120px;
          }
          
          .articles-grid {
            grid-template-columns: 1fr !important;
          }
          
          .article-card.list-mode {
            flex-direction: column !important;
          }
          
          .article-card.list-mode .article-image {
            width: 100% !important;
            height: 200px !important;
          }
          
          .video-section-content {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            text-align: center;
          }
          
          .section-header {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            text-align: center;
          }
          
          .contextual-banner {
            max-width: none !important;
            min-width: auto !important;
          }
          
          .dual-banner-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogUserPage;
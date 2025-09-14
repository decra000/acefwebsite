// controllers/blogController.js - FIXED VERSION with proper permission system
const Blog = require('../models/Blog');
const { executeQuery } = require('../config/database');

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// Helper function to generate session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// FIXED: Check if user can approve blogs
const canApproveBlog = (user) => {
  if (!user) return false;
  
  // Admins can always approve
  if (user.role === 'admin') return true;
  
  // Assistant Admins with manage_content permission can approve
  if (user.role === 'Assistant Admin') {
    const permissions = Array.isArray(user.permissions) ? user.permissions : 
                       (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : []);
    return permissions.includes('manage_content');
  }
  
  return false;
};

// FIXED: Check if user can manage blogs (create, edit)
const canManageBlog = (user) => {
  if (!user) return false;
  
  // Admins can always manage
  if (user.role === 'admin') return true;
  
  // Content Managers can manage
  if (user.role === 'Content Manager') return true;
  
  // Assistant Admins with manage_content permission can manage
  if (user.role === 'Assistant Admin') {
    const permissions = Array.isArray(user.permissions) ? user.permissions : 
                       (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : []);
    return permissions.includes('manage_content');
  }
  
  return false;
};

// FIXED: Get users who can approve blogs (for notifications)
const getBlogApprovers = async () => {
  try {
    // Get all admins
    const adminQuery = "SELECT id, name, email, role FROM users WHERE role = 'admin'";
    const admins = await executeQuery(adminQuery);
    
    // Get Assistant Admins with manage_content permission
    const assistantAdminQuery = `
      SELECT id, name, email, role, permissions 
      FROM users 
      WHERE role = 'Assistant Admin' 
      AND JSON_CONTAINS(permissions, '"manage_content"')
    `;
    const assistantAdmins = await executeQuery(assistantAdminQuery);
    
    // Combine both groups
    const approvers = [...admins, ...assistantAdmins];
    
    console.log(`Found ${approvers.length} blog approvers:`, approvers.map(u => `${u.name} (${u.role})`));
    return approvers;
  } catch (error) {
    console.error('Error fetching blog approvers:', error);
    return [];
  }
};

// Enhanced notification system
const createNotification = async (userId, type, title, message, relatedId = null, relatedType = null) => {
  try {
    if (!userId || !type || !title || !message) {
      console.error('createNotification: Missing required parameters');
      return null;
    }

    const processedRelatedId = relatedId && !isNaN(parseInt(relatedId)) ? parseInt(relatedId) : null;
    const processedRelatedType = processedRelatedId ? relatedType : null;

    const query = `
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
    `;
    
    const params = [
      parseInt(userId), 
      type, 
      title, 
      message, 
      processedRelatedId, 
      processedRelatedType
    ];
    
    const result = await executeQuery(query, params);
    console.log(`Notification created for user ${userId}: ${title}`);
    return result;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// FIXED: Notify blog approvers about blog changes
const notifyBlogApprovers = async (blog, action, authorName) => {
  try {
    const approvers = await getBlogApprovers();
    
    if (approvers.length === 0) {
      console.log('No blog approvers found for notifications');
      return;
    }
    
    if (!blog || !blog.id || !blog.title) {
      console.error('notifyBlogApprovers: Invalid blog object', blog);
      return;
    }

    let title, message;
    switch (action) {
      case 'created':
        title = 'New Blog Post Needs Approval';
        message = `${authorName} has created a new blog post "${blog.title}" that requires approval.`;
        break;
      case 'updated':
        title = 'Blog Post Updated - Re-approval Needed';
        message = `${authorName} has updated the blog post "${blog.title}" and it requires re-approval.`;
        break;
      default:
        console.log('Unknown notification action:', action);
        return;
    }

    // Create notifications for all approvers
    const notifications = approvers.map(approver => {
      if (!approver.id) {
        console.error('Invalid approver:', approver);
        return Promise.resolve(null);
      }
      return createNotification(approver.id, `blog_${action}`, title, message, blog.id, 'blog_post');
    });
    
    const results = await Promise.allSettled(notifications);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    console.log(`Notified ${successCount}/${approvers.length} blog approvers about blog ${action}: ${blog.title}`);
  } catch (error) {
    console.error('Error notifying blog approvers:', error);
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const { limit, search, tag } = req.query;
    let blogs;
    
    if (search) {
      blogs = await Blog.search(search);
    } else if (tag) {
      blogs = await Blog.getByTag(tag);
    } else {
      blogs = await Blog.getAll(limit ? parseInt(limit) : null);
    }
    
    res.json({ success: true, data: blogs || [] });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blog posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getAllAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.getAllAdmin();
    res.json({ success: true, data: blogs || [] });
  } catch (error) {
    console.error('Error fetching admin blog posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching admin blog posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.getBySlug(req.params.slug);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.getById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog post by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const trackBlogView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const sessionId = req.session?.id || generateSessionId();

    const blog = await Blog.getById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const recentViewQuery = `
      SELECT id FROM blog_views 
      WHERE blog_id = ? AND ip_address = ? AND viewed_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      LIMIT 1
    `;
    const recentViews = await executeQuery(recentViewQuery, [parseInt(id), ipAddress]);

    if (recentViews.length === 0) {
      const viewQuery = `
        INSERT INTO blog_views (blog_id, user_id, ip_address, user_agent, session_id, viewed_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      await executeQuery(viewQuery, [parseInt(id), userId, ipAddress, userAgent, sessionId]);

      const updateQuery = 'UPDATE blog_posts SET views = COALESCE(views, 0) + 1 WHERE id = ?';
      await executeQuery(updateQuery, [parseInt(id)]);

      const updatedBlog = await Blog.getById(id);
      res.json({ 
        success: true, 
        views: updatedBlog.views || 0,
        message: 'View tracked successfully'
      });
    } else {
      res.json({ 
        success: true, 
        views: blog.views || 0, 
        message: 'View already counted recently' 
      });
    }
  } catch (error) {
    console.error('Error tracking blog view:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error tracking view',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createBlog = async (req, res) => {
  try {
    const {
      title, content, excerpt, status,
      meta_title, meta_description, tags,
      is_featured, is_news, news_type, target_countries, approved
    } = req.body;

    // Check if user can manage blogs
    if (!canManageBlog(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to create blogs.' 
      });
    }

    const slug = await Blog.generateSlug(title);
    
    const userId = req.user.id;
    const userName = req.user.name || req.user.email || 'Unknown User';
    const canApprove = canApproveBlog(req.user);

    console.log('Create blog - User permissions:', {
      userId, 
      userName, 
      role: req.user.role, 
      canApprove,
      permissions: req.user.permissions
    });

    const toBool = (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return Boolean(value);
    };

    // Process target_countries if provided
    let processedTargetCountries = null;
    if (toBool(is_news) && news_type === 'country_specific' && target_countries) {
      try {
        processedTargetCountries = typeof target_countries === 'string' 
          ? JSON.parse(target_countries) 
          : target_countries;
        
        // Validate that it's an array
        if (!Array.isArray(processedTargetCountries)) {
          processedTargetCountries = null;
        }
      } catch (error) {
        console.error('Error processing target_countries:', error);
        processedTargetCountries = null;
      }
    }

    const blogData = {
      title: title.trim(),
      slug,
      content: content.trim(),
      excerpt: excerpt ? excerpt.trim() : null,
      featured_image: req.file ? `uploads/blogs/${req.file.filename}` : null,
      author_id: userId,
      status: canApprove && toBool(approved) ? 'published' : 'draft',
      approved: canApprove ? toBool(approved) : false,
      is_featured: toBool(is_featured),
      is_news: toBool(is_news),
      news_type: toBool(is_news) ? (news_type || 'general') : 'general',
      target_countries: processedTargetCountries,
      meta_title: meta_title ? meta_title.trim() : title.trim(),
      meta_description: meta_description ? meta_description.trim() : (excerpt ? excerpt.trim() : null),
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      views: 0
    };

    const newBlog = await Blog.create(blogData);

    // Notify approvers if created by someone who can't approve
    if (!canApprove) {
      await notifyBlogApprovers(newBlog, 'created', userName);
    }

    const message = canApprove && toBool(approved) 
      ? 'Blog post created and published successfully'
      : 'Blog post created successfully and sent for approval';

    res.status(201).json({ success: true, message, data: newBlog });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Updated updateBlog function
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, content, excerpt, status,
      meta_title, meta_description, tags,
      is_featured, is_news, news_type, target_countries, approved
    } = req.body;

    // Check if user can manage blogs
    if (!canManageBlog(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to edit blogs.' 
      });
    }

    const blogId = parseInt(id);
    if (isNaN(blogId)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    const existingBlog = await Blog.getById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const slug = title && title.trim() !== existingBlog.title
      ? await Blog.generateSlug(title.trim(), blogId)
      : existingBlog.slug;

    const userName = req.user.name || req.user.email || 'Unknown User';
    const canApprove = canApproveBlog(req.user);

    console.log('Update blog - User permissions:', {
      userId: req.user.id, 
      userName, 
      role: req.user.role, 
      canApprove,
      permissions: req.user.permissions
    });

    const toBool = (value, fallback) => {
      if (value === undefined || value === null) return fallback;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return Boolean(value);
    };

    // Process target_countries
    let processedTargetCountries = existingBlog.target_countries;
    const newsValue = toBool(is_news, existingBlog.is_news);
    const newsTypeValue = newsValue ? (news_type || existingBlog.news_type || 'general') : 'general';

    if (newsValue && newsTypeValue === 'country_specific' && target_countries !== undefined) {
      try {
        processedTargetCountries = typeof target_countries === 'string' 
          ? JSON.parse(target_countries) 
          : target_countries;
        
        if (!Array.isArray(processedTargetCountries)) {
          processedTargetCountries = null;
        }
      } catch (error) {
        console.error('Error processing target_countries:', error);
        processedTargetCountries = null;
      }
    } else if (!newsValue || newsTypeValue === 'general') {
      processedTargetCountries = null;
    }

    // Check if content was actually changed
    const contentChanged = (
      (title !== undefined && title.trim() !== existingBlog.title) ||
      (content !== undefined && content.trim() !== existingBlog.content) ||
      (excerpt !== undefined && (excerpt ? excerpt.trim() : null) !== existingBlog.excerpt) ||
      toBool(is_featured, existingBlog.is_featured) !== existingBlog.is_featured ||
      toBool(is_news, existingBlog.is_news) !== existingBlog.is_news ||
      (newsValue && newsTypeValue !== existingBlog.news_type) ||
      (newsValue && JSON.stringify(processedTargetCountries) !== JSON.stringify(existingBlog.target_countries)) ||
      (meta_title !== undefined && meta_title !== existingBlog.meta_title) ||
      (meta_description !== undefined && meta_description !== existingBlog.meta_description) ||
      req.file
    );

    const updatedData = {
      title: title !== undefined ? title.trim() : existingBlog.title,
      slug,
      content: content !== undefined ? content.trim() : existingBlog.content,
      excerpt: excerpt !== undefined ? (excerpt ? excerpt.trim() : null) : existingBlog.excerpt,
      featured_image: req.file ? `uploads/blogs/${req.file.filename}` : existingBlog.featured_image,
      is_featured: toBool(is_featured, existingBlog.is_featured),
      is_news: newsValue,
      news_type: newsTypeValue,
      target_countries: processedTargetCountries,
      meta_title: meta_title !== undefined ? (meta_title ? meta_title.trim() : null) : existingBlog.meta_title,
      meta_description: meta_description !== undefined ? (meta_description ? meta_description.trim() : null) : existingBlog.meta_description,
      tags: tags !== undefined 
        ? (typeof tags === 'string' ? JSON.parse(tags) : tags)
        : (existingBlog.tags ? (typeof existingBlog.tags === 'string' ? JSON.parse(existingBlog.tags) : existingBlog.tags) : []),
      views: existingBlog.views || 0
    };

    // Handle approval and status logic based on permissions
    if (canApprove) {
      updatedData.approved = toBool(approved, existingBlog.approved);
      updatedData.status = updatedData.approved ? 'published' : 'draft';
    } else {
      if (contentChanged) {
        updatedData.approved = false;
        updatedData.status = 'draft';
      } else {
        updatedData.approved = existingBlog.approved;
        updatedData.status = existingBlog.status;
      }
    }

    const updatedBlog = await Blog.update(blogId, updatedData);

    // Notify approvers if content was changed by someone who can't approve
    if (!canApprove && contentChanged) {
      await notifyBlogApprovers(updatedBlog, 'updated', userName);
    }

    let message = 'Blog post updated successfully';
    if (!canApprove && contentChanged) {
      message += '. Changes require approval before publishing.';
    }

    res.json({ success: true, message, data: updatedBlog });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// NEW: Get news posts with filtering
const getNews = async (req, res) => {
  try {
    const { type = 'all', country, limit = 10 } = req.query;
    
    const news = await Blog.getNews(type, country, parseInt(limit));
    
    res.json({ success: true, data: news || [] });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// NEW: Get country-specific news
const getCountryNews = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { limit = 10 } = req.query;
    
    if (!countryCode) {
      return res.status(400).json({ success: false, message: 'Country code is required' });
    }
    
    const news = await Blog.getCountryNews(countryCode, parseInt(limit));
    
    res.json({ success: true, data: news || [] });
  } catch (error) {
    console.error('Error fetching country news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching country news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};





const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogId = parseInt(id);
    
    // FIXED: Check if user can approve blogs (delete permission)
    if (!canApproveBlog(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only admins and Assistant Admins with manage_content permission can delete blogs.' 
      });
    }
    
    if (isNaN(blogId)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    const existingBlog = await Blog.getById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    await executeQuery('DELETE FROM blog_views WHERE blog_id = ?', [blogId]);
    await executeQuery('DELETE FROM notifications WHERE related_id = ? AND related_type = ?', [blogId, 'blog_post']);
    await Blog.delete(blogId);
    
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// FIXED: Get notifications for blog approvers
const getNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ 
        success: true, 
        data: [], 
        unread_count: 0,
        message: 'No authenticated user'
      });
    }

    const userId = req.user.id;
    const { limit = 50, unread_only = false } = req.query;
    
    // Check if notifications table exists
    const tableCheckQuery = "SHOW TABLES LIKE 'notifications'";
    const tableExists = await executeQuery(tableCheckQuery);
    
    if (tableExists.length === 0) {
      return res.json({ 
        success: true, 
        data: [], 
        unread_count: 0,
        message: 'Notifications table not found'
      });
    }
    
    let query = `
      SELECT n.id, n.user_id, n.type, n.title, n.message, 
             n.related_id, n.related_type, n.is_read, 
             n.created_at, n.read_at,
             CASE 
               WHEN n.related_type = 'blog_post' AND n.related_id IS NOT NULL 
               THEN (SELECT title FROM blog_posts WHERE id = n.related_id)
               ELSE NULL
             END as blog_title
      FROM notifications n
      WHERE n.user_id = ?
    `;
    
    const params = [userId];
    
    if (unread_only === 'true' || unread_only === true) {
      query += ' AND n.is_read = 0';
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const notifications = await executeQuery(query, params);
    
    const unreadCountQuery = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0';
    const unreadResult = await executeQuery(unreadCountQuery, [userId]);
    
    res.json({ 
      success: true, 
      data: notifications || [], 
      unread_count: unreadResult[0]?.count || 0
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json({ 
      success: true, 
      data: [], 
      unread_count: 0,
      message: 'Error fetching notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const notificationId = parseInt(id);
    
    if (isNaN(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    
    const checkQuery = 'SELECT id, is_read FROM notifications WHERE id = ? AND user_id = ?';
    const existing = await executeQuery(checkQuery, [notificationId, userId]);
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    if (existing[0].is_read) {
      return res.json({ success: true, message: 'Notification already marked as read' });
    }
    
    const updateQuery = `
      UPDATE notifications 
      SET is_read = 1, read_at = NOW() 
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await executeQuery(updateQuery, [notificationId, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userId = req.user.id;
    
    const query = `
      UPDATE notifications 
      SET is_read = 1, read_at = NOW() 
      WHERE user_id = ? AND is_read = 0
    `;
    
    const result = await executeQuery(query, [userId]);
    
    res.json({ 
      success: true, 
      message: 'All notifications marked as read',
      updated_count: result.affectedRows
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBlogAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const blogId = parseInt(id);
    
    if (isNaN(blogId)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    const blog = await Blog.getById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const analytics = await Blog.getAnalytics(blogId);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching blog analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getPopularBlogs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const blogs = await Blog.getPopular(parseInt(limit));
    res.json({ success: true, data: blogs || [] });
  } catch (error) {
    console.error('Error fetching popular blogs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching popular blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTrendingBlogs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const blogs = await Blog.getTrending(parseInt(limit));
    res.json({ success: true, data: blogs || [] });
  } catch (error) {
    console.error('Error fetching trending blogs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching trending blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createNotificationsTable = async (req, res) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_id INT NULL,
        related_type VARCHAR(50) NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at),
        INDEX idx_user_read (user_id, is_read),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    
    await executeQuery(createTableQuery);
    
    res.json({
      success: true,
      message: 'Notifications table created successfully'
    });
    
  } catch (error) {
    console.error('Error creating notifications table:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notifications table',
      error: error.message
    });
  }
};

module.exports = {
  getAllBlogs,
  getAllAdminBlogs,
  getBlogBySlug,
  getBlogById,
  trackBlogView,
  createBlog,
  updateBlog,
  deleteBlog,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getBlogAnalytics,
  getPopularBlogs,
  getTrendingBlogs,
  createNotificationsTable,
  canApproveBlog,
  canManageBlog,
  getBlogApprovers,
  getNews,           // NEW
  getCountryNews     // NEW
};
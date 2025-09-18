// routes/chat.js - Comprehensive AI-powered chat route matching full system capabilities
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { executeQuery } = require('../config/database');

// Import your existing models
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');

// Import middleware
const { auth } = require('../middleware/auth');

// Rate limiting with different levels
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: { success: false, message: 'Too many chat requests. Please wait before trying again.' }
});

const actionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 actions per minute for heavy operations
  message: { success: false, message: 'Action rate limit exceeded. Please wait before trying again.' }
});

// Optional auth middleware
const optionalAuth = (req, res, next) => {
  if (req.cookies?.token) {
    auth(req, res, (err) => {
      if (err) req.user = null;
      next();
    });
  } else {
    req.user = null;
    next();
  }
};

// Comprehensive safe action definitions matching your full system
const SAFE_ACTIONS = {
  // ==================== BLOG OPERATIONS ====================
  'get_published_blogs': {
    description: 'Get recent published blog posts',
    handler: async (params) => {
      const limit = Math.min(params.limit || 10, 50);
      const blogs = await Blog.getAll(limit);
      return {
        success: true,
        data: blogs,
        message: `Retrieved ${blogs.length} published blog posts`,
        action: 'get_published_blogs'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'search_blogs': {
    description: 'Search blog posts by keyword',
    handler: async (params) => {
      const cleanQuery = params.query.replace(/[<>'"]/g, '').trim();
      if (cleanQuery.length < 2) throw new Error('Search query must be at least 2 characters');
      
      const blogs = await Blog.search(cleanQuery);
      return {
        success: true,
        data: blogs.slice(0, 20),
        message: `Found ${blogs.length} blog posts matching "${cleanQuery}"`,
        action: 'search_blogs'
      };
    },
    auth_required: false,
    validation: { required: ['query'], maxQueryLength: 100 }
  },

  'get_popular_blogs': {
    description: 'Get most popular blog posts',
    handler: async (params) => {
      const limit = Math.min(params.limit || 10, 20);
      const blogs = await Blog.getPopular(limit);
      return {
        success: true,
        data: blogs,
        message: `Retrieved ${blogs.length} popular blog posts`,
        action: 'get_popular_blogs'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'get_trending_blogs': {
    description: 'Get trending blog posts',
    handler: async (params) => {
      const limit = Math.min(params.limit || 10, 20);
      const blogs = await Blog.getTrending(limit);
      return {
        success: true,
        data: blogs,
        message: `Retrieved ${blogs.length} trending blog posts`,
        action: 'get_trending_blogs'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'get_news': {
    description: 'Get news posts with optional filtering',
    handler: async (params) => {
      const { type = 'all', countryCode, limit = 10 } = params;
      const news = await Blog.getNews(type, countryCode, Math.min(limit, 20));
      return {
        success: true,
        data: news,
        message: `Retrieved ${news.length} news posts`,
        action: 'get_news'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  // ==================== PROJECT OPERATIONS ====================
  'get_projects': {
    description: 'Get ACEF projects information',
    handler: async (params) => {
      const { limit = 20, featured_only = false, include_hidden = false } = params;
      const query = `
        SELECT id, title, description, location, status, start_date, end_date, 
               budget, featured, slug, created_at, updated_at
        FROM projects 
        WHERE status IN ('active', 'completed', 'published')
        ${featured_only ? 'AND featured = 1' : ''}
        ${!include_hidden ? 'AND hidden = 0' : ''}
        ORDER BY featured DESC, created_at DESC 
        LIMIT ?
      `;
      const projects = await executeQuery(query, [Math.min(limit, 50)]);
      
      return {
        success: true,
        data: projects,
        message: `Found ${projects.length} ACEF projects`,
        action: 'get_projects'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'get_featured_projects': {
    description: 'Get featured ACEF projects',
    handler: async (params) => {
      const limit = Math.min(params.limit || 10, 20);
      const query = `
        SELECT id, title, description, location, status, start_date, budget, slug, featured_image
        FROM projects 
        WHERE featured = 1 AND status IN ('active', 'completed', 'published') AND hidden = 0
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      const projects = await executeQuery(query, [limit]);
      
      return {
        success: true,
        data: projects,
        message: `Retrieved ${projects.length} featured projects`,
        action: 'get_featured_projects'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'get_project_by_slug': {
    description: 'Get specific project by slug',
    handler: async (params) => {
      if (!params.slug) throw new Error('Project slug is required');
      
      const query = `
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT pi.gallery_images) as gallery_images
        FROM projects p
        LEFT JOIN project_images pi ON p.id = pi.project_id
        WHERE p.slug = ? AND p.status IN ('active', 'completed', 'published')
        GROUP BY p.id
      `;
      const projects = await executeQuery(query, [params.slug]);
      
      if (projects.length === 0) {
        throw new Error('Project not found');
      }

      return {
        success: true,
        data: projects[0],
        message: `Retrieved project: ${projects[0].title}`,
        action: 'get_project_by_slug'
      };
    },
    auth_required: false,
    validation: { required: ['slug'] }
  },

  // ==================== TEAM OPERATIONS ====================
  'get_team_members': {
    description: 'Get ACEF team information',
    handler: async (params) => {
      const { department, country, limit = 50 } = params;
      let query = `
        SELECT tm.name, tm.position, tm.department, tm.bio, tm.email, 
               tm.country, tm.linkedin_url, tm.image_url, tm.order_index
        FROM team_members tm 
        WHERE tm.status = 'active'
      `;
      const queryParams = [];

      if (department) {
        query += ' AND tm.department = ?';
        queryParams.push(department);
      }
      
      if (country) {
        query += ' AND tm.country = ?';
        queryParams.push(country);
      }
      
      query += ' ORDER BY tm.order_index ASC, tm.name ASC LIMIT ?';
      queryParams.push(Math.min(limit, 100));
      
      const team = await executeQuery(query, queryParams);
      
      return {
        success: true,
        data: team,
        message: `Meet our team of ${team.length} dedicated professionals`,
        action: 'get_team_members'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'get_departments': {
    description: 'Get team departments',
    handler: async () => {
      const query = `
        SELECT d.*, COUNT(tm.id) as member_count
        FROM team_departments d
        LEFT JOIN team_members tm ON d.name = tm.department AND tm.status = 'active'
        GROUP BY d.id
        ORDER BY d.order_index ASC, d.name ASC
      `;
      const departments = await executeQuery(query);
      
      return {
        success: true,
        data: departments,
        message: `Retrieved ${departments.length} departments`,
        action: 'get_departments'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  // ==================== COUNTRY & LOCATION OPERATIONS ====================
  'get_countries': {
    description: 'Get countries where ACEF operates',
    handler: async () => {
      const query = `SELECT * FROM countries ORDER BY name`;
      const countries = await executeQuery(query);
      
      return {
        success: true,
        data: countries,
        message: `ACEF operates in ${countries.length} countries`,
        action: 'get_countries'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'get_country_contacts': {
    description: 'Get contact information for countries',
    handler: async (params) => {
      const { country } = params;
      let query = `SELECT * FROM country_contacts`;
      const queryParams = [];
      
      if (country) {
        query += ` WHERE country LIKE ?`;
        queryParams.push(`%${country}%`);
      }
      
      query += ` ORDER BY country`;
      
      const contacts = await executeQuery(query, queryParams);
      
      return {
        success: true,
        data: contacts,
        message: country 
          ? `Contact information for ${country}` 
          : `Contact information for ${contacts.length} countries`,
        action: 'get_country_contacts'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  // ==================== EVENT OPERATIONS ====================
  'get_events': {
    description: 'Get upcoming ACEF events',
    handler: async (params) => {
      const { limit = 10, include_past = false } = params;
      const query = `
        SELECT title, description, date, location, image_url, registration_deadline,
               max_participants, current_participants
        FROM events 
        WHERE status = 'published' ${!include_past ? 'AND date >= CURDATE()' : ''}
        ORDER BY date ${include_past ? 'DESC' : 'ASC'}
        LIMIT ?
      `;
      const events = await executeQuery(query, [Math.min(limit, 30)]);
      
      return {
        success: true,
        data: events,
        message: `Found ${events.length} events`,
        action: 'get_events'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'register_event_interest': {
    description: 'Register interest in an event',
    handler: async (params) => {
      const { eventId, name, email, phone, message } = params;
      
      if (!eventId || !name || !email) {
        throw new Error('Event ID, name, and email are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      const insertQuery = `
        INSERT INTO event_interests (event_id, name, email, phone, message, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      
      await executeQuery(insertQuery, [eventId, name.trim(), email.trim().toLowerCase(), 
                                     phone?.trim(), message?.trim()]);
      
      return {
        success: true,
        data: { eventId, email },
        message: 'Event interest registered successfully! We will contact you with more details.',
        action: 'register_event_interest'
      };
    },
    auth_required: false,
    rate_limit: 'medium',
    validation: {
      required: ['eventId', 'name', 'email'],
      maxLength: { name: 100, email: 255, phone: 20, message: 1000 }
    }
  },

  // ==================== JOB OPERATIONS ====================
  'get_job_openings': {
    description: 'Get current job openings',
    handler: async (params) => {
      const { limit = 10, location, type } = params;
      let query = `
        SELECT title, location, type, deadline, description, requirements,
               salary_range, employment_type, created_at
        FROM jobs 
        WHERE status = 'active' AND deadline >= CURDATE()
      `;
      const queryParams = [];

      if (location) {
        query += ` AND location LIKE ?`;
        queryParams.push(`%${location}%`);
      }

      if (type) {
        query += ` AND type = ?`;
        queryParams.push(type);
      }

      query += ` ORDER BY created_at DESC LIMIT ?`;
      queryParams.push(Math.min(limit, 20));
      
      const jobs = await executeQuery(query, queryParams);
      
      return {
        success: true,
        data: jobs,
        message: `Found ${jobs.length} current job openings`,
        action: 'get_job_openings'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'submit_job_application': {
    description: 'Submit a job application',
    handler: async (params) => {
      const { jobId, name, email, phone, coverLetter, experience } = params;
      
      if (!jobId || !name || !email || !coverLetter) {
        throw new Error('Job ID, name, email, and cover letter are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      const insertQuery = `
        INSERT INTO job_applications (job_id, name, email, phone, cover_letter, experience, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await executeQuery(insertQuery, [jobId, name.trim(), email.trim().toLowerCase(), 
                                     phone?.trim(), coverLetter.trim(), experience?.trim()]);
      
      return {
        success: true,
        data: { jobId, email },
        message: 'Job application submitted successfully! We will review your application and get back to you.',
        action: 'submit_job_application'
      };
    },
    auth_required: false,
    rate_limit: 'high',
    validation: {
      required: ['jobId', 'name', 'email', 'coverLetter'],
      maxLength: { name: 100, email: 255, phone: 20, coverLetter: 2000, experience: 2000 }
    }
  },

  // ==================== PARTNER OPERATIONS ====================
  'get_partners': {
    description: 'Get ACEF partners',
    handler: async (params) => {
      const { type, featured_only = false, limit = 50 } = params;
      let query = `
        SELECT name, description, logo_url, website_url, partner_type, 
               is_featured, location, collaboration_details
        FROM partners 
        WHERE status = 'active'
      `;
      const queryParams = [];

      if (type) {
        query += ` AND partner_type = ?`;
        queryParams.push(type);
      }

      if (featured_only) {
        query += ` AND is_featured = 1`;
      }

      query += ` ORDER BY is_featured DESC, name ASC LIMIT ?`;
      queryParams.push(Math.min(limit, 100));
      
      const partners = await executeQuery(query, queryParams);
      
      return {
        success: true,
        data: partners,
        message: `Retrieved ${partners.length} partners`,
        action: 'get_partners'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  // ==================== IMPACT & STATISTICS ====================
  'get_impact_stats': {
    description: 'Get ACEF impact statistics',
    handler: async (params) => {
      const { project_id, metric_type } = params;
      let query = `
        SELECT metric_name, current_value, target_value, unit, 
               description, last_updated, project_id
        FROM impacts 
        WHERE status = 'active'
      `;
      const queryParams = [];

      if (project_id) {
        query += ` AND project_id = ?`;
        queryParams.push(project_id);
      }

      if (metric_type) {
        query += ` AND metric_name LIKE ?`;
        queryParams.push(`%${metric_type}%`);
      }

      query += ` ORDER BY project_id, metric_name`;
      
      const impacts = await executeQuery(query, queryParams);
      
      return {
        success: true,
        data: impacts,
        message: `Retrieved ${impacts.length} impact metrics`,
        action: 'get_impact_stats'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  // ==================== DONATION OPERATIONS ====================
  'get_donation_info': {
    description: 'Get donation information and methods',
    handler: async () => {
      const transactionQuery = `
        SELECT method_name, description, logo_url, account_details, 
               transaction_type, is_active, processing_fee
        FROM transaction_details 
        WHERE is_active = 1 
        ORDER BY transaction_type, method_name
      `;
      const methods = await executeQuery(transactionQuery);
      
      const statsQuery = `
        SELECT COUNT(*) as total_donations, 
               SUM(amount) as total_amount,
               AVG(amount) as average_donation
        FROM donations 
        WHERE status = 'completed'
      `;
      const [stats] = await executeQuery(statsQuery);
      
      return {
        success: true,
        data: {
          donation_methods: methods,
          statistics: stats
        },
        message: 'Retrieved donation information and statistics',
        action: 'get_donation_info'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  'get_donor_wall': {
    description: 'Get donor wall information',
    handler: async (params) => {
      const { limit = 20, country } = params;
      let query = `
        SELECT donor_name, amount, donor_country, donation_type, 
               created_at, is_anonymous, message
        FROM donations 
        WHERE status = 'completed' AND is_anonymous = 0
      `;
      const queryParams = [];

      if (country) {
        query += ` AND donor_country = ?`;
        queryParams.push(country);
      }

      query += ` ORDER BY amount DESC, created_at DESC LIMIT ?`;
      queryParams.push(Math.min(limit, 100));
      
      const donors = await executeQuery(query, queryParams);
      
      return {
        success: true,
        data: donors,
        message: `Retrieved ${donors.length} donors for recognition`,
        action: 'get_donor_wall'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  // ==================== CONTACT OPERATIONS ====================
  'submit_contact_form': {
    description: 'Submit a contact form message',
    handler: async (params) => {
      const { name, email, subject, message, phone, organization } = params;
      
      if (!name || !email || !subject || !message) {
        throw new Error('Name, email, subject, and message are required');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      const sanitizedData = {
        name: name.trim().substring(0, 100),
        email: email.trim().toLowerCase().substring(0, 255),
        subject: subject.trim().substring(0, 200),
        message: message.trim().substring(0, 2000),
        phone: phone ? phone.trim().substring(0, 20) : null,
        organization: organization ? organization.trim().substring(0, 200) : null
      };
      
      const contact = await Contact.create(sanitizedData);
      
      return {
        success: true,
        data: { id: contact.id },
        message: 'Thank you for your message! We will get back to you within 24-48 hours.',
        action: 'submit_contact_form'
      };
    },
    auth_required: false,
    rate_limit: 'medium',
    validation: {
      required: ['name', 'email', 'subject', 'message'],
      maxLength: { name: 100, email: 255, subject: 200, message: 2000, phone: 20, organization: 200 }
    }
  },

  'newsletter_subscribe': {
    description: 'Subscribe to ACEF newsletter',
    handler: async (params) => {
      const { email, name } = params;
      
      if (!email) throw new Error('Email address is required');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      const sanitizedEmail = email.trim().toLowerCase().substring(0, 255);
      const sanitizedName = name ? name.trim().substring(0, 100) : null;

      const query = `
        INSERT INTO newsletter_subscribers (email, name, source, subscribed_at)
        VALUES (?, ?, 'chatbot', NOW())
        ON DUPLICATE KEY UPDATE 
        name = COALESCE(VALUES(name), name),
        source = 'chatbot',
        is_active = 1,
        subscribed_at = NOW()
      `;
      
      await executeQuery(query, [sanitizedEmail, sanitizedName]);
      
      return {
        success: true,
        data: { email: sanitizedEmail },
        message: 'Successfully subscribed to ACEF newsletter! You will receive updates about our latest initiatives.',
        action: 'newsletter_subscribe'
      };
    },
    auth_required: false,
    rate_limit: 'medium',
    validation: { required: ['email'], maxLength: { email: 255, name: 100 } }
  },

  // ==================== GALLERY & MEDIA ====================
  'get_gallery_images': {
    description: 'Get gallery images from media library',
    handler: async (params) => {
      const { category, limit = 20 } = params;
      let query = `
        SELECT filename, original_name, file_path, file_size, 
               mime_type, category, alt_text, created_at
        FROM gallery_images 
        WHERE status = 'active'
      `;
      const queryParams = [];

      if (category) {
        query += ` AND category = ?`;
        queryParams.push(category);
      }

      query += ` ORDER BY created_at DESC LIMIT ?`;
      queryParams.push(Math.min(limit, 50));
      
      const images = await executeQuery(query, queryParams);
      
      return {
        success: true,
        data: images,
        message: `Retrieved ${images.length} gallery images`,
        action: 'get_gallery_images'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  // ==================== VIDEO CONTENT ====================
  'get_videos': {
    description: 'Get ACEF video content',
    handler: async (params) => {
      const { country_id, featured_only = false, limit = 10 } = params;
      let query = `
        SELECT title, description, youtube_url, video_tags, 
               country_id, is_featured, view_count, created_at
        FROM video_sections 
        WHERE status = 'published'
      `;
      const queryParams = [];

      if (country_id) {
        query += ` AND (country_id = ? OR country_id IS NULL)`;
        queryParams.push(country_id);
      }

      if (featured_only) {
        query += ` AND is_featured = 1`;
      }

      query += ` ORDER BY is_featured DESC, created_at DESC LIMIT ?`;
      queryParams.push(Math.min(limit, 30));
      
      const videos = await executeQuery(query, queryParams);
      
      return {
        success: true,
        data: videos,
        message: `Retrieved ${videos.length} video${videos.length === 1 ? '' : 's'}`,
        action: 'get_videos'
      };
    },
    auth_required: false,
    rate_limit: 'low'
  },

  // ==================== COLLABORATION REQUESTS ====================
  'submit_collaboration': {
    description: 'Submit a collaboration request',
    handler: async (params) => {
      const { flowType, formData } = params;
      
      if (!flowType || !formData) {
        throw new Error('Flow type and form data are required');
      }

      // Extract contact information
      const name = formData.name || formData.fullName || formData.contactPerson;
      const email = formData.email || formData.emailAddress;
      const organization = formData.organization || formData.organizationName;

      if (!name || !email) {
        throw new Error('Name and email are required');
      }

      const collaborationId = require('crypto').randomUUID();

      const insertQuery = `
        INSERT INTO collaboration_reports (
          id, flow_type, name, email, organization, report_data,
          status, priority, contact_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'new', 'medium', 0, NOW(), NOW())
      `;

      await executeQuery(insertQuery, [
        collaborationId,
        flowType,
        name,
        email,
        organization,
        JSON.stringify(formData)
      ]);

      return {
        success: true,
        data: { collaborationId, flowType },
        message: `${flowType} collaboration request submitted successfully! We will review it and get back to you soon.`,
        action: 'submit_collaboration'
      };
    },
    auth_required: false,
    rate_limit: 'high',
    validation: { required: ['flowType', 'formData'] }
  },

  // ==================== ADMIN-ONLY OPERATIONS ====================
  'get_contact_submissions': {
    description: 'Get recent contact form submissions (Admin only)',
    handler: async (params, user) => {
      const { page = 1, limit = 20, status } = params;
      const { contacts, total } = await Contact.getAllPaginated({ 
        page: Math.max(page, 1), 
        limit: Math.min(limit, 100), 
        status 
      });
      
      return {
        success: true,
        data: { contacts, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
        message: `Retrieved ${contacts.length} contact submissions`,
        action: 'get_contact_submissions'
      };
    },
    auth_required: true,
    role_required: ['admin', 'Assistant Admin'],
    permission_required: 'manage_contacts'
  },

  'get_analytics': {
    description: 'Get website analytics (Admin only)',
    handler: async (params, user) => {
      const { days = 30 } = params;
      
      // Get basic visit stats
      const [visitStats] = await executeQuery(`
        SELECT 
          SUM(daily_count) as total_visits,
          COUNT(DISTINCT visit_date) as active_days,
          AVG(daily_count) as avg_daily_visits
        FROM visits
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      `, [Math.min(days, 365)]);

      // Get country breakdown
      const countryStats = await executeQuery(`
        SELECT country, COUNT(*) as visits
        FROM visit_logs
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND country != 'Unknown'
        GROUP BY country
        ORDER BY visits DESC
        LIMIT 10
      `, [Math.min(days, 365)]);

      return {
        success: true,
        data: { visitStats, countryStats },
        message: `Analytics for the last ${days} days`,
        action: 'get_analytics'
      };
    },
    auth_required: true,
    role_required: ['admin', 'Assistant Admin']
  },

  'get_system_health': {
    description: 'Get system health status (Admin only)',
    handler: async (params, user) => {
      const healthChecks = {};
      
      // Database connectivity
      try {
        await executeQuery('SELECT 1');
        healthChecks.database = { status: 'healthy', message: 'Connected' };
      } catch (error) {
        healthChecks.database = { status: 'error', message: error.message };
      }

      // Key table counts
      const tables = ['users', 'projects', 'blog_posts', 'donations', 'contacts'];
      for (const table of tables) {
        try {
          const [result] = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
          healthChecks[table] = { status: 'healthy', count: result.count };
        } catch (error) {
          healthChecks[table] = { status: 'error', message: error.message };
        }
      }

      return {
        success: true,
        data: healthChecks,
        message: 'System health check completed',
        action: 'get_system_health'
      };
    },
    auth_required: true,
    role_required: ['admin']
  }
};

// Enhanced natural language processing
function parseUserIntent(message) {
  const lowerMessage = message.toLowerCase();
  const intent = { action: null, params: {}, confidence: 0 };
  
  // Blog-related intents
  if (lowerMessage.includes('blog') || lowerMessage.includes('article') || lowerMessage.includes('post') || lowerMessage.includes('news')) {
    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      intent.action = 'search_blogs';
      const searchMatch = message.match(/(?:search|find).*?(?:for|about)\s+(.+?)(?:\?|$|\.)/i);
      if (searchMatch) {
        intent.params.query = searchMatch[1].trim();
        intent.confidence = 0.8;
      }
    } else if (lowerMessage.includes('popular') || lowerMessage.includes('most read')) {
      intent.action = 'get_popular_blogs';
      intent.confidence = 0.9;
    } else if (lowerMessage.includes('trending') || lowerMessage.includes('hot')) {
      intent.action = 'get_trending_blogs';
      intent.confidence = 0.9;
    } else if (lowerMessage.includes('news')) {
      intent.action = 'get_news';
      intent.confidence = 0.8;
    } else if (lowerMessage.includes('latest') || lowerMessage.includes('recent')) {
      intent.action = 'get_published_blogs';
      intent.confidence = 0.8;
    }
  }
  
  // Project information
  else if (lowerMessage.includes('project') || lowerMessage.includes('initiative') || lowerMessage.includes('program')) {
    if (lowerMessage.includes('featured')) {
      intent.action = 'get_featured_projects';
      intent.confidence = 0.9;
    } else {
      intent.action = 'get_projects';
      intent.confidence = 0.8;
    }
  }
  
  // Team information
  else if (lowerMessage.includes('team') || lowerMessage.includes('staff') || lowerMessage.includes('who works') || lowerMessage.includes('employee')) {
    intent.action = 'get_team_members';
    intent.confidence = 0.8;
    
    // Extract department if mentioned
    const departments = ['management', 'operations', 'finance', 'programs', 'communications', 'hr'];
    for (const dept of departments) {
      if (lowerMessage.includes(dept)) {
        intent.params.department = dept;
        break;
      }
    }
  }
  
  // Job-related intents
  else if (lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('position') || lowerMessage.includes('hiring') || lowerMessage.includes('vacancy')) {
    if (lowerMessage.includes('apply') || lowerMessage.includes('application')) {
      intent.action = 'submit_job_application';
      intent.confidence = 0.7;
    } else {
      intent.action = 'get_job_openings';
      intent.confidence = 0.8;
    }
  }
  
  // Event-related intents
  else if (lowerMessage.includes('event') || lowerMessage.includes('workshop') || lowerMessage.includes('seminar') || lowerMessage.includes('conference')) {
    if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('attend')) {
      intent.action = 'register_event_interest';
      intent.confidence = 0.8;
    } else {
      intent.action = 'get_events';
      intent.confidence = 0.8;
    }
  }
  
  // Partnership/collaboration intents
  else if (lowerMessage.includes('partner') || lowerMessage.includes('collaborate') || lowerMessage.includes('collaboration') || lowerMessage.includes('work together')) {
    if (lowerMessage.includes('submit') || lowerMessage.includes('request') || lowerMessage.includes('apply')) {
      intent.action = 'submit_collaboration';
      intent.confidence = 0.8;
    } else {
      intent.action = 'get_partners';
      intent.confidence = 0.7;
    }
  }
  
  // Donation-related intents
  else if (lowerMessage.includes('donat') || lowerMessage.includes('contribut') || lowerMessage.includes('support financially') || lowerMessage.includes('fund') || lowerMessage.includes('sponsor')) {
    if (lowerMessage.includes('donor') || lowerMessage.includes('wall') || lowerMessage.includes('recognition')) {
      intent.action = 'get_donor_wall';
      intent.confidence = 0.8;
    } else {
      intent.action = 'get_donation_info';
      intent.confidence = 0.8;
    }
  }
  
  // Contact/Communication intents
  else if (lowerMessage.includes('contact') || lowerMessage.includes('message') || lowerMessage.includes('reach out') || lowerMessage.includes('get in touch')) {
    intent.action = 'submit_contact_form';
    intent.confidence = 0.7;
  }
  
  // Newsletter intents
  else if (lowerMessage.includes('newsletter') || lowerMessage.includes('subscribe') || lowerMessage.includes('updates') || lowerMessage.includes('email list')) {
    intent.action = 'newsletter_subscribe';
    intent.confidence = 0.8;
  }
  
  // Location/Countries
  else if (lowerMessage.includes('countries') || lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('operate')) {
    if (lowerMessage.includes('contact')) {
      intent.action = 'get_country_contacts';
      intent.confidence = 0.8;
    } else {
      intent.action = 'get_countries';
      intent.confidence = 0.8;
    }
  }
  
  // Impact and statistics
  else if (lowerMessage.includes('impact') || lowerMessage.includes('statistic') || lowerMessage.includes('achievement') || lowerMessage.includes('result')) {
    intent.action = 'get_impact_stats';
    intent.confidence = 0.8;
  }
  
  // Media content
  else if (lowerMessage.includes('video') || lowerMessage.includes('media') || lowerMessage.includes('gallery')) {
    if (lowerMessage.includes('video')) {
      intent.action = 'get_videos';
      intent.confidence = 0.8;
    } else {
      intent.action = 'get_gallery_images';
      intent.confidence = 0.8;
    }
  }
  
  // Admin-only intents
  else if (lowerMessage.includes('analytics') || lowerMessage.includes('dashboard') || lowerMessage.includes('admin')) {
    intent.action = 'get_analytics';
    intent.confidence = 0.9;
  }
  
  return intent;
}

// Main chat endpoint with comprehensive error handling
router.post('/chat', chatLimiter, optionalAuth, async (req, res) => {
  try {
    const { message, action, params = {} } = req.body;
    
    if (!message && !action) {
      return res.status(400).json({
        success: false,
        message: 'Message or action is required'
      });
    }
    
    let actionToExecute;
    let actionParams = {};
    let confidence = 0;
    
    // If specific action provided, use it
    if (action && SAFE_ACTIONS[action]) {
      actionToExecute = action;
      actionParams = params;
      confidence = 1.0;
    } else if (message) {
      // Parse natural language message
      const intent = parseUserIntent(message);
      actionToExecute = intent.action;
      actionParams = { ...intent.params, ...params };
      confidence = intent.confidence;
    }
    
    // If no recognized action, provide comprehensive help
    if (!actionToExecute || !SAFE_ACTIONS[actionToExecute]) {
      const availableActions = Object.entries(SAFE_ACTIONS)
        .filter(([_, config]) => {
          // Filter based on user permissions
          if (config.auth_required && !req.user) return false;
          if (config.role_required && req.user) {
            const requiredRoles = Array.isArray(config.role_required) 
              ? config.role_required 
              : [config.role_required];
            if (!requiredRoles.includes(req.user.role)) return false;
          }
          return true;
        })
        .map(([action, config]) => ({
          action,
          description: config.description,
          authRequired: config.auth_required || false
        }));
      
      return res.json({
        success: true,
        message: "I can help you with comprehensive ACEF information and services. Here's what I can assist you with:",
        availableActions,
        categories: {
          "Content & Information": [
            "Get recent blog posts and articles",
            "Search for specific content", 
            "View our projects and initiatives",
            "Learn about our team and departments"
          ],
          "Engagement & Participation": [
            "Subscribe to our newsletter",
            "Register interest in events",
            "Submit job applications",
            "Request collaborations and partnerships"
          ],
          "Support & Contact": [
            "Get donation information",
            "Submit contact forms",
            "Find country-specific contacts",
            "View impact statistics"
          ],
          "Media & Resources": [
            "Browse video content",
            "Access gallery images",
            "Get partner information"
          ]
        },
        examples: [
          "Show me recent blog posts about climate change",
          "What job openings do you have in Kenya?",
          "I want to subscribe to your newsletter",
          "Tell me about your projects in Rwanda",
          "How can I collaborate with ACEF?",
          "What are your impact statistics?"
        ]
      });
    }
    
    const actionConfig = SAFE_ACTIONS[actionToExecute];
    
    // Authentication checks
    if (actionConfig.auth_required && !req.user) {
      return res.status(401).json({
        success: false,
        message: 'This action requires authentication. Please log in first.',
        action: actionToExecute,
        loginRequired: true
      });
    }
    
    // Role requirements
    if (actionConfig.role_required && req.user) {
      const requiredRoles = Array.isArray(actionConfig.role_required) 
        ? actionConfig.role_required 
        : [actionConfig.role_required];
        
      if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `This action requires one of these roles: ${requiredRoles.join(', ')}`,
          action: actionToExecute,
          userRole: req.user.role,
          requiredRoles
        });
      }
    }
    
    // Permission requirements
    if (actionConfig.permission_required && req.user && req.user.role !== 'admin') {
      if (!req.user.permissions || !req.user.permissions.includes(actionConfig.permission_required)) {
        return res.status(403).json({
          success: false,
          message: `This action requires the '${actionConfig.permission_required}' permission`,
          action: actionToExecute,
          requiredPermission: actionConfig.permission_required
        });
      }
    }
    
    // Input validation
    if (actionConfig.validation) {
      const validation = actionConfig.validation;
      
      // Required parameters
      if (validation.required) {
        for (const requiredParam of validation.required) {
          if (!actionParams[requiredParam]) {
            return res.status(400).json({
              success: false,
              message: `Missing required parameter: ${requiredParam}`,
              action: actionToExecute,
              requiredParams: validation.required
            });
          }
        }
      }
      
      // Length validation
      if (validation.maxLength) {
        for (const [param, maxLen] of Object.entries(validation.maxLength)) {
          if (actionParams[param] && actionParams[param].length > maxLen) {
            return res.status(400).json({
              success: false,
              message: `${param} exceeds maximum length of ${maxLen} characters`,
              action: actionToExecute
            });
          }
        }
      }
      
      // Query length validation
      if (validation.maxQueryLength && actionParams.query) {
        if (actionParams.query.length > validation.maxQueryLength) {
          return res.status(400).json({
            success: false,
            message: `Search query too long. Maximum ${validation.maxQueryLength} characters.`,
            action: actionToExecute
          });
        }
      }
    }
    
    // Apply rate limiting for specific actions
    if (actionConfig.rate_limit === 'high') {
      actionLimiter(req, res, async () => {
        await executeAction();
      });
      return;
    }
    
    await executeAction();
    
    async function executeAction() {
      try {
        const startTime = Date.now();
        const result = await actionConfig.handler(actionParams, req.user);
        const executionTime = Date.now() - startTime;
        
        // Add comprehensive metadata
        result.metadata = {
          actionExecuted: actionToExecute,
          confidence,
          executionTime: `${executionTime}ms`,
          userRole: req.user?.role || 'anonymous',
          userPermissions: req.user?.permissions || [],
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substring(7)
        };
        
        // Log successful action
        console.log(`✅ Chat action executed: ${actionToExecute} by ${req.user?.role || 'anonymous'} in ${executionTime}ms`);
        
        res.json(result);
      } catch (actionError) {
        console.error(`❌ Action execution error for ${actionToExecute}:`, actionError);
        
        // Provide helpful error messages
        const isValidationError = actionError.message.includes('required') || 
                                 actionError.message.includes('invalid') ||
                                 actionError.message.includes('too long') ||
                                 actionError.message.includes('not found');
        
        res.status(isValidationError ? 400 : 500).json({
          success: false,
          message: actionError.message || 'An error occurred while processing your request',
          action: actionToExecute,
          error: process.env.NODE_ENV === 'development' ? actionError.stack : undefined,
          retryable: !isValidationError
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Chat endpoint error:', error);
    
    res.status(500).json({
      success: false,
      message: 'System error occurred while processing your request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Get available actions endpoint with detailed information
router.get('/actions', optionalAuth, (req, res) => {
  const userRole = req.user?.role || 'anonymous';
  const userPermissions = req.user?.permissions || [];
  
  const availableActions = Object.entries(SAFE_ACTIONS)
    .filter(([action, config]) => {
      // Check auth requirement
      if (config.auth_required && !req.user) return false;
      
      // Check role requirement
      if (config.role_required) {
        const requiredRoles = Array.isArray(config.role_required) 
          ? config.role_required 
          : [config.role_required];
        if (!requiredRoles.includes(userRole)) return false;
      }
      
      // Check permission requirement
      if (config.permission_required && userRole !== 'admin') {
        if (!userPermissions.includes(config.permission_required)) return false;
      }
      
      return true;
    })
    .map(([action, config]) => ({
      action,
      description: config.description,
      authRequired: config.auth_required || false,
      roleRequired: config.role_required,
      permissionRequired: config.permission_required,
      rateLimit: config.rate_limit || 'low',
      validation: config.validation ? {
        hasValidation: true,
        requiredFields: config.validation.required || [],
        maxLengths: config.validation.maxLength || {}
      } : { hasValidation: false }
    }));
  
  // Group actions by category
  const categorizedActions = {
    'Content & Information': availableActions.filter(a => 
      a.action.includes('get_') && !a.action.includes('admin') && !a.action.includes('contact_submissions')
    ),
    'Form Submissions': availableActions.filter(a => 
      a.action.includes('submit_') || a.action.includes('register_') || a.action.includes('subscribe')
    ),
    'Administrative': availableActions.filter(a => 
      a.authRequired && (a.roleRequired || a.permissionRequired)
    )
  };
  
  res.json({
    success: true,
    data: {
      availableActions,
      categorizedActions,
      totalActions: availableActions.length
    },
    userContext: {
      authenticated: !!req.user,
      role: userRole,
      permissions: userPermissions,
      accessLevel: req.user ? 
        (userRole === 'admin' ? 'full' : 'limited') : 'public'
    },
    systemInfo: {
      totalSystemActions: Object.keys(SAFE_ACTIONS).length,
      publicActions: Object.values(SAFE_ACTIONS).filter(a => !a.auth_required).length,
      protectedActions: Object.values(SAFE_ACTIONS).filter(a => a.auth_required).length
    }
  });
});

// Enhanced health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await executeQuery('SELECT 1 as test');
    
    // Get system stats
    const actionCount = Object.keys(SAFE_ACTIONS).length;
    const publicActions = Object.values(SAFE_ACTIONS).filter(a => !a.auth_required).length;
    const protectedActions = Object.values(SAFE_ACTIONS).filter(a => a.auth_required).length;
    
    res.json({
      success: true,
      status: 'healthy',
      message: 'Comprehensive chat service is running optimally',
      systemStats: {
        totalActions: actionCount,
        publicActions,
        protectedActions,
        categories: ['blogs', 'projects', 'team', 'jobs', 'events', 'partnerships', 'donations', 'contact', 'analytics']
      },
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      message: 'Chat service health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Comprehensive search endpoint
router.post('/search', optionalAuth, async (req, res) => {
  try {
    const { query, categories = [], limit = 20 } = req.body;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const cleanQuery = query.trim().substring(0, 100);
    const results = { query: cleanQuery, categories: {}, totalResults: 0 };
    
    // Search blogs
    if (categories.length === 0 || categories.includes('blogs')) {
      try {
        const blogs = await Blog.search(cleanQuery);
        results.categories.blogs = blogs.slice(0, Math.min(limit, 10));
        results.totalResults += results.categories.blogs.length;
      } catch (error) {
        console.warn('Blog search failed:', error.message);
      }
    }
    
    // Search projects
    if (categories.length === 0 || categories.includes('projects')) {
      try {
        const projects = await executeQuery(`
          SELECT id, title, description, location, status, slug
          FROM projects 
          WHERE (title LIKE ? OR description LIKE ?) 
          AND status IN ('active', 'completed', 'published')
          AND hidden = 0
          ORDER BY featured DESC, title
          LIMIT ?
        `, [`%${cleanQuery}%`, `%${cleanQuery}%`, Math.min(limit, 10)]);
        
        results.categories.projects = projects;
        results.totalResults += projects.length;
      } catch (error) {
        console.warn('Project search failed:', error.message);
      }
    }
    
    // Search team members
    if (categories.length === 0 || categories.includes('team')) {
      try {
        const team = await executeQuery(`
          SELECT name, position, department, bio, country
          FROM team_members 
          WHERE (name LIKE ? OR position LIKE ? OR bio LIKE ?) 
          AND status = 'active'
          ORDER BY name
          LIMIT ?
        `, [`%${cleanQuery}%`, `%${cleanQuery}%`, `%${cleanQuery}%`, Math.min(limit, 5)]);
        
        results.categories.team = team;
        results.totalResults += team.length;
      } catch (error) {
        console.warn('Team search failed:', error.message);
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: `Search completed. Found ${results.totalResults} results for "${cleanQuery}"`,
      searchTime: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Search endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
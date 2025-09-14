const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const geoip = require('geoip-lite');

// Debug logging
console.log('Visit routes module loaded');

// Add middleware to log all requests to visit routes
router.use((req, res, next) => {
  console.log(`Visit route accessed: ${req.method} ${req.path} - Full URL: ${req.originalUrl}`);
  console.log('Query params:', req.query);
  console.log('Body:', req.body);
  next();
});

// Enhanced client info extraction with better IP handling
const getClientInfo = (req) => {
  // More comprehensive IP extraction
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.headers['cf-connecting-ip'] || // Cloudflare
           req.headers['x-client-ip'] ||
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
  
  // Clean IPv4-mapped IPv6 addresses and handle multiple IPs
  if (typeof ip === 'string') {
    ip = ip.split(',')[0].trim(); // Take first IP if multiple
    ip = ip.replace(/^::ffff:/, ''); // Remove IPv6 prefix
  }
  
  // Fallback for local development
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    ip = '8.8.8.8'; // Use a public IP for geoip lookup in development
  }
  
  const userAgent = req.get('User-Agent') || 'Unknown Browser';
  const referrer = req.get('Referrer') || req.get('Referer') || 'direct';
  const geo = geoip.lookup(ip);
  
  return {
    ip: ip,
    country: geo?.country || 'Unknown',
    city: geo?.city || 'Unknown', 
    region: geo?.region || 'Unknown',
    userAgent: userAgent.substring(0, 500), // Limit length
    referrer: referrer.substring(0, 500), // Limit length
    timezone: geo?.timezone || 'UTC',
    coords: geo ? [geo.ll[0], geo.ll[1]] : null
  };
};

// Helper function to ensure database tables exist
const ensureTablesExist = async () => {
  try {
    // Check if visits table exists, create if not
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        visit_date DATE NOT NULL,
        daily_count INT DEFAULT 1,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_visit_date (visit_date)
      )
    `);
    
    // Check if visit_logs table exists, create if not
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS visit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45),
        country VARCHAR(100),
        city VARCHAR(100),
        region VARCHAR(100),
        user_agent TEXT,
        referrer TEXT,
        page_url VARCHAR(500),
        visit_date DATE,
        session_duration INT DEFAULT 0,
        timezone VARCHAR(100),
        screen_resolution VARCHAR(20),
        viewport_size VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_visit_date (visit_date),
        INDEX idx_ip_address (ip_address),
        INDEX idx_country (country)
      )
    `);
    
    console.log('Visit tracking tables ensured to exist');
    return true;
  } catch (error) {
    console.error('Failed to ensure tables exist:', error);
    return false;
  }
};

// Initialize tables on module load
ensureTablesExist();

// Test endpoint to verify route registration
router.get('/test-analytics', (req, res) => {
  console.log('Test analytics endpoint reached');
  res.json({
    success: true,
    message: 'Analytics route is working',
    timestamp: new Date().toISOString(),
    path: req.path,
    originalUrl: req.originalUrl
  });
});

// Record a new visit with comprehensive error handling
router.post('/record', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const clientInfo = getClientInfo(req);
    const { 
      page_url = '/', 
      session_duration = 0, 
      is_final = false,
      screen_resolution,
      viewport_size,
      timezone
    } = req.body || {};

    console.log('Recording visit:', {
      ip: clientInfo.ip,
      country: clientInfo.country,
      page_url,
      session_duration,
      user_agent: clientInfo.userAgent.substring(0, 50) + '...'
    });

    // Ensure tables exist before proceeding
    const tablesExist = await ensureTablesExist();
    if (!tablesExist) {
      throw new Error('Could not ensure database tables exist');
    }

    // Insert detailed visit record into visit_logs table
    try {
      await executeQuery(`
        INSERT INTO visit_logs 
        (ip_address, country, city, region, user_agent, referrer, page_url, 
         visit_date, session_duration, timezone, screen_resolution, viewport_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clientInfo.ip,
        clientInfo.country,
        clientInfo.city,
        clientInfo.region,
        clientInfo.userAgent,
        clientInfo.referrer,
        page_url,
        today,
        session_duration || 0,
        timezone || clientInfo.timezone,
        screen_resolution || null,
        viewport_size || null
      ]);
      
      console.log('Detailed visit log recorded successfully');
    } catch (logError) {
      console.warn('Failed to insert detailed visit log:', logError.message);
      // Continue with daily summary even if detailed log fails
    }

    // Update or create daily summary in visits table
    let dailyCount = 1;
    let lifetimeTotal = 1;
    
    try {
      const [existingRecord] = await executeQuery(
        'SELECT daily_count FROM visits WHERE visit_date = ?',
        [today]
      );

      if (existingRecord) {
        // Update existing record
        await executeQuery(
          'UPDATE visits SET daily_count = daily_count + 1, ip_address = ?, user_agent = ?, updated_at = NOW() WHERE visit_date = ?',
          [clientInfo.ip, clientInfo.userAgent, today]
        );
        
        dailyCount = existingRecord.daily_count + 1;
      } else {
        // Create new record
        await executeQuery(
          'INSERT INTO visits (visit_date, daily_count, ip_address, user_agent) VALUES (?, 1, ?, ?)',
          [today, clientInfo.ip, clientInfo.userAgent]
        );
        
        dailyCount = 1;
      }

      // Get lifetime total
      const [lifetimeResult] = await executeQuery(
        'SELECT SUM(daily_count) as lifetime_total FROM visits'
      );
      
      lifetimeTotal = lifetimeResult?.lifetime_total || dailyCount;

      console.log('Visit summary updated:', { dailyCount, lifetimeTotal });

    } catch (summaryError) {
      console.error('Failed to update visit summary:', summaryError);
      // Try to get existing stats instead of failing completely
      try {
        const [todayRecord] = await executeQuery(
          'SELECT daily_count FROM visits WHERE visit_date = ?', 
          [today]
        );
        const [lifetimeResult] = await executeQuery(
          'SELECT SUM(daily_count) as lifetime_total FROM visits'
        );
        
        dailyCount = todayRecord?.daily_count || 0;
        lifetimeTotal = lifetimeResult?.lifetime_total || 0;
      } catch (fallbackError) {
        console.error('Fallback stats query failed:', fallbackError);
      }
    }

    // Send successful response
    res.json({
      success: true,
      message: 'Visit recorded successfully',
      data: {
        dailyVisits: dailyCount,
        lifetimeVisits: lifetimeTotal,
        visitDate: today,
        country: clientInfo.country,
        city: clientInfo.city,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record visit',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        sql: error.sql
      } : undefined
    });
  }
});

// Get current visit statistics with enhanced analytics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Fetching visit stats for date:', today);

    // Ensure tables exist
    await ensureTablesExist();
    
    // Get today's visits
    const [todayRecord] = await executeQuery(
      'SELECT daily_count, created_at FROM visits WHERE visit_date = ?',
      [today]
    );

    // Get lifetime total
    const [lifetimeResult] = await executeQuery(
      'SELECT SUM(daily_count) as lifetime_total FROM visits'
    );

    // Get top countries from visit_logs if available
    let topCountries = [];
    let avgSessionSeconds = 0;
    
    try {
      topCountries = await executeQuery(`
        SELECT country, COUNT(*) as count
        FROM visit_logs
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND country != 'Unknown'
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
      `);

      // Get average session duration
      const [avgSessionResult] = await executeQuery(`
        SELECT AVG(session_duration) as avg_duration
        FROM visit_logs
        WHERE session_duration > 0 
        AND visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      `);
      
      avgSessionSeconds = avgSessionResult?.avg_duration || 0;
      
      console.log('Enhanced stats retrieved:', { 
        topCountries: topCountries.length, 
        avgSession: avgSessionSeconds 
      });
      
    } catch (err) {
      console.warn('Enhanced analytics unavailable:', err.message);
    }

    // Get recent activity (last 7 days)
    const recentActivity = await executeQuery(`
      SELECT visit_date, daily_count
      FROM visits
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY visit_date DESC
      LIMIT 7
    `);

    const avgSessionFormatted = formatSessionTime(avgSessionSeconds);
    const todayViews = todayRecord?.daily_count || 0;
    const lifetimeViews = lifetimeResult?.lifetime_total || 0;

    console.log('Stats compiled:', { todayViews, lifetimeViews });

    res.json({
      success: true,
      data: {
        todayViews,
        lifetimeViews,
        visitDate: today,
        lastUpdated: todayRecord?.created_at,
        topCountries: topCountries,
        topCountry: topCountries[0]?.country || 'Unknown',
        recentActivity: recentActivity,
        avgSessionTime: avgSessionFormatted,
        totalCountries: topCountries.length,
        enhanced_tracking: topCountries.length > 0
      }
    });

  } catch (error) {
    console.error('Error fetching visit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visit statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Enhanced analytics endpoint for admin dashboard
router.get('/analytics', async (req, res) => {
  console.log('Analytics endpoint accessed');
  console.log('Request details:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'origin': req.headers.origin
    }
  });

  try {
    const { days = 30 } = req.query;
    const daysNum = Math.min(Math.max(parseInt(days), 1), 365); // Limit between 1-365 days
    
    console.log('Processing analytics for', daysNum, 'days');

    // Ensure tables exist
    const tablesExist = await ensureTablesExist();
    console.log('Tables exist check:', tablesExist);

    if (!tablesExist) {
      console.error('Could not ensure tables exist');
      return res.status(500).json({
        success: false,
        message: 'Database tables not available',
        debug: 'Tables creation failed'
      });
    }
    
    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching data for date:', today);

    const [todayStats] = await executeQuery(
      'SELECT daily_count FROM visits WHERE visit_date = ?',
      [today]
    );
    console.log('Today stats result:', todayStats);

    // Total visits
    const [totalStats] = await executeQuery(
      'SELECT SUM(daily_count) as total FROM visits'
    );
    console.log('Total stats result:', totalStats);

    // Initialize default values
    let analyticsData = {
      today_views: todayStats?.daily_count || 0,
      total_views: totalStats?.total || 0,
      unique_visitors: 0,
      new_visitors: 0,
      returning_visitors: 0,
      popular_pages: [],
      traffic_sources: [],
      browser_stats: [],
      top_countries: [],
      period_days: daysNum,
      enhanced_tracking: false,
      debug_info: {
        tables_exist: tablesExist,
        today_date: today,
        raw_today_stats: todayStats,
        raw_total_stats: totalStats
      }
    };

    // Try to get enhanced analytics from visit_logs table
    try {
      console.log('Attempting enhanced analytics queries...');

      // Check if visit_logs table has data
      const [tableCheck] = await executeQuery(
        'SELECT COUNT(*) as count FROM visit_logs LIMIT 1'
      );
      console.log('Visit logs table check:', tableCheck);

      if (tableCheck && tableCheck.count >= 0) {
        // Unique visitors (approximate based on IP)
        const [uniqueVisitorsResult] = await executeQuery(`
          SELECT COUNT(DISTINCT ip_address) as unique_count
          FROM visit_logs
          WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        `, [daysNum]);
        
        analyticsData.unique_visitors = uniqueVisitorsResult?.unique_count || 0;
        console.log('Unique visitors:', analyticsData.unique_visitors);

        // New vs returning visitors
        const newVsReturning = await executeQuery(`
          SELECT 
            ip_address,
            COUNT(*) as visit_count,
            MIN(created_at) as first_visit
          FROM visit_logs
          WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
          GROUP BY ip_address
        `, [daysNum]);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        analyticsData.new_visitors = newVsReturning.filter(v => 
          new Date(v.first_visit) >= thirtyDaysAgo
        ).length;
        
        analyticsData.returning_visitors = newVsReturning.filter(v => 
          v.visit_count > 1 || new Date(v.first_visit) < thirtyDaysAgo
        ).length;

        // Popular pages
        try {
          const popularPages = await executeQuery(`
            SELECT page_url, COUNT(*) as visits
            FROM visit_logs
            WHERE page_url IS NOT NULL 
            AND page_url != ''
            AND visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY page_url
            ORDER BY visits DESC
            LIMIT 10
          `, [daysNum]);
          
          analyticsData.popular_pages = popularPages || [];
          console.log('Popular pages:', analyticsData.popular_pages.length);
        } catch (pagesError) {
          console.warn('Popular pages query failed:', pagesError.message);
        }

        // Top countries
        try {
          const topCountries = await executeQuery(`
            SELECT country, COUNT(*) as count
            FROM visit_logs
            WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            AND country IS NOT NULL 
            AND country != 'Unknown'
            AND country != ''
            GROUP BY country
            ORDER BY count DESC
            LIMIT 10
          `, [daysNum]);
          
          analyticsData.top_countries = topCountries || [];
          console.log('Top countries:', analyticsData.top_countries.length);
        } catch (countriesError) {
          console.warn('Top countries query failed:', countriesError.message);
        }

        // Traffic sources
        try {
          const trafficSources = await executeQuery(`
            SELECT 
              CASE 
                WHEN referrer = 'direct' OR referrer IS NULL OR referrer = '' THEN 'Direct'
                WHEN referrer LIKE '%google%' THEN 'Google'
                WHEN referrer LIKE '%facebook%' THEN 'Facebook'
                WHEN referrer LIKE '%twitter%' OR referrer LIKE '%t.co%' THEN 'Twitter'
                WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
                WHEN referrer LIKE '%instagram%' THEN 'Instagram'
                WHEN referrer LIKE '%youtube%' THEN 'YouTube'
                ELSE 'Other'
              END as source,
              COUNT(*) as visits
            FROM visit_logs
            WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY source
            ORDER BY visits DESC
          `, [daysNum]);
          
          analyticsData.traffic_sources = trafficSources || [];
          console.log('Traffic sources:', analyticsData.traffic_sources.length);
        } catch (trafficError) {
          console.warn('Traffic sources query failed:', trafficError.message);
        }

        // Browser stats
        try {
          const browserStats = await executeQuery(`
            SELECT 
              CASE 
                WHEN user_agent LIKE '%Chrome%' AND user_agent NOT LIKE '%Edge%' THEN 'Chrome'
                WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
                WHEN user_agent LIKE '%Safari%' AND user_agent NOT LIKE '%Chrome%' THEN 'Safari'
                WHEN user_agent LIKE '%Edge%' THEN 'Edge'
                WHEN user_agent LIKE '%Opera%' THEN 'Opera'
                ELSE 'Other'
              END as browser,
              COUNT(*) as count
            FROM visit_logs
            WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            AND user_agent IS NOT NULL
            GROUP BY browser
            ORDER BY count DESC
          `, [daysNum]);
          
          analyticsData.browser_stats = browserStats || [];
          console.log('Browser stats:', analyticsData.browser_stats.length);
        } catch (browserError) {
          console.warn('Browser stats query failed:', browserError.message);
        }

        analyticsData.enhanced_tracking = true;
        console.log('Enhanced analytics completed');
      }

    } catch (enhancedError) {
      console.warn('Enhanced analytics failed:', enhancedError.message);
      console.warn('Stack:', enhancedError.stack);
      
      // Add error details to response for debugging
      analyticsData.debug_info.enhanced_error = {
        message: enhancedError.message,
        stack: enhancedError.stack
      };
    }

    // Daily trend (always available from visits table)
    try {
      const dailyTrend = await executeQuery(`
        SELECT visit_date, daily_count
        FROM visits
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ORDER BY visit_date ASC
      `, [daysNum]);

      analyticsData.daily_trend = dailyTrend || [];
      console.log('Daily trend data points:', analyticsData.daily_trend.length);
    } catch (trendError) {
      console.warn('Daily trend query failed:', trendError.message);
      analyticsData.daily_trend = [];
    }

    console.log('Final analytics data summary:', {
      today_views: analyticsData.today_views,
      total_views: analyticsData.total_views,
      unique_visitors: analyticsData.unique_visitors,
      top_countries_count: analyticsData.top_countries.length,
      popular_pages_count: analyticsData.popular_pages.length,
      traffic_sources_count: analyticsData.traffic_sources.length,
      browser_stats_count: analyticsData.browser_stats.length,
      daily_trend_count: analyticsData.daily_trend.length,
      enhanced_tracking: analyticsData.enhanced_tracking
    });

    res.json({
      success: true,
      data: analyticsData,
      generated_at: new Date().toISOString(),
      server_time: new Date().toLocaleString(),
      debug_enabled: process.env.NODE_ENV === 'development'
    });

  } catch (error) {
    console.error('Analytics endpoint error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        sql: error.sql
      } : 'Internal server error',
      debug_info: {
        endpoint: '/analytics',
        timestamp: new Date().toISOString(),
        request_path: req.path,
        original_url: req.originalUrl
      }
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await executeQuery('SELECT 1 as test');
    
    // Check if tables exist
    const tablesExist = await ensureTablesExist();
    
    res.json({
      success: true,
      message: 'Visit tracking system is healthy',
      database: 'connected',
      tables: tablesExist ? 'ready' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Visit tracking system health check failed',
      error: error.message
    });
  }
});

// Get visit history (admin only - add authentication as needed)
router.get('/history', async (req, res) => {
  try {
    const { days = 30, limit = 100 } = req.query;
    
    const history = await executeQuery(
      'SELECT visit_date, daily_count, created_at FROM visits ORDER BY visit_date DESC LIMIT ?',
      [Math.min(parseInt(limit), 1000)] // Max 1000 records
    );

    const [totalResult] = await executeQuery(
      'SELECT SUM(daily_count) as total_visits, COUNT(*) as total_days FROM visits'
    );

    res.json({
      success: true,
      data: {
        history,
        totalVisits: totalResult?.total_visits || 0,
        totalDays: totalResult?.total_days || 0,
        recordsShown: history.length
      }
    });

  } catch (error) {
    console.error('Error fetching visit history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visit history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Debug routes endpoint for troubleshooting
router.get('/debug-routes', (req, res) => {
  console.log('Debug routes endpoint accessed');
  
  const routes = [];
  router.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods);
      routes.push({
        path: layer.route.path,
        methods: methods,
        stack_length: layer.route.stack.length
      });
    }
  });

  res.json({
    success: true,
    message: 'Visit routes debug information',
    available_routes: routes,
    total_routes: routes.length,
    base_path: '/api/visits',
    server_time: new Date().toISOString()
  });
});

// Helper function to format session time
function formatSessionTime(seconds) {
  if (!seconds || seconds < 1) return '0m 0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

// Test endpoints for development
if (process.env.NODE_ENV === 'development') {
  // Reset daily visits (admin only - for testing)
  router.delete('/reset-daily', async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await executeQuery(
        'UPDATE visits SET daily_count = 0 WHERE visit_date = ?',
        [today]
      );

      res.json({
        success: true,
        message: 'Daily visits reset successfully'
      });

    } catch (error) {
      console.error('Error resetting daily visits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset daily visits',
        error: error.message
      });
    }
  });

  // Get detailed logs for debugging
  router.get('/debug-logs', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      
      const logs = await executeQuery(`
        SELECT * FROM visit_logs 
        ORDER BY created_at DESC 
        LIMIT ?
      `, [Math.min(parseInt(limit), 200)]);

      res.json({
        success: true,
        data: logs,
        count: logs.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

console.log('Enhanced visit routes with debugging loaded');

module.exports = router;
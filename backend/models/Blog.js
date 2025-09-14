// Updated Blog.js model with news categorization support
const { executeQuery } = require('../config/database');

class Blog {
  static async getAll(limit = null) {
    let query = `
      SELECT b.*, u.name as author_name, COALESCE(b.views, 0) as views
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.status = 'published' AND b.approved = TRUE
      ORDER BY b.published_at DESC
    `;
    return limit ? await executeQuery(query + ' LIMIT ?', [limit]) : await executeQuery(query);
  }

  static async getAllAdmin() {
    const query = `
      SELECT b.*, u.name as author_name, u.role as author_role, COALESCE(b.views, 0) as views
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      ORDER BY b.created_at DESC
    `;
    return await executeQuery(query);
  }

  static async getBySlug(slug) {
    const query = `
      SELECT b.*, u.name as author_name, u.role as author_role, COALESCE(b.views, 0) as views
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.slug = ? AND b.status = 'published' AND b.approved = TRUE
    `;
    const result = await executeQuery(query, [slug]);
    return result[0] || null;
  }

  static async getById(id) {
    const query = `
      SELECT b.*, u.name as author_name, u.role as author_role, COALESCE(b.views, 0) as views
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.id = ?
    `;
    const result = await executeQuery(query, [id]);
    return result[0] || null;
  }

  static async create(data) {
    const query = `
      INSERT INTO blog_posts 
      (title, slug, content, excerpt, featured_image, author_id, status, published_at, 
       meta_title, meta_description, tags, is_featured, is_news, news_type, target_countries, approved, views)
      VALUES (?, ?, ?, ?, ?, ?, ?, 
        CASE WHEN ? = 'published' AND ? = TRUE THEN NOW() ELSE NULL END,
        ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.title,
      data.slug,
      data.content,
      data.excerpt || null,
      data.featured_image || null,
      data.author_id,
      data.status,
      data.status,
      data.approved,
      data.meta_title || data.title,
      data.meta_description || data.excerpt,
      JSON.stringify(data.tags || []),
      data.is_featured || false,
      data.is_news || false,
      data.news_type || 'general',
      data.target_countries ? JSON.stringify(data.target_countries) : null,
      data.approved || false,
      data.views || 0
    ];

    const result = await executeQuery(query, values);
    return await this.getById(result.insertId);
  }

  static async update(id, data) {
    let query = `
      UPDATE blog_posts
      SET title = ?, slug = ?, content = ?, excerpt = ?, featured_image = ?,
          status = ?, meta_title = ?, meta_description = ?, tags = ?,
          is_featured = ?, is_news = ?, news_type = ?, target_countries = ?, approved = ?
    `;

    const values = [
      data.title,
      data.slug,
      data.content,
      data.excerpt || null,
      data.featured_image || null,
      data.status || 'draft',
      data.meta_title || data.title,
      data.meta_description || data.excerpt,
      JSON.stringify(data.tags || []),
      data.is_featured || false,
      data.is_news || false,
      data.news_type || 'general',
      data.target_countries ? JSON.stringify(data.target_countries) : null,
      data.approved || false
    ];

    // Handle published_at logic
    if (data.status === 'published' && data.approved) {
      const currentPost = await this.getById(id);
      if (!currentPost.published_at) {
        query += ', published_at = ?';
        values.push(new Date());
      }
    } else if (data.status === 'draft' || !data.approved) {
      query += ', published_at = NULL';
    }

    // Preserve views count
    if (data.views !== undefined) {
      query += ', views = ?';
      values.push(data.views);
    }

    query += ' WHERE id = ?';
    values.push(id);

    await executeQuery(query, values);
    return await this.getById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM blog_posts WHERE id = ?';
    await executeQuery(query, [id]);
    return true;
  }

  static async generateSlug(title, excludeId = null) {
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 0;

    while (true) {
      let query = 'SELECT id FROM blog_posts WHERE slug = ?';
      let params = [slug];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const existing = await executeQuery(query, params);
      if (existing.length === 0) break;

      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }

  static async search(term) {
    const query = `
      SELECT b.*, u.name as author_name, COALESCE(b.views, 0) as views
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.status = 'published' AND b.approved = TRUE
      AND (b.title LIKE ? OR b.content LIKE ? OR b.excerpt LIKE ?)
      ORDER BY b.published_at DESC
    `;
    const likeTerm = `%${term}%`;
    return await executeQuery(query, [likeTerm, likeTerm, likeTerm]);
  }

  static async getByTag(tag) {
    const query = `
      SELECT b.*, u.name as author_name, COALESCE(b.views, 0) as views
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.status = 'published' AND b.approved = TRUE
      AND JSON_CONTAINS(b.tags, ?)
      ORDER BY b.published_at DESC
    `;
    return await executeQuery(query, [JSON.stringify(tag)]);
  }

  // NEW: Get news posts filtered by type and country
  static async getNews(type = 'all', countryCode = null, limit = 10) {
    let query = `
      SELECT b.*, u.name as author_name, COALESCE(b.views, 0) as views
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.status = 'published' AND b.approved = TRUE AND b.is_news = 1
    `;
    const params = [];

    if (type === 'general') {
      query += ' AND b.news_type = ?';
      params.push('general');
    } else if (type === 'country_specific') {
      query += ' AND b.news_type = ?';
      params.push('country_specific');
      
      if (countryCode) {
        query += ' AND JSON_CONTAINS(b.target_countries, ?)';
        params.push(JSON.stringify(countryCode));
      }
    } else if (countryCode) {
      // Get all news for specific country (general + country-specific)
      query += ' AND (b.news_type = ? OR JSON_CONTAINS(b.target_countries, ?))';
      params.push('general', JSON.stringify(countryCode));
    }

    query += ' ORDER BY b.published_at DESC';
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    return await executeQuery(query, params);
  }

  // NEW: Get country-specific news for a country
  static async getCountryNews(countryCode, limit = 10) {
    const query = `
      SELECT b.*, u.name as author_name, COALESCE(b.views, 0) as views
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.status = 'published' AND b.approved = TRUE AND b.is_news = 1
      AND (b.news_type = 'general' OR JSON_CONTAINS(b.target_countries, ?))
      ORDER BY b.published_at DESC
      LIMIT ?
    `;
    return await executeQuery(query, [JSON.stringify(countryCode), limit]);
  }

  // Get blog analytics
  static async getAnalytics(id) {
    try {
      const viewsQuery = `
        SELECT 
          COUNT(*) as total_views,
          COUNT(DISTINCT ip_address) as unique_views,
          COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_id END) as registered_user_views,
          DATE(viewed_at) as view_date,
          COUNT(*) as daily_views
        FROM blog_views 
        WHERE blog_id = ? 
        GROUP BY DATE(viewed_at)
        ORDER BY view_date DESC
        LIMIT 30
      `;
      
      const dailyViews = await executeQuery(viewsQuery, [id]);
      
      const summaryQuery = `
        SELECT 
          COUNT(*) as total_views,
          COUNT(DISTINCT ip_address) as unique_views,
          COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_id END) as registered_user_views
        FROM blog_views 
        WHERE blog_id = ?
      `;
      
      const summary = await executeQuery(summaryQuery, [id]);
      
      return {
        summary: summary[0] || { total_views: 0, unique_views: 0, registered_user_views: 0 },
        daily_views: dailyViews
      };
    } catch (error) {
      console.error('Error fetching blog analytics:', error);
      return {
        summary: { total_views: 0, unique_views: 0, registered_user_views: 0 },
        daily_views: []
      };
    }
  }

  // Get popular blogs
  static async getPopular(limit = 10) {
    const query = `
      SELECT b.*, u.name as author_name, COALESCE(b.views, 0) as views
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.status = 'published' AND b.approved = TRUE
      ORDER BY b.views DESC, b.published_at DESC
      LIMIT ?
    `;
    return await executeQuery(query, [limit]);
  }

  // Get trending blogs
  static async getTrending(limit = 10) {
    try {
      const recentViewsQuery = `
        SELECT 
          blog_id,
          COUNT(*) as recent_views
        FROM blog_views 
        WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY blog_id
      `;
      
      const recentViews = await executeQuery(recentViewsQuery);
      
      const recentViewsMap = {};
      recentViews.forEach(row => {
        recentViewsMap[row.blog_id] = row.recent_views;
      });
      
      const blogsQuery = `
        SELECT b.*, u.name as author_name, COALESCE(b.views, 0) as views
        FROM blog_posts b
        LEFT JOIN users u ON b.author_id = u.id
        WHERE b.status = 'published' AND b.approved = TRUE
        ORDER BY b.views DESC, b.published_at DESC
      `;
      
      const blogs = await executeQuery(blogsQuery);
      
      const blogsWithTrending = blogs.map(blog => ({
        ...blog,
        recent_views: recentViewsMap[blog.id] || 0,
        trending_score: (recentViewsMap[blog.id] || 0) * 0.7 + (blog.views || 0) * 0.3
      }));
      
      blogsWithTrending.sort((a, b) => b.trending_score - a.trending_score);
      
      return blogsWithTrending.slice(0, limit);
      
    } catch (error) {
      console.error('Error fetching trending blogs:', error);
      return await this.getPopular(limit);
    }
  }
}

module.exports = Blog;
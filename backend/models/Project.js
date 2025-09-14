const { executeQuery } = require('../config/database');

class Project {
  // Get all projects with pagination and filtering








  // Parse testimonials from either new JSON format or old individual fields
  static parseTestimonials(project) {
    // Check if new testimonials JSON column exists and has data
    if (project.testimonials) {
      return this.safeJsonParse(project.testimonials, []);
    }
    
    // Fall back to old individual fields for backward compatibility
    if (project.testimonial_text || project.testimonial_author || project.testimonial_position) {
      return [{
        text: project.testimonial_text || '',
        author: project.testimonial_author || '',
        position: project.testimonial_position || ''
      }];
    }
    
    return [];
  }



// Updated createProject method in Project.js
static async createProject(projectData) {
  try {
    console.log('Project.createProject called with data:', projectData);

    // Validate required fields
    if (!projectData.title || !projectData.description) {
      throw new Error('Title and description are required');
    }

    const {
      title, pillarId, categoryId, countryId, slug, description, short_description,
      featured_image, gallery, location, start_date, end_date, status,
      sdg_goals, testimonials, project_impacts, order_index, is_featured, is_hidden
    } = projectData;

    const query = `
      INSERT INTO projects (
        title, pillarId, categoryId, countryId, slug, description, short_description,
        featured_image, gallery, location, start_date, end_date, status,
        sdg_goals, testimonials, order_index, is_featured, is_hidden
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      title,
      pillarId || null, // ADD THIS PARAMETER
      categoryId || null,
      countryId || null,
      slug,
      description,
      short_description || null,
      featured_image || null,
      gallery && gallery.length > 0 ? JSON.stringify(gallery) : null,
      location || null,
      start_date || null,
      end_date || null,
      status || 'planning',
      sdg_goals && sdg_goals.length > 0 ? JSON.stringify(sdg_goals) : null,
      testimonials && testimonials.length > 0 ? JSON.stringify(testimonials) : null,
      order_index || 0,
      is_featured || false,
      is_hidden || false
    ];

    console.log('Executing insert with params:', params);

    const result = await executeQuery(query, params);
    console.log('Insert result:', result);

    // Handle project impacts
    if (project_impacts && Array.isArray(project_impacts) && project_impacts.length > 0) {
      await this.saveProjectImpacts(result.insertId, project_impacts);
    }

    return await this.getProjectById(result.insertId);
  } catch (error) {
    console.error('Error in Project.createProject:', error);
    throw new Error(`Database error while creating project: ${error.message}`);
  }
}

// Updated updateProject method in Project.js
static async updateProject(id, projectData) {
  try {
    console.log('Project.updateProject called with ID:', id, 'and data:', projectData);

    if (!id) {
      throw new Error('Project ID is required');
    }

    // Validate required fields
    if (!projectData.title || !projectData.description) {
      throw new Error('Title and description are required');
    }

    const {
      title, pillarId, categoryId, countryId, slug, description, short_description,
      featured_image, gallery, location, start_date, end_date, status,
      sdg_goals, testimonials, project_impacts, order_index, is_featured, is_hidden
    } = projectData;

    const query = `
      UPDATE projects SET
        title = ?, pillarId = ?, categoryId = ?, countryId = ?, slug = ?, description = ?,
        short_description = ?, featured_image = ?, gallery = ?, location = ?,
        start_date = ?, end_date = ?, status = ?, sdg_goals = ?,
        testimonials = ?, order_index = ?, is_featured = ?, is_hidden = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      title,
      pillarId || null, // ADD THIS PARAMETER
      categoryId || null,
      countryId || null,
      slug,
      description,
      short_description || null,
      featured_image || null,
      gallery && gallery.length > 0 ? JSON.stringify(gallery) : null,
      location || null,
      start_date || null,
      end_date || null,
      status || 'planning',
      sdg_goals && sdg_goals.length > 0 ? JSON.stringify(sdg_goals) : null,
      testimonials && testimonials.length > 0 ? JSON.stringify(testimonials) : null,
      order_index || 0,
      is_featured || false,
      is_hidden || false,
      id // This comes last for the WHERE clause
    ];

    console.log('Executing update with params:', params);

    const result = await executeQuery(query, params);
    console.log('Update result:', result);

    // Handle project impacts - delete existing and add new ones
    if (project_impacts !== undefined) {
      await this.deleteProjectImpacts(id);
      if (Array.isArray(project_impacts) && project_impacts.length > 0) {
        await this.saveProjectImpacts(id, project_impacts);
      }
    }

    return await this.getProjectById(id);
  } catch (error) {
    console.error('Error in Project.updateProject:', error);
    throw new Error(`Database error while updating project: ${error.message}`);
  }
}

// Updated getAllProjects method to include pillar info in queries
static async getAllProjects(filters = {}) {
  try {
    console.log('Project.getAllProjects called with filters:', filters);

    let query = `
      SELECT p.*, c.name as category_name, co.name as country_name, pil.name as pillar_name
      FROM projects p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN countries co ON p.countryId = co.id
      LEFT JOIN pillars pil ON p.pillarId = pil.id
    `;
    
    const conditions = [];
    const params = [];

    if (filters.pillarId) { // ADD PILLAR FILTER
      conditions.push('p.pillarId = ?');
      params.push(filters.pillarId);
    }

    if (filters.categoryId) {
      conditions.push('p.categoryId = ?');
      params.push(filters.categoryId);
    }

    if (filters.countryId) {
      conditions.push('p.countryId = ?');
      params.push(filters.countryId);
    }

    if (filters.status) {
      conditions.push('p.status = ?');
      params.push(filters.status);
    }

    if (filters.featured !== undefined) {
      conditions.push('p.is_featured = ?');
      params.push(filters.featured);
    }

    if (filters.hidden !== undefined) {
      conditions.push('p.is_hidden = ?');
      params.push(filters.hidden);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.order_index ASC, p.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    console.log('Executing query:', query);
    console.log('With params:', params);

    const projects = await executeQuery(query, params);
    console.log(`Found ${projects.length} projects`);
    
    // Process projects as before...
    const processedProjects = await Promise.all(projects.map(async project => {
      try {
        const projectImpacts = await this.getProjectImpacts(project.id);
        
        return {
          ...project,
          gallery: this.safeJsonParse(project.gallery, []),
          sdg_goals: this.safeJsonParse(project.sdg_goals, []),
          testimonials: this.parseTestimonials(project),
          project_impacts: projectImpacts
        };
      } catch (parseError) {
        console.error('Error parsing project data:', parseError, 'Project ID:', project.id);
        return {
          ...project,
          gallery: [],
          sdg_goals: [],
          testimonials: [],
          project_impacts: []
        };
      }
    }));

    return processedProjects;
  } catch (error) {
    console.error('Error in Project.getAllProjects:', error);
    console.error('Stack trace:', error.stack);
    throw new Error(`Database error while fetching projects: ${error.message}`);
  }
}

// Also update getProjectById and getProjectBySlug to include pillar info
static async getProjectById(id) {
  try {
    console.log('Project.getProjectById called with ID:', id);

    if (!id) {
      throw new Error('Project ID is required');
    }

    const query = `
      SELECT p.*, c.name as category_name, co.name as country_name, pil.name as pillar_name
      FROM projects p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN countries co ON p.countryId = co.id
      LEFT JOIN pillars pil ON p.pillarId = pil.id
      WHERE p.id = ?
    `;
    
    const results = await executeQuery(query, [id]);
    
    if (results.length === 0) {
      return null;
    }

    const project = results[0];
    const projectImpacts = await this.getProjectImpacts(id);
    
    return {
      ...project,
      gallery: this.safeJsonParse(project.gallery, []),
      sdg_goals: this.safeJsonParse(project.sdg_goals, []),
      testimonials: this.parseTestimonials(project),
      project_impacts: projectImpacts
    };
  } catch (error) {
    console.error('Error in Project.getProjectById:', error);
    throw new Error(`Database error while fetching project by ID: ${error.message}`);
  }
}





















static async addGalleryImage(projectId, imagePath) {
  try {
    console.log('Project.addGalleryImage called with projectId:', projectId, 'imagePath:', imagePath);

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let gallery = Array.isArray(project.gallery) ? project.gallery : [];
    gallery.push(imagePath);

    const query = `
      UPDATE projects 
      SET gallery = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await executeQuery(query, [JSON.stringify(gallery), projectId]);
    return await this.getProjectById(projectId);
  } catch (error) {
    console.error('Error in Project.addGalleryImage:', error);
    throw new Error(`Database error while adding gallery image: ${error.message}`);
  }
}

static async removeGalleryImage(projectId, imageIndex) {
  try {
    console.log('Project.removeGalleryImage called with projectId:', projectId, 'imageIndex:', imageIndex);

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let gallery = Array.isArray(project.gallery) ? project.gallery : [];
    
    if (imageIndex < 0 || imageIndex >= gallery.length) {
      throw new Error('Invalid image index');
    }

    // Remove the image from array
    const removedImage = gallery.splice(imageIndex, 1)[0];

    const query = `
      UPDATE projects 
      SET gallery = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await executeQuery(query, [JSON.stringify(gallery), projectId]);
    
    return {
      project: await this.getProjectById(projectId),
      removedImage: removedImage
    };
  } catch (error) {
    console.error('Error in Project.removeGalleryImage:', error);
    throw new Error(`Database error while removing gallery image: ${error.message}`);
  }
}

static async clearGallery(projectId) {
  try {
    console.log('Project.clearGallery called with projectId:', projectId);

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const query = `
      UPDATE projects 
      SET gallery = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await executeQuery(query, [projectId]);
    
    return {
      project: await this.getProjectById(projectId),
      removedImages: project.gallery || []
    };
  } catch (error) {
    console.error('Error in Project.clearGallery:', error);
    throw new Error(`Database error while clearing gallery: ${error.message}`);
  }
}









// Update parseTestimonials method to work with new testimonials column
static parseTestimonials(project) {
  // First check if new testimonials JSON column exists and has data
  if (project.testimonials) {
    return this.safeJsonParse(project.testimonials, []);
  }
  
  // Fall back to old individual fields for backward compatibility
  if (project.testimonial_text || project.testimonial_author || project.testimonial_position) {
    return [{
      text: project.testimonial_text || '',
      author: project.testimonial_author || '',
      position: project.testimonial_position || ''
    }];
  }
  
  return [];
}








// Get project by slug - FIXED VERSION WITH PILLAR JOIN
static async getProjectBySlug(slug) {
  try {
    console.log('Project.getProjectBySlug called with slug:', slug);

    if (!slug) {
      throw new Error('Project slug is required');
    }

    const query = `
      SELECT p.*, c.name as category_name, co.name as country_name, pil.name as pillar_name
      FROM projects p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN countries co ON p.countryId = co.id
      LEFT JOIN pillars pil ON p.pillarId = pil.id
      WHERE p.slug = ?
    `;
    
    const results = await executeQuery(query, [slug]);
    
    if (results.length === 0) {
      return null;
    }

    const project = results[0];
    const projectImpacts = await this.getProjectImpacts(project.id);
    
    return {
      ...project,
      gallery: this.safeJsonParse(project.gallery, []),
      sdg_goals: this.safeJsonParse(project.sdg_goals, []),
      testimonials: this.parseTestimonials(project),
      project_impacts: projectImpacts
    };
  } catch (error) {
    console.error('Error in Project.getProjectBySlug:', error);
    throw new Error(`Database error while fetching project by slug: ${error.message}`);
  }
}




  // Get project impacts
  static async getProjectImpacts(projectId) {
    try {
      console.log('Project.getProjectImpacts called with projectId:', projectId);

      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const query = `
        SELECT pi.*, i.name as impact_name, i.unit, i.description as impact_description
        FROM project_impacts pi
        JOIN impacts i ON pi.impact_id = i.id
        WHERE pi.project_id = ? AND i.is_active = true
        ORDER BY pi.created_at ASC
      `;
      
      const results = await executeQuery(query, [projectId]);
      console.log(`Found ${results.length} project impacts`);
      
      return results;
    } catch (error) {
      console.error('Error in Project.getProjectImpacts:', error);
      throw new Error(`Database error while fetching project impacts: ${error.message}`);
    }
  }

  // Save project impacts (with duplicate prevention)
  static async saveProjectImpacts(projectId, impactsData) {
    try {
      console.log('Project.saveProjectImpacts called with projectId:', projectId, 'and impacts:', impactsData);

      if (!projectId) {
        throw new Error('Project ID is required');
      }

      if (!Array.isArray(impactsData) || impactsData.length === 0) {
        console.log('No impacts to save');
        return;
      }

      // Validate and filter impacts to prevent duplicates
      const validImpacts = [];
      const seenImpactIds = new Set();

      for (const impact of impactsData) {
        if (!impact.impact_id || !impact.contribution_value) {
          console.warn('Skipping invalid impact:', impact);
          continue;
        }

        const impactId = parseInt(impact.impact_id);
        const contributionValue = parseInt(impact.contribution_value) || 0;

        if (seenImpactIds.has(impactId)) {
          console.warn(`Duplicate impact_id ${impactId} detected, skipping duplicate`);
          continue;
        }

        seenImpactIds.add(impactId);
        validImpacts.push({
          impact_id: impactId,
          contribution_value: contributionValue
        });
      }

      if (validImpacts.length === 0) {
        console.log('No valid impacts to save after filtering');
        return;
      }

      // Insert all valid impacts
      const insertPromises = validImpacts.map(impact => {
        const query = `
          INSERT INTO project_impacts (project_id, impact_id, contribution_value)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            contribution_value = VALUES(contribution_value),
            updated_at = CURRENT_TIMESTAMP
        `;
        return executeQuery(query, [projectId, impact.impact_id, impact.contribution_value]);
      });

      await Promise.all(insertPromises);
      console.log(`Saved ${validImpacts.length} project impacts`);

    } catch (error) {
      console.error('Error in Project.saveProjectImpacts:', error);
      throw new Error(`Database error while saving project impacts: ${error.message}`);
    }
  }

  // Delete all project impacts for a project
  static async deleteProjectImpacts(projectId) {
    try {
      console.log('Project.deleteProjectImpacts called with projectId:', projectId);

      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const query = 'DELETE FROM project_impacts WHERE project_id = ?';
      const result = await executeQuery(query, [projectId]);
      
      console.log(`Deleted ${result.affectedRows} project impacts`);
      return result.affectedRows;

    } catch (error) {
      console.error('Error in Project.deleteProjectImpacts:', error);
      throw new Error(`Database error while deleting project impacts: ${error.message}`);
    }
  }

  // Delete project
  static async deleteProject(id) {
    try {
      console.log('Project.deleteProject called with ID:', id);

      if (!id) {
        throw new Error('Project ID is required');
      }

      // First delete related project impacts
      await this.deleteProjectImpacts(id);

      const query = 'DELETE FROM projects WHERE id = ?';
      const result = await executeQuery(query, [id]);
      console.log('Delete result:', result);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Project.deleteProject:', error);
      throw new Error(`Database error while deleting project: ${error.message}`);
    }
  }




  
static async toggleFeatured(id) {
  try {
    console.log('Project.toggleFeatured called with ID:', id);

    if (!id) {
      throw new Error('Project ID is required');
    }

    const query = `
      UPDATE projects 
      SET is_featured = NOT is_featured, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    console.log('Toggle featured result:', result);

    return await this.getProjectById(id);
  } catch (error) {
    console.error('Error in Project.toggleFeatured:', error);
    throw new Error(`Database error while toggling featured status: ${error.message}`);
  }
}

static async toggleHidden(id) {
  try {
    console.log('Project.toggleHidden called with ID:', id);

    if (!id) {
      throw new Error('Project ID is required');
    }

    const query = `
      UPDATE projects 
      SET is_hidden = NOT is_hidden, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    console.log('Toggle hidden result:', result);

    return await this.getProjectById(id);
  } catch (error) {
    console.error('Error in Project.toggleHidden:', error);
    throw new Error(`Database error while toggling hidden status: ${error.message}`);
  }
}





  // Get featured projects
  static async getFeaturedProjects(limit = 6) {
    try {
      console.log('Project.getFeaturedProjects called with limit:', limit);

      const query = `
        SELECT p.*, c.name as category_name, co.name as country_name 
        FROM projects p
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN countries co ON p.countryId = co.id
        WHERE p.is_featured = true AND p.is_hidden = false
        ORDER BY p.order_index ASC, p.created_at DESC
        LIMIT ?
      `;
      
      const projects = await executeQuery(query, [limit]);
      console.log(`Found ${projects.length} featured projects`);
      
      return projects.map(project => ({
        ...project,
        gallery: this.safeJsonParse(project.gallery, []),
        sdg_goals: this.safeJsonParse(project.sdg_goals, []),
        testimonials: this.parseTestimonials(project)
      }));
    } catch (error) {
      console.error('Error in Project.getFeaturedProjects:', error);
      throw new Error(`Database error while fetching featured projects: ${error.message}`);
    }
  }

  // Check if slug exists
  static async slugExists(slug, excludeId = null) {
    try {
      console.log('Project.slugExists called with slug:', slug, 'excludeId:', excludeId);

      if (!slug) {
        throw new Error('Slug is required');
      }

      let query = 'SELECT id FROM projects WHERE slug = ?';
      const params = [slug];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const results = await executeQuery(query, params);
      const exists = results.length > 0;
      console.log('Slug exists:', exists);

      return exists;
    } catch (error) {
      console.error('Error in Project.slugExists:', error);
      throw new Error(`Database error while checking slug existence: ${error.message}`);
    }
  }

  // Generate unique slug
  static generateSlug(title) {
    if (!title) {
      throw new Error('Title is required to generate slug');
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);

    console.log('Generated slug:', slug, 'from title:', title);
    return slug;
  }

  // Get project statistics
  static async getProjectStats() {
    try {
      console.log('Project.getProjectStats called');

      const queries = {
        total: 'SELECT COUNT(*) as count FROM projects',
        featured: 'SELECT COUNT(*) as count FROM projects WHERE is_featured = true',
        visible: 'SELECT COUNT(*) as count FROM projects WHERE is_hidden = false',
        byStatus: `
          SELECT status, COUNT(*) as count 
          FROM projects 
          GROUP BY status
        `,
        byCategory: `
          SELECT c.name as category, COUNT(p.id) as count
          FROM categories c
          LEFT JOIN projects p ON c.id = p.categoryId
          GROUP BY c.id, c.name
        `,
        totalImpacts: `
          SELECT COUNT(*) as count 
          FROM project_impacts pi
          JOIN projects p ON pi.project_id = p.id
          WHERE p.is_hidden = false
        `
      };

      const [total, featured, visible, byStatus, byCategory, totalImpacts] = await Promise.all([
        executeQuery(queries.total),
        executeQuery(queries.featured),
        executeQuery(queries.visible),
        executeQuery(queries.byStatus),
        executeQuery(queries.byCategory),
        executeQuery(queries.totalImpacts)
      ]);

      const stats = {
        total: total[0].count,
        featured: featured[0].count,
        visible: visible[0].count,
        totalImpacts: totalImpacts[0].count,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}),
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = item.count;
          return acc;
        }, {})
      };

      console.log('Project stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error in Project.getProjectStats:', error);
      throw new Error(`Database error while fetching project statistics: ${error.message}`);
    }
  }

  // Safe JSON parsing helper
  static safeJsonParse(jsonString, defaultValue = null) {
    if (!jsonString || jsonString === null || jsonString === undefined) {
      return defaultValue;
    }

    if (typeof jsonString === 'object') {
      return jsonString; // Already parsed
    }

    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Failed to parse JSON:', jsonString, 'Error:', error.message);
      return defaultValue;
    }
  }

  // Validate project data
  static validateProjectData(projectData) {
    const errors = [];

    if (!projectData.title || projectData.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!projectData.description || projectData.description.trim() === '') {
      errors.push('Description is required');
    }

    if (projectData.title && projectData.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }

    if (projectData.categoryId && isNaN(parseInt(projectData.categoryId))) {
      errors.push('Category ID must be a valid number');
    }

    if (projectData.countryId && isNaN(parseInt(projectData.countryId))) {
      errors.push('Country ID must be a valid number');
    }

    if (projectData.order_index && isNaN(parseInt(projectData.order_index))) {
      errors.push('Order index must be a valid number');
    }

    const validStatuses = ['planning', 'ongoing', 'completed', 'on_hold'];
    if (projectData.status && !validStatuses.includes(projectData.status)) {
      errors.push('Status must be one of: ' + validStatuses.join(', '));
    }

    if (projectData.start_date && projectData.end_date) {
      const startDate = new Date(projectData.start_date);
      const endDate = new Date(projectData.end_date);
      if (startDate > endDate) {
        errors.push('Start date must be before end date');
      }
    }

    // Validate project impacts for duplicates
    if (projectData.project_impacts && Array.isArray(projectData.project_impacts)) {
      const impactIds = projectData.project_impacts
        .filter(impact => impact.impact_id)
        .map(impact => parseInt(impact.impact_id));
      
      const duplicates = impactIds.filter((id, index) => impactIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        errors.push('Duplicate impacts detected. Each impact can only be added once per project.');
      }
    }

    return errors;
  }

  // Create project with validation
  static async createProjectWithValidation(projectData) {
    const errors = this.validateProjectData(projectData);
    if (errors.length > 0) {
      throw new Error('Validation failed: ' + errors.join(', '));
    }

    return await this.createProject(projectData);
  }

  // Update project with validation
  static async updateProjectWithValidation(id, projectData) {
    const errors = this.validateProjectData(projectData);
    if (errors.length > 0) {
      throw new Error('Validation failed: ' + errors.join(', '));
    }

    return await this.updateProject(id, projectData);
  }

  // Check if project has impact
  static async projectHasImpact(projectId, impactId) {
    try {
      const query = 'SELECT id FROM project_impacts WHERE project_id = ? AND impact_id = ?';
      const results = await executeQuery(query, [projectId, impactId]);
      return results.length > 0;
    } catch (error) {
      console.error('Error in Project.projectHasImpact:', error);
      return false;
    }
  }

  // Get projects by impact
  static async getProjectsByImpact(impactId, limit = null) {
    try {
      console.log('Project.getProjectsByImpact called with impactId:', impactId);

      if (!impactId) {
        throw new Error('Impact ID is required');
      }

      let query = `
        SELECT p.*, c.name as category_name, co.name as country_name, 
               pi.contribution_value, i.name as impact_name, i.unit
        FROM projects p
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN countries co ON p.countryId = co.id
        JOIN project_impacts pi ON p.id = pi.project_id
        JOIN impacts i ON pi.impact_id = i.id
        WHERE pi.impact_id = ? AND p.is_hidden = false
        ORDER BY pi.contribution_value DESC, p.created_at DESC
      `;

      const params = [impactId];

      if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
      }

      const projects = await executeQuery(query, params);
      console.log(`Found ${projects.length} projects for impact ${impactId}`);

      return projects.map(project => ({
        ...project,
        gallery: this.safeJsonParse(project.gallery, []),
        sdg_goals: this.safeJsonParse(project.sdg_goals, []),
        testimonials: this.parseTestimonials(project)
      }));
    } catch (error) {
      console.error('Error in Project.getProjectsByImpact:', error);
      throw new Error(`Database error while fetching projects by impact: ${error.message}`);
    }
  }
}

module.exports = Project;
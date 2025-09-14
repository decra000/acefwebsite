const Project = require('../models/Project');
const { deleteFile, deleteFiles } = require('../middleware/upload');

// Get all projects with filtering and pagination
const getAllProjects = async (req, res) => {
  try {
    console.log('getAllProjects called with query:', req.query);
    
    const filters = {
      pillarId: req.query.pillarId, // ADD THIS LINE
      categoryId: req.query.categoryId,
      countryId: req.query.countryId,
      status: req.query.status,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      hidden: req.query.hidden === 'true' ? true : req.query.hidden === 'false' ? false : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    console.log('Processed filters:', filters);

    const projects = await Project.getAllProjects(filters);
    
    console.log(`Found ${projects.length} projects`);

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting project by ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const project = await Project.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error in getProjectById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get project by slug
const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Getting project by slug:', slug);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Slug is required'
      });
    }

    const project = await Project.getProjectBySlug(slug);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error in getProjectBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get project impacts
const getProjectImpacts = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting project impacts for project ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const impacts = await Project.getProjectImpacts(id);

    res.json({
      success: true,
      data: impacts
    });
  } catch (error) {
    console.error('Error in getProjectImpacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project impacts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new project - COMPLETE FIXED VERSION
const createProject = async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    console.log('Files:', req.files);

    const {
      title, pillarId, categoryId, countryId, description, short_description,
      location, start_date, end_date, status, sdg_goals,
      testimonials, project_impacts, order_index, is_featured, is_hidden
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      console.log('Validation failed: missing title or description');
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
        received: { title: !!title, description: !!description }
      });
    }

    // Validate pillar is provided (based on your frontend validation)
    if (!pillarId) {
      console.log('Validation failed: missing pillarId');
      return res.status(400).json({
        success: false,
        message: 'Pillar is required'
      });
    }

    // Validate testimonials format if provided
    let parsedTestimonials = [];
    if (testimonials) {
      try {
        parsedTestimonials = typeof testimonials === 'string' ? JSON.parse(testimonials) : testimonials;
        
        if (!Array.isArray(parsedTestimonials)) {
          throw new Error('Testimonials must be an array');
        }
        
        // Filter out empty testimonials and ensure proper structure
        parsedTestimonials = parsedTestimonials
          .filter(testimonial => 
            testimonial && 
            (testimonial.text || testimonial.author || testimonial.position)
          )
          .map(testimonial => ({
            text: testimonial.text || '',
            author: testimonial.author || '',
            position: testimonial.position || ''
          }));
      } catch (e) {
        console.warn('Invalid testimonials format:', e);
        return res.status(400).json({
          success: false,
          message: `Invalid testimonials format: ${e.message}`
        });
      }
    }

    // Validate project impacts format if provided
    let parsedProjectImpacts = [];
    if (project_impacts) {
      try {
        parsedProjectImpacts = typeof project_impacts === 'string' ? JSON.parse(project_impacts) : project_impacts;
        
        if (!Array.isArray(parsedProjectImpacts)) {
          throw new Error('Project impacts must be an array');
        }
        
        for (let i = 0; i < parsedProjectImpacts.length; i++) {
          const impact = parsedProjectImpacts[i];
          if (typeof impact !== 'object' || impact === null) {
            throw new Error(`Impact at index ${i} must be an object`);
          }
          
          if (!impact.impact_id || !impact.contribution_value) {
            throw new Error(`Impact at index ${i} must have impact_id and contribution_value`);
          }
          
          if (isNaN(parseInt(impact.impact_id)) || isNaN(parseInt(impact.contribution_value))) {
            throw new Error(`Impact at index ${i} must have numeric impact_id and contribution_value`);
          }
        }

        // Check for duplicates
        const impactIds = parsedProjectImpacts.map(impact => parseInt(impact.impact_id));
        const duplicates = impactIds.filter((id, index) => impactIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
          throw new Error('Duplicate impacts detected. Each impact can only be added once per project.');
        }

      } catch (e) {
        console.warn('Invalid project impacts format:', e);
        return res.status(400).json({
          success: false,
          message: `Invalid project impacts format: ${e.message}`
        });
      }
    }

    // Generate unique slug
    let slug = Project.generateSlug(title);
    let slugCounter = 1;
    while (await Project.slugExists(slug)) {
      slug = `${Project.generateSlug(title)}-${slugCounter}`;
      slugCounter++;
    }

    // Handle file uploads
    let featured_image = null;
    let gallery = [];

    if (req.files) {
      if (req.files.featured_image && req.files.featured_image[0]) {
        featured_image = `/uploads/projects/${req.files.featured_image[0].filename}`;
        console.log('Featured image uploaded:', featured_image);
      }

      if (req.files.gallery && req.files.gallery.length > 0) {
        gallery = req.files.gallery.map(file => `/uploads/projects/${file.filename}`);
        console.log('Gallery images uploaded:', gallery);
      }
    }

    // Parse JSON fields safely
    let parsedSdgGoals = [];
    if (sdg_goals) {
      try {
        parsedSdgGoals = typeof sdg_goals === 'string' ? JSON.parse(sdg_goals) : sdg_goals;
        if (!Array.isArray(parsedSdgGoals)) {
          parsedSdgGoals = [];
        }
      } catch (e) {
        console.warn('Invalid SDG goals format:', e);
        parsedSdgGoals = [];
      }
    }

    const projectData = {
      title: title.trim(),
      pillarId: pillarId && pillarId !== '' ? parseInt(pillarId) : null, // ADD THIS LINE
      categoryId: categoryId && categoryId !== '' ? parseInt(categoryId) : null,
      countryId: countryId && countryId !== '' ? parseInt(countryId) : null,
      slug,
      description: description.trim(),
      short_description: short_description ? short_description.trim() : null,
      featured_image,
      gallery,
      location: location ? location.trim() : null,
      start_date: start_date || null,
      end_date: end_date || null,
      status: status || 'planning',
      sdg_goals: parsedSdgGoals,
      testimonials: parsedTestimonials,
      project_impacts: parsedProjectImpacts,
      order_index: order_index ? parseInt(order_index) : 0,
      is_featured: is_featured === 'true' || is_featured === true,
      is_hidden: is_hidden === 'true' || is_hidden === true
    };

    console.log('Final project data:', projectData);

    const project = await Project.createProjectWithValidation(projectData);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Error in createProject:', error);
    console.error('Stack trace:', error.stack);
    
    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.featured_image) {
        req.files.featured_image.forEach(file => deleteFile(file.path));
      }
      if (req.files.gallery) {
        req.files.gallery.forEach(file => deleteFile(file.path));
      }
    }

    const isValidationError = error.message.includes('Validation failed');
    const statusCode = isValidationError ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: isValidationError ? error.message : 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update project - COMPLETE FIXED VERSION
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating project with ID:', id);
    console.log('Update data:', req.body);
    console.log('Files:', req.files);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const {
      title, pillarId, categoryId, countryId, description, short_description,
      location, start_date, end_date, status, sdg_goals,
      testimonials, project_impacts, order_index, is_featured, is_hidden
    } = req.body;

    // Check if project exists
    const existingProject = await Project.getProjectById(id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Validate and parse testimonials if provided
    let parsedTestimonials = existingProject.testimonials || [];
    if (testimonials !== undefined) {
      try {
        parsedTestimonials = typeof testimonials === 'string' ? JSON.parse(testimonials) : testimonials;
        
        if (!Array.isArray(parsedTestimonials)) {
          throw new Error('Testimonials must be an array');
        }
        
        // Filter out empty testimonials and ensure proper structure
        parsedTestimonials = parsedTestimonials
          .filter(testimonial => 
            testimonial && 
            (testimonial.text || testimonial.author || testimonial.position)
          )
          .map(testimonial => ({
            text: testimonial.text || '',
            author: testimonial.author || '',
            position: testimonial.position || ''
          }));
      } catch (e) {
        console.warn('Invalid testimonials format:', e);
        return res.status(400).json({
          success: false,
          message: `Invalid testimonials format: ${e.message}`
        });
      }
    }

    // Validate and parse project impacts if provided
    let parsedProjectImpacts = existingProject.project_impacts || [];
    if (project_impacts !== undefined) {
      try {
        parsedProjectImpacts = typeof project_impacts === 'string' ? JSON.parse(project_impacts) : project_impacts;
        
        if (!Array.isArray(parsedProjectImpacts)) {
          throw new Error('Project impacts must be an array');
        }
        
        for (let i = 0; i < parsedProjectImpacts.length; i++) {
          const impact = parsedProjectImpacts[i];
          if (typeof impact !== 'object' || impact === null) {
            throw new Error(`Impact at index ${i} must be an object`);
          }
          
          if (!impact.impact_id || !impact.contribution_value) {
            throw new Error(`Impact at index ${i} must have impact_id and contribution_value`);
          }
          
          if (isNaN(parseInt(impact.impact_id)) || isNaN(parseInt(impact.contribution_value))) {
            throw new Error(`Impact at index ${i} must have numeric impact_id and contribution_value`);
          }
        }

        // Check for duplicates
        const impactIds = parsedProjectImpacts.map(impact => parseInt(impact.impact_id));
        const duplicates = impactIds.filter((id, index) => impactIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
          throw new Error('Duplicate impacts detected. Each impact can only be added once per project.');
        }

      } catch (e) {
        console.warn('Invalid project impacts format:', e);
        return res.status(400).json({
          success: false,
          message: `Invalid project impacts format: ${e.message}`
        });
      }
    }

    // Handle slug update
    let slug = existingProject.slug;
    if (title !== existingProject.title) {
      slug = Project.generateSlug(title);
      let slugCounter = 1;
      while (await Project.slugExists(slug, id)) {
        slug = `${Project.generateSlug(title)}-${slugCounter}`;
        slugCounter++;
      }
    }

    // FIXED: Handle file uploads - Preserve existing images unless new ones are uploaded
    let featured_image = existingProject.featured_image;
    let gallery = existingProject.gallery || [];

    if (req.files) {
      // Only update featured_image if a new one is uploaded
      if (req.files.featured_image && req.files.featured_image[0]) {
        // Delete old featured image only when replacing with new one
        if (existingProject.featured_image) {
          deleteFile(existingProject.featured_image);
        }
        featured_image = `/uploads/projects/${req.files.featured_image[0].filename}`;
        console.log('New featured image uploaded:', featured_image);
      }

      // Only update gallery if new images are uploaded
      if (req.files.gallery && req.files.gallery.length > 0) {
        // Delete old gallery images only when replacing with new ones
        if (existingProject.gallery && existingProject.gallery.length > 0) {
          existingProject.gallery.forEach(imagePath => deleteFile(imagePath));
        }
        gallery = req.files.gallery.map(file => `/uploads/projects/${file.filename}`);
        console.log('New gallery images uploaded:', gallery);
      }
      // If no new gallery images uploaded, keep existing gallery (don't reset to empty array)
    }

    // Parse SDG goals safely
    let parsedSdgGoals = existingProject.sdg_goals || [];
    if (sdg_goals !== undefined) {
      try {
        parsedSdgGoals = typeof sdg_goals === 'string' ? JSON.parse(sdg_goals) : sdg_goals;
        if (!Array.isArray(parsedSdgGoals)) {
          parsedSdgGoals = [];
        }
      } catch (e) {
        console.warn('Invalid SDG goals format:', e);
      }
    }

    const projectData = {
      title: title.trim(),
      pillarId: pillarId !== undefined ? (pillarId && pillarId !== '' ? parseInt(pillarId) : null) : existingProject.pillarId, // ADD THIS LINE
      categoryId: categoryId && categoryId !== '' ? parseInt(categoryId) : null,
      countryId: countryId && countryId !== '' ? parseInt(countryId) : null,
      slug,
      description: description.trim(),
      short_description: short_description !== undefined ? (short_description ? short_description.trim() : null) : existingProject.short_description,
      featured_image, // This preserves existing image if no new one uploaded
      gallery, // This preserves existing gallery if no new images uploaded
      location: location !== undefined ? (location ? location.trim() : null) : existingProject.location,
      start_date: start_date !== undefined ? start_date : existingProject.start_date,
      end_date: end_date !== undefined ? end_date : existingProject.end_date,
      status: status || existingProject.status,
      sdg_goals: parsedSdgGoals,
      testimonials: parsedTestimonials,
      project_impacts: parsedProjectImpacts,
      order_index: order_index !== undefined ? parseInt(order_index) : existingProject.order_index,
      is_featured: is_featured !== undefined ? (is_featured === 'true' || is_featured === true) : existingProject.is_featured,
      is_hidden: is_hidden !== undefined ? (is_hidden === 'true' || is_hidden === true) : existingProject.is_hidden
    };

    console.log('Final update data:', projectData);

    const project = await Project.updateProjectWithValidation(id, projectData);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Error in updateProject:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.featured_image) {
        req.files.featured_image.forEach(file => deleteFile(file.path));
      }
      if (req.files.gallery) {
        req.files.gallery.forEach(file => deleteFile(file.path));
      }
    }

    const isValidationError = error.message.includes('Validation failed');
    const statusCode = isValidationError ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: isValidationError ? error.message : 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting project with ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    // Get project to delete associated files
    const project = await Project.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete associated files
    if (project.featured_image) {
      deleteFile(project.featured_image);
    }
    if (project.gallery && project.gallery.length > 0) {
      project.gallery.forEach(imagePath => deleteFile(imagePath));
    }

    // Delete project from database
    const deleted = await Project.deleteProject(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Toggling featured status for project ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const project = await Project.toggleFeatured(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: `Project ${project.is_featured ? 'featured' : 'unfeatured'} successfully`,
      data: project
    });
  } catch (error) {
    console.error('Error in toggleFeatured:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Toggle hidden status
const toggleHidden = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Toggling hidden status for project ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const project = await Project.toggleHidden(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: `Project ${project.is_hidden ? 'hidden' : 'made visible'} successfully`,
      data: project
    });
  } catch (error) {
    console.error('Error in toggleHidden:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle visibility status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Gallery management functions
const addGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Adding gallery image to project ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    if (!req.files || !req.files.gallery || req.files.gallery.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imagePath = `/uploads/projects/${req.files.gallery[0].filename}`;
    const project = await Project.addGalleryImage(id, imagePath);

    res.json({
      success: true,
      message: 'Gallery image added successfully',
      data: project
    });
  } catch (error) {
    console.error('Error in addGalleryImage:', error);
    
    // Clean up uploaded file on error
    if (req.files && req.files.gallery) {
      req.files.gallery.forEach(file => deleteFile(file.path));
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add gallery image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const removeGalleryImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    console.log('Removing gallery image from project ID:', id, 'imageIndex:', imageIndex);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    if (imageIndex === undefined || isNaN(imageIndex)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }

    const result = await Project.removeGalleryImage(id, parseInt(imageIndex));
    
    // Delete the physical file
    if (result.removedImage) {
      deleteFile(result.removedImage);
    }

    res.json({
      success: true,
      message: 'Gallery image removed successfully',
      data: result.project
    });
  } catch (error) {
    console.error('Error in removeGalleryImage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove gallery image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const clearGallery = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Clearing gallery for project ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const result = await Project.clearGallery(id);
    
    // Delete all physical files
    if (result.removedImages && result.removedImages.length > 0) {
      result.removedImages.forEach(imagePath => deleteFile(imagePath));
    }

    res.json({
      success: true,
      message: 'Gallery cleared successfully',
      data: result.project
    });
  } catch (error) {
    console.error('Error in clearGallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear gallery',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get featured projects
const getFeaturedProjects = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    console.log('Getting featured projects with limit:', limit);

    const projects = await Project.getFeaturedProjects(limit);

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error in getFeaturedProjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get project statistics
const getProjectStats = async (req, res) => {
  try {
    console.log('Getting project statistics');
    const stats = await Project.getProjectStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getProjectStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  getProjectBySlug,
  getProjectImpacts,
  createProject,
  updateProject,
  deleteProject,
  toggleFeatured,
  toggleHidden,
  getFeaturedProjects,
  getProjectStats,
  addGalleryImage,
  removeGalleryImage,
  clearGallery
};
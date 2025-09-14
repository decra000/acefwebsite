// controllers/videoSectionController.js
const VideoSectionModel = require('../models/videoSectionModel');

class VideoSectionController {
  // GET /api/video-sections - Get all active video sections (PUBLIC)
  static async getAll(req, res) {
    try {
      const { country_id } = req.query;
      
      let videoSections;
      if (country_id) {
        videoSections = await VideoSectionModel.getByCountry(country_id);
      } else {
        videoSections = await VideoSectionModel.getAll();
      }
      
      res.json({
        success: true,
        data: videoSections,
        count: videoSections.length
      });
    } catch (error) {
      console.error('Error fetching video sections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video sections',
        error: error.message
      });
    }
  }

  // GET /api/video-sections/admin - Get all video sections including inactive (ADMIN)
  static async getAllForAdmin(req, res) {
    try {
      const videoSections = await VideoSectionModel.getAllForAdmin();
      res.json({
        success: true,
        data: videoSections,
        count: videoSections.length
      });
    } catch (error) {
      console.error('Error fetching video sections for admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video sections',
        error: error.message
      });
    }
  }

  // GET /api/video-sections/:id - Get specific video section
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const videoSection = await VideoSectionModel.getById(id);

      if (!videoSection) {
        return res.status(404).json({
          success: false,
          message: 'Video section not found'
        });
      }

      res.json({
        success: true,
        data: videoSection
      });
    } catch (error) {
      console.error('Error fetching video section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video section',
        error: error.message
      });
    }
  }

  // GET /api/video-sections/admin/:id - Get video section by ID for admin (includes inactive)
  static async getByIdForAdmin(req, res) {
    try {
      const { id } = req.params;
      const videoSection = await VideoSectionModel.getByIdForAdmin(id);

      if (!videoSection) {
        return res.status(404).json({
          success: false,
          message: 'Video section not found'
        });
      }

      res.json({
        success: true,
        data: videoSection
      });
    } catch (error) {
      console.error('Error fetching video section for admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video section',
        error: error.message
      });
    }
  }

  // GET /api/video-sections/featured - Get the featured video section
  static async getFeatured(req, res) {
    try {
      const { country_id } = req.query;
      
      let videoSection;
      if (country_id) {
        videoSection = await VideoSectionModel.getFeaturedByCountry(country_id);
      } else {
        videoSection = await VideoSectionModel.getFeatured();
      }

      if (!videoSection) {
        return res.status(404).json({
          success: false,
          message: 'No featured video section found'
        });
      }

      res.json({
        success: true,
        data: videoSection
      });
    } catch (error) {
      console.error('Error fetching featured video section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured video section',
        error: error.message
      });
    }
  }

  // GET /api/video-sections/latest - Get the most recent video section
  static async getLatest(req, res) {
    try {
      const { country_id } = req.query;
      
      let videoSection;
      if (country_id) {
        videoSection = await VideoSectionModel.getLatestByCountry(country_id);
      } else {
        videoSection = await VideoSectionModel.getLatest();
      }

      if (!videoSection) {
        return res.status(404).json({
          success: false,
          message: 'No video sections found'
        });
      }

      res.json({
        success: true,
        data: videoSection
      });
    } catch (error) {
      console.error('Error fetching latest video section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch latest video section',
        error: error.message
      });
    }
  }

  // POST /api/video-sections - Create new video section
  static async create(req, res) {
    try {
      const { tag, country_id, title, description, youtube_url, is_active = true, is_featured = false } = req.body;

      // Validation
      if (!tag || !title || !description || !youtube_url) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: tag, title, description, youtube_url'
        });
      }

      // Validate YouTube URL format
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(youtube_url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL format'
        });
      }

      // Validate country if provided
      if (country_id) {
        const isValidCountry = await VideoSectionModel.validateCountry(country_id);
        if (!isValidCountry) {
          return res.status(400).json({
            success: false,
            message: 'Invalid country specified'
          });
        }
      }

      const videoSection = await VideoSectionModel.create({
        tag,
        country_id,
        title,
        description,
        youtube_url,
        is_active,
        is_featured
      });

      res.status(201).json({
        success: true,
        data: videoSection,
        message: 'Video section created successfully'
      });
    } catch (error) {
      console.error('Error creating video section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create video section',
        error: error.message
      });
    }
  }

  // PUT /api/video-sections/:id - Update video section
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { tag, country_id, title, description, youtube_url, is_active, is_featured } = req.body;

      // Check if video section exists (using admin method to allow editing inactive records)
      const existingSection = await VideoSectionModel.getByIdForAdmin(id);
      if (!existingSection) {
        return res.status(404).json({
          success: false,
          message: 'Video section not found'
        });
      }

      // Validate YouTube URL if provided
      if (youtube_url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (!youtubeRegex.test(youtube_url)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid YouTube URL format'
          });
        }
      }

      // Validate country if provided and different from existing
      const finalCountryId = country_id !== undefined ? country_id : existingSection.country_id;
      if (finalCountryId) {
        const isValidCountry = await VideoSectionModel.validateCountry(finalCountryId);
        if (!isValidCountry) {
          return res.status(400).json({
            success: false,
            message: 'Invalid country specified'
          });
        }
      }

      const updatedSection = await VideoSectionModel.update(id, {
        tag: tag || existingSection.tag,
        country_id: country_id !== undefined ? country_id : existingSection.country_id,
        title: title || existingSection.title,
        description: description || existingSection.description,
        youtube_url: youtube_url || existingSection.youtube_url,
        is_active: is_active !== undefined ? is_active : existingSection.is_active,
        is_featured: is_featured !== undefined ? is_featured : existingSection.is_featured
      });

      res.json({
        success: true,
        data: updatedSection,
        message: 'Video section updated successfully'
      });
    } catch (error) {
      console.error('Error updating video section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update video section',
        error: error.message
      });
    }
  }

  // PUT /api/video-sections/:id/feature - Set video as featured
  static async setFeatured(req, res) {
    try {
      const { id } = req.params;

      // Check if video section exists
      const existingSection = await VideoSectionModel.getByIdForAdmin(id);
      if (!existingSection) {
        return res.status(404).json({
          success: false,
          message: 'Video section not found'
        });
      }

      const updatedSection = await VideoSectionModel.setFeatured(id);

      res.json({
        success: true,
        data: updatedSection,
        message: 'Video section set as featured successfully'
      });
    } catch (error) {
      console.error('Error setting featured video section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set featured video section',
        error: error.message
      });
    }
  }

  // PUT /api/video-sections/:id/unfeature - Remove featured status
  static async removeFeatured(req, res) {
    try {
      const { id } = req.params;

      // Check if video section exists
      const existingSection = await VideoSectionModel.getByIdForAdmin(id);
      if (!existingSection) {
        return res.status(404).json({
          success: false,
          message: 'Video section not found'
        });
      }

      const updatedSection = await VideoSectionModel.removeFeatured(id);

      res.json({
        success: true,
        data: updatedSection,
        message: 'Featured status removed successfully'
      });
    } catch (error) {
      console.error('Error removing featured status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove featured status',
        error: error.message
      });
    }
  }

  // DELETE /api/video-sections/:id - Soft delete video section
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Check if video section exists (using admin method)
      const existingSection = await VideoSectionModel.getByIdForAdmin(id);
      if (!existingSection) {
        return res.status(404).json({
          success: false,
          message: 'Video section not found'
        });
      }

      await VideoSectionModel.delete(id);

      res.json({
        success: true,
        message: 'Video section deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting video section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete video section',
        error: error.message
      });
    }
  }

  // GET /api/video-sections/tags/options - Get all tag options
  static async getTagOptions(req, res) {
    try {
      console.log('[CONTROLLER] Getting tag options...');
      const tagOptions = await VideoSectionModel.getTagOptions();
      console.log('[CONTROLLER] Tag options result:', tagOptions);
      
      res.json({
        success: true,
        data: tagOptions
      });
    } catch (error) {
      console.error('[CONTROLLER] Error fetching tag options:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tag options',
        error: error.message
      });
    }
  }

  // POST /api/video-sections/tags/options - Add new tag option
  static async addTagOption(req, res) {
    try {
      console.log('[CONTROLLER] Adding tag option with body:', req.body);
      const { tag_name } = req.body;

      if (!tag_name || !tag_name.trim()) {
        console.log('[CONTROLLER] Tag name validation failed');
        return res.status(400).json({
          success: false,
          message: 'Tag name is required and cannot be empty'
        });
      }

      // Check if tag already exists
      const exists = await VideoSectionModel.tagOptionExists(tag_name.trim());
      if (exists) {
        console.log('[CONTROLLER] Tag already exists:', tag_name.trim());
        return res.status(400).json({
          success: false,
          message: 'Tag option already exists'
        });
      }

      console.log('[CONTROLLER] Creating new tag option:', tag_name.trim());
      const tagOption = await VideoSectionModel.addTagOption(tag_name.trim());
      console.log('[CONTROLLER] Tag option created:', tagOption);

      res.status(201).json({
        success: true,
        data: tagOption,
        message: 'Tag option added successfully'
      });
    } catch (error) {
      console.error('[CONTROLLER] Error adding tag option:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add tag option',
        error: error.message
      });
    }
  }

  // DELETE /api/video-sections/tags/options/:id - Delete tag option
  static async deleteTagOption(req, res) {
    try {
      const { id } = req.params;

      const result = await VideoSectionModel.deleteTagOption(id);

      res.json({
        success: true,
        message: 'Tag option deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error deleting tag option:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete tag option',
        error: error.message
      });
    }
  }
}

module.exports = VideoSectionController;
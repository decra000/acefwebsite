const Pillar = require('../models/Pillar');
const Category = require('../models/Category');
const { getFileUrl, deleteFile } = require('../middleware/upload');

const pillarController = {
  // Get all pillars with their focus areas
  getAllPillars: async (req, res) => {
    try {
      console.log('📋 CONTROLLER - Fetching all pillars...');
      const pillars = await Pillar.getAll();
      console.log(`✅ CONTROLLER - Found ${pillars.length} pillars`);
      
      // Process image URLs for response
      const processedPillars = pillars.map(pillar => ({
        ...pillar,
        image: pillar.image ? getFileUrl(req, pillar.image, 'pillars') : null
      }));
      
      res.json({
        success: true,
        data: processedPillars,
        count: processedPillars.length,
        message: `Found ${processedPillars.length} pillars`
      });
    } catch (error) {
      console.error('❌ CONTROLLER ERROR - getAllPillars:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pillars',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get single pillar by ID with enhanced validation
  getPillarById: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const pillarId = parseInt(id);
      if (isNaN(pillarId) || pillarId <= 0) {
        console.log(`❌ CONTROLLER - Invalid pillar ID: ${id}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid pillar ID. Must be a positive integer.'
        });
      }
      
      console.log(`🔍 CONTROLLER - Fetching pillar with ID: ${pillarId}`);
      
      const pillar = await Pillar.getById(pillarId);
      
      if (!pillar) {
        console.log(`❌ CONTROLLER - Pillar ${pillarId} not found`);
        return res.status(404).json({
          success: false,
          message: 'Pillar not found'
        });
      }
      
      // Process image URL for response
      const processedPillar = {
        ...pillar,
        image: pillar.image ? getFileUrl(req, pillar.image, 'pillars') : null
      };
      
      console.log(`✅ CONTROLLER - Found pillar: ${pillar.name}`);
      res.json({
        success: true,
        data: processedPillar,
        message: 'Pillar retrieved successfully'
      });
    } catch (error) {
      console.error('❌ CONTROLLER ERROR - getPillarById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pillar',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Create new pillar with comprehensive validation
  createPillar: async (req, res) => {
    try {
      const { name, description, focusAreaIds } = req.body;
      
      console.log('🆕 CONTROLLER - Creating new pillar:', { 
        name, 
        description: description ? `${description.substring(0, 50)}...` : 'undefined',
        focusAreaIds,
        hasFile: !!req.file
      });
      
      if (req.file) {
        console.log('📸 CONTROLLER - Image file details:', {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path
        });
      }
      
      // Enhanced validation with detailed error messages
      const validationErrors = [];
      
      if (!name || typeof name !== 'string' || !name.trim()) {
        validationErrors.push('Pillar name is required and must be a non-empty string');
      }
      
      if (!description || typeof description !== 'string' || !description.trim()) {
        validationErrors.push('Pillar description is required and must be a non-empty string');
      }
      
      if (name && name.trim().length > 255) {
        validationErrors.push('Pillar name must be less than 255 characters');
      }
      
      if (description && description.trim().length > 2000) {
        validationErrors.push('Pillar description must be less than 2000 characters');
      }
      
      if (validationErrors.length > 0) {
        console.log('❌ CONTROLLER - Validation errors:', validationErrors);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      // Parse and validate focus area IDs
      let cleanedFocusAreaIds = [];
      if (focusAreaIds) {
        try {
          const parsedIds = typeof focusAreaIds === 'string' 
            ? JSON.parse(focusAreaIds) 
            : focusAreaIds;
            
          if (Array.isArray(parsedIds)) {
            cleanedFocusAreaIds = parsedIds
              .filter(id => id !== null && id !== undefined && id !== '')
              .map(id => {
                const numId = parseInt(id);
                if (isNaN(numId) || numId <= 0) {
                  throw new Error(`Invalid focus area ID: ${id} (must be positive integer)`);
                }
                return numId;
              });
          } else if (parsedIds !== null && parsedIds !== undefined && parsedIds !== '') {
            // Handle single ID case
            const numId = parseInt(parsedIds);
            if (!isNaN(numId) && numId > 0) {
              cleanedFocusAreaIds = [numId];
            }
          }
        } catch (parseError) {
          console.log('❌ CONTROLLER - Error parsing focus area IDs:', parseError);
          return res.status(400).json({
            success: false,
            message: `Error processing focus area IDs: ${parseError.message}`
          });
        }
      }
      
      console.log('🔍 CONTROLLER - Cleaned focus area IDs:', cleanedFocusAreaIds);
      
      // Check if pillar already exists
      const existingPillar = await Pillar.findByName(name.trim());
      if (existingPillar) {
        console.log(`❌ CONTROLLER - Pillar already exists: ${existingPillar.name}`);
        return res.status(409).json({
          success: false,
          message: 'A pillar with this name already exists'
        });
      }
      
      // Validate focus area IDs if provided
      if (cleanedFocusAreaIds.length > 0) {
        const allCategories = await Category.getAll();
        const validCategoryIds = allCategories.map(cat => cat.id);
        const invalidIds = cleanedFocusAreaIds.filter(id => !validCategoryIds.includes(id));
        
        if (invalidIds.length > 0) {
          console.log(`❌ CONTROLLER - Invalid focus area IDs: ${invalidIds}`);
          return res.status(400).json({
            success: false,
            message: `Invalid focus area IDs: ${invalidIds.join(', ')}`,
            validIds: validCategoryIds
          });
        }
      }
      
      // Prepare image path for storage
      const imagePath = req.file ? req.file.filename : null;
      
      // Create pillar
      const pillarId = await Pillar.create(
        name.trim(), 
        description.trim(), 
        cleanedFocusAreaIds, 
        imagePath
      );
      
      // Fetch the created pillar with focus areas
      const newPillar = await Pillar.getById(pillarId);
      
      // Process image URL for response
      const processedPillar = {
        ...newPillar,
        image: newPillar.image ? getFileUrl(req, newPillar.image, 'pillars') : null
      };
      
      console.log(`✅ CONTROLLER - Pillar created successfully with ID: ${pillarId}`);
      res.status(201).json({
        success: true,
        message: 'Pillar created successfully',
        data: processedPillar
      });
    } catch (error) {
      console.error('❌ CONTROLLER ERROR - createPillar:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        deleteFile(req.file.path).catch(cleanupError => 
          console.error('Failed to cleanup uploaded file:', cleanupError)
        );
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create pillar',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Update pillar with comprehensive error handling
  updatePillar: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, focusAreaIds } = req.body;
      
      // Validate ID parameter
      const pillarId = parseInt(id);
      if (isNaN(pillarId) || pillarId <= 0) {
        console.log(`❌ CONTROLLER - Invalid pillar ID for update: ${id}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid pillar ID. Must be a positive integer.'
        });
      }
      
      console.log(`✏️ CONTROLLER - Starting update for pillar ${pillarId}`);
      console.log('🔍 CONTROLLER - Request data:', { 
        name, 
        description: description ? `${description.substring(0, 50)}...` : 'undefined',
        focusAreaIds,
        hasFile: !!req.file
      });
      
      // Check if pillar exists first and get current data
      const existingPillar = await Pillar.getById(pillarId);
      if (!existingPillar) {
        console.log(`❌ CONTROLLER - Pillar ${pillarId} not found for update`);
        return res.status(404).json({
          success: false,
          message: 'Pillar not found'
        });
      }
      
      // Enhanced validation
      const validationErrors = [];
      
      if (!name || typeof name !== 'string' || !name.trim()) {
        validationErrors.push('Pillar name is required and must be a non-empty string');
      }
      
      if (!description || typeof description !== 'string' || !description.trim()) {
        validationErrors.push('Pillar description is required and must be a non-empty string');
      }
      
      if (name && name.trim().length > 255) {
        validationErrors.push('Pillar name must be less than 255 characters');
      }
      
      if (description && description.trim().length > 2000) {
        validationErrors.push('Pillar description must be less than 2000 characters');
      }
      
      if (validationErrors.length > 0) {
        console.log('❌ CONTROLLER - Update validation errors:', validationErrors);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      // Parse and validate focus area IDs
      let cleanedFocusAreaIds = [];
      if (focusAreaIds) {
        try {
          const parsedIds = typeof focusAreaIds === 'string' 
            ? JSON.parse(focusAreaIds) 
            : focusAreaIds;
            
          if (Array.isArray(parsedIds)) {
            cleanedFocusAreaIds = parsedIds
              .filter(id => id !== null && id !== undefined && id !== '')
              .map(id => {
                const numId = parseInt(id);
                if (isNaN(numId) || numId <= 0) {
                  throw new Error(`Invalid focus area ID: ${id} (must be positive integer)`);
                }
                return numId;
              });
          }
        } catch (parseError) {
          console.log('❌ CONTROLLER - Error parsing focus area IDs for update:', parseError);
          return res.status(400).json({
            success: false,
            message: `Error processing focus area IDs: ${parseError.message}`
          });
        }
      }
      
      // Check for name conflicts with other pillars
      const nameConflict = await Pillar.findByName(name.trim());
      if (nameConflict && nameConflict.id !== pillarId) {
        console.log(`❌ CONTROLLER - Name conflict: ${nameConflict.name} (ID: ${nameConflict.id})`);
        return res.status(409).json({
          success: false,
          message: 'Another pillar with this name already exists'
        });
      }
      
      // Validate focus area IDs if provided
      if (cleanedFocusAreaIds.length > 0) {
        const allCategories = await Category.getAll();
        const validCategoryIds = allCategories.map(cat => cat.id);
        const invalidIds = cleanedFocusAreaIds.filter(fId => !validCategoryIds.includes(fId));
        
        if (invalidIds.length > 0) {
          console.log(`❌ CONTROLLER - Invalid focus area IDs for update: ${invalidIds}`);
          return res.status(400).json({
            success: false,
            message: `Invalid focus area IDs: ${invalidIds.join(', ')}`,
            validIds: validCategoryIds
          });
        }
      }
      
      // Handle image update logic
      let imagePath = null;
      let oldImagePath = null;
      
      if (req.file) {
        imagePath = req.file.filename;
        oldImagePath = existingPillar.image;
        console.log('🔄 CONTROLLER - New image will be used:', imagePath);
      }
      
      // Update pillar
      let affectedRows;
      try {
        affectedRows = await Pillar.update(
          pillarId, 
          name.trim(), 
          description.trim(), 
          cleanedFocusAreaIds,
          imagePath
        );
      } catch (updateError) {
        console.error('❌ CONTROLLER - Pillar update failed:', updateError);
        
        // Clean up uploaded file if update failed
        if (req.file) {
          deleteFile(req.file.path).catch(cleanupError => 
            console.error('Failed to cleanup uploaded file:', cleanupError)
          );
        }
        
        return res.status(500).json({
          success: false,
          message: 'Database update failed',
          error: process.env.NODE_ENV === 'development' ? updateError.message : 'Internal server error'
        });
      }
      
      if (affectedRows === 0) {
        console.log('❌ CONTROLLER - No rows affected during update');
        
        // Clean up uploaded file if no update occurred
        if (req.file) {
          deleteFile(req.file.path).catch(cleanupError => 
            console.error('Failed to cleanup uploaded file:', cleanupError)
          );
        }
        
        return res.status(404).json({
          success: false,
          message: 'Pillar not found or no changes made'
        });
      }
      
      // Clean up old image if update was successful and we have a new image
      if (req.file && oldImagePath) {
        console.log('🧹 CONTROLLER - Cleaning up old image:', oldImagePath);
        deleteFile(oldImagePath).catch(cleanupError => 
          console.error('Failed to cleanup old image:', cleanupError)
        );
      }
      
      // Fetch updated pillar
      const updatedPillar = await Pillar.getById(pillarId);
      const processedPillar = {
        ...updatedPillar,
        image: updatedPillar.image ? getFileUrl(req, updatedPillar.image, 'pillars') : null
      };
      
      console.log(`✅ CONTROLLER - Pillar ${pillarId} updated successfully`);
      res.json({
        success: true,
        message: 'Pillar updated successfully',
        data: processedPillar
      });
    } catch (error) {
      console.error('❌ CONTROLLER ERROR - updatePillar:', error);
      
      // Clean up uploaded file on any error
      if (req.file) {
        deleteFile(req.file.path).catch(cleanupError => 
          console.error('Failed to cleanup uploaded file:', cleanupError)
        );
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update pillar',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Delete pillar with image cleanup
  deletePillar: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      const pillarId = parseInt(id);
      if (isNaN(pillarId) || pillarId <= 0) {
        console.log(`❌ CONTROLLER - Invalid pillar ID for deletion: ${id}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid pillar ID. Must be a positive integer.'
        });
      }
      
      console.log(`🗑️ CONTROLLER - Deleting pillar with ID: ${pillarId}`);
      
      // Check if pillar exists and get its data (including image path)
      const existingPillar = await Pillar.getById(pillarId);
      if (!existingPillar) {
        console.log(`❌ CONTROLLER - Pillar ${pillarId} not found for deletion`);
        return res.status(404).json({
          success: false,
          message: 'Pillar not found'
        });
      }
      
      // Delete from database first
      const affectedRows = await Pillar.delete(pillarId);
      
      if (affectedRows === 0) {
        console.log(`❌ CONTROLLER - No rows affected during deletion of pillar ${pillarId}`);
        return res.status(404).json({
          success: false,
          message: 'Pillar not found'
        });
      }
      
      // Clean up image file if it exists
      if (existingPillar.image) {
        console.log('🧹 CONTROLLER - Cleaning up pillar image:', existingPillar.image);
        deleteFile(existingPillar.image).catch(cleanupError => 
          console.error('Failed to cleanup pillar image:', cleanupError)
        );
      }
      
      console.log(`✅ CONTROLLER - Pillar ${pillarId} deleted successfully`);
      res.json({
        success: true,
        message: 'Pillar deleted successfully'
      });
    } catch (error) {
      console.error('❌ CONTROLLER ERROR - deletePillar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete pillar',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get all available focus areas for selection
  getAvailableFocusAreas: async (req, res) => {
    try {
      console.log('📋 CONTROLLER - Fetching available focus areas...');
      const focusAreas = await Category.getAll();
      
      console.log(`✅ CONTROLLER - Found ${focusAreas.length} focus areas`);
      
      res.json({
        success: true,
        data: focusAreas,
        count: focusAreas.length,
        message: `Found ${focusAreas.length} focus areas`
      });
    } catch (error) {
      console.error('❌ CONTROLLER ERROR - getAvailableFocusAreas:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch focus areas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
};

module.exports = pillarController;
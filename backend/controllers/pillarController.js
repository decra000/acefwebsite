const Pillar = require('../models/Pillar');
const Category = require('../models/Category');

const pillarController = {
  // Get all pillars with their focus areas
  getAllPillars: async (req, res) => {
    try {
      console.log('📋 Fetching all pillars...');
      const pillars = await Pillar.getAll();
      console.log(`✅ Found ${pillars.length} pillars`);
      
      res.json({
        success: true,
        data: pillars,
        count: pillars.length
      });
    } catch (error) {
      console.error('❌ Error fetching pillars:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pillars',
        error: error.message
      });
    }
  },

  // Get single pillar by ID
  getPillarById: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🔍 Fetching pillar with ID: ${id}`);
      
      const pillar = await Pillar.getById(id);
      
      if (!pillar) {
        return res.status(404).json({
          success: false,
          message: 'Pillar not found'
        });
      }
      
      console.log(`✅ Found pillar: ${pillar.name}`);
      res.json({
        success: true,
        data: pillar
      });
    } catch (error) {
      console.error('❌ Error fetching pillar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pillar',
        error: error.message
      });
    }
  },

  // Create new pillar
  createPillar: async (req, res) => {
    try {
      const { name, description, focusAreaIds } = req.body;
      
      console.log('🆕 Creating new pillar:', { name, description, focusAreaIds });
      console.log('🔍 DEBUG - Request body:', req.body);
      console.log('🔍 DEBUG - Focus area IDs type:', typeof focusAreaIds, Array.isArray(focusAreaIds));
      
      // Enhanced validation
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Pillar name is required and must be a non-empty string'
        });
      }
      
      if (!description || typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Pillar description is required and must be a non-empty string'
        });
      }
      
      // Validate and clean focus area IDs
      let cleanedFocusAreaIds = [];
      if (focusAreaIds !== undefined && focusAreaIds !== null) {
        if (!Array.isArray(focusAreaIds)) {
          console.log('❌ focusAreaIds is not an array:', focusAreaIds, typeof focusAreaIds);
          return res.status(400).json({
            success: false,
            message: 'Focus area IDs must be an array'
          });
        }
        
        try {
          // Filter out null/undefined values and convert to integers
          cleanedFocusAreaIds = focusAreaIds
            .filter(id => id !== null && id !== undefined && id !== '')
            .map(id => {
              const numId = parseInt(id);
              if (isNaN(numId)) {
                throw new Error(`Invalid focus area ID: ${id}`);
              }
              return numId;
            });
        } catch (mapError) {
          console.log('❌ Error processing focus area IDs:', mapError);
          return res.status(400).json({
            success: false,
            message: `Error processing focus area IDs: ${mapError.message}`
          });
        }
      }
      
      console.log('🔍 DEBUG - Cleaned focus area IDs:', cleanedFocusAreaIds);
      
      // Check if pillar already exists
      const existingPillar = await Pillar.findByName(name.trim());
      if (existingPillar) {
        return res.status(400).json({
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
          return res.status(400).json({
            success: false,
            message: `Invalid focus area IDs: ${invalidIds.join(', ')}`
          });
        }
      }
      
      // Create pillar
      const pillarId = await Pillar.create(name.trim(), description.trim(), cleanedFocusAreaIds);
      
      // Fetch the created pillar with focus areas
      const newPillar = await Pillar.getById(pillarId);
      
      console.log(`✅ Pillar created successfully with ID: ${pillarId}`);
      res.status(201).json({
        success: true,
        message: 'Pillar created successfully',
        data: newPillar
      });
    } catch (error) {
      console.error('❌ Error creating pillar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create pillar',
        error: error.message
      });
    }
  },

  // Update pillar - ENHANCED WITH BETTER ERROR HANDLING
  updatePillar: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, focusAreaIds } = req.body;
      
      console.log(`✏️ UPDATE PILLAR - Starting update for pillar ${id}`);
      console.log('🔍 DEBUG - Request params:', req.params);
      console.log('🔍 DEBUG - Full request body:', JSON.stringify(req.body, null, 2));
      console.log('🔍 DEBUG - Individual fields:', { 
        name: name, 
        nameType: typeof name,
        description: description, 
        descType: typeof description,
        focusAreaIds: focusAreaIds, 
        focusType: typeof focusAreaIds, 
        isArray: Array.isArray(focusAreaIds) 
      });
      
      // Check if pillar exists first
      console.log('🔍 Checking if pillar exists...');
      const existingPillar = await Pillar.getById(id);
      if (!existingPillar) {
        console.log(`❌ Pillar ${id} not found`);
        return res.status(404).json({
          success: false,
          message: 'Pillar not found'
        });
      }
      console.log('✅ Pillar exists:', existingPillar.name);
      
      // Enhanced validation
      if (!name || typeof name !== 'string' || !name.trim()) {
        console.log('❌ Validation failed: name');
        return res.status(400).json({
          success: false,
          message: 'Pillar name is required and must be a non-empty string'
        });
      }
      
      if (!description || typeof description !== 'string' || !description.trim()) {
        console.log('❌ Validation failed: description');
        return res.status(400).json({
          success: false,
          message: 'Pillar description is required and must be a non-empty string'
        });
      }
      
      // Validate and clean focus area IDs
      let cleanedFocusAreaIds = [];
      if (focusAreaIds !== undefined && focusAreaIds !== null) {
        console.log('🔍 Processing focus area IDs...');
        
        if (!Array.isArray(focusAreaIds)) {
          console.log('❌ focusAreaIds is not an array:', focusAreaIds, typeof focusAreaIds);
          return res.status(400).json({
            success: false,
            message: 'Focus area IDs must be an array'
          });
        }
        
        try {
          // Filter out null/undefined values and convert to integers
          console.log('🔍 Raw focus area IDs before processing:', focusAreaIds);
          
          cleanedFocusAreaIds = focusAreaIds
            .filter(id => {
              const isValid = id !== null && id !== undefined && id !== '';
              console.log(`🔍 Filtering ID ${id}: ${isValid}`);
              return isValid;
            })
            .map(id => {
              console.log(`🔍 Converting ID ${id} (type: ${typeof id}) to integer`);
              const numId = parseInt(id);
              if (isNaN(numId)) {
                throw new Error(`Invalid focus area ID: ${id} (type: ${typeof id})`);
              }
              console.log(`🔍 Converted ${id} to ${numId}`);
              return numId;
            });
            
          console.log('✅ Focus area IDs processed successfully:', cleanedFocusAreaIds);
        } catch (mapError) {
          console.log('❌ Error processing focus area IDs:', mapError);
          return res.status(400).json({
            success: false,
            message: `Error processing focus area IDs: ${mapError.message}`
          });
        }
      }
      
      console.log('🔍 DEBUG - Final cleaned focus area IDs:', cleanedFocusAreaIds);
      
      // Check if another pillar with the same name exists
      console.log('🔍 Checking for name conflicts...');
      const nameConflict = await Pillar.findByName(name.trim());
      if (nameConflict && nameConflict.id !== parseInt(id)) {
        console.log(`❌ Name conflict: ${nameConflict.name} (ID: ${nameConflict.id})`);
        return res.status(400).json({
          success: false,
          message: 'Another pillar with this name already exists'
        });
      }
      console.log('✅ No name conflicts');
      
      // Validate focus area IDs if provided
      if (cleanedFocusAreaIds.length > 0) {
        console.log('🔍 Validating focus area IDs...');
        const allCategories = await Category.getAll();
        console.log('🔍 DEBUG - Available categories:', allCategories.map(c => ({ id: c.id, name: c.name, type: typeof c.id })));
        
        const validCategoryIds = allCategories.map(cat => cat.id);
        console.log('🔍 DEBUG - Valid category IDs:', validCategoryIds);
        
        const invalidIds = cleanedFocusAreaIds.filter(fId => !validCategoryIds.includes(fId));
        console.log('🔍 DEBUG - Invalid IDs found:', invalidIds);
        
        if (invalidIds.length > 0) {
          console.log(`❌ Invalid focus area IDs: ${invalidIds.join(', ')}`);
          return res.status(400).json({
            success: false,
            message: `Invalid focus area IDs: ${invalidIds.join(', ')}. Valid IDs are: ${validCategoryIds.join(', ')}`
          });
        }
        console.log('✅ All focus area IDs are valid');
      }
      
      // Update pillar - WITH ENHANCED ERROR HANDLING
      console.log('🔄 Starting pillar update...');
      console.log('🔍 Update parameters:', {
        id: id,
        idType: typeof id,
        name: name.trim(),
        description: description.trim(),
        focusAreaIds: cleanedFocusAreaIds
      });
      
      let affectedRows;
      try {
        affectedRows = await Pillar.update(id, name.trim(), description.trim(), cleanedFocusAreaIds);
        console.log('✅ Pillar.update completed, affected rows:', affectedRows);
      } catch (updateError) {
        console.error('❌ PILLAR UPDATE ERROR:', updateError);
        console.error('❌ Update error details:', {
          message: updateError.message,
          stack: updateError.stack,
          code: updateError.code,
          errno: updateError.errno,
          sqlState: updateError.sqlState,
          sqlMessage: updateError.sqlMessage
        });
        
        // Return more specific error information
        return res.status(500).json({
          success: false,
          message: 'Database update failed',
          error: updateError.message,
          details: {
            code: updateError.code,
            errno: updateError.errno,
            sqlState: updateError.sqlState
          }
        });
      }
      
      if (affectedRows === 0) {
        console.log('❌ No rows affected - pillar might not exist');
        return res.status(404).json({
          success: false,
          message: 'Pillar not found or no changes made'
        });
      }
      
      // Fetch updated pillar
      console.log('🔍 Fetching updated pillar...');
      let updatedPillar;
      try {
        updatedPillar = await Pillar.getById(id);
        console.log('✅ Updated pillar fetched successfully');
      } catch (fetchError) {
        console.error('❌ Error fetching updated pillar:', fetchError);
        // Return success even if we can't fetch the updated data
        return res.json({
          success: true,
          message: 'Pillar updated successfully (fetch of updated data failed)',
          error: 'Could not retrieve updated pillar data'
        });
      }
      
      console.log(`✅ Pillar ${id} updated successfully`);
      res.json({
        success: true,
        message: 'Pillar updated successfully',
        data: updatedPillar
      });
    } catch (error) {
      console.error('❌ CONTROLLER ERROR - Error updating pillar:', error);
      console.error('❌ CONTROLLER ERROR - Error stack:', error.stack);
      console.error('❌ CONTROLLER ERROR - Error details:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update pillar',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          code: error.code,
          errno: error.errno
        } : undefined
      });
    }
  },

  // Delete pillar
  deletePillar: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting pillar with ID: ${id}`);
      
      // Check if pillar exists
      const existingPillar = await Pillar.getById(id);
      if (!existingPillar) {
        return res.status(404).json({
          success: false,
          message: 'Pillar not found'
        });
      }
      
      const affectedRows = await Pillar.delete(id);
      
      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pillar not found'
        });
      }
      
      console.log(`✅ Pillar ${id} deleted successfully`);
      res.json({
        success: true,
        message: 'Pillar deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting pillar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete pillar',
        error: error.message
      });
    }
  },

  // Get all available focus areas for selection
  getAvailableFocusAreas: async (req, res) => {
    try {
      console.log('📋 Fetching available focus areas...');
      const focusAreas = await Category.getAll();
      
      console.log(`✅ Found ${focusAreas.length} focus areas`);
      console.log('🔍 DEBUG - Focus areas structure:', focusAreas.map(fa => ({ id: fa.id, name: fa.name, type: typeof fa.id })));
      
      res.json({
        success: true,
        data: focusAreas
      });
    } catch (error) {
      console.error('❌ Error fetching focus areas:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch focus areas',
        error: error.message
      });
    }
  }
};

module.exports = pillarController;
const Impact = require('../models/Impact');

// Get all impacts
exports.getAllImpacts = async (req, res) => {
  try {
    const { is_active, is_featured } = req.query;
    
    const filters = {};
    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }
    if (is_featured !== undefined) {
      filters.is_featured = is_featured === 'true';
    }

    const impacts = await Impact.getAll(filters);

    res.json({
      success: true,
      data: impacts,
      count: impacts.length
    });
  } catch (error) {
    console.error('Error in getAllImpacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impacts',
      error: error.message
    });
  }
};

// Get impact by ID
exports.getImpactById = async (req, res) => {
  try {
    const { id } = req.params;
    const impact = await Impact.getById(id);

    if (!impact) {
      return res.status(404).json({
        success: false,
        message: 'Impact not found'
      });
    }

    res.json({
      success: true,
      data: impact
    });
  } catch (error) {
    console.error('Error in getImpactById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impact',
      error: error.message
    });
  }
};

// Create new impact
exports.createImpact = async (req, res) => {
  try {
    const {
      name,
      description,
      starting_value,
      unit,
      icon,
      color,
      order_index,
      is_active,
      is_featured
    } = req.body;

    // Validate required fields
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Impact name is required'
      });
    }

    const impactData = {
      name: name.trim(),
      description: description?.trim(),
      starting_value: parseInt(starting_value) || 0,
      current_value: parseInt(starting_value) || 0,
      unit: unit?.trim(),
      icon: icon?.trim(),
      color: color?.trim() || '#1976d2',
      order_index: parseInt(order_index) || 0,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      is_featured: is_featured !== undefined ? Boolean(is_featured) : false
    };

    const impact = await Impact.create(impactData);

    res.status(201).json({
      success: true,
      message: 'Impact created successfully',
      data: impact
    });
  } catch (error) {
    console.error('Error in createImpact:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Impact name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create impact',
      error: error.message
    });
  }
};

// Update impact
exports.updateImpact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    // Add debug logging
    console.log('Update request body:', req.body);
    console.log('Impact ID:', id);

    // Process allowed fields (now including is_featured)
    const allowedFields = [
      'name', 'description', 'starting_value', 'current_value', 'unit', 
      'icon', 'color', 'order_index', 'is_active', 'is_featured'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'starting_value' || field === 'current_value' || field === 'order_index') {
          updateData[field] = parseInt(req.body[field]) || 0;
        } else if (field === 'is_active' || field === 'is_featured') {
          updateData[field] = Boolean(req.body[field]);
        } else if (typeof req.body[field] === 'string') {
          updateData[field] = req.body[field].trim();
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    console.log('Processed update data:', updateData);

    // Validate name if provided
    if (updateData.name && !updateData.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Impact name cannot be empty'
      });
    }

    const impact = await Impact.update(id, updateData);

    if (!impact) {
      return res.status(404).json({
        success: false,
        message: 'Impact not found'
      });
    }

    console.log('Updated impact result:', impact);

    res.json({
      success: true,
      message: 'Impact updated successfully',
      data: impact
    });
  } catch (error) {
    console.error('Error in updateImpact:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Impact name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update impact',
      error: error.message
    });
  }
};

// Delete impact
exports.deleteImpact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Impact.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Impact not found'
      });
    }

    res.json({
      success: true,
      message: 'Impact deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteImpact:', error);
    
    res.status(500).json({
      success: false,
      message: error.message.includes('used in projects') 
        ? error.message 
        : 'Failed to delete impact',
      error: error.message
    });
  }
};

// Get project impacts
exports.getProjectImpacts = async (req, res) => {
  try {
    const { projectId } = req.params;
    const impacts = await Impact.getProjectImpacts(projectId);

    res.json({
      success: true,
      data: impacts,
      count: impacts.length
    });
  } catch (error) {
    console.error('Error in getProjectImpacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project impacts',
      error: error.message
    });
  }
};

// Update project impacts
exports.updateProjectImpacts = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { impacts } = req.body;

    // Validate impacts data
    if (!Array.isArray(impacts)) {
      return res.status(400).json({
        success: false,
        message: 'Impacts must be an array'
      });
    }

    // Validate each impact
    for (const impact of impacts) {
      if (!impact.impact_id || !impact.contribution_value || impact.contribution_value <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each impact must have a valid impact_id and positive contribution_value'
        });
      }
    }

    const updatedImpacts = await Impact.updateProjectImpacts(projectId, impacts);

    res.json({
      success: true,
      message: 'Project impacts updated successfully',
      data: updatedImpacts
    });
  } catch (error) {
    console.error('Error in updateProjectImpacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project impacts',
      error: error.message
    });
  }
};

// Get impact statistics summary
exports.getImpactStats = async (req, res) => {
  try {
    const stats = await Impact.getStatsSummary();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getImpactStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impact statistics',
      error: error.message
    });
  }
};

// Recalculate impact totals
exports.recalculateImpactTotals = async (req, res) => {
  try {
    await Impact.recalculateAllTotals();

    res.json({
      success: true,
      message: 'Impact totals recalculated successfully'
    });
  } catch (error) {
    console.error('Error in recalculateImpactTotals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate impact totals',
      error: error.message
    });
  }
};

// Set starting value for existing impact
exports.setStartingValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { starting_value } = req.body;

    // Validate starting value
    if (starting_value === undefined || starting_value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Starting value must be a non-negative number'
      });
    }

    const impact = await Impact.setStartingValue(id, parseInt(starting_value) || 0);

    if (!impact) {
      return res.status(404).json({
        success: false,
        message: 'Impact not found'
      });
    }

    res.json({
      success: true,
      message: 'Starting value updated successfully',
      data: impact
    });
  } catch (error) {
    console.error('Error in setStartingValue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update starting value',
      error: error.message
    });
  }
};

// Get impact breakdown (starting value vs project contributions)
exports.getImpactBreakdown = async (req, res) => {
  try {
    const { id } = req.params;
    const breakdown = await Impact.getBreakdown(id);

    if (!breakdown) {
      return res.status(404).json({
        success: false,
        message: 'Impact not found'
      });
    }

    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Error in getImpactBreakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impact breakdown',
      error: error.message
    });
  }
};

// Get impact growth data
exports.getImpactGrowth = async (req, res) => {
  try {
    // Implement your growth logic here
    res.json({
      success: true,
      data: [], // Replace with actual growth data
      message: 'Impact growth data retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getImpactGrowth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impact growth data',
      error: error.message
    });
  }
};
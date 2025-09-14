const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', impactController.getAllImpacts);
router.get('/stats', impactController.getImpactStats);
router.get('/growth', impactController.getImpactGrowth); // NEW: Get impact growth data
router.get('/:id', impactController.getImpactById);
router.get('/:id/breakdown', impactController.getImpactBreakdown); // NEW: Get detailed breakdown
router.get('/project/:projectId', impactController.getProjectImpacts);

// Protected routes (admin only)
router.post('/', impactController.createImpact);
router.put('/:id', impactController.updateImpact);
router.delete('/:id', impactController.deleteImpact);
router.put('/project/:projectId', impactController.updateProjectImpacts);
router.post('/recalculate', impactController.recalculateImpactTotals);

// NEW: Routes for starting value management
router.put('/:id/starting-value', impactController.setStartingValue);

// NEW: Migration/utility routes (admin only)
router.post('/initialize-starting-values', async (req, res) => {
  try {
    const Impact = require('../models/Impact');
    await Impact.initializeStartingValues();
    
    res.json({
      success: true,
      message: 'Starting values initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing starting values:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize starting values',
      error: error.message
    });
  }
});

module.exports = router;
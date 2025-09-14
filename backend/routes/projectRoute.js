const express = require('express');
const router = express.Router();

const { 
  getAllProjects, 
  getProjectById, 
  getProjectBySlug,
  getProjectImpacts,
  createProject, 
  updateProject, 
  addGalleryImage,
  deleteProject,
  toggleFeatured,
  toggleHidden, // Add this import
  getFeaturedProjects,
  removeGalleryImage,
  clearGallery,
  getProjectStats
} = require('../controllers/projectController');

const { uploadFields, cleanupOnError } = require('../middleware/upload');
const { auth } = require('../middleware/auth');

// Upload configuration for projects
const projectUploadFields = [
  { name: 'featured_image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
];

// Public routes (no authentication required)
router.get('/', getAllProjects);
router.get('/featured', getFeaturedProjects);
router.get('/stats', getProjectStats);
router.get('/slug/:slug', getProjectBySlug);
router.get('/:id', getProjectById);
router.get('/:id/impacts', getProjectImpacts);

// Protected routes (admin only)
// Create project with file uploads
router.post('/', 
  auth,
  cleanupOnError,
  uploadFields(projectUploadFields),
  createProject
);

// Update project with file uploads
router.put('/:id', 
  auth,
  cleanupOnError,
  uploadFields(projectUploadFields),
  updateProject
);

// Delete project
router.delete('/:id', auth, deleteProject);

// Toggle featured status
router.patch('/:id/toggle-featured', auth, toggleFeatured);

// Toggle hidden status - ADD THIS ROUTE
router.patch('/:id/toggle-hidden', auth, toggleHidden);

router.post('/:id/gallery/add', auth, cleanupOnError, uploadFields([{ name: 'gallery', maxCount: 1 }]), addGalleryImage);
router.delete('/:id/gallery/:imageIndex', auth, removeGalleryImage);
router.delete('/:id/gallery', auth, clearGallery);

module.exports = router;
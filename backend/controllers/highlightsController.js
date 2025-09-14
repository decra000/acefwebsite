// controllers/highlightsController.js
const Highlight = require('../models/Highlight');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/highlights';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'highlight-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

class HighlightsController {
  // Get all highlights grouped by year
  static async getAllHighlights(req, res) {
    try {
      const highlights = await Highlight.getAllByYear();
      
      res.status(200).json({
        success: true,
        data: highlights
      });
    } catch (error) {
      console.error('Error fetching highlights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch highlights',
        error: error.message
      });
    }
  }

  // Get highlights for a specific year
  static async getHighlightsByYear(req, res) {
    try {
      const { year } = req.params;
      
      if (!year || isNaN(year)) {
        return res.status(400).json({
          success: false,
          message: 'Valid year is required'
        });
      }

      const highlights = await Highlight.getByYear(parseInt(year));
      
      res.status(200).json({
        success: true,
        data: highlights
      });
    } catch (error) {
      console.error('Error fetching highlights by year:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch highlights',
        error: error.message
      });
    }
  }

  // Get available years
  static async getAvailableYears(req, res) {
    try {
      const availableYears = await Highlight.getAvailableYears();
      const validYears = Highlight.getValidYears();
      
      res.status(200).json({
        success: true,
        data: {
          availableYears,
          validYears
        }
      });
    } catch (error) {
      console.error('Error fetching years:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch years',
        error: error.message
      });
    }
  }

  // Create new highlight
  static async createHighlight(req, res) {
    try {
      const { year, title, description, display_order } = req.body;
      
      if (!year || !title) {
        return res.status(400).json({
          success: false,
          message: 'Year and title are required'
        });
      }

      // Check if file was uploaded
      let image_url = null;
      if (req.file) {
        image_url = `/uploads/highlights/${req.file.filename}`;
      }

      // Get next display order if not provided
      let finalDisplayOrder = display_order;
      if (!finalDisplayOrder) {
        finalDisplayOrder = await Highlight.getNextDisplayOrder(parseInt(year));
      }

      const highlightData = {
        year: parseInt(year),
        title: title.trim(),
        description: description?.trim() || null,
        image_url,
        display_order: parseInt(finalDisplayOrder)
      };

      const newHighlight = await Highlight.create(highlightData);
      
      res.status(201).json({
        success: true,
        message: 'Highlight created successfully',
        data: newHighlight
      });
    } catch (error) {
      console.error('Error creating highlight:', error);
      
      // Delete uploaded file if highlight creation failed
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create highlight',
        error: error.message
      });
    }
  }

  // Update highlight
  static async updateHighlight(req, res) {
    try {
      const { id } = req.params;
      const { year, title, description, display_order } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid highlight ID is required'
        });
      }

      // Get existing highlight to check for old image
      let existingHighlight;
      try {
        existingHighlight = await Highlight.getById(parseInt(id));
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Highlight not found'
        });
      }

      let image_url = existingHighlight.image_url;
      
      // Check if new file was uploaded
      if (req.file) {
        // Delete old image if exists
        if (existingHighlight.image_url) {
          const oldImagePath = path.join(__dirname, '..', existingHighlight.image_url);
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error('Error deleting old image:', err);
          });
        }
        
        image_url = `/uploads/highlights/${req.file.filename}`;
      }

      const highlightData = {
        year: year ? parseInt(year) : undefined,
        title: title?.trim(),
        description: description?.trim(),
        image_url,
        display_order: display_order ? parseInt(display_order) : undefined
      };

      const updatedHighlight = await Highlight.update(parseInt(id), highlightData);
      
      res.status(200).json({
        success: true,
        message: 'Highlight updated successfully',
        data: updatedHighlight
      });
    } catch (error) {
      console.error('Error updating highlight:', error);
      
      // Delete uploaded file if update failed
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update highlight',
        error: error.message
      });
    }
  }

  // Delete highlight
  static async deleteHighlight(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid highlight ID is required'
        });
      }

      // Get highlight to check for image
      let existingHighlight;
      try {
        existingHighlight = await Highlight.getById(parseInt(id));
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Highlight not found'
        });
      }

      // Delete the highlight
      await Highlight.delete(parseInt(id));

      // Delete associated image file
      if (existingHighlight.image_url) {
        const imagePath = path.join(__dirname, '..', existingHighlight.image_url);
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error deleting image:', err);
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Highlight deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete highlight',
        error: error.message
      });
    }
  }

  // Update display orders
  static async updateDisplayOrders(req, res) {
    try {
      const { year } = req.params;
      const { highlights } = req.body;
      
      if (!year || isNaN(year)) {
        return res.status(400).json({
          success: false,
          message: 'Valid year is required'
        });
      }

      if (!highlights || !Array.isArray(highlights)) {
        return res.status(400).json({
          success: false,
          message: 'Highlights array is required'
        });
      }

      await Highlight.updateDisplayOrders(parseInt(year), highlights);
      
      res.status(200).json({
        success: true,
        message: 'Display orders updated successfully'
      });
    } catch (error) {
      console.error('Error updating display orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update display orders',
        error: error.message
      });
    }
  }

  // Get single highlight by ID
  static async getHighlightById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid highlight ID is required'
        });
      }

      const highlight = await Highlight.getById(parseInt(id));
      
      res.status(200).json({
        success: true,
        data: highlight
      });
    } catch (error) {
      console.error('Error fetching highlight:', error);
      res.status(404).json({
        success: false,
        message: 'Highlight not found',
        error: error.message
      });
    }
  }
}

// Export the controller and upload middleware
module.exports = {
  HighlightsController,
  upload
};
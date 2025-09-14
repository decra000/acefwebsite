// controllers/mediaLibraryController.js
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios'); // You'll need to install this: npm install axios
const { 
  uploadMultiple, 
  BASE_UPLOAD_DIR,
  getFileUrl,
  generateSecureFilename
} = require('../middleware/upload');

// Get all images from the media library
const getAllImages = async (req, res) => {
  try {
    const allImages = [];
    
    // Define folders to scan
    const folders = ['team', 'blogs', 'projects', 'partners', 'logos', 'testimonials', 'events', 'highlights', 'general'];
    
    for (const folder of folders) {
      const folderPath = path.join(BASE_UPLOAD_DIR, folder);
      
      try {
        await fs.access(folderPath);
        const files = await fs.readdir(folderPath);
        const imageFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        });

        for (const filename of imageFiles) {
          const filePath = path.join(folderPath, filename);
          try {
            const stats = await fs.stat(filePath);
            allImages.push({
              id: `${folder}-${filename}`,
              filename: filename,
              name: filename.replace(/\.[^/.]+$/, ""), // Remove extension for display
              url: `/uploads/${folder}/${filename}`,
              thumbnail: `/uploads/${folder}/${filename}`,
              category: folder,
              created_at: stats.birthtime,
              size: stats.size,
              source: 'uploaded'
            });
          } catch (error) {
            console.error(`Error reading file ${filename}:`, error);
          }
        }
      } catch (error) {
        // Folder doesn't exist, continue
        continue;
      }
    }

    res.json({
      success: true,
      images: allImages,
      total: allImages.length
    });
  } catch (error) {
    console.error('Error fetching media library:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media library',
      error: error.message
    });
  }
};

// Upload new images to media library
const uploadToLibrary = async (req, res) => {
  try {
    const { category = 'general' } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const uploadedImages = req.files.map(file => ({
      id: `${category}-${file.filename}`,
      filename: file.filename,
      name: file.originalname,
      url: getFileUrl(req, file.filename, category),
      thumbnail: getFileUrl(req, file.filename, category),
      category: category,
      size: file.size,
      mimetype: file.mimetype,
      source: 'uploaded'
    }));

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} image(s) to media library`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload to media library',
      error: error.message
    });
  }
};

// Search Unsplash images (you'll need an Unsplash API key)
const searchUnsplash = async (req, res) => {
  try {
    const { query, page = 1, per_page = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    if (!UNSPLASH_ACCESS_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Unsplash API key not configured'
      });
    }

    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, page, per_page },
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    const images = response.data.results.map(img => ({
      id: `unsplash-${img.id}`,
      name: img.alt_description || img.description || 'Untitled',
      url: img.urls.regular,
      thumbnail: img.urls.small,
      source: 'unsplash',
      external: true,
      attribution: {
        photographer: img.user.name,
        photographer_url: img.user.links.html,
        download_url: img.links.download_location
      }
    }));

    res.json({
      success: true,
      images: images,
      total: response.data.total,
      total_pages: response.data.total_pages,
      current_page: page
    });
  } catch (error) {
    console.error('Unsplash search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search Unsplash',
      error: error.message
    });
  }
};

// Import image from external URL (including Unsplash)
const importFromUrl = async (req, res) => {
  try {
    const { imageUrl, category = 'general', name, attribution } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    // Generate filename
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = generateSecureFilename(name || 'imported-image') + ext;
    
    // Save to category folder
    const folderPath = path.join(BASE_UPLOAD_DIR, category);
    await fs.mkdir(folderPath, { recursive: true });
    
    const filePath = path.join(folderPath, filename);
    await fs.writeFile(filePath, buffer);

    // If it's from Unsplash, trigger download tracking
    if (attribution && attribution.download_url) {
      try {
        await axios.get(attribution.download_url);
      } catch (err) {
        console.warn('Failed to track Unsplash download:', err);
      }
    }

    const importedImage = {
      id: `${category}-${filename}`,
      filename: filename,
      name: name || 'Imported Image',
      url: `/uploads/${category}/${filename}`,
      thumbnail: `/uploads/${category}/${filename}`,
      category: category,
      source: attribution ? 'unsplash' : 'external',
      attribution: attribution || null
    };

    res.json({
      success: true,
      message: 'Image imported successfully',
      image: importedImage
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import image',
      error: error.message
    });
  }
};

module.exports = {
  getAllImages,
  uploadToLibrary,
  searchUnsplash,
  importFromUrl
};
const Blog = require('../models/Blog');

// Create Blog
async function createBlog(data) {
  try {
    const newItem = new Blog(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Blog
async function getAllBlog() {
  try {
    return await Blog.find();
  } catch (err) {
    throw err;
  }
}

// Get Blog by ID
async function getBlogById(id) {
  try {
    return await Blog.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Blog
async function updateBlog(id, data) {
  try {
    return await Blog.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Blog
async function deleteBlog(id) {
  try {
    return await Blog.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createBlog,
  getAllBlog,
  getBlogById,
  updateBlog,
  deleteBlog
};

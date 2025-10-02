const Category = require('../models/Category');

// Create Category
async function createCategory(data) {
  try {
    const newItem = new Category(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Category
async function getAllCategory() {
  try {
    return await Category.find();
  } catch (err) {
    throw err;
  }
}

// Get Category by ID
async function getCategoryById(id) {
  try {
    return await Category.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Category
async function updateCategory(id, data) {
  try {
    return await Category.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Category
async function deleteCategory(id) {
  try {
    return await Category.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
};

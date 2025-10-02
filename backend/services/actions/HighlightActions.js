const Highlight = require('../models/Highlight');

// Create Highlight
async function createHighlight(data) {
  try {
    const newItem = new Highlight(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Highlight
async function getAllHighlight() {
  try {
    return await Highlight.find();
  } catch (err) {
    throw err;
  }
}

// Get Highlight by ID
async function getHighlightById(id) {
  try {
    return await Highlight.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Highlight
async function updateHighlight(id, data) {
  try {
    return await Highlight.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Highlight
async function deleteHighlight(id) {
  try {
    return await Highlight.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createHighlight,
  getAllHighlight,
  getHighlightById,
  updateHighlight,
  deleteHighlight
};

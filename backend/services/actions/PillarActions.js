const Pillar = require('../models/Pillar');

// Create Pillar
async function createPillar(data) {
  try {
    const newItem = new Pillar(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Pillar
async function getAllPillar() {
  try {
    return await Pillar.find();
  } catch (err) {
    throw err;
  }
}

// Get Pillar by ID
async function getPillarById(id) {
  try {
    return await Pillar.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Pillar
async function updatePillar(id, data) {
  try {
    return await Pillar.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Pillar
async function deletePillar(id) {
  try {
    return await Pillar.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createPillar,
  getAllPillar,
  getPillarById,
  updatePillar,
  deletePillar
};

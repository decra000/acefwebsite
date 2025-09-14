const Country = require('../models/Country');

// ✅ Get all countries
exports.getCountries = async (req, res) => {
  try {
    const countries = await Country.getAll();
    console.log('📦 Countries fetched from database successfully.');
    res.status(200).json(countries);
  } catch (err) {
    console.error('❌ Error fetching countries:', err.message);
    res.status(500).json({ error: 'Server error while fetching countries' });
  }
};

// ➕ Add new country with duplication check
exports.addCountry = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Country name is required' });
  }

  try {
    const existing = await Country.findByName(name.trim());

    if (existing) {
      return res.status(409).json({ error: 'Country already exists' });
    }

    await Country.add(name.trim()); // Pass only name
    console.log(`✅ ${name} added to the database successfully.`);
    res.status(201).json({ message: 'Country added successfully' });
  } catch (err) {
    console.error('❌ Error adding country:', err.message);
    res.status(500).json({ error: 'Failed to add country' });
  }
};

// 🗑 Delete country by ID
exports.deleteCountry = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Country.delete(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }

    console.log(`🗑 Country with ID ${id} deleted successfully.`);
    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting country:', err.message);
    res.status(500).json({ error: 'Failed to delete country' });
  }
};

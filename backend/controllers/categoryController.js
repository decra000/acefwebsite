const Category = require('../models/Category');

// ✅ Get all categories
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.getAll();
    console.log(`✅ ${categories.length} categories fetched from DB`);
    res.json(categories);
  } catch (err) {
    console.error('❌ Error fetching categories:', err);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

// ➕ Create new category
exports.create = async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const exists = await Category.findByName(name);
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const id = await Category.create(name);
    console.log(`✅ Category '${name}' created with ID ${id}`);
    res.status(201).json({ id, name, message: 'Category created successfully' });
  } catch (err) {
    console.error('❌ Error creating category:', err);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

// ✏️ Update category
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const exists = await Category.findByName(name);
    if (exists && exists.id !== parseInt(id)) {
      return res.status(400).json({ message: 'Another category with this name already exists' });
    }

    const updated = await Category.update(id, name);
    if (updated) {
      console.log(`✅ Category with ID ${id} updated to '${name}'`);
      res.json({ id, name, message: 'Category updated successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    console.error('❌ Error updating category:', err);
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

// 🗑️ Delete category
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.delete(id);
    if (deleted) {
      console.log(`🗑️ Category with ID ${id} deleted`);
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    console.error('❌ Error deleting category:', err);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

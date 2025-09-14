const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { auth } = require('../middleware/auth');
const { uploadSingle, cleanupOnError } = require('../middleware/upload');

// DEPARTMENT ROUTES

// GET all departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Team.getAllDepartments();
    res.json({ success: true, data: departments });
  } catch (err) {
    console.error('❌ Error fetching departments:', err);
    res.status(500).json({ success: false, message: 'Error fetching departments' });
  }
});

// GET single department
router.get('/departments/:id', async (req, res) => {
  try {
    const department = await Team.getDepartmentById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: department });
  } catch (err) {
    console.error('❌ Error fetching department:', err);
    res.status(500).json({ success: false, message: 'Error fetching department' });
  }
});

// POST new department
router.post('/departments', auth, async (req, res) => {
  try {
    const { name, description, order_index } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const newDepartment = await Team.createDepartment({
      name,
      description: description || '',
      order_index: parseInt(order_index) || 0,
    });

    res.status(201).json({ 
      success: true, 
      data: newDepartment, 
      message: 'Department created successfully' 
    });
  } catch (err) {
    console.error('❌ Error creating department:', err);
    
    // Handle duplicate name error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Department name already exists' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Error creating department' });
  }
});

// PUT update department
router.put('/departments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Team.getDepartmentById(id);
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const { name, description, order_index } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const updatedData = {
      name,
      description: description ?? existing.description,
      order_index: order_index !== undefined ? parseInt(order_index) : existing.order_index,
    };

    const updated = await Team.updateDepartment(id, updatedData);
    res.json({ 
      success: true, 
      data: updated, 
      message: 'Department updated successfully' 
    });
  } catch (err) {
    console.error('❌ Error updating department:', err);
    
    // Handle duplicate name error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Department name already exists' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Error updating department' });
  }
});

// DELETE department
router.delete('/departments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Team.getDepartmentById(id);
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await Team.deleteDepartment(id);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting department:', err);
    
    if (err.message.includes('Cannot delete department that has active team members')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete department that has active team members. Please reassign or remove team members first.' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Error deleting department' });
  }
});

// TEAM MEMBER ROUTES

// GET all team members
router.get('/', async (req, res) => {
  try {
    const members = await Team.getAll();
    res.json({ success: true, data: members });
  } catch (err) {
    console.error('❌ Error fetching team members:', err);
    res.status(500).json({ success: false, message: 'Error fetching team members' });
  }
});

// GET all countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await Team.getCountries();
    res.json({ success: true, data: countries });
  } catch (err) {
    console.error('❌ Error fetching countries:', err);
    res.status(500).json({ success: false, message: 'Error fetching countries' });
  }
});

// GET members by department
router.get('/department/:department', async (req, res) => {
  try {
    const teamMembers = await Team.getByDepartment(req.params.department);
    res.json({ success: true, data: teamMembers });
  } catch (err) {
    console.error('❌ Error fetching department team:', err);
    res.status(500).json({ success: false, message: 'Error fetching department team' });
  }
});

// GET members by country
router.get('/country/:country', async (req, res) => {
  try {
    const teamMembers = await Team.getByCountry(req.params.country);
    res.json({ success: true, data: teamMembers });
  } catch (err) {
    console.error('❌ Error fetching country team:', err);
    res.status(500).json({ success: false, message: 'Error fetching country team' });
  }
});

// GET a single member
router.get('/:id', async (req, res) => {
  try {
    const member = await Team.getById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({ success: true, data: member });
  } catch (err) {
    console.error('❌ Error fetching member:', err);
    res.status(500).json({ success: false, message: 'Error fetching member' });
  }
});

// POST new member
router.post(
  '/',
  auth,
  uploadSingle('image'),
  cleanupOnError,
  async (req, res) => {
    try {
      const { name, department, position, bio, email, linkedin_url, order_index, country, country_code } = req.body;

      if (!name || !position) {
        return res.status(400).json({ success: false, message: 'Name and position are required' });
      }

      const newMember = await Team.create({
        name,
        department: department || 'General',
        position,
        bio: bio || '',
        email: email || '',
        linkedin_url: linkedin_url || '',
        order_index: parseInt(order_index) || 0,
        country: country || '',
        country_code: country_code || '',
        image_url: req.file ? `/uploads/team/${req.file.filename}` : null,
      });

      res.status(201).json({ success: true, data: newMember, message: 'Team member created' });
    } catch (err) {
      console.error('❌ Error creating team member:', err);
      res.status(500).json({ success: false, message: 'Error creating member' });
    }
  }
);

// PUT update member
router.put(
  '/:id',
  auth,
  uploadSingle('image'),
  cleanupOnError,
  async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await Team.getById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Team member not found' });
      }

      const updatedData = {
        name: req.body.name || existing.name,
        department: req.body.department || existing.department,
        position: req.body.position || existing.position,
        bio: req.body.bio ?? existing.bio,
        email: req.body.email ?? existing.email,
        linkedin_url: req.body.linkedin_url ?? existing.linkedin_url,
        order_index: req.body.order_index ? parseInt(req.body.order_index) : existing.order_index,
        country: req.body.country ?? existing.country,
        country_code: req.body.country_code ?? existing.country_code,
        image_url: req.file ? `/uploads/team/${req.file.filename}` : existing.image_url,
      };

      const updated = await Team.update(id, updatedData);
      res.json({ success: true, data: updated, message: 'Team member updated' });
    } catch (err) {
      console.error('❌ Update Error:', err);
      res.status(500).json({ success: false, message: 'Update failed' });
    }
  }
);

// DELETE soft delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Team.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    await Team.delete(id);
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Error:', err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

module.exports = router;
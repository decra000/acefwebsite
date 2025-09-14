const Team = require('../models/Team');
// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Team.getAllDepartments();
    res.status(200).json({ success: true, data: departments });
  } catch (err) {
    console.error('❌ Error fetching departments:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Team.getDepartmentById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, data: department });
  } catch (err) {
    console.error('❌ Error fetching department:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, order_index } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const newDepartment = await Team.createDepartment({
      name: name.trim(),
      description: description ? description.trim() : '',
      order_index: order_index ? parseInt(order_index) : 0,
    });

    res.status(201).json({ 
      success: true, 
      message: 'Department created successfully', 
      data: newDepartment 
    });
  } catch (err) {
       console.error('❌ Error Creating Department:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
    
// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const teamMembers = await Team.getAll();
    res.status(200).json({ success: true, data: teamMembers });
  } catch (err) {
    console.error('❌ Error fetching team:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get one by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Team.getById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    console.error('❌ Error fetching member:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Team.getDepartments();
    res.status(200).json({ success: true, data: departments });
  } catch (err) {
    console.error('❌ Error fetching departments:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get by department
exports.getByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const members = await Team.getByDepartment(department);
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    console.error('❌ Error fetching by department:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get by country
exports.getByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const members = await Team.getByCountry(country);
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    console.error('❌ Error fetching by country:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all countries
exports.getCountries = async (req, res) => {
  try {
    const countries = await Team.getCountries();
    res.status(200).json({ success: true, data: countries });
  } catch (err) {
    console.error('❌ Error fetching countries:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new member
exports.createMember = async (req, res) => {
  try {
    const { name, department, position, bio, email, linkedin_url, order_index, country, country_code } = req.body;
    const image_url = req.file ? `/uploads/team/${req.file.filename}` : null;

    if (!name || !position || !image_url) {
      return res.status(400).json({ success: false, message: 'Name, position, and image are required' });
    }

    const newMember = await Team.create({
      name,
      department: department || 'General',
      position,
      bio: bio || '',
      email: email || '',
      linkedin_url: linkedin_url || '',
      order_index: order_index ? parseInt(order_index) : 0,
      image_url,
      country: country || '',
      country_code: country_code || '',
    });

    res.status(201).json({ success: true, message: 'Team member added', data: newMember });
  } catch (err) {
    console.error('❌ Error adding team member:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Team.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    const { name, department, position, bio, email, linkedin_url, order_index, country, country_code } = req.body;
    const image_url = req.file ? `/uploads/team/${req.file.filename}` : existing.image_url;

    const updated = await Team.update(id, {
      name: name || existing.name,
      department: department || existing.department,
      position: position || existing.position,
      bio: bio !== undefined ? bio : existing.bio,
      email: email !== undefined ? email : existing.email,
      linkedin_url: linkedin_url !== undefined ? linkedin_url : existing.linkedin_url,
      order_index: order_index !== undefined ? parseInt(order_index) : existing.order_index,
      country: country !== undefined ? country : existing.country,
      country_code: country_code !== undefined ? country_code : existing.country_code,
      image_url,
    });

    res.status(200).json({ success: true, message: 'Team member updated', data: updated });
  } catch (err) {
    console.error('❌ Error updating member:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete member (soft delete)
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Team.getById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    await Team.delete(id);
    res.status(200).json({ success: true, message: 'Team member deleted' });
  } catch (err) {
    console.error('❌ Error deleting member:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
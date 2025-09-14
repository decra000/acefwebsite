const { executeQuery } = require('../config/database');

// DEPARTMENT MANAGEMENT FUNCTIONS

// CREATE new department
const createDepartment = async (departmentData) => {
  const { name, description, order_index } = departmentData;
  
  const query = `
    INSERT INTO departments (name, description, order_index) 
    VALUES (?, ?, ?)
  `;
  
  const result = await executeQuery(query, [name, description || '', order_index || 0]);
  return { id: result.insertId, ...departmentData };
};

// GET all departments
const getAllDepartments = async () => {
  const query = `SELECT * FROM departments WHERE is_active = TRUE ORDER BY order_index ASC, name ASC`;
  return await executeQuery(query);
};

// GET department by ID
const getDepartmentById = async (id) => {
  const query = `SELECT * FROM departments WHERE id = ? AND is_active = TRUE LIMIT 1`;
  const results = await executeQuery(query, [id]);
  return results[0];
};

// UPDATE department
const updateDepartment = async (id, updatedData) => {
  const { name, description, order_index } = updatedData;
  
  const query = `
    UPDATE departments
    SET name = ?, description = ?, order_index = ?
    WHERE id = ?
  `;
  
  await executeQuery(query, [name, description, order_index, id]);
  return { id, ...updatedData };
};

// DELETE department (soft delete)
const deleteDepartment = async (id) => {
  // First check if any team members are using this department
  const checkQuery = `SELECT COUNT(*) as count FROM team_members WHERE department = (SELECT name FROM departments WHERE id = ?) AND is_active = TRUE`;
  const checkResult = await executeQuery(checkQuery, [id]);
  
  if (checkResult[0].count > 0) {
    throw new Error('Cannot delete department that has active team members');
  }
  
  const query = `UPDATE departments SET is_active = FALSE WHERE id = ?`;
  return await executeQuery(query, [id]);
};

// TEAM MEMBER FUNCTIONS (Updated to use department names)

// CREATE new team member
const create = async (member) => {
  const {
    name,
    department,
    position,
    bio,
    email,
    linkedin_url,
    order_index,
    image_url,
    country,
    country_code,
  } = member;

  const query = `
    INSERT INTO team_members 
    (name, department, position, bio, email, linkedin_url, order_index, image_url, country, country_code) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await executeQuery(query, [
    name,
    department,
    position,
    bio,
    email,
    linkedin_url,
    order_index,
    image_url,
    country,
    country_code,
  ]);

  return { id: result.insertId, ...member };
};

// GET all members
const getAll = async () => {
  const query = `SELECT * FROM team_members WHERE is_active = TRUE ORDER BY order_index ASC`;
  return await executeQuery(query);
};

// GET by ID
const getById = async (id) => {
  const query = `SELECT * FROM team_members WHERE id = ? AND is_active = TRUE LIMIT 1`;
  const results = await executeQuery(query, [id]);
  return results[0];
};

// GET departments (from team members - for backward compatibility)
const getDepartments = async () => {
  const query = `SELECT DISTINCT department FROM team_members WHERE is_active = TRUE AND department IS NOT NULL ORDER BY department ASC`;
  return await executeQuery(query);
};

// GET by department
const getByDepartment = async (department) => {
  const query = `SELECT * FROM team_members WHERE department = ? AND is_active = TRUE ORDER BY order_index ASC`;
  return await executeQuery(query, [department]);
};

// GET by country
const getByCountry = async (country) => {
  const query = `SELECT * FROM team_members WHERE country = ? AND is_active = TRUE ORDER BY order_index ASC`;
  return await executeQuery(query, [country]);
};

// GET all countries
const getCountries = async () => {
  const query = `SELECT DISTINCT country, country_code FROM team_members WHERE is_active = TRUE AND country IS NOT NULL ORDER BY country ASC`;
  return await executeQuery(query);
};

// UPDATE member
const update = async (id, updatedData) => {
  const {
    name,
    department,
    position,
    bio,
    email,
    linkedin_url,
    order_index,
    image_url,
    country,
    country_code,
  } = updatedData;

  const query = `
    UPDATE team_members
    SET name = ?, department = ?, position = ?, bio = ?, email = ?, linkedin_url = ?, order_index = ?, image_url = ?, country = ?, country_code = ?
    WHERE id = ?
  `;

  await executeQuery(query, [
    name,
    department,
    position,
    bio,
    email,
    linkedin_url,
    order_index,
    image_url,
    country,
    country_code,
    id,
  ]);

  return { id, ...updatedData };
};

// DELETE (soft)
const deleteMember = async (id) => {
  const query = `UPDATE team_members SET is_active = FALSE WHERE id = ?`;
  return await executeQuery(query, [id]);
};

module.exports = {
  // Department management
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  
  // Team member management
  create,
  getAll,
  getById,
  getDepartments, // Legacy - gets departments from team members
  getByDepartment,
  getByCountry,
  getCountries,
  update,
  delete: deleteMember,
};
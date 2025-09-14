const { executeQuery } = require('../config/database');

exports.getTestimonialsByProject = async (req, res) => {
  try {
    const result = await executeQuery(
      'SELECT * FROM testimonials WHERE projectId = ? ORDER BY createdAt DESC',
      [req.params.projectId]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTestimonial = async (req, res) => {
  const { name, position, message } = req.body;
  const projectId = req.params.projectId;
  const image = req.file ? req.file.filename : null;

  try {
    await executeQuery(
      'INSERT INTO testimonials (name, position, message, image, projectId) VALUES (?, ?, ?, ?, ?)',
      [name, position, message, image, projectId]
    );
    res.status(201).json({ message: 'Testimonial created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  const { name, position, message } = req.body;
  const id = req.params.id;
  const image = req.file ? req.file.filename : null;

  try {
    const query = image
      ? 'UPDATE testimonials SET name = ?, position = ?, message = ?, image = ? WHERE id = ?'
      : 'UPDATE testimonials SET name = ?, position = ?, message = ? WHERE id = ?';
    const params = image ? [name, position, message, image, id] : [name, position, message, id];

    await executeQuery(query, params);
    res.json({ message: 'Testimonial updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    await executeQuery('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

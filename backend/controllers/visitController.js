const { executeQuery } = require('../config/database');
const geoip = require('geoip-lite'); // npm install geoip-lite

exports.recordVisit = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '0.0.0.0';
  const geo = geoip.lookup(ip);
  const country = geo?.country || 'Unknown';

  try {
    await executeQuery(
      'INSERT INTO visits (ip_address, country) VALUES (?, ?)',
      [ip, country]
    );
    res.status(201).json({ message: 'Visit recorded' });
  } catch (err) {
    console.error('Failed to record visit:', err);
    res.status(500).json({ message: 'Failed to record visit' });
  }
};

exports.getVisitStats = async (req, res) => {
  try {
    const total = await executeQuery('SELECT COUNT(*) AS total FROM visits');
    const countries = await executeQuery(`
      SELECT country, COUNT(*) AS count
      FROM visits
      GROUP BY country
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json({
      total: total[0]?.total || 0,
      topCountries: countries
    });
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

const pool = require('../utils/db');

exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  try {
    // VULN: SQL Injection - the q parameter is concatenated directly into the query.
    const sql = `SELECT id, email, name, bio, role, blocked FROM users WHERE role <> 'admin' AND (email LIKE '%${q || ''}%' OR name LIKE '%${q || ''}%')`;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Search error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

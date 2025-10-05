const pool = require('../utils/db');

exports.updateSettings = async (req, res) => {
  const updates = req.body;
  delete updates.role;
  try {
    // VULN: Mass assignment - spreads arbitrary JSON directly to SQL including sensitive fields like role.
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, req.user.id]);
    res.json({ message: 'Settings updated', applied: updates });
  } catch (err) {
    console.error('Settings error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

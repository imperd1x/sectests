const pool = require('../utils/db');

exports.getUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    // VULN: IDOR - trusts user supplied :id without checking ownership or authorization.
    const [rows] = await pool.query('SELECT id, email, name, bio, role FROM users WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Profile error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;

  try {
    // VULN: IDOR - allows updating any profile by changing :id.
    await pool.query('UPDATE users SET name = ?, bio = ? WHERE id = ?', [name, bio, id]);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Update error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

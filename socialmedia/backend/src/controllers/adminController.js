const pool = require('../utils/db');

exports.setBlockStatus = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const { id } = req.params;
  const { blocked } = req.body;
  try {
    await pool.query('UPDATE users SET blocked = ? WHERE id = ?', [blocked ? 1 : 0, id]);
    res.json({ message: blocked ? 'User blocked' : 'User unblocked' });
  } catch (err) {
    console.error('Set block status error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

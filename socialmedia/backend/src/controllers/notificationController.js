const pool = require('../utils/db');

exports.getNotifications = async (req, res) => {
  const next = req.query.next;
  try {
    const [rows] = await pool.query(
      'SELECT id, message, link, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    // VULN: Open redirect - blindly echoes attacker-controlled next parameter for client-side redirect.
    res.json({ notifications: rows, next });
  } catch (err) {
    console.error('Notifications error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

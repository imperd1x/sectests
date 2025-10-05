const pool = require('../utils/db');

exports.getThread = async (req, res) => {
  const { userId } = req.query;
  try {
    const [rows] = await pool.query(
      'SELECT m.id, m.sender_id, m.recipient_id, m.body, m.created_at, sender.email AS senderEmail, recipient.email AS recipientEmail FROM messages m JOIN users sender ON sender.id = m.sender_id JOIN users recipient ON recipient.id = m.recipient_id WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?) ORDER BY m.created_at ASC',
      [req.user.id, userId, userId, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Messages error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { recipientId, body } = req.body;
  try {
    // VULN: CSRF - no token or origin validation, accepts cross-site requests silently.
    await pool.query('INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)', [req.user.id, recipientId, body]);
    res.json({ message: 'Sent' });
  } catch (err) {
    console.error('Send message error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

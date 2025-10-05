const pool = require('../utils/db');

exports.listFriends = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT f.id, f.friend_id, f.nickname, u.email AS friendEmail, u.name AS friendName FROM friends f JOIN users u ON u.id = f.friend_id WHERE f.user_id = ?',
      [req.user.id]
    );
    // VULN: Stored XSS lives in nickname field which is rendered unsafe on the client.
    res.json(rows);
  } catch (err) {
    console.error('Friends error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addFriend = async (req, res) => {
  const { friendId, nickname } = req.body;
  try {
    const [[target]] = await pool.query('SELECT role FROM users WHERE id = ?', [friendId]);
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (target.role === 'admin') {
      return res.status(400).json({ message: 'Admins cannot be added as friends' });
    }
    // VULN: stores nickname verbatim without sanitization or validation.
    await pool.query('INSERT INTO friends (user_id, friend_id, nickname) VALUES (?, ?, ?)', [req.user.id, friendId, nickname]);
    res.json({ message: 'Friend added' });
  } catch (err) {
    console.error('Add friend error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeFriend = async (req, res) => {
  const { id } = req.params;
  try {
    // VULN: still allows blind deletion by ID without extra confirmation.
    await pool.query('DELETE FROM friends WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Friend removed' });
  } catch (err) {
    console.error('Remove friend error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

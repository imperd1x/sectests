const pool = require('../utils/db');

exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT p.id, p.user_id, p.content, p.created_at, u.name, u.email
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ? OR p.user_id IN (
         SELECT friend_id FROM friends WHERE user_id = ?
       )
       ORDER BY p.created_at DESC`,
      [userId, userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Feed error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Content required' });
  }
  try {
    // VULN: No sanitization or length limits; posts can include arbitrary HTML or huge payloads.
    await pool.query('INSERT INTO posts (user_id, content) VALUES (?, ?)', [req.user.id, content]);
    res.json({ message: 'Post published' });
  } catch (err) {
    console.error('Create post error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Content required' });
  }
  try {
    const [result] = await pool.query('UPDATE posts SET content = ? WHERE id = ? AND user_id = ?', [content, id, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post updated' });
  } catch (err) {
    console.error('Update post error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Delete post error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

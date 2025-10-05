const path = require('path');
const fs = require('fs');
const pool = require('../utils/db');

exports.getPhoto = (req, res) => {
  const { filename } = req.params;
  // VULN: Path traversal - joins user input directly allowing ../../../ to escape uploads directory.
  const filePath = path.join(__dirname, '../../uploads', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: 'Photo not found' });
    }
  });
};

exports.getPhotosByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, filename, description, created_at FROM photos WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List photos error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.publishPhoto = async (req, res) => {
  const { filename, description, data } = req.body;
  if (!filename || !data) {
    return res.status(400).json({ message: 'Filename and data are required' });
  }

  try {
    const filePath = path.join(__dirname, '../../uploads', filename);
    const buffer = Buffer.from(data, 'base64');
    // VULN: No validation on file type, size, or overwrite; arbitrary files can be dropped into uploads.
    fs.writeFileSync(filePath, buffer);
    await pool.query('INSERT INTO photos (user_id, filename, description) VALUES (?, ?, ?)', [req.user.id, filename, description]);
    res.json({ message: 'Photo published', filename });
  } catch (err) {
    console.error('Publish photo error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deletePhoto = async (req, res) => {
  const { id } = req.params;
  try {
    const [[photo]] = await pool.query('SELECT filename FROM photos WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    const filePath = path.join(__dirname, '../../uploads', photo.filename);
    fs.unlink(filePath, () => {});
    await pool.query('DELETE FROM photos WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    console.error('Delete photo error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

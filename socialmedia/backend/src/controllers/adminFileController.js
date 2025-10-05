const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '../../uploads/admin');

const ensureDir = () => {
  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }
};

exports.listFiles = (req, res) => {
  try {
    ensureDir();
    const files = fs.readdirSync(adminDir).map((filename) => {
      const stats = fs.statSync(path.join(adminDir, filename));
      return {
        name: filename,
        size: stats.size,
        modified: stats.mtime
      };
    });
    res.json(files);
  } catch (err) {
    console.error('Admin list files error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.uploadFile = (req, res) => {
  const { filename, data } = req.body;
  if (!filename || !data) {
    return res.status(400).json({ message: 'Filename and data are required' });
  }
  try {
    ensureDir();
    const filePath = path.join(adminDir, filename);
    const buffer = Buffer.from(data, 'base64');
    // VULN: no validation or overwrite checks – admin can drop arbitrary files.
    fs.writeFileSync(filePath, buffer);
    res.json({ message: 'File stored', filename });
  } catch (err) {
    console.error('Admin upload file error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteFile = (req, res) => {
  const { name } = req.params;
  try {
    ensureDir();
    const filePath = path.join(adminDir, name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    fs.unlinkSync(filePath);
    res.json({ message: 'File removed' });
  } catch (err) {
    console.error('Admin delete file error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

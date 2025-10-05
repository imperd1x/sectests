const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const adminFileController = require('../controllers/adminFileController');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.post('/users/:id/block', authMiddleware, adminOnly, adminController.setBlockStatus);
router.get('/files', authMiddleware, adminOnly, adminFileController.listFiles);
router.post('/files/upload', authMiddleware, adminOnly, adminFileController.uploadFile);
router.delete('/files/:name', authMiddleware, adminOnly, adminFileController.deleteFile);

module.exports = router;

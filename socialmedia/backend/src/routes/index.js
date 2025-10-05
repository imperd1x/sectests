const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/friends', require('./friendRoutes'));
router.use('/messages', require('./messageRoutes'));
router.use('/search', require('./searchRoutes'));
router.use('/photos', require('./photoRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/settings', require('./settingsRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;

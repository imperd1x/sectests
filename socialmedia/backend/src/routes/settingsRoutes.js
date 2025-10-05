const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

router.post('/update', authMiddleware, settingsController.updateSettings);

module.exports = router;

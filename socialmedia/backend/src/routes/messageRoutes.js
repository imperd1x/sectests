const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.get('/', authMiddleware, messageController.getThread);
router.post('/send', authMiddleware, messageController.sendMessage);

module.exports = router;

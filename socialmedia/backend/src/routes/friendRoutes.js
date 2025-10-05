const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const friendController = require('../controllers/friendController');

router.get('/', authMiddleware, friendController.listFriends);
router.post('/add', authMiddleware, friendController.addFriend);
router.delete('/:id', authMiddleware, friendController.removeFriend);

module.exports = router;

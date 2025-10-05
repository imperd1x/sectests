const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const photoController = require('../controllers/photoController');

router.get('/user/:userId', authMiddleware, photoController.getPhotosByUser);
router.post('/publish', authMiddleware, photoController.publishPhoto);
router.delete('/item/:id', authMiddleware, photoController.deletePhoto);
router.get('/:filename', authMiddleware, photoController.getPhoto);

module.exports = router;

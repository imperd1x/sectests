const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const searchController = require('../controllers/searchController');

router.get('/', authMiddleware, searchController.searchUsers);

module.exports = router;

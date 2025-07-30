const express = require('express');
const { createRoom, joinRoom } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware, createRoom);
router.post('/join', authMiddleware, joinRoom);

module.exports = router;

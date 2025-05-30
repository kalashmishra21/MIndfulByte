const express = require('express');
const router = express.Router();
const { validateByteData } = require('../middleware/validation');
const {
  createByte,
  getTodayByte,
  getAllBytes,
  getByteById,
} = require('../controllers/byteControllers');

// Create a new byte
router.post('/', validateByteData, createByte);

// Get today's byte
router.get('/today', getTodayByte);

// Get all bytes
router.get('/', getAllBytes);

// Get byte by ID
router.get('/:id', getByteById);

module.exports = router;

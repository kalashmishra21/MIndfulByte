const asyncHandler = require('express-async-handler');
const Byte = require('../models/Byte');

// @desc    Create a new byte
// @route   POST /api/byte
// @access  Public
const createByte = asyncHandler(async (req, res) => {
  const byte = await Byte.create(req.body);
  res.status(201).json({
    success: true,
    data: byte,
  });
});

// @desc    Get today's byte
// @route   GET /api/byte/today
// @access  Public
const getTodayByte = asyncHandler(async (req, res) => {
  // Get today's date (start and end)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find byte published today
  const byte = await Byte.findOne({
    datePublished: {
      $gte: today,
      $lt: tomorrow,
    },
  }).sort({ datePublished: -1 });

  if (!byte) {
    // If no byte for today, get the most recent one
    const latestByte = await Byte.findOne().sort({ datePublished: -1 });
    
    if (!latestByte) {
      res.status(404);
      throw new Error('No bytes found');
    }
    
    return res.status(200).json({
      success: true,
      data: latestByte,
      message: 'No byte for today, showing the most recent one',
    });
  }

  res.status(200).json({
    success: true,
    data: byte,
  });
});

// @desc    Get all bytes
// @route   GET /api/byte
// @access  Public
const getAllBytes = asyncHandler(async (req, res) => {
  // Extract query parameters
  const { category, tag, chunkCount = 1 } = req.query;
  
  // Set fixed page size
  const pageSize = 6;
  const page = Math.max(1, parseInt(chunkCount));
  
  // Build filter object
  const filter = {};
  
  // Add category filter with partial matching if provided
  if (category) {
    // Use regex for case-insensitive partial matching
    filter.category = { $regex: category, $options: 'i' };
  }
  
  // Add tag filter with partial matching if provided
  if (tag) {
    // Use regex for case-insensitive partial matching in array field
    filter.tags = { $elemMatch: { $regex: tag, $options: 'i' } };
  }
  
  // Count total matching documents
  const totalCount = await Byte.countDocuments(filter);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Fetch paginated and filtered data
  const bytes = await Byte.find(filter)
    .sort({ datePublished: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);
    
  // Get all categories (regardless of current filter)
  const allCategories = await Byte.distinct('category');
  
  // Get all tags (optional, might be useful for tag filtering too)
  const allTags = await Byte.distinct('tags');

  res.status(200).json({
    success: true,
    data: bytes,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize
    },
    metadata: {
      categories: allCategories,
      tags: allTags
    }
  });
});

// @desc    Get byte by ID
// @route   GET /api/byte/:id
// @access  Public
const getByteById = asyncHandler(async (req, res) => {
  const byte = await Byte.findById(req.params.id);

  if (!byte) {
    res.status(404);
    throw new Error(`Byte not found with id: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: byte,
  });
});

module.exports = {
  createByte,
  getTodayByte,
  getAllBytes,
  getByteById,
};
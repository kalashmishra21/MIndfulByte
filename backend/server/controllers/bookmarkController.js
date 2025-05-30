const Bookmark = require('../models/Bookmark');
const Byte = require('../models/Byte');
const asyncHandler = require('express-async-handler');

// Add a bookmark
exports.addBookmark = asyncHandler(async (req, res) => {
  const { byteId } = req.body;
  const userId = req.user._id;

  // Check if byte exists
  const byte = await Byte.findById(byteId);
  if (!byte) {
    res.status(404);
    throw new Error('Byte not found');
  }

  // Check if already bookmarked
  const existingBookmark = await Bookmark.findOne({ user: userId, byte: byteId });
  if (existingBookmark) {
    res.status(400);
    throw new Error('Byte already bookmarked');
  }

  // Create new bookmark
  const bookmark = await Bookmark.create({
    user: userId,
    byte: byteId
  });

  const populatedBookmark = await Bookmark.findById(bookmark._id)
    .populate('byte');

  res.status(201).json({
    success: true,
    data: populatedBookmark
  });
});

// Remove a bookmark
exports.removeBookmark = asyncHandler(async (req, res) => {
  const { byteId } = req.params;
  const userId = req.user._id;

  const bookmark = await Bookmark.findOneAndDelete({ 
    user: userId, 
    byte: byteId 
  });
  
  if (!bookmark) {
    res.status(404);
    throw new Error('Bookmark not found');
  }

  res.json({
    success: true,
    message: 'Bookmark removed successfully'
  });
});

// Get user's bookmarks
exports.getUserBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookmarks = await Bookmark.find({ user: userId })
    .populate('byte')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: bookmarks
  });
});

// Check if byte is bookmarked
exports.isBookmarked = asyncHandler(async (req, res) => {
  const { byteId } = req.params;
  const userId = req.user._id;

  const bookmark = await Bookmark.findOne({ user: userId, byte: byteId });
  
  res.json({
    success: true,
    isBookmarked: !!bookmark
  });
});

const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  byte: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Byte',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure a user can only bookmark a byte once
bookmarkSchema.index({ user: 1, byte: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized, no token' });
  if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Authentication is not configured' });
  let decoded;
  try { decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET); }
  catch { return res.status(401).json({ message: 'Not authorized, invalid or expired token' }); }
  if (typeof decoded.id !== 'string' || !/^[a-f0-9]{24}$/i.test(decoded.id)) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
  const user = await User.findById(decoded.id).select('-password');
  if (!user) return res.status(401).json({ message: 'Not authorized, user not found' });
  req.user = user;
  next();
});
module.exports = { protect };

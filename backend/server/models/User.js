const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [25, 'First name cannot be more than 25 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [25, 'Last name cannot be more than 25 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [15, 'Phone number cannot be more than 15 characters']
  },
  password: {
    type: String,
    select: false
  },
  profilePicture: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=0D8ABC&color=fff`;
    }
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=0D8ABC&color=fff`;
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  googleId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

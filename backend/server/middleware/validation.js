// Custom validation middleware for request data
const validateByteData = (req, res, next) => {
  const { title, summary, example, category, quiz } = req.body;

  // Check required fields
  if (!title || !summary || !example || !category || !quiz) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate summary length
  if (summary.length < 100 || summary.length > 200) {
    res.status(400);
    throw new Error('Summary must be between 100 and 200 characters');
  }

  // Validate example length
  if (example.length < 100 || example.length > 200) {
    res.status(400);
    throw new Error('Example must be between 100 and 200 characters');
  }

  // Validate quiz
  if (!quiz.question || !quiz.options || !quiz.correctAnswer) {
    res.status(400);
    throw new Error('Quiz must include question, options, and correctAnswer');
  }

  // Validate quiz options
  if (!Array.isArray(quiz.options) || quiz.options.length < 2 || quiz.options.length > 4) {
    res.status(400);
    throw new Error('Quiz must have between 2 and 4 options');
  }

  // Validate correct answer is in options
  if (!quiz.options.includes(quiz.correctAnswer)) {
    res.status(400);
    throw new Error('Correct answer must be one of the options');
  }

  next();
};

// User registration validation middleware
const validateUserRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if all required fields are present
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate names
  if (firstName.length < 2 || firstName.length > 25) {
    res.status(400);
    throw new Error('First name must be between 2 and 25 characters');
  }

  if (lastName.length < 2 || lastName.length > 25) {
    res.status(400);
    throw new Error('Last name must be between 2 and 25 characters');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  // Validate password strength
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  // Validate name fields
  if (!firstName || firstName.trim().length === 0) {
    res.status(400);
    throw new Error('First name is required');
  }

  next();
};

// Export both validation middlewares
module.exports = {
  validateByteData,
  validateUserRegistration
};

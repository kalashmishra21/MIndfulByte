const errorHandler = (err, req, res, next) => {
  let status = err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message;
  if (err.code === 11000) { status = 409; message = 'An account or record already exists'; }
  if (err.name === 'ValidationError' || err.name === 'CastError') { status = 400; }
  if (['MongoServerSelectionError', 'MongoNetworkError', 'MongoNetworkTimeoutError'].includes(err.name)) {
    status = 503; message = 'Database temporarily unavailable. Please retry shortly.';
  }
  res.status(status).json({ message: status >= 500 && status !== 503 ? 'Server error. Please try again.' : message });
};
module.exports = errorHandler;

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for dev
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    return res.status(404).json({ success: false, message: error.message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate value entered for ${field}`;
    return res.status(400).json({ success: false, message: error.message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error.message = messages.join(', ');
    return res.status(400).json({ success: false, message: error.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json({ success: false, message: error.message });
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json({ success: false, message: error.message });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

export default errorHandler;

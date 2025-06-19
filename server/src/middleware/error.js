const mongoose = require('mongoose');
const logger = require('../config/logger');
const config = require('../config/config');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error converter middleware
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 
                       (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  
  next(error);
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (config.env === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }
  
  res.locals.errorMessage = err.message;
  
  const response = {
    status: 'error',
    statusCode,
    message,
    ...(config.env === 'development' && {
      stack: err.stack,
    }),
  };
  
  if (config.env === 'development') {
    logger.error(err);
  }
  
  res.status(statusCode).json(response);
};

module.exports = {
  ApiError,
  errorConverter,
  errorHandler,
};
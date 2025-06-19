const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ApiError } = require('../middleware/error');
const config = require('../config/config');
const logger = require('../config/logger');

/**
 * Generate JWT token
 * @param {ObjectId} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (config.jwt.accessExpirationMinutes * 60),
  };
  
  return jwt.sign(payload, config.jwt.secret);
};

/**
 * Generate refresh token
 * @param {ObjectId} userId - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (config.jwt.refreshExpirationDays * 24 * 60 * 60),
    type: 'refresh',
  };
  
  return jwt.sign(payload, config.jwt.secret);
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      throw new ApiError(400, 'Email already taken');
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });
    
    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Remove password from response
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    res.status(201).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password provided
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(401, 'Incorrect email or password');
    }
    
    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Remove password from response
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    
    if (!decoded || decoded.type !== 'refresh') {
      throw new ApiError(401, 'Invalid refresh token');
    }
    
    // Find user
    const user = await User.findById(decoded.sub);
    
    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    
    // Generate new access token
    const token = generateToken(user._id);
    
    res.status(200).json({
      status: 'success',
      data: {
        token,
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Invalid or expired refresh token'));
    } else {
      next(error);
    }
  }
};

/**
 * Forgot password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({
        status: 'success',
        message: 'If your email is registered, you will receive a password reset link',
      });
    }
    
    // TODO: Generate reset token and send email
    logger.info(`Reset password for user: ${user._id}`);
    
    res.status(200).json({
      status: 'success',
      message: 'If your email is registered, you will receive a password reset link',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      throw new ApiError(400, 'Token and password are required');
    }
    
    // TODO: Verify token and reset password
    logger.info('Reset password with token');
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      throw new ApiError(400, 'Token is required');
    }
    
    // TODO: Verify email with token
    logger.info('Verify email with token');
    
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send verification email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendVerificationEmail = async (req, res, next) => {
  try {
    const user = req.user;
    
    // TODO: Send verification email
    logger.info(`Send verification email to user: ${user._id}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Verification email sent',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMe = (req, res) => {
  // Remove password from response
  const userWithoutPassword = { ...req.user.toObject() };
  delete userWithoutPassword.password;
  
  res.status(200).json({
    status: 'success',
    data: {
      user: userWithoutPassword,
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  getMe,
};
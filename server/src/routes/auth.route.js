const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Import auth controller (to be implemented)
const authController = require('../controllers/auth.controller');

// Register a new user
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', auth, authController.logout);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Verify email
router.post('/verify-email', authController.verifyEmail);

// Resend verification email
router.post('/send-verification-email', auth, authController.sendVerificationEmail);

// Get current user
router.get('/me', auth, authController.getMe);

module.exports = router;
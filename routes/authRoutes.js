const express = require('express');
const authController = require('../controller/authController');
const {protect} = require('../middleware/auth')

const router = express.Router();

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get Me
router.get('/me', protect, authController.getMe);

// Forgot password
router.post('/forgotpassword', authController.forgotPassword);

// Reset password
router.put('/resetpassword/:resettoken', authController.resetPassword);

// Update Me
router.put('/updateme', protect, authController.updateMe);

// Update password
router.put('/updatepassword', protect, authController.updatePassword);

// Logout
router.get('/logout', authController.logout);


module.exports = router;
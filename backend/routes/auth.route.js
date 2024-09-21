import express from 'express';
import {
  login,
  logout,
  signup,
  checkAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Private Routes
router.get('/check-auth', verifyToken, checkAuth);

// Public Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;

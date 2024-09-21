import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../mailtrap/emails.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';

// @desc    Register User & Send Verify Email
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name)
      throw new Error('All fields are required');

    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });

    const hashPassword = await bcryptjs.hash(password, 10);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      name,
      email,
      password: hashPassword,
      verificationToken: verifyCode,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verifyCode);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Verify Email & Send Welcome Email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code',
      });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login User & Set Token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout User & Clear Token
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Forgot Password & Send Password Reset Email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password & Send Reset Success Email
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired reset token' });

    const hashPassword = await bcryptjs.hash(password, 10);

    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Check User Auth Status
// @route   GET /api/auth/check-auth
// @access  Private
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

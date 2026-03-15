import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { addToBlacklist } from '../utils/tokenBlacklist.js';

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    const user = await User.create({ username, email, password });

    // Remove password from output
    user.password = undefined;

    res.status(201).json({ status: 'success', data: { user } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email, isDeleted: false }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      // Artificial delay on failure to slow brute-force attacks
      await new Promise((r) => setTimeout(r, 2000));
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = signToken(user);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    user.password = undefined;

    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/logout
export const logout = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    addToBlacklist(token);
  }

  res.clearCookie('jwt');
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};

// PATCH /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide currentPassword and newPassword' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must differ from current password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    // Fetch with password field (excluded by default)
    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.correctPassword(currentPassword))) {
      await new Promise((r) => setTimeout(r, 2000));
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Assign triggers pre-save hook: hashes password + sets passwordChangedAt
    user.password = newPassword;
    await user.save();

    // Blacklist the current token — forces re-login on all other sessions
    const oldToken = req.cookies.jwt;
    if (oldToken) {
      addToBlacklist(oldToken);
    }

    // Issue a fresh token for the current session
    const token = signToken(user);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ status: 'success', message: 'Password changed successfully. Other sessions have been invalidated.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

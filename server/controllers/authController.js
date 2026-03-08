const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { addToBlacklist } = require('../utils/tokenBlacklist');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
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
exports.login = async (req, res, next) => {
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
exports.logout = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    addToBlacklist(token);
  }

  res.clearCookie('jwt');
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};

import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { isBlacklisted } from '../utils/tokenBlacklist.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Extract token from cookie or Authorization header
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'You are not logged in' });
    }

    // 2. Check if token is blacklisted
    if (isBlacklisted(token)) {
      return res.status(401).json({ message: 'Token has been invalidated. Please log in again.' });
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired. Please log in again.' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }

    // 4. Check if user still exists and is not deleted
    const user = await User.findOne({ _id: decoded.id, isDeleted: false });
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // 5. Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: 'Password recently changed. Please log in again.' });
    }

    // 6. Grant access
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Admin implicitly passes all role checks
    if (req.user.role === 'admin') return next();

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    next();
  };
};

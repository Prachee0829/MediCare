import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Middleware to protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      return next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  res.status(401);
  throw new Error('Not authorized, no token');
});

// Middleware to check if user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role.toLowerCase() === 'admin') {
    return next();
  }

  res.status(403);
  throw new Error('Not authorized as an admin');
};

// Middleware to check if user is doctor
export const doctor = (req, res, next) => {
  if (req.user && req.user.role.toLowerCase() === 'doctor') {
    return next();
  }

  res.status(403);
  throw new Error('Not authorized as a doctor');
};

// Middleware to check if user is doctor or admin
export const doctorOrAdmin = (req, res, next) => {
  if (
    req.user &&
    ['doctor', 'admin'].includes(req.user.role.toLowerCase())
  ) {
    return next();
  }

  res.status(403);
  throw new Error('Not authorized');
};

// Middleware to check if user is doctor or admin (alias for doctorOrAdmin)
export const doctorAdmin = doctorOrAdmin;

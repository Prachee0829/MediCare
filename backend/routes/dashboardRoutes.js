import express from 'express';
import {
  getDashboardStats,
  getMonthlyData,
  getSpecializationData,
} from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📊 Dashboard Stats (accessible to all authenticated users)
router.get('/stats', protect, getDashboardStats);

// 📈 Monthly Chart Data (role-specific: admin/doctor/patient)
router.get('/monthly-data', protect, getMonthlyData);

// 📍 Doctor Specializations Summary (Admin only)
router.get('/specialization-data', protect, admin, getSpecializationData);

export default router;

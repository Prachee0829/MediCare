import express from 'express';
import {
  getRevenueData,
  getPatientData,
  getDepartmentRevenue,
  getAppointmentsByType,
  getOverviewReport,
} from '../controllers/reportController.js';
import { protect, admin, doctorOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📊 Revenue data (admin only)
router.get('/revenue', protect, admin, getRevenueData);

// 👨‍👩‍👧‍👦 Patient data (admin and doctors)
router.get('/patients', protect, doctorOrAdmin, getPatientData);

// 🏥 Department revenue (admin only)
router.get('/department-revenue', protect, admin, getDepartmentRevenue);

// 📅 Appointments by type (admin and doctors)
router.get('/appointments-by-type', protect, doctorOrAdmin, getAppointmentsByType);

// 📈 Overview report (admin only)
router.get('/overview', protect, admin, getOverviewReport);

export default router;
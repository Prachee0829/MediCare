import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  getDoctorAvailability,
} from '../controllers/appointmentController.js';
import { protect, admin, doctor } from '../middleware/authMiddleware.js';

const router = express.Router();

// ⏰ Doctor availability (must be placed before '/:id')
router.get('/doctor/:id/availability', protect, getDoctorAvailability);

// 📅 All appointments (GET: by role, POST: patient creates)
router.route('/')
  .post(protect, createAppointment)
  .get(protect, getAppointments);

// ✅ Update appointment status (by doctor/patient)
router.put('/:id/status', protect, updateAppointmentStatus);

// 🔍 Appointment by ID (GET, PUT, DELETE)
router.route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, doctor, updateAppointment)
  .delete(protect, admin, deleteAppointment);

export default router;

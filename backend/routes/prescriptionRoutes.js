import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
} from '../controllers/prescriptionController.js';
import { protect, admin, doctor, doctorOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📋 Create a prescription / Get all prescriptions
router.route('/')
  .post(protect, doctor, createPrescription)     // Doctor: Create new
  .get(protect, getPrescriptions);               // All roles: Get own prescriptions

// 🧑‍⚕️ Get prescriptions of a specific patient (doctor/admin only)
router.get('/patient/:id', protect, doctorOrAdmin, getPatientPrescriptions);

// 🔍 View / Update / Delete prescription by ID
router.route('/:id')
  .get(protect, getPrescriptionById)             // Doctor/Admin/Patient (if authorized)
  .put(protect, doctor, updatePrescription)      // Doctor only
  .delete(protect, admin, deletePrescription);   // Admin only

// 🔄 Update prescription status
router.put('/:id/status', protect, doctorOrAdmin, updatePrescriptionStatus);

export default router;

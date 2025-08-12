import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveUser,
  getDoctors,
  getPatients,
  getPatientDetails,
  getPendingApprovalUsers,
  getPharmacists,
} from '../controllers/userController.js';
import { protect, admin, doctorOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🧑‍⚕️ Get all approved doctors (patients/doctors/admin)
router.get('/doctors', protect, getDoctors);

// 💊 Get all pharmacists (admin only)
router.get('/pharmacists', protect, admin, getPharmacists);

// ⏳ Get all pending approval users (admin only)
router.get('/pending-approval', protect, admin, getPendingApprovalUsers);

// 👨‍👩‍👧‍👦 Get all patients (doctors/admin only)
router.get('/patients', protect, doctorOrAdmin, getPatients);

// 🩺 Get patient details with medical information (doctors/admin only)
router.get('/patient/:id/details', protect, doctorOrAdmin, getPatientDetails);

// ✅ Admin: Get all users
router.get('/', protect, admin, getUsers);

// ✅ Admin: Approve doctor
router.put('/:id/approve', protect, admin, approveUser);

// 🔍 Get / Update / Delete specific user (admin-only for update/delete)
router.route('/:id')
  .get(protect, doctorOrAdmin, getUserById)   // Admin & Doctor can view
  .put(protect, admin, updateUser)           // Admin only
  .delete(protect, admin, deleteUser);       // Admin only

export default router;

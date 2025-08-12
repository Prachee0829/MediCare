import express from 'express';
import {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getPatientMedicalRecords,
} from '../controllers/medicalRecordController.js';
import { protect, doctorAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for patients to access their own medical records
// This must be defined BEFORE the '/patient/:id' route to avoid route conflicts
router.route('/patient/me').get(protect, (req, res, next) => {
  // For patient/me route, directly handle the request here instead of using middleware
  // This ensures we don't have path detection issues
  console.log('Processing /patient/me route');
  
  // Set patientId to the current user and call the controller function
  // No need to check role here as the controller will handle it
  req.patientId = req.user._id;
  console.log('Set req.patientId in route handler:', req.patientId);
  return getPatientMedicalRecords(req, res);
});

router
  .route('/')
  .post(protect, doctorAdmin, createMedicalRecord)
  .get(protect, doctorAdmin, getMedicalRecords);

router
  .route('/:id')
  .get(protect, doctorAdmin, getMedicalRecordById)
  .put(protect, doctorAdmin, updateMedicalRecord)
  .delete(protect, doctorAdmin, deleteMedicalRecord);

router.route('/patient/:id').get(protect, doctorAdmin, getPatientMedicalRecords);

export default router;
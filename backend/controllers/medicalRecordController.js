import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import MedicalRecord from '../models/medicalRecordModel.js';
import User from '../models/userModel.js';

// @desc    Create new medical record
// @route   POST /api/medical-records
// @access  Private/Doctor
export const createMedicalRecord = asyncHandler(async (req, res) => {
  const {
    patient,
    visitType,
    vitalSigns,
    diagnosis,
    treatment,
    notes,
    appointment,
    bloodType,
  } = req.body;

  if (!patient || !visitType) {
    res.status(400);
    throw new Error('Patient and visit type are required');
  }

  const patientExists = await User.findOne({ _id: patient, role: 'patient' });
  if (!patientExists) {
    res.status(400);
    throw new Error('Patient not found');
  }

  const medicalRecord = await MedicalRecord.create({
    patient,
    doctor: req.user._id,
    visitType,
    vitalSigns,
    diagnosis,
    treatment,
    notes,
    appointment,
    bloodType,
    date: new Date(),
  });

  res.status(201).json(medicalRecord);
});

// @desc    Get all medical records
// @route   GET /api/medical-records
// @access  Private/Doctor or Admin
export const getMedicalRecords = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  let medicalRecords;

  if (req.user.role === 'admin') {
    medicalRecords = await MedicalRecord.find({})
      .populate('patient', 'name email dateOfBirth gender')
      .populate('doctor', 'name specialization');
  } else {
    medicalRecords = await MedicalRecord.find({ doctor: req.user._id })
      .populate('patient', 'name email dateOfBirth gender')
      .populate('doctor', 'name specialization');
  }

  res.json(medicalRecords);
});

// @desc    Get medical record by ID
// @route   GET /api/medical-records/:id
// @access  Private/Doctor or Admin
export const getMedicalRecordById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid medical record ID');
  }

  const medicalRecord = await MedicalRecord.findById(req.params.id)
    .populate('patient', 'name email dateOfBirth gender address phone')
    .populate('doctor', 'name specialization');

  if (medicalRecord) {
    const isDoctor = medicalRecord.doctor._id.toString() === req.user._id.toString();

    if (req.user.role === 'admin' || isDoctor) {
      res.json(medicalRecord);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this medical record');
    }
  } else {
    res.status(404);
    throw new Error('Medical record not found');
  }
});

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private/Doctor
export const updateMedicalRecord = asyncHandler(async (req, res) => {
  const {
    visitType,
    vitalSigns,
    diagnosis,
    treatment,
    notes,
    bloodType,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid medical record ID');
  }

  const medicalRecord = await MedicalRecord.findById(req.params.id);

  if (medicalRecord) {
    if (medicalRecord.doctor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this medical record');
    }

    medicalRecord.visitType = visitType || medicalRecord.visitType;
    medicalRecord.vitalSigns = vitalSigns || medicalRecord.vitalSigns;
    medicalRecord.diagnosis = diagnosis || medicalRecord.diagnosis;
    medicalRecord.treatment = treatment || medicalRecord.treatment;
    medicalRecord.notes = notes || medicalRecord.notes;
    medicalRecord.bloodType = bloodType || medicalRecord.bloodType;

    const updated = await medicalRecord.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Medical record not found');
  }
});

// @desc    Delete medical record
// @route   DELETE /api/medical-records/:id
// @access  Private/Admin
export const deleteMedicalRecord = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid medical record ID');
  }

  const medicalRecord = await MedicalRecord.findById(req.params.id);

  if (medicalRecord) {
    await medicalRecord.deleteOne();
    res.json({ message: 'Medical record removed' });
  } else {
    res.status(404);
    throw new Error('Medical record not found');
  }
});

// @desc    Get patient medical records
// @route   GET /api/medical-records/patient/:id or /api/medical-records/patient/me
// @access  Private/Doctor or Admin for /:id, Private for /me
export const getPatientMedicalRecords = asyncHandler(async (req, res) => {
  let patientId;
  
  // Add debugging logs to see what's happening with the request path
  console.log('Request path:', req.path);
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
  console.log('User role:', req.user.role);
  console.log('patientId from route handler:', req.patientId);
  
  // For patient users, always allow access to their own records
  if (req.user.role === 'patient') {
    console.log('Patient user accessing their own records');
    patientId = req.user._id;
    console.log('Setting patientId to patient user ID:', patientId);
  }
  // Priority 1: Check if patientId was set by the route handler (for /patient/me route)
  else if (req.patientId) {
    console.log('Using patientId set by route handler:', req.patientId);
    patientId = req.patientId;
  }
  // Priority 2: Check if this is a patient accessing their own records via the /patient/me route
  else if (req.path === '/patient/me' || 
    req.originalUrl.endsWith('/patient/me') || 
    req.originalUrl.includes('/patient/me') || 
    (req.baseUrl && req.path && (req.baseUrl + req.path).includes('/patient/me')) ||
    (req.originalUrl && req.originalUrl.match(/\/patient\/me($|\?|#)/))) {
    // This should be unreachable now since we check user role first, but keeping as a fallback
    console.log('Detected /patient/me route through URL pattern matching');
    if (req.user.role !== 'patient') {
      res.status(403);
      throw new Error('Not authorized, only patients can access their own records');
    }
    patientId = req.user._id;
    console.log('Setting patientId to user ID:', patientId);
  } 
  // Priority 3: Doctor or admin accessing a patient's records
  else {
    // Doctor or admin accessing a patient's records
    console.log('Doctor/Admin accessing patient records');
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized, only doctors and admins can access patient records');
    }

    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid patient ID');
      }

      const patientExists = await User.findOne({ _id: req.params.id, role: 'patient' });
      if (!patientExists) {
        res.status(400);
        throw new Error('Patient not found');
      }
      
      patientId = req.params.id;
      console.log('Doctor/Admin accessing records for patient ID:', patientId);
    } catch (error) {
      console.error('Error validating patient:', error);
      res.status(400);
      throw new Error(`Error validating patient: ${error.message}`);
    }
  }

  try {
    console.log('Fetching medical records for patientId:', patientId);
    
    if (!patientId) {
      console.error('Patient ID is missing');
      res.status(400);
      throw new Error('Patient ID is required');
    }
    
    // Validate that patientId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      console.error('Invalid patient ID format:', patientId);
      res.status(400);
      throw new Error('Invalid patient ID format');
    }
    
    const medicalRecords = await MedicalRecord.find({ patient: patientId })
      .populate('patient', 'name email dateOfBirth gender address phone')
      .populate('doctor', 'name specialization')
      .populate({
        path: 'prescriptions',
        populate: {
          path: 'doctor',
          select: 'name specialization'
        }
      });

    console.log(`Found ${medicalRecords.length} medical records for patient ${patientId}`);
    
    // Return the medical records
    res.json(medicalRecords);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500);
    throw new Error('Failed to fetch medical records: ' + error.message);
  }
});
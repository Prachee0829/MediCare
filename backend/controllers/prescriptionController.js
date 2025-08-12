import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Prescription from '../models/prescriptionModel.js';
import User from '../models/userModel.js';
import MedicalRecord from '../models/medicalRecordModel.js';

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
export const createPrescription = asyncHandler(async (req, res) => {
  const { patient, medications, expiryDate, notes, appointment } = req.body;

  if (!patient || !medications || medications.length === 0) {
    res.status(400);
    throw new Error('Patient and medications are required');
  }

  const patientExists = await User.findOne({ _id: patient, role: 'patient' });
  if (!patientExists) {
    res.status(400);
    throw new Error('Patient not found');
  }

  const prescription = await Prescription.create({
    patient,
    doctor: req.user._id,
    medications,
    expiryDate,
    notes,
    appointment,
    date: new Date(),
    status: 'active',
  });

  // Link prescription to patient's medical record if appointment is provided
  if (appointment) {
    // Find the medical record associated with this appointment
    const medicalRecord = await MedicalRecord.findOne({ appointment });
    if (medicalRecord) {
      // Add prescription to the medical record
      if (!medicalRecord.prescriptions) {
        medicalRecord.prescriptions = [];
      }
      medicalRecord.prescriptions.push(prescription._id);
      await medicalRecord.save();
      console.log(`Prescription ${prescription._id} linked to medical record ${medicalRecord._id}`);
    }
  } else {
    // If no appointment, try to find the most recent medical record for this patient
    const latestMedicalRecord = await MedicalRecord.findOne({ 
      patient, 
      doctor: req.user._id 
    }).sort({ date: -1 });
    
    if (latestMedicalRecord) {
      // Add prescription to the medical record
      if (!latestMedicalRecord.prescriptions) {
        latestMedicalRecord.prescriptions = [];
      }
      latestMedicalRecord.prescriptions.push(prescription._id);
      await latestMedicalRecord.save();
      console.log(`Prescription ${prescription._id} linked to latest medical record ${latestMedicalRecord._id}`);
    }
  }

  res.status(201).json(prescription);
});

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = asyncHandler(async (req, res) => {
  let prescriptions;

  if (req.user.role === 'admin') {
    prescriptions = await Prescription.find({})
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
  } else if (req.user.role === 'doctor') {
    prescriptions = await Prescription.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
  } else if (req.user.role === 'patient') {
    // Patients can only see their own prescriptions
    prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
  } else {
    // For other roles like pharmacist
    prescriptions = await Prescription.find({})
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
  }

  res.json(prescriptions);
});

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid prescription ID');
  }

  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'name email')
    .populate('doctor', 'name specialization');

  if (prescription) {
    const isDoctor = prescription.doctor.toString() === req.user._id.toString();
    const isPatient = prescription.patient._id.toString() === req.user._id.toString();

    if (req.user.role === 'admin' || isDoctor || isPatient) {
      res.json(prescription);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this prescription');
    }
  } else {
    res.status(404);
    throw new Error('Prescription not found');
  }
});

// @desc    Update prescription status
// @route   PUT /api/prescriptions/:id/status
// @access  Private/Doctor or Admin
export const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid prescription ID');
  }

  const prescription = await Prescription.findById(req.params.id);

  if (prescription) {
    const isDoctor = prescription.doctor.toString() === req.user._id.toString();

    if (req.user.role === 'admin' || isDoctor) {
      prescription.status = status;
      const updated = await prescription.save();
      res.json(updated);
    } else {
      res.status(403);
      throw new Error('Not authorized to update this prescription');
    }
  } else {
    res.status(404);
    throw new Error('Prescription not found');
  }
});

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private/Doctor
export const updatePrescription = asyncHandler(async (req, res) => {
  const { medications, expiryDate, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid prescription ID');
  }

  const prescription = await Prescription.findById(req.params.id);

  if (prescription) {
    if (prescription.doctor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this prescription');
    }

    prescription.medications = medications || prescription.medications;
    prescription.expiryDate = expiryDate || prescription.expiryDate;
    prescription.notes = notes || prescription.notes;

    const updated = await prescription.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Prescription not found');
  }
});

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private/Admin
export const deletePrescription = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid prescription ID');
  }

  const prescription = await Prescription.findById(req.params.id);

  if (prescription) {
    await prescription.deleteOne();
    res.json({ message: 'Prescription removed' });
  } else {
    res.status(404);
    throw new Error('Prescription not found');
  }
});

// @desc    Get patient prescriptions by ID
// @route   GET /api/prescriptions/patient/:id
// @access  Private/Doctor or Admin
export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid patient ID');
  }

  const prescriptions = await Prescription.find({ patient: req.params.id })
    .populate('patient', 'name email')
    .populate('doctor', 'name specialization');

  res.json(prescriptions);
});

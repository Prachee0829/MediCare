import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }

  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.specialization = req.body.specialization || user.specialization;
    user.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : user.isApproved;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.gender = req.body.gender || user.gender;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      specialization: updatedUser.specialization,
      isApproved: updatedUser.isApproved,
      phone: updatedUser.phone,
      address: updatedUser.address,
      dateOfBirth: updatedUser.dateOfBirth,
      gender: updatedUser.gender,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    // Optional: Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot delete your own account');
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Approve doctor account
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
export const approveUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'doctor' && user.role !== 'pharmacist') {
    res.status(400);
    throw new Error('Only doctors and pharmacists can be approved by admin');
  }

  user.isApproved = true;
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    specialization: updatedUser.specialization,
    isApproved: updatedUser.isApproved,
  });
});

// @desc    Get all approved doctors
// @route   GET /api/users/doctors
// @access  Private
export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: 'doctor', isApproved: true }).select('-password');
  res.json(doctors);
});

// @desc    Get all pending approval users (doctors and pharmacists)
// @route   GET /api/users/pending-approval
// @access  Private/Admin
export const getPendingApprovalUsers = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({
    role: { $in: ['doctor', 'pharmacist'] },
    isApproved: false
  }).select('-password');
  res.json(pendingUsers);
});

// @desc    Get all pharmacists
// @route   GET /api/users/pharmacists
// @access  Private/Admin
export const getPharmacists = asyncHandler(async (req, res) => {
  const pharmacists = await User.find({ role: 'pharmacist' }).select('-password');
  res.json(pharmacists);
});

// @desc    Get all patients
// @route   GET /api/users/patients
// @access  Private/DoctorOrAdmin
export const getPatients = asyncHandler(async (req, res) => {
  const patients = await User.find({ role: 'patient' }).select('-password');
  res.json(patients);
});

// @desc    Get patient details with medical information
// @route   GET /api/users/patient/:id/details
// @access  Private/DoctorOrAdmin
export const getPatientDetails = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid patient ID');
  }

  const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).select('-password');

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Get patient's appointments with diagnosis and symptoms
  const appointments = await mongoose.model('Appointment').find({ patient: req.params.id })
    .select('date time status type notes symptoms diagnosis followUpDate')
    .sort({ date: -1 });

  // Get patient's prescriptions
  const prescriptions = await mongoose.model('Prescription').find({ patient: req.params.id })
    .select('date expiryDate medications status notes')
    .sort({ date: -1 });

  // Get patient's medical records if they exist
  let medicalRecords = [];
  try {
    medicalRecords = await mongoose.model('MedicalRecord').find({ patient: req.params.id })
      .select('date visitType vitalSigns diagnosis treatment notes bloodType')
      .sort({ date: -1 });
  } catch (error) {
    // Medical records model might not exist yet, so we'll just return an empty array
    console.log('Medical records not found:', error.message);
  }

  res.json({
    patient,
    appointments,
    prescriptions,
    medicalRecords,
  });
});

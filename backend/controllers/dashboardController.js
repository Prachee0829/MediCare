import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import Prescription from '../models/prescriptionModel.js';
import Inventory from '../models/inventoryModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, specialization } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    specialization,
    isApproved: role === 'patient', // ✅ Auto-approve patients
  });

  if (user) {
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        isApproved: user.isApproved,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isApproved) {
      res.status(401);
      throw new Error('Account pending approval. Please contact administrator.');
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        isApproved: user.isApproved,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.gender = req.body.gender || user.gender;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const token = generateToken(updatedUser._id); // Optional new token

    res.json({
      token,
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
      profilePicture: updatedUser.profilePicture,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  let stats = {};

  // Common stats for all users
  const totalDoctors = await User.countDocuments({ role: 'doctor' });
  const totalPatients = await User.countDocuments({ role: 'patient' });
  const totalPharmacists = await User.countDocuments({ role: 'pharmacist' });
  const totalUsers = totalDoctors + totalPatients + totalPharmacists;

  // Role-specific stats
  if (userRole === 'admin') {
    // Admin sees all stats
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const totalPrescriptions = await Prescription.countDocuments();
    const totalInventoryItems = await Inventory.countDocuments();
    
    // Calculate inventory stats
    const inventoryItems = await Inventory.find();
    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.threshold).length;
    const expiringItems = await Inventory.countDocuments({
      expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Calculate total revenue from inventory items
    const revenue = inventoryItems.reduce((total, item) => {
      return total + (item.price || 0) * (item.quantity || 0);
    }, 0);
    
    stats = {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalPharmacists,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      totalPrescriptions,
      totalInventoryItems,
      lowStockItems,
      expiringItems,
      revenue,
      growth: 5 // Default growth value
    };
  } else if (userRole === 'pharmacist') {
    // Pharmacist sees inventory and prescription stats
    const totalInventoryItems = await Inventory.countDocuments();
    
    // Calculate inventory stats
    const inventoryItems = await Inventory.find();
    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.threshold).length;
    const expiringItems = await Inventory.countDocuments({
      expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });
    const totalPrescriptions = await Prescription.countDocuments();
    
    // Calculate total revenue from inventory items
    const revenue = inventoryItems.reduce((total, item) => {
      return total + (item.price || 0) * (item.quantity || 0);
    }, 0);
    
    stats = {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalPharmacists,
      totalPrescriptions,
      totalInventoryItems,
      lowStockItems,
      expiringItems,
      revenue,
      growth: 5 // Default growth value
    };
  } else if (userRole === 'doctor') {
    // Doctor sees their own stats
    const doctorId = req.user._id;
    const totalDoctorAppointments = await Appointment.countDocuments({ doctor: doctorId });
    const pendingDoctorAppointments = await Appointment.countDocuments({ 
      doctor: doctorId, 
      status: 'pending' 
    });
    const confirmedDoctorAppointments = await Appointment.countDocuments({ 
      doctor: doctorId, 
      status: 'confirmed' 
    });
    const doctorPrescriptions = await Prescription.countDocuments({ doctor: doctorId });
    
    // Get pharmacist count for doctor's view
    const totalPharmacists = await User.countDocuments({ role: 'pharmacist' });

    stats = {
      totalDoctors,
      totalPatients,
      totalPharmacists,
      totalAppointments: totalDoctorAppointments,
      pendingAppointments: pendingDoctorAppointments,
      confirmedAppointments: confirmedDoctorAppointments,
      totalPrescriptions: doctorPrescriptions,
    };
  } else {
    // Patient sees their own stats
    const patientId = req.user._id;
    const totalPatientAppointments = await Appointment.countDocuments({ patient: patientId });
    const pendingPatientAppointments = await Appointment.countDocuments({ 
      patient: patientId, 
      status: 'pending' 
    });
    const confirmedPatientAppointments = await Appointment.countDocuments({ 
      patient: patientId, 
      status: 'confirmed' 
    });
    const patientPrescriptions = await Prescription.countDocuments({ patient: patientId });
    
    // Get pharmacist count for patient's view
    const totalPharmacists = await User.countDocuments({ role: 'pharmacist' });

    stats = {
      totalDoctors,
      totalPharmacists,
      totalAppointments: totalPatientAppointments,
      pendingAppointments: pendingPatientAppointments,
      confirmedAppointments: confirmedPatientAppointments,
      totalPrescriptions: patientPrescriptions,
    };
  }

  res.json(stats);
});

// @desc    Get monthly data for charts
// @route   GET /api/dashboard/monthly-data
// @access  Private
export const getMonthlyData = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Initialize monthly data array (12 months)
  const monthlyData = Array(12).fill(0);
  
  let appointments;
  
  // Filter appointments based on user role
  if (userRole === 'admin') {
    // Admin sees all appointments
    appointments = await Appointment.find({
      date: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    });
  } else if (userRole === 'doctor') {
    // Doctor sees only their appointments
    appointments = await Appointment.find({
      doctor: userId,
      date: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    });
  } else if (userRole === 'pharmacist') {
    // Pharmacist sees all appointments (for reporting purposes)
    appointments = await Appointment.find({
      date: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    });
  } else {
    // Patient sees only their appointments
    appointments = await Appointment.find({
      patient: userId,
      date: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    });
  }
  
  // Count appointments per month
  appointments.forEach(appointment => {
    const month = new Date(appointment.date).getMonth();
    monthlyData[month]++;
  });
  
  res.json({
    labels: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    data: monthlyData
  });
});

// @desc    Get specialization data for charts
// @route   GET /api/dashboard/specialization-data
// @access  Private/Admin
export const getSpecializationData = asyncHandler(async (req, res) => {
  // Get all doctors grouped by specialization
  const specializationData = await User.aggregate([
    { $match: { role: 'doctor' } },
    { $group: { _id: '$specialization', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Format data for chart
  const labels = specializationData.map(item => item._id || 'General');
  const data = specializationData.map(item => item.count);
  
  res.json({
    labels,
    data
  });
});

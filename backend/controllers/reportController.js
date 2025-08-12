import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import Prescription from '../models/prescriptionModel.js';
import Inventory from '../models/inventoryModel.js';
import mongoose from 'mongoose';

// @desc    Get revenue data for charts
// @route   GET /api/reports/revenue
// @access  Private/Admin
export const getRevenueData = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this resource');
  }

  const currentYear = new Date().getFullYear();
  
  // Initialize monthly revenue data array (12 months)
  const monthlyRevenueData = Array(12).fill(0);
  
  // Get all appointments for the current year
  const appointments = await Appointment.find({
    date: {
      $gte: new Date(`${currentYear}-01-01`),
      $lte: new Date(`${currentYear}-12-31`)
    },
    status: { $in: ['completed', 'confirmed'] } // Only count confirmed or completed appointments
  });
  
  // Calculate revenue per month (assuming each appointment has a fixed cost)
  // In a real system, you would have a payment model to track actual revenue
  const appointmentCost = 500; // Default cost per appointment in INR
  
  appointments.forEach(appointment => {
    const month = new Date(appointment.date).getMonth();
    monthlyRevenueData[month] += appointmentCost;
  });
  
  // Get inventory sales data (simplified - in a real system, you'd have a sales model)
  const inventoryItems = await Inventory.find();
  const inventoryRevenue = inventoryItems.reduce((total, item) => {
    return total + (item.price || 0) * Math.floor((item.initialQuantity || 0) - (item.quantity || 0));
  }, 0);
  
  // Distribute inventory revenue equally across months (simplified approach)
  const monthlyInventoryRevenue = inventoryRevenue / 12;
  for (let i = 0; i < 12; i++) {
    monthlyRevenueData[i] += monthlyInventoryRevenue;
  }
  
  // Format data for response
  const formattedData = [
    { month: 'Jan', amount: Math.round(monthlyRevenueData[0]) },
    { month: 'Feb', amount: Math.round(monthlyRevenueData[1]) },
    { month: 'Mar', amount: Math.round(monthlyRevenueData[2]) },
    { month: 'Apr', amount: Math.round(monthlyRevenueData[3]) },
    { month: 'May', amount: Math.round(monthlyRevenueData[4]) },
    { month: 'Jun', amount: Math.round(monthlyRevenueData[5]) },
    { month: 'Jul', amount: Math.round(monthlyRevenueData[6]) },
    { month: 'Aug', amount: Math.round(monthlyRevenueData[7]) },
    { month: 'Sep', amount: Math.round(monthlyRevenueData[8]) },
    { month: 'Oct', amount: Math.round(monthlyRevenueData[9]) },
    { month: 'Nov', amount: Math.round(monthlyRevenueData[10]) },
    { month: 'Dec', amount: Math.round(monthlyRevenueData[11]) },
  ];
  
  res.json(formattedData);
});

// @desc    Get patient data for charts
// @route   GET /api/reports/patients
// @access  Private/Admin
export const getPatientData = asyncHandler(async (req, res) => {
  // Check if user is admin or doctor
  if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Not authorized to access this resource');
  }

  const currentYear = new Date().getFullYear();
  
  // Initialize monthly patient data array (12 months)
  const monthlyPatientData = Array(12).fill(0);
  
  // Get all patients registered in the current year
  const patients = await User.find({
    role: 'patient',
    createdAt: {
      $gte: new Date(`${currentYear}-01-01`),
      $lte: new Date(`${currentYear}-12-31`)
    }
  });
  
  // Count patients registered per month
  patients.forEach(patient => {
    const month = new Date(patient.createdAt).getMonth();
    monthlyPatientData[month]++;
  });
  
  // Format data for response
  const formattedData = [
    { month: 'Jan', count: monthlyPatientData[0] },
    { month: 'Feb', count: monthlyPatientData[1] },
    { month: 'Mar', count: monthlyPatientData[2] },
    { month: 'Apr', count: monthlyPatientData[3] },
    { month: 'May', count: monthlyPatientData[4] },
    { month: 'Jun', count: monthlyPatientData[5] },
    { month: 'Jul', count: monthlyPatientData[6] },
    { month: 'Aug', count: monthlyPatientData[7] },
    { month: 'Sep', count: monthlyPatientData[8] },
    { month: 'Oct', count: monthlyPatientData[9] },
    { month: 'Nov', count: monthlyPatientData[10] },
    { month: 'Dec', count: monthlyPatientData[11] },
  ];
  
  res.json(formattedData);
});

// @desc    Get department revenue data
// @route   GET /api/reports/department-revenue
// @access  Private/Admin
export const getDepartmentRevenue = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this resource');
  }

  // Get all doctors with their specializations
  const doctors = await User.find({ role: 'doctor', isApproved: true }).select('specialization');
  
  // Group doctors by specialization
  const specializations = {};
  doctors.forEach(doctor => {
    const spec = doctor.specialization || 'General';
    if (!specializations[spec]) {
      specializations[spec] = 0;
    }
    specializations[spec]++;
  });
  
  // Get all appointments
  const appointments = await Appointment.find({ status: { $in: ['completed', 'confirmed'] } })
    .populate('doctor', 'specialization');
  
  // Calculate revenue by department/specialization
  const departmentRevenue = {};
  const appointmentCost = 500; // Default cost per appointment in INR
  
  appointments.forEach(appointment => {
    if (appointment.doctor && appointment.doctor.specialization) {
      const spec = appointment.doctor.specialization;
      if (!departmentRevenue[spec]) {
        departmentRevenue[spec] = 0;
      }
      departmentRevenue[spec] += appointmentCost;
    }
  });
  
  // Format data for response
  const formattedData = Object.keys(departmentRevenue).map(department => ({
    department,
    amount: departmentRevenue[department]
  }));
  
  // Sort by amount (highest first)
  formattedData.sort((a, b) => b.amount - a.amount);
  
  res.json(formattedData);
});

// @desc    Get appointments by type
// @route   GET /api/reports/appointments-by-type
// @access  Private/Admin or Doctor
export const getAppointmentsByType = asyncHandler(async (req, res) => {
  // Check if user is admin or doctor
  if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Not authorized to access this resource');
  }

  // Get all appointments
  let query = {};
  
  if (req.user.role === 'doctor') {
    // Doctors only see their own appointments
    query.doctor = req.user._id;
  }
  
  const appointments = await Appointment.find(query);
  
  // Count appointments by type
  const appointmentTypes = {};
  
  appointments.forEach(appointment => {
    const type = appointment.type || 'Regular Checkup';
    if (!appointmentTypes[type]) {
      appointmentTypes[type] = 0;
    }
    appointmentTypes[type]++;
  });
  
  // Format data for response
  const formattedData = Object.keys(appointmentTypes).map(type => ({
    type,
    count: appointmentTypes[type]
  }));
  
  // Sort by count (highest first)
  formattedData.sort((a, b) => b.count - a.count);
  
  res.json(formattedData);
});

// @desc    Get overview report data (combines multiple reports)
// @route   GET /api/reports/overview
// @access  Private/Admin
export const getOverviewReport = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this resource');
  }

  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Get total patients
  const totalPatients = await User.countDocuments({ role: 'patient' });
  
  // Get total appointments
  const totalAppointments = await Appointment.countDocuments();
  
  // Get monthly revenue data
  const monthlyRevenueData = Array(12).fill(0);
  
  // Get all appointments for the current year
  const appointments = await Appointment.find({
    date: {
      $gte: new Date(`${currentYear}-01-01`),
      $lte: new Date(`${currentYear}-12-31`)
    },
    status: { $in: ['completed', 'confirmed'] }
  });
  
  // Calculate revenue per month
  const appointmentCost = 500; // Default cost per appointment in INR
  
  appointments.forEach(appointment => {
    const month = new Date(appointment.date).getMonth();
    monthlyRevenueData[month] += appointmentCost;
  });
  
  // Calculate total revenue
  const totalRevenue = monthlyRevenueData.reduce((sum, amount) => sum + amount, 0);
  
  // Calculate average revenue per patient
  const avgRevenuePerPatient = totalPatients > 0 ? totalRevenue / totalPatients : 0;
  
  // Get current month and previous month data for growth calculation
  const currentMonth = new Date().getMonth();
  const previousMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1;
  
  const currentMonthRevenue = monthlyRevenueData[currentMonth];
  const previousMonthRevenue = monthlyRevenueData[previousMonth];
  
  // Calculate revenue growth percentage
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;
  
  res.json({
    totalPatients,
    totalAppointments,
    totalRevenue,
    avgRevenuePerPatient,
    revenueGrowth,
    currentMonthRevenue,
    previousMonthRevenue
  });
});
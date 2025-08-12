import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';

// @desc    Create new appointment
export const createAppointment = asyncHandler(async (req, res) => {
  const { doctor, date, time, type, notes, symptoms } = req.body;

  if (!doctor || !date || !time || !type) {
    res.status(400);
    throw new Error('All required fields must be provided');
  }

  const doctorExists = await User.findOne({ _id: doctor, role: 'doctor', isApproved: true });
  if (!doctorExists) {
    res.status(400);
    throw new Error('Doctor not found or not approved');
  }

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor,
    date,
    time,
    type,
    notes,
    symptoms,
    status: 'pending',
  });

  res.status(201).json(appointment);
});

// @desc    Get all appointments
export const getAppointments = asyncHandler(async (req, res) => {
  let appointments;

  if (req.user.role === 'admin') {
    appointments = await Appointment.find({})
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
  } else if (req.user.role === 'doctor') {
    appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
  } else {
    appointments = await Appointment.find({ patient: req.user._id })
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
  }

  res.json(appointments);
});

// @desc    Get appointment by ID
export const getAppointmentById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid appointment ID');
  }

  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const isDoctor = appointment.doctor.toString() === req.user._id.toString();
  const isPatient = appointment.patient._id.toString() === req.user._id.toString();

  if (req.user.role === 'admin' || isDoctor || isPatient) {
    res.json(appointment);
  } else {
    res.status(403);
    throw new Error('Not authorized to view this appointment');
  }
});

// @desc    Update appointment status
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid appointment ID');
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const isDoctor = appointment.doctor.toString() === req.user._id.toString();
  const isPatient = appointment.patient.toString() === req.user._id.toString();

  // Only doctors can confirm appointments, patients can only cancel their own appointments
  const isAuthorized =
    req.user.role === 'admin' ||
    (isDoctor && ['confirmed', 'cancelled', 'completed'].includes(status)) ||
    (isPatient && status === 'cancelled');

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to update this appointment status');
  }

  appointment.status = status;
  const updated = await appointment.save();
  res.json(updated);
});

// @desc    Update appointment details (doctor only)
export const updateAppointment = asyncHandler(async (req, res) => {
  const { diagnosis, notes, followUpDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid appointment ID');
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (
    req.user.role !== 'doctor' ||
    appointment.doctor.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  appointment.diagnosis = diagnosis || appointment.diagnosis;
  appointment.notes = notes || appointment.notes;
  appointment.followUpDate = followUpDate || appointment.followUpDate;

  const updated = await appointment.save();
  res.json(updated);
});

// @desc    Delete appointment (admin only)
export const deleteAppointment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid appointment ID');
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  await appointment.deleteOne();
  res.json({ message: 'Appointment removed' });
});

// @desc    Get doctor's availability for a given date
export const getDoctorAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) {
    res.status(400);
    throw new Error('Date is required');
  }

  const normalizedDate = new Date(date + 'T00:00:00.000Z');
  const appointments = await Appointment.find({
    doctor: req.params.id,
    date: normalizedDate,
    status: { $ne: 'cancelled' },
  });

  const allTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  ];

  const booked = appointments.map((a) => a.time);
  const availableTimeSlots = allTimeSlots.filter(t => !booked.includes(t));

  res.json({ date, availableTimeSlots });
});

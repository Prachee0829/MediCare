import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import colors from 'colors';

// Load environment variables
dotenv.config();

// Import models
import User from './models/userModel.js';
import Appointment from './models/appointmentModel.js';
import Prescription from './models/prescriptionModel.js';
import Inventory from './models/inventoryModel.js';

// Sample Data
const users = [
  { 
    name: 'Admin User',
    email: 'admin@medicare.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin',
    isApproved: true,
    phone: '1234567890',
    address: '123 Admin St',
    dateOfBirth: new Date('1985-01-01'),
    gender: 'male',
  },
  {
    name: 'Dr. John Doe',
    email: 'doctor@medicare.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'doctor',
    specialization: 'General',
    isApproved: true,
    phone: '9876543210',
    address: '456 Clinic Rd',
    dateOfBirth: new Date('1980-04-10'),
    gender: 'male',
    licenseId: 'MD12345678',
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@medicare.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'doctor',
    specialization: 'Cardiology',
    isApproved: true,
    phone: '5551234567',
    address: '789 Heart Ave',
    dateOfBirth: new Date('1982-06-15'),
    gender: 'female',
    licenseId: 'MD87654321',
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@medicare.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'doctor',
    specialization: 'Neurology',
    isApproved: true,
    phone: '5552223333',
    address: '123 Brain St',
    dateOfBirth: new Date('1975-09-28'),
    gender: 'male',
    licenseId: 'MD11223344',
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@medicare.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'doctor',
    specialization: 'Pediatrics',
    isApproved: true,
    phone: '5554445555',
    address: '456 Child Blvd',
    dateOfBirth: new Date('1983-11-12'),
    gender: 'female',
    licenseId: 'MD55667788',
  },
  {
    name: 'Patient User',
    email: 'patient@medicare.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'patient',
    isApproved: true,
    phone: '1122334455',
    address: '789 Patient St',
    dateOfBirth: new Date('1995-09-15'),
    gender: 'female',
  },
  {
    name: 'Amanda Thompson',
    email: 'pharmacist@medicare.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'pharmacist',
    isApproved: true,
    phone: '5556667777',
    address: '456 Pharmacy Ave',
    dateOfBirth: new Date('1987-04-22'),
    gender: 'female',
    licenseId: 'PH54321678',
  },
];

const inventoryItems = [
  {
    name: 'Paracetamol',
    category: 'Pain Relief',
    dosage: '500mg',
    formulation: 'Tablet',
    quantity: 200,
    threshold: 50,
    supplier: 'MediSupply',
    expiryDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
    batchNumber: 'BATCH123',
    location: 'Shelf A1',
    price: 5.5,
  },
];

// Seed Logic
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected'.cyan.underline);

    const userCount = await User.countDocuments();
    const inventoryCount = await Inventory.countDocuments();

    // Force update users
    await User.deleteMany({});
    const createdUsers = await User.insertMany(users);
    console.log(`Seeded ${createdUsers.length} users`.green);

    if (inventoryCount === 0) {
      const adminUser = await User.findOne({ role: 'admin' });
      const itemsWithUser = inventoryItems.map(i => ({ ...i, updatedBy: adminUser._id }));
      const createdInventory = await Inventory.insertMany(itemsWithUser);
      console.log(`Seeded ${createdInventory.length} inventory items`.green);
    } else {
      console.log('Inventory already exists, skipping...'.yellow);
    }

    console.log('✅ Seeding complete'.blue);
    process.exit();
  } catch (err) {
    console.error(`❌ Error: ${err.message}`.red);
    process.exit(1);
  }
};

seedDatabase();

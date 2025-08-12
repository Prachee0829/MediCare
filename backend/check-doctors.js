import mongoose from 'mongoose';
import User from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    const doctors = await User.find({ role: 'doctor', isApproved: true });
    console.log('Approved doctors specializations:', doctors.map(d => d.specialization));
    
    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

checkDoctors();
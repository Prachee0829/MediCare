import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Please make sure MongoDB is installed and running on your system.');
    console.log('You can download MongoDB from: https://www.mongodb.com/try/download/community');
    console.log('Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
    return false;
  }
};
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import colors from 'colors';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
let dbConnected = false;
connectDB().then(connected => {
  dbConnected = connected;
});

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies

// HTTP logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
// Add middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      message: 'Database connection error. Please make sure MongoDB is installed and running.',
      error: 'DATABASE_CONNECTION_ERROR'
    });
  }
  next();
};

// Apply the middleware to all routes
app.use('/api/auth', checkDbConnection, authRoutes);
app.use('/api/users', checkDbConnection, userRoutes);
app.use('/api/appointments', checkDbConnection, appointmentRoutes);
app.use('/api/prescriptions', checkDbConnection, prescriptionRoutes);
app.use('/api/inventory', checkDbConnection, inventoryRoutes);
app.use('/api/dashboard', checkDbConnection, dashboardRoutes);
app.use('/api/medical-records', checkDbConnection, medicalRecordRoutes);
app.use('/api/reports', checkDbConnection, reportRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('✅ Medicare API is running...');
});

// Custom error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.cyan.bold);
});

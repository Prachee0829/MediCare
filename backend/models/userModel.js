import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'pharmacist', 'admin'],
      default: 'patient',
    },
    specialization: {
      type: String,
      required: function() {
        return this.role === 'doctor';
      },
    },
    licenseId: {
      type: String,
      required: function() {
        return this.role === 'doctor' || this.role === 'pharmacist';
      },
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: function() {
        return this.role === 'patient'; // Patients are approved by default
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    profilePicture: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if entered password matches the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    next();
  }

  // Generate salt
  const salt = await bcrypt.genSalt(10);
  // Hash password
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
import mongoose from 'mongoose';

const vitalSignsSchema = mongoose.Schema({
  temperature: {
    type: String,
  },
  bloodPressure: {
    type: String,
  },
  heartRate: {
    type: String,
  },
  respiratoryRate: {
    type: String,
  },
  oxygenSaturation: {
    type: String,
  },
});

const medicalRecordSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    visitType: {
      type: String,
      required: true,
    },
    vitalSigns: vitalSignsSchema,
    diagnosis: {
      type: String,
    },
    treatment: {
      type: String,
    },
    notes: {
      type: String,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    bloodType: {
      type: String,
    },
    prescriptions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    }],
  },
  {
    timestamps: true,
  }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
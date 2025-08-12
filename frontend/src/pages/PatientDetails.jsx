import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  User,
  Calendar,
  Clock,
  FileText,
  Activity,
  Heart,
  Thermometer,
  Clipboard,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Pill,
  Droplet,
  Edit,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import EditAppointmentModal from '../components/EditAppointmentModal.jsx';
import { useNotification } from '../services/notificationService.js';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const { notifySuccess, notifyInfo, notifyError } = useNotification();

  useEffect(() => {
    // Check if user is doctor or admin
    if (user?.role !== 'doctor' && user?.role !== 'admin') {
      toast.error('Unauthorized access');
      notifyError('Access Denied', 'You do not have permission to view patient details');
      navigate('/dashboard');
      return;
    }

    fetchPatientDetails();
  }, [id, navigate, user, notifyError]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/patient/${id}/details`);
      setPatientData(response.data);
      
      // Show notification about patient details loaded
      notifySuccess('Patient Record', `${response.data.name}'s medical record loaded`);
      
      // Check for allergies and notify
      if (response.data.allergies && response.data.allergies.length > 0) {
        notifyInfo(
          'Patient Allergies', 
          `This patient has ${response.data.allergies.length} known allergies`
        );
      }
      
      // Check for critical conditions
      const criticalConditions = response.data.medicalConditions?.filter(
        condition => condition.severity === 'high' || condition.severity === 'severe'
      );
      
      if (criticalConditions && criticalConditions.length > 0) {
        notifyInfo(
          'Critical Conditions', 
          `Patient has ${criticalConditions.length} critical conditions that require attention`
        );
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error(error.response?.data?.message || 'Failed to load patient details');
      notifyError('Data Loading Error', 'Failed to load patient details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAppointmentUpdated = (updatedAppointment) => {
    // Update the appointment in the patient data
    if (patientData && patientData.appointments) {
      const updatedAppointments = patientData.appointments.map(appointment => 
        appointment._id === updatedAppointment._id ? updatedAppointment : appointment
      );
      
      setPatientData({
        ...patientData,
        appointments: updatedAppointments
      });
      
      // Show notification about appointment update
      notifySuccess(
        'Appointment Updated', 
        `Appointment for ${patientData.name} has been updated`
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      {/* Patient header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{patientData.name}</h1>
                <p className="text-gray-500">
                  {patientData.gender}, {calculateAge(patientData.dateOfBirth)} years
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 w-full md:w-auto">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{patientData.phone || 'No phone number'}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{patientData.email}</span>
              </div>
              {patientData.address && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{patientData.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'medical-records' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('medical-records')}
            >
              Medical Records
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('appointments')}
            >
              Appointments
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'prescriptions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Full Name</span>
                      <span className="text-gray-900 font-medium">{patientData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Birth</span>
                      <span className="text-gray-900 font-medium">{formatDate(patientData.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender</span>
                      <span className="text-gray-900 font-medium">{patientData.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Blood Type</span>
                      <span className="text-gray-900 font-medium">{patientData.bloodType || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Height</span>
                      <span className="text-gray-900 font-medium">{patientData.height ? `${patientData.height} cm` : 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight</span>
                      <span className="text-gray-900 font-medium">{patientData.weight ? `${patientData.weight} kg` : 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Allergies</span>
                      <span className="text-gray-900 font-medium">{patientData.allergies || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chronic Conditions</span>
                      <span className="text-gray-900 font-medium">{patientData.chronicConditions || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Medications</span>
                      <span className="text-gray-900 font-medium">{patientData.currentMedications || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Family Medical History</span>
                      <span className="text-gray-900 font-medium">{patientData.familyMedicalHistory || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Smoking Status</span>
                      <span className="text-gray-900 font-medium">{patientData.smokingStatus || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Alcohol Consumption</span>
                      <span className="text-gray-900 font-medium">{patientData.alcoholConsumption || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  
                  {/* Latest Appointments */}
                  {patientData.appointments && patientData.appointments.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Latest Appointments</h4>
                      <div className="space-y-3">
                        {patientData.appointments.slice(0, 3).map((appointment) => (
                          <div key={appointment._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {appointment.type} with Dr. {appointment.doctor.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(appointment.date)} at {appointment.time}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Latest Prescriptions */}
                  {patientData.prescriptions && patientData.prescriptions.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3">Latest Prescriptions</h4>
                      <div className="space-y-3">
                        {patientData.prescriptions.slice(0, 3).map((prescription) => (
                          <div key={prescription._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="bg-green-100 p-2 rounded-full mr-3">
                              <Pill className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Prescription by Dr. {prescription.doctor.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(prescription.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!patientData.appointments || patientData.appointments.length === 0) && 
                   (!patientData.prescriptions || patientData.prescriptions.length === 0) && (
                    <div className="text-center py-4">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No recent activity for this patient</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'medical-records' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {patientData.medicalRecords && patientData.medicalRecords.length > 0 ? (
                <div className="space-y-6">
                  {patientData.medicalRecords.map((record) => (
                    <div key={record._id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{record.recordType}</h3>
                          <p className="text-gray-500">Recorded by Dr. {record.doctor.name} on {formatDate(record.createdAt)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-2">Vital Signs</h4>
                          <div className="space-y-2">
                            {record.vitalSigns.bloodPressure && (
                              <div className="flex items-center">
                                <Heart className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-gray-700 mr-2">Blood Pressure:</span>
                                <span className="text-gray-900">{record.vitalSigns.bloodPressure} mmHg</span>
                              </div>
                            )}
                            {record.vitalSigns.heartRate && (
                              <div className="flex items-center">
                                <Activity className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-gray-700 mr-2">Heart Rate:</span>
                                <span className="text-gray-900">{record.vitalSigns.heartRate} bpm</span>
                              </div>
                            )}
                            {record.vitalSigns.temperature && (
                              <div className="flex items-center">
                                <Thermometer className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-gray-700 mr-2">Temperature:</span>
                                <span className="text-gray-900">{record.vitalSigns.temperature} °C</span>
                              </div>
                            )}
                            {record.vitalSigns.respiratoryRate && (
                              <div className="flex items-center">
                                <Activity className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-gray-700 mr-2">Respiratory Rate:</span>
                                <span className="text-gray-900">{record.vitalSigns.respiratoryRate} breaths/min</span>
                              </div>
                            )}
                            {record.vitalSigns.oxygenSaturation && (
                              <div className="flex items-center">
                                <Droplet className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-gray-700 mr-2">Oxygen Saturation:</span>
                                <span className="text-gray-900">{record.vitalSigns.oxygenSaturation}%</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-2">Examination Details</h4>
                          <p className="text-gray-600">{record.examinationDetails || 'No examination details provided'}</p>
                        </div>
                      </div>

                      {record.diagnosis && (
                        <div className="mb-4">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Diagnosis</h4>
                          <p className="text-gray-600">{record.diagnosis}</p>
                        </div>
                      )}

                      {record.treatmentPlan && (
                        <div className="mb-4">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Treatment Plan</h4>
                          <p className="text-gray-600">{record.treatmentPlan}</p>
                        </div>
                      )}

                      {record.notes && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-2">Additional Notes</h4>
                          <p className="text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h3>
                  <p className="text-gray-500">This patient doesn't have any medical records yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {patientData.appointments && patientData.appointments.length > 0 ? (
                <div className="space-y-6">
                  {patientData.appointments.map((appointment) => (
                    <div key={appointment._id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">
                              {formatDate(appointment.date)} at {appointment.time}
                            </h3>
                          </div>
                          <p className="text-gray-500 mt-1">{appointment.type}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : appointment.status === 'scheduled' || appointment.status === 'confirmed' || appointment.status === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          {(user?.role === 'doctor' || user?.role === 'admin') && appointment.status !== 'cancelled' && (
                            <button 
                              className="p-1 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setIsEditAppointmentModalOpen(true);
                              }}
                              title="Edit appointment"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appointment.symptoms && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-2">Symptoms</h4>
                            <p className="text-gray-600">{appointment.symptoms}</p>
                          </div>
                        )}

                        {appointment.diagnosis && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-2">Diagnosis</h4>
                            <p className="text-gray-600">{appointment.diagnosis}</p>
                          </div>
                        )}
                      </div>

                      {appointment.notes && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Notes</h4>
                          <p className="text-gray-600">{appointment.notes}</p>
                        </div>
                      )}

                      {appointment.followUpDate && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Follow-up Date</h4>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                            <p className="text-gray-600">{formatDate(appointment.followUpDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
                  <p className="text-gray-500">This patient doesn't have any appointments yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {patientData.prescriptions && patientData.prescriptions.length > 0 ? (
                <div className="space-y-6">
                  {patientData.prescriptions.map((prescription) => (
                    <div key={prescription._id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Prescription #{prescription._id.slice(-6)}</h3>
                          <p className="text-gray-500">Prescribed by Dr. {prescription.doctor.name} on {formatDate(prescription.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Medications</h4>
                        <div className="space-y-4">
                          {prescription.medications.map((medication, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div>
                                  <h5 className="text-md font-medium text-gray-900">{medication.name}</h5>
                                  <p className="text-sm text-gray-600">{medication.dosage}</p>
                                </div>
                                <div className="mt-2 md:mt-0">
                                  <p className="text-sm text-gray-600">{medication.frequency}</p>
                                  <p className="text-sm text-gray-600">{medication.duration}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.notes && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Notes</h4>
                          <p className="text-sm text-gray-600">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <Clipboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions</h3>
                  <p className="text-gray-500">This patient doesn't have any prescriptions yet.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        isOpen={isEditAppointmentModalOpen}
        onClose={() => setIsEditAppointmentModalOpen(false)}
        onAppointmentUpdated={handleAppointmentUpdated}
        appointment={selectedAppointment}
      />
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Patient data not found</h3>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Go back
        </button>
      </div>
    );
  }

  const { patient, appointments, prescriptions, medicalRecords } = patientData;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to patients
      </button>

      {/* Patient header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden mb-6"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                <div className="flex flex-wrap items-center text-gray-500 mt-1">
                  <span className="mr-3">{calculateAge(patient.dateOfBirth)} years</span>
                  <span className="mr-3">•</span>
                  <span className="mr-3">{patient.gender}</span>
                  {patient.bloodGroup && (
                    <>
                      <span className="mr-3">•</span>
                      <span className="flex items-center">
                        <Droplet className="h-4 w-4 mr-1 text-red-500" />
                        Blood Type: {patient.bloodGroup}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:items-end">
              <div className="flex items-center text-gray-500 mb-1">
                <Phone className="h-4 w-4 mr-2" />
                {patient.phone || 'No phone number'}
              </div>
              <div className="flex items-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                {patient.email}
              </div>
              {patient.address && (
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  {patient.address}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'medical-records' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('medical-records')}
            >
              Medical Records
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('appointments')}
            >
              Appointments
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'prescriptions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="text-gray-500 w-32">Full Name:</span>
                      <span className="text-gray-900">{patient.name}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Date of Birth:</span>
                      <span className="text-gray-900">{formatDate(patient.dateOfBirth)}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Age:</span>
                      <span className="text-gray-900">{calculateAge(patient.dateOfBirth)} years</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Gender:</span>
                      <span className="text-gray-900">{patient.gender}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Blood Type:</span>
                      <span className="text-gray-900">{patient.bloodGroup || 'Not specified'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Phone:</span>
                      <span className="text-gray-900">{patient.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Email:</span>
                      <span className="text-gray-900">{patient.email}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Address:</span>
                      <span className="text-gray-900">{patient.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="text-gray-500 w-32">Allergies:</span>
                      <span className="text-gray-900">{patient.allergies || 'None reported'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Conditions:</span>
                      <span className="text-gray-900">{patient.existingConditions || 'None reported'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Medications:</span>
                      <span className="text-gray-900">{patient.currentMedications || 'None reported'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Past Surgeries:</span>
                      <span className="text-gray-900">{patient.pastSurgeries || 'None reported'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Chronic Illness:</span>
                      <span className="text-gray-900">{patient.chronicIllnesses || 'None reported'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Family History:</span>
                      <span className="text-gray-900">{patient.familyMedicalHistory || 'None reported'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    {appointments && appointments.length > 0 ? (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Latest Appointment</h4>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="flex items-center text-gray-900">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{formatDate(appointments[0].date)}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{appointments[0].time}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-900">Symptoms: </span>
                            <span className="text-sm text-gray-600">{appointments[0].symptoms || 'None reported'}</span>
                          </div>
                          {appointments[0].diagnosis && (
                            <div className="mt-1">
                              <span className="text-sm font-medium text-gray-900">Diagnosis: </span>
                              <span className="text-sm text-gray-600">{appointments[0].diagnosis}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No recent appointments</p>
                    )}

                    {prescriptions && prescriptions.length > 0 ? (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Latest Prescription</h4>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="flex items-center text-gray-900">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{formatDate(prescriptions[0].date)}</span>
                            <span className="mx-2">•</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${prescriptions[0].status === 'active' ? 'bg-green-100 text-green-800' : prescriptions[0].status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                              {prescriptions[0].status.charAt(0).toUpperCase() + prescriptions[0].status.slice(1)}
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-start">
                              <Pill className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">Medications: </span>
                                <ul className="list-disc list-inside text-sm text-gray-600 ml-1">
                                  {prescriptions[0].medications.map((med, index) => (
                                    <li key={index}>{med.name} - {med.dosage}, {med.frequency}, {med.duration}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No recent prescriptions</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'medical-records' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {medicalRecords && medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  {medicalRecords.map((record, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg relative">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{record.visitType}</h3>
                          <p className="text-gray-500">{formatDate(record.date)}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center space-x-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              Medical Record
                            </span>
                          </div>
                      </div>

                      {record.vitalSigns && (
                        <div className="mb-4">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Vital Signs</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {record.vitalSigns.temperature && (
                              <div className="flex items-center">
                                <Thermometer className="h-5 w-5 mr-2 text-red-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Temperature</p>
                                  <p className="text-sm text-gray-600">{record.vitalSigns.temperature}</p>
                                </div>
                              </div>
                            )}
                            {record.vitalSigns.bloodPressure && (
                              <div className="flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Blood Pressure</p>
                                  <p className="text-sm text-gray-600">{record.vitalSigns.bloodPressure}</p>
                                </div>
                              </div>
                            )}
                            {record.vitalSigns.heartRate && (
                              <div className="flex items-center">
                                <Heart className="h-5 w-5 mr-2 text-red-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Heart Rate</p>
                                  <p className="text-sm text-gray-600">{record.vitalSigns.heartRate}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {record.diagnosis && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-2">Diagnosis</h4>
                            <p className="text-sm text-gray-600">{record.diagnosis}</p>
                          </div>
                        )}
                        {record.treatment && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-2">Treatment</h4>
                            <p className="text-sm text-gray-600">{record.treatment}</p>
                          </div>
                        )}
                      </div>

                      {record.notes && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Notes</h4>
                          <p className="text-sm text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h3>
                  <p className="text-gray-500">This patient doesn't have any medical records yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900">{formatDate(appointment.date)}</h3>
                            <span className="mx-2">•</span>
                            <Clock className="h-5 w-5 mr-2 text-blue-500" />
                            <span>{appointment.time}</span>
                          </div>
                          <p className="text-gray-500 mt-1">{appointment.type}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : appointment.status === 'scheduled' || appointment.status === 'confirmed' || appointment.status === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          {(user?.role === 'doctor' || user?.role === 'admin') && appointment.status !== 'cancelled' && (
                            <button 
                              className="p-1 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setIsEditAppointmentModalOpen(true);
                              }}
                              title="Edit appointment"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appointment.symptoms && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-2">Symptoms</h4>
                            <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                          </div>
                        )}
                        {appointment.diagnosis && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-2">Diagnosis</h4>
                            <p className="text-sm text-gray-600">{appointment.diagnosis}</p>
                          </div>
                        )}
                      </div>

                      {appointment.notes && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Notes</h4>
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                        </div>
                      )}

                      {appointment.followUpDate && (
                        <div className="mt-4 flex items-center text-blue-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Follow-up scheduled for {formatDate(appointment.followUpDate)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
                  <p className="text-gray-500">This patient doesn't have any appointments yet.</p>
                </div>
              )}
            </motion.div>
          )}

      {/* Edit Appointment Modal */}
      <EditAppointmentModal 
        isOpen={isEditAppointmentModalOpen} 
        onClose={() => setIsEditAppointmentModalOpen(false)} 
        appointment={selectedAppointment}
        onAppointmentUpdated={(updatedAppointment) => {
          // Update the appointment in the list
          if (patientData && patientData.appointments) {
            const updatedAppointments = patientData.appointments.map(app => 
              (app._id === updatedAppointment._id || app.id === updatedAppointment._id) 
                ? updatedAppointment 
                : app
            );
            setPatientData({
              ...patientData,
              appointments: updatedAppointments
            });
          }
          // Refresh the data to ensure we have the latest
          fetchPatientDetails();
        }}
      />

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {prescriptions && prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900">{formatDate(prescription.date)}</h3>
                          </div>
                          <p className="text-gray-500 mt-1">Expires: {formatDate(prescription.expiryDate)}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-sm ${prescription.status === 'active' ? 'bg-green-100 text-green-800' : prescription.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Medications</h4>
                        <div className="space-y-3">
                          {prescription.medications.map((medication, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-md shadow-sm">
                              <div className="flex items-center">
                                <Pill className="h-5 w-5 mr-2 text-blue-500" />
                                <h5 className="text-md font-medium text-gray-900">{medication.name}</h5>
                              </div>
                              <div className="ml-7 mt-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                  <span className="text-xs text-gray-500">Dosage</span>
                                  <p className="text-sm text-gray-900">{medication.dosage}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Frequency</span>
                                  <p className="text-sm text-gray-900">{medication.frequency}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Duration</span>
                                  <p className="text-sm text-gray-900">{medication.duration}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.notes && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-2">Notes</h4>
                          <p className="text-sm text-gray-600">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <Clipboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions</h3>
                  <p className="text-gray-500">This patient doesn't have any prescriptions yet.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
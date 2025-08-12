import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Calendar, Clock, User, FileText, Activity, Heart, Thermometer, Droplet, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api.js';
import { fetchPatientHealth } from '../services/patientService.js';
import toast from 'react-hot-toast';
import { useNotification } from '../services/notificationService.js';

const PatientHistory = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      let data;
      
      if (user?.role === 'patient') {
        // Patients should see their own medical records using the dedicated service
        // that properly handles authorization
        data = await fetchPatientHealth();
      } else if (user?.role === 'doctor' || user?.role === 'admin') {
        // Doctors and admins use the regular API
        const response = await api.get('/medical-records');
        data = response.data;
      }
      
      if (data) {
        setPatientRecords(data);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      notifyError('Error', 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback data for development/testing only
  const [fallbackRecords, setFallbackRecords] = useState([
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 'P10023',
      age: 45,
      dateOfBirth: '1978-03-15',
      gender: 'Male',
      bloodType: 'O+',
      doctorName: 'Dr. Sarah Johnson',
      date: '2023-06-10',
      visitType: 'General Checkup',
      vitalSigns: {
        temperature: '98.6°F',
        bloodPressure: '120/80 mmHg',
        heartRate: '72 bpm',
        respiratoryRate: '16 breaths/min',
        oxygenSaturation: '98%'
      },
      diagnosis: 'Seasonal allergies',
      treatment: 'Prescribed antihistamines and nasal spray',
      notes: 'Patient reports improvement in symptoms. Follow up in 2 weeks if symptoms persist.'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      patientId: 'P10045',
      age: 38,
      dateOfBirth: '1985-07-22',
      gender: 'Female',
      bloodType: 'A+',
      doctorName: 'Dr. Michael Chen',
      date: '2023-06-08',
      visitType: 'Cardiology Consultation',
      vitalSigns: {
        temperature: '98.4°F',
        bloodPressure: '135/85 mmHg',
        heartRate: '78 bpm',
        respiratoryRate: '18 breaths/min',
        oxygenSaturation: '97%'
      },
      diagnosis: 'Hypertension, Stage 1',
      treatment: 'Prescribed Lisinopril 10mg daily. Recommended DASH diet and regular exercise.',
      notes: 'Patient to monitor blood pressure at home. Follow up in 4 weeks.'
    },
    {
      id: 3,
      patientName: 'Robert Johnson',
      patientId: 'P10078',
      age: 52,
      dateOfBirth: '1971-11-05',
      gender: 'Male',
      bloodType: 'B-',
      doctorName: 'Dr. Emily Rodriguez',
      date: '2023-05-20',
      visitType: 'Psychiatric Evaluation',
      vitalSigns: {
        temperature: '98.8°F',
        bloodPressure: '125/82 mmHg',
        heartRate: '80 bpm',
        respiratoryRate: '17 breaths/min',
        oxygenSaturation: '99%'
      },
      diagnosis: 'Generalized Anxiety Disorder',
      treatment: 'Prescribed Fluoxetine 20mg daily. Recommended cognitive behavioral therapy.',
      notes: 'Patient reports increased stress at work. Scheduled follow-up in 3 weeks.'
    },
    {
      id: 4,
      patientName: 'Maria Garcia',
      patientId: 'P10112',
      age: 8,
      dateOfBirth: '2015-04-30',
      gender: 'Female',
      bloodType: 'O+',
      doctorName: 'Dr. Sarah Johnson',
      date: '2023-06-12',
      visitType: 'Pediatric Checkup',
      vitalSigns: {
        temperature: '99.1°F',
        bloodPressure: '90/60 mmHg',
        heartRate: '90 bpm',
        respiratoryRate: '22 breaths/min',
        oxygenSaturation: '98%'
      },
      diagnosis: 'Acute Otitis Media',
      treatment: 'Prescribed Amoxicillin 250mg three times daily for 10 days.',
      notes: 'Patient to return if symptoms worsen or fever persists beyond 48 hours.'
    },
    {
      id: 5,
      patientName: 'David Wilson',
      patientId: 'P10156',
      age: 65,
      dateOfBirth: '1958-09-12',
      gender: 'Male',
      bloodType: 'AB+',
      doctorName: 'Dr. James Taylor',
      date: '2023-05-15',
      visitType: 'Orthopedic Consultation',
      vitalSigns: {
        temperature: '98.6°F',
        bloodPressure: '140/90 mmHg',
        heartRate: '75 bpm',
        respiratoryRate: '16 breaths/min',
        oxygenSaturation: '96%'
      },
      diagnosis: 'Lumbar Disc Herniation',
      treatment: 'Prescribed Naproxen 500mg twice daily and physical therapy.',
      notes: 'MRI shows L4-L5 disc herniation. Patient advised to avoid heavy lifting.'
    },
    {
      id: 6,
      patientName: 'Sarah Thompson',
      patientId: 'P10189',
      age: 42,
      gender: 'Female',
      bloodType: 'A-',
      doctorName: 'Dr. Michael Chen',
      date: '2023-06-05',
      visitType: 'Endocrinology Consultation',
      vitalSigns: {
        temperature: '98.4°F',
        bloodPressure: '118/78 mmHg',
        heartRate: '72 bpm',
        respiratoryRate: '16 breaths/min',
        oxygenSaturation: '98%'
      },
      diagnosis: 'Type 2 Diabetes Mellitus',
      treatment: 'Prescribed Metformin 1000mg twice daily and Glimepiride 2mg once daily.',
      notes: 'HbA1c: 8.2%. Patient educated on blood glucose monitoring and diabetic diet.'
    }
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Use actual records if available, otherwise use fallback
  const recordsToUse = patientRecords.length > 0 ? patientRecords : fallbackRecords;

  const filteredRecords = recordsToUse.filter(record => {
    // Handle both API data structure and fallback data structure
    const patientName = record.patient?.name || record.patientName || '';
    const patientId = record.patient?._id || record.patientId || '';
    const diagnosis = record.diagnosis || '';
    const doctorName = record.doctor?.name || record.doctorName || '';
    const visitType = record.visitType || '';
    const treatment = record.treatment || '';
    const recordDate = record.date || new Date();
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'recent') return matchesSearch && new Date(recordDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (activeTab === 'lab') return matchesSearch && visitType.toLowerCase().includes('lab');
    if (activeTab === 'prescriptions') return matchesSearch && treatment.toLowerCase().includes('prescribed');
    
    return matchesSearch;
  });

  const openRecordDetails = (record) => {
    // Create a copy of the record to handle both API and fallback data structures
    const recordWithFormattedData = {
      ...record,
      // Use API structure if available, otherwise use fallback structure
      patientName: record.patient?.name || record.patientName,
      patientId: record.patient?._id || record.patientId,
      age: record.patient?.age || record.age,
      gender: record.patient?.gender || record.gender,
      dateOfBirth: record.patient?.dateOfBirth || record.dateOfBirth,
      bloodType: record.patient?.bloodType || record.bloodType,
      doctorName: record.doctor?.name || record.doctorName,
      // Ensure prescriptions are properly formatted
      prescriptions: record.prescriptions || []
    };
    
    setSelectedRecord(recordWithFormattedData);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient History</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            + New Record
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('all')}
            >
              All Records
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'recent' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('recent')}
            >
              Recent Visits
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'lab' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('lab')}
            >
              Lab Results
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'prescriptions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions
            </button>
          </nav>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vital Signs
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No medical records found. {user?.role === 'patient' ? 'Your medical history will appear here after your appointments.' : 'Medical records will appear here once created.'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                <motion.tr 
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openRecordDetails(record)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.patient?.name || record.patientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.patient?._id || record.patientId} • 
                          {record.patient?.age || record.age} yrs • 
                          {record.patient?.gender || record.gender}
                        </div>
                        {(user.role === 'doctor' || user.role === 'admin') && (
                          <div className="text-sm text-gray-500">DOB: {record.patient?.dateOfBirth || record.dateOfBirth}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {formatDate(record.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <User className="h-4 w-4 mr-1 text-gray-500" />
                        {record.doctor?.name || record.doctorName}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {record.visitType}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{record.diagnosis}</div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{record.treatment}</div>
                  </td>
                  <td className="px-6 py-4">
                    {record.vitalSigns ? (
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Thermometer className="h-4 w-4 mr-1 text-red-500" />
                          {record.vitalSigns.temperature}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Activity className="h-4 w-4 mr-1 text-blue-500" />
                          {record.vitalSigns.bloodPressure}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Heart className="h-4 w-4 mr-1 text-red-500" />
                          {record.vitalSigns.heartRate}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No vital signs recorded</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit action
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Print action
                        }}
                      >
                        Print
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Record Details Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-gray-900">{selectedRecord.patientName}</h2>
                    <p className="text-gray-500">{selectedRecord.patientId} • {selectedRecord.age} yrs • {selectedRecord.gender} • Blood Type: {selectedRecord.bloodType}</p>
                    {(user.role === 'doctor' || user.role === 'admin') && (
                      <p className="text-gray-500">Date of Birth: {selectedRecord.dateOfBirth}</p>
                    )}
                  </div>
                </div>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsModalOpen(false)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Visit Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Date</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedRecord.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Doctor</p>
                          <p className="text-sm text-gray-600">{selectedRecord.doctorName}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Visit Type</p>
                          <p className="text-sm text-gray-600">{selectedRecord.visitType}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Vital Signs</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-start">
                        <Thermometer className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Temperature</p>
                          <p className="text-sm text-gray-600">{selectedRecord.vitalSigns.temperature}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Activity className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Blood Pressure</p>
                          <p className="text-sm text-gray-600">{selectedRecord.vitalSigns.bloodPressure}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Heart className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Heart Rate</p>
                          <p className="text-sm text-gray-600">{selectedRecord.vitalSigns.heartRate}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Activity className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Respiratory Rate</p>
                          <p className="text-sm text-gray-600">{selectedRecord.vitalSigns.respiratoryRate}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Droplet className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Oxygen Saturation</p>
                          <p className="text-sm text-gray-600">{selectedRecord.vitalSigns.oxygenSaturation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Diagnosis & Treatment</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-md font-medium text-gray-900 mb-2">Diagnosis</h5>
                    <p className="text-sm text-gray-600 mb-4">{selectedRecord.diagnosis}</p>
                    
                    <h5 className="text-md font-medium text-gray-900 mb-2">Treatment</h5>
                    <p className="text-sm text-gray-600">{selectedRecord.treatment}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{selectedRecord.notes}</p>
                  </div>
                </div>
                
                {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Prescriptions</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedRecord.prescriptions.map((prescription, index) => (
                        <div key={prescription._id || index} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-md font-medium text-gray-900">Prescription #{index + 1}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${prescription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {prescription.status || 'Active'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Medications:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                                {prescription.medications.map((med, idx) => (
                                  <li key={idx}>{med}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Prescribed By:</p>
                              <p className="text-sm text-gray-600">{prescription.doctor?.name || 'Doctor'}</p>
                              <p className="text-sm font-medium text-gray-700 mt-2">Expiry Date:</p>
                              <p className="text-sm text-gray-600">{formatDate(prescription.expiryDate)}</p>
                            </div>
                          </div>
                          {prescription.notes && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Notes:</p>
                              <p className="text-sm text-gray-600">{prescription.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      // Edit functionality
                    }}
                  >
                    Edit Record
                  </button>
                  <button 
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      // Print functionality
                    }}
                  >
                    Print Record
                  </button>
                  <button 
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-auto"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
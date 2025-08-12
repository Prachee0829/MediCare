import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Calendar, Phone, Mail, Search, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner';
import { useNotification } from '../services/notificationService.js';

const Patients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { notifySuccess, notifyInfo, notifyError } = useNotification();

  useEffect(() => {
    let isMounted = true;

    const loadPatients = async () => {
      if (!user || !user.role) return;

      const allowedRoles = ['doctor', 'admin', 'pharmacist'];
      if (!allowedRoles.includes(user.role)) {
        // Log access denied errors to console instead of showing to users
        console.error('Access denied: Unauthorized access to patients page');
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/users/patients');

        if (isMounted) {
          setPatients(response.data);

          const highRiskPatients = response.data.filter(patient =>
            patient.medicalConditions?.some(condition =>
              condition.severity === 'high' || condition.severity === 'severe'
            )
          );

          if (highRiskPatients.length > 0) {
            // Send role-specific notifications for high risk patients
            if (user?.role === 'doctor') {
              notifyInfo(
                'High Risk Patients',
                `${highRiskPatients.length} patients require special attention`,
                ['doctor']
              );
            } else if (user?.role === 'admin') {
              notifyInfo(
                'High Risk Patients',
                `${highRiskPatients.length} patients in the system require special attention`,
                ['admin']
              );
            } else if (user?.role === 'pharmacist') {
              notifyInfo(
                'High Risk Patients',
                `${highRiskPatients.length} patients may need special medication considerations`,
                ['pharmacist']
              );
            }
          }

          notifyInfo('Patients Module', 'Viewing all registered patients');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching patients:', error);
          toast.error(error.response?.data?.message || 'Failed to load patients');
          notifyError('Data Loading Error', 'Failed to load patient records');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPatients();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredPatients = patients.filter(patient => {
    return (
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const viewPatientDetails = (patientId) => {
    const patient = patients.find(p => p._id === patientId);
    notifySuccess('Patient Selected', `Viewing details for ${patient?.name || 'patient'}`);
    navigate(`/patient/${patientId}/details`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No patients found
                  </td>
                </tr>
              ) : filteredPatients.map((patient, index) => {
                const isHighRisk = patient.medicalConditions?.some(cond => 
                  cond.severity === 'high' || cond.severity === 'severe'
                );

                return (
                  <motion.tr 
                    key={patient._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {patient.name}
                            {isHighRisk && (
                              <span className="ml-2 px-2 py-0.5 text-xs text-red-800 bg-red-100 rounded-full flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                High Risk
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">Patient ID: {patient._id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        {patient.email && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 mr-1 text-gray-500" />
                            {patient.email}
                          </div>
                        )}
                        {patient.phone && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Phone className="h-4 w-4 mr-1 text-gray-500" />
                            {patient.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {patient.dateOfBirth ? (
                            <span>{calculateAge(patient.dateOfBirth)} years</span>
                          ) : (
                            <span>Age not available</span>
                          )}
                        </div>
                        {patient.gender && (
                          <div className="text-sm text-gray-500 mt-1">
                            {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                        onClick={() => viewPatientDetails(patient._id)}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;

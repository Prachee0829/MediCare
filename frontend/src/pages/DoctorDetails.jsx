import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  AlertCircle,
  Stethoscope,
  Award,
  Briefcase,
  Clock,
  FileText,
  Users,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is admin or pharmacist
    if (user?.role !== 'admin' && user?.role !== 'pharmacist') {
      toast.error('Unauthorized access');
      navigate('/dashboard');
      return;
    }

    fetchDoctorDetails();
  }, [id, user, navigate]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}`);
      setDoctor(response.data);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error(error.response?.data?.message || 'Failed to load doctor details');
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  };

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

  const calculateExperience = (joinDate) => {
    if (!joinDate) return 'N/A';
    const join = new Date(joinDate);
    const today = new Date();
    let years = today.getFullYear() - join.getFullYear();
    const monthDiff = today.getMonth() - join.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < join.getDate())) {
      years--;
    }
    return years > 0 ? `${years} years` : 'Less than a year';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Doctor data not found</h3>
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to doctors
      </button>

      {/* Doctor header */}
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
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                <div className="flex flex-wrap items-center text-gray-500 mt-1">
                  <span className="mr-3">{calculateAge(doctor.dateOfBirth)} years</span>
                  <span className="mr-3">•</span>
                  <span className="mr-3">{doctor.gender}</span>
                  {doctor.specialization && (
                    <>
                      <span className="mr-3">•</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {doctor.specialization}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:items-end">
              <div className="flex items-center text-gray-500 mb-1">
                <Phone className="h-4 w-4 mr-2" />
                {doctor.phone || 'No phone number'}
              </div>
              <div className="flex items-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                {doctor.email}
              </div>
              {doctor.address && (
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  {doctor.address}
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
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedule' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'patients' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('patients')}
            >
              Patients
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
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="text-gray-500 w-32">Full Name:</span>
                      <span className="text-gray-900">{doctor.name}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Age:</span>
                      <span className="text-gray-900">{calculateAge(doctor.dateOfBirth)} years</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Gender:</span>
                      <span className="text-gray-900">{doctor.gender || 'Not specified'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Phone:</span>
                      <span className="text-gray-900">{doctor.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Email:</span>
                      <span className="text-gray-900">{doctor.email}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Address:</span>
                      <span className="text-gray-900">{doctor.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="text-gray-500 w-32">Specialization:</span>
                      <span className="text-gray-900">{doctor.specialization || 'Not specified'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">License ID:</span>
                      <span className="text-gray-900">{doctor.licenseId || 'Not provided'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Experience:</span>
                      <span className="text-gray-900">{calculateExperience(doctor.createdAt)}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${doctor.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {doctor.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Joined:</span>
                      <span className="text-gray-900">{formatDate(doctor.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-gray-900">Specialization</h4>
                        <p className="text-gray-500">{doctor.specialization || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-gray-900">Experience</h4>
                        <p className="text-gray-500">{calculateExperience(doctor.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-gray-900">Patients</h4>
                        <p className="text-gray-500">Data not available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Working Hours</h3>
                </div>
                <p className="text-gray-500 mb-4">This information is not available yet.</p>
              </div>
            </motion.div>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Patients</h3>
                </div>
                <p className="text-gray-500 mb-4">Patient information is not available yet.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
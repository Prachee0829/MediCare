import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Phone, Calendar, Award, FileText, Building, Globe, Clock, MessageSquare, Save, Edit, X, Check, Heart, Thermometer, Activity, Droplet, Briefcase, Users, Shield, Home, MapPin, Pill, Clipboard, Store } from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  
  // Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    mobileNumber: user?.phone || '',
    email: user?.email || ''
  });
  
  // Pharmacist-specific information
  const [pharmacistInfo, setPharmacistInfo] = useState({
    registrationNumber: user?.registrationNumber || '',
    licenseAuthority: user?.licenseAuthority || '',
    licenseStartDate: user?.licenseStartDate ? new Date(user.licenseStartDate).toISOString().split('T')[0] : '',
    licenseExpiryDate: user?.licenseExpiryDate ? new Date(user.licenseExpiryDate).toISOString().split('T')[0] : '',
    qualification: user?.qualification || '',
    yearsOfExperience: user?.yearsOfExperience || '',
    pharmacyName: user?.pharmacyName || '',
    pharmacyAddress: user?.pharmacyAddress || '',
    affiliatedHospital: user?.affiliatedHospital || '',
    languagesSpoken: user?.languagesSpoken || '',
    licenseCertificate: user?.licenseCertificate || '',
    gstNumber: user?.gstNumber || '',
    operatingHours: user?.operatingHours || '',
    weeklyOffDay: user?.weeklyOffDay || '',
    pharmacyRegistrationDate: user?.pharmacyRegistrationDate ? new Date(user.pharmacyRegistrationDate).toISOString().split('T')[0] : ''
  });

  // Professional Information (for doctors)
  const [professionalInfo, setProfessionalInfo] = useState({
    specialization: user?.specialization || '',
    qualification: user?.qualification || '',
    licenseNumber: user?.licenseId || '',
    licenseAuthority: user?.licenseAuthority || '',
    licenseStartDate: user?.licenseStartDate ? new Date(user.licenseStartDate).toISOString().split('T')[0] : '',
    licenseExpiryDate: user?.licenseExpiryDate ? new Date(user.licenseExpiryDate).toISOString().split('T')[0] : '',
    yearsOfExperience: user?.yearsOfExperience || '',
    hospitalAffiliations: user?.hospitalAffiliations || '',
    consultationFee: user?.consultationFee || '',
    languagesSpoken: user?.languagesSpoken || ''
  });

  // Patient-specific information
  const [patientInfo, setPatientInfo] = useState({
    // Medical Information
    bloodGroup: user?.bloodGroup || '',
    existingConditions: user?.existingConditions || '',
    allergies: user?.allergies || '',
    currentMedications: user?.currentMedications || '',
    pastSurgeries: user?.pastSurgeries || '',
    chronicIllnesses: user?.chronicIllnesses || '',
    familyMedicalHistory: user?.familyMedicalHistory || '',
    
    // Emergency Contact
    emergencyContactName: user?.emergencyContact?.name || '',
    emergencyContactRelationship: user?.emergencyContact?.relationship || '',
    emergencyContactNumber: user?.emergencyContact?.number || '',
    
    // Contact & Address
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    country: user?.country || '',
    
    // Other Details
    occupation: user?.occupation || '',
    maritalStatus: user?.maritalStatus || '',
    insuranceProvider: user?.insuranceProvider || '',
    insuranceId: user?.insuranceId || ''
  });

  // Availability (for doctors)
  const [availability, setAvailability] = useState({
    weeklySchedule: {
      monday: { available: false, slots: [] },
      tuesday: { available: false, slots: [] },
      wednesday: { available: false, slots: [] },
      thursday: { available: false, slots: [] },
      friday: { available: false, slots: [] },
      saturday: { available: false, slots: [] },
      sunday: { available: false, slots: [] }
    },
    slotsPerDay: '',
    consultationMode: 'both' // 'online', 'in-person', 'both'
  });

  // Fetch user profile data
  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchDoctorProfile();
    } else if (user?.role === 'patient') {
      fetchPatientProfile();
    } else if (user?.role === 'pharmacist') {
      fetchPharmacistProfile();
    } else if (user?.role === 'admin') {
      fetchAdminProfile();
    }
  }, [user]);
  
  // Save original data when entering edit mode
  useEffect(() => {
    if (editMode) {
      setOriginalData({
        personalInfo: { ...personalInfo },
        professionalInfo: { ...professionalInfo },
        patientInfo: { ...patientInfo },
        pharmacistInfo: { ...pharmacistInfo },
        availability: JSON.parse(JSON.stringify(availability))
      });
    }
  }, [editMode]);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const profileData = response.data;
      
      // Update personal info
      setPersonalInfo({
        fullName: profileData.name || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profileData.gender || '',
        mobileNumber: profileData.phone || '',
        email: profileData.email || ''
      });

      // Update professional info
      setProfessionalInfo(prev => ({
        ...prev,
        specialization: profileData.specialization || '',
        qualification: profileData.qualification || '',
        licenseNumber: profileData.licenseId || '',
        licenseAuthority: profileData.licenseAuthority || '',
        licenseStartDate: profileData.licenseStartDate ? new Date(profileData.licenseStartDate).toISOString().split('T')[0] : '',
        licenseExpiryDate: profileData.licenseExpiryDate ? new Date(profileData.licenseExpiryDate).toISOString().split('T')[0] : '',
        yearsOfExperience: profileData.yearsOfExperience || '',
        hospitalAffiliations: profileData.hospitalAffiliations || '',
        consultationFee: profileData.consultationFee || '',
        languagesSpoken: profileData.languagesSpoken || ''
      }));

      // Availability would be populated if it exists in the backend
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const profileData = response.data;
      
      // Update personal info
      setPersonalInfo({
        fullName: profileData.name || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profileData.gender || '',
        mobileNumber: profileData.phone || '',
        email: profileData.email || ''
      });

      // Update patient-specific info
      setPatientInfo(prev => ({
        ...prev,
        bloodGroup: profileData.bloodGroup || '',
        existingConditions: profileData.existingConditions || '',
        allergies: profileData.allergies || '',
        currentMedications: profileData.currentMedications || '',
        pastSurgeries: profileData.pastSurgeries || '',
        chronicIllnesses: profileData.chronicIllnesses || '',
        familyMedicalHistory: profileData.familyMedicalHistory || '',
        
        emergencyContactName: profileData.emergencyContact?.name || '',
        emergencyContactRelationship: profileData.emergencyContact?.relationship || '',
        emergencyContactNumber: profileData.emergencyContact?.number || '',
        
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zipCode: profileData.zipCode || '',
        country: profileData.country || '',
        
        occupation: profileData.occupation || '',
        maritalStatus: profileData.maritalStatus || '',
        insuranceProvider: profileData.insuranceProvider || '',
        insuranceId: profileData.insuranceId || ''
      }));
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPharmacistProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const profileData = response.data;
      
      // Update personal info
      setPersonalInfo({
        fullName: profileData.name || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profileData.gender || '',
        mobileNumber: profileData.phone || '',
        email: profileData.email || ''
      });

      // Update pharmacist-specific info
      setPharmacistInfo(prev => ({
        ...prev,
        registrationNumber: profileData.registrationNumber || '',
        licenseAuthority: profileData.licenseAuthority || '',
        licenseStartDate: profileData.licenseStartDate ? new Date(profileData.licenseStartDate).toISOString().split('T')[0] : '',
        licenseExpiryDate: profileData.licenseExpiryDate ? new Date(profileData.licenseExpiryDate).toISOString().split('T')[0] : '',
        qualification: profileData.qualification || '',
        yearsOfExperience: profileData.yearsOfExperience || '',
        pharmacyName: profileData.pharmacyName || '',
        pharmacyAddress: profileData.pharmacyAddress || '',
        affiliatedHospital: profileData.affiliatedHospital || '',
        languagesSpoken: profileData.languagesSpoken || '',
        licenseCertificate: profileData.licenseCertificate || '',
        gstNumber: profileData.gstNumber || '',
        operatingHours: profileData.operatingHours || '',
        weeklyOffDay: profileData.weeklyOffDay || '',
        pharmacyRegistrationDate: profileData.pharmacyRegistrationDate ? new Date(profileData.pharmacyRegistrationDate).toISOString().split('T')[0] : ''
      }));
    } catch (error) {
      console.error('Error fetching pharmacist profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const profileData = response.data;
      
      // Update personal info
      setPersonalInfo({
        fullName: profileData.name || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profileData.gender || '',
        mobileNumber: profileData.phone || '',
        email: profileData.email || ''
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfessionalInfoChange = (e) => {
    const { name, value } = e.target;
    setProfessionalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePharmacistInfoChange = (e) => {
    const { name, value } = e.target;
    setPharmacistInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setAvailability(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle time slot changes for a specific day
  const handleTimeSlotChange = (day, index, field, value) => {
    setAvailability(prev => {
      const updatedSlots = [...prev.weeklySchedule[day].slots];
      if (!updatedSlots[index]) {
        updatedSlots[index] = { startTime: '', endTime: '' };
      }
      updatedSlots[index][field] = value;
      
      return {
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...prev.weeklySchedule[day],
            slots: updatedSlots
          }
        }
      };
    });
  };
  
  // Add a new time slot for a specific day
  const addTimeSlot = (day) => {
    setAvailability(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: [...prev.weeklySchedule[day].slots, { startTime: '', endTime: '' }]
        }
      }
    }));
  };
  
  // Remove a time slot for a specific day
  const removeTimeSlot = (day, index) => {
    setAvailability(prev => {
      const updatedSlots = [...prev.weeklySchedule[day].slots];
      updatedSlots.splice(index, 1);
      
      return {
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...prev.weeklySchedule[day],
            slots: updatedSlots
          }
        }
      };
    });
  };

  const handleDayAvailabilityChange = (day, isAvailable) => {
    setAvailability(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          available: isAvailable
        }
      }
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API based on user role
      let profileData = {
        name: personalInfo.fullName,
        dateOfBirth: personalInfo.dateOfBirth,
        gender: personalInfo.gender,
        phone: personalInfo.mobileNumber,
        email: personalInfo.email,
      };

      // Add doctor-specific data
      if (user?.role === 'doctor') {
        profileData = {
          ...profileData,
          specialization: professionalInfo.specialization,
          qualification: professionalInfo.qualification,
          licenseId: professionalInfo.licenseNumber,
          licenseAuthority: professionalInfo.licenseAuthority,
          licenseStartDate: professionalInfo.licenseStartDate,
          licenseExpiryDate: professionalInfo.licenseExpiryDate,
          yearsOfExperience: professionalInfo.yearsOfExperience,
          hospitalAffiliations: professionalInfo.hospitalAffiliations,
          consultationFee: professionalInfo.consultationFee,
          languagesSpoken: professionalInfo.languagesSpoken,
          // Add availability data
          weeklySchedule: availability.weeklySchedule,
          slotsPerDay: availability.slotsPerDay,
          consultationMode: availability.consultationMode
        };
      }
      
      // Add patient-specific data
      if (user?.role === 'patient') {
        profileData = {
          ...profileData,
          bloodGroup: patientInfo.bloodGroup,
          existingConditions: patientInfo.existingConditions,
          allergies: patientInfo.allergies,
          currentMedications: patientInfo.currentMedications,
          pastSurgeries: patientInfo.pastSurgeries,
          chronicIllnesses: patientInfo.chronicIllnesses,
          familyMedicalHistory: patientInfo.familyMedicalHistory,
          
          emergencyContact: {
            name: patientInfo.emergencyContactName,
            relationship: patientInfo.emergencyContactRelationship,
            number: patientInfo.emergencyContactNumber
          },
          
          address: patientInfo.address,
          city: patientInfo.city,
          state: patientInfo.state,
          zipCode: patientInfo.zipCode,
          country: patientInfo.country,
          
          occupation: patientInfo.occupation,
          maritalStatus: patientInfo.maritalStatus,
          insuranceProvider: patientInfo.insuranceProvider,
          insuranceId: patientInfo.insuranceId
        };
      }
      
      // Add pharmacist-specific data
      if (user?.role === 'pharmacist') {
        profileData = {
          ...profileData,
          registrationNumber: pharmacistInfo.registrationNumber,
          licenseAuthority: pharmacistInfo.licenseAuthority,
          licenseStartDate: pharmacistInfo.licenseStartDate,
          licenseExpiryDate: pharmacistInfo.licenseExpiryDate,
          qualification: pharmacistInfo.qualification,
          yearsOfExperience: pharmacistInfo.yearsOfExperience,
          pharmacyName: pharmacistInfo.pharmacyName,
          pharmacyAddress: pharmacistInfo.pharmacyAddress,
          affiliatedHospital: pharmacistInfo.affiliatedHospital,
          languagesSpoken: pharmacistInfo.languagesSpoken,
          licenseCertificate: pharmacistInfo.licenseCertificate,
          gstNumber: pharmacistInfo.gstNumber,
          operatingHours: pharmacistInfo.operatingHours,
          weeklyOffDay: pharmacistInfo.weeklyOffDay,
          pharmacyRegistrationDate: pharmacistInfo.pharmacyRegistrationDate
        };
      }
      
      // Update profile
      const response = await api.put('/auth/profile', profileData);
      
      // Update user data in context and localStorage
      const updatedUserData = response.data.user || profileData;
      updateUser(updatedUserData);
      
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancelEdit = () => {
    // Restore original data
    if (originalData) {
      setPersonalInfo(originalData.personalInfo);
      setProfessionalInfo(originalData.professionalInfo);
      setPatientInfo(originalData.patientInfo);
      setPharmacistInfo(originalData.pharmacistInfo);
      setAvailability(originalData.availability);
    }
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <div className="flex space-x-3 mt-4 md:mt-0">
          {editMode ? (
            <>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
              onClick={() => setEditMode(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {/* Personal Information Section - Common for all users */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={personalInfo.fullName}
                  onChange={handlePersonalInfoChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!editMode}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={personalInfo.dateOfBirth}
                  onChange={handlePersonalInfoChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!editMode}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={personalInfo.gender}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={!editMode}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={personalInfo.mobileNumber}
                  onChange={handlePersonalInfoChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!editMode}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!editMode}
                />
              </div>
            </div>
            
            {/* Blood Group field - Only for patients */}
            {user?.role === 'patient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Droplet className="h-5 w-5 text-red-400" />
                  </div>
                  <select
                    name="bloodGroup"
                    value={patientInfo.bloodGroup}
                    onChange={handlePatientInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Doctor-specific Professional Information Section */}
        {user?.role === 'doctor' && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🏥 Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select
                  name="specialization"
                  value={professionalInfo.specialization}
                  onChange={handleProfessionalInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!editMode}
                >
                  <option value="">Select Specialization</option>
                  <option value="General">General</option>
                  <option value="ENT">ENT</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="qualification"
                    value={professionalInfo.qualification}
                    onChange={handleProfessionalInfoChange}
                    placeholder="MBBS, MD, MS, etc."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical License Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={professionalInfo.licenseNumber}
                    onChange={handleProfessionalInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Issuing Authority</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="licenseAuthority"
                    value={professionalInfo.licenseAuthority}
                    onChange={handleProfessionalInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="licenseStartDate"
                    value={professionalInfo.licenseStartDate}
                    onChange={handleProfessionalInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={professionalInfo.licenseExpiryDate}
                    onChange={handleProfessionalInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={professionalInfo.yearsOfExperience}
                    onChange={handleProfessionalInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic Affiliation(s)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="hospitalAffiliations"
                    value={professionalInfo.hospitalAffiliations}
                    onChange={handleProfessionalInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="consultationFee"
                    value={professionalInfo.consultationFee}
                    onChange={handleProfessionalInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="languagesSpoken"
                    value={professionalInfo.languagesSpoken}
                    onChange={handleProfessionalInfoChange}
                    placeholder="English, Hindi, etc."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient-specific Medical Information Section */}
        {user?.role === 'patient' && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🏥 Medical Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Existing Medical Conditions</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="existingConditions"
                    value={patientInfo.existingConditions}
                    onChange={handlePatientInfoChange}
                    placeholder="Diabetes, Hypertension, etc."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="allergies"
                    value={patientInfo.allergies}
                    onChange={handlePatientInfoChange}
                    placeholder="Medication/food/environmental allergies"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="currentMedications"
                    value={patientInfo.currentMedications}
                    onChange={handlePatientInfoChange}
                    placeholder="List all current medications"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Past Surgeries (optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="pastSurgeries"
                    value={patientInfo.pastSurgeries}
                    onChange={handlePatientInfoChange}
                    placeholder="List any past surgeries"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Illnesses</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="chronicIllnesses"
                    value={patientInfo.chronicIllnesses}
                    onChange={handlePatientInfoChange}
                    placeholder="List any chronic illnesses"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Medical History (optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="familyMedicalHistory"
                    value={patientInfo.familyMedicalHistory}
                    onChange={handlePatientInfoChange}
                    placeholder="Relevant family medical history"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient-specific Emergency Contact Section */}
        {user?.role === 'patient' && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🆘 Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={patientInfo.emergencyContactName}
                    onChange={handlePatientInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="emergencyContactRelationship"
                    value={patientInfo.emergencyContactRelationship}
                    onChange={handlePatientInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="emergencyContactNumber"
                    value={patientInfo.emergencyContactNumber}
                    onChange={handlePatientInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient-specific Contact & Address Section */}
        {user?.role === 'patient' && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 Contact & Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="address"
                    value={patientInfo.address}
                    onChange={handlePatientInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="city"
                    value={patientInfo.city}
                    onChange={handlePatientInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={patientInfo.state}
                  onChange={handlePatientInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={patientInfo.zipCode}
                  onChange={handlePatientInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={patientInfo.country}
                  onChange={handlePatientInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>
        )}

        {/* Patient-specific Other Details Section */}
        {user?.role === 'patient' && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🌐 Other Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="occupation"
                    value={patientInfo.occupation}
                    onChange={handlePatientInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={patientInfo.maritalStatus}
                  onChange={handlePatientInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!editMode}
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider (optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={patientInfo.insuranceProvider}
                    onChange={handlePatientInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance ID / Policy Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="insuranceId"
                    value={patientInfo.insuranceId}
                    onChange={handlePatientInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctor-specific Availability Section */}
        {user?.role === 'doctor' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slots Per Day</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="slotsPerDay"
                    value={availability.slotsPerDay}
                    onChange={handleAvailabilityChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Mode</label>
                <select
                  name="consultationMode"
                  value={availability.consultationMode}
                  onChange={handleAvailabilityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!editMode}
                >
                  <option value="online">Online Only</option>
                  <option value="in-person">In-Person Only</option>
                  <option value="both">Both Online & In-Person</option>
                </select>
              </div>
            </div>
            
            <h3 className="text-md font-medium text-gray-800 mb-3">Weekly Availability Schedule</h3>
            <div className="space-y-4">
              {Object.keys(availability.weeklySchedule).map((day) => (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`available-${day}`}
                        checked={availability.weeklySchedule[day].available}
                        onChange={(e) => handleDayAvailabilityChange(day, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={!editMode}
                      />
                      <label htmlFor={`available-${day}`} className="ml-2 block text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </label>
                    </div>
                    {editMode && availability.weeklySchedule[day].available && (
                      <button
                        type="button"
                        onClick={() => addTimeSlot(day)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add Slot
                      </button>
                    )}
                  </div>
                  
                  {availability.weeklySchedule[day].available && (
                    <div className="space-y-3">
                      {availability.weeklySchedule[day].slots.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No time slots added yet.</p>
                      ) : (
                        availability.weeklySchedule[day].slots.map((slot, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleTimeSlotChange(day, index, 'startTime', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                disabled={!editMode}
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleTimeSlotChange(day, index, 'endTime', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                disabled={!editMode}
                              />
                            </div>
                            {editMode && (
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(day, index)}
                                className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Admin-specific Section */}
        {user?.role === 'admin' && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Admin Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-4">As an administrator, you have access to manage the entire system. Your personal information is displayed above.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="department"
                    value={personalInfo.department || 'Administration'}
                    onChange={handlePersonalInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Description</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="roleDescription"
                    value={personalInfo.roleDescription || 'System Administrator'}
                    onChange={handlePersonalInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Pharmacist-specific Professional Information Section */}
        {user?.role === 'pharmacist' && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">💼 Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacist Registration Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={pharmacistInfo.registrationNumber}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Issuing Authority</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="licenseAuthority"
                    value={pharmacistInfo.licenseAuthority}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="licenseStartDate"
                    value={pharmacistInfo.licenseStartDate}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={pharmacistInfo.licenseExpiryDate}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="qualification"
                    value={pharmacistInfo.qualification}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  >
                    <option value="">Select Qualification</option>
                    <option value="D.Pharm">D.Pharm</option>
                    <option value="B.Pharm">B.Pharm</option>
                    <option value="M.Pharm">M.Pharm</option>
                    <option value="Pharm.D">Pharm.D</option>
                    <option value="Ph.D">Ph.D</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={pharmacistInfo.yearsOfExperience}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registered Pharmacy Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="pharmacyName"
                    value={pharmacistInfo.pharmacyName}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="pharmacyAddress"
                    value={pharmacistInfo.pharmacyAddress}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Affiliated Hospital/Clinic (optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="affiliatedHospital"
                    value={pharmacistInfo.affiliatedHospital}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="languagesSpoken"
                    value={pharmacistInfo.languagesSpoken}
                    onChange={handlePharmacistInfoChange}
                    placeholder="English, Hindi, etc."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Pharmacist-specific Pharmacy Details Section */}
        {user?.role === 'pharmacist' && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🏥 Pharmacy Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Certificate Upload</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    name="licenseCertificate"
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                {pharmacistInfo.licenseCertificate && (
                  <p className="mt-1 text-sm text-gray-500">Current file: {pharmacistInfo.licenseCertificate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (if applicable)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="gstNumber"
                    value={pharmacistInfo.gstNumber}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="operatingHours"
                    value={pharmacistInfo.operatingHours}
                    onChange={handlePharmacistInfoChange}
                    placeholder="e.g., 9:00 AM - 9:00 PM"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Off Day</label>
                <select
                  name="weeklyOffDay"
                  value={pharmacistInfo.weeklyOffDay}
                  onChange={handlePharmacistInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={!editMode}
                >
                  <option value="">Select Day</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Registration Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="pharmacyRegistrationDate"
                    value={pharmacistInfo.pharmacyRegistrationDate}
                    onChange={handlePharmacistInfoChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
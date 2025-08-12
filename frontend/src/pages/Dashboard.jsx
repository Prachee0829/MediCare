import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { fetchPatientHealth } from '../services/patientService.js';
import { 
  Users, 
  Calendar, 
  FileText, 
  Package, 
  TrendingUp, 
  Clock,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  Utensils,
  Moon,
  Droplet,
  Smile
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNotification } from '../services/notificationService.js';

const Dashboard = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyInfo, notifyError } = useNotification();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    inventoryItems: 0,
    revenue: 0,
    growth: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    lowStockItems: 0,
    totalDoctors: 0,
    lastCheckup: null
  });

  // State for chart data
  const [monthlyData, setMonthlyData] = useState([]);
  const [specializationData, setSpecializationData] = useState([]);
  
  // State for patient-specific data
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [patientVitals, setPatientVitals] = useState({
    bloodPressure: '120/80',
    heartRate: '72',
    oxygenSaturation: '98',
    temperature: '98.6'
  });
  
  // State for patient tips carousel
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  // We keep isNewPatient state for backward compatibility, but it's no longer used
  const [isNewPatient, setIsNewPatient] = useState(false);
  const healthTips = [
    { 
      icon: <Utensils className="w-5 h-5 text-green-500" />, 
      category: 'Nutrition Tip', 
      content: 'Eat a colorful plate – more veggies, less sugar.'
    },
    { 
      icon: <Moon className="w-5 h-5 text-indigo-500" />, 
      category: 'Sleep Tip', 
      content: 'Aim for 7–8 hours of quality sleep each night.'
    },
    { 
      icon: <Activity className="w-5 h-5 text-blue-500" />, 
      category: 'Activity Tip', 
      content: 'Even 30 minutes of daily walking improves heart health.'
    },
    { 
      icon: <Droplet className="w-5 h-5 text-cyan-500" />, 
      category: 'Hydration Tip', 
      content: 'Drink at least 8 glasses of water daily.'
    },
    { 
      icon: <Smile className="w-5 h-5 text-yellow-500" />, 
      category: 'Mental Health Tip', 
      content: 'Take 5 minutes a day to practice deep breathing.'
    }
  ];
  
  // Interval ref for tips carousel
  const tipIntervalRef = useRef(null);
  
  // Fetch dashboard statistics
  useEffect(() => {
    // Show welcome notification with role-based targeting
    notifySuccess(
      `Welcome ${user.name}!`, 
      `You're logged in as ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`,
      [user.role] // Only show to the current user's role
    );
    
    const fetchDashboardStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
        notifyError('Dashboard Error', 'Failed to load dashboard statistics');
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  // Fetch monthly data for charts
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const { data } = await api.get('/dashboard/monthly-data');
        // Transform the data for the charts
        const formattedData = data.labels.map((month, index) => ({
          month: month.substring(0, 3), // Abbreviate month names
          appointments: data.data[index],
          // For simplicity, we're using the same data for prescriptions
          // In a real app, you might have separate endpoints for prescription data
          prescriptions: Math.round(data.data[index] * 1.2) // Just a mock calculation
        }));
        setMonthlyData(formattedData);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
        toast.error('Failed to load chart data');
      }
    };
    
    fetchMonthlyData();
  }, []);
  
  // Fetch specialization data (admin only)
  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchSpecializationData = async () => {
        try {
          const { data } = await api.get('/dashboard/specialization-data');
          // Transform the data for the pie chart
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          const formattedData = data.labels.map((label, index) => ({
            name: label,
            value: data.data[index],
            color: colors[index % colors.length]
          }));
          setSpecializationData(formattedData);
        } catch (error) {
          console.error('Error fetching specialization data:', error);
          toast.error('Failed to load specialization data');
        }
      };
      
      fetchSpecializationData();
    }
  }, [user]);
  
  // Fetch upcoming appointment and health data for patient
  useEffect(() => {
    if (user?.role === 'patient') {
      // Fetch upcoming appointments
      const fetchUpcomingAppointment = async () => {
        try {
          // Get all appointments for the patient
          const { data } = await api.get('/appointments');
          
          // Filter for upcoming appointments (not cancelled and date is in the future)
          const upcomingAppointments = data.filter(appointment => {
            return appointment.status !== 'cancelled' && 
                   new Date(appointment.date) >= new Date() &&
                   appointment.doctor;
          });
          
          // Sort by date (closest first)
          upcomingAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
          
          if (upcomingAppointments.length > 0) {
            // Format the appointment data
            const nextAppointment = {
              doctorName: upcomingAppointments[0].doctor.name,
              date: upcomingAppointments[0].date,
              time: upcomingAppointments[0].time,
              type: upcomingAppointments[0].type
            };
            setUpcomingAppointment(nextAppointment);
          }
          
          // We no longer need to check if this is a new patient since we show tips for all patients
          // Just keeping the filter logic in case we need it elsewhere
          const pastAppointments = data.filter(appointment => {
            return new Date(appointment.date) < new Date() && appointment.status === 'completed';
          });
          
        } catch (error) {
          console.error('Error fetching upcoming appointment:', error);
          // Not showing toast here as it's not critical
        }
      };
      
      // Fetch patient health data from medical records
  const fetchPatientHealthData = async () => {
    try {
      // First try to get the patient's medical records
      const { data: appointments } = await api.get('/appointments');
      
      // Find the most recent completed appointment with diagnosis
      const completedAppointments = appointments.filter(app => 
        app.status === 'completed' && app.diagnosis
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (completedAppointments.length > 0) {
        const lastAppointment = completedAppointments[0];
        // Update the last checkup date in stats
        setStats(prev => ({
          ...prev,
          lastCheckup: lastAppointment.date
        }));
      }
      
      // Try to get medical records if available
      try {
        let medicalRecords;
        
        // Use the appropriate endpoint based on user role
        if (user?.role === 'patient') {
          // Use the dedicated service function with proper authorization for patients
          medicalRecords = await fetchPatientHealth();
        } else {
          // For doctors and admins, use the regular API
          const { data } = await api.get('/medical-records');
          medicalRecords = data;
        }
        
        if (medicalRecords && medicalRecords.length > 0) {
          // Sort by date (most recent first)
          const sortedRecords = [...medicalRecords].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          
          const latestRecord = sortedRecords[0];
          
          if (latestRecord.vitalSigns) {
            // Set the patient's vital signs from their latest medical record
            setPatientVitals({
              bloodPressure: latestRecord.vitalSigns.bloodPressure || '120/80',
              heartRate: latestRecord.vitalSigns.heartRate || '72',
              oxygenSaturation: latestRecord.vitalSigns.oxygenSaturation || '98',
              temperature: latestRecord.vitalSigns.temperature || '98.6'
            });
          }
        }
      } catch (error) {
        console.error('Medical records not available:', error);
        // Fallback to default values already set in state
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      // Fallback to default values already set in state
    }
  };
      
      fetchUpcomingAppointment();
      fetchPatientHealthData();
    }
  }, [user]);
  
  // Effect for rotating health tips for all patients
  useEffect(() => {
    if (user?.role === 'patient') {
      // Set up interval to rotate tips every 5 seconds
      tipIntervalRef.current = setInterval(() => {
        setCurrentTipIndex(prevIndex => (prevIndex + 1) % healthTips.length);
      }, 5000);
      
      // Clean up interval on unmount
      return () => {
        if (tipIntervalRef.current) {
          clearInterval(tipIntervalRef.current);
        }
      };
    }
  }, [user?.role, healthTips.length]);

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPatients}</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" /> +12% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.revenue.toLocaleString()}</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" /> +{stats.growth}% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prescriptions</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPrescriptions}</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" /> +8% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inventory Items</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.inventoryItems}</h3>
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" /> 15 low stock
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Activity</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="appointments" fill="#3B82F6" name="Appointments" />
                      <Bar dataKey="prescriptions" fill="#10B981" name="Prescriptions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Distribution</h3>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={specializationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {specializationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        );
      
      case 'doctor':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingAppointments}</h3>
                    <p className="text-sm text-blue-600 flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-1" /> {stats.confirmedAppointments} confirmed
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Patients</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPatients}</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" /> {stats.totalPatients > 0 ? 'Active patients' : 'No patients yet'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prescriptions</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPrescriptions}</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" /> {stats.totalPrescriptions > 0 ? 'Active prescriptions' : 'No prescriptions yet'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment History</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="appointments" stroke="#3B82F6" activeDot={{ r: 8 }} name="Appointments" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Prescription Analytics</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="prescriptions" stroke="#10B981" activeDot={{ r: 8 }} name="Prescriptions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        );
      
      case 'patient':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Upcoming Appointment</p>
                    {upcomingAppointment ? (
                      <>
                        <h3 className="text-xl font-bold text-gray-800 mt-1">Dr. {upcomingAppointment.doctorName}</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1 text-blue-500" /> 
                          {new Date(upcomingAppointment.date).toLocaleDateString()}, {upcomingAppointment.time}
                        </p>
                        {upcomingAppointment.type && (
                          <p className="text-xs text-gray-500 mt-1">
                            Type: {upcomingAppointment.type}
                          </p>
                        )}
                      </>
                    ) : (
                      <h3 className="text-lg font-medium text-gray-600 mt-2">No Upcoming Appointments</h3>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Prescriptions</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activePrescriptions || stats.totalPrescriptions || 0}</h3>
                    <p className="text-sm text-orange-600 flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" /> 
                      {stats.prescriptionsNeedingRefill ? `${stats.prescriptionsNeedingRefill} needs refill` : 
                       `${Math.ceil((stats.activePrescriptions || stats.totalPrescriptions) * 0.2) || 0} needs refill`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Health Status</p>
                    <h3 className="text-xl font-bold text-green-600 mt-1">Good</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Heart className="w-4 h-4 mr-1 text-red-500" /> 
                      {stats.lastCheckup ? `Last checkup: ${new Date(stats.lastCheckup).toLocaleDateString()}` : 'No recent checkup'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Recent Health Metrics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 pb-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Health Metrics</h3>
                <p className="text-sm text-gray-500 mb-4">Your latest health measurements from your medical records</p>
              </div>
              
              {patientVitals ? (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Blood Pressure Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Activity className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-900">Blood Pressure</h4>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-blue-800">{patientVitals.bloodPressure || 'N/A'}</span>
                        <span className="ml-2 text-sm text-blue-600">mmHg</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">Last measured: {stats.lastCheckup ? new Date(stats.lastCheckup).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    
                    {/* Heart Rate Card */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Heart className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="font-medium text-red-900">Heart Rate</h4>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-red-800">{patientVitals.heartRate || 'N/A'}</span>
                        <span className="ml-2 text-sm text-red-600">bpm</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">Last measured: {stats.lastCheckup ? new Date(stats.lastCheckup).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    
                    {/* Oxygen Saturation Card */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Droplet className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-green-900">Oxygen Saturation</h4>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-green-800">{patientVitals.oxygenSaturation || 'N/A'}</span>
                        <span className="ml-2 text-sm text-green-600">%</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">Last measured: {stats.lastCheckup ? new Date(stats.lastCheckup).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    
                    {/* Temperature Card */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                        <h4 className="font-medium text-orange-900">Temperature</h4>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-orange-800">{patientVitals.temperature || 'N/A'}</span>
                        <span className="ml-2 text-sm text-orange-600">°F</span>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">Last measured: {stats.lastCheckup ? new Date(stats.lastCheckup).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link to={`/prescriptions/patient/${user._id}`} className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
                      View Complete Health Record →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Health Data Available</h4>
                  <p className="text-sm text-gray-500 mb-4">Your health metrics will appear here after your next checkup</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Schedule a Checkup
                  </button>
                </div>
              )}
            </motion.div>
            
            {/* Healthy Lifestyle Tips for All Patients */}
            {user?.role === 'patient' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 mt-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Healthy Lifestyle Tips</h3>
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-5">
                  <div className="flex items-center">
                    <div className="mr-4 p-3 bg-white rounded-full shadow-sm">
                      {healthTips[currentTipIndex].icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        {healthTips[currentTipIndex].category}
                      </p>
                      <p className="text-base text-gray-700 mt-1">
                        {healthTips[currentTipIndex].content}
                      </p>
                    </div>
                  </div>
                  
                  {/* Tip Navigation Dots */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {healthTips.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentTipIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTipIndex === index ? 'bg-blue-500 w-4' : 'bg-gray-300'}`}
                        aria-label={`View tip ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );
      
      case 'pharmacist':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Prescriptions</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">12</h3>
                    <p className="text-sm text-orange-600 flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-1" /> 3 urgent
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inventory Status</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.inventoryItems}</h3>
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" /> 15 low stock
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Today</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">28</h3>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <CheckCircle className="w-4 h-4 mr-1" /> All on time
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Inventory Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { category: 'Antibiotics', count: 120, lowStock: 5 },
                    { category: 'Pain Relief', count: 85, lowStock: 0 },
                    { category: 'Cardiac', count: 65, lowStock: 3 },
                    { category: 'Respiratory', count: 45, lowStock: 2 },
                    { category: 'Vitamins', count: 95, lowStock: 0 },
                    { category: 'Others', count: 40, lowStock: 5 }
                  ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" name="Total Items" />
                    <Bar dataKey="lowStock" fill="#EF4444" name="Low Stock" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        );
      
      default:
        return <div>Loading dashboard...</div>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'User'}!</p>
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      
      {getDashboardContent()}
    </div>
  );
};

export default Dashboard;
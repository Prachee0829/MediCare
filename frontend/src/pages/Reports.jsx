import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, ChevronDown, BarChart2, PieChart, TrendingUp, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [showFilters, setShowFilters] = useState(false);
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  
  // State for API data
  const [revenueData, setRevenueData] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [departmentRevenue, setDepartmentRevenue] = useState([]);
  const [appointmentsByType, setAppointmentsByType] = useState([]);
  const [overviewData, setOverviewData] = useState(null);
  
  const { token, user } = useAuth();
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Configure headers with authentication token
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        
        // Fetch data based on user role
        if (user.role === 'admin') {
          // Admin can access all reports
          const [revenueRes, patientRes, departmentRes, appointmentsTypeRes, overviewRes] = await Promise.all([
            axios.get('/api/reports/revenue', config),
            axios.get('/api/reports/patients', config),
            axios.get('/api/reports/department-revenue', config),
            axios.get('/api/reports/appointments-by-type', config),
            axios.get('/api/reports/overview', config)
          ]);
          
          setRevenueData(revenueRes.data);
          setPatientData(patientRes.data);
          setDepartmentRevenue(departmentRes.data);
          setAppointmentsByType(appointmentsTypeRes.data);
          setOverviewData(overviewRes.data);
        } else if (user.role === 'doctor') {
          // Doctors can only access patient data and appointments by type
          const [patientRes, appointmentsTypeRes] = await Promise.all([
            axios.get('/api/reports/patients', config),
            axios.get('/api/reports/appointments-by-type', config)
          ]);
          
          setPatientData(patientRes.data);
          setAppointmentsByType(appointmentsTypeRes.data);
          
          // Set default data for charts doctors can't access
          setRevenueData([
            { month: 'Jan', amount: 0 }, { month: 'Feb', amount: 0 },
            { month: 'Mar', amount: 0 }, { month: 'Apr', amount: 0 },
            { month: 'May', amount: 0 }, { month: 'Jun', amount: 0 },
            { month: 'Jul', amount: 0 }, { month: 'Aug', amount: 0 },
            { month: 'Sep', amount: 0 }, { month: 'Oct', amount: 0 },
            { month: 'Nov', amount: 0 }, { month: 'Dec', amount: 0 },
          ]);
          setDepartmentRevenue([]);
        } else {
          // Other roles have limited access
          toast.error('You do not have permission to view reports');
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again.');
        toast.error('Failed to load report data');
        
        // Set default data if API fails
        setRevenueData([
          { month: 'Jan', amount: 0 }, { month: 'Feb', amount: 0 },
          { month: 'Mar', amount: 0 }, { month: 'Apr', amount: 0 },
          { month: 'May', amount: 0 }, { month: 'Jun', amount: 0 },
          { month: 'Jul', amount: 0 }, { month: 'Aug', amount: 0 },
          { month: 'Sep', amount: 0 }, { month: 'Oct', amount: 0 },
          { month: 'Nov', amount: 0 }, { month: 'Dec', amount: 0 },
        ]);
        setPatientData([
          { month: 'Jan', count: 0 }, { month: 'Feb', count: 0 },
          { month: 'Mar', count: 0 }, { month: 'Apr', count: 0 },
          { month: 'May', count: 0 }, { month: 'Jun', count: 0 },
          { month: 'Jul', count: 0 }, { month: 'Aug', count: 0 },
          { month: 'Sep', count: 0 }, { month: 'Oct', count: 0 },
          { month: 'Nov', count: 0 }, { month: 'Dec', count: 0 },
        ]);
        setDepartmentRevenue([]);
        setAppointmentsByType([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, user]);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate metrics from API data or use data from overview endpoint
  const totalRevenue = overviewData ? overviewData.totalRevenue : revenueData.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate total patients
  const totalPatients = overviewData ? overviewData.totalPatients : patientData.reduce((sum, item) => sum + item.count, 0);

  // Calculate average revenue per patient
  const avgRevenuePerPatient = overviewData ? overviewData.avgRevenuePerPatient : (totalPatients > 0 ? totalRevenue / totalPatients : 0);

  // Get current month data
  const currentMonth = new Date().getMonth();
  const previousMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1;
  
  const currentMonthRevenue = overviewData ? overviewData.currentMonthRevenue : 
    (revenueData.length > 0 ? revenueData[currentMonth]?.amount || 0 : 0);
    
  const previousMonthRevenue = overviewData ? overviewData.previousMonthRevenue : 
    (revenueData.length > 0 ? revenueData[previousMonth]?.amount || 0 : 0);
    
  const revenueGrowth = overviewData ? overviewData.revenueGrowth : 
    (previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0);

  const currentMonthPatients = patientData.length > 0 ? patientData[currentMonth]?.count || 0 : 0;
  const previousMonthPatients = patientData.length > 0 ? patientData[previousMonth]?.count || 0 : 0;
  const patientGrowth = previousMonthPatients > 0 ? ((currentMonthPatients - previousMonthPatients) / previousMonthPatients) * 100 : 0;

  // Function to convert data to CSV format
  const convertToCSV = (data, headers) => {
    const headerRow = headers.join(',');
    const rows = data.map(item => {
      return headers.map(header => {
        // Handle nested properties
        const value = header.split('.').reduce((obj, key) => obj?.[key], item);
        // Wrap value in quotes if it contains commas
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',');
    });
    return [headerRow, ...rows].join('\n');
  };

  // Function to handle exporting data
  const handleExportData = async () => {
    try {
      setExportLoading(true);
      let csvData = '';
      let filename = '';
      
      // Export different data based on the current report type
      if (reportType === 'financial' || reportType === 'overview') {
        // Export revenue data
        const headers = ['month', 'amount'];
        csvData = convertToCSV(revenueData, headers);
        filename = `revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (reportType === 'patients') {
        // Export patient data
        const headers = ['month', 'count'];
        csvData = convertToCSV(patientData, headers);
        filename = `patient_report_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (reportType === 'appointments') {
        // Export appointments by type
        const headers = ['type', 'count'];
        csvData = convertToCSV(appointmentsByType, headers);
        filename = `appointments_report_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        // Default to department revenue
        const headers = ['department', 'amount'];
        csvData = convertToCSV(departmentRevenue, headers);
        filename = `department_revenue_${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      // Create a Blob with the CSV data
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
      
      // Use file-saver to save the file
      saveAs(blob, filename);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <button 
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5 mr-2 text-gray-500" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-1 text-gray-500 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
            </button>
          </div>
          <div className="relative">
            <button 
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <select 
                className="appearance-none bg-transparent border-none focus:outline-none pr-8"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </button>
          </div>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            onClick={handleExportData}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="overview">Overview</option>
                <option value="financial">Financial</option>
                <option value="patients">Patients</option>
                <option value="appointments">Appointments</option>
                <option value="inventory">Inventory</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue="all"
              >
                <option value="all">All Departments</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="dermatology">Dermatology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue="all"
              >
                <option value="all">All Doctors</option>
                <option value="dr-johnson">Dr. Sarah Johnson</option>
                <option value="dr-chen">Dr. Michael Chen</option>
                <option value="dr-martinez">Dr. Robert Martinez</option>
                <option value="dr-lee">Dr. Jessica Lee</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <span className="h-6 w-6 text-blue-600 font-bold">₹</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <h3 className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              {revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <h3 className="text-xl font-bold text-gray-900">{totalPatients.toLocaleString()}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm ${patientGrowth >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${patientGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              {patientGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Appointments</p>
              <h3 className="text-xl font-bold text-gray-900">1,380</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
              8.2%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 mr-4">
              <span className="h-6 w-6 text-amber-600 font-bold">₹</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Revenue/Patient</p>
              <h3 className="text-xl font-bold text-gray-900">{formatCurrency(avgRevenuePerPatient)}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
              3.5%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-sm text-gray-600">Monthly Revenue</span>
            </div>
          </div>
          <div className="h-64 w-full">
            {/* This would be a real chart in a production app */}
            <div className="h-full w-full flex items-end space-x-2">
              {revenueData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t-sm" 
                    style={{ height: `${(item.amount / 65000) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-1">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Department Revenue</h3>
          </div>
          <div className="h-64 w-full flex">
            {/* This would be a real chart in a production app */}
            <div className="w-1/2 h-full flex items-center justify-center">
              <div className="relative w-32 h-32 rounded-full bg-gray-100">
                {departmentRevenue.map((item, index) => {
                  const total = departmentRevenue.reduce((sum, i) => sum + i.amount, 0);
                  const percentage = (item.amount / total) * 100;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
                  return (
                    <div 
                      key={index}
                      className={`absolute top-0 left-0 w-32 h-32 ${colors[index % colors.length]}`}
                      style={{
                        clipPath: `conic-gradient(from ${index * 60}deg, currentColor ${percentage}%, transparent ${percentage}%)`,
                        opacity: 0.8
                      }}
                    ></div>
                  );
                })}
              </div>
            </div>
            <div className="w-1/2 h-full flex flex-col justify-center space-y-2">
              {departmentRevenue.map((item, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
                return (
                  <div key={index} className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`}></span>
                    <span className="text-sm text-gray-600">{item.department}</span>
                    <span className="text-sm font-medium text-gray-900 ml-auto">{formatCurrency(item.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Patient Trend</h3>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-600">Monthly Patients</span>
            </div>
          </div>
          <div className="h-64 w-full">
            {/* This would be a real chart in a production app */}
            <div className="h-full w-full flex items-end space-x-2">
              {patientData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t-sm" 
                    style={{ height: `${(item.count / 360) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-1">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Appointments by Type</h3>
          </div>
          <div className="h-64 w-full">
            {/* This would be a real chart in a production app */}
            <div className="h-full w-full flex flex-col justify-center space-y-4">
              {appointmentsByType.map((item, index) => {
                const total = appointmentsByType.reduce((sum, i) => sum + i.count, 0);
                const percentage = (item.count / total) * 100;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'];
                return (
                  <div key={index} className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">{item.type}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${colors[index % colors.length]}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
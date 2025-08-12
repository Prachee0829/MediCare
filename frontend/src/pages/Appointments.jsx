import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Calendar, Clock, User, Phone, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import NewAppointmentModal from '../components/NewAppointmentModal.jsx';
import EditAppointmentModal from '../components/EditAppointmentModal.jsx';
import { useNotification } from '../services/notificationService.js';

const Appointments = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyInfo, notifyError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: 'John Doe',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialization: 'General Medicine',
      date: '2023-06-15',
      time: '09:00 AM',
      status: 'confirmed',
      type: 'General Checkup',
      contact: '+1 (555) 123-4567',
      notes: 'Follow-up appointment for medication review'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      doctorName: 'Dr. Michael Chen',
      doctorSpecialization: 'Cardiology',
      date: '2023-06-15',
      time: '10:30 AM',
      status: 'confirmed',
      type: 'Cardiology Consultation',
      contact: '+1 (555) 987-6543',
      notes: 'New patient referral from Dr. Williams'
    },
    {
      id: 3,
      patientName: 'Robert Johnson',
      doctorName: 'Dr. Emily Rodriguez',
      doctorSpecialization: 'Dermatology',
      date: '2023-06-15',
      time: '01:15 PM',
      status: 'cancelled',
      type: 'Dermatology',
      contact: '+1 (555) 456-7890',
      notes: 'Patient requested cancellation due to scheduling conflict'
    },
    {
      id: 4,
      patientName: 'Maria Garcia',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialization: 'General Medicine',
      date: '2023-06-16',
      time: '11:00 AM',
      status: 'confirmed',
      type: 'Pediatric Checkup',
      contact: '+1 (555) 234-5678',
      notes: 'Annual wellness exam'
    },
    {
      id: 5,
      patientName: 'David Wilson',
      doctorName: 'Dr. James Taylor',
      doctorSpecialization: 'Orthopedics',
      date: '2023-06-16',
      time: '02:45 PM',
      status: 'pending',
      type: 'Orthopedic Consultation',
      contact: '+1 (555) 876-5432',
      notes: 'Discussing treatment options for knee pain'
    },
    {
      id: 6,
      patientName: 'Sarah Thompson',
      doctorName: 'Dr. Michael Chen',
      doctorSpecialization: 'Cardiology',
      date: '2023-06-17',
      time: '09:30 AM',
      status: 'confirmed',
      type: 'Cardiology Follow-up',
      contact: '+1 (555) 345-6789',
      notes: 'Review of recent test results'
    }
  ]);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchAppointments();
    notifyInfo('Appointments', 'Viewing your appointment schedule');
  }, []);
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments');
      console.log('API response data:', response.data);
      setAppointments(response.data);
      
      // Notify about upcoming appointments
      const upcomingAppointments = response.data.filter(appointment => 
        appointment.status === 'confirmed' && new Date(appointment.date) > new Date()
      );
      
      if (upcomingAppointments.length > 0) {
        notifyInfo(
          'Upcoming Appointments', 
          `You have ${upcomingAppointments.length} upcoming appointment(s)`
        );
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      notifyError('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Get patient and doctor names, handling both API and hardcoded data formats
    const patientName = appointment.patient?.name || appointment.patientName || '';
    const doctorName = appointment.doctor?.name || appointment.doctorName || '';
    const appointmentType = appointment.type || '';
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointmentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter appointments based on user role
    if (user?.role === 'doctor') {
      return matchesStatus && matchesSearch && doctorName === user.name;
    }
    
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      setAppointments(appointments.map(appointment => 
        appointment._id === id ? { ...appointment, status: newStatus } : appointment
      ));
      toast.success(`Appointment ${newStatus}`);
      
      // Add notification based on status with role-based targeting
      const appointment = appointments.find(a => a._id === id);
      const patientName = appointment?.patient?.name || appointment?.patientName || 'Patient';
      const doctorName = appointment?.doctor?.name || appointment?.doctorName || 'Doctor';
      
      if (newStatus === 'confirmed') {
        // Send to doctor and patient only
        notifySuccess(
          'Appointment Confirmed', 
          `Appointment with ${patientName} has been confirmed`, 
          ['doctor', 'admin']
        );
        notifySuccess(
          'Appointment Confirmed', 
          `Your appointment with Dr. ${doctorName} has been confirmed`, 
          ['patient']
        );
      } else if (newStatus === 'cancelled') {
        // Send to doctor and patient only
        notifyInfo(
          'Appointment Cancelled', 
          `Appointment with ${patientName} has been cancelled`, 
          ['doctor', 'admin']
        );
        notifyInfo(
          'Appointment Cancelled', 
          `Your appointment with Dr. ${doctorName} has been cancelled`, 
          ['patient']
        );
      } else if (newStatus === 'completed') {
        // Send to doctor and patient only
        notifySuccess(
          'Appointment Completed', 
          `Appointment with ${patientName} has been marked as completed`, 
          ['doctor', 'admin']
        );
        notifySuccess(
          'Appointment Completed', 
          `Your appointment with Dr. ${doctorName} has been completed`, 
          ['patient']
        );
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
      notifyError('Status Update Failed', 'Could not update the appointment status');
    }
  };

  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {user?.role !== 'doctor' && (
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setIsNewAppointmentModalOpen(true)}
            >
              + New Appointment
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {user?.role === 'doctor' ? 'Patient' : 'Patient/Doctor'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Loading appointments...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              ) : filteredAppointments.map((appointment, index) => (
                <motion.tr 
                  key={appointment._id || appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openAppointmentDetails(appointment)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient?.name || appointment.patientName}
                        </div>
                        {user?.role !== 'doctor' && (
                          <>
                            <div className="text-sm text-gray-500">
                              {appointment.doctor?.name || appointment.doctorName}
                            </div>
                            {(appointment.doctor?.specialization || appointment.doctorSpecialization) && (
                              <div className="text-xs text-blue-500">
                                {appointment.doctor?.specialization || appointment.doctorSpecialization}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        {appointment.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(appointment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(appointment);
                          setIsEditAppointmentModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      {appointment.status !== 'confirmed' && (user?.role === 'doctor' || user?.role === 'admin' || user?.role === 'pharmacist') && (
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(appointment._id || appointment.id, 'confirmed');
                          }}
                        >
                          Confirm
                        </button>
                      )}
                      {appointment.status !== 'cancelled' && (
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(appointment._id || appointment.id, 'cancelled');
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
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
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{selectedAppointment.patientName}</h3>
                      <p className="text-gray-500">{selectedAppointment.type}</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedAppointment.status)}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Appointment Info</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Date</p>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedAppointment.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Time</p>
                          <p className="text-sm text-gray-600">{selectedAppointment.time}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Doctor</p>
                          <p className="text-sm text-gray-600">{selectedAppointment.doctorName}</p>
                          {selectedAppointment.doctorSpecialization && (
                            <p className="text-xs text-blue-500">{selectedAppointment.doctorSpecialization}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">{selectedAppointment.contact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{selectedAppointment.notes}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  {selectedAppointment.status !== 'confirmed' && user?.role === 'doctor' && (
                    <button 
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      onClick={() => {
                        handleStatusChange(selectedAppointment._id || selectedAppointment.id, 'confirmed');
                        setIsModalOpen(false);
                      }}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirm Appointment
                    </button>
                  )}
                  {selectedAppointment.status !== 'cancelled' && (
                    <button 
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => {
                        handleStatusChange(selectedAppointment._id || selectedAppointment.id, 'cancelled');
                        setIsModalOpen(false);
                      }}
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Cancel Appointment
                    </button>
                  )}
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
      
      {/* New Appointment Modal */}
      <NewAppointmentModal 
        isOpen={isNewAppointmentModalOpen} 
        onClose={() => setIsNewAppointmentModalOpen(false)} 
        onAppointmentCreated={(newAppointment) => {
          setAppointments([...appointments, newAppointment]);
        }}
      />
      
      {/* Edit Appointment Modal */}
      <EditAppointmentModal 
        isOpen={isEditAppointmentModalOpen} 
        onClose={() => setIsEditAppointmentModalOpen(false)} 
        appointment={selectedAppointment}
        onAppointmentUpdated={(updatedAppointment) => {
          setAppointments(appointments.map(app => 
            (app._id === updatedAppointment._id || app.id === updatedAppointment._id) 
              ? updatedAppointment 
              : app
          ));
          fetchAppointments(); // Refresh the list to ensure we have the latest data
        }}
      />
    </div>
  );
};

export default Appointments;
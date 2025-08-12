import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FileText, User, Calendar, Clock, Pill, AlertCircle, CheckCircle, Search, Filter, Download, ExternalLink, Printer, X } from 'lucide-react';
import { motion } from 'framer-motion';
import UpdatedNewPrescriptionModal from '../components/UpdatedNewPrescriptionModal.jsx';
import EditPrescriptionModal from '../components/EditPrescriptionModal.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { useNotification } from '../services/notificationService.js';

const Prescriptions = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyInfo, notifyError } = useNotification();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewPrescriptionModalOpen, setIsNewPrescriptionModalOpen] = useState(false);
  const [isEditPrescriptionModalOpen, setIsEditPrescriptionModalOpen] = useState(false);
  const [prescriptionToEdit, setPrescriptionToEdit] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrescriptions();
    // Send role-specific notification
    if (user?.role === 'doctor') {
      notifyInfo('Prescriptions', 'Viewing patient prescription records', ['doctor']);
    } else if (user?.role === 'patient') {
      notifyInfo('Prescriptions', 'Viewing your prescription records', ['patient']);
    } else if (user?.role === 'pharmacist') {
      notifyInfo('Prescriptions', 'Viewing prescription records to dispense', ['pharmacist']);
    } else if (user?.role === 'admin') {
      notifyInfo('Prescriptions', 'Viewing all prescription records', ['admin']);
    }
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prescriptions');
      console.log('API response data:', response.data);
      setPrescriptions(response.data);
      
      // Check for expiring prescriptions
      const today = new Date();
      const expiringPrescriptions = response.data.filter(prescription => {
        if (!prescription.expiryDate) return false;
        const expiryDate = new Date(prescription.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
      });
      
      if (expiringPrescriptions.length > 0) {
        // Send role-specific notifications for expiring prescriptions
        if (user?.role === 'patient') {
          notifyInfo(
            'Expiring Prescriptions', 
            `You have ${expiringPrescriptions.length} prescription(s) expiring soon`,
            ['patient']
          );
        } else if (user?.role === 'doctor') {
          notifyInfo(
            'Expiring Prescriptions', 
            `${expiringPrescriptions.length} patient prescription(s) are expiring soon`,
            ['doctor']
          );
        } else if (user?.role === 'pharmacist') {
          notifyInfo(
            'Expiring Prescriptions', 
            `${expiringPrescriptions.length} prescription(s) in the system are expiring soon`,
            ['pharmacist']
          );
        } else if (user?.role === 'admin') {
          notifyInfo(
            'Expiring Prescriptions', 
            `${expiringPrescriptions.length} prescription(s) in the system are expiring soon`,
            ['admin']
          );
        }
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
      notifyError('Error', 'Failed to load prescriptions');
      // Fall back to sample data if API fails
      setPrescriptions([
        {
          id: 1,
          patientName: 'John Doe',
          doctorName: 'Dr. Sarah Johnson',
          date: '2023-06-10',
          expiryDate: '2023-07-10',
          medications: [
            { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
            { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed for pain', duration: '5 days' }
          ],
          status: 'active',
          notes: 'Take with food. Complete the full course of antibiotics.'
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          doctorName: 'Dr. Michael Chen',
          date: '2023-06-08',
          expiryDate: '2023-07-08',
          medications: [
            { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
            { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '30 days' }
          ],
          status: 'active',
          notes: 'Monitor blood pressure regularly. Report any side effects.'
        },
        {
          id: 3,
          patientName: 'Robert Johnson',
          doctorName: 'Dr. Emily Rodriguez',
          date: '2023-05-20',
          expiryDate: '2023-06-20',
          medications: [
            { name: 'Fluoxetine', dosage: '20mg', frequency: 'Once daily in the morning', duration: '30 days' }
          ],
          status: 'expired',
          notes: 'Follow up appointment scheduled for June 18.'
        },
        {
          id: 4,
          patientName: 'Maria Garcia',
          doctorName: 'Dr. Sarah Johnson',
          date: '2023-06-12',
          expiryDate: '2023-07-12',
          medications: [
            { name: 'Amoxicillin', dosage: '250mg', frequency: 'Three times daily', duration: '10 days' },
            { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '14 days' }
          ],
          status: 'active',
          notes: 'Pediatric dosage. Monitor for allergic reactions.'
        },
        {
          id: 5,
          patientName: 'David Wilson',
          doctorName: 'Dr. James Taylor',
          date: '2023-05-15',
          expiryDate: '2023-06-15',
          medications: [
            { name: 'Naproxen', dosage: '500mg', frequency: 'Twice daily', duration: '14 days' },
            { name: 'Cyclobenzaprine', dosage: '10mg', frequency: 'Three times daily', duration: '7 days' }
          ],
          status: 'expired',
          notes: 'For back pain and muscle spasms. Avoid alcohol.'
        },
        {
          id: 6,
          patientName: 'Sarah Thompson',
          doctorName: 'Dr. Michael Chen',
          date: '2023-06-05',
          expiryDate: '2023-07-05',
          medications: [
            { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily with meals', duration: '30 days' },
            { name: 'Glimepiride', dosage: '2mg', frequency: 'Once daily before breakfast', duration: '30 days' }
          ],
          status: 'active',
          notes: 'Monitor blood glucose levels. Follow diabetic diet plan.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  const filteredPrescriptions = prescriptions.filter(prescription => {
  const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;

  const patientName = prescription.patient?.name || prescription.patientName || '';
  const doctorName = prescription.doctor?.name || prescription.doctorName || '';

  const matchesSearch = !searchTerm || (
    patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prescription.medications && prescription.medications.some(med => 
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const matchesDoctor = user?.role !== 'doctor' || doctorName === user?.name;
  const matchesPatient = user?.role !== 'patient' || (
    prescription.patient &&
    (
      prescription.patient._id === user?._id ||
      prescription.patient.name?.toLowerCase() === user?.name?.toLowerCase() ||
      prescription.patient.email?.toLowerCase() === user?.email?.toLowerCase()
    )
  );

  return matchesStatus && matchesSearch && matchesDoctor && matchesPatient;
});

  // const filteredPrescriptions = prescriptions.filter(prescription => {
  //   // Filter by status
  //   const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    
  //   // Get patient and doctor names, handling both API and hardcoded data formats
  //   const patientName = prescription.patient?.name || prescription.patientName || '';
  //   const doctorName = prescription.doctor?.name || prescription.doctorName || '';
  //   const patientId = prescription.patient?._id || '';
    
  //   // Filter by search term
  //   const matchesSearch = 
  //     patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (prescription.medications && prescription.medications.some(med => 
  //       med.name.toLowerCase().includes(searchTerm.toLowerCase())
  //     ));
    
  //   // Filter by doctor (only show prescriptions created by the logged-in doctor)
  //   const matchesDoctor = user?.role !== 'doctor' || doctorName === user?.name;
    
  //   // Filter by patient (only show prescriptions for the logged-in patient)
  //   const matchesPatient = user?.role !== 'patient' || patientId === user?._id || patientName === user?.name;
    
  //   return matchesStatus && matchesSearch && matchesDoctor && matchesPatient;
  // });

  const handleStatusChange = (id, newStatus) => {
    setPrescriptions(prescriptions.map(prescription => 
      prescription.id === id ? { ...prescription, status: newStatus } : prescription
    ));
  };

  const openPrescriptionDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleNewPrescription = () => {
    setIsNewPrescriptionModalOpen(true);
  };

  const handlePrescriptionCreated = (newPrescription) => {
    // Format the new prescription to match the current data structure
    const formattedPrescription = {
      id: newPrescription._id || Date.now(), // Use the ID from API or generate a temporary one
      patientName: newPrescription.patient?.name || newPrescription.patientName || 'Patient Name', // Get name from patient object or fallback
      doctorName: user?.name || 'Doctor Name',
      date: new Date().toISOString().split('T')[0],
      expiryDate: newPrescription.expiryDate,
      medications: newPrescription.medications,
      status: 'active',
      notes: newPrescription.notes,
      diagnosis: newPrescription.diagnosis,
      treatment: newPrescription.treatment,
      followUpDate: newPrescription.followUpDate
    };

    setPrescriptions([formattedPrescription, ...prescriptions]);
    toast.success('Prescription created successfully!');
  };

  const handlePrescriptionUpdated = (updatedPrescription) => {
    // Format the updated prescription to match the format used in the UI
    const formattedUpdatedPrescription = {
      id: updatedPrescription._id,
      patientName: updatedPrescription.patient?.name || '',
      doctorName: updatedPrescription.doctor?.name || '',
      date: new Date(updatedPrescription.date).toISOString().split('T')[0],
      expiryDate: updatedPrescription.expiryDate ? new Date(updatedPrescription.expiryDate).toISOString().split('T')[0] : null,
      medications: updatedPrescription.medications || [],
      status: updatedPrescription.status,
      notes: updatedPrescription.notes,
      diagnosis: updatedPrescription.diagnosis,
      treatment: updatedPrescription.treatment,
      followUpDate: updatedPrescription.followUpDate ? new Date(updatedPrescription.followUpDate).toISOString().split('T')[0] : null
    };

    // Update the prescriptions state
    setPrescriptions(prescriptions.map(prescription => 
      prescription.id === formattedUpdatedPrescription.id ? formattedUpdatedPrescription : prescription
    ));
    
    // If the prescription details modal is open and showing this prescription, update the selected prescription
    if (selectedPrescription && selectedPrescription.id === formattedUpdatedPrescription.id) {
      setSelectedPrescription(formattedUpdatedPrescription);
    }
    
    toast.success('Prescription updated successfully!');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'expired':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search prescriptions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleNewPrescription}
          >
            + New Prescription
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient/Doctor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medications
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
              {filteredPrescriptions.map((prescription, index) => (
                <motion.tr 
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openPrescriptionDetails(prescription)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{prescription.patientName}</div>
                        <div className="text-sm text-gray-500">{prescription.doctorName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        Issued: {formatDate(prescription.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        Expires: {formatDate(prescription.expiryDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {prescription.medications.map((med, idx) => (
                        <div key={idx} className="flex items-start mb-1 last:mb-0">
                          <Pill className="h-4 w-4 mr-1 mt-0.5 text-blue-500" />
                          <span>{med.name} {med.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(prescription.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrescriptionToEdit(prescription.id);
                          setIsEditPrescriptionModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      {prescription.status === 'active' && (
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(prescription.id, 'cancelled');
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Find the prescription in the list
                          const prescriptionToPrint = prescriptions.find(p => p.id === prescription.id);
                          if (prescriptionToPrint) {
                            // Set as selected prescription to use the same print functionality
                            setSelectedPrescription(prescriptionToPrint);
                            // Use setTimeout to ensure the DOM is updated before printing
                            setTimeout(() => {
                              const prescriptionElement = document.getElementById('prescription-details-content');
                              if (prescriptionElement) {
                                import('../utils/pdfUtils.js').then(({ printElement }) => {
                                  printElement(prescriptionElement);
                                }).catch(error => {
                                  console.error('Error printing prescription:', error);
                                  toast.error('Failed to print prescription');
                                });
                              }
                            }, 100);
                          }
                        }}
                      >
                        Print
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Details Modal */}
      {isModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6" id="prescription-details-content">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900">Prescription Details</h2>
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
                      <h3 className="text-lg font-medium text-gray-900">{selectedPrescription.patientName}</h3>
                      <p className="text-gray-500">{selectedPrescription.doctorName}</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedPrescription.status)}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Prescription Info</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Issue Date</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedPrescription.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Expiry Date</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedPrescription.expiryDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Diagnosis & Treatment Section */}
                {(selectedPrescription.diagnosis || selectedPrescription.treatment) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Diagnosis & Treatment</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      {selectedPrescription.diagnosis && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Diagnosis</p>
                          <p className="text-sm text-gray-600">{selectedPrescription.diagnosis}</p>
                        </div>
                      )}
                      {selectedPrescription.treatment && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Treatment</p>
                          <p className="text-sm text-gray-600">{selectedPrescription.treatment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Follow-up Section */}
                {selectedPrescription.followUpDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Follow-up</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Follow-up Date</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedPrescription.followUpDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Medications</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    {selectedPrescription.medications.map((med, idx) => (
                      <div key={idx} className="pb-4 last:pb-0 border-b last:border-b-0 border-gray-200">
                        <div className="flex items-center">
                          <Pill className="h-5 w-5 text-blue-500 mr-2" />
                          <h5 className="text-md font-medium text-gray-900">{med.name} {med.dosage}</h5>
                        </div>
                        <div className="mt-2 ml-7 space-y-1">
                          <p className="text-sm text-gray-600"><span className="font-medium">Frequency:</span> {med.frequency}</p>
                          <p className="text-sm text-gray-600"><span className="font-medium">Duration:</span> {med.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{selectedPrescription.notes}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  {selectedPrescription.status === 'active' && (
                    <button 
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => {
                        setPrescriptionToEdit(selectedPrescription.id);
                        setIsEditPrescriptionModalOpen(true);
                        setIsModalOpen(false); // Close the details modal
                      }}
                    >
                      <Pill className="h-5 w-5 mr-2" />
                      Edit Prescription
                    </button>
                  )}
                  <div className="flex space-x-2">
                    <button
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => {
                        const prescriptionElement = document.getElementById('prescription-details-content');
                        if (prescriptionElement) {
                          import('../utils/pdfUtils.js').then(({ printElement }) => {
                            printElement(prescriptionElement);
                          }).catch(error => {
                            console.error('Error printing prescription:', error);
                            toast.error('Failed to print prescription');
                          });
                        }
                      }}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </button>
                    <button
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => {
                        const prescriptionElement = document.getElementById('prescription-details-content');
                        if (prescriptionElement) {
                          import('../utils/pdfUtils.js').then(({ generatePDF }) => {
                            const filename = `prescription_${selectedPrescription.id}_${format(new Date(selectedPrescription.date), 'yyyy-MM-dd')}.pdf`;
                            generatePDF(prescriptionElement, filename);
                          }).catch(error => {
                            console.error('Error generating PDF:', error);
                            toast.error('Failed to download PDF');
                          });
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                    <button
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => {
                        import('../utils/pdfUtils.js').then(({ sharePrescription }) => {
                          // Format prescription data for sharing
                          const prescriptionForSharing = {
                            patientName: selectedPrescription.patientName,
                            doctorName: selectedPrescription.doctorName,
                            date: selectedPrescription.date,
                            expiryDate: selectedPrescription.expiryDate,
                            medications: selectedPrescription.medications || [{
                              name: selectedPrescription.medication,
                              dosage: selectedPrescription.dosage,
                              frequency: selectedPrescription.frequency,
                              duration: selectedPrescription.duration
                            }],
                            diagnosis: selectedPrescription.diagnosis,
                            treatment: selectedPrescription.treatment,
                            followUpDate: selectedPrescription.followUpDate,
                            notes: selectedPrescription.notes
                          };
                          sharePrescription(prescriptionForSharing);
                        }).catch(error => {
                          console.error('Error sharing prescription:', error);
                          toast.error('Failed to share prescription');
                        });
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  </div>
                  {selectedPrescription.status === 'active' && (
                    <button 
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => {
                        handleStatusChange(selectedPrescription.id, 'cancelled');
                        setIsModalOpen(false);
                      }}
                    >
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Cancel Prescription
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

      {/* New Prescription Modal */}
      <UpdatedNewPrescriptionModal 
        isOpen={isNewPrescriptionModalOpen} 
        onClose={() => setIsNewPrescriptionModalOpen(false)} 
        onPrescriptionCreated={handlePrescriptionCreated} 
      />

      {/* Edit Prescription Modal */}
      <EditPrescriptionModal
        isOpen={isEditPrescriptionModalOpen}
        onClose={() => setIsEditPrescriptionModalOpen(false)}
        onPrescriptionUpdated={handlePrescriptionUpdated}
        prescriptionId={prescriptionToEdit}
      />
    </div>
  );
};

export default Prescriptions;
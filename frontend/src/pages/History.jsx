import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Calendar, Clock, User, FileText, Download, Printer, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample history data
  const [historyRecords, setHistoryRecords] = useState([
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 'P10023',
      doctorName: 'Dr. Sarah Johnson',
      date: '2023-06-10',
      time: '09:30 AM',
      type: 'Consultation',
      department: 'Cardiology',
      diagnosis: 'Hypertension',
      treatment: 'Prescribed Lisinopril 10mg daily',
      notes: 'Patient reported occasional chest pain. Blood pressure was 140/90 mmHg. Recommended lifestyle changes including reduced sodium intake and regular exercise.',
      followUp: '2023-07-10',
      status: 'Completed'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      patientId: 'P10045',
      doctorName: 'Dr. Michael Chen',
      date: '2023-06-08',
      time: '11:00 AM',
      type: 'Follow-up',
      department: 'Neurology',
      diagnosis: 'Migraine',
      treatment: 'Prescribed Sumatriptan 50mg as needed',
      notes: 'Patient reports improvement in frequency of migraines but still experiencing occasional severe episodes. Discussed trigger avoidance strategies.',
      followUp: '2023-08-08',
      status: 'Completed'
    },
    {
      id: 3,
      patientName: 'Robert Johnson',
      patientId: 'P10078',
      doctorName: 'Dr. Emily Rodriguez',
      date: '2023-06-12',
      time: '02:15 PM',
      type: 'Procedure',
      department: 'Orthopedics',
      diagnosis: 'Carpal Tunnel Syndrome',
      treatment: 'Corticosteroid injection',
      notes: 'Patient underwent corticosteroid injection for right wrist carpal tunnel syndrome. Procedure was well-tolerated with no complications.',
      followUp: '2023-06-26',
      status: 'Completed'
    },
    {
      id: 4,
      patientName: 'Maria Garcia',
      patientId: 'P10112',
      doctorName: 'Dr. James Taylor',
      date: '2023-06-11',
      time: '10:45 AM',
      type: 'Consultation',
      department: 'Endocrinology',
      diagnosis: 'Type 2 Diabetes',
      treatment: 'Prescribed Metformin 500mg twice daily',
      notes: 'Initial diagnosis of Type 2 Diabetes. HbA1c was 7.8%. Patient educated on blood glucose monitoring and diabetic diet. Referred to nutritionist.',
      followUp: '2023-07-11',
      status: 'Completed'
    },
    {
      id: 5,
      patientName: 'William Brown',
      patientId: 'P10156',
      doctorName: 'Dr. Sarah Johnson',
      date: '2023-06-09',
      time: '03:30 PM',
      type: 'Emergency',
      department: 'Emergency Medicine',
      diagnosis: 'Acute Appendicitis',
      treatment: 'Referred for emergency appendectomy',
      notes: 'Patient presented with severe right lower quadrant pain. CT scan confirmed acute appendicitis. Patient was transferred to surgical department for emergency appendectomy.',
      followUp: '2023-06-16',
      status: 'Completed'
    },
    {
      id: 6,
      patientName: 'Elizabeth Wilson',
      patientId: 'P10189',
      doctorName: 'Dr. Robert Martinez',
      date: '2023-06-12',
      time: '09:00 AM',
      type: 'Consultation',
      department: 'Dermatology',
      diagnosis: 'Eczema',
      treatment: 'Prescribed topical corticosteroid cream',
      notes: 'Patient presented with dry, itchy patches on both arms. Diagnosed with eczema. Prescribed hydrocortisone cream and recommended fragrance-free moisturizers.',
      followUp: '2023-07-12',
      status: 'Completed'
    },
    {
      id: 7,
      patientName: 'David Miller',
      patientId: 'P10205',
      doctorName: 'Dr. Michael Chen',
      date: '2023-06-11',
      time: '01:30 PM',
      type: 'Follow-up',
      department: 'Cardiology',
      diagnosis: 'Atrial Fibrillation',
      treatment: 'Continued Warfarin 5mg daily',
      notes: 'Follow-up for atrial fibrillation. INR within therapeutic range at 2.5. Patient reports no palpitations or shortness of breath. Continuing current medication regimen.',
      followUp: '2023-07-25',
      status: 'Completed'
    },
    {
      id: 8,
      patientName: 'Jennifer Davis',
      patientId: 'P10238',
      doctorName: 'Dr. Emily Rodriguez',
      date: '2023-06-10',
      time: '11:30 AM',
      type: 'Procedure',
      department: 'Gastroenterology',
      diagnosis: 'Routine Colonoscopy',
      treatment: 'Colonoscopy performed, no abnormalities detected',
      notes: 'Routine screening colonoscopy performed. No polyps or abnormalities detected. Recommended next screening in 10 years.',
      followUp: 'N/A',
      status: 'Completed'
    },
    {
      id: 9,
      patientName: 'Michael Thompson',
      patientId: 'P10267',
      doctorName: 'Dr. James Taylor',
      date: '2023-06-09',
      time: '02:00 PM',
      type: 'Consultation',
      department: 'Pulmonology',
      diagnosis: 'Chronic Bronchitis',
      treatment: 'Prescribed bronchodilator inhaler and antibiotics',
      notes: 'Patient presented with persistent cough and shortness of breath. Diagnosed with chronic bronchitis. Prescribed albuterol inhaler and amoxicillin for acute exacerbation.',
      followUp: '2023-06-23',
      status: 'Completed'
    },
    {
      id: 10,
      patientName: 'Sarah Anderson',
      patientId: 'P10298',
      doctorName: 'Dr. Robert Martinez',
      date: '2023-06-08',
      time: '04:15 PM',
      type: 'Follow-up',
      department: 'Orthopedics',
      diagnosis: 'Post-operative Knee Replacement',
      treatment: 'Physical therapy continuation',
      notes: 'Six-week follow-up after total knee replacement. Wound healing well with no signs of infection. Range of motion improving. Continuing physical therapy three times weekly.',
      followUp: '2023-07-20',
      status: 'Completed'
    }
  ]);

  // Current patient ID (in a real app, this would come from authentication or context)
   const currentPatientId = "P10023"; // John Doe's ID for this example
 
   // Filter history records based on search term and only show current patient's records
   const filteredRecords = historyRecords.filter(record => {
     const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.department.toLowerCase().includes(searchTerm.toLowerCase());
     
     // Only show records for the current patient
     return matchesSearch && record.patientId === currentPatientId;
   });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Open record details
  const openRecordDetails = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search records..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button 
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            Filter
            <ChevronDown className={`h-4 w-4 ml-1 text-gray-500 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue="all"
              >
                <option value="all">All Departments</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="gastroenterology">Gastroenterology</option>
                <option value="dermatology">Dermatology</option>
                <option value="endocrinology">Endocrinology</option>
                <option value="emergency">Emergency Medicine</option>
                <option value="pulmonology">Pulmonology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue="all"
              >
                <option value="all">All Types</option>
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="procedure">Procedure</option>
                <option value="emergency">Emergency</option>
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
                <option value="dr-rodriguez">Dr. Emily Rodriguez</option>
                <option value="dr-taylor">Dr. James Taylor</option>
                <option value="dr-martinez">Dr. Robert Martinez</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
                <span className="mt-3">to</span>
                <input
                  type="date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Record count indicator */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} for your medical history
      </div>

      {/* History Records Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Follow-up
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record, index) => (
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
                        <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                        <div className="text-sm text-gray-500">{record.patientId}</div>
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
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        {record.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <User className="h-4 w-4 mr-1 text-gray-500" />
                        {record.doctorName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.department}</div>
                    <div className="text-sm text-gray-500">{record.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{record.diagnosis}</div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{record.treatment}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.followUp !== 'N/A' ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {formatDate(record.followUp)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">None scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRecordDetails(record);
                        }}
                      >
                        View
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Details Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6" id="record-details-content">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-gray-900">{selectedRecord.patientName}</h2>
                    <p className="text-gray-500">{selectedRecord.patientId}</p>
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
                          <p className="text-sm font-medium text-gray-900">Date & Time</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedRecord.date)} at {selectedRecord.time}</p>
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
                          <p className="text-sm text-gray-600">{selectedRecord.type}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Department</p>
                          <p className="text-sm text-gray-600">{selectedRecord.department}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Diagnosis & Treatment</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Diagnosis</p>
                        <p className="text-sm text-gray-600">{selectedRecord.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Treatment</p>
                        <p className="text-sm text-gray-600">{selectedRecord.treatment}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Follow-up</p>
                        <p className="text-sm text-gray-600">
                          {selectedRecord.followUp !== 'N/A' ? formatDate(selectedRecord.followUp) : 'None scheduled'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{selectedRecord.notes}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      const recordElement = document.getElementById('record-details-content');
                      if (recordElement) {
                        import('../utils/pdfUtils.js').then(({ printElement }) => {
                          printElement(recordElement);
                        }).catch(error => {
                          console.error('Error printing record:', error);
                          toast.error('Failed to print record');
                        });
                      }
                    }}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Record
                  </button>
                  <button 
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      const recordElement = document.getElementById('record-details-content');
                      if (recordElement) {
                        import('../utils/pdfUtils.js').then(({ generatePDF }) => {
                          const filename = `medical_record_${selectedRecord.patientId}_${selectedRecord.date}.pdf`;
                          generatePDF(recordElement, filename);
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
                        // Format record data as a prescription-like object for sharing
                        const recordForSharing = {
                          patientName: selectedRecord.patientName,
                          doctorName: selectedRecord.doctorName,
                          date: selectedRecord.date,
                          expiryDate: selectedRecord.followUp || selectedRecord.date,
                          medications: [{
                            name: selectedRecord.diagnosis,
                            dosage: '',
                            frequency: '',
                            duration: ''
                          }],
                          notes: selectedRecord.treatment + '\n' + selectedRecord.notes
                        };
                        sharePrescription(recordForSharing);
                      }).catch(error => {
                        console.error('Error sharing record:', error);
                        toast.error('Failed to share record');
                      });
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share
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

export default History;
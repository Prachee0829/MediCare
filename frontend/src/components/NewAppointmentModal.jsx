import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, X, Filter } from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const NewAppointmentModal = ({ isOpen, onClose, onAppointmentCreated }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    type: 'consultation',
    notes: '',
    symptoms: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);
  
  // Extract unique specializations from doctors
  useEffect(() => {
    if (doctors.length > 0) {
      // Get all specializations from registered doctors
      const uniqueSpecializations = [...new Set(doctors.map(doctor => doctor.specialization).filter(Boolean))];
      
      // Define the full list of specializations from Register.jsx
      const allSpecializations = [
        'General Medicine', 'Cardiology', 'Dermatology', 'ENT',
        'Gynecology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
        'Radiology', 'Surgery', 'Urology', 'Ophthalmology', 'Neurology'
      ];
      
      // Map doctor specializations to match the format in Register.jsx if needed
      const mappedSpecializations = uniqueSpecializations.map(spec => {
        if (spec === 'General') return 'General Medicine';
        return spec;
      });
      
      // Add any specializations from doctors that aren't in our predefined list
      mappedSpecializations.forEach(spec => {
        if (!allSpecializations.includes(spec) && spec) {
          allSpecializations.push(spec);
        }
      });
      
      // Make sure all specializations are properly capitalized for consistency
      const formattedSpecializations = allSpecializations.map(spec => {
        if (!spec) return '';
        return spec.charAt(0).toUpperCase() + spec.slice(1);
      }).filter(Boolean);
      
      // Set the specializations dropdown with all possible options
      setSpecializations(['All Specializations', ...formattedSpecializations]);
    }
  }, [doctors]);


  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter doctors based on selected specialization
  const filteredDoctors = selectedSpecialization && selectedSpecialization !== 'All Specializations'
    ? doctors.filter(doctor => {
        if (!doctor.specialization) return false;
        
        // Handle mapping between dropdown specialization names and doctor specialization names
        if (selectedSpecialization === 'General Medicine' && 
            (doctor.specialization === 'General' || doctor.specialization.toLowerCase() === 'general medicine')) {
          return true;
        }
        
        // Case insensitive comparison to handle potential case mismatches
        return doctor.specialization.toLowerCase() === selectedSpecialization.toLowerCase();
      })
    : doctors;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctor || !formData.date || !formData.time || !formData.type) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/appointments', formData);
      toast.success('Appointment created successfully!');
      onAppointmentCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900">New Appointment</h2>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
                >
                  {specializations.map(spec => (
                    <option key={spec} value={spec === 'All Specializations' ? '' : spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a doctor</option>
                  {filteredDoctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="general-checkup">General Checkup</option>
                <option value="specialist-visit">Specialist Visit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your symptoms"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
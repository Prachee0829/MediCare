import React, { useState, useEffect } from 'react';
import { Clock, User, X, Filter, Pill, Plus, Trash, Calendar } from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const EditPrescriptionModal = ({ isOpen, onClose, onPrescriptionUpdated, prescriptionId }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    diagnosis: '',
    treatment: '',
    followUpDate: '',
    expiryDate: '',
    notes: '',
    medications: [
      { name: '', dosage: '', frequency: '', duration: '' }
    ]
  });

  useEffect(() => {
    if (isOpen && prescriptionId) {
      fetchPrescriptionDetails();
      fetchPatients();
    }
  }, [isOpen, prescriptionId]);

  const fetchPrescriptionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/prescriptions/${prescriptionId}`);
      const prescription = response.data;
      
      // Format dates for form inputs
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        patient: prescription.patient._id,
        diagnosis: prescription.diagnosis || '',
        treatment: prescription.treatment || '',
        followUpDate: formatDate(prescription.followUpDate),
        expiryDate: formatDate(prescription.expiryDate),
        notes: prescription.notes || '',
        medications: prescription.medications.length > 0 
          ? prescription.medications 
          : [{ name: '', dosage: '', frequency: '', duration: '' }]
      });
    } catch (error) {
      console.error('Error fetching prescription details:', error);
      toast.error('Failed to load prescription details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/users/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length === 1) {
      toast.error('At least one medication is required');
      return;
    }
    
    const updatedMedications = formData.medications.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate medications
    const isValidMedications = formData.medications.every(
      med => med.name && med.dosage && med.frequency && med.duration
    );

    if (!isValidMedications) {
      toast.error('Please fill all medication details');
      return;
    }

    try {
      setLoading(true);
      const dataToUpdate = {
        medications: formData.medications,
        expiryDate: formData.expiryDate || undefined,
        notes: formData.notes,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        followUpDate: formData.followUpDate || undefined
      };

      const response = await api.put(`/prescriptions/${prescriptionId}`, dataToUpdate);
      toast.success('Prescription updated successfully!');
      onPrescriptionUpdated(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to update prescription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900">Edit Prescription</h2>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="patient"
                  value={formData.patient}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                  disabled={true} // Patient cannot be changed when editing
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Diagnosis Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter diagnosis"
              />
            </div>

            {/* Treatment Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
              <input
                type="text"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter treatment details"
              />
            </div>

            {/* Follow-up Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Expiry Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Medications</label>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medication
                </button>
              </div>
              
              {formData.medications.map((medication, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Medication {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Pill className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Medication name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Twice daily"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional instructions or notes"
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
                {loading ? 'Updating...' : 'Update Prescription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPrescriptionModal;
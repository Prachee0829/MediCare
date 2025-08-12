import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:5001/api';

/**
 * Fetches patient health records with proper authorization
 * @returns {Promise<Object>} The patient's medical records
 */
export const fetchPatientHealth = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Authentication required. Please log in.');
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${BASE_URL}/medical-records/patient/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching patient health:', error.response?.data || error);
    
    // Provide more specific error messages based on response status
    if (error.response?.status === 403) {
      // Log access denied errors to console instead of showing to users
      console.error('Access denied:', error.response?.data?.message || 'You do not have permission to view these records.');
    } else if (error.response?.status === 401) {
      toast.error('Your session has expired. Please log in again.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Failed to fetch health records. Please try again later.');
    }
    
    throw error;
  }
};
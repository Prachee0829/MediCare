import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { GlobalProvider } from './context/GlobalContext.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Appointments from './pages/Appointments.jsx';
import Calendar from './pages/Calendar.jsx';
import Prescriptions from './pages/Prescriptions.jsx';
import PatientHistory from './pages/PatientHistory.jsx';
import PatientDetails from './pages/PatientDetails.jsx';
import Patients from './pages/Patients.jsx';
import Doctors from './pages/Doctors.jsx';
import Pharmacists from './pages/Pharmacists.jsx';
import DoctorDetails from './pages/DoctorDetails.jsx';
import PharmacistDetails from './pages/PharmacistDetails.jsx';
import Inventory from './pages/Inventory.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import ApprovalRequests from './pages/ApprovalRequests.jsx';
import Reports from './pages/Reports.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';
import Layout from './components/Layout.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalProvider>
          <div className="min-h-screen bg-slate-50">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes */}
              <Route path="/*" element={
                <PrivateRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/prescriptions" element={<Prescriptions />} />
                      <Route path="/prescriptions/patient/:id" element={<PatientHistory />} />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/patient/:id/details" element={<PatientDetails />} />
                      <Route path="/doctors" element={<Doctors />} />
                      <Route path="/doctor/:id/details" element={<DoctorDetails />} />
                      <Route path="/pharmacists" element={<Pharmacists />} />
                      <Route path="/pharmacist/:id/details" element={<PharmacistDetails />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/approval-requests" element={<ApprovalRequests />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </GlobalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
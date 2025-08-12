import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, MoreVertical, User, Mail, Phone, Shield, CheckCircle, XCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterApproval, setFilterApproval] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      toast.error('Unauthorized access');
      navigate('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending approval users
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/pending-approval');
      setUsers(response.data);
      setFilterApproval('pending');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term, role, and approval status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesRole = filterRole === 'all' || user.role?.toLowerCase() === filterRole.toLowerCase();
    
    const matchesApproval = 
      filterApproval === 'all' || 
      (filterApproval === 'approved' && user.isApproved) || 
      (filterApproval === 'pending' && !user.isApproved);
    
    return matchesSearch && matchesRole && matchesApproval;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time for display
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleTimeString('en-US', options);
  };

  // Handle adding new user
  const handleAddUser = async (newUser) => {
    try {
      await api.post('/auth/register', newUser);
      toast.success('User added successfully');
      fetchUsers();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    }
  };

  // Handle editing user
  const handleEditUser = async (updatedUser) => {
    try {
      await api.put(`/users/${updatedUser._id}`, updatedUser);
      toast.success('User updated successfully');
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Handle deleting user
  const handleDeleteUser = async () => {
    try {
      await api.delete(`/users/${selectedUser._id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      setSelectedUser(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Handle approving user
  const handleApproveUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/approve`);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'patient':
        return 'bg-green-100 text-green-800';
      case 'pharmacist':
        return 'bg-indigo-100 text-indigo-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
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
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="doctor">Doctors</option>
            <option value="patient">Patients</option>
            <option value="pharmacist">Pharmacists</option>
            <option value="admin">Admins</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
          <button 
            className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            onClick={fetchPendingUsers}
          >
            <XCircle className="h-5 w-5 mr-2" />
            View Pending
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Specialization
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr 
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-3.5 w-3.5 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-3.5 w-3.5 mr-1" />
                              {user.phone}
                            </div>
                          )}
                          {user.dateOfBirth && (
                            <div className="text-sm text-gray-500">
                              DOB: {formatDate(user.dateOfBirth)}
                            </div>
                          )}
                          {(user.role === 'doctor' || user.role === 'pharmacist') && user.licenseId && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              License: {user.licenseId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                      </span>
                      {user.specialization && (
                        <div className="text-sm text-gray-500 mt-1">{user.specialization}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.isApproved ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Approved</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-amber-500 mr-1" />
                            <span className="text-sm text-amber-600">Pending</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.updatedAt ? `${formatDate(user.updatedAt)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!user.isApproved && (user.role === 'doctor' || user.role === 'pharmacist') && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleApproveUser(user._id)}
                            title="Approve User"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || selectedUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedUser ? 'Edit User' : 'Add New User'}
              </h2>
              
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = {
                  name: e.target.elements.name.value,
                  email: e.target.elements.email.value,
                  role: e.target.elements.role.value,
                };

                if (e.target.elements.phone) {
                  formData.phone = e.target.elements.phone.value;
                }

                if (e.target.elements.specialization) {
                  formData.specialization = e.target.elements.specialization.value;
                }

                if (e.target.elements.licenseId) {
                  formData.licenseId = e.target.elements.licenseId.value;
                }

                if (e.target.elements.dateOfBirth) {
                  formData.dateOfBirth = e.target.elements.dateOfBirth.value;
                }

                if (!selectedUser) {
                  if (e.target.elements.password.value !== e.target.elements.confirmPassword.value) {
                    toast.error('Passwords do not match');
                    return;
                  }
                  formData.password = e.target.elements.password.value;
                }

                if (selectedUser) {
                  if (e.target.elements.resetPassword && e.target.elements.resetPassword.checked) {
                    formData.password = e.target.elements.newPassword.value;
                  }
                  handleEditUser({ ...selectedUser, ...formData });
                } else {
                  handleAddUser(formData);
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedUser?.name || ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedUser?.email || ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedUser?.phone || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedUser?.role || 'patient'}
                      name="role"
                      id="roleSelect"
                      onChange={(e) => {
                        // This is just to trigger UI update for license field visibility
                        document.getElementById('specializationField').style.display = 
                          (e.target.value === 'doctor') ? 'block' : 'none';
                        document.getElementById('licenseIdField').style.display = 
                          (e.target.value === 'doctor' || e.target.value === 'pharmacist') ? 'block' : 'none';
                      }}
                      required
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div id="specializationField" style={{display: (selectedUser?.role === 'doctor') ? 'block' : 'none'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input 
                      type="text" 
                      name="specialization"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedUser?.specialization || ''}
                    />
                  </div>
                  <div id="licenseIdField" style={{display: (selectedUser?.role === 'doctor' || selectedUser?.role === 'pharmacist') ? 'block' : 'none'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License ID</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="licenseId"
                        className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={selectedUser?.licenseId || ''}
                        placeholder="Enter professional license ID"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      name="dateOfBirth"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={selectedUser?.dateOfBirth ? new Date(selectedUser.dateOfBirth).toISOString().split('T')[0] : ''}
                    />
                  </div>
                  {!selectedUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input 
                        type="password" 
                        name="password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  )}
                  {!selectedUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  )}
                </div>
                
                {selectedUser && (
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        name="resetPassword"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                        onChange={(e) => {
                          document.getElementById('newPasswordField').style.display = 
                            e.target.checked ? 'block' : 'none';
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-600">Reset password</span>
                    </label>
                    <div id="newPasswordField" style={{display: 'none'}} className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input 
                        type="password" 
                        name="newPassword"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {selectedUser ? 'Save Changes' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the user <span className="font-medium">{selectedUser.name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={handleDeleteUser}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
import React from 'react';

const RoleBadge = ({ role, size = 'sm' }) => {
  const getRoleConfig = (role) => {
    switch (role.toLowerCase()) {
      case 'doctor':
        return {
          label: 'Doctor',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '👨‍⚕️'
        };
      case 'patient':
        return {
          label: 'Patient',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '🏥'
        };
      case 'pharmacist':
        return {
          label: 'Pharmacist',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '💊'
        };
      case 'admin':
        return {
          label: 'Admin',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '⚙️'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '👤'
        };
    }
  };

  const config = getRoleConfig(role);
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default RoleBadge;
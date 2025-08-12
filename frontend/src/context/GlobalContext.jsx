import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const GlobalContext = createContext(undefined);

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

export const GlobalProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth() || { user: null };

  const addNotification = (notification) => {
    // Check if notification already exists to prevent duplicates
    const id = Date.now().toString();
    const notificationWithId = { ...notification, id };
    
    // Add role information to the notification
    if (notification.forRoles) {
      notificationWithId.forRoles = notification.forRoles;
    } else {
      // If no roles specified, make it visible to all roles
      notificationWithId.forRoles = ['admin', 'doctor', 'patient', 'pharmacist'];
    }
    
    // Check for duplicates (same title and message within the last 2 seconds)
    const isDuplicate = notifications.some(n => 
      n.title === notification.title && 
      n.message === notification.message && 
      Date.now() - parseInt(n.id) < 2000
    );
    
    if (!isDuplicate) {
      setNotifications(prev => [...prev, notificationWithId]);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // Filter notifications based on user role
  const filteredNotifications = user ? 
    notifications.filter(notification => 
      !notification.forRoles || notification.forRoles.includes(user.role)
    ) : [];

  const value = {
    sidebarOpen,
    setSidebarOpen,
    theme,
    setTheme,
    notifications: filteredNotifications, // Use filtered notifications based on user role
    addNotification,
    removeNotification,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};
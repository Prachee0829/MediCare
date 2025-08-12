import { useGlobal } from '../context/GlobalContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// This is a utility function to create a notification hook
export const useNotification = () => {
  const { addNotification } = useGlobal();
  const { user } = useAuth() || { user: null };

  // Create a success notification
  const notifySuccess = (title, message, forRoles = null) => {
    addNotification({
      type: 'success',
      title: title || 'Success',
      message: message || 'Operation completed successfully',
      forRoles: forRoles, // If null, will be visible to all roles
    });
  };

  // Create an error notification
  const notifyError = (title, message, forRoles = null) => {
    addNotification({
      type: 'error',
      title: title || 'Error',
      message: message || 'An error occurred',
      forRoles: forRoles,
    });
  };

  // Create an info notification
  const notifyInfo = (title, message, forRoles = null) => {
    addNotification({
      type: 'info',
      title: title || 'Information',
      message: message || 'New information available',
      forRoles: forRoles,
    });
  };

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    currentUserRole: user?.role,
  };
};

// This is a direct function to add notifications without hooks
// Useful for services and non-component code
export const createNotification = (globalContext, type, title, message, forRoles = null) => {
  if (!globalContext || !globalContext.addNotification) {
    console.error('GlobalContext not provided to createNotification');
    return;
  }
  
  globalContext.addNotification({
    type,
    title,
    message,
    forRoles,
  });
};
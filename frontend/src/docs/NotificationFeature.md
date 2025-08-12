# Notification Feature Documentation

## Overview

The notification feature has been implemented across all modules in the Medicare application. This feature provides real-time notifications to users about important events, alerts, and updates within the system.

## Components

### 1. NotificationComponent

A reusable component that displays notifications in a dropdown menu accessible from the navigation bar. It includes:

- A bell icon with a counter for unread notifications
- A dropdown panel showing all notifications
- Options to dismiss individual notifications or clear all notifications
- Visual indicators for different notification types (success, error, info)

### 2. Notification Service

A utility service that provides functions for creating and managing notifications:

- `useNotification()` - A custom hook for React components
- `notifySuccess()` - Creates a success notification
- `notifyError()` - Creates an error notification
- `notifyInfo()` - Creates an informational notification
- `createNotification()` - A direct function for non-component code

### 3. Global Context Integration

The notification system is integrated with the application's global context, which stores and manages the notification state:

- `notifications` - Array of all current notifications
- `addNotification()` - Adds a new notification
- `removeNotification()` - Removes a notification by ID

## Implementation in Modules

### Dashboard Module

- Welcome notification when the dashboard loads
- Notifications for errors when loading dashboard statistics

### Appointments Module

- Notification when viewing appointments
- Alerts for upcoming appointments
- Status change notifications (confirmed, cancelled, completed)

### Prescriptions Module

- Notification when viewing prescriptions
- Alerts for expiring prescriptions

### Inventory Module

- Alerts for low stock items
- Notifications for expiring inventory items
- Notifications for inventory updates (add, edit, delete)

## How to Use

### In React Components

```jsx
import { useNotification } from '../services/notificationService.js';

const YourComponent = () => {
  const { notifySuccess, notifyInfo, notifyError } = useNotification();
  
  // Create a success notification
  notifySuccess('Title', 'Message');
  
  // Create an info notification
  notifyInfo('Title', 'Message');
  
  // Create an error notification
  notifyError('Title', 'Message');
  
  return (
    // Your component JSX
  );
};
```

### In Non-Component Code

```javascript
import { createNotification } from '../services/notificationService.js';
import { useGlobal } from '../context/GlobalContext.jsx';

const someFunction = () => {
  const globalContext = useGlobal();
  
  // Create a notification
  createNotification(globalContext, 'success', 'Title', 'Message');
};
```

## Notification Types

1. **Success** - Green checkmark icon, used for successful operations
2. **Error** - Red alert icon, used for errors and failures
3. **Info** - Blue info icon, used for general information and alerts

## Future Enhancements

- Persistent notifications across sessions
- Push notifications for mobile devices
- Email notifications for critical alerts
- Notification preferences settings
- Read/unread status tracking
# Medicare Healthcare Management System

Medicare is a comprehensive healthcare management system designed to streamline the interaction between patients, doctors, and administrators. The system facilitates appointment scheduling, prescription management, inventory tracking, and provides insightful dashboards for all user roles.

## Project Structure

The project consists of two main components:

- **Frontend**: Located in the `project` directory, built with React and Vite.
- **Backend**: Located in the `backend` directory, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication and Authorization**
  - Role-based access control (Patient, Doctor, Admin)
  - Secure login and registration
  - Profile management

- **Appointment Management**
  - Schedule, view, and manage appointments
  - Doctor availability checking
  - Appointment status tracking

- **Prescription Management**
  - Create and manage prescriptions
  - Track medication details
  - Prescription status tracking

- **Inventory Management**
  - Track medical supplies and medications
  - Low stock alerts
  - Expiry date tracking

- **Dashboard and Analytics**
  - Role-specific dashboards
  - Statistical insights
  - Monthly data visualization

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the setup script to create necessary directories and check MongoDB installation:
   ```
   npm run setup
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Configure environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/medicare
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

5. Test the MongoDB connection:
   ```
   npm run test:connection
   ```

6. Seed the database with sample data (optional):
   ```
   npm run seed
   ```

7. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application in your browser at the URL shown in the terminal (typically http://localhost:5173)

### Connecting Frontend to Backend

To ensure the frontend is properly configured to connect to the backend, run:

```
cd backend
npm run check:frontend
```

This script will check if the frontend is correctly configured to use the backend API and provide guidance if any changes are needed.

## API Documentation

Detailed API documentation is available in the `backend/API_DOCUMENTATION.md` file. This includes information about all available endpoints, request/response formats, and authentication requirements.

## User Roles and Permissions

### Patient
- Register and manage profile
- Schedule appointments with doctors
- View appointment history and status
- View prescriptions

### Doctor
- View and manage assigned patients
- View and manage appointments
- Create and manage prescriptions
- View patient medical history

### Admin
- Manage all users (approve, update, delete)
- Manage all appointments
- Manage inventory
- Access system-wide analytics

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was created as a demonstration of a full-stack healthcare management system.
- Special thanks to all contributors and the open-source community for providing the tools and libraries used in this project.

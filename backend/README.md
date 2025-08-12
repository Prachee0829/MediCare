# Medicare Backend API

This is the backend API for the Medicare Healthcare Management System. It provides endpoints for user authentication, appointment management, prescription management, inventory management, and dashboard statistics.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/medicare
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

3. Start the server:
   ```
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/doctors` - Get all doctors (protected)
- `GET /api/users/:id` - Get user by ID (admin or doctor only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/:id/approve` - Approve user (admin only)

### Appointments

- `POST /api/appointments` - Create new appointment (protected)
- `GET /api/appointments` - Get all appointments (protected)
- `GET /api/appointments/:id` - Get appointment by ID (protected)
- `PUT /api/appointments/:id` - Update appointment (doctor only)
- `DELETE /api/appointments/:id` - Delete appointment (admin only)
- `PUT /api/appointments/:id/status` - Update appointment status (protected)
- `GET /api/appointments/doctor/:id/availability` - Get doctor's available time slots (protected)

### Prescriptions

- `POST /api/prescriptions` - Create new prescription (doctor only)
- `GET /api/prescriptions` - Get all prescriptions (protected)
- `GET /api/prescriptions/:id` - Get prescription by ID (protected)
- `PUT /api/prescriptions/:id` - Update prescription (doctor only)
- `DELETE /api/prescriptions/:id` - Delete prescription (admin only)
- `PUT /api/prescriptions/:id/status` - Update prescription status (doctor or admin only)
- `GET /api/prescriptions/patient/:id` - Get patient prescriptions (doctor or admin only)

### Inventory

- `POST /api/inventory` - Create new inventory item (admin only)
- `GET /api/inventory` - Get all inventory items (protected)
- `GET /api/inventory/:id` - Get inventory item by ID (protected)
- `PUT /api/inventory/:id` - Update inventory item (admin only)
- `DELETE /api/inventory/:id` - Delete inventory item (admin only)
- `GET /api/inventory/low-stock` - Get low stock items (protected)
- `GET /api/inventory/expiring` - Get expiring items (protected)
- `GET /api/inventory/category/:category` - Get inventory by category (protected)

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics (protected)
- `GET /api/dashboard/monthly-data` - Get monthly data for charts (protected)
- `GET /api/dashboard/specialization-data` - Get specialization data for charts (admin only)
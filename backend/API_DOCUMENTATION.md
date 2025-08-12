# Medicare Backend API Documentation

This document provides detailed information about the Medicare Backend API endpoints, request/response formats, and authentication requirements.

## Base URL

```
http://localhost:5001/api
```

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT). To authenticate, include the token in the request headers:

```
Authorization: Bearer <your_token>
```

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient", // "patient", "doctor", or "admin"
  "specialization": "Cardiology", // Required only for doctors
  "phone": "1234567890",
  "address": "123 Main St, City",
  "dateOfBirth": "1990-01-01",
  "gender": "male" // "male" or "female"
}
```

**Response:**

```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "isApproved": false,
  "token": "jwt_token"
}
```

#### Login User

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "isApproved": true,
  "token": "jwt_token"
}
```

#### Get User Profile

```
GET /api/auth/profile
```

**Response:**

```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "specialization": null,
  "isApproved": true,
  "phone": "1234567890",
  "address": "123 Main St, City",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "profilePicture": null
}
```

#### Update User Profile

```
PUT /api/auth/profile
```

**Request Body:**

```json
{
  "name": "John Doe Updated",
  "email": "john@example.com",
  "password": "newpassword123", // Optional
  "phone": "9876543210",
  "address": "456 New St, City",
  "profilePicture": "url_to_image" // Optional
}
```

**Response:**

```json
{
  "_id": "user_id",
  "name": "John Doe Updated",
  "email": "john@example.com",
  "role": "patient",
  "isApproved": true,
  "phone": "9876543210",
  "address": "456 New St, City",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "profilePicture": "url_to_image"
}
```

## User Management

### User Endpoints

#### Get All Users (Admin Only)

```
GET /api/users
```

**Response:**

```json
[
  {
    "_id": "user_id_1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "isApproved": true
  },
  {
    "_id": "user_id_2",
    "name": "Dr. Smith",
    "email": "smith@example.com",
    "role": "doctor",
    "specialization": "Cardiology",
    "isApproved": true
  }
]
```

#### Get All Doctors

```
GET /api/users/doctors
```

**Response:**

```json
[
  {
    "_id": "doctor_id_1",
    "name": "Dr. Smith",
    "email": "smith@example.com",
    "specialization": "Cardiology",
    "isApproved": true
  },
  {
    "_id": "doctor_id_2",
    "name": "Dr. Johnson",
    "email": "johnson@example.com",
    "specialization": "Pediatrics",
    "isApproved": true
  }
]
```

#### Get User by ID (Admin or Doctor Only)

```
GET /api/users/:id
```

**Response:**

```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "isApproved": true,
  "phone": "1234567890",
  "address": "123 Main St, City",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

#### Update User (Admin Only)

```
PUT /api/users/:id
```

**Request Body:**

```json
{
  "name": "John Doe Updated",
  "email": "john@example.com",
  "role": "patient",
  "isApproved": true,
  "phone": "9876543210",
  "address": "456 New St, City"
}
```

**Response:**

```json
{
  "_id": "user_id",
  "name": "John Doe Updated",
  "email": "john@example.com",
  "role": "patient",
  "isApproved": true,
  "phone": "9876543210",
  "address": "456 New St, City",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

#### Delete User (Admin Only)

```
DELETE /api/users/:id
```

**Response:**

```json
{
  "message": "User removed"
}
```

#### Approve User (Admin Only)

```
PUT /api/users/:id/approve
```

**Response:**

```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "isApproved": true
}
```

## Appointment Management

### Appointment Endpoints

#### Create Appointment

```
POST /api/appointments
```

**Request Body:**

```json
{
  "doctor": "doctor_id",
  "date": "2023-12-01",
  "time": "10:00 AM",
  "type": "consultation", // "consultation", "follow-up", "emergency"
  "notes": "Initial consultation for heart issues",
  "symptoms": "Chest pain, shortness of breath"
}
```

**Response:**

```json
{
  "_id": "appointment_id",
  "patient": "patient_id",
  "doctor": "doctor_id",
  "date": "2023-12-01",
  "time": "10:00 AM",
  "status": "scheduled", // "scheduled", "completed", "cancelled"
  "type": "consultation",
  "notes": "Initial consultation for heart issues",
  "symptoms": "Chest pain, shortness of breath",
  "diagnosis": null,
  "followUpDate": null,
  "createdAt": "2023-11-15T12:00:00.000Z",
  "updatedAt": "2023-11-15T12:00:00.000Z"
}
```

#### Get All Appointments

```
GET /api/appointments
```

**Response:**

```json
[
  {
    "_id": "appointment_id_1",
    "patient": {
      "_id": "patient_id",
      "name": "John Doe"
    },
    "doctor": {
      "_id": "doctor_id",
      "name": "Dr. Smith"
    },
    "date": "2023-12-01",
    "time": "10:00 AM",
    "status": "scheduled",
    "type": "consultation"
  },
  {
    "_id": "appointment_id_2",
    "patient": {
      "_id": "patient_id",
      "name": "John Doe"
    },
    "doctor": {
      "_id": "doctor_id",
      "name": "Dr. Johnson"
    },
    "date": "2023-12-05",
    "time": "2:30 PM",
    "status": "scheduled",
    "type": "follow-up"
  }
]
```

#### Get Appointment by ID

```
GET /api/appointments/:id
```

**Response:**

```json
{
  "_id": "appointment_id",
  "patient": {
    "_id": "patient_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "doctor": {
    "_id": "doctor_id",
    "name": "Dr. Smith",
    "specialization": "Cardiology"
  },
  "date": "2023-12-01",
  "time": "10:00 AM",
  "status": "scheduled",
  "type": "consultation",
  "notes": "Initial consultation for heart issues",
  "symptoms": "Chest pain, shortness of breath",
  "diagnosis": null,
  "followUpDate": null,
  "createdAt": "2023-11-15T12:00:00.000Z",
  "updatedAt": "2023-11-15T12:00:00.000Z"
}
```

#### Update Appointment (Doctor Only)

```
PUT /api/appointments/:id
```

**Request Body:**

```json
{
  "diagnosis": "Hypertension",
  "notes": "Patient has high blood pressure. Prescribed medication.",
  "followUpDate": "2023-12-15"
}
```

**Response:**

```json
{
  "_id": "appointment_id",
  "patient": "patient_id",
  "doctor": "doctor_id",
  "date": "2023-12-01",
  "time": "10:00 AM",
  "status": "completed",
  "type": "consultation",
  "notes": "Patient has high blood pressure. Prescribed medication.",
  "symptoms": "Chest pain, shortness of breath",
  "diagnosis": "Hypertension",
  "followUpDate": "2023-12-15",
  "updatedAt": "2023-11-15T14:00:00.000Z"
}
```

#### Update Appointment Status

```
PUT /api/appointments/:id/status
```

**Request Body:**

```json
{
  "status": "completed" // "scheduled", "completed", "cancelled"
}
```

**Response:**

```json
{
  "_id": "appointment_id",
  "status": "completed",
  "updatedAt": "2023-11-15T14:00:00.000Z"
}
```

#### Delete Appointment (Admin Only)

```
DELETE /api/appointments/:id
```

**Response:**

```json
{
  "message": "Appointment removed"
}
```

#### Get Doctor Availability

```
GET /api/appointments/doctor/:id/availability?date=2023-12-01
```

**Response:**

```json
{
  "availableSlots": [
    "9:00 AM",
    "11:00 AM",
    "1:00 PM",
    "3:00 PM",
    "4:00 PM"
  ],
  "bookedSlots": [
    "10:00 AM",
    "2:00 PM"
  ]
}
```

## Prescription Management

### Prescription Endpoints

#### Create Prescription (Doctor Only)

```
POST /api/prescriptions
```

**Request Body:**

```json
{
  "patient": "patient_id",
  "date": "2023-12-01",
  "expiryDate": "2023-12-31",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days"
    },
    {
      "name": "Aspirin",
      "dosage": "81mg",
      "frequency": "Once daily",
      "duration": "30 days"
    }
  ],
  "notes": "Take with food. Avoid alcohol.",
  "appointment": "appointment_id" // Optional
}
```

**Response:**

```json
{
  "_id": "prescription_id",
  "patient": "patient_id",
  "doctor": "doctor_id",
  "date": "2023-12-01",
  "expiryDate": "2023-12-31",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days"
    },
    {
      "name": "Aspirin",
      "dosage": "81mg",
      "frequency": "Once daily",
      "duration": "30 days"
    }
  ],
  "status": "active",
  "notes": "Take with food. Avoid alcohol.",
  "appointment": "appointment_id",
  "createdAt": "2023-11-15T12:00:00.000Z",
  "updatedAt": "2023-11-15T12:00:00.000Z"
}
```

#### Get All Prescriptions

```
GET /api/prescriptions
```

**Response:**

```json
[
  {
    "_id": "prescription_id_1",
    "patient": {
      "_id": "patient_id",
      "name": "John Doe"
    },
    "doctor": {
      "_id": "doctor_id",
      "name": "Dr. Smith"
    },
    "date": "2023-12-01",
    "expiryDate": "2023-12-31",
    "status": "active"
  },
  {
    "_id": "prescription_id_2",
    "patient": {
      "_id": "patient_id",
      "name": "John Doe"
    },
    "doctor": {
      "_id": "doctor_id",
      "name": "Dr. Johnson"
    },
    "date": "2023-11-15",
    "expiryDate": "2023-12-15",
    "status": "active"
  }
]
```

#### Get Prescription by ID

```
GET /api/prescriptions/:id
```

**Response:**

```json
{
  "_id": "prescription_id",
  "patient": {
    "_id": "patient_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "doctor": {
    "_id": "doctor_id",
    "name": "Dr. Smith",
    "specialization": "Cardiology"
  },
  "date": "2023-12-01",
  "expiryDate": "2023-12-31",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days"
    },
    {
      "name": "Aspirin",
      "dosage": "81mg",
      "frequency": "Once daily",
      "duration": "30 days"
    }
  ],
  "status": "active",
  "notes": "Take with food. Avoid alcohol.",
  "appointment": {
    "_id": "appointment_id",
    "date": "2023-12-01",
    "time": "10:00 AM"
  },
  "createdAt": "2023-11-15T12:00:00.000Z",
  "updatedAt": "2023-11-15T12:00:00.000Z"
}
```

#### Update Prescription (Doctor Only)

```
PUT /api/prescriptions/:id
```

**Request Body:**

```json
{
  "expiryDate": "2024-01-15",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "20mg", // Updated dosage
      "frequency": "Once daily",
      "duration": "45 days" // Updated duration
    },
    {
      "name": "Aspirin",
      "dosage": "81mg",
      "frequency": "Once daily",
      "duration": "45 days"
    }
  ],
  "notes": "Take with food. Avoid alcohol. Follow up in 45 days."
}
```

**Response:**

```json
{
  "_id": "prescription_id",
  "patient": "patient_id",
  "doctor": "doctor_id",
  "date": "2023-12-01",
  "expiryDate": "2024-01-15",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "20mg",
      "frequency": "Once daily",
      "duration": "45 days"
    },
    {
      "name": "Aspirin",
      "dosage": "81mg",
      "frequency": "Once daily",
      "duration": "45 days"
    }
  ],
  "status": "active",
  "notes": "Take with food. Avoid alcohol. Follow up in 45 days.",
  "updatedAt": "2023-11-15T14:00:00.000Z"
}
```

#### Update Prescription Status (Doctor or Admin Only)

```
PUT /api/prescriptions/:id/status
```

**Request Body:**

```json
{
  "status": "completed" // "active", "completed", "expired"
}
```

**Response:**

```json
{
  "_id": "prescription_id",
  "status": "completed",
  "updatedAt": "2023-11-15T14:00:00.000Z"
}
```

#### Delete Prescription (Admin Only)

```
DELETE /api/prescriptions/:id
```

**Response:**

```json
{
  "message": "Prescription removed"
}
```

#### Get Patient Prescriptions (Doctor or Admin Only)

```
GET /api/prescriptions/patient/:id
```

**Response:**

```json
[
  {
    "_id": "prescription_id_1",
    "doctor": {
      "_id": "doctor_id",
      "name": "Dr. Smith"
    },
    "date": "2023-12-01",
    "expiryDate": "2023-12-31",
    "status": "active",
    "medications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Once daily",
        "duration": "30 days"
      }
    ]
  },
  {
    "_id": "prescription_id_2",
    "doctor": {
      "_id": "doctor_id",
      "name": "Dr. Johnson"
    },
    "date": "2023-11-15",
    "expiryDate": "2023-12-15",
    "status": "active",
    "medications": [
      {
        "name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "Three times daily",
        "duration": "10 days"
      }
    ]
  }
]
```

## Inventory Management

### Inventory Endpoints

#### Create Inventory Item (Admin Only)

```
POST /api/inventory
```

**Request Body:**

```json
{
  "name": "Paracetamol",
  "category": "Pain Relief",
  "dosage": "500mg",
  "formulation": "Tablet",
  "quantity": 500,
  "threshold": 100,
  "supplier": "MediSupply Inc.",
  "expiryDate": "2024-12-31",
  "batchNumber": "PARA-2023-001",
  "location": "Shelf A1",
  "price": 5.99
}
```

**Response:**

```json
{
  "_id": "inventory_id",
  "name": "Paracetamol",
  "category": "Pain Relief",
  "dosage": "500mg",
  "formulation": "Tablet",
  "quantity": 500,
  "threshold": 100,
  "supplier": "MediSupply Inc.",
  "expiryDate": "2024-12-31T00:00:00.000Z",
  "batchNumber": "PARA-2023-001",
  "location": "Shelf A1",
  "lastUpdated": "2023-11-15T12:00:00.000Z",
  "updatedBy": "admin_id",
  "price": 5.99,
  "createdAt": "2023-11-15T12:00:00.000Z",
  "updatedAt": "2023-11-15T12:00:00.000Z"
}
```

#### Get All Inventory Items

```
GET /api/inventory
```

**Response:**

```json
[
  {
    "_id": "inventory_id_1",
    "name": "Paracetamol",
    "category": "Pain Relief",
    "dosage": "500mg",
    "formulation": "Tablet",
    "quantity": 500,
    "threshold": 100,
    "expiryDate": "2024-12-31T00:00:00.000Z",
    "price": 5.99
  },
  {
    "_id": "inventory_id_2",
    "name": "Amoxicillin",
    "category": "Antibiotics",
    "dosage": "250mg",
    "formulation": "Capsule",
    "quantity": 200,
    "threshold": 50,
    "expiryDate": "2024-06-30T00:00:00.000Z",
    "price": 12.99
  }
]
```

#### Get Inventory Item by ID

```
GET /api/inventory/:id
```

**Response:**

```json
{
  "_id": "inventory_id",
  "name": "Paracetamol",
  "category": "Pain Relief",
  "dosage": "500mg",
  "formulation": "Tablet",
  "quantity": 500,
  "threshold": 100,
  "supplier": "MediSupply Inc.",
  "expiryDate": "2024-12-31T00:00:00.000Z",
  "batchNumber": "PARA-2023-001",
  "location": "Shelf A1",
  "lastUpdated": "2023-11-15T12:00:00.000Z",
  "updatedBy": {
    "_id": "admin_id",
    "name": "Admin User"
  },
  "price": 5.99,
  "createdAt": "2023-11-15T12:00:00.000Z",
  "updatedAt": "2023-11-15T12:00:00.000Z"
}
```

#### Update Inventory Item (Admin Only)

```
PUT /api/inventory/:id
```

**Request Body:**

```json
{
  "quantity": 450,
  "price": 6.49,
  "location": "Shelf A2"
}
```

**Response:**

```json
{
  "_id": "inventory_id",
  "name": "Paracetamol",
  "category": "Pain Relief",
  "dosage": "500mg",
  "formulation": "Tablet",
  "quantity": 450,
  "threshold": 100,
  "supplier": "MediSupply Inc.",
  "expiryDate": "2024-12-31T00:00:00.000Z",
  "batchNumber": "PARA-2023-001",
  "location": "Shelf A2",
  "lastUpdated": "2023-11-15T14:00:00.000Z",
  "updatedBy": "admin_id",
  "price": 6.49,
  "updatedAt": "2023-11-15T14:00:00.000Z"
}
```

#### Delete Inventory Item (Admin Only)

```
DELETE /api/inventory/:id
```

**Response:**

```json
{
  "message": "Inventory item removed"
}
```

#### Get Low Stock Items

```
GET /api/inventory/low-stock
```

**Response:**

```json
[
  {
    "_id": "inventory_id",
    "name": "Insulin",
    "category": "Diabetes",
    "quantity": 15,
    "threshold": 20,
    "expiryDate": "2024-02-28T00:00:00.000Z",
    "price": 45.99
  }
]
```

#### Get Expiring Items

```
GET /api/inventory/expiring
```

**Response:**

```json
[
  {
    "_id": "inventory_id",
    "name": "Insulin",
    "category": "Diabetes",
    "quantity": 15,
    "expiryDate": "2024-02-28T00:00:00.000Z",
    "daysUntilExpiry": 30,
    "price": 45.99
  }
]
```

#### Get Inventory by Category

```
GET /api/inventory/category/:category
```

**Response:**

```json
[
  {
    "_id": "inventory_id_1",
    "name": "Paracetamol",
    "category": "Pain Relief",
    "dosage": "500mg",
    "formulation": "Tablet",
    "quantity": 450,
    "threshold": 100,
    "expiryDate": "2024-12-31T00:00:00.000Z",
    "price": 6.49
  },
  {
    "_id": "inventory_id_2",
    "name": "Ibuprofen",
    "category": "Pain Relief",
    "dosage": "400mg",
    "formulation": "Tablet",
    "quantity": 350,
    "threshold": 75,
    "expiryDate": "2024-10-31T00:00:00.000Z",
    "price": 7.49
  }
]
```

## Dashboard

### Dashboard Endpoints

#### Get Dashboard Statistics

```
GET /api/dashboard/stats
```

**Response (Admin):**

```json
{
  "totalPatients": 50,
  "totalDoctors": 10,
  "totalAppointments": 120,
  "todayAppointments": 8,
  "totalPrescriptions": 95,
  "totalInventoryItems": 75,
  "lowStockItems": 5,
  "revenue": 15000
}
```

**Response (Doctor):**

```json
{
  "totalPatients": 30,
  "totalAppointments": 80,
  "todayAppointments": 5,
  "upcomingAppointments": 15,
  "totalPrescriptions": 65
}
```

**Response (Patient):**

```json
{
  "totalAppointments": 12,
  "upcomingAppointments": 3,
  "totalPrescriptions": 8,
  "activePrescriptions": 4
}
```

#### Get Monthly Data

```
GET /api/dashboard/monthly-data
```

**Response:**

```json
{
  "appointments": [
    { "month": "June", "count": 15 },
    { "month": "July", "count": 20 },
    { "month": "August", "count": 18 },
    { "month": "September", "count": 25 },
    { "month": "October", "count": 22 },
    { "month": "November", "count": 30 }
  ],
  "prescriptions": [
    { "month": "June", "count": 10 },
    { "month": "July", "count": 15 },
    { "month": "August", "count": 12 },
    { "month": "September", "count": 18 },
    { "month": "October", "count": 16 },
    { "month": "November", "count": 24 }
  ]
}
```

#### Get Specialization Data (Admin Only)

```
GET /api/dashboard/specialization-data
```

**Response:**

```json
[
  { "specialization": "Cardiology", "count": 3 },
  { "specialization": "Pediatrics", "count": 2 },
  { "specialization": "Neurology", "count": 1 },
  { "specialization": "Dermatology", "count": 2 },
  { "specialization": "Orthopedics", "count": 2 }
]
```

## Error Responses

All API endpoints return appropriate HTTP status codes and error messages in case of failure.

### Example Error Response

```json
{
  "message": "Resource not found"
}
```

or

```json
{
  "message": "Not authorized to access this resource"
}
```

or

```json
{
  "message": "Invalid data",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```
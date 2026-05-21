# Blood Bank Management System (BBMS) API Documentation

## Authentication Endpoints

### Register User
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Body:** `{ "name", "email", "password", "role" (donor|hospital|staff) }`
- **Success Response:** `201 Created` with JWT Token

### Login
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Body:** `{ "email", "password" }`
- **Success Response:** `200 OK` with JWT Token

### Get Current User
- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response:** `200 OK` with User object

---

## Inventory Endpoints

### Get Inventory Summary (Public)
- **URL:** `/api/inventory/summary`
- **Method:** `GET`
- **Success Response:** `200 OK` with blood group counts

### Get All Inventory (Protected)
- **URL:** `/api/inventory`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?page=1&limit=10&bloodGroup=O+`
- **Success Response:** `200 OK` with paginated items

---

## Request Endpoints

### Create Blood Request (Hospital)
- **URL:** `/api/requests`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "patientName", "bloodGroup", "quantity", "reason", "urgency" }`
- **Success Response:** `201 Created`

### Get My Requests (Hospital)
- **URL:** `/api/requests/my-requests`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response:** `200 OK`

---

## Donor & Appointment Endpoints

### Book Appointment (Donor)
- **URL:** `/api/appointments`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "date", "timeSlot" }`
- **Success Response:** `201 Created`

### Check Eligibility (Donor)
- **URL:** `/api/donors/:id/eligibility`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response:** `200 OK` with boolean `isEligible`

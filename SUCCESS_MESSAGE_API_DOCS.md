# Success Message API Endpoints - Documentation

This document provides a comprehensive overview of all API endpoints that return a `{ message: "success" }` response in the KDIH website application.

## Overview

All successful API operations return a JSON response with `message: "success"` along with additional data. This is the standard success indicator used throughout the application.

---

## 📝 Contact & Inquiry Endpoints

### 1. Contact Form Submission
**Endpoint:** `POST /api/contact`

**Purpose:** Submit a contact message from the website

**Request Body:**
```json
{
  "name": "Full Name",
  "email": "email@example.com",
  "message": "Your message here"
}
```

**Success Response:**
```json
{
  "message": "success",
  "id": 123
}
```

**Status Code:** 200

---

### 2. Quick Inquiry
**Endpoint:** `POST /api/inquiry`

**Purpose:** Submit a quick inquiry from homepage

**Request Body:**
```json
{
  "full_name": "Full Name",
  "email": "email@example.com",
  "phone": "+234-800-123-4567",
  "interest": "Course/Training/Incubation"
}
```

**Success Response:**
```json
{
  "message": "success",
  "id": 124
}
```

**Notes:**
- Sends welcome email automatically
- Stores inquiry as a message in database

**Status Code:** 200

---

## 🎓 Course & Registration Endpoints

### 3. Course Enrollment
**Endpoint:** `POST /api/enroll`

**Purpose:** Register for a course

**Success Response:**
```json
{
  "message": "success",
  "id": 125
}
```

**Notes:**
- Sends course enrollment confirmation email
- Calculates "Next Available" schedule automatically

**Status Code:** 200

---

### 4. Get All Courses
**Endpoint:** `GET /api/courses`

**Success Response:**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "Full Stack Development",
      "description": "...",
      "track": "Programming",
      "duration_weeks": 12,
      "price": 150000,
      "status": "active"
    }
  ]
}
```

**Status Code:** 200

---

### 5. Get Single Course
**Endpoint:** `GET /api/courses/:id`

**Success Response:**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "title": "Full Stack Development",
    "modules": [...]
  }
}
```

**Status Code:** 200

---

### 6. Create Course (Admin Only)
**Endpoint:** `POST /api/courses`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "id": 10
}
```

**Status Code:** 200

---

### 7. Update Course (Admin Only)
**Endpoint:** `PUT /api/courses/:id`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "changes": 1
}
```

**Status Code:** 200

---

### 8. Delete Course (Admin Only)
**Endpoint:** `DELETE /api/courses/:id`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "changes": 1
}
```

**Status Code:** 200

---

## 🎪 Events Endpoints

### 9. Get All Events
**Endpoint:** `GET /api/events`

**Success Response:**
```json
{
  "message": "success",
  "data": [...]
}
```

**Status Code:** 200

---

### 10. Get Upcoming Events
**Endpoint:** `GET /api/events/upcoming`

**Success Response:**
```json
{
  "message": "success",
  "data": [...]
}
```

**Status Code:** 200

---

### 11. Create Event (Admin Only)
**Endpoint:** `POST /api/events`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "id": 15
}
```

**Status Code:** 200

---

### 12. Update Event (Admin Only)
**Endpoint:** `PUT /api/events/:id`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "changes": 1
}
```

**Status Code:** 200

---

### 13. Delete Event (Admin Only)
**Endpoint:** `DELETE /api/events/:id`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "changes": 1
}
```

**Status Code:** 200

---

### 14. Register for Event
**Endpoint:** `POST /api/events/:id/register`

**Success Response:**
```json
{
  "message": "success",
  "registration_id": 45
}
```

**Status Code:** 200

---

## 🏢 Services Endpoints

### 15. Get All Services
**Endpoint:** `GET /api/services`

**Success Response:**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "icon": "fa-graduation-cap",
      "title": "LMS Training",
      "description": "..."
    }
  ]
}
```

**Status Code:** 200

---

### 16. Create Service (Admin Only)
**Endpoint:** `POST /api/services`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "id": 8
}
```

**Status Code:** 200

---

### 17. Update Service (Admin Only)
**Endpoint:** `PUT /api/services/:id`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "changes": 1
}
```

**Status Code:** 200

---

### 18. Delete Service (Admin Only)
**Endpoint:** `DELETE /api/services/:id`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "changes": 1
}
```

**Status Code:** 200

---

## 📊 Statistics Endpoint

### 19. Get Dynamic Stats
**Endpoint:** `GET /api/stats`

**Success Response:**
```json
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "value": 150,
      "label": "Youth Trained",
      "suffix": "+"
    },
    {
      "id": 2,
      "value": 25,
      "label": "Startups Incubated",
      "suffix": "+"
    },
    {
      "id": 3,
      "value": 75,
      "label": "Jobs Created",
      "suffix": "+"
    },
    {
      "id": 4,
      "value": 45,
      "label": "% Women Participation",
      "suffix": "%"
    }
  ],
  "calculated_at": "2025-12-05T11:03:48.000Z"
}
```

**Notes:**
- Dynamically calculated from database
- Youth Trained: Count from course_registrations + member_enrollments
- Startups Incubated: Count of accepted/incubated applications
- Jobs Created: 3x startups incubated
- Women Participation: Percentage calculated from registrations

**Status Code:** 200

---

## 🔐 Authentication Endpoints

### 20. Login
**Endpoint:** `POST /api/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "message": "success",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

**Status Code:** 200

---

### 21. Logout
**Endpoint:** `POST /api/logout`

**Success Response:**
```json
{
  "message": "success"
}
```

**Status Code:** 200

---

## 🚀 Startup Incubation Endpoints

### 22. Submit Startup Application
**Endpoint:** `POST /api/startups/apply`

**Request Body:**
```json
{
  "startup_name": "My Startup Inc",
  "founder_name": "John Doe",
  "founder_email": "john@startup.com",
  "founder_phone": "+234-800-123-4567",
  "business_description": "...",
  "pitch_deck_url": "https://...",
  "team_size": 5,
  "industry": "Technology",
  "stage": "Pre-seed",
  "funding_sought": 50000
}
```

**Success Response:**
```json
{
  "message": "success",
  "application_id": 20
}
```

**Status Code:** 200

---

### 23. Get Startup Applications (Admin Only)
**Endpoint:** `GET /api/admin/startups`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "data": [...]
}
```

**Status Code:** 200

---

### 24. Update Application Status (Admin Only)
**Endpoint:** `PATCH /api/admin/startups/:id`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success"
}
```

**Status Code:** 200

---

## 🏢 Co-Working Space Endpoints

### 25. Register as Co-Working Member
**Endpoint:** `POST /api/coworking/register`

**Success Response:**
```json
{
  "message": "success",
  "member_id": 30
}
```

**Status Code:** 200

---

### 26. Book a Desk
**Endpoint:** `POST /api/coworking/book-desk`

**Success Response:**
```json
{
  "message": "success",
  "booking_id": 40
}
```

**Status Code:** 200

---

### 27. Book Meeting Room
**Endpoint:** `POST /api/coworking/book-room`

**Request Body:**
```json
{
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+234-800-123-4567",
  "guest_organization": "ACME Corp",
  "room_name": "Conference Room A",
  "booking_date": "2025-12-10",
  "start_time": "10:00",
  "end_time": "12:00",
  "purpose": "Team Meeting"
}
```

**Success Response:**
```json
{
  "message": "success",
  "booking_id": 50
}
```

**Notes:**
- Sends confirmation email with payment advice
- Calculates total amount based on room capacity and duration
- Rate: ₦2,000 per seat per hour

**Status Code:** 200

---

### 28. Get Available Desks
**Endpoint:** `GET /api/coworking/available-desks/:date`

**Success Response:**
```json
{
  "message": "success",
  "desks": [
    {
      "desk_number": "DESK-1",
      "status": "available"
    },
    {
      "desk_number": "DESK-2",
      "status": "booked"
    }
  ]
}
```

**Status Code:** 200

---

## 📜 Certificate Endpoints

### 29. Generate Certificate (Admin Only)
**Endpoint:** `POST /api/certificates/generate`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "certificate_id": 10,
  "certificate_number": "KDIH-1701435628000-5",
  "verification_code": "abc123xyz456"
}
```

**Status Code:** 200

---

### 30. Verify Certificate
**Endpoint:** `GET /api/certificates/verify/:code`

**Success Response:**
```json
{
  "message": "success",
  "data": {
    "certificate_number": "KDIH-...",
    "student_name": "John Doe",
    "course_title": "Full Stack Development",
    "issue_date": "2025-12-05"
  },
  "valid": true
}
```

**Status Code:** 200

---

## 👥 Admin Endpoints

### 31. Get All Members (Admin Only)
**Endpoint:** `GET /api/admin/members`

**Requires:** Authentication

**Response:** (Note: No explicit "message" field in this one)
```json
{
  "data": [...]
}
```

**Status Code:** 200

---

### 32. Delete Member (Admin Only)
**Endpoint:** `DELETE /api/admin/members/:id`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success"
}
```

**Status Code:** 200

---

### 33. Get All Messages (Admin Only)
**Endpoint:** `GET /api/admin/messages`

**Requires:** Authentication

**Response:** (Note: No explicit "message" field)
```json
{
  "data": [...]
}
```

**Status Code:** 200

---

### 34. Delete Message (Admin Only)
**Endpoint:** `DELETE /api/admin/messages/:id`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success"
}
```

**Status Code:** 200

---

### 35. Get Detailed Members (Admin Only)
**Endpoint:** `GET /api/admin/members/detailed`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "data": [...]
}
```

**Status Code:** 200

---

## 📊 Analytics Endpoints

### 36. Dashboard Analytics (Admin Only)
**Endpoint:** `GET /api/admin/analytics/dashboard`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "data": {
    "total_students": 150,
    "total_revenue": 5000000,
    "active_courses": 8,
    "upcoming_events": 3,
    "pending_applications": 12,
    "active_members": 45
  }
}
```

**Status Code:** 200

---

### 37. Course Completion Rates (Admin Only)
**Endpoint:** `GET /api/admin/analytics/completion-rates`

**Requires:** Authentication

**Success Response:**
```json
{
  "message": "success",
  "data": [
    {
      "title": "Full Stack Development",
      "total_enrollments": 50,
      "completed": 35,
      "completion_rate": 70.00
    }
  ]
}
```

**Status Code:** 200

---

## Common Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `500`: Internal Server Error

---

## Notes

1. **Authentication:** Endpoints marked "Admin Only" require session authentication via `/api/login`
2. **Success Indicator:** All successful operations return `{ message: "success", ... }`
3. **Email Notifications:** Several endpoints automatically send emails:
   - `/api/inquiry` - Welcome email
   - `/api/enroll` - Course enrollment confirmation
   - `/api/coworking/book-room` - Room booking confirmation
4. **Security:** Passwords are hashed using bcrypt
5. **Logging:** Authentication attempts are logged using the logger utility

---

## Testing

To test these endpoints, you can:

1. Start the server: `npm start` or `node server.js`
2. Run the test script: `node test-success-message-api.js`
3. Use tools like Postman, cURL, or the browser console

Example cURL test:
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'
```

Expected response:
```json
{"message":"success","id":123}
```

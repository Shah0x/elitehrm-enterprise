# REST API Documentation
**EliteHRM Secure Backend API Service**
*Owner: Shahmeer | Crafted by Shahmeer Akram*

---

EliteHRM endpoints are prefixed with `/api` and enforce strict JSON schemas, secure HTTP-only cookies, and Role-Based Access Control (RBAC).

---

## 1. Authentication Service (`/api/auth`)

### `POST /login`
Authenticates a user, issues stateless JWT cookies, and records a security audit entry.
- **Request Body**:
  ```json
  {
    "email": "admin@elitehrm.com",
    "password": "EliteAuth_Admin_2026!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "60d5ecb8b3b3a32f0c78a0d1",
      "firstName": "Shahmeer",
      "lastName": "Architect",
      "email": "admin@elitehrm.com",
      "role": "admin",
      "department": "Management",
      "designation": "C-Level Architect",
      "orgId": null
    }
  }
  ```
- **Cookies Injected**:
  - `token` (Access Token, secure, httpOnly, expires in 15 minutes)
  - `refreshToken` (Refresh Token, secure, httpOnly, expires in 7 days)

### `POST /logout`
Terminates the active session, clears authentication cookies, and clears the refresh token database reference.
- **Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### `POST /refresh`
Enforces refresh token validation, rotates the refresh token string (anti-replay), and issues fresh cookies.
- **Response (200 OK)**:
  ```json
  {
    "message": "Tokens refreshed successfully",
    "user": { ... }
  }
  ```

### `GET /me`
Retrieves profile info for the currently signed-in user.
- **Auth**: Required (`token` or `refreshToken`)
- **Response (200 OK)**:
  ```json
  {
    "_id": "60d5ecb8b3b3a32f0c78a0d1",
    "firstName": "Shahmeer",
    "lastName": "Architect",
    "email": "admin@elitehrm.com",
    "role": "admin",
    "department": "Management",
    "designation": "C-Level Architect"
  }
  ```

---

## 2. Employee Directory (`/api/employees`)

### `GET /`
Lists all active employees in the system.
- **Auth**: Required + Admin Only
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "60d5ecd8b3b3a32f0c78a0d2",
      "firstName": "Sarah",
      "lastName": "Parker",
      "email": "sarah@elitehrm.com",
      "role": "employee",
      "department": "Engineering",
      "designation": "Technical Lead",
      "status": "active"
    }
  ]
  ```

### `POST /`
Registers a new candidate, hashes credentials, triggers audit tracking, and dispatches an onboarding email notification.
- **Auth**: Required + Admin Only
- **Request Body**:
  ```json
  {
    "firstName": "Alex",
    "lastName": "Turner",
    "email": "alex.t@elitehrm.com",
    "password": "SecureUserPassword2026!",
    "department": "Engineering",
    "designation": "Junior Frontend Dev"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "_id": "60d5ece8b3b3a32f0c78a0d3",
    "firstName": "Alex",
    "lastName": "Turner",
    "email": "alex.t@elitehrm.com",
    "role": "employee",
    "department": "Engineering",
    "designation": "Junior Frontend Dev",
    "status": "active"
  }
  ```

---

## 3. Leave Manager (`/api/leaves`)

### `GET /all`
Lists all active leave requests across the company.
- **Auth**: Required + Admin Only
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "60d5ecf8b3b3a32f0c78a0d4",
      "userId": {
        "_id": "60d5ecd8b3b3a32f0c78a0d2",
        "firstName": "Sarah",
        "lastName": "Parker",
        "email": "sarah@elitehrm.com"
      },
      "leaveType": "vacation",
      "startDate": "2026-08-01T00:00:00.000Z",
      "endDate": "2026-08-05T00:00:00.000Z",
      "reason": "Annual summer getaway",
      "status": "pending"
    }
  ]
  ```

### `POST /`
Submits a new leave request.
- **Auth**: Required (Any Role)
- **Request Body**:
  ```json
  {
    "leaveType": "sick",
    "startDate": "2026-07-22",
    "endDate": "2026-07-23",
    "reason": "Dental surgery appointment."
  }
  ```

### `PATCH /:id/status`
Approves or rejects a pending leave request and notifies the employee via automated email.
- **Auth**: Required + Admin Only
- **Request Body**:
  ```json
  {
    "status": "approved"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "_id": "60d5ecf8b3b3a32f0c78a0d4",
    "status": "approved",
    "approvedBy": "60d5ecb8b3b3a32f0c78a0d1"
  }
  ```

---

## 4. Attendance Tracker (`/api/attendance`)

### `POST /mark`
Records employee check-ins and check-outs with location logging.
- **Auth**: Required (Any Role)
- **Request Body**:
  ```json
  {
    "type": "check-in",
    "location": "San Francisco Office (HQ)"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "_id": "60d5ed08b3b3a32f0c78a0d5",
    "userId": "60d5ecd8b3b3a32f0c78a0d2",
    "date": "2026-07-20T11:57:00.000Z",
    "checkIn": "2026-07-20T11:57:00.000Z",
    "status": "present",
    "location": "San Francisco Office (HQ)"
  }
  ```

---

## 5. Cognitive Analytics (`/api/analytics`)

### `GET /insights`
Feeds aggregate attendance and leave histories into Gemini 3.5 Flash via a secure server proxy, returning structured executive-level strategic HR insights.
- **Auth**: Required + Admin Only
- **Response (200 OK)**:
  ```json
  {
    "insights": [
      {
        "title": "Mitigating High Late Arrival Ratios",
        "insight": "Data indicates that 18% of Engineering check-ins occur past 9:00 AM. Recommend shifting core hours or introducing flexible schedules to retain talent and optimize sprint velocities.",
        "tag": "Efficiency"
      },
      {
        "title": "Burnout Alert - Vacation Leave Patterns",
        "insight": "High concentration of consecutive leave requests in Product and Design departments indicates potential Q3 fatigue. Recommend a progressive team-wide vacation plan.",
        "tag": "Burnout"
      }
    ]
  }
  ```

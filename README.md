# EliteHRM – Enterprise Human Resource Management System

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

[Live Demo](https://elitehrm-enterprise-e3lrqh3ov-shahmeer-akrams-projects.vercel.app)

EliteHRM is a modern enterprise-grade HR management platform designed to streamline workforce operations for organizations that need speed, visibility, and secure collaboration across HR and employee workflows. It brings together authentication, attendance tracking, leave management, and AI-powered workforce insights into a unified experience that helps HR teams and employees stay aligned in real time.

## Executive Summary

EliteHRM helps HR managers and employees simplify day-to-day people operations without compromising security or usability. The platform provides a polished employee portal for personal attendance and leave activities, while admins can manage the entire workforce, review requests, onboard staff, and gain strategic insights through interactive analytics and executive reporting.

### Core value proposition

- Role-based access for administrators and employees
- Automated attendance workflows with check-in and check-out tracking
- Structured leave request submission and approval flows
- Executive-level reporting with visual dashboards and AI-assisted insights
- Secure session handling with JWT-based authentication and HTTP-only cookies

## Key Features

### Authentication & Security

- JWT-based authentication with access and refresh token rotation
- HTTP-only cookies for secure session storage
- Protected API routes using middleware-based authorization
- Role-aware experience for admin and employee users
- Session refresh and logout handling for secure sign-out

### Employee Portal

- Secure login experience for employees
- Personal attendance history and real-time check-in/check-out tracking
- Leave request submission with date range and reason capture
- View personal leave history and request status

### Admin Management

- Workforce overview with employee directory and onboarding workflows
- Employee creation and organization directory management
- Attendance review and administrative oversight
- Leave approval and rejection actions for pending requests
- Real-time analytics dashboards with charts and AI-generated insights

### Modern Architecture

- Full-stack TypeScript implementation
- Vite-powered front end with React and React Router
- Express REST API designed to run as a Vercel serverless handler
- MongoDB Atlas persistence via Mongoose ODM
- Responsive, polished UI powered by Tailwind CSS and modern iconography

## Tech Stack

| Layer          | Technology                                                                                |
| -------------- | ----------------------------------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, React Router, Tailwind CSS, Lucide Icons, Recharts, Motion UI |
| Backend        | Node.js, Express.js, JWT, Cookie Parser, bcryptjs                                         |
| Database       | MongoDB Atlas, Mongoose ODM                                                               |
| AI Integration | Google Gemini API for executive workforce insights                                        |
| Email          | Nodemailer for onboarding and leave notifications                                         |
| Deployment     | Vercel with serverless API routing and SPA rewrites                                       |

## System Architecture

EliteHRM follows a modular full-stack design:

- The React frontend renders the HR experience as a single-page application.
- The Express backend exposes secure REST endpoints for authentication, employee management, attendance, leave, and analytics.
- MongoDB stores users, attendance logs, leave requests, organization metadata, and activity history.
- Vercel hosts both the frontend and API routes through a unified deployment configuration.

## Project Structure

```text
api/                # Vercel serverless API entrypoint
src/
  components/       # Reusable UI components
  context/          # Auth and theme context providers
  pages/            # Dashboard, attendance, leave, directory, and settings views
  server/           # Express routes, middleware, controllers, models, services, and seed logic
server.ts           # Local development server and Express app bootstrap
vercel.json         # Vercel rewrite rules for SPA + API routing
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- MongoDB Atlas account
- A Google Gemini API key (optional, for AI insights)

### 1. Clone the repository

```bash
git clone https://github.com/Shah0x/elitehrm-enterprise
cd elitehrm-enterprise
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root with the following variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
VITE_API_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
PORT=3000
```

### Variable descriptions

| Variable           | Description                                       |
| ------------------ | ------------------------------------------------- |
| MONGODB_URI        | MongoDB Atlas connection string used by Mongoose  |
| JWT_SECRET         | Secret key for signing access tokens              |
| JWT_REFRESH_SECRET | Secret key for signing refresh tokens             |
| VITE_API_URL       | Base URL for frontend API requests in development |
| GEMINI_API_KEY     | API key for AI-generated executive insights       |
| NODE_ENV           | Runtime mode such as development or production    |
| PORT               | Local development port for Express                |

### 3. Run locally

```bash
npm run dev
```

The application will start locally and serve the app through the Express/Vite development setup.

## API Endpoints

| Module     | Endpoint                | Description                                          |
| ---------- | ----------------------- | ---------------------------------------------------- |
| Auth       | /api/auth/login         | Authenticate a user and issue secure session cookies |
| Auth       | /api/auth/logout        | Clear auth cookies and end the session               |
| Auth       | /api/auth/refresh       | Rotate refresh tokens and issue new session cookies  |
| Auth       | /api/auth/me            | Retrieve the current authenticated user              |
| Employees  | /api/employees          | List employees (admin), create new employee (admin)  |
| Employees  | /api/employees/:id      | Retrieve a specific employee                         |
| Attendance | /api/attendance/stats   | View company-wide attendance summary (admin)         |
| Attendance | /api/attendance/my      | Fetch a user’s personal attendance history           |
| Attendance | /api/attendance/mark    | Check in or check out for the current day            |
| Leaves     | /api/leaves/all         | Fetch all leave requests (admin)                     |
| Leaves     | /api/leaves/my          | Fetch an employee’s personal leave history           |
| Leaves     | /api/leaves             | Submit a new leave request                           |
| Leaves     | /api/leaves/:id/status  | Approve or reject a leave request (admin)            |
| Analytics  | /api/analytics/insights | Generate strategic HR insights using Gemini AI       |
| Health     | /api/health             | Basic health check endpoint                          |

## Deployment Architecture

EliteHRM is deployed on Vercel using a unified routing strategy:

- The Vite frontend is served as a single-page app.
- API requests to /api/\* are routed to the serverless backend entrypoint.
- The rewrite rules in vercel.json ensure that the frontend and API routes work seamlessly from a single deployment.

This allows the project to function as a modern monorepo-style deployment without requiring a separate backend host.

## Demo Credentials

The application includes demo authentication flow for rapid evaluation:

- Admin: admin@elitehrm.com / EliteAuth_Admin_2026!
- Employee: sarah@elitehrm.com / EliteAuth_Emp_2026!

## Author

Developed by Shahmeer Akram

- Full-Stack MERN Developer
- Computer Science Student
- Passionate about building scalable, elegant, and enterprise-ready web applications

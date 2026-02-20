# Smart Complaint & Issue Tracking System - Documentation

## Project Overview
This project is a comprehensive **Smart Complaint & Issue Tracking System** designed to facilitate transparent e-governance. It allows citizens to lodge complaints with geolocation and photo evidence, automatically routes them to the relevant department, and provides tracking mechanisms. Administrators and Department Staff have dedicated dashboards to manage and resolve issues.

## Technology Stack
- **Frontend**: React.js (Vite), Vanilla CSS (Glassmorphism Design), Axios/Fetch API.
- **Backend**: Python Django, Django REST Framework (DRF).
- **Database**: SQLite (Development), extensible to PostgreSQL/MySQL.
- **Authentication**: Token-based (or Session/Cookie based for specific flows), Custom User Model.
- **Maps**: Leaflet (Frontend), GeoDjango (Backend capabilities).

## User Roles & Capabilities

### 1. Citizen
- **Registration/Login**: Create an account to track complaints.
- **Lodge Complaint**: Submit issues with Title, Description, Category, Photo, and Location (auto-detected).
- **Track Status**: View list of submitted complaints and their current status (Pending, In Progress, Resolved, etc.).
- **Feedback**: Provide feedback after resolution (planned).

### 2. Department Staff (e.g., Electricity, Water Dept)
- **Login**: Dedicated login for department personnel.
- **Dashboard**: View only complaints assigned to their specific department.
- **Issue Resolution**: Update status (e.g., move from 'Pending' to 'In Progress' to 'Resolved') and priority.
- **Filtering**: Filter complaints by status or priority.

### 3. Administrator
- **Superuser Access**: Full view of all complaints across all departments.
- **Staff Management**: specialized dashboard tab to:
    - View all registered users.
    - Grant/Revoke 'Department Staff' access.
    - Assign users to specific departments.
- **Complaint Management**: Override status, priority, or reassign complaints.
- **Analytics**: View statistics on complaint volume and status distribution.

## Architecture

### Backend (`complaint_system/`)
- **`config/`**: Main Django settings and URL configuration.
- **`accounts/`**: Handles User Authentication, Registration, and Profile management.
  - *Models*: `UserProfile` (flags for `is_department_user`).
  - *Views*: Register, Login, User List (Admin), Update Role (Admin).
- **`complaints/`**: Core application logic.
  - *Models*: `Complaint` (linked to Category & User), `Category`, `StatusHistory`.
  - *Views*: `ComplaintViewSet` (CRUD operations with permission logic).
  - *Serializers*: Validation and data transformation.
- **`notifications/`**: Email notifications (stubbed/implemented).

### Frontend (`frontend/`)
- **`src/context/AuthContext.jsx`**: Manages global authentication state.
- **`src/pages/`**:
  - `LandingPage.jsx`: Public home page.
  - `SubmitComplaint.jsx`: Form for citizens.
  - `UserDashboard.jsx`: Citizen view.
  - `AdminDashboard.jsx`: Administrator view (includes Staff Management tab).
  - `DeptDashboard.jsx`: Department Staff view.
  - `Login.jsx` / `Register.jsx`: Auth pages.

## Recent Major Changes & Changelog

### Version 3.1 - Department Logic & Usage Fixes
- **Department Visibility Fix**: Resolved issue where department staff could not see complaints.
  - *Fix*: Backfilled `department` field on existing complaints. ensuring proper data alignment between `Category` and `Complaint`.
  - *Enhancement*: Updated `ComplaintViewSet.get_queryset` to strictly enforce department-based filtering for department staff, improving security and UX.
- **Department Staff Permissions**:
  - Allowed Department Staff to update Status and Priority of complaints (previously restricted to Admin).
  - Updated `ComplaintViewSet.update` to perform role-based checks.

### Version 3.0 - User Management & Admin Tools
- **Staff Management UI**: Added a dedicated tab in Admin Dashboard to manage users.
- **Role Assignment**: Admins can now toggle `is_department_user` and assign departments directly from the UI.
- **API Updates**: Added `/api/auth/users/` endpoint to list and manage users.

### Version 2.0 - UI Modernization
- **Glassmorphism Design**: Implemented a modern, dark-themed UI with glass effects, gradients, and responsive layouts.
- **Animations**: Added loading spinners, hover effects, and smooth transitions.

## Installation & Setup

### Backend
1. **Navigate to project root**: `cd d:\PROJECT CLOUDREGEX\complaint_system`
2. **Create Virtual Environment**: `python -m venv venv`
3. **Activate Venv**: `.\venv\Scripts\activate` (Windows)
4. **Install Dependencies**: `pip install -r requirements.txt` (Ensure Django, DRF, Pillow, etc. are installed)
5. **Run Migrations**: `python manage.py migrate`
6. **Start Server**: `python manage.py runserver`

### Frontend
1. **Navigate to frontend**: `cd frontend`
2. **Install Dependencies**: `npm install`
3. **Run Dev Server**: `npm run dev`
4. **Build**: `npm run build`

## API Endpoints Key Summary

- **Auth**:
  - `POST /api/auth/register/`: Citizen registration.
  - `POST /api/auth/login/`: Login.
  - `GET /api/auth/users/`: List users (Admin only).
  - `PATCH /api/auth/users/<id>/`: Update user role/dept (Admin only).
  
- **Complaints**:
  - `GET /api/complaints/`: List complaints (Filtered by role).
  - `POST /api/complaints/`: Submit new complaint.
  - `PATCH /api/complaints/<id>/`: Update status/priority (Admin/Dept Staff).
  - `GET /api/complaints/statistics/`: Dashboard stats.

## Future Roadmap
- **Feedback Loop**: Enable citizens to rate the resolution.
- **Chat System**: Direct communication between staff and citizen.
- **Mobile App**: React Native mobile application.
- **AI Integration**: Auto-categorization of complaints based on description/image.

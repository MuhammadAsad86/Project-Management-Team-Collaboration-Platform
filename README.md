# NexaFlow

## Project Management & Team Collaboration Platform

NexaFlow is a full-stack MERN application designed to help teams manage projects, organize tasks, collaborate with team members, track project progress, and manage deadlines from a centralized platform.

The application provides a role-based system for **Administrators, Project Managers, and Team Members**, ensuring that each user has access to features and information relevant to their responsibilities.

NexaFlow focuses on creating a structured workflow where projects can be created, managers can be assigned, team members can collaborate, tasks can be managed, and overall project progress can be monitored.

---

## 🚀 Features

### 🔐 Authentication & Security

* User Registration
* User Login
* User Logout
* JWT-based Authentication
* Protected Routes
* Secure authentication workflow
* Unauthorized access protection
* Role-Based Access Control

---

## 👥 Role-Based Access System

NexaFlow includes three main user roles.

### 👑 Admin

The Admin has access to the overall system and can manage users, projects, teams, and tasks.

Admin capabilities include:

* View overall dashboard statistics
* Manage users
* Manage user roles
* Create and manage projects
* Assign Project Managers
* Manage team members
* Monitor tasks and projects
* Access calendar and deadlines
* Manage profile information

---

### 📊 Project Manager

Project Managers are responsible for managing their assigned projects and monitoring team progress.

Project Manager capabilities include:

* Access assigned projects
* View project details
* Manage project team members
* View and manage project tasks
* Assign tasks to team members
* Monitor task progress
* Track project progress
* Participate in project discussions
* Access calendar and deadlines
* Manage profile information

---

### 👨‍💻 Team Member

Team Members can access projects and tasks assigned to them.

Team Member capabilities include:

* Access assigned projects
* View assigned tasks
* Monitor task information
* Participate in project discussions
* Add comments for collaboration
* Receive task and comment notifications
* Track deadlines using the calendar
* Access and manage profile information

---

# 📊 Dashboards

NexaFlow provides role-based dashboards that display relevant information based on the logged-in user's role.

## Admin Dashboard

The Admin dashboard provides an overview of the entire workspace.

It includes information such as:

* Total Users
* Project Managers
* Team Members
* Total Projects
* Active Projects
* Completed Projects

This allows administrators to quickly monitor the overall activity of the platform.

---

## Project Manager Dashboard

The Project Manager dashboard focuses on project and task monitoring.

It provides information such as:

* Assigned Projects
* Active Projects
* Pending Tasks
* Completed Tasks
* Project Overview
* Task Overview

---

## Team Member Dashboard

The Team Member dashboard provides a personal overview of assigned work.

It includes:

* Assigned Projects
* Assigned Tasks
* Pending Tasks
* Tasks In Progress
* Tasks Under Review
* Completed Tasks
* Upcoming Deadlines

---

# 📁 Project Management

NexaFlow provides a complete project management workflow.

Users with appropriate permissions can:

* Create projects
* View projects
* Edit project information
* Delete projects
* Assign Project Managers
* Set project priority
* Set project status
* Search projects
* Filter projects by status
* Filter projects by priority
* Navigate projects using pagination

Each project contains detailed information and collaboration features.

---

# 📌 Project Details

Every project includes multiple sections.

## Overview

The Overview section displays important project information including:

* Project Name
* Project Description
* Project Status
* Project Priority
* Assigned Project Manager
* Project Information and Statistics

---

## Tasks

The Tasks section displays tasks related to a specific project.

Users can view:

* Task Title
* Description
* Assigned Team Member
* Priority
* Status
* Due Date

---

## Members

The Members section allows project teams to be managed.

Features include:

* View Project Members
* Search Team Members
* Add Members to a Project
* Remove Members from a Project

---

## Discussion

The Discussion section allows team collaboration through comments.

Users can:

* View discussions
* Add comments
* Collaborate with other project members
* Manage their own comments where permitted

---

## Progress

The Progress section provides an overview of task completion and project progress.

It includes:

* Total Tasks
* Task Status Statistics
* Tasks In Progress
* Tasks Under Review
* Completed Tasks
* Overall Project Progress

---

# ✅ Task Management

NexaFlow includes a structured task management system.

Users with the appropriate permissions can:

* Create tasks
* View tasks
* Edit tasks
* Delete tasks
* Assign tasks to team members
* Associate tasks with projects
* Set task priority
* Set task due dates
* Track task status
* Search tasks
* Filter tasks

Each task contains important information such as:

* Task Title
* Description
* Project
* Assigned User
* Priority
* Status
* Due Date

---

## 🔄 Task Status Workflow

Tasks can move through different stages of the project workflow:

* To Do
* In Progress
* Review
* Completed

This structure helps teams organize work and monitor task progress.

---

# 🔔 Notifications

The platform includes a notification system to keep users informed about important activities.

Notifications can be generated for:

* Task-related activities
* Task assignments
* Comments and discussions

Users can:

* View notifications
* Identify unread notifications
* Mark individual notifications as read
* Mark all notifications as read

---

# 💬 Collaboration & Discussion

NexaFlow supports collaboration between project members.

Users can interact through the discussion and comment system.

This allows team members and project managers to communicate within the context of their projects and tasks.

Collaboration features include:

* Add Comments
* View Comments
* Project Discussions
* Task Discussions
* Comment-Based Notifications

---

# 📅 Calendar & Deadlines

The Calendar feature provides a visual overview of project tasks and deadlines.

Users can:

* View task due dates
* Track upcoming deadlines
* View scheduled tasks
* Monitor project timelines
* Organize work using a calendar interface

---

# 🔎 Search, Filtering & Pagination

To make project data easier to manage, NexaFlow includes search and filtering features across different sections.

### User Management

* Search Users
* Filter Users by Role

### Project Management

* Search Projects
* Filter by Status
* Filter by Priority
* Pagination

### Task Management

* Search Tasks
* Filter by Status
* Filter by Priority

---

# 👤 Profile Management

Users can manage their personal account information through the Profile section.

Features include:

* View Profile
* Update Profile Information
* View Role Information
* Change Password functionality, where available

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* React Router
* Context API
* React Icons
* CSS

## Backend

* Node.js
* Express.js
* REST API
* JWT Authentication

## Database

* MongoDB
* Mongoose

---

# 🏗️ System Architecture

NexaFlow follows a MERN stack architecture.

```text
React + Vite Frontend
        ↓
REST API
        ↓
Node.js + Express.js Backend
        ↓
MongoDB Database
```

The frontend communicates with the backend using REST APIs.

Authentication is handled using JWT, while MongoDB is used to store application data such as:

* Users
* Projects
* Tasks
* Comments
* Notifications

---

# 🔄 Application Workflow

The main workflow of NexaFlow is:

```text
Admin
  ↓
Creates and manages users
  ↓
Assigns user roles
  ↓
Creates projects
  ↓
Assigns a Project Manager
  ↓
Adds Team Members to projects
  ↓
Creates and assigns tasks
  ↓
Project Manager
  ↓
Manages assigned projects and monitors progress
  ↓
Team Member
  ↓
Views assigned work
  ↓
Collaborates through discussions and comments
  ↓
Receives notifications
  ↓
Tracks deadlines through the calendar
```

---

# 📂 Suggested Project Structure

```text
NexaFlow/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/nexaflow.git
```

```bash
cd nexaflow
```

---

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

## 3. Create Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

---

## 4. Start the Backend

```bash
npm run dev
```

---

## 5. Install Frontend Dependencies

Open another terminal.

```bash
cd client
npm install
```

---

## 6. Start the Frontend

```bash
npm run dev
```

The application will run locally through the Vite development server.

---

# 🔑 Demo Admin Credentials

For testing and demonstrating the application, you can use the following Admin account:

**Email:** `a1@gmail.com`

**Password:** `123456`

> ⚠️ These credentials are intended for local development and demo purposes only. Do not use this password for a production deployment.

---

# 🎯 Key Highlights

* Full MERN Stack Application
* JWT Authentication
* Role-Based Access Control
* Admin, Project Manager and Team Member Dashboards
* User Management
* Project Management
* Team Collaboration
* Task Management
* Task Assignment
* Project Progress Tracking
* Comments and Discussions
* Notification System
* Calendar and Deadline Tracking
* Search and Filtering
* Pagination
* Responsive User Interface

---

# 📸 Project Demo

A complete project demonstration video showcases the major workflows and features of NexaFlow, including:

* Role-Based Dashboards
* User Management
* Project Management
* Project Details
* Team Members
* Task Management
* Project Progress
* Discussion and Collaboration
* Notifications
* Calendar and Deadlines
* Profile Management

---

# 🚧 Future Improvements

Possible future enhancements include:

* Real-time notifications using Socket.io
* File attachments for projects and tasks
* Advanced analytics and reporting
* Email notifications
* Activity logs
* Drag and drop task boards
* Dark mode
* Improved mobile experience
* Deployment with production environment configuration

---

# 👨‍💻 Author

**Muhammad Asad**

BS Information Technology Student
MERN Stack Developer

GitHub: https://github.com/MuhammadAsad86

LinkedIn: https://www.linkedin.com/in/muhammadasad86/

---

## ⭐ Support

If you found this project useful, consider giving the repository a star on GitHub.

# 🚀 ResolveX — Issue Tracking System

ResolveX is a web-based **Issue Tracking System** designed to help teams create, manage, track, and resolve software issues efficiently.

The system provides secure user authentication, issue management, status tracking, searching, filtering, comments, activity history, and a dashboard for monitoring issue progress.

---

## 📌 Project Overview

**ResolveX** provides a centralized platform for managing software development issues such as bugs and tasks.

Users can create issues, assign them to users, update their status and priority, add comments, and monitor the complete activity history of each issue.

The main goal of ResolveX is to make issue tracking **simple, organized, transparent, and efficient**.

---

## ✨ Features

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Password hashing
* Protected routes
* Logout functionality

### 🐛 Issue Management

* Create new issues
* View all issues
* View detailed issue information
* Edit issues
* Delete issues
* Assign issues to users
* Set issue type
* Set priority
* Set due date

### 📊 Issue Status

ResolveX supports the following issue statuses:

* Open
* In Progress
* Resolved
* Closed

### 🏷️ Issue Types

* Bug
* Task

### ⚡ Priority Levels

* Low
* Medium
* High

### 🔎 Search & Filtering

* Search issues by title and description
* Filter by status
* Filter by priority
* Filter by issue type

### 💬 Comments

* Add comments to issues
* View comment history
* Identify the user who posted each comment
* Display comment timestamps

### 📝 Activity History

ResolveX records important changes made to issues, including:

* Issue creation
* Status changes
* Priority changes
* Assignment changes
* Other important issue updates

### 📈 Dashboard

The dashboard provides a quick overview of the issue tracking system:

* Total Issues
* Open Issues
* Completed Issues
* High Priority Issues

### 🛡️ Validation & Error Handling

* Required field validation
* Email validation
* Duplicate account prevention
* Invalid login handling
* Unauthorized request handling
* Invalid issue handling
* Database error handling
* User-friendly error messages

### 📱 Responsive UI

The application is designed to work across:

* Desktop
* Tablet
* Mobile

---

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JSON Web Token (JWT)
* bcrypt

### Development Tools

* Git
* GitHub
* Postman
* VS Code

---

## 🏗️ System Architecture

```text
                ┌─────────────────────┐
                │     React Client    │
                │      Frontend       │
                └──────────┬──────────┘
                           │
                           │ HTTP / REST API
                           ▼
                ┌─────────────────────┐
                │    Express.js API   │
                │      Backend        │
                └──────────┬──────────┘
                           │
                           │ Mongoose
                           ▼
                ┌─────────────────────┐
                │      MongoDB        │
                │       Database      │
                └─────────────────────┘
```

---

## 📂 Project Structure

```text
ResolveX/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔑 Main API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Authenticate user   |

### Issues

| Method | Endpoint          | Description          |
| ------ | ----------------- | -------------------- |
| GET    | `/api/issues`     | Get all issues       |
| GET    | `/api/issues/:id` | Get a specific issue |
| POST   | `/api/issues`     | Create an issue      |
| PUT    | `/api/issues/:id` | Update an issue      |
| DELETE | `/api/issues/:id` | Delete an issue      |

### Comments

| Method | Endpoint                        | Description        |
| ------ | ------------------------------- | ------------------ |
| GET    | `/api/issues/:issueId/comments` | Get issue comments |
| POST   | `/api/issues/:issueId/comments` | Add a comment      |

### Dashboard

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/api/issues/dashboard` | Get dashboard statistics |

> Endpoint names may be adjusted according to the final implementation.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

```bash
cd ResolveX
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

---

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

## 🔒 Environment Variables

The following environment variables are required:

```env
PORT=
MONGODB_URI=
JWT_SECRET=
```

**Do not commit the `.env` file to GitHub.**

---

## 🧪 Testing

The REST APIs were tested using **Postman**.

Testing includes:

* User registration
* User login
* Authentication
* Issue creation
* Issue retrieval
* Issue updates
* Issue deletion
* Search and filtering
* Status updates
* Comments
* Error handling
* Validation
* Unauthorized requests

---

## 🖥️ Application Pages

ResolveX includes the following main pages:

```text
Login
Register
Dashboard
Issues
Create Issue
Issue Details
Edit Issue
```

---

## 📸 Screenshots

### Login

*Add login page screenshot here.*

### Dashboard

*Add dashboard screenshot here.*

### Issue List

*Add issue list screenshot here.*

### Create Issue

*Add create issue screenshot here.*

### Issue Details

*Add issue details screenshot here.*

### Comments & Activity History

*Add comments/activity screenshot here.*

---

## 🎥 Demo Video

A 3–5 minute demonstration video is provided showing the main functionality of ResolveX.

**Demo Video:**
`<ADD_YOUR_GOOGLE_DRIVE_OR_VIDEO_LINK_HERE>`

---

## 📌 GitHub Branch

The project was developed using a dedicated feature branch:

```text
feature/issue-tracking-system
```

---

## 🎯 Future Improvements

Potential future enhancements include:

* File attachments
* Pagination
* Advanced analytics
* Additional dashboard charts
* Email notifications
* Role-based access control
* Real-time issue updates
* Advanced reporting

---

## 👨‍💻 Developer

**Nadula Hatharasinghe**

Information Technology Undergraduate
Sri Lanka Institute of Information Technology (SLIIT)

---

## 📄 License

This project was developed for educational purposes as an individual academic assignment.

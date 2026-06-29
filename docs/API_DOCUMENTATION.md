# Momentum AI — API Documentation & Setup Guide

This guide is designed for developers, architects, and QA engineers working with Momentum AI. It describes our endpoint structures, route input validation boundaries, and environment configurations.

---

## ⚙️ Environment Variables Setup

Momentum AI utilizes structured configuration files and environment keys. Copy the `.env.example` to `.env` and fill out the parameters:

```env
# Server Runtime
NODE_ENV=development
PORT=3000

# Google Gemini API
GEMINI_API_KEY=your-secure-google-gemini-api-key

# Firebase Applet Credentials (Optional, syncs with firebase-applet-config.json)
FIREBASE_API_KEY=AIzaSy...
```

---

## 📋 API Endpoints Specification

All API paths are prefixed with `/api`. Success responses return standard JSON with `success: true`.

### 1. Authentication & Session Services

#### `POST /api/auth/login-email`
Logs in a user or registers a new profile based on email validation.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "harshitagarwal11345@gmail.com",
    "password": "optionalPasswordString"
  }
  ```
- **Success Response (200 OK)**:
  - Sets cookie: `session_user_id=usr_01h8a9; Path=/; HttpOnly; SameSite=Lax`
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_01h8a9",
      "email": "harshitagarwal11345@gmail.com",
      "full_name": "HARSHITAGARWAL11345",
      "is_premium": false,
      "dark_mode": true
    }
  }
  ```

#### `POST /api/auth/login-google`
Handles Google Single Sign-on via Firebase GoogleAuthProvider.
- **Request Body**:
  ```json
  {
    "email": "harshitagarwal11345@gmail.com",
    "name": "Harshit Agarwal",
    "avatar": "https://example.com/avatar.jpg"
  }
  ```
- **Success Response (200 OK)**: Sets cookie session and logs user activity.

#### `POST /api/auth/logout`
Invalidates active session.
- **Success Response (200 OK)**: Sets cookie `Max-Age=0` to clear browser credentials.

---

### 2. Task Management Services

#### `GET /api/tasks`
Retrieves all tasks for the logged-in user.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "tsk_8a43fbc",
        "title": "Draft Pitch Deck Slide Template",
        "priority": "high",
        "status": "in_progress",
        "subtasks": [
          { "id": "sub_1", "title": "Opportunity slide", "completed": true }
        ],
        "dependencies": ["tsk_research"],
        "risk_score": 35,
        "predicted_deadline": "2026-06-30T00:00:00Z"
      }
    ]
  }
  ```

#### `POST /api/tasks/natural`
Uses Agentic LLM parser to extract fields from raw paragraphs/dictations.
- **Request Body**:
  ```json
  {
    "prompt": "Urgent slides template due by Tuesday afternoon with priority high"
  }
  ```
- **Success Response (200 OK)**: Parses and returns fully structured Task item with a 4-step checklist of subtasks and custom priority tags.

#### `POST /api/tasks/:id/breakdown`
Triggers AI to decompose a task into a set of 3-5 tactical subtasks.
- **Success Response (200 OK)**: Returns the updated task object with the generated subtask items array.

---

### 3. Smart Scheduling & Agentic Optimization

#### `POST /api/schedules/optimize`
Triggers the Scheduler Agent to read all uncompleted tasks, evaluate risk indicators, and output sequential focused calendar blocks.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Calendar optimization completed successfully.",
    "data": [
      {
        "id": "sch_8f1k9a",
        "title": "Optimized: Draft Pitch Deck Slide Template",
        "start_time": "2026-06-29T09:00:00Z",
        "end_time": "2026-06-29T11:00:00Z",
        "is_cognitive_reservation": true
      }
    ]
  }
  ```

---

## 🛡️ Route Validation & Error Protocols

Our routes are guarded by standard validation intercepts. Any error results in consistent structured payloads:

```json
{
  "error": "Unauthorized session.",
  "status": 401
}
```
Or for missing inputs:
```json
{
  "error": "Email is required.",
  "status": 400
}
```
All failures are logged with full telemetry profiles in the `activityLogs` list for DevOps monitoring.

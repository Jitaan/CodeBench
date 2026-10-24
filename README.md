# CodeBench

CodeBench is a web-based coding practice platform for solving Python programming problems through an interactive coding environment.

Users can authenticate using **Email, Google, or GitHub**, browse coding problems, submit Python solutions, and have their code evaluated against predefined test cases.

**Live Demo:** https://code-bench-iota.vercel.app/

## Features

* User authentication with Email, Google, and GitHub
* Interactive coding problems dashboard
* Python code execution and test-case evaluation
* User session management
* Responsive interface
* Secure backend API
* Persistent authentication and user data with Supabase

## Tech Stack

### Frontend

* React
* React Router
* Tailwind CSS
* shadcn/ui
* Axios

### Backend

* Flask
* Python

### Authentication & Database

* Supabase Authentication
* Supabase Database
* Google OAuth
* GitHub OAuth

## Architecture

```text
React Frontend
      │
      ├── Supabase Auth
      │
      └── Flask API
             │
             └── Python Code Execution
                    │
                    └── Test Cases
```

## Deployment

The frontend is deployed on **Vercel**.

The Flask backend provides the API endpoints used for Python code execution and evaluation.

[https://supabase.com](https://supabase.com)

Create:

* A new project
* Enable Authentication

---

## 4. Create Environment Variables

Create a `.env` file in the root directory:

```
.env
```

Add:

```
VITE_SUPABASE_URL=your_supabase_project_url  
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  
```

Get these from:

Supabase → Settings → API

---

# Authentication Setup

## Enable Google OAuth

Go to:

Google Cloud Console

Create OAuth credentials.

Add callback URL:

```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

Paste:

* Client ID
* Client Secret

into Supabase.

---

## Enable GitHub OAuth

Go to:

[https://github.com/settings/developers](https://github.com/settings/developers)

Create OAuth App.

Set callback URL:

```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

Paste:

* Client ID
* Client Secret

into Supabase.

---

# Backend Setup (Flask API)

Navigate to the project root directory.

## Create Virtual Environment

```bash
python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

---

## Install Backend Dependencies

Navigate to backend folder:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Run Flask Backend

Go back to project root:

```bash
cd ..
```

Run backend using:

```bash
python -m backend.app
```

Backend will start at:

```
http://localhost:5000
```

---

# Contest Registration and Scoring

- Sign in with Supabase Auth before registering for a contest.
- Register from the contests page before the scheduled start time. Registration closes when the contest starts.
- During an active contest, only registered participants can enter and solve its problems.
- Submit a solution and receive an **Accepted** verdict to earn the points configured for that problem in `contest_problems.points`. Points are awarded once per participant per problem; using **Run** does not award points.
- Questions in past contests open in practice mode and do not add contest points. Accepted submissions from before this scoring behavior was deployed are not credited retroactively.

## Backend Environment Variables

Create `backend/.env` with the Supabase project URL and a server-side service-role key:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Keep the service-role key private and only in the backend environment. Do not add it to frontend environment variables or commit it. The backend uses this key to authenticate participants, read contest data, and update scores. Restart the Flask server after changing backend environment variables or code.

For a deployed frontend, set `VITE_API_BASE_URL` to the public base URL of the Flask API before building the frontend. Locally it defaults to `http://localhost:5000`.

---

# Running the Full Application

Run backend and frontend in **separate terminals**.

## Terminal 1 — Start Backend

```bash
python -m backend.app
```

## Terminal 2 — Start Frontend

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

Backend runs at:

```
http://localhost:5000
```

Make sure both servers are running simultaneously for full functionality.

---
---

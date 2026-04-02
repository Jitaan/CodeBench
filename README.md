<<<<<<< HEAD
# CodeBench
=======
>>>>>>> e23633aa9f01367418fdcfb25ca6478a33168dd3
# CodeBench — Online Coding Practice Platform

CodeBench is a web-based coding practice platform that allows users to authenticate using Email, Google, or GitHub and practice coding problems in Python through an interactive problems dashboard.

The platform includes secure authentication, session management, a responsive user interface, and a Flask API backend that executes Python code against predefined test cases.

---

# Tech Stack

## Frontend

* React  
* React Router  
* Tailwind CSS  
* shadcn/ui  
* Axios (API Communication)  

## Backend

* Flask API  

## Authentication

* Supabase Authentication  
* Supabase Database  

## OAuth Providers

* Google OAuth  
* GitHub OAuth  

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/your-username/codebench.git
cd codebench
````

---

## 2. Install Frontend Dependencies

```bash
npm install
```

---

## 3. Setup Supabase

Go to:

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

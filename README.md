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


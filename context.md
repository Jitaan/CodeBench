# CodeBench - Project Context

## Overview
CodeBench is an online judge (OJ) with contest functionality. It allows users to solve programming problems individually (practice) or as part of timed contests with registration, participation restrictions, leaderboards, and contest scoring.

**Repository Root:** `C:\data\codebench`  
**Main Branch:** `main`  
**Current State:** Active development (contest system fully integrated)

## Tech Stack

### Frontend
- **Framework:** React 19.2.4 + Vite 8.0.1
- **Routing:** react-router-dom 7.13.2
- **UI Components:** shadcn/ui (radix-ui, class-variance-authority, tailwind-merge), Tailwind CSS 4.2.2
- **Code Editor:** Monaco Editor (@monaco-editor/react 4.7.0)
- **Auth:** Supabase Auth (@supabase/supabase-js 2.101.1)
- **HTTP:** axios 1.14.0 (also uses native fetch via api service)
- **Markdown:** react-markdown 10.1.0
- **Icons:** @hugeicons/react 1.1.6
- **Other:** react-resizable-panels, tw-animate-css

### Backend
- **Framework:** Flask + Flask-CORS
- **Database/Auth:** Supabase (Postgres + Supabase Auth)
- **Code Execution:** Custom judge runner in `backend/runner/execute.py`
- **Server:** gunicorn (production), Flask dev server (port 5000)
- **Environment:** python-dotenv

### Database
- **Provider:** Supabase (Postgres)
- **Auth:** Supabase Auth (OAuth/Email)
- **Tables Referenced:** `users`, `problems`, `testcases`, `submissions`, `contests`, `contest_problems`, `contest_participants`

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │────────▶│   Flask Backend  │────────▶│  Supabase (DB)  │
│  (Vite dev/     │  HTTP   │   (app.py/routes)│  SDK    │  Auth + Postgres│
│   static build) │  +JWT   │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        │ Supabase Auth             │ Judge
        └───────────────────────────▶ (runner/execute.py)
```

**Data Flow:**
1. Frontend authenticates via Supabase Auth (session stored client-side)
2. Frontend sends API requests to Flask backend with `Authorization: Bearer <access_token>`
3. Backend validates token via `supabase.auth.get_user(token)`, ensures linked `users` row exists (creates if missing using service role)
4. Backend enforces contest rules (registration, time windows, participant checks)
5. For judge requests, backend runs test cases via `runner.execute.judge_code()` and persists to Supabase
6. Scoring updates `contest_participants.score` on first Accepted submission per problem

## Frontend Structure

### Routes (`frontend/src/App.jsx`)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | `Login` | Authentication page |
| `/` | `Home` | Landing page with problem list |
| `/solve/:problemId` | `Solve` | Code editor/solver (practice or contest context via query params) |
| `/contests` | `Contests` | Contest list (Upcoming/Active and Past sections) |
| `/contests/:contestId` | `ContestDetail` | Contest detail (active workspace or past archive) |

### Key Components
- **`Navbar.jsx`** - Navigation and auth state
- **`ContestList.jsx`** - Split into "Upcoming/Active Contests" and "Past Contests" tables (shadcn). Upcoming shows Register/Enter Contest; Past shows View Contest with question names in archive view
- **`ProblemList.jsx`** - Problem listing (used on Home)
- **`EditorPanel.jsx`** - Monaco-based code editor with Run/Submit, verdict display, contest points feedback

### Auth Hook (`frontend/src/hooks/useAuth.js`)
- Uses Supabase Auth session
- Tracks `user`, `loading` state
- **Note:** No longer syncs to application `users` table from browser (was removed to avoid RLS issues). Backend provisions linked profile as needed.

### API Service (`frontend/src/services/api.js`)
**Configuration:** `VITE_API_BASE_URL` or `VITE_API_URL` (defaults to `http://localhost:5000`)

**Helpers:**
- `backendRequest(path, options)` - Attaches Supabase session token, validates JSON responses, throws on errors
- `query(request)` - Wrapper for direct Supabase queries with error handling

**API Modules:**
- **`problemAPI`**: `getAll()`, `getById(id, contestId)` - contest problems fetched via backend if contestId provided
- **`contestAPI`**: `getAll()`, `getById()`, `getProblems()`, `getParticipants()`, `getRegistration()`, `register()`, `leave()`, `verifyAccess()`, `join()`
- **`judgeAPI`**: `run(data)`, `submit(data)` - All go through authenticated Flask backend

## Backend Structure

### Entry Point (`backend/app.py`)
- Flask app with CORS enabled
- Blueprint registration from `routes`
- Global error handler returns JSON for all exceptions (no HTML error pages leak to API clients)

### Routes (`backend/routes.py`) - Key Endpoints

#### Contest Management
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/contests` | No | List all contests |
| POST | `/contests` | No | Create contest |
| GET | `/contests/<id>` | No | Get contest details |
| PUT/DELETE | `/contests/<id>` | No | Update/delete contest |

#### Registration & Participation
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET/POST/DELETE | `/contests/<id>/registration` | **Required** | Get status, register (upcoming only), cancel (upcoming only) |
| GET | `/contests/<id>/access?problem_id=X` | **Required** | Verify active contest access + participant + problem linkage |
| GET | `/contests/<id>/participants` | **Required** | Get leaderboard (open to registered for active/upcoming, authenticated for past) |
| POST | `/contests/<id>/participants` | **Required** | Join contest (upcoming only) |
| DELETE | `/contests/<id>/participants/<user_id>` | **Required** | Leave contest (upcoming only, self only) |

#### Contest Problems
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/contests/<id>/problems` | Conditional | Returns problems based on contest state. Past: public summaries (title/difficulty). Active: requires auth + registration, includes `solved` status. Upcoming: hidden (count only, no details). |
| POST/DELETE | `/contests/<id>/problems/*` | No | Manage contest problems (admin operations) |

#### Problems & Judge
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/problems` | No | List all problems |
| GET | `/problems/<id>` | Conditional | If `contest_id` provided, requires auth + active contest access + registration + problem linkage |
| POST | `/run` | **Required** | Run code against test cases (no scoring, no submission persistence in contest context affects scores) |
| POST | `/submit` | **Required** | Submit code, judge, save submission, award points on first Accepted in contest |

#### Users
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/users/sync` | No | Create/find user by email |
| GET | `/users/by-email/<email>` | No | Get user by email |

### Auth & Authorization Helpers

**`authenticated_user()`** (`backend/routes.py:33-71`):
1. Extracts Bearer token from `Authorization` header
2. Validates token via `supabase.auth.get_user(token)`
3. Requires service role key (`SUPABASE_SERVICE_ROLE_KEY`) - returns 500 if missing
4. Looks up user in `users` table by email
5. **Auto-creates** linked `users` row if not found (uses OAuth metadata for name). This allows OAuth users to participate without pre-existing application user records.
6. Returns `(user_row, None)` or `(None, error_response)`

**`contest_record(contest_id)`** - Fetches contest timing
**`contest_window(contest)`** - Determines if contest is `is_open` (start <= now < end) or `is_upcoming` (now < start). Malformed/tz-naive times return `(False, False)`.
**`participant_record(contest_id, user_id)`** - Checks registration
**`check_contest_access(contest_id, user_id, problem_id)`** - Validates contest open, user registered, problem linked (if specified)

### Judging (`backend/runner/`)
- **`execute.py`** - Runs user code against test cases, returns verdicts like `"Accepted"`, `"Wrong Answer"`, etc.
- Test cases loaded from `testcases` table by `problem_id`

### Scoring Logic
**On `/submit` (contest submissions):**
1. Requires authentication
2. If `contest_id` provided: validates contest access, checks if already solved
3. Runs all test cases
4. Saves submission to `submissions` table with `user_id` and `contest_id`
5. If **Accepted** and first solve (`already_solved == False`):
   - Gets points from `contest_problems.points` for that contest/problem
   - Adds points to `contest_participants.score` (read current score, update)
   - Returns `{"status": "Accepted", "newly_solved": true, "awarded_points": X, "participant_score": Y}`
6. If **Accepted** but already solved: `{"status": "Accepted", "newly_solved": false, "awarded_points": 0}`
7. If not accepted: returns verdict with failed test case details, `awarded_points: 0`
8. **Practice submissions** (`contest_id` null): saved without contest association, no points awarded

**Important:** Points awarded **only once per participant per problem** based on existing `submissions` table. No new tables required. "Run" does not award points or count as scoring.

## Database Schema (Referenced)

| Table | Key Fields | Purpose |
|-------|------------|---------|
| `users` | `id`, `email`, `name` | Application user records (linked to Supabase Auth via email) |
| `problems` | `id`, `title`, `description`, `difficulty`, `input_format`, `output_format`, `constraints`, `sample_input`, `sample_output` | Problem definitions |
| `testcases` | `id`, `problem_id`, `input`, `expected_output` | Test cases for judging |
| `submissions` | `id`, `problem_id`, `user_id`, `contest_id` (nullable), `code`, `language`, `status`, `submitted_at` | Submission history |
| `contests` | `id`, `title`, `description`, `start_time`, `end_time`, `status` | Contest definitions (timing is authoritative) |
| `contest_problems` | `id`, `contest_id`, `problem_id`, `points`, `problem_order` (may exist) | Links problems to contests with points |
| `contest_participants` | `id`, `contest_id`, `user_id`, `score`, `joined_at` | Contest registrations and scores |

**Notes:**
- Timing (`start_time`, `end_time`) is used to determine contest state, not just `status` field
- `contest_participants` has foreign keys to `contests` and `users`
- Registration is stored in `contest_participants`

## Contest Lifecycle

### 1. Upcoming Contests
- Visible in "Upcoming/Active" section of `/contests`
- Users can **Register** or **Cancel Registration** (before start)
- Registration closes when contest starts
- "Enter Contest" button is **disabled** until contest starts
- Direct navigation to `/contests/:id` redirects to `/contests` if not active/registered
- Problems are **hidden** (backend returns count only, no problem details)

### 2. Active Contests
- Move to "Upcoming/Active" section when started
- Only **registered participants** can enter (click "Enter Contest")
- `/contests/:id` shows problem table with **Solved/Unsolved** status
- Problems are clickable and open in `/solve/:problemId?contest_id=:id`
- Solve page verifies access via backend before showing editor
- **Run** tests code but gives no points
- **Submit** judges code; first Accepted awards points from `contest_problems.points`
- Leaderboard shows participants ordered by score (desc), then by id
- Participant count displayed from backend

### 3. Past Contests
- Move to "Past Contests" section after `end_time`
- "View Contest" opens `/contests/:id` in **read-only archive mode**
- **Question names** are displayed in the archive view (not in the contests list)
- Clicking archived questions opens in **practice mode** (`/solve/:problemId`) **without contest_id**
- Practice attempts do **not** award contest points
- Leaderboard is visible to authenticated users
- No solving/submitting allowed in contest context

## Setup & Running

### Prerequisites
- Node.js (for frontend)
- Python 3.11+ (for backend)
- Supabase project (URL, anon key, service role key)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important:** 
- Use **service role key** (not anon key). Anon key may be blocked by RLS for participant/profile writes
- Never commit or expose service role key to frontend
- Restart Flask after changing env vars

Run backend:
```bash
python app.py
# Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env` (optional for local dev):
```env
VITE_API_BASE_URL=http://localhost:5000
```

Run dev server:
```bash
npm run dev
# Runs on http://localhost:5173 (default Vite port)
```

Build for production:
```bash
npm run build
npm run preview
```

### Full App (separate terminals)
1. Terminal 1: `cd backend && python app.py`
2. Terminal 2: `cd frontend && npm run dev`

### Deployment Notes
- **Frontend:** Set `VITE_API_BASE_URL` to public Flask API URL before building
- **Backend:** Must have `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set
- Backend uses service role key for user provisioning and scoring operations

## Key Behaviors & Rules

### Authentication
- Login via Supabase Auth (OAuth supported)
- All contest actions require authentication
- Backend verifies token on every protected request
- If authenticated user has no `users` row, backend auto-creates it using email and OAuth metadata
- Frontend no longer does browser-side `users` table sync

### Registration
- Must be signed in to register
- Register from `/contests` list during upcoming period
- Registration closes at contest start time
- Can cancel registration only before contest starts
- Only registered participants can enter active contests

### Scoring
- Points awarded on **first Accepted submission** per (contest, participant, problem)
- Points come from `contest_problems.points`
- **Run** button does not award points
- Re-submitting already solved problem gives no additional points
- Practice problems (no contest context) give no contest points
- Submissions before scoring feature won't be retroactively credited

### Problem Visibility
- **Upcoming:** Hidden until contest starts (only count shown)
- **Active:** Visible only to registered participants
- **Past:** Visible in archive with names, openable in practice mode

### Error Handling
- Backend returns JSON errors for all API failures (global error handler)
- Frontend detects non-JSON responses and shows helpful config errors
- Missing service role key returns clear 500 error
- Auth failures return 401, permission failures return 403

## Known Caveats & Notes
- Contest state is determined by current time vs `start_time`/`end_time`, not just `status` field
- Leaderboard requires authentication; past contest leaderboards visible to authenticated users
- Direct navigation to contest detail is guarded (redirects if not eligible)
- Practice judge goes through Flask backend (no longer uses untracked Supabase functions)
- The "Run" endpoint requires auth but doesn't save submissions or award points
- Problem lists in active contests refresh after registration/start to show details
- Archived questions opened from past contests don't include `contest_id` - they run in pure practice mode

## File Structure (Key Files)
```
codebench/
├── README.md           # Setup and contest documentation
├── context.md          # This file
├── backend/
│   ├── app.py         # Flask app entry
│   ├── routes.py      # All API routes
│   ├── database.py    # Supabase client setup
│   ├── requirements.txt
│   ├── .env           # Backend env vars (not committed)
│   └── runner/
│       ├── __init__.py
│       └── execute.py # Code judge
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── .env           # Frontend env vars (optional)
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── services/
        │   ├── api.js
        │   └── supabaseClient.js
        ├── hooks/
        │   └── useAuth.js
        ├── pages/
        │   ├── Home.jsx
        │   ├── Contests.jsx
        │   ├── ContestDetail.jsx
        │   ├── Solve.jsx
        │   └── Login.jsx
        └── components/
            ├── Navbar.jsx
            ├── ContestList.jsx
            ├── ProblemList.jsx
            └── EditorPanel.jsx
```

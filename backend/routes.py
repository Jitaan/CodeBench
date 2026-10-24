from flask import Blueprint, jsonify, request
from database import SUPABASE_SERVICE_ROLE_KEY, supabase

from datetime import datetime, timezone

import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))

if project_root not in sys.path:
    sys.path.append(project_root)

from runner.execute import judge_code

routes = Blueprint("routes",__name__)

def get_testcases(problem_id):
    response = (supabase.table("testcases").select("*").eq("problem_id", problem_id).execute())
    return response.data

def save_submissions(problem_id, code, language, status, user_id=None, contest_id=None):
    payload = {"problem_id": problem_id, "code": code, "language": language, "status": status}
    if user_id is not None:
        payload["user_id"] = user_id
    if contest_id is not None:
        payload["contest_id"] = contest_id
    response = (supabase.table("submissions").insert(payload).execute())
    return response


def authenticated_user():
    authorization = request.headers.get("Authorization", "")
    token = authorization.removeprefix("Bearer ").strip()
    if not token or token == authorization:
        return None, (jsonify({"error": "Authentication required"}), 401)

    try:
        response = supabase.auth.get_user(token)
        user = response.user
    except Exception:
        user = None

    if not user or not user.email:
        return None, (jsonify({"error": "Invalid authentication token"}), 401)

    if not SUPABASE_SERVICE_ROLE_KEY:
        return None, (jsonify({"error": "Backend is missing SUPABASE_SERVICE_ROLE_KEY; add it to the backend environment and restart Flask."}), 500)

    try:
        internal = supabase.table("users").select("id, email").eq("email", user.email).execute()
        if internal.data:
            return internal.data[0], None

        metadata = getattr(user, "user_metadata", {}) or {}
        name = metadata.get("name") or metadata.get("full_name") or metadata.get("user_name") or user.email.split("@")[0]
        supabase.table("users").insert({"email": user.email, "name": name}).execute()
        internal = supabase.table("users").select("id, email").eq("email", user.email).execute()
        if internal.data:
            return internal.data[0], None
    except Exception as exc:
        try:
            internal = supabase.table("users").select("id, email").eq("email", user.email).execute()
            if internal.data:
                return internal.data[0], None
        except Exception:
            pass
        return None, (jsonify({"error": f"Could not prepare participant profile: {exc}"}), 500)

    return None, (jsonify({"error": "Could not create participant profile"}), 500)


def contest_record(contest_id):
    response = supabase.table("contests").select("id, start_time, end_time").eq("id", contest_id).execute()
    return response.data[0] if response.data else None


def contest_window(contest):
    try:
        start = datetime.fromisoformat(contest["start_time"].replace("Z", "+00:00"))
        end = datetime.fromisoformat(contest["end_time"].replace("Z", "+00:00"))
        if start.tzinfo is None or end.tzinfo is None:
            return False, False
        now = datetime.now(timezone.utc)
        return start <= now < end, start > now
    except (TypeError, ValueError, AttributeError):
        return False, False


def participant_record(contest_id, user_id):
    response = (supabase.table("contest_participants")
                .select("id")
                .eq("contest_id", contest_id)
                .eq("user_id", user_id)
                .execute())
    return response.data[0] if response.data else None


def check_contest_access(contest_id, user_id, problem_id=None):
    contest = contest_record(contest_id)
    if not contest:
        return jsonify({"error": "Contest not found"}), 404

    is_open, _ = contest_window(contest)
    if not is_open:
        return jsonify({"error": "Contest is not currently open"}), 403
    if not participant_record(contest_id, user_id):
        return jsonify({"error": "Contest registration required"}), 403
    if problem_id is not None:
        linked = (supabase.table("contest_problems")
                  .select("id")
                  .eq("contest_id", contest_id)
                  .eq("problem_id", problem_id)
                  .execute())
        if not linked.data:
            return jsonify({"error": "Problem is not part of this contest"}), 403
    return None

# Contest routes

@routes.route("/contests/<int:contest_id>/registration", methods=["GET", "POST", "DELETE"])
def contest_registration(contest_id):
    user, error = authenticated_user()
    if error:
        return error

    contest = contest_record(contest_id)
    if not contest:
        return jsonify({"error": "Contest not found"}), 404
    is_open, is_upcoming = contest_window(contest)
    existing = participant_record(contest_id, user["id"])

    if request.method == "GET":
        return jsonify({"registered": bool(existing)})
    if request.method == "POST":
        if not is_upcoming:
            return jsonify({"error": "Registration is closed"}), 403
        if existing:
            return jsonify({"error": "Already registered"}), 409
        response = (supabase.table("contest_participants").insert({
            "contest_id": contest_id,
            "user_id": user["id"],
            "joined_at": datetime.now(timezone.utc).isoformat()
        }).execute())
        return jsonify(response.data), 201

    if not is_upcoming:
        return jsonify({"error": "Registration cannot be cancelled after the contest starts"}), 403
    if existing:
        supabase.table("contest_participants").delete().eq("id", existing["id"]).execute()
    return jsonify({"registered": False})

@routes.route("/contests/<int:contest_id>/access", methods=["GET"])
def contest_access(contest_id):
    user, error = authenticated_user()
    if error:
        return error
    problem_id = request.args.get("problem_id", type=int)
    denial = check_contest_access(contest_id, user["id"], problem_id)
    if denial:
        return denial
    return jsonify({"allowed": True})

# Contest routes
@routes.route("/contests", methods=["GET"])
def get_contests():
    response = supabase.table("contests").select("id, title, description, start_time, end_time, status").execute()
    return jsonify(response.data)

@routes.route("/contests", methods=["POST"])
def create_contest():
    data = request.json
    response = supabase.table("contests").insert(data).execute()
    return jsonify(response.data)

@routes.route("/contests/<int:id>", methods=["GET"])
def get_contest(id):
    response = supabase.table("contests").select("*").eq("id", id).execute()
    return jsonify(response.data)

@routes.route("/contests/<int:id>", methods=["PUT"])
def update_contest(id):
    data = request.json
    response = supabase.table("contests").update(data).eq("id", id).execute()
    return jsonify(response.data)

@routes.route("/contests/<int:id>", methods=["DELETE"])
def delete_contest(id):
    response = supabase.table("contests").delete().eq("id", id).execute()
    return jsonify(response.data)

# Contest Problems routes
@routes.route("/contests/<int:contest_id>/problems", methods=["GET"])
def get_contest_problems(contest_id):
    contest = contest_record(contest_id)
    if not contest:
        return jsonify({"error": "Contest not found"}), 404

    links = (supabase.table("contest_problems")
             .select("*")
             .eq("contest_id", contest_id)
             .execute()).data
    is_open, is_upcoming = contest_window(contest)
    is_past = not is_open and not is_upcoming

    problems = []
    current_user_id = None
    can_view_problems = is_past
    if is_open:
        user, error = authenticated_user()
        if error:
            return error
        current_user_id = user["id"]
        can_view_problems = bool(participant_record(contest_id, current_user_id))

    if can_view_problems:
        problem_ids = list(dict.fromkeys(link.get("problem_id") for link in links if link.get("problem_id") is not None))
        if problem_ids:
            problem_rows = (supabase.table("problems")
                            .select("id, title, difficulty")
                            .in_("id", problem_ids)
                            .execute()).data
            problem_by_id = {str(problem["id"]): problem for problem in problem_rows}
            solved_ids = set()
            if is_open and current_user_id is not None:
                solve_rows = (supabase.table("submissions")
                              .select("problem_id")
                              .eq("contest_id", contest_id)
                              .eq("user_id", current_user_id)
                              .eq("status", "Accepted")
                              .in_("problem_id", problem_ids)
                              .execute()).data
                solved_ids = {str(solve["problem_id"]) for solve in solve_rows}
            problems = [
                {
                    **link,
                    "problems": problem_by_id.get(str(link.get("problem_id"))),
                    "solved": str(link.get("problem_id")) in solved_ids if is_open else None,
                }
                for link in links
            ]

    return jsonify({"count": len(links), "problems": problems})

@routes.route("/contests/<int:contest_id>/problems", methods=["POST"])
def add_contest_problem(contest_id):
    data = request.json
    data["contest_id"] = contest_id
    response = supabase.table("contest_problems").insert(data).execute()
    return jsonify(response.data)

@routes.route("/contests/<int:contest_id>/problems/<int:problem_id>", methods=["DELETE"])
def remove_contest_problem(contest_id, problem_id):
    response = supabase.table("contest_problems").delete().eq("contest_id", contest_id).eq("problem_id", problem_id).execute()
    return jsonify(response.data)

# Contest Participants routes
@routes.route("/contests/<int:contest_id>/participants", methods=["GET"])
def get_contest_participants(contest_id):
    contest = contest_record(contest_id)
    if not contest:
        return jsonify({"error": "Contest not found"}), 404

    is_open, is_upcoming = contest_window(contest)
    user, error = authenticated_user()
    if error:
        return error
    if is_open and not participant_record(contest_id, user["id"]):
        return jsonify({"error": "Contest registration required"}), 403
    if is_upcoming and not participant_record(contest_id, user["id"]):
        return jsonify({"error": "Contest registration required"}), 403

    response = (supabase.table("contest_participants")
                .select("*, users(id, name, email)", count="exact")
                .eq("contest_id", contest_id)
                .order("score", desc=True)
                .order("id")
                .execute())
    return jsonify({"count": response.count if response.count is not None else len(response.data), "participants": response.data})

@routes.route("/contests/<int:contest_id>/participants", methods=["POST"])
def join_contest(contest_id):
    user, error = authenticated_user()
    if error:
        return error

    contest = contest_record(contest_id)
    if not contest:
        return jsonify({"error": "Contest not found"}), 404
    _, is_upcoming = contest_window(contest)
    if not is_upcoming:
        return jsonify({"error": "Registration is closed"}), 403

    if participant_record(contest_id, user["id"]):
        return jsonify({"error": "Already registered"}), 409

    response = supabase.table("contest_participants").insert({
        "contest_id": contest_id,
        "user_id": user["id"],
        "joined_at": datetime.now(timezone.utc).isoformat()
    }).execute()
    return jsonify(response.data), 201

@routes.route("/contests/<int:contest_id>/participants/<int:user_id>", methods=["DELETE"])
def leave_contest(contest_id, user_id):
    user, error = authenticated_user()
    if error:
        return error
    if user["id"] != user_id:
        return jsonify({"error": "Cannot unregister another participant"}), 403

    contest = contest_record(contest_id)
    if not contest:
        return jsonify({"error": "Contest not found"}), 404
    _, is_upcoming = contest_window(contest)
    if not is_upcoming:
        return jsonify({"error": "Registration cannot be cancelled after the contest starts"}), 403

    response = supabase.table("contest_participants").delete().eq("contest_id", contest_id).eq("user_id", user_id).execute()
    return jsonify(response.data)

# Users routes
@routes.route("/users/sync", methods=["POST"])
def sync_user():
    data = request.json

    email = data.get("email")
    name = data.get("name")

    if not email:
        return jsonify({"error": "email is required"}), 400

    existing = supabase.table("users").select("id, name, email").eq("email", email).execute()
    if existing.data:
        return jsonify(existing.data[0])

    try:
        response = supabase.table("users").insert({"email": email, "name": name or email.split("@")[0]}).execute()
        return jsonify(response.data[0])
    except Exception:
        # a concurrent sync may have created the row already
        existing = supabase.table("users").select("id, name, email").eq("email", email).execute()
        if existing.data:
            return jsonify(existing.data[0])
        return jsonify({"error": "Could not create user"}), 500

@routes.route("/users/by-email/<email>", methods=["GET"])
def get_user_by_email(email):
    response = supabase.table("users").select("id, name, email").eq("email", email).execute()
    if not response.data:
        return jsonify({"error": "User not found"}), 404
    return jsonify(response.data[0])

@routes.route("/problems", methods=["GET"])
def get_problems():
    response = supabase.table("problems").select("id, title, difficulty").execute()
    return jsonify(response.data)

@routes.route("/problems/<int:id>", methods=["GET"])
def get_problem(id):
    contest_id = request.args.get("contest_id", type=int)
    if contest_id is not None:
        user, error = authenticated_user()
        if error:
            return error
        denial = check_contest_access(contest_id, user["id"], id)
        if denial:
            return denial
    response = supabase.table("problems").select("*").eq("id", id).execute()
    return jsonify(response.data)

@routes.route("/submit", methods=["POST"])
def submit_code():
    data = request.json or {}
    problem_id = data.get("problem_id")
    code = data.get("code")
    contest_id = data.get("contest_id")
    user_id = None

    if not problem_id or not code:
        return jsonify({"error": "problem_id and code are required"}), 400

    user, error = authenticated_user()
    if error:
        return error
    user_id = user["id"]

    already_solved = False
    if contest_id is not None:
        denial = check_contest_access(contest_id, user_id, problem_id)
        if denial:
            return denial
        prior = (supabase.table("submissions")
                 .select("id")
                 .eq("contest_id", contest_id)
                 .eq("user_id", user_id)
                 .eq("problem_id", problem_id)
                 .eq("status", "Accepted")
                 .execute())
        already_solved = bool(prior.data)

    testcases = get_testcases(problem_id)

    if not testcases:
        return jsonify({
            "status": "No testcases found"
        })

    final_status = "Accepted"
    failed_input = None
    expected_output = None
    for tc in testcases:
        result = judge_code(
            code,
            tc["input"],
            tc["expected_output"]
        )

        if result != "Accepted":
            final_status = result
            failed_input = tc["input"]
            expected_output = tc["expected_output"]
            break 
    
    save_submissions(problem_id, code, "Python", final_status, user_id=user_id, contest_id=contest_id)

    if final_status != "Accepted":
        return jsonify({
            "status": final_status,
            "input": failed_input,
            "expected": expected_output,
            "awarded_points": 0,
        })

    result = {"status": "Accepted", "awarded_points": 0}
    if contest_id is not None:
        result["newly_solved"] = not already_solved
        if not already_solved:
            link = (supabase.table("contest_problems")
                    .select("points")
                    .eq("contest_id", contest_id)
                    .eq("problem_id", problem_id)
                    .execute()).data
            points = (link[0].get("points") or 0) if link else 0
            participant = (supabase.table("contest_participants")
                           .select("score")
                           .eq("contest_id", contest_id)
                           .eq("user_id", user_id)
                           .execute()).data
            if not participant:
                return jsonify({"error": "Contest participant not found"}), 403
            score = (participant[0].get("score") or 0) + points
            supabase.table("contest_participants").update({"score": score}).eq("contest_id", contest_id).eq("user_id", user_id).execute()
            result["awarded_points"] = points
            result["participant_score"] = score

    return jsonify(result)

@routes.route("/run", methods=["POST"])
def run_code():
    data = request.json or {}
    code = data.get("code")
    problem_id = data.get("problem_id")
    contest_id = data.get("contest_id")

    if not problem_id or not code:
        return jsonify({"error": "problem_id and code are required"}), 400

    user, error = authenticated_user()
    if error:
        return error

    if contest_id is not None:
        denial = check_contest_access(contest_id, user["id"], problem_id)
        if denial:
            return denial

    testcases = get_testcases(problem_id)

    if not testcases:
        return jsonify({
            "status": "No testcases found"
        })

    final_status = "Accepted"
    failed_input = None
    expected_output = None
    for tc in testcases:
        result = judge_code(
            code,
            tc["input"],
            tc["expected_output"]
        )

        if result != "Accepted":
            final_status = result
            failed_input = tc["input"]
            expected_output = tc["expected_output"]
            break 
    
    if final_status != "Accepted":
        return jsonify({
            "status": final_status,
            "input": failed_input,
            "expected": expected_output
        })

    return jsonify({
        "status": "Accepted"
    })
from flask import Blueprint, jsonify, request
from backend.database import supabase

import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))

if project_root not in sys.path:
    sys.path.append(project_root)

from backend.runner.execute import judge_code

routes = Blueprint("routes",__name__)

def get_testcases(problem_id):
    response = (supabase.table("testcases").select("*").eq("problem_id", problem_id).execute())
    return response.data

def save_submissions(problem_id, code, language, status):
    response = (supabase.table("submissions").insert({"problem_id": problem_id, "code": code, "language": language, "status": status}).execute())
    return response

@routes.route("/problems", methods=["GET"])
def get_problems():
    response = (supabase.table("problems").select("id", "title", "difficulty").execute())
    return jsonify(response.data)

@routes.route("/problems/<int:id>", methods = ["GET"])
def get_problem(id):
    response = (supabase.table("problems").select("*").eq("id",id).execute())
    return jsonify(response.data)

@routes.route("/submit", methods= ["POST"])
def submit_code():
    data = request.json

    code = data["code"]
    problem_id = data["problem_id"]

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
    
    save_submissions(problem_id, code, "Python", final_status)

    if final_status != "Accepted":
        return jsonify({
            "status": final_status,
            "input": failed_input,
            "expected": expected_output
        })

    return jsonify({
        "status": "Accepted"
    })

@routes.route("/run", methods= ["POST"])
def run_code():
    data = request.json

    code = data["code"]
    problem_id = data["problem_id"]

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
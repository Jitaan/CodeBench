from flask import Blueprint, jsonify, request
from database import supabase
from routes import routes

routes = Blueprint("routes",__name__)

@routes.route("/problems", methods=["GET"])
def get_problems():
    response = (supabase.table("problems").select("id", "title", "difficulty").execute())
    return jsonify(response.data)

@routes.route("/problems/<int:id>", methods = ["GET"])
def get_problem(id):
    response = (supabase.table("problems").select("*").eq("id",id).execute())
    return jsonify(response.data)

@routes.route("/submissions", methods= ["POST"])
def submit_code():
    data = request.join

    code = data["code"]
    problem_id = data["problem_id"]

    testcases = get_testcases(problem_id)

    return jsonify({
        "message" : "Submission Recieved",
        "data" : response.data
    })


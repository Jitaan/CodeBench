from flask import Blueprint, jsonify, request
from database import supabase
from routes import routes

routes = Blueprint("routes",__name__)

def get_testcases(problem_id):
    response = (supabase.table("testcases").select("*").eq("problem_id", problem_id).execute())
    return response.data

@routes.route("/problems", methods=["GET"])
def get_problems():
    response = (supabase.table("problems").select("id", "title", "difficulty").execute())
    return jsonify(response.data)

@routes.route("/problems/<int:id>", methods = ["GET"])
def get_problem(id):
    response = (supabase.table("problems").select("*").eq("id",id).execute())
    return jsonify(response.data)

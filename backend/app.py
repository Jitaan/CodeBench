from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from routes import routes

app = Flask(__name__)
CORS(app)

app.register_blueprint(routes)


@app.errorhandler(Exception)
def handle_api_error(error):
    if isinstance(error, HTTPException):
        return jsonify({"error": error.description}), error.code
    app.logger.exception("Unhandled API error", exc_info=error)
    return jsonify({"error": "An unexpected backend error occurred."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
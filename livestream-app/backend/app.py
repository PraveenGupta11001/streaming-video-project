from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# ---- MongoDB Atlas Setup ----
connection_string = os.getenv("MONGODB_CONNECTION_STRING")
client = MongoClient(connection_string, server_api=ServerApi("1"))

try:
    client.admin.command("ping")
    print("✅ Connected to MongoDB Atlas")
except Exception as e:
    print("❌ MongoDB connection failed:", e)

db = client["livesitterDB"]
overlays = db["overlays"]

# ---- HLS Streaming ----
HLS_DIR = os.path.join(os.path.dirname(__file__), "../../mystream")

@app.route("/hls/<path:filename>")
def hls_files(filename):
    return send_from_directory(HLS_DIR, filename)

# ---- API ----
@app.route("/api/overlays", methods=["GET"])
def get_overlays():
    data = []
    for o in overlays.find():
        o["_id"] = str(o["_id"])
        data.append(o)
    return jsonify(data)

@app.route("/api/overlays/<overlay_id>", methods=["GET"])
def get_overlay(overlay_id):
    try:
        oid = ObjectId(overlay_id)
        overlay = overlays.find_one({"_id": oid})
        if overlay:
            overlay["_id"] = str(overlay["_id"])
            return jsonify(overlay)
        return jsonify({"message": "Overlay not found"}), 404
    except Exception as e:
        return jsonify({"message": "Invalid overlay ID", "error": str(e)}), 400

@app.route("/api/overlays", methods=["POST"])
def add_overlay():
    data = request.json
    data.setdefault("visible", False)
    data.setdefault("scale", 100)
    result = overlays.insert_one(data)
    return jsonify({"message": "Overlay added!", "id": str(result.inserted_id)}), 201

@app.route("/api/overlays/<overlay_id>/toggle", methods=["PATCH"])
def toggle_overlay(overlay_id):
    try:
        oid = ObjectId(overlay_id)
        overlay = overlays.find_one({"_id": oid})
        if not overlay:
            return jsonify({"message": "Overlay not found"}), 404
        new_visibility = not overlay.get("visible", False)
        overlays.update_one({"_id": oid}, {"$set": {"visible": new_visibility}})
        return jsonify({"message": "Visibility updated!", "visible": new_visibility}), 200
    except Exception as e:
        return jsonify({"message": "Invalid overlay ID", "error": str(e)}), 400

@app.route("/api/overlays/<overlay_id>", methods=["PUT"])
def update_overlay(overlay_id):
    """Update an existing overlay by ID"""
    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400

    clean_data = {k: v for k, v in data.items() if v is not None and v != ""}

    try:
        oid = ObjectId(overlay_id)
        result = overlays.update_one({"_id": oid}, {"$set": clean_data})
        if result.matched_count == 0:
            return jsonify({"message": "Overlay not found"}), 404
        return jsonify({"message": "Overlay updated!"}), 200
    except Exception as e:
        return jsonify({"message": "Invalid overlay ID", "error": str(e)}), 400


@app.route("/api/overlays/<overlay_id>/update", methods=["PATCH"])
def patch_overlay(overlay_id):
    data = request.json
    try:
        oid = ObjectId(overlay_id)
        if overlays.find_one({"_id": oid}):
            overlays.update_one({"_id": oid}, {"$set": data})
            return jsonify({"message": "Overlay partially updated!"}), 200
        return jsonify({"message": "Overlay not found!"}), 404
    except Exception as e:
        return jsonify({"message": "Invalid overlay ID", "error": str(e)}), 400

@app.route("/api/overlays/<overlay_id>", methods=["DELETE"])
def delete_overlay(overlay_id):
    try:
        oid = ObjectId(overlay_id)
    except:
        return jsonify({"message": "Invalid overlay ID"}), 400
    result = overlays.delete_one({"_id": oid})
    if result.deleted_count == 1:
        return jsonify({"message": "Overlay deleted!"}), 200
    return jsonify({"message": "Overlay not found!"}), 404

@app.route("/api/overlays", methods=["DELETE"])
def delete_all_overlays():
    result = overlays.delete_many({})
    return jsonify({"message": f"Deleted {result.deleted_count} overlays"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

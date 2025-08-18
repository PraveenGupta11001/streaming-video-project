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
CORS(app)  # Enable CORS for frontend requests

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
    """Serve HLS .m3u8 and .ts files"""
    return send_from_directory(HLS_DIR, filename)

# ---- API Routes ----
@app.route("/api/overlays", methods=["GET"])
def get_overlays():
    """Return all overlays from MongoDB"""
    data = []
    for o in overlays.find():
        o["_id"] = str(o["_id"])  # Convert ObjectId to string for frontend
        data.append(o)
    return jsonify(data)

@app.route("/api/overlays/<overlay_id>", methods=["GET"])
def get_overlay(overlay_id):
    """Return a specific overlay by ID"""
    try:
        oid = ObjectId(overlay_id)  # convert string to ObjectId
        overlay = overlays.find_one({"_id": oid})
        if overlay:
            overlay["_id"] = str(overlay["_id"])
            return jsonify(overlay)
        else:
            return jsonify({"message": "Overlay not found"}), 404
    except Exception as e:
        return jsonify({"message": "Invalid overlay ID", "error": str(e)}), 400

@app.route("/api/overlays", methods=["POST"])
def add_overlay():
    """Add a new overlay"""
    data = request.json
    result = overlays.insert_one(data)
    return jsonify({"message": "Overlay added!", "id": str(result.inserted_id)}), 201



@app.route("/api/overlays/<overlay_id>", methods=["PUT"])
def update_overlay(overlay_id):
    """Update an existing overlay by ID"""
    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400

    try:
        oid = ObjectId(overlay_id)
        result = overlays.update_one({"_id": oid}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"message": "Overlay not found"}), 404
        return jsonify({"message": "Overlay updated!"}), 200
    except Exception as e:
        return jsonify({"message": "Invalid overlay ID", "error": str(e)}), 400
    
@app.route("/api/overlays/<overlay_id>/update", methods=["PATCH"])
def patch_overlay(overlay_id):
    """Partially update an existing overlay by ID"""
    data = request.json
    try:
        oid = ObjectId(overlay_id)
        overlay = overlays.find_one({"_id": oid})
        if overlay:
            overlays.update_one({"_id": oid}, {"$set": data})
            return jsonify({"message": "Overlay partially updated!"}), 200
        else:
            return jsonify({"message": "Overlay not found!"}), 404
    except Exception as e:
        return jsonify({"message": "Invalid overlay ID", "error": str(e)}), 400

@app.route("/api/overlays/<overlay_id>", methods=["DELETE"])
def delete_overlay(overlay_id):
    """Delete an overlay by ID"""
    try:
        oid = ObjectId(overlay_id)  # convert string to ObjectId
    except:
        return jsonify({"message": "Invalid overlay ID"}), 400

    result = overlays.delete_one({"_id": oid})
    if result.deleted_count == 1:
        return jsonify({"message": "Overlay deleted!"}), 200
    else:
        return jsonify({"message": "Overlay not found!"}), 404

@app.route("/api/overlays", methods=["DELETE"])
def delete_all_overlays():
    """Delete ALL overlays"""
    result = overlays.delete_many({})
    return jsonify({"message": f"Deleted {result.deleted_count} overlays"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

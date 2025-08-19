from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
from dotenv import load_dotenv
import os

# ============================================================
# Load environment variables (MongoDB connection string, etc.)
# ============================================================
load_dotenv()

# Initialize Flask app with CORS enabled
app = Flask(__name__)
CORS(app)

# ============================================================
# MongoDB Atlas Setup
# ============================================================
connection_string = os.getenv("MONGODB_CONNECTION_STRING")
client = MongoClient(connection_string, server_api=ServerApi("1"))

try:
    client.admin.command("ping")
    print("✅ Connected to MongoDB Atlas")
except Exception as e:
    print("❌ MongoDB connection failed:", e)

# Database and Collection
db = client["livesitterDB"]
overlays = db["overlays"]

# ============================================================
# HLS Streaming Setup
# This serves video chunks (.ts) and playlist (.m3u8)
# ============================================================
HLS_DIR = os.path.join(os.path.dirname(__file__), "../../mystream")

@app.route("/hls/<path:filename>")
def hls_files(filename):
    """Serve HLS video files (.m3u8 / .ts) from the mystream directory"""
    return send_from_directory(HLS_DIR, filename)


# ============================================================
# Overlay API Endpoints
# ============================================================

@app.route("/api/overlays", methods=["GET"])
def get_overlays():
    """Fetch all overlays"""
    data = []
    for o in overlays.find():
        o["_id"] = str(o["_id"])   # Convert ObjectId to string
        data.append(o)
    return jsonify(data)


@app.route("/api/overlays/<overlay_id>", methods=["GET"])
def get_overlay(overlay_id):
    """Fetch a single overlay by ID"""
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
    """Add a new overlay (text or image)"""
    data = request.json
    data.setdefault("visible", False)   # Default visibility = hidden
    data.setdefault("scale", 100)       # Default scale = 100%
    result = overlays.insert_one(data)
    return jsonify({"message": "Overlay added!", "id": str(result.inserted_id)}), 201


@app.route("/api/overlays/<overlay_id>/toggle", methods=["PATCH"])
def toggle_overlay(overlay_id):
    """Toggle visibility (true/false) of an overlay"""
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
    """Update an entire overlay (replace fields)"""
    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400

    # Remove empty/None fields
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
    """Partially update an overlay (only given fields)"""
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
    """Delete a single overlay by ID"""
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
    """Delete all overlays (dangerous!)"""
    result = overlays.delete_many({})
    return jsonify({"message": f"Deleted {result.deleted_count} overlays"}), 200


# ============================================================
# Run Server
# ============================================================
if __name__ == "__main__":
    # Run Flask app on port 5000
    app.run(host="0.0.0.0", port=5000, debug=True)

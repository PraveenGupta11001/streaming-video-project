from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
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
# HLS output directory: project_root/mystream/
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
        o["_id"] = str(o["_id"])  # Convert ObjectId to string
        data.append(o)
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

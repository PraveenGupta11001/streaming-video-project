import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import axios from "axios";
import "./App.css";

function App() {
  const videoRef = useRef(null);
  const [overlays, setOverlays] = useState([]);

  // Fetch overlays from backend
  const fetchOverlays = () => {
    axios
      .get("http://localhost:5000/api/overlays")
      .then((res) => setOverlays(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchOverlays();

    // Setup HLS
    const video = videoRef.current;
    const hls = new Hls();
    const src = "http://localhost:5000/hls/index.m3u8";

    if (Hls.isSupported()) {
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          console.log("Click play manually (autoplay blocked).");
        });
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-900 text-white gap-8 p-6">
      {/* Video player section */}
      <div className="w-full max-w-3xl">
        <VideoPlayer videoRef={videoRef} overlays={overlays} />
      </div>

      {/* Overlay form section */}
      <div className="w-full max-w-md">
        <AddInputForm onOverlayAdded={fetchOverlays} onClearOverlays={fetchOverlays} />
      </div>
    </div>
  );
}

export default App;

function VideoPlayer({ videoRef, overlays }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">🎥 Live Stream</h1>

      <div className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-lg">
        <video ref={videoRef} controls className="w-full bg-black"></video>

        {/* Overlay Texts */}
        {overlays.map((o) => (
          <span
            key={o._id}
            style={{
              position: "absolute",
              left: `${o.x}px`,
              top: `${o.y}px`,
              color: o.color || "white",
              fontSize: `${o.fontSize || 20}px`,
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
            }}
          >
            {o.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function AddInputForm({ onOverlayAdded, onClearOverlays }) {
  const [form, setForm] = useState({
    text: "",
    x: 50,
    y: 50,
    fontSize: 20,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/overlays", form);
    setForm({ text: "", x: 50, y: 50, fontSize: 20 });
    onOverlayAdded();
  };

  const handleClear = async () => {
    await axios.delete("http://localhost:5000/api/overlays");
    onClearOverlays();
  };

  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-md w-full max-w-lg">
      <h2 className="text-2xl font-semibold mb-6 text-white">Add Overlay</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Overlay Text */}
        <div>
          <label className="block text-gray-300 mb-1">Overlay Text</label>
          <input
            name="text"
            type="text"
            value={form.text}
            onChange={handleChange}
            placeholder="Enter overlay text"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Coordinate X */}
        <div>
          <label className="block text-gray-300 mb-1">Coordinate X</label>
          <input
            name="x"
            type="number"
            value={form.x}
            onChange={handleChange}
            placeholder="Enter X value"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Coordinate Y */}
        <div>
          <label className="block text-gray-300 mb-1">Coordinate Y</label>
          <input
            name="y"
            type="number"
            value={form.y}
            onChange={handleChange}
            placeholder="Enter Y value"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-gray-300 mb-1">Font Size</label>
          <input
            name="fontSize"
            type="number"
            value={form.fontSize}
            onChange={handleChange}
            placeholder="Enter font size"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Submit + Clear Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-medium"
          >
            Add Overlay
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded font-medium"
          >
            Clear All
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import axios from "axios";
import "./App.css";

function App() {
  const videoRef = useRef(null);
  const [overlays, setOverlays] = useState([]);

  useEffect(() => {
    // Fetch overlays
    axios
      .get("http://localhost:5000/api/overlays")
      .then((res) => setOverlays(res.data))
      .catch((err) => console.error(err));

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🎥 Live Stream</h1>

      {/* Video + Overlays */}
      <div className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          controls
          className="w-full bg-black"
        ></video>

        {/* Overlay Texts */}
        {overlays.map((o) => (
          <span
            key={o._id}
            style={{
              position: "absolute",
              left: o.x,
              top: o.y,
              color: o.color,
              fontSize: o.fontSize,
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

export default App;

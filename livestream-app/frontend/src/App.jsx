import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import axios from "axios";
import "./App.css";
import OverlayForm from "./components/OverlayForm";
import OverlayTable from "./components/OverlayTable";

function App() {
  // Reference to the video element
  const videoRef = useRef(null);

  // State: list of overlays from backend
  const [overlays, setOverlays] = useState([]);

  // State: overlay currently being edited (for form)
  const [editOverlay, setEditOverlay] = useState(null);

  /**
   * Fetch all overlays from backend API
   */
  const fetchOverlays = () => {
    axios
      .get("http://localhost:5000/api/overlays")
      .then((res) => setOverlays(res.data))
      .catch((err) => console.error(err));
  };

  /**
   * Initialize overlays + video playback (HLS.js)
   */
  useEffect(() => {
    fetchOverlays(); // load overlays initially

    const video = videoRef.current;
    const hls = new Hls();
    const src = "http://localhost:5000/hls/index.m3u8";

    // Use HLS.js if supported
    if (Hls.isSupported()) {
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Try autoplay (might fail if browser blocks autoplay)
        video.play().catch(() => {
          console.log("Click play manually (autoplay blocked).");
        });
      });
    } 
    // Fallback: Safari (native HLS support)
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col gap-6">
      {/* Layout grid: left = video + overlays + table, right = form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Video Section */}
        <div className="w-full relative">
          <h1 className="text-2xl font-bold mb-3">Live Stream</h1>
          
          {/* Video Player */}
          <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
            <video ref={videoRef} controls className="w-full bg-black"></video>

            {/* Render overlays on top of video */}
            {overlays
              .filter((o) => o.visible) // only show visible overlays
              .map((o, idx) => (
                <React.Fragment key={`${o._id}_video_${idx}`}>
                  {/* Text overlay */}
                  {o.type === "text" ? (
                    <span
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
                  ) : (
                    // Image overlay
                    o.image &&
                    o.image.length > 10 && (
                      <img
                        src={`data:image/png;base64,${o.image.replace(
                          /^data:image\/\w+;base64,/,
                          ""
                        )}`}
                        alt="overlay"
                        style={{
                          position: "absolute",
                          left: `${o.x}px`,
                          top: `${o.y}px`,
                          width: `${o.scale || 100}%`, // percentage width scaling
                          pointerEvents: "none", // prevent blocking clicks
                        }}
                      />
                    )
                  )}
                </React.Fragment>
              ))}
          </div>

          {/* Overlay table (below video) */}
          <OverlayTable
            overlays={overlays}
            onUpdated={fetchOverlays}
            setEditOverlay={setEditOverlay}
          />
        </div>

        {/* Overlay form (side by side with video) */}
        <OverlayForm
          onOverlayAdded={fetchOverlays}
          editOverlay={editOverlay}
          clearEdit={() => setEditOverlay(null)}
        />
      </div>
    </div>
  );
}

export default App;

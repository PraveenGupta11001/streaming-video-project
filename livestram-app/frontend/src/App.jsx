import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import axios from "axios";
import "./App.css";
import OverlayForm from "./components/OverlayForm";
import OverlayTable from "./components/OverlayTable";

function App() {
  const videoRef = useRef(null);
  const [overlays, setOverlays] = useState([]);
  const [editOverlay, setEditOverlay] = useState(null);

  const fetchOverlays = () => {
    axios
      .get("http://localhost:5000/api/overlays")
      .then((res) => setOverlays(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchOverlays();

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
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col gap-6">
      {/* Grid: Video + Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video */}
        <div className="w-full relative">
          <h1 className="text-2xl font-bold mb-3">🎥 Live Stream</h1>
          <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
            <video ref={videoRef} controls className="w-full bg-black"></video>

            {/* Render overlays */}
            {overlays
              .filter((o) => o.visible)
              .map((o, idx) => (
                <React.Fragment key={`${o._id}_video_${idx}`}>
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
                          width: `${o.scale || 100}%`,
                          pointerEvents: "none",
                        }}
                      />
                    )
                  )}
                </React.Fragment>
              ))}
          </div>

          {/* Table below video */}
          <OverlayTable
            overlays={overlays}
            onUpdated={fetchOverlays}
            setEditOverlay={setEditOverlay}
          />
        </div>

        {/* Form side-by-side */}
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

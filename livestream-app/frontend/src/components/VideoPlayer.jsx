export default function VideoPlayer({ videoRef, overlays }) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6">🎥 Live Stream</h1>
  
        <div className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-lg">
          <video ref={videoRef} controls className="w-full bg-black"></video>
  
          {overlays
  .filter((o) => o.visible)
  .map((o) =>
    o.type === "text" ? (
      <span
        key={o._id}
        style={{
          position: "absolute",
          left: `${o.x}px`,
          top: `${o.y}px`,
          color: o.color || "white",
          fontSize: `${o.fontSize || 20}px`,
          fontWeight: "bold",
        }}
      >
        {o.text}
      </span>
    ) : (
      <img
        key={o._id}
        src={o.image}
        alt="overlay"
        style={{
          position: "absolute",
          left: `${o.x}px`,
          top: `${o.y}px`,
          transform: `scale(${(o.scale || 100) / 100})`,
        }}
      />
    )
  )}

        </div>
      </div>
    );
  }
  
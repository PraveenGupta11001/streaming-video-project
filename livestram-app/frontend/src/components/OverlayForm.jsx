import React, { useEffect, useState } from "react";
import axios from "axios";

export default function OverlayForm({ onOverlayAdded, editOverlay, clearEdit }) {
  const [form, setForm] = useState({
    type: "text",
    text: "",
    x: 50,
    y: 50,
    fontSize: 20,
    color: "white",
    scale: 100,
    image: "",
  });

  useEffect(() => {
    if (editOverlay) {
      setForm({
        type: editOverlay.type || "text",
        text: editOverlay.text || "",
        x: editOverlay.x ?? 50,
        y: editOverlay.y ?? 50,
        fontSize: editOverlay.fontSize ?? 20,
        color: editOverlay.color || "white",
        scale: editOverlay.scale ?? 100,
        image: editOverlay.image || "",
      });
    }
  }, [editOverlay]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      // Strip prefix before saving
      const base64 = reader.result.replace(/^data:image\/\w+;base64,/, "");
      setForm({ ...form, image: base64, type: "image" });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editOverlay) {
      await axios.put(
        `http://localhost:5000/api/overlays/${editOverlay._id}`,
        form
      );
      clearEdit();
    } else {
      await axios.post("http://localhost:5000/api/overlays", form);
    }
    setForm({
      type: "text",
      text: "",
      x: 50,
      y: 50,
      fontSize: 20,
      color: "white",
      scale: 100,
      image: "",
    });
    onOverlayAdded();
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-white">
        {editOverlay ? "Update Overlay" : "Add Overlay"}
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Type */}
        <div>
          <label className="block text-gray-300 mb-1">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
          </select>
        </div>

        {/* Text Inputs */}
        {form.type === "text" && (
          <>
            <div>
              <label className="block text-gray-300 mb-1">Overlay Text</label>
              <input
                name="text"
                type="text"
                value={form.text}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Font Size</label>
              <input
                name="fontSize"
                type="number"
                value={form.fontSize}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Color</label>
              <input
                name="color"
                type="text"
                value={form.color}
                onChange={handleChange}
                placeholder="white"
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
          </>
        )}

        {/* Image Input */}
        {form.type === "image" && (
          <div>
            <label className="block text-gray-300 mb-1">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            {form.image && (
              <img
                src={`data:image/png;base64,${form.image}`}
                alt="preview"
                className="mt-2 max-h-32"
              />
            )}
            <div>
              <label className="block text-gray-300 mb-1">Scale (%)</label>
              <input
                name="scale"
                type="number"
                value={form.scale}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
          </div>
        )}

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">X</label>
            <input
              name="x"
              type="number"
              value={form.x}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Y</label>
            <input
              name="y"
              type="number"
              value={form.y}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
          >
            {editOverlay ? "Update" : "Add Overlay"}
          </button>
          {editOverlay && (
            <button
              type="button"
              onClick={clearEdit}
              className="w-full bg-gray-600 hover:bg-gray-700 p-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

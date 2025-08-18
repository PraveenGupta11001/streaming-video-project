import React from "react";
import axios from "axios";
import { Eye, EyeOff, Trash2, Edit } from "lucide-react";

export default function OverlayTable({ overlays, onUpdated, setEditOverlay }) {
  const toggleVisibility = async (id) => {
    await axios.patch(`http://localhost:5000/api/overlays/${id}/toggle`);
    onUpdated();
  };

  const deleteOverlay = async (id) => {
    await axios.delete(`http://localhost:5000/api/overlays/${id}`);
    onUpdated();
  };

  return (
    <div className="mt-6 w-full bg-gray-800 p-4 rounded-lg shadow-md max-h-64 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3">Overlay List</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-400 border-b border-gray-600">
            <th className="p-2">Type</th>
            <th className="p-2">Content</th>
            <th className="p-2">Label</th>
            <th className="p-2">Coords</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {overlays.map((o, idx) => (
            <tr key={`${o._id}_table_${idx}`} className="border-b border-gray-700">
              <td className="p-2">{o.type}</td>
              <td className="p-2">{o.type === "text" ? o.text : "[Image]"}</td>
              <td className="p-2">{o.type === "image" ? o.label || "—" : "—"}</td>
              <td className="p-2">
                ({o.x}, {o.y})
              </td>
              <td className="p-2 flex gap-2">
                <button onClick={() => toggleVisibility(o._id)}>
                  {o.visible ? (
                    <Eye className="w-5 h-5 text-green-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button onClick={() => setEditOverlay(o)}>
                  <Edit className="w-5 h-5 text-blue-400" />
                </button>
                <button onClick={() => deleteOverlay(o._id)}>
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

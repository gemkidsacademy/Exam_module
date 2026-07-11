// CenterManagement.jsx

import { useState } from "react";

import AddCenter from "./AddCenter";
import AddCenterAdmin from "./AddCenterAdmin";
import AddCenterTeacher from "./AddCenterTeacher";

export default function CenterManagement() {
  const [selectedAction, setSelectedAction] = useState("add-center");

  return (
    <div className="p-6">

      {/* Top Buttons */}
      <div className="flex gap-4 mb-6">

        <button
          onClick={() => setSelectedAction("add-center")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Manage Center
        </button>

        <button
          onClick={() => setSelectedAction("add-center-admin")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Manage Center Admin
        </button>

        <button
          onClick={() => setSelectedAction("add-center-teacher")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Manage Center Teacher
        </button>

      </div>

      {/* Render Components */}
      {selectedAction === "add-center" && (
        <AddCenter />
      )}

      {selectedAction === "add-center-admin" && (
        <AddCenterAdmin />
      )}

      {selectedAction === "add-center-teacher" && (
        <AddCenterTeacher />
      )}

    </div>
  );
}
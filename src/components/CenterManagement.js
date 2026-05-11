// CenterManagement.jsx

import { useState } from "react";

import AddCenter from "./AddCenter";
import AddCenterAdmin from "./AddCenterAdmin";

export default function CenterManagement() {

  const [selectedAction, setSelectedAction] = useState("");

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

        

      </div>

      {/* Render Components */}
      {selectedAction === "add-center" && (
        <AddCenter />
      )}

      {selectedAction === "add-center-admin" && (
        <AddCenterAdmin />
      )}

    </div>
  );
}
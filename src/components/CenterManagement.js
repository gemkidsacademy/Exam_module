// CenterManagement.jsx

import { useState } from "react";

import AddCenter from "./AddCenter";
import EditCenter from "./EditCenter";
import DeleteCenter from "./DeleteCenter";
import ViewCenter from "./ViewCenter";

import AddCenterAdmin from "./AddCenterAdmin";
import EditCenterAdmin from "./EditCenterAdmin";
import DeleteCenterAdmin from "./DeleteCenterAdmin";
import ViewCenterAdmin from "./ViewCenterAdmin";

import AddCenterTeacher from "./AddCenterTeacher";
import EditCenterTeacher from "./EditCenterTeacher";
import DeleteCenterTeacher from "./DeleteCenterTeacher";
import ViewCenterTeacher from "./ViewCenterTeacher";

export default function CenterManagement() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedOperation(null);
  };

  return (
    <div className="p-6">

      {/* Main Management Buttons */}
      <div className="flex gap-4 mb-6">

        <button
          onClick={() => handleModuleSelect("center")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Manage Center
        </button>

        <button
          onClick={() => handleModuleSelect("admin")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Manage Center Admin
        </button>

        <button
          onClick={() => handleModuleSelect("teacher")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Manage Center Teacher
        </button>

      </div>

      {/* Show CRUD buttons only after selecting a module */}
      {selectedModule && (
        <div className="flex gap-4 mb-6">

          <button
            onClick={() => setSelectedOperation("add")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Add
          </button>
           <button
            onClick={() => setSelectedOperation("view")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            View
          </button>

          <button
            onClick={() => setSelectedOperation("edit")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg"
          >
            Edit
          </button>

          <button
            onClick={() => setSelectedOperation("delete")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
          >
            Delete
          </button>

        </div>
      )}

      {/* Center */}
      {selectedModule === "center" && selectedOperation === "add" && (
        <AddCenter />
      )}
      {selectedModule === "center" && selectedOperation === "view" && (
        <ViewCenter />
      )}

      {selectedModule === "center" && selectedOperation === "edit" && (
        <EditCenter />
      )}

      {selectedModule === "center" && selectedOperation === "delete" && (
        <DeleteCenter />
      )}

      {/* Center Admin */}
      {selectedModule === "admin" && selectedOperation === "add" && (
        <AddCenterAdmin />
      )}
      {selectedModule === "admin" && selectedOperation === "view" && (
        <ViewCenterAdmin />
      )}

      {selectedModule === "admin" && selectedOperation === "edit" && (
        <EditCenterAdmin />
      )}

      {selectedModule === "admin" && selectedOperation === "delete" && (
        <DeleteCenterAdmin />
      )}

      {/* Center Teacher */}
      {selectedModule === "teacher" && selectedOperation === "add" && (
        <AddCenterTeacher />
      )}
      {selectedModule === "teacher" && selectedOperation === "view" && (
        <ViewCenterTeacher />
      )}

      {selectedModule === "teacher" && selectedOperation === "edit" && (
        <EditCenterTeacher />
      )}

      {selectedModule === "teacher" && selectedOperation === "delete" && (
        <DeleteCenterTeacher />
      )}

    </div>
  );
}
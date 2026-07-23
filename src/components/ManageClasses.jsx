import React, { useState } from "react";

import AddClassForm from "./AddClassForm";
import ViewClasses from "./ViewClasses";
import EditClassForm from "./EditClassForm";
import DeleteClass from "./DeleteClass";

const ManageClasses = ({ centerCode }) => {
  const [mode, setMode] = useState("menu");

  return (
    <div className="tab-panel">

      {mode === "menu" && (
        <div className="user-actions-grid">

          <div
            className="action-card"
            onClick={() => setMode("add")}
          >
            <h3>Add Class</h3>
            <p>Create a new class</p>
          </div>

          <div
            className="action-card"
            onClick={() => setMode("view")}
          >
            <h3>View Classes</h3>
            <p>Browse existing classes</p>
          </div>

          <div
            className="action-card"
            onClick={() => setMode("edit")}
          >
            <h3>Edit Class</h3>
            <p>Modify class information</p>
          </div>

          <div
            className="action-card danger"
            onClick={() => setMode("delete")}
          >
            <h3>Delete Class</h3>
            <p>Remove an existing class</p>
          </div>

        </div>
      )}

      {mode === "add" && (
        <AddClassForm
          centerCode={centerCode}
          onClose={() => setMode("menu")}
        />
      )}

      {mode === "view" && (
        <ViewClasses
          centerCode={centerCode}
          onClose={() => setMode("menu")}
        />
      )}

      {mode === "edit" && (
        <EditClassForm
          centerCode={centerCode}
          onClose={() => setMode("menu")}
        />
      )}

      {mode === "delete" && (
        <DeleteClass
          centerCode={centerCode}
          onClose={() => setMode("menu")}
        />
      )}

    </div>
  );
};

export default ManageClasses;
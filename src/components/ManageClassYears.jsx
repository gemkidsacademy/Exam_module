import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageClassYears.css";

const API_BASE = process.env.REACT_APP_API_URL || "";

const ManageClassYears = ({ centerCode }) => {
  
  const [classes, setClasses] = useState([]);
  const [classYears, setClassYears] = useState([]);
  const loadClasses = async () => {
  try {
    const res = await axios.get(
      `${API_BASE}/class-names/classes`
    );

    setClasses(res.data.classes);
  } catch (err) {
    console.error(err);
  }
};
const handleDelete = async (id) => {

    if (!window.confirm("Delete this class year?"))
        return;

      try {

          await axios.delete(
              `${API_BASE}/delete-class-years-exam-module/${id}`
          );

          loadClassYears();

      } catch (err) {
          console.error(err);
      }

  };
  const loadClassYears = async () => {
  try {
    const res = await axios.get(
      `${API_BASE}/class-years-exam-module`,
      {
        params: {
          center_code: centerCode,
        },
      }
    );

    console.log(res.data);

    setClassYears(res.data);
  } catch (err) {
    console.error(err);
  }
};
  const [form, setForm] = useState({
    class_name: "",
    year_name: "",
    
  });
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadClasses();
    loadClassYears();
}, []);
  

  const resetForm = () => {
    setEditingId(null);

    setForm({
      class_name: "",
      year_name: "",
    });
  };

const handleSave = async () => {

  console.log("Center Code:", centerCode);
  console.log("Form:", form);

  const isEditing = editingId !== null;

  try {

    if (isEditing) {
      await axios.put(
        `${API_BASE}/update-class-years-exam-module/${editingId}`,
        {
          ...form,
          center_code: centerCode,
        }
      );
    } else {
      await axios.post(
        `${API_BASE}/add-class-years-exam-module`,
        {
          ...form,
          center_code: centerCode,
        }
      );
    }

    resetForm();
    loadClassYears();

    alert(
      isEditing
        ? "Class year updated successfully."
        : "Class year added successfully."
    );

  } catch (err) {
    console.error(err);
    alert("Unable to save class year.");
  }
};
  

  

  return (
    <div className="manage-class-years">

      <h2>Manage Class Years</h2>

      <div className="form-card">

        <div className="row">

          <select
            value={form.class_name}
            onChange={(e) =>
              setForm({
                ...form,
                class_name: e.target.value,
              })
            }
          >
            <option value="">Select Class</option>

            {classes.map((className) => (
              <option
                key={className}
                value={className}
              >
                {className}
              </option>
            ))}
          </select>

          <input
            placeholder="Year Name"
            value={form.year_name}
            onChange={(e) =>
              setForm({
                ...form,
                year_name: e.target.value,
              })
            }
          />

          

          

          <button onClick={handleSave}>
            {editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button onClick={resetForm}>
              Cancel
            </button>
          )}

        </div>
        <h3>Existing Class Years</h3>

          <table className="class-year-table">

              <thead>
                  <tr>
                      <th>Class</th>
                      <th>Year</th>
                      <th>Actions</th>
                  </tr>
              </thead>

              <tbody>

                  {classYears.map((row) => (

                      <tr key={row.id}>

                          <td>{row.class_name}</td>

                          <td>{row.year_name}</td>

                          <td>

                              <button
                                  onClick={() => {
                                      setEditingId(row.id);

                                      setForm({
                                          class_name: row.class_name,
                                          year_name: row.year_name,
                                      });
                                  }}
                              >
                                  Edit
                              </button>

                              <button
                                  onClick={() => handleDelete(row.id)}
                              >
                                  Delete
                              </button>

                          </td>

                      </tr>

                  ))}

              </tbody>

          </table>

      </div>

      

    </div>
  );
};

export default ManageClassYears;
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageClassYears.css";

const API_BASE = process.env.REACT_APP_API_URL || "";

const EditClassYear = ({ centerCode, onClose }) => {
  const [classes, setClasses] = useState([]);
  const [classYears, setClassYears] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    class_name: "",
    year_name: "",
  });

  useEffect(() => {
    loadClasses();
    loadClassYears();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/class-names/classes`,
        {
          params: {
            center_code: centerCode,
          },
        }
      );

      setClasses(res.data.classes);
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

        console.log("Class Years:", res.data);

        setClassYears(res.data);
    } catch (err) {
        console.error(err);
    }
    };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE}/update-class-years-exam-module/${editingId}`,
        {
          ...form,
          center_code: centerCode,
        }
      );

      alert("Class year updated successfully.");

      setEditingId(null);

      setForm({
        class_name: "",
        year_name: "",
      });

      loadClassYears();

    } catch (err) {
      console.error(err);
      alert("Unable to update class year.");
    }
  };

  return (
    <div className="manage-class-years">

      <h2>Edit Class Year</h2>

      <div className="form-card">

        <table className="class-year-table">

          <thead>
            <tr>
              <th>Class</th>
              <th>Year</th>
              <th>Action</th>
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

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {editingId && (

          <div
            className="row"
            style={{ marginTop: "20px" }}
          >

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
              type="text"
              placeholder="Year Name"
              value={form.year_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  year_name: e.target.value,
                })
              }
            />

            <button
              onClick={handleUpdate}
              disabled={
                !form.class_name ||
                !form.year_name.trim()
              }
            >
              Update
            </button>

            <button
              onClick={() => {
                setEditingId(null);

                setForm({
                  class_name: "",
                  year_name: "",
                });
              }}
            >
              Cancel
            </button>

          </div>

        )}

        <div style={{ marginTop: "20px" }}>

          <button onClick={onClose}>
            Back
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditClassYear;
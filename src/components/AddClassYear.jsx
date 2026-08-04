import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageClassYears.css";

const API_BASE = process.env.REACT_APP_API_URL || "";

const AddClassYear = ({ centerCode, onClose }) => {
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({
    class_name: "",
    year_name: "",
  });

  useEffect(() => {
    loadClasses();
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

  const handleSave = async () => {
    try {
      await axios.post(
        `${API_BASE}/add-class-years-exam-module`,
        {
          ...form,
          center_code: centerCode,
        }
      );

      alert("Class year added successfully.");

      setForm({
        class_name: "",
        year_name: "",
      });

    }catch (err) {
        console.error(err);

        alert(
            err.response?.data?.detail ||
            "Unable to add class year."
        );
        }
  };

  return (
    <div className="manage-class-years">

      <h2>Add Class Year</h2>

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
            onClick={handleSave}
            disabled={
              !form.class_name ||
              !form.year_name.trim()
            }
          >
            Add
          </button>

          <button onClick={onClose}>
            Back
          </button>

        </div>

      </div>

    </div>
  );
};

export default AddClassYear;
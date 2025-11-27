import React, { useState, useEffect } from "react";
import "./AddUserForm.css";

function AddUserForm({ onClose, onUserAdded }) {
  const [name, setName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("Monday");
  const [nextId, setNextId] = useState(null); // New state for next user ID

  // ----------------- Fetch next user ID on component mount -----------------
  useEffect(() => {
  const fetchNextId = async () => {
    try {
      const response = await fetch(
        "https://web-production-481a5.up.railway.app/get_next_user_id_exam_module"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const id = await response.json();
      console.log("[DEBUG] Received next user ID:", id);
      setNextId(id);
    } catch (err) {
      console.error("[ERROR] Failed to fetch next user ID:", err);
      alert("Unable to fetch next user ID");
    }
  };

  fetchNextId(); // <-- Call async function
}, []); // <-- Properly close useEffect
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----------------- Trim fields -----------------
    const trimmedName = name.trim();
    const trimmedEmail = parentEmail.trim();
    const trimmedPassword = password.trim();
    const trimmedClass = className.trim();
    const trimmedDay = classDay.trim();

    // ----------------- Validation -----------------
    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedClass || !trimmedDay) {
      alert("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!nextId) {
      alert("Next user ID not ready. Please try again.");
      return;
    }

    // ----------------- Prepare payload -----------------
    const payload = {
      id: nextId,            // fetched ID
      password: trimmedPassword,
      name: trimmedName,
      parent_email: trimmedEmail,
      class_name: trimmedClass,
      class_day: trimmedDay,
    };

    console.log("[DEBUG] Sending payload to backend:", JSON.stringify(payload));

    try {
      const response = await fetch(
        "https://krishbackend-production.up.railway.app/add_user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();
      console.log("[DEBUG] Add user response:", responseData);

      if (!response.ok) {
        alert(responseData.detail || "Failed to add user");
        return;
      }

      alert("User added successfully");
      onUserAdded();

      // ----------------- Reset form -----------------
      setName("");
      setParentEmail("");
      setPassword("");
      setClassName("");
      setClassDay("Monday");

      // ----------------- Fetch next ID again -----------------
      const newId = await fetch(
        "https://krishbackend-production.up.railway.app/get_next_user_id"
      ).then((res) => res.json());
      setNextId(newId);
    } catch (err) {
      console.error("[ERROR] Failed to add user:", err);
      alert("An unexpected error occurred while adding the user");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add New User</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Parent Email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />
          <select
            value={classDay}
            onChange={(e) => setClassDay(e.target.value)}
          >
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
          </select>

          <div className="modal-actions">
            <button type="submit">Add User</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserForm;

import React, { useState, useEffect } from "react";
import "./AddUserForm.css";

function AddUserForm({ onClose, onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");
  const [nextId, setNextId] = useState(null); // New state for next user ID

  // ----------------- Fetch next user ID on component mount -----------------
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const response = await fetch(
          "https://krishbackend-production.up.railway.app/get_next_user_id"
        );
        const id = await response.json();
        setNextId(id);
      } catch (err) {
        console.error("[ERROR] Failed to fetch next user ID:", err);
        alert("Unable to fetch next user ID");
      }
    };
    fetchNextId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----------------- Trim fields -----------------
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedClass = className.trim();
    const trimmedPassword = password.trim();

    // ----------------- Validation -----------------
    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedClass || !trimmedPassword) {
      alert("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    const phoneRegex = /^04\d{8}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      alert("Please enter a valid Australian phone number (e.g. 0412345678)");
      return;
    }

    if (!nextId) {
      alert("Next user ID not ready. Please try again.");
      return;
    }

    // ----------------- Prepare payload -----------------
    const payload = {
      id: nextId, // include the fetched ID
      name: trimmedName,
      email: trimmedEmail,
      phone_number: trimmedPhone,
      class_name: trimmedClass,
      password: trimmedPassword,
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
      setEmail("");
      setPhoneNumber("");
      setClassName("");
      setPassword("");

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
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone number (e.g. 0412345678)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Class name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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

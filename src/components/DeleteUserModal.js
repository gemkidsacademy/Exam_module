import React, { useState, useEffect } from "react";
import "./AddUserForm.css"; // reuse modal styling

function DeleteUserForm({ onClose, onUserDeleted }) {
  const [userIds, setUserIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");

  // Fetch user IDs on mount
  useEffect(() => {
    const fetchUserIds = async () => {
      try {
        const res = await fetch("https://your-backend-url.com/api/user-ids");
        if (!res.ok) throw new Error("Failed to fetch user IDs");
        const data = await res.json();
        setUserIds(data); // [{id:1},{id:2},...]
      } catch (err) {
        console.error(err);
        alert("Error fetching user IDs");
      }
    };
    fetchUserIds();
  }, []);

  // Fetch user details when a user ID is selected
  useEffect(() => {
    if (!selectedUserId) {
      setName("");
      setEmail("");
      setPhoneNumber("");
      setClassName("");
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const res = await fetch(
          `https://your-backend-url.com/api/user/${selectedUserId}`
        );
        if (!res.ok) throw new Error("Failed to fetch user details");
        const user = await res.json();
        setName(user.name || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phone_number || "");
        setClassName(user.class_name || "");
      } catch (err) {
        console.error(err);
        // Keep fields empty if backend fails
        setName("");
        setEmail("");
        setPhoneNumber("");
        setClassName("");
      }
    };

    fetchUserDetails();
  }, [selectedUserId]);

  const handleDelete = async () => {
    if (!selectedUserId) {
      alert("Please select a user to delete");
      return;
    }

    try {
      const res = await fetch(
        `https://your-backend-url.com/api/delete-user/${selectedUserId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete user");
      await res.json();
      onUserDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Delete User</h3>

        {/* Dropdown to select user ID */}
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          required
        >
          <option value="">Select a user</option>
          {userIds.map((u) => (
            <option key={u.id} value={u.id}>
              User ID: {u.id}
            </option>
          ))}
        </select>

        {/* Display user details read-only */}
        <input type="text" placeholder="User name" value={name} readOnly />
        <input type="email" placeholder="User email" value={email} readOnly />
        <input
          type="text"
          placeholder="Phone number (optional)"
          value={phoneNumber}
          readOnly
        />
        <input
          type="text"
          placeholder="Class name (optional)"
          value={className}
          readOnly
        />

        <div className="modal-actions">
          <button type="button" onClick={handleDelete}>
            Delete User
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserForm;

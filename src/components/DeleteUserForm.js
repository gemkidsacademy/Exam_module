import React, { useState, useEffect } from "react";
import "./AddStudentForm.css"; // reuse the same modal styling

function DeleteUserForm({ onClose, onUserUpdated }) {
  const [userIds, setUserIds] = useState([]); // list of user IDs
  const [selectedUserId, setSelectedUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");

  // Fetch user IDs on mount
  useEffect(() => {
    const fetchUserIds = async () => {
      try {
        const res = await fetch(
          "https://krishbackend-production.up.railway.app/user_ids"
        );
        if (!res.ok) throw new Error("Failed to fetch user IDs");
        const data = await res.json();
        setUserIds(data);
      } catch (err) {
        console.error(err);
        alert("Error fetching user IDs");
      }
    };

    fetchUserIds();
  }, []);

  // Fetch user details when a user ID is selected
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchUserDetails = async () => {
      try {
        const res = await fetch(
          `https://krishbackend-production.up.railway.app/users/info/${selectedUserId}`
        );
        if (!res.ok) throw new Error("Failed to fetch user details");
        const user = await res.json();
        setName(user.name || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phone_number || "");
        setClassName(user.class_name || "");
      } catch (err) {
        console.error(err);
        alert("Error fetching user details");
      }
    };

    fetchUserDetails();
  }, [selectedUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      alert("Please select a user to delete");
      return;
    }

    try {
      const res = await fetch(
        `https://krishbackend-production.up.railway.app/delete-user/${selectedUserId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete user");

      const data = await res.json();
      alert(data.message || "User deleted successfully!");

      // Notify parent component if provided
      if (onUserUpdated && typeof onUserUpdated === "function") {
        onUserUpdated();
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Delete User</h3>

        <form onSubmit={handleSubmit}>
          {/* User selection dropdown */}
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
            placeholder="Phone number (optional)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="Class name (optional)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />

          <div className="modal-actions">
            <button type="submit">Delete User</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteUserForm;

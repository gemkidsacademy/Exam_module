import React, { useState, useEffect } from "react";
import "./AddUserForm.css"; // reuse the same modal styling

function EditUserForm({ onClose, onUserUpdated }) {
  const [userIds, setUserIds] = useState([]); // list of user IDs
  const [selectedUserId, setSelectedUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");

  // Fetch user IDs on mount
  useEffect(() => {
    const fetchUserIds = async () => {
      try {
        const res = await fetch("https://krishbackend-production.up.railway.app/user_ids");
        if (!res.ok) throw new Error("Failed to fetch user IDs");
        const data = await res.json(); // should return array like [{id:1}, {id:2}, ...]
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
        const res = await fetch(`https://krishbackend-production.up.railway.app/users/info/${selectedUserId}`);
        if (!res.ok) throw new Error("Failed to fetch user details");
        const user = await res.json();
        setName(user.name || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phone_number || "");
        setClassName(user.class_name || "");
        setPassword(""); // leave empty unless admin wants to reset
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
      alert("Please select a user to edit");
      return;
    }

    try {
      const res = await fetch(
        `https://krishbackend-production.up.railway.app/edit-user/${selectedUserId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone_number: phoneNumber,
            class_name: className,
            password, // send only if admin wants to update
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update user");
      await res.json();
      onUserUpdated();
    } catch (err) {
      console.error(err);
      alert("Error updating user");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit User</h3>

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
          <input
            type="password"
            placeholder="Password (leave blank to keep unchanged)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="modal-actions">
            <button type="submit">Update User</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserForm;

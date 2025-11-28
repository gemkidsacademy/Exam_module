import { useState, useEffect } from "react";
import "./AddStudentForm.css"; // Reuse AddStudentForm styling

export default function DeleteUserForm({ onUserDeleted }) {
  const [users, setUsers] = useState([]); // List of users from backend
  const [selectedUserId, setSelectedUserId] = useState("");
  const [studentId, setStudentId] = useState(""); // Editable student ID
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [className, setClassName] = useState("");

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "https://krishbackend-production.up.railway.app/user_ids"
        );
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        alert("Error fetching users");
      }
    };
    fetchUsers();
  }, []);

  // Fetch user details when selected
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchUserDetails = async () => {
      try {
        const res = await fetch(
          `https://krishbackend-production.up.railway.app/users/info/${selectedUserId}`
        );
        if (!res.ok) throw new Error("Failed to fetch user details");
        const user = await res.json();
        setStudentId(user.student_id || ""); // Pre-fill student ID if available
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

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return alert("Please select a user to delete");

    try {
      const res = await fetch(
        `https://krishbackend-production.up.railway.app/delete-user/${selectedUserId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete user");

      const data = await res.json();
      alert(data.message || "User deleted successfully!");

      // Notify parent if needed
      if (onUserDeleted) onUserDeleted();

      // Reset form
      setSelectedUserId("");
      setStudentId("");
      setName("");
      setEmail("");
      setPhoneNumber("");
      setClassName("");
      setUsers(users.filter((u) => u.id !== selectedUserId));
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    }
  };

  return (
    <div className="add-student-container">
      <h2>Delete User</h2>
      <form onSubmit={handleDelete}>
        {/* User selection */}
        <label>ID</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          required
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.id} - {u.name}
            </option>
          ))}
        </select>

        {/* Editable Student ID */}
        <label>Student ID</label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID"
        />

        {/* Read-only details */}
        <label>Name</label>
        <input type="text" value={name} readOnly />

        <label>Email</label>
        <input type="email" value={email} readOnly />

        <label>Phone Number</label>
        <input type="text" value={phoneNumber} readOnly />

        <label>Class Name</label>
        <input type="text" value={className} readOnly />

        <button type="submit">Delete User</button>
      </form>
    </div>
  );
}

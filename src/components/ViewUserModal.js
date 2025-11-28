import { useState, useEffect } from "react";
import "./AddStudentForm.css"; // reuse AddStudentForm styling

export default function ViewUserModal({ onClose }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "https://krishbackend-production.up.railway.app/api/users"
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

  return (
    <div className="add-student-container">
      <h2>All Users</h2>

      {users.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>No users found.</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: "20px" }}>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone_number || "-"}</td>
                  <td>{user.class_name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button className="add-student-container-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

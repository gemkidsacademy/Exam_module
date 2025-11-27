import React, { useState, useEffect } from "react";
import "./AddUserForm.css"; // reuse modal styling

function ViewUserModal({ onClose }) {
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
    <div className="modal-overlay">
      <div
        className="modal large-modal"
        style={{
          width: "90%",
          maxWidth: "1200px",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "15px" }}>All Users</h3>

        {users.length === 0 ? (
          <p style={{ textAlign: "center" }}>No users found.</p>
        ) : (
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
              }}
            >
              <thead style={{ backgroundColor: "#f0f0f0" }}>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Class</th>
                  {/* Removed Created At */}
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
                    {/* Removed Created At */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          className="modal-actions"
          style={{
            marginTop: "15px",
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "#007bff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewUserModal;

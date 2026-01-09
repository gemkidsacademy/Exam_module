import React, { useState } from "react";
import mammoth from "mammoth";

const BulkUserUpload = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setUsers([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, "text/html");

      const rows = doc.querySelectorAll("table tr");

      if (rows.length < 2) {
        throw new Error("No user rows found in document");
      }

      const parsedUsers = [];

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll("td");

        if (cells.length < 3) continue;

        parsedUsers.push({
          name: cells[0].innerText.trim(),
          email: cells[1].innerText.trim(),
          role: cells[2].innerText.trim(),
        });
      }

      setUsers(parsedUsers);
    } catch (err) {
      setError("Failed to read Word document");
    }
  };

  const handleSubmit = async () => {
    if (users.length === 0) return;

    setLoading(true);

    try {
      await fetch("/api/admin/bulk-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users }),
      });

      alert("Users uploaded successfully");
      setUsers([]);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Bulk User Upload</h2>

      <input
        type="file"
        accept=".docx"
        onChange={handleFileUpload}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {users.length > 0 && (
        <>
          <h3>Preview ({users.length} users)</h3>

          <ul>
            {users.map((user, index) => (
              <li key={index}>
                {user.name} — {user.email} — {user.role}
              </li>
            ))}
          </ul>

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Uploading..." : "Confirm & Upload"}
          </button>
        </>
      )}
    </div>
  );
};

export default BulkUserUpload;

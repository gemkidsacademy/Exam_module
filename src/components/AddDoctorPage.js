import React, { useState, useEffect } from "react";
import axios from "axios";

const AddUser = () => {
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    phone_number: "",
    class_name: "",
    password: "",
  });

  const server = "https://krishbackend-production.up.railway.app";
  // const server = "http://localhost:8000";

  const [message, setMessage] = useState("");

  // Fetch next available user ID
  useEffect(() => {
    const fetchNextUserId = async () => {
      try {
        const response = await axios.get(`${server}/get_next_user_id`);
        setUser((prev) => ({ ...prev, id: response.data }));
      } catch (error) {
        console.error("Error fetching next user ID:", error);
        setMessage("Failed to fetch next user ID.");
      }
    };

    fetchNextUserId();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send POST request to backend
      const response = await axios.post(`${server}/add_user`, user);
      setMessage(response.data.message);

      // Reset form fields after successful add
      setUser({
        id: "",
        name: "",
        email: "",
        phone_number: "",
        class_name: "",
        password: "",
      });

      // Fetch next ID again for next entry
      const nextIdResponse = await axios.get(`${server}/get_next_user_id`);
      setUser((prev) => ({ ...prev, id: nextIdResponse.data }));
    } catch (error) {
      console.error("Error adding user:", error);
      setMessage(error.response?.data?.detail || "Failed to add user.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", textAlign: "center" }}>
      <h2>Add User</h2>

      {message && <p style={{ color: message.includes("Failed") ? "red" : "green" }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <input type="number" name="id" placeholder="User ID" value={user.id} readOnly required /><br /><br />
        <input type="text" name="name" placeholder="Name" value={user.name} onChange={handleChange} required /><br /><br />
        <input type="email" name="email" placeholder="Email" value={user.email} onChange={handleChange} required /><br /><br />
        <input type="text" name="phone_number" placeholder="Phone Number" value={user.phone_number} onChange={handleChange} /><br /><br />
        <input type="text" name="class_name" placeholder="Class Name" value={user.class_name} onChange={handleChange} /><br /><br />
        <input type="password" name="password" placeholder="Password" value={user.password} onChange={handleChange} required /><br /><br />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUser;

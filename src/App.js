import React, { useState } from "react";

function SimpleLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      setError(null);
  
      if (!username || !password) {
        setError("Please enter both username and password");
        return;
      }
  
      console.log("[INFO] Attempting exam-module login:", username);
  
      const response = await fetch("https://web-production-481a5.up.railway.app/login-exam-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
      console.log("[DEBUG] Login response:", data);
  
      if (response.ok) {
        console.log("[SUCCESS] Login successful");
  
        // Save login state
        setIsLoggedIn(true);
        setUserData(data);
  
        // Role-based navigation
        if (data?.name === "Admin") {
          navigate("/admin");
        } else {
          navigate("/Quiz");
        }
  
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch (err) {
      console.error("[ERROR] Network error:", err);
      setError("Login failed. Try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
  },
  box: {
    width: "320px",
    padding: "30px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};

export default SimpleLogin;

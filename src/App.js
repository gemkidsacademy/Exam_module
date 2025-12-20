import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// --- Components ---
import AdminPanel from "./components/AdminPage";
import AddDoctor from "./components/AddDoctorPage";
import EditDoctor from "./components/EditDoctorPage";
import ViewDoctors from "./components/ViewDoctors";
import DeleteDoctor from "./components/DeleteDoctor";
import UsageDashboard from "./components/UsageDashboard";
import SelectiveDashboard from "./components/SelectiveDashboard";
import SelectiveFoundational from "./components/SelectiveFoundational";


// --- Login Page ---
function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const server = "https://web-production-481a5.up.railway.app";

  const handleLogin = async () => {
  try {
    setError(null);

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    const response = await fetch(`${server}/login-exam-module`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        student_id: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data?.detail || "Invalid credentials");
      return;
    }

    // ✅ Successful login
    setIsLoggedIn(true);
    setDoctorData(data);
    setSessionToken(data.session_token || null);

    sessionStorage.setItem("student_id", data.student_id);
    sessionStorage.setItem("student_class", data.class_name);
    sessionStorage.setItem("student_name", data.name);

    if (data?.name === "Admin") {
      navigate("/AdminPanel");
    } else if (data?.class_name === "Selective") {
      navigate("/SelectiveDashboard");
    } else if (data?.class_name === "Foundational") {
      navigate("/selectiveFoundational");
    } else {
      navigate("/ExamModule");
    }

  } catch (err) {
    console.error("Login error:", err);
    setError("Login failed. Please try again.");
  }
};


  return (
    <div style={styles.container}>

      {/* ⭐ LOGO ADDED ABOVE LOGIN BOX ⭐ */}
      <img
        src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
        alt="Gem Kids Academy"
        style={{ width: "180px", marginBottom: "20px" }}
      />

      <div style={styles.loginBox}>
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
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

// --- Private Route Wrapper ---
const PrivateRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/" />;
};
const FullWidthLayout = ({ children }) => {
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      {children}
    </div>
  );
};

// --- Main App ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    document.title = "Gem AI - Exam";
  }, []);

  return (
    <Router>
      {/* 🔥 REAL APP LAYOUT WRAPPER */}
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          margin: 0,
          padding: 0,
          display: "block",
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <LoginPage
                setIsLoggedIn={setIsLoggedIn}
                setDoctorData={setDoctorData}
                setSessionToken={setSessionToken}
              />
            }
          />
          <Route
            path="/selectiveFoundational"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <SelectiveFoundational />
              </PrivateRoute>
            }
          />

  
          <Route
            path="/SelectiveDashboard"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <SelectiveDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/adminpanel"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <AdminPanel />
              </PrivateRoute>
            }
          />

  
          {/* other routes unchanged */}
        </Routes>
      </div>
    </Router>
  );

}

// --- Styles ---
const styles = {
  container: {
    display: "flex",
    flexDirection: "column", // ⭐ ensure logo appears above
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f0f2f5",
  },
  loginBox: {
    padding: "30px",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    minWidth: "300px",
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
    marginTop: "10px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "rgb(0, 140, 200)", // ⭐ Brand Login color (E-color)
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};

export default App;

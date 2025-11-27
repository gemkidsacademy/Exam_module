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
import DemoChatbot from "./components/DemoChatbot";
import UsageDashboard from "./components/UsageDashboard";
import ChatbotSettings from "./components/ChatbotSettings";



// --- Login Page ---
function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [loginMode, setLoginMode] = useState("otp"); // "password" or "otp"
  const [isDisabled, setIsDisabled] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const server = "https://krishbackend-production.up.railway.app";


  // --- Generate OTP ---
  const generateOtp = async () => {
  if (!phone) {
    return setError("Please enter a phone number");
  }

  const formattedPhone = phone.trim();

  try {
    const response = await fetch(
      "https://krishbackend-production.up.railway.app/send-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: formattedPhone }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setOtpSent(true);
      setError(null);
      setIsDisabled(false);
      console.log("[INFO] OTP sent successfully:", data);
    } else {
      setError(data.detail || "Failed to generate OTP");
      console.warn("[WARN] OTP generation failed:", data);
    }
  } catch (err) {
    setError("Failed to generate OTP");
    console.error("[ERROR] Exception while generating OTP:", err);
  }
};

  // --- Login Handler ---
  // ------------------ Handle Password Login Only ------------------
const handleLogin = async () => {
  try {
    setError(null);

    // ---------------- Password Login ----------------
    if (loginMode === "password") {
      if (!username || !password) {
        setError("Please enter username and password");
        return;
      }

      console.log("[INFO] Attempting password login:", username);

      const response = await fetch(`${server}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: username, password }),
      });

      const data = await response.json();
      console.log("[DEBUG] Password login response:", data);

      if (response.ok) {
        setIsLoggedIn(true);
        setDoctorData(data);
        setSessionToken(data.session_token || null);

        if (data?.name === "Admin") navigate("/AdminPanel");
        else navigate("/ChatBot");
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } 

    // ---------------- OTP Login ----------------
    else if (loginMode === "otp") {
      console.log("[INFO] OTP login mode active");

      if (!otpSent) {
        setError("Please generate OTP first");
        return;
      }

      if (!phone) {
        setError("Please enter phone number");
        return;
      }

      if (!otp) {
        setError("Please enter the OTP");
        return;
      }

      // --- Normalize phone number to E.164 format ---
// let formattedPhone = phone.trim();
// if (/^0\d{9}$/.test(formattedPhone)) {
//   formattedPhone = "+61" + formattedPhone.slice(1);
// }

// --- Validate final format ---
// const isValidE164 = (number) => /^\+614\d{8}$/.test(number);
// if (!isValidE164(formattedPhone)) {
//   setError("Please enter a valid 10-digit Australian mobile number (e.g. 0412345678)");
//   return;
// }

//      console.log("[INFO] Sending verify-otp request for phone:", formattedPhone, "OTP:", otp);

      try {
        const verifyResponse = await fetch(`${server}/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          //body: JSON.stringify({ phone_number: formattedPhone, otp }), // send formatted phone
          body: JSON.stringify({ phone_number: phone, otp }),
        });

        console.log("[DEBUG] Raw verify-otp response status:", verifyResponse.status);

        let verifyData;
        try {
          verifyData = await verifyResponse.json();
          console.log("[DEBUG] verify-otp response JSON:", verifyData);
        } catch (err) {
          console.error("[ERROR] Failed to parse verify-otp response:", err);
          setError("Failed to verify OTP");
          return;
        }

        if (verifyResponse.ok) {
          console.log("[INFO] OTP verified successfully");

          setIsLoggedIn(true);
          setDoctorData(verifyData.user);
          setSessionToken(null); // or generate/manage session token here
          
          if (verifyData.user.name === "Admin") {
            navigate("/AdminPanel");
          } else {
            navigate("/ChatBot");
          }
        } else {
          console.warn("[WARN] OTP verification failed:", verifyData);
          setError(verifyData.detail || "Invalid OTP");
        }
      } catch (err) {
        console.error("[ERROR] OTP login failed unexpectedly:", err);
        setError("Login failed. Please try again.");
      }
    }
  } catch (err) {
    console.error("[ERROR] Login failed unexpectedly:", err);
    setError("Login failed. Please try again.");
  }
};



  const toggleLoginMode = () => {
    setLoginMode(loginMode === "password" ? "otp" : "password");
    setError(null);
    setOtpSent(false);
    setOtp("");
    setUsername("");
    setPassword("");
    setPhone("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>
          {loginMode === "password" ? "Login with ID/Password" : "Login with OTP"}
        </h2>

        {loginMode === "password" ? (
          <>
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
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter phone number in the format 0412345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              disabled={otpSent} // disable phone after OTP is sent
            />
            {!otpSent && (
              <button
                onClick={generateOtp}
                style={{ ...styles.button, background: "#28a745", marginTop: "5px" }}
                disabled={!phone}
              >
                Generate OTP
              </button>
            )}
            {otpSent && (
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.input}
              />
            )}
          </>
        )}

         <button
          onClick={handleLogin}
          style={{
            ...styles.button,
            opacity: 1,
            cursor: "pointer",
          }}
        >
          Login
        </button>


        <p style={styles.toggle} onClick={toggleLoginMode}>
          {loginMode === "password"
            ? "Login with OTP instead"
            : "Login with ID/Password instead"}
        </p>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

// --- Private Route Wrapper ---
const PrivateRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/" />;
};

// --- Main App ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    document.title = "Class Management System";
  }, []);

  return (
    <Router>
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

        {/* Admin Routes */}
        <Route
          path="/AdminPanel"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-doctor"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <AddDoctor />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-doctor"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <EditDoctor />
            </PrivateRoute>
          }
        />
        <Route
          path="/view-doctors"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <ViewDoctors />
            </PrivateRoute>
          }
        />
        <Route
          path="/delete-doctor"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <DeleteDoctor />
            </PrivateRoute>
          }
        />

        {/* Sociology Chatbot */}
        <Route
          path="/ChatBot"
          element={<DemoChatbot doctorData={doctorData} />}
        />
        <Route
          path="/usage-dashboard"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <UsageDashboard />
            </PrivateRoute>
          }
        /> 
        <Route
          path="/chatbot-settings"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <ChatbotSettings />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// --- Styles ---
const styles = {
  container: {
    display: "flex",
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
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  toggle: {
    marginTop: "10px",
    cursor: "pointer",
    color: "#007bff",
    textDecoration: "underline",
  },
};

export default App;

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
        body: JSON.stringify({ student_id: username, password }),
      });

      const data = await response.json();
      console.log("[DEBUG] Login response data:", data);

      if (!response.ok) {
        setError(data.detail || "Invalid credentials");
        return;
      }

      // Successful login
      setIsLoggedIn(true);
      setDoctorData(data);
      setSessionToken(data.session_token || null);

      sessionStorage.setItem("student_id", data.student_id);
      sessionStorage.setItem("student_class", data.class_name);
      sessionStorage.setItem("student_name", data.name);

      // Route based on role/class
      if (data?.name === "Admin") {
        navigate("/AdminPanel");
      } else if (data?.class_name === "Selective") {
        navigate("/SelectiveDashboard");
      } else {
        navigate("/ExamModule");
      }
    } catch (err) {
      console.error("[ERROR] Login failed:", err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div style={styles.container}>

      {/* LOGO ABOVE CARD */}
      <img
        src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
        alt="Gem Kids Academy"
        style={styles.logo}
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

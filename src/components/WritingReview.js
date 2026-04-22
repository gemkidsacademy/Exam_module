import React, { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate
} from "react-router-dom";



const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function WritingReview() {
  const { attemptId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); 
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Load history USING attempt_id (NEW ENDPOINT)
  // --------------------------------------------------
  useEffect(() => {
    if (!attemptId) return;

    const historyEndpoint =
      mode === "homework"
        ? `/api/student/homework-writing-history-by-attempt?attempt_id=${attemptId}`
        : `/api/exams/writing/history-by-attempt?attempt_id=${attemptId}`;

    fetch(`${API_BASE}${historyEndpoint}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);

        if (data.length > 0) {
          const initialId = Number(attemptId) || data[0].attempt_id;
          setSelectedAttempt(initialId);
        }
      })
      .catch(() => {});
  }, [attemptId, mode]);

  // --------------------------------------------------
  // Load essay when attempt changes
  // --------------------------------------------------
  useEffect(() => {
  if (!selectedAttempt) return;

  console.log("🧪 Fetching essay for:", selectedAttempt);  // ADD

  setLoading(true);

  const reviewEndpoint =
    mode === "homework"
      ? `/api/student/homework-writing/review/${selectedAttempt}`
      : `/api/student/writing/review/${selectedAttempt}`;

  fetch(`${API_BASE}${reviewEndpoint}`)
    .then(res => res.json())
    .then(data => {
      console.log("🧪 Essay response:", data);  // ADD

      setEssay(data.essay_text || "");
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, [selectedAttempt, mode]);

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------
  if (loading) return <div>Loading essay...</div>;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div style={{ padding: "32px", maxWidth: "800px", margin: "auto" }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <h1 style={{ margin: 0 }}>Your Writing</h1>

        <button
          onClick={() =>
            navigate("/SelectiveDashboard", {
              state: { tab: "historical" }
            })
          }
          style={{
            background: "#2E7D32",
            color: "white",
            border: "none",
            padding: "10px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Exit Review
        </button>
      </div>

      {/* ✅ Dropdown */}
      <select
        value={selectedAttempt || ""}
        onChange={(e) => {
          const id = Number(e.target.value);
          setSelectedAttempt(id);
        }}
        style={{
          padding: "8px",
          marginBottom: "16px",
          borderRadius: "6px"
        }}
      >
        {history.map(item => (
          <option key={item.attempt_id} value={item.attempt_id}>
            {item.date} — Score: {item.score}
          </option>
        ))}
      </select>

      {/* ✅ Essay Display */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          lineHeight: "1.7",
          whiteSpace: "pre-wrap"
        }}
      >
        {essay}
      </div>
    </div>
  );
}
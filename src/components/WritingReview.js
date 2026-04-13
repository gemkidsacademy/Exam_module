import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL;

export default function WritingReview() {
  const { attemptId } = useParams();

  const [history, setHistory] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Load history USING attempt_id (NEW ENDPOINT)
  // --------------------------------------------------
  useEffect(() => {
    if (!attemptId) return;

    fetch(`${API_BASE}/api/exams/writing/history-by-attempt?attempt_id=${attemptId}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);

        if (data.length > 0) {
          const initialId = Number(attemptId) || data[0].attempt_id;
          setSelectedAttempt(initialId);
        }
      })
      .catch(() => {});
  }, [attemptId]);

  // --------------------------------------------------
  // Load essay when attempt changes
  // --------------------------------------------------
  useEffect(() => {
    if (!selectedAttempt) return;

    setLoading(true);

    fetch(`${API_BASE}/api/student/writing/review/${selectedAttempt}`)
      .then(res => res.json())
      .then(data => {
        setEssay(data.essay_text || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedAttempt]);

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------
  if (loading) return <div>Loading essay...</div>;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div style={{ padding: "32px", maxWidth: "800px", margin: "auto" }}>
      
      <h1>Your Writing</h1>

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
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL;

export default function WritingReview() {
  const { attemptId } = useParams();

  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/student/writing/review/${attemptId}`)
      .then(res => res.json())
      .then(data => {
        setEssay(data.essay_text || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div>Loading essay...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "800px", margin: "auto" }}>
      <h1>Your Writing</h1>

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
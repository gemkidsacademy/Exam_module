import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/* ======================================================
   MOCK DATA — PHASE 1 ($500 PROJECT)
   Single exam snapshot only
====================================================== */

const mockCurrentExamReport = {
  student: {
    id: "STU-001",
    name: "Student A"
  },
  exam: {
    name: "Foundational Assessment – January",
    date: "2026-01-05"
  },
  overall: {
    scorePercent: 72,
    readinessBand: "Approaching Readiness"
  },
  topics: [
    { name: "Mathematical Reasoning", scorePercent: 80 },
    { name: "Reading Comprehension", scorePercent: 65 },
    { name: "Writing Skills", scorePercent: 70 },
    { name: "Thinking Skills", scorePercent: 73 }
  ]
};

/* ======================================================
   COMPONENT
====================================================== */

const StudentCurrentExamReport = () => {
  const { student, exam, overall, topics } = mockCurrentExamReport;

  const weakestTopics = [...topics]
    .sort((a, b) => a.scorePercent - b.scorePercent)
    .slice(0, 2);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Current Exam Report</h2>
        <p style={styles.subTitle}>
          {exam.name} • {exam.date}
        </p>
      </div>

      {/* Overall Summary */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Overall Result</h3>
        <div style={styles.scoreRow}>
          <span style={styles.score}>{overall.scorePercent}%</span>
          <span style={styles.band}>{overall.readinessBand}</span>
        </div>
      </div>

      {/* Topic-wise Performance */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Topic-wise Performance</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topics}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="scorePercent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Improvement Areas */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Areas to Improve</h3>
        <ul style={styles.list}>
          {weakestTopics.map((topic) => (
            <li key={topic.name} style={styles.listItem}>
              {topic.name} – {topic.scorePercent}%
            </li>
          ))}
        </ul>

        <p style={styles.note}>
          Focus on these topics to improve overall performance in the next exam.
        </p>
      </div>
    </div>
  );
};

/* ======================================================
   BASIC INLINE STYLES (PHASE 1 – SIMPLE & CLEAN)
====================================================== */

const styles = {
  page: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "24px",
    fontFamily: "Inter, system-ui, sans-serif",
    background: "#f8fafc"
  },
  header: {
    marginBottom: "24px"
  },
  title: {
    margin: 0,
    fontSize: "1.8rem",
    color: "#0f172a"
  },
  subTitle: {
    marginTop: "6px",
    color: "#475569"
  },
  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)"
  },
  cardTitle: {
    marginBottom: "16px",
    color: "#0f172a"
  },
  scoreRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "16px"
  },
  score: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#2563eb"
  },
  band: {
    fontSize: "1rem",
    color: "#334155"
  },
  list: {
    paddingLeft: "18px",
    marginBottom: "12px"
  },
  listItem: {
    marginBottom: "6px",
    color: "#334155"
  },
  note: {
    fontSize: "0.9rem",
    color: "#64748b"
  }
};

export default StudentCurrentExamReport;

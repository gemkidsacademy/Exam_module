import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import "./StudentCurrentExamReport.css";

const COLORS = ["#22c55e", "#ef4444", "#94a3b8"];

export default function StudentCurrentExamReport({ data }) {
  if (!data) return null;

  const {
    exam,
    date,
    summary,
    topics,
    improvement_areas,
    evaluation
  } = data;

  const isWriting = exam === "writing";

  const accuracyPie = summary
    ? [
        { name: "Correct", value: summary.correct },
        { name: "Incorrect", value: summary.incorrect },
        { name: "Not Attempted", value: summary.not_attempted }
      ]
    : [];

  return (
    <div className="report-container">

      {/* ============================
          HEADER
      ============================ */}
      <h2>
        {exam.replace(/_/g, " ").toUpperCase()} —{" "}
        {new Date(date).toLocaleDateString()}
      </h2>

      {/* ============================
          OVERALL SUMMARY (MCQ + WRITING)
      ============================ */}
      {summary && (
        <section className="card">
          <h3>Overall Accuracy & Result</h3>

          <div className="summary-grid">
            <div>
              <p><strong>Total Questions:</strong> {summary.total_questions}</p>
              <p><strong>Attempted:</strong> {summary.attempted}</p>
              <p><strong>Correct:</strong> {summary.correct}</p>
              <p><strong>Incorrect:</strong> {summary.incorrect}</p>
              <p><strong>Not Attempted:</strong> {summary.not_attempted}</p>
              <p><strong>Accuracy:</strong> {summary.accuracy}%</p>
              <p><strong>Score:</strong> {summary.score}%</p>
              <p><strong>Result:</strong> {summary.result}</p>
            </div>

            {!isWriting && (
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={accuracyPie}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {accuracyPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          {isWriting && (
            <div style={{ width: "100%", marginTop: "12px" }}>
              <div
                style={{
                  height: "14px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "999px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${summary.score}%`,
                    height: "100%",
                    backgroundColor:
                      summary.score >= 85
                        ? "#22c55e"
                        : summary.score >= 70
                        ? "#f59e0b"
                        : "#ef4444",
                    transition: "width 0.4s ease"
                  }}
                />
              </div>
          
              <div style={{ marginTop: "6px", fontWeight: "600" }}>
                Writing score: {summary.score}%
              </div>
            </div>
          )}


                  
          </div>
        </section>
      )}

      {/* ============================
          WRITING REPORT (AI FEEDBACK)
      ============================ */}
      {isWriting && evaluation && (
        <section className="card">
          <h3>Teacher Feedback</h3>

          <p className="teacher-feedback">
            {evaluation.teacher_feedback}
          </p>

          <div className="writing-band">
            <strong>Selective Readiness:</strong>{" "}
            {evaluation.selective_readiness_band}
          </div>
        </section>
      )}

      {/* ============================
          TOPIC-WISE PERFORMANCE (MCQ ONLY)
      ============================ */}
      {!isWriting && topics && topics.length > 0 && (
        <section className="card">
          <h3>Topic-wise Performance</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topics}>
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="correct" stackId="a" fill="#22c55e" />
              <Bar dataKey="incorrect" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* ============================
          IMPROVEMENT AREAS (MCQ ONLY)
      ============================ */}
      {!isWriting && improvement_areas && improvement_areas.length > 0 && (
        <section className="card">
          <h3>Improvement Areas</h3>

          {improvement_areas.map(area => (
            <div key={area.topic} className="improvement-row">
              <span>{area.topic}</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${100 - area.weakness}%` }}
                />
              </div>
              <span>{100 - area.weakness}%</span>
            </div>
          ))}

          <p className="note">
            Topics with fewer questions may show limited accuracy trends.
          </p>
        </section>
      )}

    </div>
  );
}

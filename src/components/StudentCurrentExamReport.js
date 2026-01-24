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

  const { summary, topics, improvement_areas, exam, date } = data;

  const accuracyPie = [
    { name: "Correct", value: summary.correct },
    { name: "Incorrect", value: summary.incorrect },
    { name: "Not Attempted", value: summary.not_attempted }
  ];

  return (
    <div className="report-container">

      <h2>
        {exam.replace(/_/g, " ").toUpperCase()} —{" "}
        {new Date(date).toLocaleDateString()}
      </h2>

      {/* ============================
          OVERALL ACCURACY
      ============================ */}
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
        </div>
      </section>

      {/* ============================
          TOPIC-WISE PERFORMANCE
      ============================ */}
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

      {/* ============================
          IMPROVEMENT AREAS
      ============================ */}
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

    </div>
  );
}

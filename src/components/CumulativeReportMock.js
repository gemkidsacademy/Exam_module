import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { mockSameExamProgress } from "./mockProgressData";
import "./Reports.css";

export default function CumulativeReportMock({
    exam = "thinking_skills",
    topic
  }) {
    const examData = mockSameExamProgress[exam] || [];
  
    const data = topic
      ? examData.filter(row => row.topic === topic)
      : examData;
  if (data.length < 2) {
    return (
      <div className="empty-state">
        <h3>Not enough data to show progress</h3>
        <p>
          The student needs at least two attempts of the same exam to show
          improvement over time.
        </p>
      </div>
    );
  }

  const first = data[0];
  const last = data[data.length - 1];
  const scoreChange = last.score - first.score;

  return (
    <div className="report-container">

      <h3>Progress Over Time (Same Exam)</h3>
      <p className="subtitle">
        This chart shows how the student has performed in repeated attempts of
        the same exam.
      </p>

      {/* ================= LINE CHART ================= */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={3}
            name="Score"
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#22c55e"
            strokeWidth={3}
            name="Accuracy"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* ================= AI-STYLE SUMMARY ================= */}
      <div className="card ai-summary">
        <h4>Progress Summary</h4>
        <p>
          The student’s score changed from <strong>{first.score}%</strong> to{" "}
          <strong>{last.score}%</strong> over{" "}
          <strong>{data.length}</strong> attempts.
        </p>

        <p>
          {scoreChange > 0
            ? `This indicates a steady improvement of ${scoreChange} percentage points,
               suggesting that practice and feedback are having a positive impact.`
            : scoreChange === 0
            ? "The student’s performance has remained consistent across attempts."
            : "The student’s performance has declined, indicating a need for review and support."}
        </p>
      </div>

    </div>
  );
}

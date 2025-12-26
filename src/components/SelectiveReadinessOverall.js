import { useEffect, useState } from "react";
import "./SelectiveReadinessOverall.css";

const BACKEND_URL = "https://web-production-481a5.up.railway.app";

export default function SelectiveReadinessOverall() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState("");
  const [overall, setOverall] = useState(null);
  const [loading, setLoading] = useState(false);

  /* -----------------------------------
     Load student list
  ----------------------------------- */
  useEffect(() => {
    const loadStudents = async () => {
      const res = await fetch(`${BACKEND_URL}/api/admin/students`);
      const data = await res.json();
      setStudents(data);
    };
    loadStudents();
  }, []);

  /* -----------------------------------
     Load reports for selected student
  ----------------------------------- */
  useEffect(() => {
    if (!selectedStudent) return;

    const loadReports = async () => {
      setLoading(true);
      const res = await fetch(
        `${BACKEND_URL}/api/admin/students/${selectedStudent}/selective-reports`
      );
      const data = await res.json();

      setReports(data.reports || []);
      setOverall(data.overall_readiness || null);
      setLoading(false);
    };

    loadReports();
  }, [selectedStudent]);

  /* -----------------------------------
     Group reports by timestamp
  ----------------------------------- */
  const groupedByAttempt = reports.reduce((acc, r) => {
    const ts = r.created_at;
    if (!acc[ts]) acc[ts] = [];
    acc[ts].push(r);
    return acc;
  }, {});

  const attemptTimestamps = Object.keys(groupedByAttempt).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const selectedAttemptReports = selectedTimestamp
    ? groupedByAttempt[selectedTimestamp]
    : [];

  /* -----------------------------------
     UI
  ----------------------------------- */
  return (
    <div className="overall-readiness-container">
      <h2>Selective Readiness (Overall)</h2>

      {/* Student Selector */}
      <div className="selector-row">
        <label>Student ID</label>
        <select
          value={selectedStudent}
          onChange={(e) => {
            setSelectedStudent(e.target.value);
            setSelectedTimestamp("");
          }}
        >
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s.student_id} value={s.student_id}>
              {s.student_id}
            </option>
          ))}
        </select>
      </div>

      {/* Attempt Selector */}
      {selectedStudent && (
        <div className="selector-row">
          <label>Exam Attempt</label>
          <select
            value={selectedTimestamp}
            onChange={(e) => setSelectedTimestamp(e.target.value)}
          >
            <option value="">Select attempt timestamp</option>
            {attemptTimestamps.map((ts) => (
              <option key={ts} value={ts}>
                {new Date(ts).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading */}
      {loading && <p className="loading">Loading report...</p>}

      {/* Overall Readiness */}
      {selectedTimestamp && overall && (
        <div className="overall-summary">
          <h3>Overall Selective Readiness</h3>

          <div className="score-row">
            <div className="score-box">
              <span className="label">Overall Score</span>
              <span className="value">{overall.score_percent}%</span>
            </div>

            <div className="score-box">
              <span className="label">Readiness Band</span>
              <span className="value">{overall.band}</span>
            </div>
          </div>

          <h4>Component Breakdown</h4>

          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(overall.components).map(
                ([subject, score]) => (
                  <tr key={subject}>
                    <td>{subject.replace("_", " ")}</td>
                    <td>{score}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <p className="explanation">
            Overall Selective Readiness is calculated as an equal-weight
            average of Reading, Mathematical Reasoning, Thinking Skills, and
            Writing. This result is rule-based and deterministic.
          </p>
        </div>
      )}

      {/* Empty State */}
      {selectedTimestamp && !overall && (
        <p className="empty">
          Overall readiness will be available once all four exams are
          completed.
        </p>
      )}
    </div>
  );
}

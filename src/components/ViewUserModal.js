import { useEffect, useState } from "react";
import "./AddStudentForm.css";

export default function ViewUserModal({ onClose }) {
  const [students, setStudents] = useState([]);
  const BACKEND_URL = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [dayFilter, setDayFilter] = useState("All");

  const centerCode = sessionStorage.getItem("center_code");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/students/active/by-center/${centerCode}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error(err);
        alert("Unable to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const classOptions = [
    "All",
    ...new Set(
      students
        .map((student) => student.class_name)
        .filter(Boolean)
    ),
  ];

  const yearOptions = [
    "All",
    ...new Set(
      students
        .map((student) => student.student_year)
        .filter(Boolean)
    ),
  ];

  const dayOptions = [
    "All",
    ...new Set(
      students
        .map((student) => student.class_day)
        .filter(Boolean)
    ),
  ];

  const filteredStudents = students.filter((student) => {
    const search = searchText.trim().toLowerCase();

    const matchesSearch =
      !search ||
      String(student.student_id || "").toLowerCase().includes(search) ||
      String(student.name || "").toLowerCase().includes(search) ||
      String(student.parent_email || "").toLowerCase().includes(search);

    const matchesClass =
      classFilter === "All" ||
      student.class_name === classFilter;

    const matchesYear =
      yearFilter === "All" ||
      student.student_year === yearFilter;

    const matchesDay =
      dayFilter === "All" ||
      student.class_day === dayFilter;

    return (
      matchesSearch &&
      matchesClass &&
      matchesYear &&
      matchesDay
    );
  });

  return (
    <div className="add-student-container full-width">
      <h2>View Students</h2>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <>
          <div className="students-filter-bar">
            <input
              type="text"
              placeholder="Search by Student ID, Name or Parent Email"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="students-search-input"
            />

            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              className="students-filter-select"
            >
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All Classes" : option}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="students-filter-select"
            >
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All Years" : option}
                </option>
              ))}
            </select>

            <select
              value={dayFilter}
              onChange={(event) => setDayFilter(event.target.value)}
              className="students-filter-select"
            >
              {dayOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All Days" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="students-result-count">
            Showing {filteredStudents.length} of {students.length} students
          </div>

          {filteredStudents.length === 0 ? (
            <p>No students match the selected filters.</p>
          ) : (
            <div className="table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Year</th>
                    <th>Day</th>
                    <th>Parent Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.student_id}</td>
                      <td>{s.name}</td>
                      <td>{s.class_name}</td>
                      <td>{s.student_year}</td>
                      <td>{s.class_day}</td>
                      <td>{s.parent_email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
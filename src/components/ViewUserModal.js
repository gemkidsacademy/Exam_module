import { useEffect, useState } from "react";
import "./AddStudentForm.css";

export default function ViewUserModal({ onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          "https://web-production-481a5.up.railway.app/get_all_students_exam_module"
        );

        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
        alert("Unable to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="add-student-container">
      <h2>View Students</h2>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Day</th>
                <th>Parent Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.student_id}</td>
                  <td>{s.name}</td>
                  <td>{s.class_name}</td>
                  <td>{s.class_day}</td>
                  <td>{s.parent_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

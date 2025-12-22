import { useEffect, useState } from "react";
import "./AddStudentForm.css"; // reuse same styling if you want

export default function ViewUserModal({ onClose }) {
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [student, setStudent] = useState(null);

  // Fetch students
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
        setStudentOptions(data);
      } catch (err) {
        console.error(err);
        alert("Unable to load students");
      }
    };

    fetchStudents();
  }, []);

  // Load selected student
  useEffect(() => {
    if (!selectedStudentId) {
      setStudent(null);
      return;
    }

    const found = studentOptions.find(
      (s) => s.student_id === selectedStudentId
    );
    setStudent(found || null);
  }, [selectedStudentId, studentOptions]);

  return (
    <div className="add-student-container">
      <h2>View Student</h2>

      <label>Select Student</label>
      <select
        value={selectedStudentId}
        onChange={(e) => setSelectedStudentId(e.target.value)}
      >
        <option value="">-- Select Student --</option>
        {studentOptions.map((s) => (
          <option key={s.id} value={s.student_id}>
            {s.student_id} - {s.name}
          </option>
        ))}
      </select>

      {student && (
        <div className="student-view-box">
          <label>ID</label>
          <input value={student.id} readOnly />

          <label>Student ID</label>
          <input value={student.student_id} readOnly />

          <label>Name</label>
          <input value={student.name} readOnly />

          <label>Class Name</label>
          <input value={student.class_name} readOnly />

          <label>Class Day</label>
          <input value={student.class_day} readOnly />

          <label>Parent Email</label>
          <input value={student.parent_email} readOnly />
        </div>
      )}

      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

import { useState, useEffect } from "react";
import "./AddStudentForm.css"; // You can reuse the same CSS

export default function DeleteStudentForm() {
  const [students, setStudents] = useState([]); // List of students from backend
  const [selectedStudentId, setSelectedStudentId] = useState(""); // Student ID to delete

  useEffect(() => {
    // Fetch all students to populate dropdown
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "https://web-production-481a5.up.railway.app/get_all_students_exam_module"
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setStudents(data); // assuming backend returns array of { id, student_id, name, class_name, class_day }
      } catch (err) {
        console.error(err);
        alert("Unable to fetch students");
      }
    };
    fetchStudents();
  }, []);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return alert("Please select a student to delete");

    try {
      const response = await fetch(
        `https://web-production-481a5.up.railway.app/delete_student_exam_module/${selectedStudentId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete student");
      alert("Student deleted successfully!");

      // Remove deleted student from local state
      setStudents(students.filter((s) => s.student_id !== selectedStudentId));
      setSelectedStudentId("");
    } catch (err) {
      console.error(err);
      alert("Error deleting student");
    }
  };

  return (
    <div className="add-student-container">
      <h2>Delete Student</h2>
      <form onSubmit={handleDelete}>
        <label>Select Student</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          required
        >
          <option value="">-- Select Student --</option>
          {students.map((student) => (
            <option key={student.id} value={student.student_id}>
              {student.student_id} - {student.name} ({student.class_name})
            </option>
          ))}
        </select>

        <button type="submit">Delete Student</button>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import "./AddStudentForm.css";

export default function EditUserForm() {
  const [studentOptions, setStudentOptions] = useState([]); // Dropdown options from backend
  const [selectedStudentId, setSelectedStudentId] = useState(""); // Admin selects which student to edit
  const [id, setId] = useState(""); // Non-editable backend ID of selected student
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const centerCode = sessionStorage.getItem(
    "center_code"
  );
  const [classDay, setClassDay] = useState("");
  const [gender, setGender] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const BACKEND_URL = process.env.REACT_APP_API_URL;

  // Fetch all students for dropdown
  useEffect(() => {
  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/students/by-center/${centerCode}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // ✅ Backend returns array directly
      setStudentOptions(data.students || []);

    } catch (err) {
      console.error(err);
      alert("Unable to fetch students");
    }
  };

  fetchStudents();
}, []);


  // When a student is selected from dropdown, populate the form
  useEffect(() => {
    if (!selectedStudentId) return;
    const student = studentOptions.find(s => s.student_id === selectedStudentId);
    if (student) {

      setId(student.id);

      setName(student.name);

      setClassName(student.class_name);

      setClassDay(student.class_day);

      setParentEmail(student.parent_email);

      setGender(student.gender || "");

    }
  }, [selectedStudentId, studentOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id,
      student_id: selectedStudentId,
      name,
      class_name: className,
      class_day: classDay,
      parent_email: parentEmail,
      gender,
    };

    try {
      const response = await fetch(
        `${BACKEND_URL}/edit_student_exam_module`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to update student");
      alert("Student updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating student");
    }
  };

  return (
    <div className="add-student-container">
      <h2>Edit Student</h2>
      <form onSubmit={handleSubmit}>
        {/* Dropdown to select student by student_id */}
        <label>Select Student ID</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          required
        >
          <option value="">-- Select Student --</option>
          {studentOptions.map((s) => (
            <option key={s.id} value={s.student_id}>
              {s.student_id} - {s.name}
            </option>
          ))}
        </select>

        {/* Non-editable ID from backend */}
        <label>ID</label>
        <input type="text" value={id} readOnly />

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
        />

        <label>Class Day</label>
        <input
          type="text"
          value={classDay}
          onChange={(e) => setClassDay(e.target.value)}
          required
        />

        <label>Parent Email</label>
        <input
          type="email"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          required
        />
        <label>Gender</label>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">-- Select Gender --</option>

          <option value="Male">Male</option>

          <option value="Female">Female</option>

        </select>

        <button type="submit">Update Student</button>
      </form>
    </div>
  );
}

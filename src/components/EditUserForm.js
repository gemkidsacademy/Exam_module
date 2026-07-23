import { useState, useEffect } from "react";
import "./AddStudentForm.css";

export default function EditUserForm() {
  const [studentOptions, setStudentOptions] = useState([]); // Dropdown options from backend
  const [selectedStudentId, setSelectedStudentId] = useState(""); // Admin selects which student to edit
  const [id, setId] = useState(""); // Non-editable backend ID of selected student
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [classYear, setClassYear] = useState("");
  const [classOptions, setClassOptions] = useState([]);
  const centerCode = sessionStorage.getItem(
    "center_code"
  );
  const [classDay, setClassDay] = useState("");
  const [gender, setGender] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const BACKEND_URL = process.env.REACT_APP_API_URL;
  const CLASS_DAY_OPTIONS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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

  useEffect(() => {
  const fetchClasses = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/classes/${centerCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }

      const data = await response.json();

      setClassOptions(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load classes");
    }
  };

  fetchClasses();
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

      setClassYear(student.student_year || "");

    }
  }, [selectedStudentId, studentOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id,
      student_id: selectedStudentId,
      name,
      class_name: className,
      student_year: classYear,
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

        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
        >
          <option value="">
            -- Select Class --
          </option>

          {classOptions.map((cls) => (
            <option
              key={cls.id}
              value={cls.class_name}
            >
              {cls.class_name}
            </option>
          ))}
        </select>
        <label>Class Year</label>
        <select
          value={classYear}
          onChange={(e) => setClassYear(e.target.value)}
          required
        >
          <option value="">-- Select Year --</option>
          <option value="Kindergarten">Kindergarten</option>
          <option value="Year 2">Year 2</option>
          <option value="Year 3">Year 3</option>
          <option value="Year 4">Year 4</option>
          <option value="Year 5">Year 5</option>
          <option value="Year 6">Year 6</option>
          <option value="Year 7">Year 7</option>
          <option value="Year 8">Year 8</option>
          <option value="Year 9">Year 9</option>
          <option value="Year 10">Year 10</option>
          
        </select>

        <label>Class Day</label>

        <select
          value={classDay}
          onChange={(e) => setClassDay(e.target.value)}
          required
        >
          <option value="">-- Select Day --</option>

          {CLASS_DAY_OPTIONS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

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

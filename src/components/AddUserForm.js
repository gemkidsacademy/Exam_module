import { useState, useEffect } from "react";
import "./AddStudentForm.css";
const BACKEND_URL = process.env.REACT_APP_API_URL;
export default function AddStudentForm() {
  const API_BASE = process.env.REACT_APP_API_URL 
  const [id, setId] = useState(""); // Non-editable ID from backend
  const [studentId, setStudentId] = useState(""); // Editable Student ID entered by admin
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rawCenterCode =
    sessionStorage.getItem("center_code") || "";

  // Handle old corrupted values like:
  // "Rouse hill | CENTER-101"

  const centerCode =
    rawCenterCode.includes("|")
      ? rawCenterCode.split("|")[1].trim()
      : rawCenterCode;
  const [studentYear, setStudentYear] = useState("");
  const STUDENT_YEAR_OPTIONS = [
        "Kindergarten",
        "Year 1",
        "Year 2",
        "Year 3",    
        "Year 4",
        "Year 5",
        "Year 6",       
        "Year 7",
        "Year 8",
        "Year 9",
        "Year 10",
        "Year 11",
        "Year 12",  
      ];
  const CLASS_NAME_OPTIONS = [
  "NAPLAN",
  "Selective",
  "OC",
  "Foundational",
];

const CLASS_DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other",
];

  useEffect(() => {
  const fetchNextId = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/get_next_user_id_exam_module`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Assuming backend returns { next_id: "Gem001" }
      const backendId = data.next_id || data;
      setId(backendId);

    } catch (err) {
      console.error("Error fetching next user ID:", err);
      alert("Unable to fetch next user ID");
    }
  };

  fetchNextId();
}, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;

  const payload = {
    id,
    student_id: studentId,
    name,
    gender,
    student_year: studentYear,
    class_name: className,
    class_day: classDay,
    parent_email: parentEmail,
    center_code: centerCode,
  };

  try {
    setIsSubmitting(true);

    const response = await fetch(
      `${API_BASE}/add_student_exam_module`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error("Failed to add student");

    alert("Student added successfully!");

    // Reset form
    setStudentId("");
    setName("");
    setGender("");
    setClassName("");
    setClassDay("");
    setParentEmail("");
    setStudentYear("");
  } catch (err) {
    console.error(err);
    alert("Error adding student");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="add-student-container">
      <h2>Add New Student</h2>
      <form onSubmit={handleSubmit}>
        {/* Non-editable ID from backend */}
        <label>ID</label>
        <input type="text" value={id} readOnly />

        {/* Editable Student ID entered by admin */}
        <label>Student ID</label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label>Gender</label>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">
            Select gender
          </option>

          {GENDER_OPTIONS.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <label>Class Name</label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          >
            <option value="">Select class</option>
            {CLASS_NAME_OPTIONS.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        <label>Student Year</label>
          <select
            value={studentYear}
            onChange={(e) => setStudentYear(e.target.value)}
            required
          >
            <option value="">Select year</option>
            {STUDENT_YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

        <label>Class Day</label>
          <select
            value={classDay}
            onChange={(e) => setClassDay(e.target.value)}
            required
          >
            <option value="">Select day</option>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? "submit-btn disabled" : "submit-btn"}
        >
          {isSubmitting ? "Adding Student..." : "Add Student"}
        </button>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import "./AddStudentForm.css";

export default function EditUserForm() {
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentResults, setShowStudentResults] = useState(false);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [classYear, setClassYear] = useState("");
  const [classYearOptions, setClassYearOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  const centerCode = sessionStorage.getItem("center_code");

  const [classDay, setClassDay] = useState("");
  const [gender, setGender] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  const [isActive, setIsActive] = useState(true);

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

  const fetchClassYears = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/class-years-exam-module?center_code=${centerCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch class years");
      }

      const data = await response.json();

      setClassYearOptions(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load class years");
    }
  };

  // Fetch all students
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

        setStudentOptions(data.students || []);
      } catch (err) {
        console.error(err);
        alert("Unable to fetch students");
      }
    };

    fetchStudents();
  }, []);

  // Populate form when a student is selected
  useEffect(() => {
    if (!selectedStudentId) return;

    const student = studentOptions.find(
      (s) => s.student_id === selectedStudentId
    );

    if (student) {
      setId(student.id);
      setName(student.name);
      setClassName(student.class_name);
      setClassDay(student.class_day);
      setParentEmail(student.parent_email);
      setGender(student.gender || "");
      setClassYear(student.student_year || "");
      setIsActive(student.is_active ?? true);
    }
  }, [selectedStudentId, studentOptions]);

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
    fetchClassYears();
  }, []);

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
      is_active: isActive,
    };

    console.log("UPDATE STUDENT PAYLOAD:", payload);

    try {
      const response = await fetch(
        `${BACKEND_URL}/edit_student_exam_module`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

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
        <label>Search Student</label>

        <input
          type="text"
          placeholder="Search student by ID or name..."
          value={studentSearch}
          onChange={(e) => {
            setStudentSearch(e.target.value);
            setShowStudentResults(true);
          }}
          required
        />

        {/* Student search results */}
        {showStudentResults && studentSearch && (
          <div
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderTop: "none",
              backgroundColor: "#fff",
            }}
          >
            {studentOptions
              .filter((s) => {
                const searchValue = studentSearch.toLowerCase();

                return (
                  String(s.student_id)
                    .toLowerCase()
                    .includes(searchValue) ||
                  String(s.name).toLowerCase().includes(searchValue)
                );
              })
              .map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStudentId(s.student_id);
                    setStudentSearch(`${s.student_id} - ${s.name}`);
                    setShowStudentResults(false);
                  }}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                    backgroundColor: "#fff",
                    color: "#222",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  {s.student_id} - {s.name}
                </div>
              ))}
          </div>
        )}

        {/* Non-editable ID from backend */}
        <label>ID</label>

        <input
          type="text"
          value={id}
          readOnly
        />

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
          onChange={(e) => {
            setClassName(e.target.value);
            setClassYear("");
          }}
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
          <option value="">
            -- Select Year --
          </option>

          {classYearOptions
            .filter((year) => year.class_name === className)
            .map((year) => (
              <option
                key={year.id}
                value={year.year_name}
              >
                {year.year_name}
              </option>
            ))}
        </select>

        <label>Class Day</label>

        <select
          value={classDay}
          onChange={(e) => setClassDay(e.target.value)}
          required
        >
          <option value="">
            -- Select Day --
          </option>

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
          <option value="">
            -- Select Gender --
          </option>

          <option value="Male">
            Male
          </option>

          <option value="Female">
            Female
          </option>
        </select>

        <label>Student Status</label>

        <select
          value={isActive ? "true" : "false"}
          onChange={(e) =>
            setIsActive(e.target.value === "true")
          }
          required
        >
          <option value="true">
            Active
          </option>

          <option value="false">
            Inactive
          </option>
        </select>

        <button type="submit">
          Update Student
        </button>
      </form>
    </div>
  );
}
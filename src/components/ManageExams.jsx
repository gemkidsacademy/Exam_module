import React, { useCallback, useEffect, useState } from "react";
import "./ManageExams.css";

const BACKEND_URL = process.env.REACT_APP_API_URL;

const ManageExams = ({ onBack }) => {
  const rawCenterCode = sessionStorage.getItem("center_code") || "";

  const centerCode = rawCenterCode.includes("|")
    ? rawCenterCode.split("|")[1].trim()
    : rawCenterCode;

  const [manageMode, setManageMode] = useState(null);

  // ============================================================
  // FILTER OPTIONS
  // ============================================================

  const [classOptions, setClassOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [dayOptions, setDayOptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [saving, setSaving] = useState(false);
  // ============================================================
  // SELECTED FILTERS
  // ============================================================

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  // ============================================================
  // LOADING / ERROR STATE
  // ============================================================

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingDays, setLoadingDays] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD CLASSES
  // GET /class-names/classes?center_code=...
  // ============================================================
  const handleSave = async () => {
  if (!selectedClass || !selectedYear || !selectedDay) {
    setError("Please select Class, Year and Day.");
    return;
  }

  try {
    setSaving(true);
    setError("");

    const payload = {
      center_code: centerCode,
      class_name: selectedClass,
      student_year: selectedYear,
      class_day: selectedDay,
      exam_type:
        manageMode === "homework"
          ? "homework_exam"
          : "active_exam",
      student_ids_disabled: selectedStudentIds,
    };

    console.log("Saving exam access:", payload);

    const response = await fetch(
      `${BACKEND_URL}/api/manage-exams/students/access`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("Save response:", data);

    if (!response.ok) {
      throw new Error(data.detail || "Failed to save exam access.");
    }

    alert(
      manageMode === "homework"
        ? "Homework access updated successfully."
        : "Active Exam access updated successfully."
    );

  } catch (error) {
    console.error("Error saving exam access:", error);
    setError("Failed to save exam access.");
  } finally {
    setSaving(false);
  }
};
  const loadClasses = useCallback(async () => {
    if (!centerCode) {
      console.error("ManageExams: centerCode is missing.");
      setError("Center code is missing.");
      return;
    }

    try {
      setLoadingClasses(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/class-names/classes?center_code=${encodeURIComponent(centerCode)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load classes.");
      }

      const data = await response.json();

      const classes = data.classes || [];

      setClassOptions(classes);
    } catch (error) {
      console.error("Error loading classes:", error);
      setClassOptions([]);
      setError("Failed to load classes.");
    } finally {
      setLoadingClasses(false);
    }
  }, [centerCode]);

  // ============================================================
  // LOAD YEARS
  // GET /api/classes/years
  // ============================================================

  const loadYears = async (className) => {
    if (!className || !centerCode) {
      setYearOptions([]);
      return;
    }

    try {
      setLoadingYears(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/classes/years?category=${encodeURIComponent(className)}&center_code=${encodeURIComponent(centerCode)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load class years.");
      }

      const data = await response.json();

      setYearOptions(data.years || []);
    } catch (error) {
      console.error("Error loading class years:", error);
      setYearOptions([]);
      setError("Failed to load years.");
    } finally {
      setLoadingYears(false);
    }
  };

  // ============================================================
  // LOAD DAYS
  // GET /api/classes/{class_name}/days
  // ============================================================

  const loadDays = async (className) => {
    if (!className) {
      setDayOptions([]);
      return;
    }

    try {
      setLoadingDays(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/classes/${encodeURIComponent(className)}/days`
      );

      if (!response.ok) {
        throw new Error("Failed to load class days.");
      }

      const data = await response.json();

      setDayOptions(data.days || []);
    } catch (error) {
      console.error("Error loading class days:", error);
      setDayOptions([]);
      setError("Failed to load days.");
    } finally {
      setLoadingDays(false);
    }
  };

  // ============================================================
  // LOAD CLASSES WHEN ACTIVE EXAMS SCREEN OPENS
  // ============================================================

  useEffect(() => {
    if (
      manageMode === "active-exams" ||
      manageMode === "homework"
    ) {
      loadClasses();
    }
  }, [manageMode, loadClasses]);

  // ============================================================
  // CLASS CHANGE
  // Load Years + Days for selected class
  // ============================================================

  const handleClassChange = (event) => {
    const className = event.target.value;

    setSelectedClass(className);

    // Reset dependent selections
    setSelectedYear("");
    setSelectedDay("");

    setYearOptions([]);
    setDayOptions([]);

    setError("");

    if (!className) {
      return;
    }

    loadYears(className);
    loadDays(className);
  };

  // ============================================================
  // SHOW STUDENTS
  // Student endpoint will be added later
  // ============================================================

const handleShowStudents = async () => {
  if (!selectedClass || !selectedYear || !selectedDay) {
    setError("Please select Class, Year and Day.");
    return;
  }

  try {
    setError("");

    const params = new URLSearchParams({
      center_code: centerCode,
      class_name: selectedClass,
      student_year: selectedYear,
      class_day: selectedDay,
    });

    const response = await fetch(
      `${BACKEND_URL}/api/manage-exams/students?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to load students.");
    }

    const data = await response.json();

    console.log("Students returned from API:", data);

    const loadedStudents = data.students || [];

    setStudents(loadedStudents);

    setSelectedStudentIds(
      loadedStudents
        .filter((student) =>
          manageMode === "homework"
            ? student.homework_exam === false
            : student.active_exam === false
        )
        .map((student) => student.id)
    );

  } catch (error) {
    console.error("Error loading students:", error);
    setError("Failed to load students.");
  }
};
  // ============================================================
  // ACTIVE EXAMS SCREEN
  // ============================================================

  if (
    manageMode === "active-exams" ||
    manageMode === "homework"
  ) {
    return (
      <div className="manage-exams-container manage-exams-active">
        <div className="manage-exams-active-content">

          {/* Back */}
          

          {/* Heading */}
          <h1>
            {manageMode === "homework"
              ? "Disable Homework Access"
              : "Disable Active Exams Access"}
          </h1>

          <p className="manage-exams-description">
            Select the students whose access should be disabled. Selected
            students will not be able to access{" "}
            {manageMode === "homework" ? "Homework" : "Active Exams"} from
            their account.
          </p>

          {/* Error */}
          {error && (
            <div className="manage-exams-error">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="manage-exams-filters">

            {/* CLASS */}
            <label className="manage-exams-filter">
              <span>Class</span>

              <select
                value={selectedClass}
                onChange={handleClassChange}
                disabled={loadingClasses}
              >
                <option value="">
                  {loadingClasses
                    ? "Loading classes..."
                    : "Select Class"}
                </option>

                {classOptions.map((className) => (
                  <option
                    key={className}
                    value={className}
                  >
                    {className}
                  </option>
                ))}
              </select>
            </label>

            {/* YEAR */}
            <label className="manage-exams-filter">
              <span>Year</span>

              <select
                value={selectedYear}
                onChange={(event) => {
                  setSelectedYear(event.target.value);
                  setError("");
                }}
                disabled={!selectedClass || loadingYears}
              >
                <option value="">
                  {loadingYears
                    ? "Loading years..."
                    : "Select Year"}
                </option>

                {yearOptions.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </label>

            {/* DAY */}
            <label className="manage-exams-filter">
              <span>Day</span>

              <select
                value={selectedDay}
                onChange={(event) => {
                  setSelectedDay(event.target.value);
                  setError("");
                }}
                disabled={!selectedClass || loadingDays}
              >
                <option value="">
                  {loadingDays
                    ? "Loading days..."
                    : "Select Day"}
                </option>

                {dayOptions.map((day) => (
                  <option
                    key={day}
                    value={day}
                  >
                    {day}
                  </option>
                ))}
              </select>
            </label>

            {/* SHOW STUDENTS */}
            <button
              type="button"
              className="manage-exams-show-students"
              onClick={handleShowStudents}
            >
              Show Students
            </button>
          </div>

          {students.length > 0 && (
            <div className="manage-exams-students-section">
              <div className="manage-exams-students-count">
                Showing {students.length} students
              </div>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedStudentIds(students.map((student) => student.id))
                  }
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                >
                  Deselect All
                </button>
              </div>

              <table className="manage-exams-student-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Year</th>
                    <th>Day</th>
                    <th>Parent Email</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => {
                            setSelectedStudentIds((current) =>
                              current.includes(student.id)
                                ? current.filter((id) => id !== student.id)
                                : [...current, student.id]
                            );
                          }}
                        />
                      </td>

                      <td>{student.student_id}</td>
                      <td>{student.name}</td>
                      <td>{student.class_name}</td>
                      <td>{student.student_year}</td>
                      <td>{student.class_day}</td>
                      <td>{student.parent_email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="manage-exams-actions">
                <button
                  type="button"
                  className="manage-exams-cancel"
                  onClick={() => setStudents([])}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="manage-exams-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // SELECT EXAM TYPE SCREEN
  // ============================================================

  return (
    <div className="manage-exams-container">

      

      <div className="manage-exams-content">

        <h1>Select Exam Type</h1>

        <p>
          Choose the exam section for which you want to manage student access.
        </p>

        <div className="manage-exams-options">

          {/* ACTIVE EXAMS */}
          <button
            type="button"
            className="manage-exams-option"
            onClick={() => setManageMode("active-exams")}
          >
            Active Exams
          </button>

          {/* HOMEWORK */}
          <button
            type="button"
            className="manage-exams-option"
            onClick={() => setManageMode("homework")}
          >
            Homework
          </button>

        </div>
      </div>
    </div>
  );
};

export default ManageExams;
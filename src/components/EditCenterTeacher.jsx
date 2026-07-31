// EditCenterTeacher.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function EditCenterTeacher() {
  const [teachers, setTeachers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    teacherId: "",
    centerCode: "",
    teacherName: "",
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    loadTeachers();
    loadCenters();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/get-all-center-teachers`
      );

      if (!response.ok) {
        throw new Error("Failed to load Center Teachers.");
      }

      const data = await response.json();

      setTeachers(data.teachers);
    } catch (err) {
      console.error(err);
      alert("Unable to load Center Teachers.");
    }
  };

  const loadCenters = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/centers/get-all-centers`
      );

      if (!response.ok) {
        throw new Error("Failed to load centers.");
      }

      const data = await response.json();

      setCenters(data.centers);
    } catch (err) {
      console.error(err);
      alert("Unable to load centers.");
    }
  };

  const handleTeacherSelect = (e) => {
    const id = e.target.value;

    setSelectedTeacherId(id);

    const teacher = teachers.find(
      (t) => String(t.id) === String(id)
    );

    if (teacher) {
      setFormData({
        teacherId: teacher.id,
        centerCode: teacher.center_code,
        teacherName: teacher.full_name,
        username: teacher.username,
        password: teacher.password,
        email: teacher.email,
        phoneNumber: teacher.phone_number,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE}/update-center-teacher/${selectedTeacherId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center_code: formData.centerCode,
            full_name: formData.teacherName,
            username: formData.username,
            password: formData.password,
            email: formData.email,
            phone_number: formData.phoneNumber,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || "Failed to update Center Teacher."
        );
      }

      alert("Center Teacher updated successfully.");

      await loadTeachers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">

      <h2 className="text-3xl font-semibold mb-8">
        Edit Center Teacher
      </h2>

      <div className="mb-8">

        <label className="block mb-2 font-medium">
          Select Center Teacher
        </label>

        <select
          value={selectedTeacherId}
          onChange={handleTeacherSelect}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="">
            Select Center Teacher
          </option>

          {teachers.map((teacher) => (
            <option
              key={teacher.id}
              value={teacher.id}
            >
              {teacher.full_name} ({teacher.username})
            </option>
          ))}

        </select>

      </div>

      {selectedTeacherId && (

        <form onSubmit={handleUpdate}>

          <div className="grid grid-cols-2 gap-6">

            <div>

              <label className="block mb-2 font-medium">
                Center
              </label>

              <select
                name="centerCode"
                value={formData.centerCode}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                {centers.map((center) => (
                  <option
                    key={center.center_code}
                    value={center.center_code}
                  >
                    {center.center_code} - {center.center_name}
                  </option>
                ))}
              </select>

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Teacher Name
              </label>

              <input
                type="text"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Phone Number
              </label>

              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

            </div>

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
          >
            {isSubmitting
              ? "Updating Center Teacher..."
              : "Update Center Teacher"}
          </button>

        </form>

      )}

    </div>
  );
}
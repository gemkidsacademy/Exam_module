// AddCenterTeacher.jsx

import { useEffect, useState } from "react";

export default function AddCenterTeacher() {
  const BACKEND_URL = process.env.REACT_APP_API_URL;

  const [allCenters, setAllCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");

  const [teacherName, setTeacherName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("ADD");

  const [allTeachers, setAllTeachers] = useState([]);

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const handleUpdateTeacher = async () => {

  if (!selectedTeacherId) {
    alert("Please select a teacher.");
    return;
  }

  try {

    const payload = {

      username: username,

      password: password,

      full_name: teacherName,

      center_code: selectedCenter,

      email: email,

      phone_number: phoneNumber,

    };

    const response = await fetch(
      `${BACKEND_URL}/update-center-teacher/${selectedTeacherId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to update teacher."
      );
    }

    alert("Teacher updated successfully.");

    await fetchCenterTeachers();

  } catch (error) {

    console.error("Update Teacher Error:", error);

    alert(error.message);

  }

};
const handleDeleteTeacher = async () => {

  if (!selectedTeacherId) {
    alert("Please select a teacher.");
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this teacher?"
  );

  if (!confirmDelete) {
    return;
  }

  try {

    const response = await fetch(
      `${BACKEND_URL}/delete-center-teacher/${selectedTeacherId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to delete teacher."
      );
    }

    alert("Teacher deleted successfully.");

    setSelectedTeacherId("");

    setSelectedCenter("");
    setTeacherName("");
    setUsername("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");

    setMode("ADD");

    await fetchCenterTeachers();

  } catch (error) {

    console.error("Delete Teacher Error:", error);

    alert(error.message);

  }

};
  const fetchCenterTeachers = async () => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/get-all-center-teachers`
    );

    const data = await response.json();

    setAllTeachers(data.teachers || []);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/centers/get-all-centers`

      );

      const data = await response.json();

      setAllCenters(data.centers || []);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  const handleAddCenterTeacher = async () => {
    console.log("Save Teacher clicked");

    if (
      !selectedCenter ||
      !teacherName ||
      !username ||
      !email ||
      !phoneNumber ||
      !password
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const payload = {
        username: username,
        password: password,
        full_name: teacherName,
        center_code: selectedCenter,
        email: email,
        phone_number: phoneNumber,
      };

      console.log("Payload:", payload);

      const response = await fetch(
        `${BACKEND_URL}/center-teacher/add-center-teacher`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to save teacher."
        );
      }

      alert("Teacher added successfully.");
      setSelectedTeacherId("");
      setMode("ADD");

      setSelectedCenter("");
      setTeacherName("");
      setUsername("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
    } catch (error) {
      console.error("Save Teacher Error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl border p-8 max-w-4xl">
      <h2 className="text-3xl font-semibold text-gray-800 mb-10">
        Add Center Teacher
      </h2>

      {/* Select Center */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Select Center
        </label>

        <select
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="">Select Center</option>

          {allCenters.map((center) => (
            <option
              key={center.center_code}
              value={center.center_code}
            >
              {center.center_name}
            </option>
          ))}
        </select>
      </div>
      {/* Select Teacher (UPDATE mode only) */}
      {mode === "UPDATE" && (
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">
            Select Teacher
          </label>

          <select
            value={selectedTeacherId}
            onChange={(e) => {
              const teacherId = e.target.value;

              setSelectedTeacherId(teacherId);

              const teacher = allTeachers.find(
                (t) => String(t.id) === teacherId
              );

              if (teacher) {
                setSelectedCenter(teacher.center_code);
                setTeacherName(teacher.full_name);
                setUsername(teacher.username);
                setEmail(teacher.email);
                setPhoneNumber(teacher.phone_number || "");
                setPassword(teacher.password || "");
              }
            }}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">Select Teacher</option>

            {allTeachers.map((teacher) => (
              <option
                key={teacher.id}
                value={teacher.id}
              >
                {teacher.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2">
            Teacher Name
          </label>

          <input
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="Enter teacher name"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number
          </label>

          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-10">
        <button
          onClick={() => {
            setMode("ADD");

            setSelectedTeacherId("");

            setSelectedCenter("");
            setTeacherName("");
            setUsername("");
            setEmail("");
            setPhoneNumber("");
            setPassword("");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
        >
          Add Center Teacher
        </button>

        <button
          onClick={async () => {
            setMode("UPDATE");

            setSelectedTeacherId("");

            await fetchCenterTeachers();
          }}
          className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg"
        >
          Edit Center Teacher
        </button>

        {mode === "ADD" && (
          <button
            onClick={handleAddCenterTeacher}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
          >
            Save Teacher
          </button>
        )}
        {mode === "UPDATE" && (
          <button
            onClick={handleUpdateTeacher}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg"
          >
            Update Teacher
          </button>
        )}
        {mode === "UPDATE" && selectedTeacherId && (
          <button
            onClick={handleDeleteTeacher}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg"
          >
            Delete Teacher
          </button>
        )}
      </div>
    </div>
  );
}
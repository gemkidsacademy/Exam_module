// ViewCenterTeacher.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function ViewCenterTeacher() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/get-all-center-teachers`
      );

      if (!response.ok) {
        throw new Error("Failed to load Center Teachers.");
      }

      const data = await response.json();

      console.log("API Response:", data);
      console.log("Teachers:", data.teachers);

      setTeachers(data.teachers || []);
    } catch (err) {
      console.error(err);
      alert("Unable to load Center Teachers.");
    } finally {
      setLoading(false);
    }
  };

  console.log("Teachers State:", teachers);

  return (
    <div className="bg-white rounded-xl shadow-md p-8">

      <h2 className="text-3xl font-semibold mb-8">
        View Center Teachers
      </h2>

      {loading ? (
        <p>Loading Center Teachers...</p>
      ) : teachers.length === 0 ? (
        <p>No Center Teachers found.</p>
      ) : (
        <div className="overflow-x-auto">

          <table className="min-w-full border border-gray-300">

            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Teacher Name</th>
                <th className="border px-4 py-2">Username</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Phone Number</th>
                <th className="border px-4 py-2">Center Code</th>
              </tr>
            </thead>

            <tbody>

              {teachers.map((teacher) => (
                <tr key={teacher.id}>

                  <td className="border px-4 py-2">
                    {teacher.id}
                  </td>

                  <td className="border px-4 py-2">
                    {teacher.full_name}
                  </td>

                  <td className="border px-4 py-2">
                    {teacher.username}
                  </td>

                  <td className="border px-4 py-2">
                    {teacher.email}
                  </td>

                  <td className="border px-4 py-2">
                    {teacher.phone_number}
                  </td>

                  <td className="border px-4 py-2">
                    {teacher.center_code}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}
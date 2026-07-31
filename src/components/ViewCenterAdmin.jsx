// ViewCenterAdmin.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function ViewCenterAdmin() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/center-admin/get-all-center-admins`
      );

      if (!response.ok) {
        throw new Error("Failed to load Center Admins.");
      }

      const data = await response.json();

      setAdmins(data.admins);
    } catch (err) {
      console.error(err);
      alert("Unable to load Center Admins.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">

      <h2 className="text-3xl font-semibold mb-8">
        View Center Admins
      </h2>

      {loading ? (

        <p>Loading Center Admins...</p>

      ) : admins.length === 0 ? (

        <p>No Center Admins found.</p>

      ) : (

        <div className="overflow-x-auto">

          <table className="min-w-full border border-gray-300">

            <thead className="bg-gray-100">

              <tr>

                <th className="border px-4 py-3 text-left">
                  ID
                </th>

                <th className="border px-4 py-3 text-left">
                  Admin Name
                </th>

                <th className="border px-4 py-3 text-left">
                  Username
                </th>

                <th className="border px-4 py-3 text-left">
                  Email
                </th>

                <th className="border px-4 py-3 text-left">
                  Phone Number
                </th>

                <th className="border px-4 py-3 text-left">
                  Center Code
                </th>

                <th className="border px-4 py-3 text-left">
                  Role
                </th>

              </tr>

            </thead>

            <tbody>

              {admins.map((admin) => (

                <tr
                  key={admin.id}
                  className="hover:bg-gray-50"
                >

                  <td className="border px-4 py-3">
                    {admin.id}
                  </td>

                  <td className="border px-4 py-3">
                    {admin.full_name}
                  </td>

                  <td className="border px-4 py-3">
                    {admin.username}
                  </td>

                  <td className="border px-4 py-3">
                    {admin.email}
                  </td>

                  <td className="border px-4 py-3">
                    {admin.phone_number}
                  </td>

                  <td className="border px-4 py-3">
                    {admin.center_code}
                  </td>

                  <td className="border px-4 py-3">
                    {admin.role}
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
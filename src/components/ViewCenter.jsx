// ViewCenter.jsx

import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL;

export default function ViewCenter() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/centers/get-all-centers`
      );

      if (!response.ok) {
        throw new Error("Failed to load centers");
      }

      const data = await response.json();

      setCenters(data.centers);
    } catch (err) {
      console.error(err);
      alert("Unable to load centers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">

      <h2 className="text-3xl font-semibold mb-8">
        View Centers
      </h2>

      {loading ? (

        <p>Loading Centers...</p>

      ) : centers.length === 0 ? (

        <p>No Centers found.</p>

      ) : (

        <div className="overflow-x-auto">

          <table className="min-w-full border border-gray-300">

            <thead className="bg-gray-100">

              <tr>

                <th className="border px-4 py-3 text-left">
                  Center Code
                </th>

                <th className="border px-4 py-3 text-left">
                  Center Name
                </th>

                <th className="border px-4 py-3 text-left">
                  Phone Number
                </th>

                <th className="border px-4 py-3 text-left">
                  Email
                </th>

                <th className="border px-4 py-3 text-left">
                  Address
                </th>

                <th className="border px-4 py-3 text-left">
                  Status
                </th>

                <th className="border px-4 py-3 text-left">
                  Time Zone
                </th>

              </tr>

            </thead>

            <tbody>

              {centers.map((center) => (

                <tr
                  key={center.id}
                  className="hover:bg-gray-50"
                >

                  <td className="border px-4 py-3">
                    {center.center_code}
                  </td>

                  <td className="border px-4 py-3">
                    {center.center_name}
                  </td>

                  <td className="border px-4 py-3">
                    {center.phone_number}
                  </td>

                  <td className="border px-4 py-3">
                    {center.email}
                  </td>

                  <td className="border px-4 py-3">
                    {center.address}
                  </td>

                  <td className="border px-4 py-3">
                    {center.status}
                  </td>

                  <td className="border px-4 py-3">
                    {center.time_zone}
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
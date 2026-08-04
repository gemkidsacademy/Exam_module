// AddCenter.jsx

import { useState, useEffect } from "react";
import TimezoneSelect from "react-timezone-select";

const API_BASE = process.env.REACT_APP_API_URL;

export default function AddCenter() {

  const [timeZones, setTimeZones] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState({
    value: "Australia/Sydney",
    label: "(GMT+10:00) Australia/Sydney",
  });

  const [formData, setFormData] = useState({
    centerCode: "",
    centerName: "",
    phoneNumber: "",
    email: "",
    address: "",
    status: "ACTIVE",
    timeZone: "Australia/Sydney",
  });
  useEffect(() => {
    setTimeZones(Intl.supportedValuesOf("timeZone"));
  }, []);

  useEffect(() => {
    fetchNextCenterCode();
  }, []);

  const fetchNextCenterCode = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/centers/get-next-center-code`
      );

      if (!response.ok) {
        throw new Error("Failed to load next center code");
      }

      const data = await response.json();

      setFormData((prev) => ({
      ...prev,
      centerCode: data.center_code,
    }));
    } catch (err) {
      console.error(err);
      alert("Unable to fetch next center code.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = async () => {
    setFormData({
      centerCode: "",
      centerName: "",
      phoneNumber: "",
      email: "",
      address: "",
      status: "ACTIVE",
      timeZone: "Australia/Sydney",
    });

    await fetchNextCenterCode();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE}/centers/add-center`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center_code: formData.centerCode,
            center_name: formData.centerName,
            phone_number: formData.phoneNumber,
            email: formData.email,
            address: formData.address,
            time_zone: formData.timeZone,
            status: formData.status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add center");
      }

      alert("Center added successfully.");

      await resetForm();
    } catch (err) {
      console.error(err);
      alert("Unable to add center.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">

      <h2 className="text-3xl font-semibold mb-8">
        Add Center
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 font-medium">
              Center Code
            </label>

            <input
              type="text"
              name="centerCode"
              value={formData.centerCode}
              readOnly
              className="w-full border rounded-lg px-4 py-3 bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Center Name
            </label>

            <input
              type="text"
              name="centerName"
              value={formData.centerName}
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
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

        </div>

        <div className="mt-6">

          <label className="block mb-2 font-medium">
            Address
          </label>

          <textarea
            rows={4}
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />

        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">

          <div>

            <label className="block mb-2 font-medium">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

          </div>

          <div>
            <label className="block mb-2 font-medium">
              Time Zone
            </label>

            <TimezoneSelect
              value={selectedTimezone}
              onChange={(tz) => {
                setSelectedTimezone(tz);

                setFormData((prev) => ({
                  ...prev,
                  timeZone: tz.value,
                }));
              }}
              displayValue="GMT"
              labelStyle="original"
            />
          </div>

        </div>

        <div className="flex gap-4 mt-8">

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? "Adding Center..." : "Add Center"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg"
          >
            Reset
          </button>

        </div>

      </form>

    </div>
  );
}
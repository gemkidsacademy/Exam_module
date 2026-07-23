import React, { useEffect, useState } from "react";
import "./ViewClasses.css";

const BACKEND_URL = process.env.REACT_APP_API_URL;

const ViewClasses = ({ onClose }) => {
    const rawCenterCode = sessionStorage.getItem("center_code") || "";

    const centerCode = rawCenterCode.includes("|")
        ? rawCenterCode.split("|")[1].trim()
        : rawCenterCode;

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/classes/${centerCode}`
            );

            if (!response.ok) {
                throw new Error("Failed to load classes");
            }

            const data = await response.json();
            setClasses(data);
        } catch (err) {
            console.error(err);
            alert("Unable to load classes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="view-classes-container">

            <h2>Manage Classes</h2>

            {loading ? (
                <div className="loading">
                    Loading classes...
                </div>
            ) : classes.length === 0 ? (
                <div className="empty-state">
                    No classes found.
                </div>
            ) : (
                <table className="classes-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Class Name</th>
                        </tr>
                    </thead>

                    <tbody>

                        {classes.map((cls) => (
                            <tr key={cls.id}>
                                <td>{cls.id}</td>
                                <td>{cls.class_name}</td>
                            </tr>
                        ))}

                    </tbody>

                </table>
            )}

            <button
                className="back-btn"
                onClick={onClose}
            >
                Back
            </button>

        </div>
    );
};

export default ViewClasses;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";
import ViewUserModal from "./ViewUserModal";
import DeleteUserForm from "./DeleteUserForm";
import QuizSetup from "./QuizSetup";
import UploadWord from "./UploadWord";
import GenerateExam from "./GenerateExam";   // ⬅️ NEW COMPONENT IMPORT
import UploadImageFolder from "./UploadImageFolder";
import QuizSetup_foundational from "./QuizSetup_foundational";
import QuizSetup_reading from "./QuizSetup_reading";
import QuizSetup_writing from "./QuizSetup_writing";




const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("database");
  const navigate = useNavigate();

  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [examType, setExamType] = useState(null);

  // Reset exam selection whenever user switches away from Add Quiz tab
  React.useEffect(() => {
    if (activeTab !== "add-quiz") {
      setExamType(null);
    }
  }, [activeTab]);



  const tabs = [
    { id: "database", label: "Exam Module User Management" },
    { id: "upload-word", label: "Upload Questions Word Document" },
    { id: "upload-image-folder", label: "Upload Exam Image Folder" }, 
    { id: "add-quiz", label: "Create Exam" },
    { id: "generate-exam", label: "Generate Exam" },
  ];


  const handleUserUpdated = () => {
    setShowEditUser(false);
    alert("User updated successfully!");
  };

  const handleUserAdded = () => {
    setShowAddUser(false);
    alert("User added successfully!");
  };

  const handleUserDeleted = () => {
    console.log("User deleted successfully");
  };

  // Toggle functions
  const toggleAddUser = () => setShowAddUser((prev) => !prev);
  const toggleEditUser = () => setShowEditUser((prev) => !prev);
  const toggleViewUser = () => setShowViewUser((prev) => !prev);
  const toggleDeleteUser = () => setShowDeleteUser((prev) => !prev);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="tab-nav">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "database" && (
          
          <div className="tab-panel">
            <div>
              <button className="dashboard-button" onClick={toggleAddUser}>
                Add User
              </button>
              {showAddUser && (
                <AddUserForm
                  onClose={() => setShowAddUser(false)}
                  onUserAdded={handleUserAdded}
                />
              )}
            </div>

            <div>
              <button className="dashboard-button" onClick={toggleEditUser}>
                Edit User
              </button>
              {showEditUser && (
                <EditUserForm
                  onClose={() => setShowEditUser(false)}
                  onUserUpdated={handleUserUpdated}
                />
              )}
            </div>

            <div>
              <button className="dashboard-button" onClick={toggleViewUser}>
                View User
              </button>
              {showViewUser && (
                <ViewUserModal onClose={() => setShowViewUser(false)} />
              )}
            </div>

            <div>
              <button className="dashboard-button" onClick={toggleDeleteUser}>
                Delete User
              </button>
              {showDeleteUser && (
                <DeleteUserForm
                  onClose={() => setShowDeleteUser(false)}
                  onUserDeleted={handleUserDeleted}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "add-quiz" && (
            <div className="tab-panel" style={{ textAlign: "center", padding: "30px" }}>
          
              {/* STEP 1 — Show exam selection buttons */}
              {!examType && (
                <>
                  
          
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                      maxWidth: "320px",
                      margin: "0 auto",
                      width: "100%",
                    }}
                  >
                    {[
                      { label: "Selective Exam", value: "selective" },
                      { label: "Foundational Exam", value: "foundational" },
                      { label: "Reading Exam", value: "reading" },
                      { label: "Writing Exam", value: "writing" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setExamType(item.value)}
                        style={{
                          padding: "12px 18px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                          background: "#f8f9fa",
                          cursor: "pointer",
                          fontWeight: "500",
                          transition: "0.2s",
                        }}
                        onMouseOver={(e) => (e.target.style.background = "#e6e6e6")}
                        onMouseOut={(e) => (e.target.style.background = "#f8f9fa")}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
          
              {/* STEP 2 — Render QuizSetup when Selective chosen */}
              {examType === "selective" && <QuizSetup />}
              {examType === "foundational" && <QuizSetup_foundational />}
              {examType === "reading" && <QuizSetup_reading />}
              {examType === "writing" && <QuizSetup_writing />}

            </div>
          )}



        {activeTab === "upload-image-folder" && (
          <div className="tab-panel">
            <UploadImageFolder />
          </div>
        )}
        {activeTab === "upload-word" && (
          <div className="tab-panel">
            <UploadWord />
          </div>
        )}

        {activeTab === "generate-exam" && (
          <div className="tab-panel">
            <GenerateExam />   {/* ⬅️ NEW COMPONENT RENDERED HERE */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

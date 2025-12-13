import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

// User management
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";
import ViewUserModal from "./ViewUserModal";
import DeleteUserForm from "./DeleteUserForm";

// Quiz creation
import QuizSetup from "./QuizSetup";
import QuizSetup_foundational from "./QuizSetup_foundational";
import QuizSetup_reading from "./QuizSetup_reading";
import QuizSetup_writing from "./QuizSetup_writing";

// Uploads
import UploadImageFolder from "./UploadImageFolder";
import ExamTypeSelector from "./ExamTypeSelector";

// Generate exams
import ExamTypeSelector_generate_exam from "./ExamTypeSelector_generate_exam";

const AdminPanel = () => {
  const navigate = useNavigate();

  /* ---------------------------
     Tabs
  --------------------------- */
  const [activeTab, setActiveTab] = useState("database");

  /* ---------------------------
     Modal States
  --------------------------- */
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);

  /* ---------------------------
     Exam Type States
  --------------------------- */
  const [createExamType, setCreateExamType] = useState(null);
  const [generateExamType, setGenerateExamType] = useState(null);

  /* ---------------------------
     Reset states on tab switch
     🔥 FIX IS HERE
  --------------------------- */
  useEffect(() => {
    // createExamType is used in TWO tabs
    if (
      activeTab !== "add-quiz" &&
      activeTab !== "exam-type-selector"
    ) {
      setCreateExamType(null);
    }

    if (activeTab !== "generate-exam") {
      setGenerateExamType(null);
    }
  }, [activeTab]);

  /* ---------------------------
     Tabs Config
  --------------------------- */
  const tabs = [
    { id: "database", label: "Exam Module User Management" },
    { id: "exam-type-selector", label: "Upload Questions Word Document" },
    { id: "upload-image-folder", label: "Upload Exam Image Folder" },
    { id: "add-quiz", label: "Create Exam" },
    { id: "generate-exam", label: "Generate Exam" },
  ];

  /* ---------------------------
     User Callbacks
  --------------------------- */
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

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* ---------- Tabs ---------- */}
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

      {/* ---------- Tab Content ---------- */}
      <div className="tab-content">

        {/* ===== USER MANAGEMENT ===== */}
        {activeTab === "database" && (
          <div className="tab-panel">
            <button className="dashboard-button" onClick={() => setShowAddUser(true)}>
              Add User
            </button>
            {showAddUser && (
              <AddUserForm
                onClose={() => setShowAddUser(false)}
                onUserAdded={handleUserAdded}
              />
            )}

            <button className="dashboard-button" onClick={() => setShowEditUser(true)}>
              Edit User
            </button>
            {showEditUser && (
              <EditUserForm
                onClose={() => setShowEditUser(false)}
                onUserUpdated={handleUserUpdated}
              />
            )}

            <button className="dashboard-button" onClick={() => setShowViewUser(true)}>
              View User
            </button>
            {showViewUser && <ViewUserModal onClose={() => setShowViewUser(false)} />}

            <button className="dashboard-button" onClick={() => setShowDeleteUser(true)}>
              Delete User
            </button>
            {showDeleteUser && (
              <DeleteUserForm
                onClose={() => setShowDeleteUser(false)}
                onUserDeleted={handleUserDeleted}
              />
            )}
          </div>
        )}

        {/* ===== UPLOAD WORD QUESTIONS ===== */}
        {activeTab === "exam-type-selector" && (
          <div className="tab-panel">
            <ExamTypeSelector
              examType={createExamType}
              onSelect={setCreateExamType}
            />
          </div>
        )}

        {/* ===== UPLOAD IMAGE FOLDER ===== */}
        {activeTab === "upload-image-folder" && (
          <div className="tab-panel">
            <UploadImageFolder />
          </div>
        )}

        {/* ===== CREATE EXAM ===== */}
        {activeTab === "add-quiz" && (
          <div className="tab-panel" style={{ textAlign: "center", padding: "30px" }}>

            {!createExamType && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  maxWidth: "320px",
                  margin: "0 auto",
                }}
              >
                {[
                  { label: "Thinking Skills Exam", value: "thinking_skills" },
                  { label: "Foundational Exam", value: "foundational" },
                  { label: "Reading Exam", value: "reading" },
                  { label: "Writing Exam", value: "writing" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setCreateExamType(item.value)}
                    className="dashboard-button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {createExamType === "thinking_skills" && <QuizSetup />}
            {createExamType === "foundational" && <QuizSetup_foundational />}
            {createExamType === "reading" && <QuizSetup_reading />}
            {createExamType === "writing" && <QuizSetup_writing />}
          </div>
        )}

        {/* ===== GENERATE EXAM ===== */}
        {activeTab === "generate-exam" && (
          <div className="tab-panel">
            <ExamTypeSelector_generate_exam
              examType={generateExamType}
              onSelect={setGenerateExamType}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;

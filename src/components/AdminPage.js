import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

/* ============================
   User Management
============================ */
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";
import ViewUserModal from "./ViewUserModal";
import DeleteUserForm from "./DeleteUserForm";

/* ============================
   Quiz Setup
============================ */
import QuizSetup from "./QuizSetup";
import QuizSetup_foundational from "./QuizSetup_foundational";
import QuizSetup_reading from "./QuizSetup_reading";
import QuizSetup_writing from "./QuizSetup_writing";
import QuizSetup_MathematicalReasoning from "./QuizSetup_MathematicalReasoning";

/* ============================
   Uploads
============================ */
import UploadImageFolder from "./UploadImageFolder";
import ExamTypeSelector from "./ExamTypeSelector";

/* ============================
   Generate Exam
============================ */
import ExamTypeSelector_generate_exam from "./ExamTypeSelector_generate_exam";

import GenerateExam_foundational from "./GenerateExam_foundational";

const AdminPanel = () => {
  const navigate = useNavigate();

  /* ============================
     Tabs
  ============================ */
  const [activeTab, setActiveTab] = useState("database");

  /* ============================
     User Modals
  ============================ */
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);

  const [createExamCategory, setCreateExamCategory] = useState(null);
  const [generateExamCategory, setGenerateExamCategory] = useState(null);
   
  const [createExamType, setCreateExamType] = useState(null);
  const [generateExamType, setGenerateExamType] = useState(null);

  /* ============================
     Exam Flow State
  ============================ */
  
  /* ============================
     State Reset Logic (FIXED)
  ============================ */
  useEffect(() => {
     if (activeTab === "add-quiz") {
       // entering Create Exam → start clean
       setCreateExamCategory(null);
       setCreateExamType(null);
     }
   
     if (activeTab === "generate-exam") {
       // entering Generate Exam → start clean
       setGenerateExamCategory(null);
       setGenerateExamType(null);
     }
   }, [activeTab]);


  /* ============================
     Tabs Config
  ============================ */
  const tabs = [
    { id: "database", label: "Exam Module User Management" },
    { id: "exam-type-selector", label: "Upload Questions Word Document" },
    { id: "upload-image-folder", label: "Upload Exam Image Folder" },
    { id: "add-quiz", label: "Create Exam" },
    { id: "generate-exam", label: "Generate Exam" },
  ];

  /* ============================
     User Callbacks
  ============================ */
  const handleUserAdded = () => {
    setShowAddUser(false);
    alert("User added successfully!");
  };

  const handleUserUpdated = () => {
    setShowEditUser(false);
    alert("User updated successfully!");
  };

  const handleUserDeleted = () => {
    setShowDeleteUser(false);
    alert("User deleted successfully!");
  };

  /* ============================
     Render
  ============================ */
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

    {/* ---------- Content ---------- */}
    <div className="tab-content">

      {/* ===== USER MANAGEMENT ===== */}
      {activeTab === "database" && (
        <div className="tab-panel">

          <div className="user-management-header">
            <h2>Exam Module Users</h2>
            <p>Manage student accounts for the exam system.</p>
          </div>

          <div className="user-actions-grid">
            <div className="action-card" onClick={() => setShowAddUser(true)}>
              <h3>Add User</h3>
              <p>Create a new student account</p>
            </div>

            <div className="action-card" onClick={() => setShowEditUser(true)}>
              <h3>Edit User</h3>
              <p>Update student details</p>
            </div>

            <div className="action-card" onClick={() => setShowViewUser(true)}>
              <h3>View Users</h3>
              <p>Browse existing students</p>
            </div>

            <div
              className="action-card danger"
              onClick={() => setShowDeleteUser(true)}
            >
              <h3>Delete User</h3>
              <p>Remove a student account</p>
            </div>
          </div>

          {showAddUser && (
            <AddUserForm
              onClose={() => setShowAddUser(false)}
              onUserAdded={handleUserAdded}
            />
          )}

          {showEditUser && (
            <EditUserForm
              onClose={() => setShowEditUser(false)}
              onUserUpdated={handleUserUpdated}
            />
          )}

          {showViewUser && (
            <ViewUserModal onClose={() => setShowViewUser(false)} />
          )}

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
      {/* ===== CREATE EXAM ===== */}
{activeTab === "add-quiz" && (
   {console.log("RENDER CREATE EXAM BLOCK")}
  <div className="tab-panel" style={{ textAlign: "center", padding: "30px" }}>

    <h3>Create Exam</h3>

    {/* STEP 1: CATEGORY */}
    {!createExamCategory && (
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <button onClick={() => setCreateExamCategory("selective")}>
          Selective Exam
        </button>
        <button onClick={() => setCreateExamCategory("foundational")}>
          Foundational Exam
        </button>
      </div>
    )}

    {/* STEP 2: SELECTIVE OPTIONS */}
    {createExamCategory === "selective" && !createExamType && (
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <button onClick={() => setCreateExamType("thinking_skills")}>
          Thinking Skills
        </button>
        <button onClick={() => setCreateExamType("mathematical_reasoning")}>
          Mathematical Reasoning
        </button>
        <button onClick={() => setCreateExamType("reading")}>
          Reading
        </button>
        <button onClick={() => setCreateExamType("writing")}>
          Writing
        </button>
      </div>
    )}

    {/* STEP 2B: FOUNDATIONAL */}
    {createExamCategory === "foundational" && !createExamType && (
      <button onClick={() => setCreateExamType("foundational")}>
        Foundational Exam
      </button>
    )}

    {/* STEP 3: FORMS */}
    {createExamType === "thinking_skills" && <QuizSetup />}
    {createExamType === "mathematical_reasoning" && <QuizSetup_MathematicalReasoning />}
    {createExamType === "foundational" && <QuizSetup_foundational />}
    {createExamType === "reading" && <QuizSetup_reading />}
    {createExamType === "writing" && <QuizSetup_writing />}

  </div>
)}


      {/* ===== GENERATE EXAM ===== */}
      {activeTab === "generate-exam" && (
        <div className="tab-panel" style={{ textAlign: "center", padding: "30px" }}>

          {!generateExamCategory && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <button onClick={() => setGenerateExamCategory("selective")}>
                Selective Exam
              </button>
              <button onClick={() => setGenerateExamCategory("foundational")}>
                Foundational Exam
              </button>
            </div>
          )}

          {generateExamCategory === "selective" && !generateExamType && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <button onClick={() => setGenerateExamType("thinking_skills")}>
                Thinking Skills
              </button>
              <button onClick={() => setGenerateExamType("mathematical_reasoning")}>
                Mathematical Reasoning
              </button>
              <button onClick={() => setGenerateExamType("reading")}>
                Reading
              </button>
              <button onClick={() => setGenerateExamType("writing")}>
                Writing
              </button>
            </div>
          )}

          {generateExamCategory === "foundational" && !generateExamType && (
            <button onClick={() => setGenerateExamType("foundational")}>
              Foundational Exam
            </button>
          )}

          {generateExamCategory === "selective" && generateExamType && (
            <ExamTypeSelector_generate_exam examType={generateExamType} />
          )}

          {generateExamCategory === "foundational" &&
            generateExamType === "foundational" && (
              <GenerateExam_foundational />
            )}
        </div>
      )}

    </div>
  </div>
);
}
export default AdminPanel;

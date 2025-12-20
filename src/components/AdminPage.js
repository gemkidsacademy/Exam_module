import React, { useState, useEffect } from "react";
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

  /* ============================
     Create Exam State
  ============================ */
  const [createExamCategory, setCreateExamCategory] = useState(null);
  const [createExamType, setCreateExamType] = useState(null);

  /* ============================
     Generate Exam State
  ============================ */
  const [generateExamCategory, setGenerateExamCategory] = useState(null);
  const [generateExamType, setGenerateExamType] = useState(null);

  /* ============================
     Reset Logic
  ============================ */
  useEffect(() => {
    if (activeTab !== "add-quiz") {
      setCreateExamCategory(null);
      setCreateExamType(null);
    }

    if (activeTab !== "generate-exam") {
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

        {/* ============================
            USER MANAGEMENT
        ============================ */}
        {activeTab === "database" && (
          <div className="tab-panel">
            <div className="user-actions-grid">
              <div className="action-card" onClick={() => setShowAddUser(true)}>
                Add User
              </div>
              <div className="action-card" onClick={() => setShowEditUser(true)}>
                Edit User
              </div>
              <div className="action-card" onClick={() => setShowViewUser(true)}>
                View Users
              </div>
              <div
                className="action-card danger"
                onClick={() => setShowDeleteUser(true)}
              >
                Delete User
              </div>
            </div>

            {showAddUser && <AddUserForm onClose={() => setShowAddUser(false)} />}
            {showEditUser && <EditUserForm onClose={() => setShowEditUser(false)} />}
            {showViewUser && <ViewUserModal onClose={() => setShowViewUser(false)} />}
            {showDeleteUser && <DeleteUserForm onClose={() => setShowDeleteUser(false)} />}
          </div>
        )}

        {/* ============================
            UPLOAD QUESTIONS
        ============================ */}
        {activeTab === "exam-type-selector" && (
          <div className="tab-panel">
            <ExamTypeSelector />
          </div>
        )}

        {activeTab === "upload-image-folder" && (
          <div className="tab-panel">
            <UploadImageFolder />
          </div>
        )}

        {/* ============================
            CREATE EXAM
        ============================ */}
        {activeTab === "add-quiz" && (
          <div className="tab-panel" style={{ textAlign: "center" }}>
            {!createExamCategory && (
              <>
                <button onClick={() => setCreateExamCategory("selective")}>
                  Selective Exam
                </button>
                <button onClick={() => setCreateExamCategory("foundational")}>
                  Foundational Exam
                </button>
              </>
            )}

            {createExamCategory === "selective" && !createExamType && (
              <>
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
              </>
            )}

            {createExamCategory === "foundational" && !createExamType && (
              <button onClick={() => setCreateExamType("foundational")}>
                Foundational Exam
              </button>
            )}

            {createExamType === "thinking_skills" && <QuizSetup />}
            {createExamType === "mathematical_reasoning" && <QuizSetup_MathematicalReasoning />}
            {createExamType === "foundational" && <QuizSetup_foundational />}
            {createExamType === "reading" && <QuizSetup_reading />}
            {createExamType === "writing" && <QuizSetup_writing />}
          </div>
        )}

        {/* ============================
            GENERATE EXAM
        ============================ */}
        {activeTab === "generate-exam" && (
          <div className="tab-panel" style={{ textAlign: "center" }}>
            {!generateExamCategory && (
              <>
                <button onClick={() => setGenerateExamCategory("selective")}>
                  Selective Exam
                </button>
                <button onClick={() => setGenerateExamCategory("foundational")}>
                  Foundational Exam
                </button>
              </>
            )}

            {generateExamCategory === "selective" && !generateExamType && (
              <>
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
              </>
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
};

export default AdminPanel;

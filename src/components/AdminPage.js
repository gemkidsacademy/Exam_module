import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import StudentExamReports from "./StudentExamReports";
import SelectiveReadinessOverall from "./SelectiveReadinessOverall";
import StudentReportShell from "./StudentReportShell";
import BulkUserUpload from "./BulkUserUpload";
import StudentReportShell_backend from "./StudentReportShell_backend";







import "./AdminPanel.css";

/* ============================
   User Management
============================ */
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";
import ViewUserModal from "./ViewUserModal";
import DeleteUserModal from "./DeleteUserModal";

import GenerateExam from "./GenerateExam";
import GenerateExam_reading from "./GenerateExam_reading";
import GenerateExam_writing from "./GenerateExam_writing";
import GenerateExam_thinking_skills from "./GenerateExam_thinking_skills";



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
  const [userMode, setUserMode] = useState("menu");
  
  const [generateExamStep, setGenerateExamStep] = useState("category"); 

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
       setCreateExamCategory(null);
       setCreateExamType(null);
     }
   
     if (activeTab === "generate-exam") {
       setGenerateExamCategory(null);
       setGenerateExamType(null);
       setGenerateExamStep("category"); // ✅ FIX
     }
   }, [activeTab]);

   useEffect(() => {
     if (activeTab !== "database") {
       setUserMode("menu");
     }
   }, [activeTab]);

   useEffect(() => {
     if (activeTab !== "exam-type-selector") {
       setCreateExamType("");
     }
   }, [activeTab]);


  /* ============================
     Tabs Config
  ============================ */
  const tabs = [
  { id: "database", label: "Exam Module User Management" },
  { id: "exam-type-selector", label: "Upload Questions Word Document" },
  { id: "upload-image-folder", label: "Exam Image Folder" },
  { id: "add-quiz", label: "Create Exam" },
  { id: "generate-exam", label: "Generate Exam" },
  { id: "student-exam-reports", label: "Student Exam Reports" },
  { id: "topic-report-limited", label: "Topic Report (Front End only)" },
  { id: "topic-report-limited-2", label: "Topic Report (Front End only 2)" },
  { id: "selective-readiness-overall", label: "Selective Readiness (Overall)" },
];


  /* ============================
     User Callbacks
  ============================ */
  const handleUserAdded = () => {
     setUserMode("menu");
   };
   
   const handleUserUpdated = () => {
     setUserMode("menu");
   };
   
   const handleUserDeleted = () => {
     setUserMode("menu");
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
      {/* ===== USER MANAGEMENT   ===== */}
      {activeTab === "database" && (
        <div className="tab-panel">
      
          {/* ================= MENU ================= */}
          {userMode === "menu" && (
            <div className="user-actions-grid">
               <div className="action-card" onClick={() => setUserMode("add-user-bulk")}>
                <h3>Add User Bulk</h3>
                <p>upload file to add bulk users</p>
              </div>
              <div className="action-card" onClick={() => setUserMode("add")}>
                <h3>Add User</h3>
                <p>Create a new student account</p>
              </div>
      
              <div className="action-card" onClick={() => setUserMode("edit")}>
                <h3>Edit User</h3>
                <p>Update student details</p>
              </div>
      
              <div className="action-card" onClick={() => setUserMode("view")}>
                <h3>View Users</h3>
                <p>Browse existing students</p>
              </div>
      
              <div
                className="action-card danger"
                onClick={() => setUserMode("delete")}
              >
                <h3>Delete User</h3>
                <p>Remove a student account</p>
              </div>
            </div>
          )}

          {/* ================= ADD USERS BULK ================= */}
          {userMode === "add-user-bulk" && (
            <BulkUserUpload onClose={() => setUserMode("menu")} />
          )}
          {/* ================= ADD ================= */}
          {userMode === "add" && (
            <AddUserForm onClose={() => setUserMode("menu")} />
          )}
      
          {/* ================= EDIT ================= */}
          {userMode === "edit" && (
            <EditUserForm onClose={() => setUserMode("menu")} />
          )}
      
          {/* ================= VIEW ================= */}
          {userMode === "view" && (
            <ViewUserModal onClose={() => setUserMode("menu")} />
          )}
      
          {/* ================= DELETE ================= */}
          {userMode === "delete" && (
            <DeleteUserModal onClose={() => setUserMode("menu")} />
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
            
           <div className="tab-panel" style={{ textAlign: "center", padding: "30px" }}>
         
             
         
             {/* STEP 1: CATEGORY */}
             {!createExamCategory && (
               <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                 <button
                    className="dashboard-button"
                    onClick={() => setCreateExamCategory("selective")}
                  >
                    Selective Exam
                  </button>
                  
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamCategory("foundational")}
                  >
                    Foundational Exam
                  </button>
         
               </div>
             )}
         
             {/* STEP 2: SELECTIVE OPTIONS */}
             {createExamCategory === "selective" && !createExamType && (
               <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                 <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("thinking_skills")}
                  >
                    Thinking Skills
                  </button>
                  
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("mathematical_reasoning")}
                  >
                    Mathematical Reasoning
                  </button>
                  
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("reading")}
                  >
                    Reading
                  </button>
                  
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("writing")}
                  >
                    Writing
                  </button>
         
               </div>
             )}
         
             {/* STEP 2B: FOUNDATIONAL */}
             {createExamCategory === "foundational" && !createExamType && (
               <button
                 className="dashboard-button"
                 onClick={() => setCreateExamType("foundational")}
               >
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
               
                   {/* STEP 1: CATEGORY */}
                   {generateExamStep === "category" && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                       <button
                         className="dashboard-button"
                         onClick={() => {
                           setGenerateExamCategory("selective");
                           setGenerateExamStep("type");
                         }}
                       >
                         Selective Exam
                       </button>
               
                       <button
                         className="dashboard-button"
                         onClick={() => {
                           setGenerateExamCategory("foundational");
                           setGenerateExamStep("generate");
                         }}
                       >
                         Foundational Exam
                       </button>
                     </div>
                   )}
               
                   {/* STEP 2: SELECTIVE SUBJECT */}
                   {generateExamStep === "type" &&
                     generateExamCategory === "selective" && (
                       <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                         <button
                           className="dashboard-button"
                           onClick={() => {
                             setGenerateExamType("thinking_skills");
                             setGenerateExamStep("generate");
                           }}
                         >
                           Thinking Skills
                         </button>
               
                         <button
                           className="dashboard-button"
                           onClick={() => {
                             setGenerateExamType("mathematical_reasoning");
                             setGenerateExamStep("generate");
                           }}
                         >
                           Mathematical Reasoning
                         </button>
               
                         <button
                           className="dashboard-button"
                           onClick={() => {
                             setGenerateExamType("reading");
                             setGenerateExamStep("generate");
                           }}
                         >
                           Reading
                         </button>
               
                         <button
                           className="dashboard-button"
                           onClick={() => {
                             setGenerateExamType("writing");
                             setGenerateExamStep("generate");
                           }}
                         >
                           Writing
                         </button>
                       </div>
                     )}
               
                   {/* STEP 3: GENERATE */}
                   {generateExamStep === "generate" && (
                     <>
                       {generateExamCategory === "selective" &&
                         generateExamType === "thinking_skills" && (
                           <GenerateExam_thinking_skills />
                       )}
               
                       {generateExamCategory === "selective" &&
                         generateExamType === "mathematical_reasoning" && (
                           <GenerateExam examType="mathematical_reasoning" />
                       )}
               
                       {generateExamCategory === "selective" &&
                         generateExamType === "reading" && (
                           <GenerateExam_reading />
                       )}
               
                       {generateExamCategory === "selective" &&
                         generateExamType === "writing" && (
                           <GenerateExam_writing />
                       )}
               
                       {generateExamCategory === "foundational" && (
                         <GenerateExam_foundational />
                       )}
                     </>
                   )}
               
                 </div>
               )}
               {/* ===== STUDENT EXAM REPORTS ===== */}
               {activeTab === "student-exam-reports" && (
                 <div className="tab-panel">
                   <StudentExamReports />
                 </div>
               )}
               {/* ===== SELECTIVE READINESS (OVERALL) ===== */}
               {activeTab === "selective-readiness-overall" && (
                 <div className="tab-panel">
                   <SelectiveReadinessOverall />
                 </div>
               )}
               {/* ===== TOPIC REPORT (LIMITED) ===== */}
               {activeTab === "topic-report-limited" && (
                 <div className="tab-panel">
                   <StudentReportShell />
                 </div>
               )}
               {activeTab === "topic-report-limited-2" && (
                 <div className="tab-panel">
                   <StudentReportShell_backend />
                 </div>
               )}





    </div>
  </div>
);
}
export default AdminPanel;

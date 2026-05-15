  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import DeleteUserExamAttempt from "./DeleteUserExamAttempt"; 
  
  import StudentExamReports from "./StudentExamReports";
  import SelectiveReadinessOverall from "./SelectiveReadinessOverall";
  import StudentReportShell from "./StudentReportShell";
  import BulkUserUpload from "./BulkUserUpload";
  import StudentReportShell_backend from "./StudentReportShell_backend";
  import ExamSelector from "./ExamSelector";
  import UploadWordNaplanLanguageConventions from "./UploadWordNaplanLanguageConventions";
  import UploadWordNaplanNumeracy from "./UploadWordNaplanNumeracy";
  import UploadWordNaplanReading from "./UploadWordNaplanReading";
  
  import QuizSetup_naplan from "./QuizSetup_naplan";
  import GenerateExam_naplan_numeracy from "./GenerateExam_naplan_numeracy";
  import GenerateExam_oc_mathematical_reasoning from "./GenerateExam_oc_mathematical_reasoning";
  
  import GenerateExam_naplan_language_conventions from "./GenerateExam_naplan_language_conventions";
  import QuizSetup_naplan_reading from "./QuizSetup_naplan_reading";
  import GenerateExam_naplan_reading from "./GenerateExam_naplan_reading";
  
  
  import QuizSetup_naplan_language_conventions from "./QuizSetup_naplan_language_conventions";
  import QuizSetup_OC_MathematicalReasoning from "./QuizSetup_OC_MathematicalReasoning";
  import QuizSetup_oc_reading from "./QuizSetup_oc_reading";
  import GenerateExam_oc_reading from "./GenerateExam_oc_reading";
  import GenerateExam_naplan_writing from "./GenerateExam_naplan_writing";
  import CenterManagement from "./CenterManagement";
     
  
  
  
  
  
  
  
  
  
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
  import GenerateExam_oc_thinking_skills from "./GenerateExam_oc_thinking_skills";
  
  
  
  
  /* ============================
    Quiz Setup
  ============================ */
  import QuizSetup from "./QuizSetup";
  import QuizSetupOCThinkingSkills from "./QuizSetupOCThinkingSkills";
  
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
  

  const AdminPanel = ({
    userType,
    centerCode
  }) => {
    console.log("User Type:", userType);
    const navigate = useNavigate();
  
    /* ============================
      Tabs
    ============================ */
    

    const [activeTab, setActiveTab] = useState(

      userType === "SUPER_ADMIN"
        ? "center-management"
        : "database"

    );
  
    /* ============================
      User Modals
    ============================ */
    const [userMode, setUserMode] = useState("menu");
    
    const [generateExamStep, setGenerateExamStep] = useState("category"); 
    const [generateMode, setGenerateMode] = useState(null);
  
    const [createExamCategory, setCreateExamCategory] = useState(null);
    const [generateExamCategory, setGenerateExamCategory] = useState(null);
    
    const [createExamType, setCreateExamType] = useState(null);
    const [generateExamType, setGenerateExamType] = useState(null);
    const [centerId, setCenterId] = useState("");
    const [centerName, setCenterName] = useState("");
  
    /* ============================
      Exam Flow State
    ============================ */
    
    /* ============================
      State Reset Logic (FIXED)
    ============================ */
    
    useEffect(() => {
      if (activeTab !== "database") {
        setUserMode("menu");
      }
    }, [activeTab]);
  
    useEffect(() => {
    if (activeTab === "add-quiz") {
      setCreateExamCategory(null);
      setCreateExamType(null);
    }
  
    if (activeTab === "generate-exam") {
      setGenerateExamCategory(null);
      setGenerateExamType(null);
      setGenerateExamStep("category");
      setGenerateMode(null);
    }
  }, [activeTab]);
  
  
  
    /* ============================
   Tabs Config
============================ */

const allTabs = [

  {
    id: "database",
    label: "Exam Module User Management",
  },

  {
    id: "center-management",
    label: "Center Management",
  },

  {
    id: "exam-type-selector",
    label: "Upload Questions Word Document",
  },

  {
    id: "upload-image-folder",
    label: "Exam Image Folder",
  },

  {
    id: "add-quiz",
    label: "Create Exam",
  },

  {
    id: "generate-exam",
    label: "Generate Exam",
  },

  {
    id: "student-exam-reports",
    label: "Student Exam Reports",
  },

  {
    id: "topic-report-limited-2",
    label: "Topic Report",
  },

  {
    id: "selective-readiness-overall",
    label: "Selective Readiness (Overall)",
  },

];

/* ============================
   Role-Based Tabs
============================ */

const tabs = allTabs.filter((tab) => {

  // =========================
  // SUPER ADMIN
  // =========================

  if (userType === "SUPER_ADMIN") {

    return [

      "center-management",

      "exam-type-selector",

      "upload-image-folder",

      "add-quiz",

    ].includes(tab.id);

  }

  // =========================
  // CENTER ADMIN
  // =========================

  if (userType === "CENTER_ADMIN") {

    return [

      "database",

      "add-quiz",

      "generate-exam",

      "student-exam-reports",

      "topic-report-limited-2",

      "selective-readiness-overall",

    ].includes(tab.id);

  }

  return false;

});  
  
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
                <div
                  className="action-card danger"
                  onClick={() => setUserMode("delete-exam-attempt")}
                >
                  <h3>Delete User Exam Attempt</h3>
                  <p>Remove a student's exam attempt</p>
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
            {userMode === "delete-exam-attempt" && (
            <DeleteUserExamAttempt onClose={() => setUserMode("menu")} />
          )}
        
          </div>
        )}
        {activeTab === "center-management" && (
          <CenterManagement />
        )}
  
        {/* ===== UPLOAD WORD QUESTIONS ===== 
        {activeTab === "exam-type-selector" && (
          <div className="tab-panel">
            <ExamTypeSelector
              examType={createExamType}
              onSelect={setCreateExamType}
            />
          </div>
        )} 
        */}
        {/* ===== UPLOAD WORD QUESTIONS ===== */}
        {activeTab === "exam-type-selector" && (
          <div className="tab-panel">
            <ExamSelector
              examType={createExamType}
              onSelect={setCreateExamType}
            />
        
            {/* ---------- NAPLAN UPLOADS ONLY ---------- */}
            {createExamType === "naplan_numeracy" && (
              <UploadWordNaplanNumeracy />
            )}
        
            {createExamType === "naplan_language_conventions" && (
              <UploadWordNaplanLanguageConventions />
            )}
            {createExamType === "naplan_reading" && (
              <UploadWordNaplanReading />
            )}
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
                      onClick={() => setCreateExamCategory("oc")}
                    >
                      OC Exam
                    </button>
                
                    <button
                      className="dashboard-button"
                      onClick={() => setCreateExamCategory("foundational")}
                    >
                      Foundational Exam
                    </button>
                
                    <button
                      className="dashboard-button"
                      onClick={() => setCreateExamCategory("naplan")}
                    >
                      NAPLAN
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
              {createExamCategory === "oc" && !createExamType && (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("oc_thinking_skills")}
                  >
                    Thinking Skills
                  </button>
              
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("oc_mathematical_reasoning")}
                  >
                    Mathematical Reasoning
                  </button>
                  <button
                  className="dashboard-button"
                  onClick={() => setCreateExamType("oc_reading")}
                >
                  Reading
                </button>
                </div>
              )}
              
              {createExamCategory === "naplan" && !createExamType && (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("naplan_numeracy")}
                  >
                    Numeracy
                  </button>
              
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("naplan_language_conventions")}
                  >
                    Language Conventions
                  </button>
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("naplan_reading")}
                  >
                    Reading
                  </button>
                  
              
                  <button
                    className="dashboard-button"
                    onClick={() => setCreateExamType("naplan_writing")}
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
              {createExamType === "thinking_skills" && (
                <QuizSetup
                  userType={userType}
                  centerCode={centerCode}
                />
              )}
              {createExamType === "oc_thinking_skills" && (
                <QuizSetupOCThinkingSkills
                  userType={userType}
                  centerCode={centerCode}
                />
                )}
              {createExamType === "oc_mathematical_reasoning" && (
                <QuizSetup_OC_MathematicalReasoning
                  userType={userType}
                  centerCode={centerCode}
                />
              )}
              {createExamType === "oc_reading" && (
                <QuizSetup_oc_reading
                  userType={userType}
                  centerCode={centerCode}
                />
              )}
              {createExamType === "mathematical_reasoning" && (
                <QuizSetup_MathematicalReasoning
                  userType={userType}
                  centerCode={centerCode}
                />
              )}
              
              {createExamType === "foundational" && <QuizSetup_foundational />}
              {createExamType === "reading" && (
                <QuizSetup_reading
                  userType={userType}
                  centerCode={centerCode}
                />
              )}
              {createExamType === "writing" && <QuizSetup_writing />}
              {createExamCategory === "naplan" &&
              createExamType === "naplan_numeracy" && (
                <QuizSetup_naplan examType="naplan_numeracy" />
              )}
              
              {createExamCategory === "naplan" &&
              createExamType === "naplan_language_conventions" && (
                <QuizSetup_naplan_language_conventions />
              )}        
              {createExamCategory === "naplan" &&
              createExamType === "naplan_reading" && (
                <QuizSetup_naplan_reading examType="naplan_reading" />
              )}
              
              
          
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
                              setGenerateExamCategory("oc");
                              setGenerateExamStep("type");
                            }}
                          >
                            OC Exam
                          </button>
                
                        <button
                          className="dashboard-button"
                          onClick={() => {
                            setGenerateExamCategory("foundational");
                            setGenerateExamStep("mode");
                          }}
                        >
                          Foundational Exam
                        </button>
                        {/* ✅ NEW: NAPLAN */}
                        <button
                          className="dashboard-button"
                          onClick={() => {
                            setGenerateExamCategory("naplan");
                            setGenerateExamStep("type");
                          }}
                        >
                          NAPLAN
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
                              setGenerateExamStep("mode");
                            }}
                          >
                            Thinking Skills
                          </button>
                
                          <button
                            className="dashboard-button"
                            onClick={() => {
                              setGenerateExamType("mathematical_reasoning");
                              setGenerateExamStep("mode");
                            }}
                          >
                            Mathematical Reasoning
                          </button>
                
                          <button
                            className="dashboard-button"
                            onClick={() => {
                              setGenerateExamType("reading");
                              setGenerateExamStep("mode");
                            }}
                          >
                            Reading
                          </button>
                
                          <button
                            className="dashboard-button"
                            onClick={() => {
                              setGenerateExamType("writing");
                              setGenerateExamStep("mode");
                            }}
                          >
                            Writing
                          </button>
                        </div>
                      )}
                    {generateExamStep === "type" &&
                        generateExamCategory === "oc" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                          <button
                            className="dashboard-button"
                            onClick={() => {
                              setGenerateExamType("oc_thinking_skills");
                              setGenerateExamStep("mode");
                            }}
                          >
                            Thinking Skills
                          </button>
                          <button
                            className="dashboard-button"
                            onClick={() => {
                              setGenerateExamType("oc_mathematical_reasoning");
                              setGenerateExamStep("mode");
                            }}
                          >
                            Mathematical Reasoning
                          </button>
                          <button
                            className="dashboard-button"
                            onClick={() => {
                              setGenerateExamType("oc_reading");
                              setGenerateExamStep("mode");
                            }}
                          >
                            Reading
                          </button>
                        </div>
                      )}
                    {generateExamStep === "type" &&
                    generateExamCategory === "naplan" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <button
                          className="dashboard-button"
                          onClick={() => {
                            setGenerateExamType("naplan_numeracy");
                            setGenerateExamStep("mode");
                          }}
                        >
                          Numeracy
                        </button>
                    
                        <button
                          className="dashboard-button"
                          onClick={() => {
                            setGenerateExamType("naplan_language_conventions");
                            setGenerateExamStep("mode");
                          }}
                        >
                          Language Conventions
                        </button>
                    
                        <button
                          className="dashboard-button"
                          onClick={() => {
                            setGenerateExamType("naplan_reading");
                            setGenerateExamStep("mode");
                          }}
                        >
                          Reading
                        </button>
                    
                        <button
                          className="dashboard-button"
                          onClick={() => {
                            setGenerateExamType("naplan_writing");
                            setGenerateExamStep("mode");
                          }}
                        >
                          Writing
                        </button>
                      </div>
                    )}
                    {generateExamStep === "mode" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        
                        <button
                          className="dashboard-button"
                          onClick={() => {
                            setGenerateMode("random");
                            setGenerateExamStep("generate");
                          }}
                        >
                          Generate Exam
                        </button>

                        <button
                          className="dashboard-button"
                          onClick={() => {
                            setGenerateMode("latest");
                            setGenerateExamStep("generate");
                          }}
                        >
                          Generate Exam from Latest Questions
                        </button>

                      </div>
                    )}
  
                    {/* STEP 3: GENERATE */}
                    {generateExamStep === "generate" && (
                      <>
                        
                
                        {generateExamCategory === "selective" &&
                          generateExamType === "thinking_skills" && (
                            <GenerateExam_thinking_skills
                              mode={generateMode}
                              centerCode={centerCode}
                            />
                        )}

                        {generateExamCategory === "selective" &&
                          generateExamType === "mathematical_reasoning" && (
                            <GenerateExam
                              examType="mathematical_reasoning"
                              mode={generateMode}
                              centerCode={centerCode}
                            />
                        )}

                        {generateExamCategory === "selective" &&
                          generateExamType === "reading" && (
                            <GenerateExam_reading
                              mode={generateMode}
                              centerCode={centerCode}
                            />
                        )}

                        {generateExamCategory === "selective" &&
                        generateExamType === "writing" && (
                          <GenerateExam_writing mode={generateMode} />
                        )}

                        {generateExamCategory === "oc" &&
                          generateExamType === "oc_thinking_skills" && (
                            <GenerateExam_oc_thinking_skills
                              mode={generateMode}
                              centerCode={centerCode}
                            />
                        )}

                        {generateExamCategory === "oc" &&
                        generateExamType === "oc_mathematical_reasoning" && (
                          <GenerateExam_oc_mathematical_reasoning
                            examType="oc_mathematical_reasoning"
                            mode={generateMode}
                            centerCode={centerCode}
                          />
                        )}

                        {generateExamCategory === "oc" &&
                        generateExamType === "oc_reading" && (
                          <GenerateExam_oc_reading
                           mode={generateMode}
                           centerCode={centerCode}                           
                           />
                        )}

                        {generateExamCategory === "foundational" && (
                          <GenerateExam_foundational mode={generateMode} />
                        )}

                        {generateExamCategory === "naplan" &&
                        generateExamType === "naplan_numeracy" && (
                          <GenerateExam_naplan_numeracy mode={generateMode} />
                        )}

                        {generateExamCategory === "naplan" &&
                        generateExamType === "naplan_language_conventions" && (
                          <GenerateExam_naplan_language_conventions mode={generateMode} />
                        )}

                        {generateExamCategory === "naplan" &&
                        generateExamType === "naplan_reading" && (
                          <GenerateExam_naplan_reading mode={generateMode} />
                        )}
                        {generateExamCategory === "naplan" &&
                        generateExamType === "naplan_writing" && (
                          <GenerateExam_naplan_writing mode={generateMode} />
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

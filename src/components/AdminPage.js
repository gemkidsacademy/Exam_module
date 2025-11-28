import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";
import ViewUserModal from "./ViewUserModal";
import DeleteUserForm from "./DeleteUserForm";
import QuizSetup from "./QuizSetup";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("database");
  const navigate = useNavigate();

  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);

  const tabs = [
    { id: "database", label: "Exam Module User Management" },
    { id: "add-quiz", label: "Add Quiz" },
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

  const handleQuizAdded = () => {
    setShowAddQuiz(false);
    alert("Quiz added successfully!");
  };

  // Toggle functions
  const toggleAddUser = () => setShowAddUser((prev) => !prev);
  const toggleEditUser = () => setShowEditUser((prev) => !prev);
  const toggleViewUser = () => setShowViewUser((prev) => !prev);
  const toggleDeleteUser = () => setShowDeleteUser((prev) => !prev);
  const toggleAddQuiz = () => setShowAddQuiz((prev) => !prev);

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
              {showViewUser && <ViewUserModal onClose={() => setShowViewUser(false)} />}
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
          <div className="tab-panel">
            <div>
              <button className="dashboard-button" onClick={toggleAddQuiz}>
                Add Quiz
              </button>
              {showAddQuiz && (
                <QuizSetup
                  onClose={() => setShowAddQuiz(false)}
                  onQuizAdded={handleQuizAdded}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

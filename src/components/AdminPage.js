import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";
import PdfUploader from "./PdfUploader";
import ChatbotSettings from "./ChatbotSettings";
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";
import ViewUserModal from "./ViewUserModal";
import DeleteUserForm from "./DeleteUserForm";
import UsageDashboard from "./UsageDashboard";









const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("database");
  const navigate = useNavigate(); // For navigation
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);

  
  const tabs = [
    { id: "database", label: "Chatbot User Management" },
    { id: "AI_tutor", label: "Add PDF for AI Tutor" },
    { id: "openai", label: "View OpenAI Usage" },
    { id: "Generic_chatbot", label: "Generic Chatbot Settings" },
  ];

  const handleUserUpdated = () => {
    setShowEditUser(false);
    alert("User updated successfully!");
    // optionally refresh the user list
  };
  const handleUserAdded = () => {
    setShowAddUser(false); // close the modal
    alert("User added successfully!");
    // Optionally refresh your user list here
  };
  // Navigate to Usage Dashboard
  const handleViewUsage = () => {
    navigate("/usage-dashboard");
  };
  const handleDeleteUser = () => {
    navigate("/delete-user");
  };
  const handleUserDeleted = () => {
    // Optional: refetch users, show notification, or just log
    console.log("User deleted successfully");
  };

  const handleChatbotSetting = () => {
    navigate("/chatbot-settings");
  };


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* -------------------- Tab Navigation -------------------- */}
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

      {/* -------------------- Tab Content -------------------- */}
      <div className="tab-content">
        {/* Database (User Management) */}
        {activeTab === "database" && (
          <div className="tab-panel">
            <div>
              <button className="dashboard-button" onClick={() => setShowAddUser(true)}>
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
              <button className="dashboard-button" onClick={() => setShowEditUser(true)}>
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
              <button className="dashboard-button" onClick={() => setShowViewUser(true)}>
                View User
              </button>
            
              {showViewUser && (
                <ViewUserModal
                  onClose={() => setShowViewUser(false)}
                />
              )}
            </div>

            <div>
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

          </div>
        )}

        {/* AI Tutor (PDF Upload) */}
        {activeTab === "AI_tutor" && (
          <div className="tab-panel">
            <PdfUploader />
          </div>
        )}
        {/* Generic Chatbot) */}
        {activeTab === "Generic_chatbot" && (
          <div
            className="tab-panel"
            style={{
              height: "100vh", // or a specific height
              overflowY: "auto",
            }}
          >
            <ChatbotSettings />
          </div>
        )}
        

        {/* OpenAI Usage */}
        {activeTab === "openai" && (
          <div
            className="tab-panel"
            style={{
              height: "100vh", // or a specific height
              overflowY: "auto",
            }}
          >
            <UsageDashboard />
          </div>
        )}

        
        
      </div>
    </div>
  );
};

export default AdminPanel;

import React, { useState, useEffect } from "react";
import "./ChatbotSettings.css";

const ChatbotSettings = () => {
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [status, setStatus] = useState("");

  // Optional: fetch existing knowledge base when page loads
  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      try {
        const response = await fetch("https://krishbackend-production.up.railway.app/api/knowledge-base");
        if (response.ok) {
          const data = await response.json();
          setKnowledgeBase(data.knowledge_base || "");
        } else {
          console.error("Failed to fetch current knowledge base");
        }
      } catch (err) {
        console.error("Error fetching knowledge base:", err);
      }
    };

    fetchKnowledgeBase();
  }, []);

  const handleUpdate = async () => {
    if (!knowledgeBase.trim()) {
      setStatus("Knowledge base text cannot be empty.");
      return;
    }

    try {
      setStatus("Updating knowledge base...");
      const response = await fetch("https://krishbackend-production.up.railway.app/api/update-knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knowledge_base: knowledgeBase }),
      });

      if (response.ok) {
        setStatus("✅ Knowledge base updated successfully.");
      } else {
        setStatus("❌ Failed to update knowledge base.");
      }
    } catch (err) {
      console.error("Error updating knowledge base:", err);
      setStatus("⚠️ Error occurred while updating.");
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Generic Chatbot Knowledge Base</h2>
      <p className="settings-description">
        Update the chatbot’s internal knowledge base. This text will influence how it answers general questions.
      </p>

      <textarea
        className="knowledge-textarea"
        rows="12"
        placeholder="Enter chatbot knowledge base text here..."
        value={knowledgeBase}
        onChange={(e) => setKnowledgeBase(e.target.value)}
      ></textarea>

      <button className="save-button" onClick={handleUpdate}>
        Update Model Knowledge Base
      </button>

      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default ChatbotSettings;

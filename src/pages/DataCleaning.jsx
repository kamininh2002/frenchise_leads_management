import React from "react";
import { useState, useEffect } from "react";
import "./DataCleaning.css";

const DataCleaning = ({ setActivePage, setActiveTab }) => {
  const [activeCleaningTab, setActiveCleaningTab] = useState("all");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusLabels = {
    "needs-verification": "Needs Verification",
    "contacted": "Contacted",
    "follow-up": "Follow-up",
    "new": "New",
    "pending": "Pending",
    "verified": "Verified",
    "invalid-data": "Invalid Data"
  };

  // Fetch leads when component mounts or filter changes
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        // Update status filter based on the active tab
        const filter = activeCleaningTab !== "all" ? activeCleaningTab : "all";
        setStatusFilter(filter);
        
        const response = await fetch(
          `http://localhost:5000/api/cleaning?status=${filter}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
        alert("Failed to load leads. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [activeCleaningTab]);

  // Apply search filter to leads
  const filteredLeads = leads.filter(lead =>
    (lead.name_of_lead || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.email_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.contact_number || "").includes(searchTerm)
  );

  const updateCleaningStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cleaning/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update cleaning status");
      }
  
      // Update locally
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === id ? { ...lead, status: newStatus } : lead
        )
      );
  
      alert(`Status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating cleaning status:", error);
      alert("Failed to update status.");
    }
  };

  const handleEmailVerification = (lead) => {
    // You could pass the lead ID to the email verification page if needed
    setActivePage("email-verification");
  };

  const handleBulkVerification = () => {
    setActivePage("bulk-verification");
  };

  return (
    <div className="data-cleaning-page">
      <div className="page-header">
        <div className="breadcrumb">
          <a href="#" onClick={() => setActivePage("dashboard")}>
            Dashboard
          </a>
          <span>›</span>
          <span className="active">Data Cleaning</span>
        </div>

        <h2 className="page-title">Data Cleaning</h2>
        <p className="page-description">Verify and clean lead data to ensure accuracy</p>
      </div>

      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>

        <button className="btn btn-secondary" onClick={() => setActivePage("leads-management")}>
          Back to Leads
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${activeCleaningTab === "all" ? "active" : ""}`} onClick={() => setActiveCleaningTab("all")}>All Leads</button>
        <button className={`tab ${activeCleaningTab === "needs-verification" ? "active" : ""}`} onClick={() => setActiveCleaningTab("needs-verification")}>Needs Verification</button>
        <button className={`tab ${activeCleaningTab === "verified" ? "active" : ""}`} onClick={() => setActiveCleaningTab("verified")}>Verified</button>
        <button className={`tab ${activeCleaningTab === "invalid-data" ? "active" : ""}`} onClick={() => setActiveCleaningTab("invalid-data")}>Invalid Data</button>
      </div>

      <div className="leads-header">
        <div className="leads-count">
          <span>{filteredLeads.length} {activeCleaningTab !== "all" ? statusLabels[activeCleaningTab] || "Leads" : "Leads"}</span>
        </div>

        <div className="leads-actions">
          <button className="btn btn-primary" onClick={handleBulkVerification}>Bulk Verify</button>
          <button className="btn btn-secondary">Export List</button>
        </div>
      </div>

      <div className="leads-table-container">
        {loading ? (
          <p>Loading leads...</p>
        ) : (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Contact Information</th>
                <th>Type</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="lead-user">
                      <i className="fas fa-user"></i>
                      <span>{lead.name_of_lead || "Unknown"}</span>
                    </td>
                    <td className="lead-contact">
                      {lead.email_id || "No email"} <br /> {lead.contact_number || "No phone"}
                    </td>
                    <td className="lead-interest">{lead.leadType || "Unknown"}</td>
                    <td className="lead-status">{lead.status || "Pending"}</td>
                    <td className="lead-issue">{lead.notes || "N/A"}</td>
                    <td className="lead-actions">
                      <button className="action-btn" onClick={() => handleEmailVerification(lead)} title="Verify Email">
                        <i className="fas fa-check-circle"></i>
                      </button>
                      <button 
                        className="action-btn" 
                        onClick={() => updateCleaningStatus(lead.id, "Needs-Verification")}
                        title="Mark for Verification"
                      >
                        <i className="fas fa-exclamation-circle"></i>
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => updateCleaningStatus(lead.id, "Invalid-Data")}
                        title="Mark as Invalid"  
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-leads-message">No matching leads found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <h3 className="section-title">Data Verification Tools</h3>
      <div className="tools-grid">
        <div className="tool-card" onClick={handleEmailVerification}>
          <div className="tool-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="tool-content">
            <h4>Email Verification</h4>
            <p>Verify email addresses for deliverability and format.</p>
          </div>
          <button className="tool-action">Run Check</button>
        </div>

        <div className="tool-card">
          <div className="tool-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="tool-content">
            <h4>Phone Validation</h4>
            <p>Validate phone numbers for format and connectivity.</p>
          </div>
          <button className="tool-action">Validate</button>
        </div>

        <div className="tool-card">
          <div className="tool-icon">
            <i className="fas fa-clone"></i>
          </div>
          <div className="tool-content">
            <h4>Duplicate Detection</h4>
            <p>Find and merge duplicate lead records in the system.</p>
          </div>
          <button className="tool-action">Find Duplicates</button>
        </div>

        <div className="tool-card">
          <div className="tool-icon">
            <i className="fas fa-database"></i>
          </div>
          <div className="tool-content">
            <h4>Data Enrichment</h4>
            <p>Add missing information from external data sources.</p>
          </div>
          <button className="tool-action">Enrich Data</button>
        </div>
      </div>

      <h3 className="section-title">Recent Verification Activity</h3>
      <div className="activity-list">
        <div className="activity-item">
          <div className="activity-icon"><i className="fas fa-envelope"></i></div>
          <div className="activity-content">
            <h4>Email Verification Batch</h4>
            <p>25 leads processed • 3 issues found • 1 hour ago</p>
          </div>
          <button className="activity-action"><i className="fas fa-eye"></i></button>
        </div>

        <div className="activity-item">
          <div className="activity-icon"><i className="fas fa-clone"></i></div>
          <div className="activity-content">
            <h4>Duplicate Detection Run</h4>
            <p>4 potential duplicates found • 3 hours ago</p>
          </div>
          <button className="activity-action"><i className="fas fa-eye"></i></button>
        </div>

        <div className="activity-item">
          <div className="activity-icon"><i className="fas fa-phone"></i></div>
          <div className="activity-content">
            <h4>Phone Number Validation</h4>
            <p>18 leads processed • 2 invalid numbers • 1 day ago</p>
          </div>
          <button className="activity-action"><i className="fas fa-eye"></i></button>
        </div>
      </div>
    </div>
  );
};

export default DataCleaning;
"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import "./LeadsManagement.css";
import DataCleaning from "./DataCleaning"; // Import your DataCleaning component
import Filter from "./Filter"; // Import your Filter component

const API_URL = "http://localhost:5000/api/leads";




// Lead Card Component
const LeadCard = ({ lead, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...lead });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setFormData({ ...lead }); // Reset form to original lead data
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    try {
      // Make sure you're using the correct endpoint 
      // Your API_URL is defined as "http://localhost:5000/api/leads"
      // So we need to remove the duplicate "/api" part
      await axios.put(`http://localhost:5000/api/leads/${lead.id}`, formData);
      alert("Lead updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead");
    }
  };

  const fields = [
    { label: "Name", name: "name_of_lead" },
    { label: "Email", name: "email_id" },
    { label: "Phone", name: "contact_number" },
    { label: "City", name: "city" },
    { label: "State", name: "state" },
    { label: "Lead Status", name: "status" },
    { label: "Lead Type", name: "lead_type" },
    { label: "Source", name: "source" },
    { label: "Revenue Amount", name: "revenue_amount", type: "number" },
    { label: "Update Status", name: "lead_update_status" },
    { label: "Franchise Developer", name: "franchise_developer_name" },
    { label: "Date Of The Campaign", name: "date_of_campaign", type: "date" },
    { label: "Month", name: "month" },
    { label: "Financial Year", name: "financial_year" },
    { label: "Notes", name: "notes" },
    { label: "Team Leader Assigned", name: "team_leader_assign" },
    { label: "Remark", name: "remark" }
  ];

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Lead Details</h2>

        {fields.map(field => (
          <p key={field.name}>
            <strong>{field.label}:</strong>{" "}
            {isEditing ? (
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                style={{ width: "100%", padding: "5px", marginTop: "4px" }}
              />
            ) : (
              formData[field.name]
            )}
          </p>
        ))}

        <div style={{ marginTop: "1rem" }}>
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSaveClick}>💾 Save</button>
              <button className="cancel-btn" onClick={handleCancelClick} style={{ marginLeft: "10px" }}>
                ❌ Cancel
              </button>
            </>
          ) : (
            <button className="edit-btn" onClick={handleEditClick}>✏️ Edit</button>
          )}
        </div>
      </div>
    </div>
  );
};
const LeadsManagement = () => {
  // Add state to track active page
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activePage, setActivePage] = useState("leads-management");
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [leadTypeFilter, setLeadTypeFilter] = useState("");
    const [leadSourceFilter, setLeadSourceFilter] = useState("");
    const [leadUpdateStatusFilter, setLeadUpdateStatusFilter] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [leads, setLeads] = useState([]);
    const [leadCount, setLeadCount] = useState(0);
    const [filteredLeadCount, setFilteredLeadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("Checking...");
    const [selectedLead, setSelectedLead] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [showLeadCard, setShowLeadCard] = useState(false);
  // Add dropdown state
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceInput, setNewSourceInput] = useState("");
  
  
  // Add notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Lead type options
  const leadTypeOptions = [
    "In Progress",
    "On Hold",
    "Prospect",
    "Cancelled",
    "Closed",
    "Meeting",
    "Webinar",
    "Ringing"
  ];
 


  // Lead source options 
  const leadSourceOptions = [
    "Website",
    "Exhibition",
    "Referral",
    "Social Media"
  ];


  const leadUpdateStatusOptions = [
    "Updated", 
    "Not Updated"
  ];

  
  const [newSource, setNewSource] = useState("");
  const [customSources, setCustomSources] = useState([]);

  // Test database connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        setConnectionStatus("Checking...");
        const response = await fetch('http://localhost:5000/api/test-connection');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setConnectionStatus(data.connected ? "Connected" : "Failed to connect");
      } catch (error) {
        console.error("Connection test error:", error);
        setConnectionStatus("Failed to connect");
      }
    };

    testConnection();
  }, []);

  // Handle notification timeout
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Check if any filter is active
  useEffect(() => {
    const hasActiveFilters = searchQuery || locationQuery || leadTypeFilter || leadSourceFilter || leadUpdateStatusFilter;
    setIsFiltering(hasActiveFilters);
    if (hasActiveFilters && activeTab === "all") {
      setActiveTab("filtered");
    }
  }, [searchQuery, locationQuery, leadTypeFilter, leadSourceFilter, leadUpdateStatusFilter, activeTab]);


  // Fetch leads based on current tab and filters
  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        
        // Always apply filters if they exist, regardless of tab
        if (searchQuery) params.append("search", searchQuery);
        if (locationQuery) params.append("location", locationQuery);
        if (leadTypeFilter) params.append("leadType", leadTypeFilter);
        if (leadSourceFilter) params.append("source", leadSourceFilter);
        if (leadUpdateStatusFilter) params.append("leadsUpdateStatus", leadUpdateStatusFilter);
        
        console.log("Filter params:", Object.fromEntries(params));
        
        const url = `${API_URL}?${params.toString()}`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Received data:", data.length, "records");
        setLeads(data);
        setFilteredLeadCount(data.length);
      } catch (error) {
        console.error("Error fetching leads:", error);
        setLeads([]);
        setFilteredLeadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [activeTab, searchQuery, locationQuery, leadTypeFilter, leadSourceFilter, leadUpdateStatusFilter]);

  // Fetch lead counts
  useEffect(() => {
    const fetchLeadCounts = async () => {
      try {
        const countUrl = `${API_URL}/count`;
        const allCountResponse = await fetch(countUrl);
        
        if (!allCountResponse.ok) {
          throw new Error(`HTTP error! Status: ${allCountResponse.status}`);
        }
        
        const allCountData = await allCountResponse.json();
        setLeadCount(allCountData.count);

        if (isFiltering) {
          setFilteredLeadCount(leads.length);
        } else {
          setFilteredLeadCount(0);
        }
      } catch (error) {
        console.error("Error fetching lead counts:", error);
        setLeadCount(0);
      }
    };

    fetchLeadCounts();
  }, [isFiltering, leads.length]);

  // Show notification
  const displayNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
  };

  // Switch to All Leads view and clear filters
  const viewAllLeads = () => {
    setActiveTab("all");
    clearAllFilters();
  };

  // Switch to Filtered Leads view
  const viewFilteredLeads = () => {
    setActiveTab("filtered");
  };

  // Add new custom source
  const addCustomSource = () => {
    if (newSource && !customSources.includes(newSource) && !leadSourceOptions.includes(newSource)) {
      setCustomSources([...customSources, newSource]);
      setNewSource("");
      alert(`New source "${newSource}" added!`);
    }
  };
  
  // New function to add source from dropdown
  const handleAddSourceFromDropdown = () => {
    if (newSourceInput && !customSources.includes(newSourceInput) && !leadSourceOptions.includes(newSourceInput)) {
      setCustomSources([...customSources, newSourceInput]);
      const addedSource = newSourceInput;
      setNewSourceInput("");
      setIsAddingSource(false);
      displayNotification(`New source "${addedSource}" added!`);
    } else {
      setIsAddingSource(false);
    }
  };
  
  // Handle keypress event for the new source input
  const handleNewSourceKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSourceFromDropdown();
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setLeadTypeFilter("");
    setLeadSourceFilter("");
    setLeadUpdateStatusFilter("");
    setActiveTab("all");
  };
  
  // Navigate to Filter page
  const openFilterPage = () => {
    setActivePage("filter");
  };
  
  // Navigate to Data Cleaning page
  const openDataCleaningPage = () => {
    setActivePage("data-cleaning");
  };
  
  // Navigate back to Leads Management
  const backToLeads = () => {
    setActivePage("leads-management");
  };

  // Handle opening lead card
  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowLeadCard(true);
  };

  // Handle closing lead card
  const handleCloseLeadCard = () => {
    setShowLeadCard(false);
    setSelectedLead(null);
  };
  
  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setEditFormData(lead);
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch(`${API_URL}/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update the leads array with the modified lead
      setLeads(
        leads.map((lead) => (lead.id === selectedLead.id ? editFormData : lead))
      );

      setIsEditModalOpen(false);
      displayNotification("Lead updated successfully!");
    } catch (error) {
      console.error("Error updating lead:", error);
      displayNotification("Failed to update lead.");
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  // Render Loading or Leads Table
  const renderLeadsTable = () => {
    if (isLoading) {
      return <div className="loading-indicator">Loading leads...</div>;
    }

    return (
      <table className="leads-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Location</th>
            <th>Status</th>
            <th>Update Status</th>  
            <th>Revenue</th>
            <th>Source</th>
            <th>Frenchise Developer's Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.length > 0 ? (
            leads.map(lead => (
              <tr key={lead.id}>
                <td>{lead.name_of_lead}</td>
                <td>
                  <div>{lead.email_id}</div>
                  <div>{lead.contact_number}</div>
                </td>

                <td>
                  <div>{lead.city}</div>
                  <div>{lead.state}</div>
                </td>

                <td className={`status-${lead.status?.toLowerCase().replace(' ', '-')}`}>
                  {lead.status}
                </td>

                <td>{lead.lead_update_status}</td>

                <td>${lead.revenue_amount?.toFixed(2)}</td>

                <td>{lead.source}</td>
                
                <td>{lead.franchise_developer_name}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewLead(lead)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                   
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" className="no-leads">No leads found</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  // Render different pages based on activePage state
  if (activePage === "filter") {
    return <Filter onBack={backToLeads} />;
  }
  
  if (activePage === "data-cleaning") {
    return <DataCleaning onBack={backToLeads} />;
  }

  return (
    <div className="leads-management-page">
      {/* Notification popup */}
      {showNotification && (
        <div className="notification-popup">
          <div className="notification-content">
            <i className="fas fa-check-circle"></i>
            <span>{notificationMessage}</span>
          </div>
        </div>
      )}

      {/* Lead Card Popup */}
      {showLeadCard && selectedLead && (
        <LeadCard lead={selectedLead} onClose={handleCloseLeadCard} />
      )}
      
      <div className="page-header">
        <div className="breadcrumb">
          <span className="active">Lead Management</span>
          <span className="connection-status">Database: {connectionStatus}</span>
        </div>

        <div className="header-actions">
          {/* General Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>

          {/* Location Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by City or State..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <i className="fas fa-map-marker-alt"></i>
          </div>

          {/* Lead Type Dropdown */}
          <div className="filter-dropdown">
            <select
              className="btn btn-secondary"
              value={leadTypeFilter}
              onChange={(e) => setLeadTypeFilter(e.target.value)}
            >
              <option value="">Select Lead Status</option>
              {leadTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <select
              className="btn btn-secondary"
              value={leadUpdateStatusFilter}
              onChange={(e) => setLeadUpdateStatusFilter(e.target.value)}
            >
              <option value="">Select Update Status</option>
              {leadUpdateStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Lead Source Dropdown with Add New Option */}
          <div className="filter-dropdown source-dropdown">
            <select
              className="btn btn-secondary"
              value={leadSourceFilter}
              onChange={(e) => {
                if (e.target.value === "add-new") {
                  setIsAddingSource(true);
                  setLeadSourceFilter("");
                } else {
                  setLeadSourceFilter(e.target.value);
                }
              }}
            >
              <option value="">Select Lead Source</option>
              {leadSourceOptions.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
              {customSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
              <option value="add-new">+ Add New Source</option>
            </select>
            
            {/* New Source Input Form */}
            {isAddingSource && (
              <div className="add-source-dropdown">
                <input
                  type="text"
                  placeholder="Enter new source name..."
                  value={newSourceInput}
                  onChange={(e) => setNewSourceInput(e.target.value)}
                  onKeyPress={handleNewSourceKeyPress}
                  autoFocus
                />
                <div className="add-source-actions">
                  <button 
                    className="add-btn"
                    onClick={handleAddSourceFromDropdown}
                  >
                    Add
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => setIsAddingSource(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {isFiltering && (
            <button className="btn btn-secondary" onClick={clearAllFilters}>
              <i className="fas fa-times"></i> Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={viewAllLeads}
        >
          All Leads ({leadCount})
        </button>
        <button
          className={`tab ${activeTab === "filtered" ? "active" : ""}`}
          onClick={viewFilteredLeads}
          disabled={!isFiltering}
        >
          Filtered Leads ({filteredLeadCount})
        </button>
      </div>

      <div className="leads-header">
        <div className="leads-count">
          <span>{leads.length} Leads</span>
        </div>

        <div className="leads-actions">
          <button className="btn btn-secondary btn-sm" onClick={openFilterPage}>
            <i className="fas fa-filter"></i>
            <span>Filter</span>
          </button>

          <button className="btn btn-secondary btn-sm">
            <i className="fas fa-sort"></i>
            <span>Sort</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={openDataCleaningPage}>
            <i className="fas fa-broom"></i>
            <span>Start Cleaning</span>
          </button>
        </div>
      </div>

      <div className="leads-table-container">
        {renderLeadsTable()}
      </div>

      <div className="pagination">
        <button className="pagination-btn">
          <i className="fas fa-chevron-left"></i>
          <span>Previous</span>
        </button>
        <button className="pagination-btn">
          <span>Next</span>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default LeadsManagement;
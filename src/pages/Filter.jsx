import React, { useState } from 'react';
import './Filter.css';

const Filters = () => {
  const [hotLeads, setHotLeads] = useState(false);
  const [warmLeads, setWarmLeads] = useState(false);
  
  // Added investment range options
  const investmentRanges = [
    "Below 10 Lakhs",
    "10-25 Lakhs",
    "25-50 Lakhs", 
    "50 Lakhs - 1 Crore",
    "1-5 Crore",
    "Above 5 Crore"
  ];
  
  // Added location options
  const locations = [
    "Delhi NCR",
    "Mumbai",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Kolkata",
    "Ahmedabad"
  ];
  
  // Added contact history options
  const lastContactedOptions = [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 30 days",
    "More than 30 days"
  ];
  
  const followUpStatusOptions = [
    "Scheduled",
    "Completed",
    "Pending",
    "Not Required"
  ];
  
  const updatedDataOptions = [
    "Updated today",
    "Updated this week",
    "Updated this month",
    "Not updated in 30 days"
  ];

  return (
    <div className="filters-container">
      <div className="breadcrumb">
        <span>Leads Management</span>
        <span className="arrow">›</span>
        <span className="current">Filters</span>
      </div>

      {/* Lead Status Section */}
      <div className="section">
        <h3 className="section-title">Lead Status</h3>
        <div className="status-toggles">
          <div className="toggle-item">
            <div className="toggle-icon hot">
              <span className="circle"></span>
            </div>
            <span className="toggle-label">Hot Leads</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={hotLeads} 
                onChange={() => setHotLeads(!hotLeads)} 
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-icon warm">
              <span className="arrow-up"></span>
            </div>
            <span className="toggle-label">Warm Leads</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={warmLeads} 
                onChange={() => setWarmLeads(!warmLeads)} 
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Lead Information Section */}
      <div className="section">
        <h3 className="section-title">Lead Information</h3>
        <div className="form-group">
          <div className="form-item">
            <label>Investment Range</label>
            <div className="select-wrapper">
              <select className="select-dropdown">
                <option value="" disabled selected>Select range</option>
                {investmentRanges.map((range, index) => (
                  <option key={index} value={range}>{range}</option>
                ))}
              </select>
              <span className="select-arrow">⌄</span>
            </div>
          </div>
          <div className="form-item">
            <label>Location</label>
            <div className="select-wrapper">
              <select className="select-dropdown">
                <option value="" disabled selected>Select preferred location</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
              <span className="select-arrow">⌄</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact History Section */}
      <div className="section">
        <h3 className="section-title">Contact History</h3>
        <div className="contact-history">
          <div className="history-row">
            <div className="history-item">
              <div className="history-icon">
                <span className="clock-icon"></span>
              </div>
              <span className="history-label">Last Contacted</span>
              <div className="select-wrapper">
                <select className="select-dropdown">
                  <option value="" disabled selected>Select</option>
                  {lastContactedOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
                <span className="select-arrow">⌄</span>
              </div>
            </div>
            <div className="history-item">
              <div className="history-icon">
                <span className="follow-icon"></span>
              </div>
              <span className="history-label">Follow-up Status</span>
              <div className="select-wrapper">
                <select className="select-dropdown">
                  <option value="" disabled selected>Select</option>
                  {followUpStatusOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
                <span className="select-arrow">⌄</span>
              </div>
            </div>
          </div>
          <div className="history-row">
            <div className="history-item full-width">
              <div className="history-icon">
                <span className="update-icon"></span>
              </div>
              <span className="history-label">Updated Data</span>
              <div className="select-wrapper">
                <select className="select-dropdown">
                  <option value="" disabled selected>Select</option>
                  {updatedDataOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
                <span className="select-arrow">⌄</span>
              </div>
            </div>
          </div>
          <div className="update-status-text">Filter by data update status</div>
        </div>
      </div>

      {/* Button Actions */}
      <div className="action-buttons">
        <button className="apply-button">Apply Filters</button>
        <button className="reset-button">Reset</button>
      </div>

    </div>
  );
};

export default Filters;
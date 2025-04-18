import React, { useEffect, useState } from "react";
import './UploadLeads.css';
import axios from 'axios';

const UploadLeads = () => {
  // Main tabs - 'existing' or 'new'
  const [activeTab, setActiveTab] = useState('existing');
  
  // Sub-tabs for 'new' - 'uploadCsv' or 'addLeadForm'
  const [activeNewLeadSubTab, setActiveNewLeadSubTab] = useState('uploadCsv');
  
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [existingHistory, setExistingHistory] = useState([]);
  const [newLeadHistory, setNewLeadHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form state for Add Lead tab
  const [leadForm, setLeadForm] = useState({
    name: '',
    franchiseDeveloper: '',
    source: '',
    status: '',
    city: '',
    state: '',
    contactNumber: '',
    email: '',
    campaignDate: '',
    month: '',
    financialYear: '',
    isUpdated: false,
    notes: ''
  });

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleNewLeadSubTabChange = (subTab) => {
    setActiveNewLeadSubTab(subTab);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileDeselect = () => {
    setSelectedFile(null);
  };

  const fetchUploadHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/leads/history");
      setExistingHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('lead_type', activeTab === 'existing' ? 'Existing' : 'New');

      try {
        const response = await axios.post('http://localhost:5000/api/leads/upload', formData);
        const newHistoryItem = {
          id: selectedFile.name,
          status: 'Success',
          records: response.data.records,
          date: new Date().toLocaleDateString(),
        };

        if (activeTab === 'existing') {
          setExistingHistory([newHistoryItem, ...existingHistory]);
        } else {
          setNewLeadHistory([newHistoryItem, ...newLeadHistory]);
        }

        setSelectedFile(null);
        alert('File uploaded successfully!');
        fetchUploadHistory();
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please select a file first');
    }
  };

  const downloadCSV = () => {
    window.location.href = "http://localhost:5000/api/leads/template";
  };

  const downloadUpload = (id) => {
    window.location.href = `http://localhost:5000/api/leads/download`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeadForm({
      ...leadForm,
      [name]: value
    });
  };

  // Handle toggle changes
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setLeadForm({
      ...leadForm,
      [name]: checked
    });
  };

  // Handle form submission
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/leads/add', leadForm);
      alert('Lead added successfully!');
      
      // Reset the form
      setLeadForm({
        name: '',
        franchiseDeveloper: '',
        source: '',
        status: '',
        city: '',
        state: '',
        contactNumber: '',
        email: '',
        campaignDate: '',
        month: '',
        financialYear: '',
        isUpdated: false,
        notes: ''
      });
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Failed to add lead: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const goBackToLeads = () => {
    // This would typically navigate back to a leads list page
    // For now, we'll just show an alert
    alert('This would navigate back to the leads list');
  };

  return (
    <div className="upload-leads-container">
      {/* Main tabs */}
      <div className="upload-tabs">
        <button
          className={`tab-button ${activeTab === 'existing' ? 'active' : ''}`}
          onClick={() => handleTabChange('existing')}
        >
          Upload Existing Leads
        </button>
        <button
          className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => handleTabChange('new')}
        >
          Upload New Lead
        </button>
      </div>

      {/* Content for Existing Leads tab */}
      {activeTab === 'existing' && (
        <div className="upload-section">
          <h2>CSV File Upload</h2>
          <p>
            Upload your existing leads database in CSV format. 
            Make sure your file follows the required template structure.
          </p>
          
          <input 
            type="file" 
            id="csvFileExisting" 
            accept=".csv" 
            onChange={handleFileChange} 
          />
          <label htmlFor="csvFileExisting">Choose File</label>
          
          <button 
            className="upload-csv-btn" 
            onClick={handleUpload} 
            disabled={!selectedFile || loading}
          >
            {loading ? 'Uploading...' : 'Upload CSV'}
          </button>
          
          <button 
            className="download-template-btn" 
            onClick={downloadCSV} 
            title="C:\Users\vaish\franchisee-lead-management\backend\templates\Lead Template.xlsx"
          >
            Download Template
          </button>
          
          {selectedFile && (
            <div className="file-info">
              <span>{selectedFile.name}</span>
              <button onClick={handleFileDeselect}>Remove</button>
            </div>
          )}

          <div className="upload-requirements">
            <h3>Upload Requirements</h3>
            
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="far fa-file-alt"></i>
              </div>
              <div className="requirement-content">
                <h4>File Format</h4>
                <p>Must be a valid CSV file with UTF-8 encoding</p>
              </div>
            </div>
            
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-list"></i>
              </div>
              <div className="requirement-content">
                <h4>Required Columns</h4>
                <p>Name, Email, Phone, Source, Status</p>
              </div>
            </div>
            
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <div className="requirement-content">
                <h4>Maximum File Size</h4>
                <p>Up to 10MB supported</p>
              </div>
            </div>
          </div>

          <div className="history-section">
            <h3>Upload History</h3>
            <div className="history-items">
              {existingHistory.map((item, index) => (
                <div className="history-item" key={index}>
                  <div>
                    <i className="fas fa-file-csv file-icon"></i>
                    <div className="file-details">
                      <span className="file-name">{item.id}</span>
                      <span className="file-meta">{item.records} records</span>
                    </div>
                  </div>
                  <div>
                    <span className="file-date">{item.date}</span>
                    <button onClick={() => downloadUpload(item.id)}>
                      <i className="fas fa-download"></i> Download
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Example history item for demonstration */}
              {existingHistory.length === 0 && (
                <div className="history-item">
                  <div>
                    <i className="fas fa-file-csv file-icon"></i>
                    <div className="file-details">
                      <span className="file-name">Lead_Template.csv</span>
                      <span className="file-meta">100 records</span>
                    </div>
                  </div>
                  <div>
                    <span className="file-date">9/4/2025</span>
                    <button>
                      <i className="fas fa-download"></i> Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content for New Lead tab with sub-tabs */}
      {activeTab === 'new' && (
        <div className="new-lead-content">
          {/* Sub-tabs for New Lead */}
          <div className="new-lead-subtabs">
            <button
              className={`subtab-button ${activeNewLeadSubTab === 'uploadCsv' ? 'active' : ''}`}
              onClick={() => handleNewLeadSubTabChange('uploadCsv')}
            >
              Upload New Lead CSV
            </button>
            <button
              className={`subtab-button ${activeNewLeadSubTab === 'addLeadForm' ? 'active' : ''}`}
              onClick={() => handleNewLeadSubTabChange('addLeadForm')}
            >
              Add Lead
            </button>
          </div>

          {/* Upload CSV sub-tab content */}
          {activeNewLeadSubTab === 'uploadCsv' && (
            <div className="upload-section">
              <h2>CSV File Upload</h2>
              <p>
                Upload your new leads database in CSV format. 
                Make sure your file follows the required template structure.
              </p>
              
              <input 
                type="file" 
                id="csvFileNew" 
                accept=".csv" 
                onChange={handleFileChange} 
              />
              <label htmlFor="csvFileNew">Choose File</label>
              
              <button 
                className="upload-csv-btn" 
                onClick={handleUpload} 
                disabled={!selectedFile || loading}
              >
                {loading ? 'Uploading...' : 'Upload CSV'}
              </button>
              
              <button 
                className="download-template-btn" 
                onClick={downloadCSV}
              >
                Download Template
              </button>
              
              {selectedFile && (
                <div className="file-info">
                  <span>{selectedFile.name}</span>
                  <button onClick={handleFileDeselect}>Remove</button>
                </div>
              )}

              <div className="upload-requirements">
                <h3>Upload Requirements</h3>
                
                <div className="requirement-item">
                  <div className="requirement-icon">
                    <i className="far fa-file-alt"></i>
                  </div>
                  <div className="requirement-content">
                    <h4>File Format</h4>
                    <p>Must be a valid CSV file with UTF-8 encoding</p>
                  </div>
                </div>
                
                <div className="requirement-item">
                  <div className="requirement-icon">
                    <i className="fas fa-list"></i>
                  </div>
                  <div className="requirement-content">
                    <h4>Required Columns</h4>
                    <p>Name, Email, Phone, Source, Status</p>
                  </div>
                </div>
                
                <div className="requirement-item">
                  <div className="requirement-icon">
                    <i className="fas fa-chart-bar"></i>
                  </div>
                  <div className="requirement-content">
                    <h4>Maximum File Size</h4>
                    <p>Up to 10MB supported</p>
                  </div>
                </div>
              </div>

              <div className="history-section">
                <h3>Upload History</h3>
                <div className="history-items">
                  {newLeadHistory.map((item, index) => (
                    <div className="history-item" key={index}>
                      <div>
                        <i className="fas fa-file-csv file-icon"></i>
                        <div className="file-details">
                          <span className="file-name">{item.id}</span>
                          <span className="file-meta">{item.records} records</span>
                        </div>
                      </div>
                      <div>
                        <span className="file-date">{item.date}</span>
                        <button onClick={() => downloadUpload(item.id)}>
                          <i className="fas fa-download"></i> Download
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {newLeadHistory.length === 0 && (
                    <div className="history-item">
                      <div>
                        <i className="fas fa-file-csv file-icon"></i>
                        <div className="file-details">
                          <span className="file-name">New_Lead_Template.csv</span>
                          <span className="file-meta">50 records</span>
                        </div>
                      </div>
                      <div>
                        <span className="file-date">9/4/2025</span>
                        <button>
                          <i className="fas fa-download"></i> Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Lead Form sub-tab content */}
          {activeNewLeadSubTab === 'addLeadForm' && (
            <div className="lead-form-container">
              <div className="form-header">
                <h2>Lead Management Form</h2>
                <div className="form-actions">
                  <button className="back-btn" onClick={goBackToLeads}>Back to Leads</button>
                  <button className="save-btn" onClick={handleSubmitLead} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Lead'}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitLead}>
                <div className="form-section">
                  <h3 className="section-title">Basic Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Name of Lead</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        placeholder="Enter lead name" 
                        value={leadForm.name} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="franchiseDeveloper">Franchise Developer Name</label>
                      <input 
                        type="text" 
                        id="franchiseDeveloper" 
                        name="franchiseDeveloper" 
                        placeholder="Enter franchise developer name" 
                        value={leadForm.franchiseDeveloper} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="source">Source</label>
                      <select 
                        id="source" 
                        name="source" 
                        value={leadForm.source} 
                        onChange={handleInputChange}
                      >
                        <option value="">Select lead source</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Direct">Direct</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select 
                        id="status" 
                        name="status" 
                        value={leadForm.status} 
                        onChange={handleInputChange}
                      >
                        <option value="">Select lead status</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed Won">Closed Won</option>
                        <option value="Closed Lost">Closed Lost</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Contact Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input 
                        type="text" 
                        id="city" 
                        name="city" 
                        placeholder="Enter city" 
                        value={leadForm.city} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input 
                        type="text" 
                        id="state" 
                        name="state" 
                        placeholder="Enter state" 
                        value={leadForm.state} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="contactNumber">Contact Number</label>
                      <input 
                        type="text" 
                        id="contactNumber" 
                        name="contactNumber" 
                        placeholder="Enter contact number" 
                        value={leadForm.contactNumber} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email ID</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Enter email address" 
                        value={leadForm.email} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Campaign Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="campaignDate">Date of Campaign</label>
                      <input 
                        type="date" 
                        id="campaignDate" 
                        name="campaignDate" 
                        value={leadForm.campaignDate} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="month">Month</label>
                      <select 
                        id="month" 
                        name="month" 
                        value={leadForm.month} 
                        onChange={handleInputChange}
                      >
                        <option value="">Select month</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="financialYear">Financial Year</label>
                      <select 
                        id="financialYear" 
                        name="financialYear" 
                        value={leadForm.financialYear} 
                        onChange={handleInputChange}
                      >
                        <option value="">Select financial year</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                      </select>
                    </div>
                    <div className="form-group toggle-group">
                      <label htmlFor="isUpdated">Updated Lead</label>
                      <div className="toggle-switch">
                        <input 
                          type="checkbox" 
                          id="isUpdated" 
                          name="isUpdated" 
                          checked={leadForm.isUpdated} 
                          onChange={handleToggleChange} 
                        />
                        <label htmlFor="isUpdated" className="toggle-label">
                          <span className="toggle-text">Mark if lead information has been updated</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Additional Information</h3>
                  <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      placeholder="Enter any additional notes about this lead" 
                      value={leadForm.notes} 
                      onChange={handleInputChange} 
                      rows="4"
                    ></textarea>
                  </div>
                </div>

                <div className="form-actions bottom-actions">
                  <button type="button" className="cancel-btn">Cancel</button>
                  <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Lead'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadLeads;
import { useState, useEffect } from "react";
import "./Promotion.css";
import { Search, Filter, Check, Edit, X, Plus, Calendar, Clock, Upload, Save, Phone, MessageSquare, Mail, Mic, AlertCircle } from "lucide-react";
import axios from 'axios';

const Promotion = ({ setActivePage }) => {
  const [activeTab, setActiveTab] = useState("Active Promotions");
  const [selectedAction, setSelectedAction] = useState("WhatsApp Business");
  const [showTemplateCard, setShowTemplateCard] = useState(true);
  
  // WhatsApp message state
  const [whatsappMessage, setWhatsappMessage] = useState("Hello [name]! we have an exciting franchise opportunity for [business_type] in your area. Would you be interested in learning more?");
  
  // Email content state
  const [emailSubject, setEmailSubject] = useState("Exclusive Franchise Opportunity for [Business_type]");
  const [emailBody, setEmailBody] = useState(
    `Dear [name],

We're excited to share an exclusive franchise opportunity for [Business_type] in the [location] area.

Our franchise partners enjoy:
- Comprehensive training and support
- Proven business model with strong ROI
- Exclusive territory rights
- Marketing and operational assistance

Would you be interested in scheduling a call to discuss this opportunity further?

Best regards,
[Your Name]
Franchise Development Manager
[Company]`
  );
  
  const [callScript, setCallScript] = useState(
    `Hello [name], this is [Your Name] from [Company].

I'm calling about an exciting franchise opportunity for [Business_type] in [location].

Is this a good time to talk about how you could become a franchise owner in your area?

Key points to discuss:
- Initial investment and ROI timeline
- Training and support provided
- Territory availability
- Next steps in the application process`
  );
  
  const tabs = ["Active Promotions", "Scheduled", "Completed", "Templates"];
  const actionTabs = ["WhatsApp Business", "Email", "Phone Call"];
  
  // Leads state
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeadsIds, setSelectedLeadsIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Selected leads for email
  const [selectedLeads, setSelectedLeads] = useState([]);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeads, setFilteredLeads] = useState([]);
  
  // Messages tracking data - this could also be fetched from database
  const messagesTracking = [
    { id: 1, name: "John Doe", time: "June 7, 10:45 AM", avatar: "/api/placeholder/40/40" },
    { id: 2, name: "Sarah Johnson", time: "February 12, 10:30 AM", avatar: "/api/placeholder/40/40" },
    { id: 3, name: "Michael Brown", time: "March 7, 10:15 AM", avatar: "/api/placeholder/40/40" }
  ];

  // Template selection states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState([
    { id: 1, name: "Franchise Introduction", content: "Hello [name]! We have an exciting franchise opportunity for [business_type] in your area. Would you be interested in learning more?" },
    { id: 2, name: "Follow-up Message", content: "Hi [name], just following up on our previous conversation about the [business_type] franchise opportunity. Have you had a chance to review the information?" },
    { id: 3, name: "Special Promotion", content: "Exclusive offer for [name]: Sign up for our [business_type] franchise before [date] and receive 15% off the initial franchise fee!" }
  ]);
  
  // Personalization fields modal
  const [showFieldsModal, setShowFieldsModal] = useState(false);
  const [availableFields, setAvailableFields] = useState([
    { id: 1, name: "[name]", description: "Lead's full name" },
    { id: 2, name: "[business_type]", description: "Type of business franchise" },
    { id: 3, name: "[location]", description: "Lead's location" },
    { id: 4, name: "[date]", description: "Current date" },
    { id: 5, name: "[company]", description: "Your company name" }
  ]);
  
  // File attachment states
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  // Scheduling states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // AI message generation state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Fetch leads from database
  // Fetch leads from database
useEffect(() => {
  const fetchLeads = async () => {
    try {
      setLoading(true);
      // Make sure your API endpoint matches the backend route
      const response = await axios.get('/api/leads');
      
      if (response.data && Array.isArray(response.data)) {
        // Map database fields to the format needed for the component
        const formattedLeads = response.data.map(lead => ({
          id: lead.id,
          name: lead.name_of_lead || "Unknown",
          location: lead.city && lead.state ? `${lead.city}, ${lead.state}` : "Unknown location",
          status: lead.status || "Not Contacted",
          lastContact: lead.lead_update_status === "Updated" ? "Recently" : "Never",
          avatar: "/api/placeholder/40/40", // Placeholder for now
          email: lead.email_id || "",
          phone: lead.contact_number || "",
          businessType: lead.leadType || "Business"
        }));
        
        setLeads(formattedLeads);
        setFilteredLeads(formattedLeads);
        console.log("Leads fetched successfully:", formattedLeads);
      } else {
        console.error("Invalid data format received:", response.data);
        setError("Received invalid data format from server");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
      setLoading(false);
    }
  };
  
  fetchLeads();
}, []);
  
  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLeads(leads);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = leads.filter(lead => 
        (lead.name && lead.name.toLowerCase().includes(query)) ||
        (lead.location && lead.location.toLowerCase().includes(query)) ||
        (lead.status && lead.status.toLowerCase().includes(query)) ||
        (lead.email && lead.email.toLowerCase().includes(query)) ||
        (lead.phone && lead.phone.toLowerCase().includes(query)) ||
        (lead.businessType && lead.businessType.toLowerCase().includes(query))
      );
      setFilteredLeads(filtered);
    }
  }, [searchQuery, leads]);
  
  // Handle select all toggle
  const handleSelectAllToggle = () => {
    if (selectAll) {
      // If already selected all, deselect all
      setSelectedLeadsIds([]);
      setSelectedLeads([]);
      setSelectAll(false);
    } else {
      // Select all filtered leads
      const allIds = filteredLeads.map(lead => lead.id);
      setSelectedLeadsIds(allIds);
      
      // Update selected leads for display
      const selectedLeadsData = filteredLeads.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        avatar: lead.avatar
      }));
      
      setSelectedLeads(selectedLeadsData);
      setSelectAll(true);
    }
  };
  
  // Toggle lead selection
  const toggleLeadSelection = (id) => {
    let updatedSelectedIds;
    
    if (selectedLeadsIds.includes(id)) {
      updatedSelectedIds = selectedLeadsIds.filter(leadId => leadId !== id);
    } else {
      updatedSelectedIds = [...selectedLeadsIds, id];
    }
    
    setSelectedLeadsIds(updatedSelectedIds);
    
    // Update the selected leads list
    const updatedSelectedLeads = leads
      .filter(lead => updatedSelectedIds.includes(lead.id))
      .map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        avatar: lead.avatar
      }));
      
    setSelectedLeads(updatedSelectedLeads);
    
    // Update the selectAll state based on if all leads are selected
    setSelectAll(updatedSelectedIds.length === filteredLeads.length);
  };

  const handleRemoveLead = (id) => {
    setSelectedLeads(selectedLeads.filter(lead => lead.id !== id));
    setSelectedLeadsIds(selectedLeadsIds.filter(leadId => leadId !== id));
    setSelectAll(false);
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates', { 
        params: { type: selectedAction }
      });
      setTemplates(response.data);
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  };
  
  const handleSaveTemplate = async () => {
    try {
      let payload = {
        name: `${selectedAction} Template - ${new Date().toLocaleDateString()}`,
        type: selectedAction
      };
  
      if (selectedAction === "WhatsApp Business") {
        payload.body = whatsappMessage;
      } else if (selectedAction === "Email") {
        payload.subject = emailSubject;
        payload.body = emailBody;
      } else if (selectedAction === "Phone Call") {
        payload.body = callScript;
      }
  
      const templateName = prompt("Enter template name:", payload.name);
      if (!templateName) return;
  
      payload.name = templateName;
  
      await axios.post('/api/templates', payload);
      alert("Template saved successfully");
  
      // Refresh template list
      fetchTemplates();
    } catch (err) {
      console.error("Error saving template:", err);
      alert("Failed to save template. Please try again.");
    }
  };
  
  // Generate AI message (simulated for demo purposes)
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Please enter a prompt for message generation");
      return;
    }
    
    setIsGenerating(true);
    setAiError(null);
    
    try {
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate content based on the action type and prompt
      let generatedContent;
      let generatedSubject;
      
      if (selectedAction === "WhatsApp Business") {
        generatedContent = generateWhatsAppMessage(aiPrompt);
        setWhatsappMessage(generatedContent);
      } else if (selectedAction === "Email") {
        const emailResult = generateEmailContent(aiPrompt);
        generatedSubject = emailResult.subject;
        generatedContent = emailResult.body;
        
        setEmailSubject(generatedSubject);
        setEmailBody(generatedContent);
      } else if (selectedAction === "Phone Call") {
        generatedContent = generateCallScript(aiPrompt);
        setCallScript(generatedContent);
      }
      
      setShowAIModal(false);
    } catch (err) {
      console.error("Error generating AI content:", err);
      setAiError("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper functions to generate content based on prompts
  const generateWhatsAppMessage = (prompt) => {
    // Simple template-based generation
    if (prompt.toLowerCase().includes("promotional")) {
      return "Hi [name]! 🎉 Exciting news! We're expanding our [business_type] franchise in [location] and looking for passionate entrepreneurs like you. With our proven business model, you could be earning profits within months! Interested in this opportunity? Reply YES for more details!";
    } else if (prompt.toLowerCase().includes("follow")) {
      return "Hello [name], following up on our previous conversation about the [business_type] franchise opportunity. Have you had a chance to review the materials I shared? I'm available to answer any questions you might have about getting started. When would be a good time to chat?";
    } else {
      return "Hello [name]! Thank you for your interest in our [business_type] franchise opportunity. As a franchise owner in [location], you'll benefit from our established brand, comprehensive training, and ongoing support. Would you like to schedule a call to discuss the details? Let me know what time works best for you.";
    }
  };

  const generateEmailContent = (prompt) => {
    let subject, body;
    
    if (prompt.toLowerCase().includes("promotional") || prompt.toLowerCase().includes("promotion")) {
      subject = "Limited Time Offer: [Business_type] Franchise Opportunity in [location]";
      body = `Dear [name],

I hope this email finds you well. I'm reaching out with an exclusive opportunity to own a [business_type] franchise in the growing [location] market.

For a limited time, we're offering:
• Reduced initial franchise fee
• Extended territory rights
• Enhanced marketing support package
• Expedited training program

Our franchisees average [X]% return on investment within the first 18 months, and our brand recognition continues to grow nationwide.

Would you be available for a 30-minute call next week to discuss this opportunity in detail? I'd be happy to answer any questions you might have.

Best regards,
[Your Name]
Franchise Development Manager
[Company]`;
    } else if (prompt.toLowerCase().includes("follow")) {
      subject = "Following Up: [Business_type] Franchise Information";
      body = `Dear [name],

I wanted to follow up on the [business_type] franchise information I shared with you last week. 

Have you had a chance to review the materials? I'm particularly excited about the potential for the [location] territory we discussed, as our market analysis shows strong demand for [business_type] services in that area.

I'm available this week for a brief call to address any questions you might have about:
• Initial investment requirements
• Training and support programs
• Territory analysis and protection
• Marketing assistance

Please let me know what day/time works best for you, or if you need any additional information to help with your decision.

Warm regards,
[Your Name]
Franchise Development Manager
[Company]`;
    } else {
      subject = "Exclusive [Business_type] Franchise Opportunity for [location]";
      body = `Dear [name],

I hope this message finds you well. I'm reaching out because we're currently expanding our award-winning [business_type] franchise to the [location] area, and based on your background, you might be an ideal partner.

Our franchise offers:
• A proven business model with [X]% growth year-over-year
• Comprehensive initial training and ongoing support
• Exclusive territory rights
• Marketing and operational assistance
• Multiple revenue streams

The [business_type] industry continues to demonstrate strong resilience and growth potential, with our franchisees reporting consistent profitability even during economic fluctuations.

I'd appreciate the opportunity to discuss this further with you. Would you be available for a brief call next week to explore if this opportunity aligns with your goals?

Best regards,
[Your Name]
Franchise Development Manager
[Company]
[Phone]
[Email]`;
    }
    
    return { subject, body };
  };

  const generateCallScript = (prompt) => {
    if (prompt.toLowerCase().includes("introduction") || prompt.toLowerCase().includes("initial")) {
      return `Hello [name], this is [Your Name] from [Company].

I'm calling about an exciting franchise opportunity for [Business_type] in [location].

[Pause for response]

Great! I wanted to reach out because we're currently expanding our successful [Business_type] franchise into the [location] market, and we're looking for qualified business partners.

Our franchise offers:
• Initial investment starting at $[amount] with financing options available
• Comprehensive training program and ongoing support
• Exclusive territory rights
• Marketing and operational assistance

Many of our franchisees see a return on investment within [X] months of opening.

Would you be interested in learning more about this opportunity?

[If yes] That's great! I'd like to send you our franchise information packet and schedule a follow-up call where we can discuss the details further. What's the best email address to send this information to?

[If maybe/not sure] I understand this is a significant decision. How about I send you some basic information about our franchise model and success stories from current franchisees, and then we can schedule a follow-up call if you're interested in learning more?

[If no] I understand. May I ask what aspects of business ownership interest you most? We have several franchise models that might be a better fit for your goals.

Thank you for your time, [name]. Have a great day!`;
    } else {
      return `Hello [name], this is [Your Name] from [Company].

I'm calling to follow up on the [Business_type] franchise information I sent you last week. Did you receive it?

[Wait for response]

Great! Have you had a chance to review the materials? Do you have any initial questions I can answer for you?

[Respond to questions]

I wanted to highlight a few key points about our [Business_type] franchise:

• Our franchisees typically break even within [X] months
• We provide [X] weeks of comprehensive training at our headquarters
• Our ongoing support includes regular field visits and 24/7 operational assistance
• We handle national marketing while providing local marketing tools and strategies

Would you be interested in scheduling a more detailed discussion about the next steps in the franchising process?

[If yes] Excellent! Let's look at some potential times. How does [day/time] work for you?

[If not ready] I understand this is a big decision. What additional information would be helpful for you at this stage?

Thank you for your time today, [name]. Please don't hesitate to reach out if you have any questions as you review the materials. You can reach me directly at [phone number] or [email].

Have a wonderful day!`;
    }
  };
    
  // Select template handler
  const selectTemplate = (template) => {
    if (selectedAction === "WhatsApp Business") {
      setWhatsappMessage(template.body || template.content || "");
    } else if (selectedAction === "Email") {
      setEmailSubject(template.subject || "");
      setEmailBody(template.body || template.content || "");
    } else if (selectedAction === "Phone Call") {
      setCallScript(template.body || template.content || "");
    }
  
    setShowTemplateModal(false);
  };
  
  // Insert field handler
  const insertField = (field) => {
    if (selectedAction === "WhatsApp Business") {
      setWhatsappMessage(whatsappMessage + " " + field.name);
    } else {
      setEmailBody(emailBody + " " + field.name);
    }
  };
  
  // Add attachment handler
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map((file, index) => ({
      id: attachments.length + index + 1,
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      type: file.type
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };
  
  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };
  
  // Schedule message handler
  const scheduleMessage = () => {
    alert(`Message scheduled for ${scheduleDate} at ${scheduleTime}`);
    setShowScheduleModal(false);
  };
  
  // Send message now handler
  const sendMessageNow = () => {
    const recipientNames = selectedLeads.map(lead => lead.name).join(", ");
    alert(`Message sent to ${recipientNames}`);
  };

  return (
    <div className="promotions-container">
      {/* Common Header Section */}
      <h1>Promotions Management</h1>
      <p className="promotions-subtitle">Manage outreach campaigns, track communication, and update lead status</p>
      
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button 
            key={tab} 
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="section-container">
        <h2>Lead Selection</h2>
        <p>Search Leads</p>
        
        <div className="search-filter-container">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, location, status, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="filter-btn">
            <Filter size={16} />
            Filter
          </button>
          <button 
            className="select-all-btn"
            onClick={handleSelectAllToggle}
          >
            {selectAll ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="leads-table">
          {loading ? (
            <div className="loading-indicator">Loading leads...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredLeads.length === 0 ? (
            <div className="no-results">No leads found matching your search criteria.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Last Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedLeadsIds.includes(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                      />
                    </td>
                    <td>
                      <div className="lead-info">
                        <img src={lead.avatar} alt={lead.name} className="avatar" />
                        <span>{lead.name}</span>
                      </div>
                    </td>
                    <td>{lead.location}</td>
                    <td>
                      <span className={`status-tag ${lead.status.toLowerCase().replace(" ", "-")}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>Last: {lead.lastContact}</td>
                    <td>
                      <button className="action-btn">
                        <Check size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="section-container">
        <h2>Promotion Actions</h2>
        
        <div className="action-tabs">
          {actionTabs.map((tab) => (
            <button 
              key={tab} 
              className={`action-tab ${selectedAction === tab ? 'active' : ''}`}
              onClick={() => setSelectedAction(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* WhatsApp Content */}
        {selectedAction === "WhatsApp Business" && (
          <>
            <div className="selected-leads-list">
              {selectedLeads.map((lead) => (
                <div key={lead.id} className="selected-lead-item">
                  <div className="lead-info">
                    <img src={lead.avatar} alt={lead.name} className="avatar" />
                    <div>
                      <h4>{lead.name}</h4>
                      <p>{lead.email}</p>
                    </div>
                  </div>
                  <button 
                    className="remove-lead-btn"
                    onClick={() => handleRemoveLead(lead.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <button className="add-recipients-btn">
                <Plus size={16} />
                Add More Recipients
              </button>
            </div>

            <div className="promotion-actions-grid">
              <div className="action-card" onClick={() => setShowTemplateModal(true)}>
                <div className="card-icon message-icon">
                  <span>Aa</span>
                </div>
                <h3>Message Template</h3>
                <p>Select a predefined template or create a custom message</p>
              </div>
              
              <div className="action-card" onClick={() => setShowFieldsModal(true)}>
                <div className="card-icon personalization-icon">
                  <span>@</span>
                </div>
                <h3>Personalization</h3>
                <p>Add lead name, business, or other custom fields</p>
              </div>

              <div className="action-card" onClick={() => setShowAIModal(true)}>
                <div className="card-icon ai-icon">
                  <span>🤖</span>
                </div>
                <h3>AI Message Generator</h3>
                <p>Generate message content using AI</p>
              </div>
              
              <div className="action-card" onClick={() => setShowScheduleModal(true)}>
                <div className="card-icon schedule-icon">
                  <span>📅</span>
                </div>
                <h3>Schedule</h3>
                <p>Set a time to send this promotion</p>
              </div>
            </div>
            
            <div className="message-editor">
              <h3>Message</h3>
              <textarea 
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="action-buttons">
              <button 
                className="send-now-btn" 
                onClick={sendMessageNow}
                disabled={selectedLeadsIds.length === 0}
              >
                Send Now
              </button>
              <button 
                className="schedule-btn" 
                onClick={() => setShowScheduleModal(true)}
                disabled={selectedLeadsIds.length === 0}
              >
                Schedule
              </button>
              <button className="save-template-btn" onClick={handleSaveTemplate}>
                Save as Template
              </button>
            </div>
          </>
        )}
        
        {/* Email Content */}
        {selectedAction === "Email" && (
          <>
            <div className="selected-leads-list">
              {selectedLeads.map((lead) => (
                <div key={lead.id} className="selected-lead-item">
                  <div className="lead-info">
                    <img src={lead.avatar} alt={lead.name} className="avatar" />
                    <div>
                      <h4>{lead.name}</h4>
                      <p>{lead.email}</p>
                    </div>
                  </div>
                  <button 
                    className="remove-lead-btn"
                    onClick={() => handleRemoveLead(lead.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <button className="add-recipients-btn">
                <Plus size={16} />
                Add More Recipients
              </button>
            </div>
            
            <div className="email-content-grid">
              <div className="content-card">
                <div className="card-icon email-template-icon">
                  <span>Aa</span>
                </div>
                <h3>Email Template</h3>
                <p>Choose from saved templates or create a custom email</p>
                <button className="select-template-btn" onClick={() => setShowTemplateModal(true)}>Select Template</button>
              </div>
              
              <div className="content-card">
                <div className="card-icon personalization-icon">
                  <span>@</span>
                </div>
                <h3>Personalization</h3>
                <p>Add dynamic fields like name, location, or custom fields</p>
                <button className="add-fields-btn" onClick={() => setShowFieldsModal(true)}>Add Fields</button>
              </div>

              <div className="content-card">
                <div className="card-icon ai-icon">
                  <span>🤖</span>
                </div>
                <h3>AI Email Generator</h3>
                <p>Generate email content using AI</p>
                <button className="ai-generator-btn" onClick={() => setShowAIModal(true)}>Generate Content</button>
              </div>
              
              <div className="content-card">
                <div className="card-icon attachments-icon">
                  <span>📎</span>
                </div>
                <h3>Attachments</h3>
                <p>Add brochures, presentations, or other documents</p>
                <button className="upload-files-btn" onClick={() => setShowAttachmentsModal(true)}>Upload Files</button>
              </div>
            </div>
            
            <div className="email-form">
              <div className="form-group">
                <label>Subject Line</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="email-subject-input"
                />
              </div>
              
              <div className="form-group">
                <label>Email Body</label>
                <textarea 
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={12}
                  className="email-body-textarea"
                />
              </div>
              
              {attachments.length > 0 && (
                <div className="attachments-list">
                  <h4>Attachments</h4>
                  {attachments.map(file => (
                    <div key={file.id} className="attachment-item">
                      <div className="attachment-info">
                        <span>{file.name}</span>
                        <small>{file.size}</small>
                      </div>
                      <button 
                        className="remove-attachment-btn"
                        onClick={() => removeAttachment(file.id)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="email-actions">
              <button className="send-now-btn" onClick={sendMessageNow}>Send Now</button>
              <button className="schedule-btn" onClick={() => setShowScheduleModal(true)}>Schedule</button>
              <button className="save-draft-btn">Save as Draft</button>
              <button className="save-template-btn">Save as Template</button>
            </div>
          </>
        )}
      </div>

      {selectedAction === "Phone Call" && (
  <>
    <div className="phone-call-editor">
      <h3>Phone Call Script</h3>
      <textarea
        value={callScript}
        onChange={(e) => setCallScript(e.target.value)}
        placeholder="Enter phone call script..."
        rows={8}
      />

      <div className="action-buttons">
        <button 
          className="send-now-btn" 
          onClick={sendMessageNow}
          disabled={selectedLeadsIds.length === 0}
        >
          Start Calling
        </button>
        <button 
          className="schedule-btn" 
          onClick={() => setShowScheduleModal(true)}
          disabled={selectedLeadsIds.length === 0}
        >
          Schedule
        </button>
        <button 
          className="save-template-btn"
          onClick={handleSaveTemplate}
        >
          Save as Template
        </button>
      </div>
    </div>
  </>
)}

      
      {/* Message Tracking Section - Only show for WhatsApp */}
      {selectedAction === "WhatsApp Business" && (
        <div className="section-container">
          <h2>Message & Communication Tracking</h2>
          
          <div className="message-tracking">
            {messagesTracking.map((item) => (
              <div key={item.id} className="tracking-item">
                <div className="tracking-info">
                  <img src={item.avatar} alt={item.name} className="avatar" />
                  <div>
                    <h4>{item.name}</h4>
                    <p>WhatsApp • {item.time}</p>
                  </div>
                </div>
                <div className="tracking-actions">
                  <button className="tracking-action-btn">
                    <Edit size={16} />
                  </button>
                  <button className="tracking-action-btn">
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Select Template</h3>
              <button className="close-btn" onClick={() => setShowTemplateModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="templates-list">
                {templates.map(template => (
                  <div 
                    key={template.id} 
                    className="template-item"
                    onClick={() => selectTemplate(template)}
                  >
                    <h4>{template.name}</h4>
                    <p>{template.content.substring(0, 60)}...</p>
                  </div>
                  
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fields Modal */}
      {showFieldsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Personalization Fields</h3>
              <button className="close-btn" onClick={() => setShowFieldsModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="fields-list">
                {availableFields.map(field => (
                  <div 
                    key={field.id} 
                    className="field-item"
                    onClick={() => insertField(field)}
                  >
                    <h4>{field.name}</h4>
                    <p>{field.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachments Modal */}
      {showAttachmentsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Upload Attachments</h3>
              <button className="close-btn" onClick={() => setShowAttachmentsModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="upload-area">
                <Upload size={32} />
                <p>Drag and drop files here or</p>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="upload-btn">
                  Browse Files
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="attachments-preview">
                  <h4>Selected Files</h4>
                  {attachments.map(file => (
                    <div key={file.id} className="attachment-item">
                      <div className="attachment-info">
                        <span>{file.name}</span>
                        <small>{file.size}</small>
                      </div>
                      <button 
                        className="remove-attachment-btn"
                        onClick={() => removeAttachment(file.id)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  className="confirm-btn"
                  onClick={() => setShowAttachmentsModal(false)}
                >
                  Confirm Attachments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
{showAIModal && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <h3>AI {selectedAction === "Email" ? "Email" : "Message"} Generator</h3>
        <button className="close-btn" onClick={() => setShowAIModal(false)}>
          <X size={16} />
        </button>
      </div>
      <div className="modal-body">
        <div className="ai-prompt-form">
          <div className="form-group">
            <label>Prompt for {selectedAction === "Email" ? "Email" : "Message"} Generation</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={`Describe what kind of ${selectedAction === "Email" ? "email" : "message"} you want to generate. For example: "Create a persuasive ${selectedAction === "Email" ? "email" : "message"} for restaurant franchise opportunities with strong call to action."`}
              rows={5}
              className="ai-prompt-textarea"
            />
          </div>

          {aiError && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{aiError}</span>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={() => setShowAIModal(false)}
          >
            Cancel
          </button>
          <button
            className="generate-btn"
            onClick={handleAIGenerate}
            disabled={isGenerating || !aiPrompt.trim()}
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner"></div>
                Generating...
              </>
            ) : (
              <>
                <Mic size={16} />
                Generate Content
              </>
            )}
          </button>
        </div>

        {/* Example Output Preview - Update this based on your needs */}
        <div className="generation-info">
          <p><strong>Note:</strong> The generated content will appear directly in your {selectedAction === "Email" ? "email body" : "message"} when ready.</p>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Schedule Message</h3>
              <button className="close-btn" onClick={() => setShowScheduleModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="schedule-form">
                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Date
                  </label>
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <Clock size={16} />
                    Time
                  </label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
                
                <div className="recipients-summary">
                  <h4>Recipients</h4>
                  <p>{selectedLeads.length} leads selected</p>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn"
                  onClick={scheduleMessage}
                  disabled={!scheduleDate || !scheduleTime}
                >
                  Confirm Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotion;
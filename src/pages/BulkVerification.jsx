
import React, { useState, useEffect } from "react";
import "./BulkVerification.css";



const BulkVerification = ({ setActivePage }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    email: true,
    phone: false,
    duplicate: false,
    data: false,
  })

  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState({})

  // Fetch leads from backend
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:5000/api/bulk-verification")
        const data = await response.json()
        setLeads(data)

        // Initialize all leads as selected
        const initialSelected = {}
        data.forEach((lead) => {
          initialSelected[lead.id] = true
        })
        setSelectedLeads(initialSelected)
      } catch (error) {
        console.error("Failed to fetch leads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  // Toggle selected verification option
  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  // Toggle lead selection
  const toggleLeadSelection = (id) => {
    setSelectedLeads((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Select/deselect all leads
  const toggleAllLeads = (select) => {
    const newSelected = {}
    leads.forEach((lead) => {
      newSelected[lead.id] = select
    })
    setSelectedLeads(newSelected)
  }

  // Get selected leads
  const getSelectedLeads = () => {
    return leads.filter((lead) => selectedLeads[lead.id])
  }

  // Send data to backend
  const handleStartVerification = async () => {
    try {
      setProcessing(true)

      const selectedLeadsArray = getSelectedLeads()

      if (selectedLeadsArray.length === 0) {
        alert("Please select at least one lead to verify")
        setProcessing(false)
        return
      }

      const response = await fetch("http://localhost:5000/api/bulk-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          options: selectedOptions,
          leads: selectedLeadsArray,
        }),
      })

      const result = await response.json()
      console.log("Verification result:", result)

      if (result.message) {
        alert("Verification completed successfully!")
        setActivePage("email-verification")
      }
    } catch (error) {
      console.error("Bulk verification failed:", error)
      alert("Verification failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }


  return (
    <div className="bulk-verification-page">
      <h2 className="page-title">Bulk Verification</h2>
      <p className="page-description">Verify multiple leads at once to improve data quality</p>

      <div className="header-actions">
        <button className="btn btn-secondary" onClick={() => setActivePage("data-cleaning")}>
          Back to Data Cleaning
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleStartVerification} 
          disabled={processing}
        >
          {processing ? "Processing..." : "Run All Checks"}
        </button>
        
      </div>

      <h3 className="section-title">
        Selected Leads ({Array.isArray(leads) ? leads.length : 0})
      </h3>

      <div className="selected-leads-table">
        {loading ? (
          <p>Loading leads...</p>
        ) : (
          <table>
            <tbody>
              {Array.isArray(leads) && leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id}>
                  <input
                    type="checkbox"
                    checked={selectedLeads[lead.id] || false}
                    onChange={() => toggleLeadSelection(lead.id)}
                    />
                    <td className="lead-user">
                      <i className="fas fa-user"></i>
                      <span>{lead.name_of_lead || lead.name}</span>
                    </td>
                    <td className="lead-contact">
                      {lead.email_id || lead.email} <br />
                      {lead.contact_number || lead.phone}
                    </td>
                    <td className={`lead-interest ${lead.leadType?.toLowerCase().replace(" ", "-") || "unknown"}`}>
                      {lead.leadType || "Unknown"}
                    </td>
                    <td className={`lead-status ${lead.status?.toLowerCase().replace(" ", "-") || "pending"}`}>
                      {lead.status || "Pending"}
                    </td>
                    <td className="lead-issue">{lead.notes || lead.issue || "N/A"}</td>
                    <td className="lead-actions">
                      <button className="action-btn">
                        <i className="fas fa-pencil-alt"></i>
                      </button>



                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No leads found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BulkVerification;

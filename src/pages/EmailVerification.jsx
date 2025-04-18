import { useState, useEffect } from "react";
import "./EmailVerification.css";

const EmailVerification = ({ setActivePage }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [verificationResults, setVerificationResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationResults = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/email-verifications");
        const data = await res.json();
        console.log("Fetched verification results:", data);
        setVerificationResults(data);
      } catch (err) {
        console.error("Failed to fetch verification results:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVerificationResults();
  }, []);
  
  // Filter results based on active tab
  const filteredResults = 
    activeTab === "all"
      ? verificationResults
      : activeTab === "valid"
        ? verificationResults.filter((result) => result.status === "Valid")
        : verificationResults.filter((result) => result.status !== "Valid");

  const validCount = verificationResults.filter((result) => result.status === "Valid").length;
  const formatIssuesCount = verificationResults.filter((result) => result.status === "Format Issue").length;
  const undeliverableCount = verificationResults.filter((result) => result.status === "Undeliverable").length;

  // Function to verify a single email
  const verifyEmail = async (email, leadId, name) => {
    try {
      const response = await fetch("http://localhost:5000/api/email-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, leadId, name }),
      });

      const result = await response.json();

      // Add the new result to the list
      setVerificationResults([result, ...verificationResults]);

      return result;
    } catch (error) {
      console.error("Error verifying email:", error);
      return null;
    }
  };

  return (
    <div className="email-verification-page">
      <div className="page-header">
        <div className="breadcrumb">
          <a href="#" onClick={() => setActivePage("dashboard")}>Dashboard</a>
          <span>›</span>
          <a href="#" onClick={() => setActivePage("data-cleaning")}>Data Cleaning</a>
          <span>›</span>
          <span className="active">Email Verification</span>
        </div>

        <h2 className="page-title">Email Verification Results</h2>
        <p className="verification-summary">Verification completed for {verificationResults.length} leads</p>

        <button className="btn btn-secondary" onClick={() => setActivePage("data-cleaning")}>
          Back to Cleaning Tools
        </button>
      </div>

      <div className="verification-stats">
        <div className="stat-card valid-card">
          <div className="stat-number">{validCount}</div>
          <div className="stat-label">Valid Emails</div>
        </div>

        <div className="stat-card format-card">
          <div className="stat-number">{formatIssuesCount}</div>
          <div className="stat-label">Format Issues</div>
        </div>

        <div className="stat-card undeliverable-card">
          <div className="stat-number">{undeliverableCount}</div>
          <div className="stat-label">Undeliverable</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All Results</button>
        <button className={`tab ${activeTab === "valid" ? "active" : ""}`} onClick={() => setActiveTab("valid")}>Valid</button>
        <button className={`tab ${activeTab === "issues" ? "active" : ""}`} onClick={() => setActiveTab("issues")}>Issues Found</button>
      </div>

      <h3 className="section-title">Verification Results</h3>
      <div className="results-table-container">
        {loading ? (
          <p>Loading verification results...</p>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Email</th>
                <th>Status</th>
                <th>Score</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <tr key={result.id || result.lead_id}>
                    <td className="result-user">
                      <i className="fas fa-user"></i>
                      <span>{result.name || "Unknown"}</span>
                    </td>
                    <td className="result-email">{result.email}</td>
                    <td className={`result-status ${(result.status || "").toLowerCase().replace(" ", "-")}`}>
                      {result.status || "Unknown"}
                    </td>
                    <td className="result-score">{result.score || "-"}</td>
                    <td className="result-issue">{result.issue || "None"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">No verification results found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
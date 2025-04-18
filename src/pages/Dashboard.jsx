import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ setActivePage }) => {
  const handleCardClick = (page) => {
    setActivePage(page)
  }

  return (
    <div className="dashboard-container">
      

      <div className="main-content">
        <section className="content">
          <h2 className="section-title">Lead Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon new">
                <span>+</span>
              </div>
              <div className="card-details">
                <span className="card-label">NEW</span>
                <h3 className="card-value">847</h3>
                <p className="card-description">Added this week</p>
              </div>
              <button className="card-action purple">View</button>
            </div>

            <div className="summary-card">
              <div className="card-icon existing">
                <span>+</span>
              </div>
              <div className="card-details">
                <span className="card-label">EXISTING</span>
                <h3 className="card-value">1,256</h3>
                <p className="card-description">Active customers</p>
              </div>
              <button className="card-action purple">Manage</button>
            </div>

            <div className="summary-card">
              <div className="card-icon prospects">
                <span>+</span>
              </div>
              <div className="card-details">
                <span className="card-label">PROSPECTS</span>
                <h3 className="card-value">444</h3>
                <p className="card-description">Potential conversions</p>
              </div>
              <button className="card-action purple">Follow up</button>
            </div>

            <div className="summary-card">
              <div className="card-icon pending">
                <span>+</span>
              </div>
              <div className="card-details">
                <span className="card-label">PENDING</span>
                <h3 className="card-value">28</h3>
                <p className="card-description">Follow-ups today</p>
              </div>
              <button className="card-action purple">Action</button>
            </div>
          </div>

          <div className="quick-actions">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-buttons">
            <button className="action-button purple" onClick={() => setActivePage("upload-leads")}>
          <i className="fas fa-upload"></i>
          Upload Leads
        </button>
        <button className="action-button purple">
          <i className="fas fa-bullhorn"></i>
          Start Campaign
        </button>
        <button className="action-button purple">
          <i className="fas fa-chart-bar"></i>
          View Reports
        </button>
            </div>
          </div>

          <h2 className="section-title">Lead Management</h2>
          <div className="lead-management-cards">
            <div className="lead-card"onClick={() => handleCardClick("upload-leads")}>
              <div className="lead-card-icon">
              <i className="fas fa-upload"></i>
              </div>
              <h3 className="lead-card-title">Upload Leads</h3>
              <p className="lead-card-description">Import CSV/XLSX files</p>
              <button className="lead-card-action purple">Upload</button>
            </div>

            <div className="lead-card"onClick={() => handleCardClick("data-cleaning")}>
              <div className="lead-card-icon">
              <i className="fas fa-broom"></i>
              </div>
              <h3 className="lead-card-title">Data Cleaning</h3>
              <p className="lead-card-description"></p>
              <button className="lead-card-action purple">Clean Data</button>
            </div>

            <div className="lead-card">
              <div className="lead-card-icon">
                <span>+</span>
              </div>
              <h3 className="lead-card-title">Categorize</h3>
              <p className="lead-card-description">Organize by lead type</p>
              <button className="lead-card-action purple">Categorize</button>
            </div>

            <div className="lead-card"onClick={() => handleCardClick("filter")}>
              <div className="lead-card-icon">
              <i className="fas fa-filter"></i>
              </div>
              <h3 className="lead-card-title">Filter Leads</h3>
              <p className="lead-card-description">Search by status/interest</p>
              <button className="lead-card-action purple">Filter</button>
            </div>
          </div>

          <h2 className="section-title">Lead Promotion Tools</h2>
          <div className="promotion-cards">
            <div className="promotion-card">
              <div className="promotion-card-icon whatsapp">
                <span>W</span>
              </div>
              <h3 className="promotion-card-title">WhatsApp</h3>
              <p className="promotion-card-description">Send bulk messages</p>
              <button className="promotion-card-action purple">Compose</button>
            </div>

            <div className="promotion-card">
              <div className="promotion-card-icon call">
                <span>C</span>
              </div>
              <h3 className="promotion-card-title">Call Scheduling</h3>
              <p className="promotion-card-description">Auto dialer setup</p>
              <button className="promotion-card-action purple">Schedule</button>
            </div>

            <div className="promotion-card">
              <div className="promotion-card-icon reminder">
                <span>R</span>
              </div>
              <h3 className="promotion-card-title">Reminders</h3>
              <p className="promotion-card-description">Set follow-up alerts</p>
              <button className="promotion-card-action purple">Create</button>
            </div>

            <div className="promotion-card">
              <div className="promotion-card-icon status">
                <span>S</span>
              </div>
              <h3 className="promotion-card-title">Status Update</h3>
              <p className="promotion-card-description">Track lead progress</p>
              <button className="promotion-card-action purple">Update</button>
            </div>
          </div>

          <h2 className="section-title">Pending Follow-ups</h2>
          <div className="follow-ups-table">
            <table>
              <tbody>
                <tr>
                  <td><span className="user-icon">👤</span> Rahul Sharma</td>
                  <td>High Interest</td>
                  <td>WhatsApp</td>
                  <td>Today, 2:00 PM</td>
                  <td>
                    <button className="icon-button call">📞</button>
                    <button className="icon-button whatsapp">💬</button>
                  </td>
                </tr>
                <tr>
                  <td><span className="user-icon">👤</span> Priya Patel</td>
                  <td>Medium Interest</td>
                  <td>Call</td>
                  <td>Today, 3:30 PM</td>
                  <td>
                    <button className="icon-button call">📞</button>
                    <button className="icon-button whatsapp">💬</button>
                  </td>
                </tr>
                <tr>
                  <td><span className="user-icon">👤</span> Amit Kumar</td>
                  <td>Low Interest</td>
                  <td>Email</td>
                  <td>Tomorrow, 10:00 AM</td>
                  <td>
                    <button className="icon-button call">📞</button>
                    <button className="icon-button whatsapp">💬</button>
                  </td>
                </tr>
                <tr>
                  <td><span className="user-icon">👤</span> Neha Singh</td>
                  <td>High Interest</td>
                  <td>WhatsApp</td>
                  <td>Tomorrow, 1:00 PM</td>
                  <td>
                    <button className="icon-button call">📞</button>
                    <button className="icon-button whatsapp">💬</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="section-title">Analytics Overview</h2>
          <div className="analytics-cards">
            <div className="analytics-card">
              <div className="analytics-card-icon">
                <span>📈</span>
              </div>
              <h3 className="analytics-card-title">Conversion Metrics</h3>
              <p className="analytics-card-description">Track lead performance</p>
              <button className="analytics-card-action purple">View</button>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-icon">
                <span>🏢</span>
              </div>
              <h3 className="analytics-card-title">Franchisee Tracking</h3>
              <p className="analytics-card-description">Performance by team</p>
              <button className="analytics-card-action purple">Analyze</button>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-icon">
                <span>📊</span>
              </div>
              <h3 className="analytics-card-title">Export Reports</h3>
              <p className="analytics-card-description">CSV, PDF, Excel formats</p>
              <button className="analytics-card-action purple">Export</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
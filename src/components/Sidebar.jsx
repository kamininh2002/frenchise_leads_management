"use client"

import { useState } from "react"
import "./Sidebar.css"

const Sidebar = ({ activePage, setActivePage, setActiveTab }) => {
  const [expanded, setExpanded] = useState(true)
  const [franchiseExpanded, setFranchiseExpanded] = useState(false)

  const handleNavClick = (page, tab = "") => {
    setActivePage(page)
    if (tab) {
      setActiveTab(tab)
    }
  }

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  const toggleFranchise = (e) => {
    e.stopPropagation()
    setFranchiseExpanded(!franchiseExpanded)
  }

  return (
    <aside className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <nav className="sidebar-nav">
        <div className="nav-item franchise-item">
          <button
            className={`nav-button ${activePage === "franchise-management" ? "active" : ""}`}
            onClick={() => handleNavClick("franchise-management")}
          >
            <i className="fas fa-building"></i>
            <span>Franchise Leads Management</span>
            <i
              className={`fas ${franchiseExpanded ? "fa-minus" : "fa-plus"} `}
              onClick={toggleFranchise}
            ></i>
          </button>

          {franchiseExpanded && (
             <><div className="nav-item">
              <button
                className={`nav-button ${activePage === "dashboard" ? "active" : ""}`}
                onClick={() => handleNavClick("dashboard")}
              >
                <i className="fas fa-th-large"></i>
                <span>Dashboard</span>
              </button>
            </div><div className="nav-item">
                <button
                  className={`nav-button ${activePage === "upload-leads" ? "active" : ""}`}
                  onClick={() => handleNavClick("upload-leads")}
                >
                  <i className="fas fa-upload"></i>
                  <span>Upload Leads</span>
                </button>
              </div><div className="nav-item">
                <button
                  className={`nav-button ${activePage === "leads-management" ? "active" : ""}`}
                  onClick={() => handleNavClick("leads-management")}
                >
                  <i className="fas fa-users"></i>
                  <span>Leads Management</span>
                </button>
              </div><div className="nav-item">
                <button
                  className={`nav-button ${activePage === "promotion-tools" ? "active" : ""}`}
                  onClick={() => handleNavClick("promotion-tools")}
                >
                  <i className="fas fa-bullhorn"></i>
                  <span>Promotion Tools</span>
                </button>
              </div><div className="nav-item">
                <button
                  className={`nav-button ${activePage === "reports" ? "active" : ""}`}
                  onClick={() => handleNavClick("reports")}
                >
                  <i className="fas fa-chart-bar"></i>
                  <span>Reports & Analytics</span>
                </button>
              </div></>
          )}
        </div>

       
      </nav>
    </aside>
  )
}

export default Sidebar


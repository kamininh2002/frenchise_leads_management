"use client"

import { useState } from "react"
import "./App.css"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import Dashboard from "./pages/Dashboard"
import LeadsManagement from "./pages/LeadsManagement"
import UploadLeads from "./pages/UploadLeads"
import DataCleaning from "./pages/DataCleaning"
import EmailVerification from "./pages/EmailVerification"
import BulkVerification from "./pages/BulkVerification"
import Filter from "./pages/Filter"
import Promotion from "./pages/Promotion"  // Import the Promotion component

function App() {
  const [activePage, setActivePage] = useState("dashboard")
  const [activeTab, setActiveTab] = useState("")

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard setActivePage={setActivePage} />
      case "leads-management":
        return <LeadsManagement />
      case "upload-leads":
        if (activeTab === "upload-new-lead") {
          return <UploadLeads uploadType="new" />
        } else if (activeTab === "upload-prospect-leads") {
          return <UploadLeads uploadType="prospect" />
        } else {
          return <UploadLeads uploadType="existing" />
        }
      case "data-cleaning":
        return <DataCleaning setActivePage={setActivePage} setActiveTab={setActiveTab} />
      case "email-verification":
        return <EmailVerification setActivePage={setActivePage} />
      case "bulk-verification":
        return <BulkVerification setActivePage={setActivePage} />
      case "filter":
        return <Filter setActivePage={setActivePage} />
      case "promotion-tools":  // This case handles the Promotion component
        return <Promotion setActivePage={setActivePage} setActiveTab={setActiveTab} />
      default:
        return <Dashboard setActivePage={setActivePage} />
    }
  }

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar activePage={activePage} setActivePage={setActivePage} setActiveTab={setActiveTab} />
        <main className="content">{renderPage()}</main>
      </div>
    </div>
  )
}

export default App
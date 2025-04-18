import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

// Add Font Awesome for icons
const fontAwesome = document.createElement("link")
fontAwesome.rel = "stylesheet"
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
document.head.appendChild(fontAwesome)

// Add Google Fonts
const googleFonts = document.createElement("link")
googleFonts.rel = "stylesheet"
googleFonts.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
document.head.appendChild(googleFonts)

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


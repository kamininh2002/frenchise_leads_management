import "./Header.css"
import logo from "../assets/logo.png"

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo || "/placeholder.svg"} alt="Talent Corner HR Services" className="logo" />
        <h1>Talent Corner HR Services Pvt. Ltd</h1>
      </div>
      <div className="header-actions">
        <button className="help-btn">
          <i className="fas fa-question-circle"></i>
        </button>
        <div className="user-profile">
          <div className="avatar"></div>
        </div>
      </div>
    </header>
  )
}

export default Header


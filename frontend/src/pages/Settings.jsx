import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MdArrowBack,
  MdPerson, 
  MdSettings, 
  MdSecurity, 
  MdHelp, 
  MdLogout, 
  MdInfoOutline, 
  MdVpnKey, 
  MdPersonRemove, 
  MdTranslate,
  MdWarning,
  MdError
} from "react-icons/md";
import { useLanguage } from "../context/LanguageContext";
import "../styles/settings.css";

const Settings = ({ isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");
  const [modal, setModal] = useState({
    show: false,
    type: "", // 'logout' or 'delete'
    title: "",
    message: "",
    confirmAction: null
  });
  
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || "User",
    email: localStorage.getItem("userEmail") || "Not provided",
    phone: localStorage.getItem("userPhone") || "Not provided"
  });

  const handleLogout = () => {
    setModal({
      show: true,
      type: "logout",
      title: t("logout"),
      message: t("logout_confirm"),
      confirmAction: () => {
        localStorage.clear();
        window.location.href = "/login";
      }
    });
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleDeleteAccount = () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      alert("Session expired. Please log in again.");
      localStorage.clear();
      navigate("/login");
      return;
    }

    setModal({
      show: true,
      type: "delete",
      title: t("delete_account"),
      message: t("delete_account_confirm"),
      confirmAction: async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/user/${userId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          const data = await response.json();

          if (response.ok) {
            alert(data.message || "Account deleted successfully.");
            localStorage.clear();
            window.location.href = "/signup"; // Redirect to signup after deletion
          } else {
            alert(data.message || data.msg || "Failed to delete account. Please try logging in again.");
          }
        } catch (err) {
          console.error("Delete Account Error:", err);
          alert("A network error occurred. Please try again later.");
        }
      }
    });
  };

  const renderProfile = () => (
    <div className="settings-section">
      <div className="content-header">
        <h3>{t("profile")} {t("settings")}</h3>
        <p>Manage your public profile and contact information</p>
      </div>
      <div className="settings-group">
        <div className="setting-card">
          <div className="setting-info">
            <h5>{t("full_name")}</h5>
            <p>{user.name}</p>
          </div>
          <button className="action-btn" onClick={() => navigate("/profile")}>Edit</button>
        </div>
        <div className="setting-card">
          <div className="setting-info">
            <h5>{t("email_address")}</h5>
            <p>{user.email}</p>
          </div>
          <button className="action-btn" onClick={() => navigate("/profile")}>Update</button>
        </div>
        <div className="setting-card">
          <div className="setting-info">
            <h5>{t("phone_number")}</h5>
            <p>{user.phone}</p>
          </div>
          <button className="action-btn" onClick={() => navigate("/profile")}>Add</button>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="settings-section">
      <div className="content-header">
        <h3>{t("preferences")}</h3>
        <p>Customize your experience on LocalSathi</p>
      </div>
      <div className="settings-group">
        <div className="setting-card">
          <div className="setting-info">
            <h5>{t("app_language")}</h5>
            <p>{t("select_language")}</p>
          </div>
          <div className="language-selector">
            <div className="select-wrapper">
              <MdTranslate className="select-icon" />
              <select 
                value={language} 
                onChange={handleLanguageChange}
                className="settings-select"
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Spanish">Español (Spanish)</option>
                <option value="French">Français (French)</option>
                <option value="German">Deutsch (German)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="settings-section">
      <div className="content-header">
        <h3>{t("security")} & Privacy</h3>
        <p>Keep your account safe and secure</p>
      </div>
      <div className="settings-group">
        <div className="setting-card">
          <div className="setting-info">
            <h5>{t("change_password")}</h5>
            <p>Update your password regularly to stay safe</p>
          </div>
          <button className="action-btn" onClick={() => navigate("/change-password")}>
            <MdVpnKey /> Update
          </button>
        </div>
        <div className="setting-card">
          <div className="setting-info">
            <h5>{t("delete_account")}</h5>
            <p>Permanently remove your account and data</p>
          </div>
          <button className="action-btn danger-btn" onClick={handleDeleteAccount}>
            <MdPersonRemove /> Delete
          </button>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="settings-section">
      <div className="content-header">
        <h3>{t("about")} LocalSathi</h3>
        <p>Information about the application and legal</p>
      </div>
      <div className="settings-group">
        <div className="setting-card">
          <div className="setting-info">
            <h5>{t("terms_of_service")}</h5>
            <p>Read our usage guidelines</p>
          </div>
          <button className="action-btn" onClick={() => navigate("/terms")}>View</button>
        </div>
        <div className="setting-card">
          <div className="setting-info">
            <h5>{t("privacy_policy")}</h5>
            <p>How we handle your data</p>
          </div>
          <button className="action-btn" onClick={() => navigate("/privacy")}>View</button>
        </div>
      </div>
    </div>
  );

  const Modal = () => (
    <div className="modal-overlay" onClick={() => setModal({ ...modal, show: false })}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">
          {modal.type === "delete" ? <MdError /> : <MdWarning />}
        </div>
        <h4>{modal.confirmAction === null ? "Notice" : modal.title}</h4>
        <p>{modal.message}</p>
        <div className="modal-actions">
          {modal.confirmAction && (
            <button className="secondary-btn" onClick={() => setModal({ ...modal, show: false })}>
              Cancel
            </button>
          )}
          <button 
            className={`primary-btn ${modal.type === "delete" ? "danger" : ""}`}
            onClick={() => {
              if (modal.confirmAction) modal.confirmAction();
              setModal({ ...modal, show: false });
            }}
          >
            {modal.confirmAction ? "Confirm" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`settings-wrapper ${isDarkMode ? "dark-theme" : ""}`}>
      <div className="settings-layout">
        <aside className="settings-sidebar">
          <div className="sidebar-header">
            <button className="back-arrow" onClick={() => navigate(-1)}>
              <MdArrowBack />
            </button>
            <h2>{t("settings")}</h2>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <MdPerson className="nav-icon" />
              <span>{t("profile")}</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "preferences" ? "active" : ""}`}
              onClick={() => setActiveTab("preferences")}
            >
              <MdSettings className="nav-icon" />
              <span>{t("preferences")}</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <MdSecurity className="nav-icon" />
              <span>{t("security")}</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              <MdHelp className="nav-icon" />
              <span>{t("about")}</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item logout-item" onClick={handleLogout}>
              <MdLogout className="nav-icon" />
              <span>{t("logout")}</span>
            </button>
          </div>
        </aside>

        <main className="settings-content">
          {activeTab === "profile" && renderProfile()}
          {activeTab === "preferences" && renderPreferences()}
           {activeTab === "security" && renderSecurity()}
          {activeTab === "about" && renderAbout()}
        </main>
        {modal.show && <Modal />}
      </div>
    </div>
  );
};

export default Settings;
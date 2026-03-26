import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle, MdError } from "react-icons/md";
import { useLanguage } from "../context/LanguageContext";
import "../styles/settings.css"; // Reuse settings styles

export default function ChangePassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    type: "", // 'success' or 'error'
    title: "",
    message: ""
  });

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setModal({ show: true, type: "error", title: "Error", message: t("pass_mismatch") });
    }

    if (formData.newPassword.length < 6) {
      return setModal({ show: true, type: "error", title: "Error", message: t("pass_too_short") });
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setModal({ show: true, type: "success", title: "Success", message: t("pass_update_success") });
        setTimeout(() => navigate("/setting"), 2500);
      } else {
        // Map backend error messages to translations if possible
        let errorMsg = data.message;
        if (errorMsg === "Incorrect old password") errorMsg = t("incorrect_old_pass");
        setModal({ show: true, type: "error", title: "Error", message: errorMsg });
      }
    } catch (err) {
      setModal({ show: true, type: "error", title: "Error", message: "Connection error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-wrapper">
      <div className="settings-layout" style={{ maxWidth: "600px", height: "auto", minHeight: "500px" }}>
        <div className="settings-content" style={{ width: "100%" }}>
          <div className="sidebar-header" style={{ padding: 0, marginBottom: "30px" }}>
            <button className="back-arrow" onClick={() => navigate(-1)}>
              <MdArrowBack />
            </button>
            <h2>{t("change_password")}</h2>
          </div>

          <form onSubmit={handleSubmit} className="settings-group">
            <div className="setting-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "15px" }}>
              <div className="setting-info" style={{ width: "100%" }}>
                <h5>{t("old_password")}</h5>
                <div style={{ position: "relative", width: "100%", marginTop: "8px" }}>
                  <input
                    type={showOld ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    className="settings-input"
                    style={{ maxWidth: "100%", paddingRight: "45px" }}
                    placeholder={t("enter_current_password")}
                    required
                  />
                  <div 
                    onClick={() => setShowOld(!showOld)} 
                    style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-dim)" }}
                  >
                    {showOld ? <MdVisibilityOff /> : <MdVisibility />}
                  </div>
                </div>
              </div>

              <div className="setting-info" style={{ width: "100%" }}>
                <h5>{t("new_password")}</h5>
                <div style={{ position: "relative", width: "100%", marginTop: "8px" }}>
                  <input
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="settings-input"
                    style={{ maxWidth: "100%", paddingRight: "45px" }}
                    placeholder={t("enter_new_password")}
                    required
                  />
                  <div 
                    onClick={() => setShowNew(!showNew)} 
                    style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-dim)" }}
                  >
                    {showNew ? <MdVisibilityOff /> : <MdVisibility />}
                  </div>
                </div>
              </div>

              <div className="setting-info" style={{ width: "100%" }}>
                <h5>{t("confirm_new_password")}</h5>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="settings-input"
                  style={{ maxWidth: "100%", marginTop: "8px" }}
                  placeholder={t("reenter_new_password")}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="action-btn" 
                disabled={loading}
                style={{ width: "100%", maxWidth: "100%", height: "45px", marginTop: "10px" }}
              >
                {loading ? t("updating") : t("update_password")}
              </button>
            </div>
          </form>
        </div>
        {modal.show && (
          <div className="modal-overlay" onClick={() => setModal({ ...modal, show: false })}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-icon" style={{ color: modal.type === "success" ? "#10b981" : "var(--danger)" }}>
                {modal.type === "success" ? <MdCheckCircle /> : <MdError />}
              </div>
              <h4>{modal.title}</h4>
              <p>{modal.message}</p>
              <div className="modal-actions">
                <button 
                  className="primary-btn" 
                  onClick={() => setModal({ ...modal, show: false })}
                >
                  {modal.type === "success" ? "Great!" : "Try Again"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

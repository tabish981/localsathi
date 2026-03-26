import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/auth.css";
import gatewayImg from "../assets/login.jpg";
import logo from "../assets/logo.png";
import eyeIcon from "../assets/eye.svg";
import eyeOffIcon from "../assets/eye-off.svg";

export default function ResetPassword() {
  const { t } = useLanguage();
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("pass_mismatch") || "Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError(t("pass_too_short") || "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password");
      } else {
        setSuccess(data.message || "Password has been reset successfully");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError("Server error. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-frame">

        {/* LEFT IMAGE */}
        <div className="auth-left">
          <img
            src={gatewayImg}
            alt="Gateway"
            className="gateway-img"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">

          <div className="auth-card">

            <img src={logo} alt="Logo" className="auth-logo" />

            <h2 className="auth-title">
              <span>➔</span> Reset Password
            </h2>
            <p className="auth-subtitle" style={{ textAlign: "center", marginBottom: "20px", color: "var(--text-dim)" }}>
              Enter your new password below.
            </p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center", fontSize: "14px" }}>{success}</div>}

            <form 
              className="form-content" 
              onSubmit={(e) => {
                e.preventDefault();
                handleReset();
              }}
            >
              <div className="signup-input-group">
                <label>New Password</label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-icon-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <img
                      src={showPassword ? eyeOffIcon : eyeIcon}
                      alt="toggle"
                      className="password-toggle-icon"
                    />
                  </span>
                </div>
              </div>

              <div className="signup-input-group">
                <label>Confirm Password</label>
                <div className="password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-icon-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <img
                      src={showConfirmPassword ? eyeOffIcon : eyeIcon}
                      alt="toggle"
                      className="password-toggle-icon"
                    />
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className={`auth-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "..." : "Update Password"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

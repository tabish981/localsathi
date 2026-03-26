import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/auth.css";
import gatewayImg from "../assets/login.jpg";
import logo from "../assets/logo.png";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to process request");
      } else {
        setSuccess(data.message || "Instructions have been sent to your email");
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
              <span>➔</span> Forgot Password
            </h2>
            <p className="auth-subtitle" style={{ textAlign: "center", marginBottom: "20px", color: "var(--text-dim)" }}>
              Enter your email associated with your account to receive reset instructions.
            </p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center", fontSize: "14px" }}>{success}</div>}

            <form 
              className="form-content" 
              onSubmit={(e) => {
                e.preventDefault();
                handleForgot();
              }}
            >
              <div className="signup-input-group">
                <label>{t("email_address") || "Email Address"}</label>
                <input
                  type="email"
                  placeholder={t("email_placeholder") || "Enter your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`auth-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "..." : "Reset Password"}
              </button>
            </form>

            <div className="auth-links">
              <Link to="/login">Back to Login</Link>
              <Link to="/signup">{t("create_account")}</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

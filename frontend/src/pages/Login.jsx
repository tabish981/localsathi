import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/auth.css";
import gatewayImg from "../assets/login.jpg";
import logo from "../assets/logo.png";
import eyeIcon from "../assets/eye.svg";
import eyeOffIcon from "../assets/eye-off.svg";

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.clear();

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userGender", data.user.gender || "");
        localStorage.setItem("userBudget", data.user.budget || "");

        window.location.href = "/home";
      } else {
        setError("Login successful but server data is incomplete.");
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
              <span>➔</span> {t("login")}
            </h2>

            {error && <div className="auth-error">{error}</div>}

            <form 
              className="form-content" 
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="signup-input-group">
                <label>{t("email_address")}</label>
                <input
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="signup-input-group">
                <label>{t("password")}</label>
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

              <button
                type="submit"
                className={`auth-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "..." : t("login")}
              </button>
            </form>

            <div className="auth-links">
              <Link to="/forgot">Forgot Password?</Link>
              <Link to="/signup">{t("create_account")}</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
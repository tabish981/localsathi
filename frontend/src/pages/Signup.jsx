import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/signup.css";
import gatewayImg from "../assets/login.jpg";
import logo from "../assets/logo.png";
import eyeIcon from "../assets/eye.svg";
import eyeOffIcon from "../assets/eye-off.svg";

export default function Signup() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      const generatedUsername =
        formData.name.toLowerCase().replace(/\s+/g, "") +
        Math.floor(Math.random() * 1000);

      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          username: generatedUsername,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      if (data.user?._id && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userGender", data.user.gender || formData.gender || "");
        window.location.href = "/home";
      }
    } catch (err) {
      setError("Server error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-frame">

        {/* LEFT IMAGE */}
        <div className="signup-left">
          <img
            src={gatewayImg}
            alt="Gateway"
            className="signup-gateway-img"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="signup-right">

          <div className="signup-card">

            <img src={logo} alt="Logo" className="signup-logo" />

            <h2 className="signup-title">
              <span>➔</span> {t("signup")}
            </h2>

            {error && <p className="signup-error">{error}</p>}

            <div className="form-content">

              <div className="signup-input-group">
                <label>{t("full_name")}</label>
                <input
                  type="text"
                  name="name"
                  placeholder={t("name_placeholder")}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-input-group">
                <label>{t("email_address")}</label>
                <input
                  type="email"
                  name="email"
                  placeholder={t("email_placeholder")}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-input-group">
                <label>{t("gender")}</label>
                <select name="gender" onChange={handleChange} required>
                  <option value="">{t("select_gender")}</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="signup-input-group">
                <label>{t("password")}</label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("password_placeholder")}
                    onChange={handleChange}
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
                type="button"
                className={`signup-btn ${loading ? "loading" : ""}`}
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? <span className="spinner"></span> : t("create_account")}
              </button>

            </div>

            <div className="signup-links">
              <Link to="/login">
                {t("already_have_account")}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
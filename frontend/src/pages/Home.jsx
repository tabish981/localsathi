import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import HamburgerMenu from "../components/HamburgerMenu";
import LocalsathiBot from "../components/LocalsathiBot";
import Footer from "../components/Footer";
import "../styles/home.css";

import logo from "../assets/logo.png";
import bgImage from "../assets/bg.jpg";
import nearbyImg from "../assets/nearby.svg";
import planImg from "../assets/plan.svg";
import cityImg from "../assets/city.svg";
import suggestionImg from "../assets/suggestion.svg";

import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const [userName, setUserName] = useState("User");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [title, setTitle] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const name = localStorage.getItem("userName") || "User";
      const gender = localStorage.getItem("userGender")?.toLowerCase();

      setUserName(name);
      if (gender === "male") setTitle("Mr. ");
      else if (gender === "female") setTitle("Ms. ");

      let finalEmail = localStorage.getItem("userEmail") || "";
      let finalPhone = localStorage.getItem("userPhone") || "";

      if (userId && token) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile/${userId}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (res.ok) {
            const data = await res.json();
            if (data.email) finalEmail = data.email;
            if (data.phone) finalPhone = data.phone;
            if (data.avatar) setAvatar(data.avatar);

            localStorage.setItem("userEmail", finalEmail);
            localStorage.setItem("userPhone", finalPhone);
          }
        } catch (err) {
          console.error("Failed to sync profile fast-fetch in Home page", err);
        }
      }

      setEmail(finalEmail);
      setPhone(finalPhone);
    };

    const fetchFeedbacks = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/feedback");
        if (res.ok) setFeedbacks(await res.json());
      } catch (err) {
        console.error("Failed to fetch feedback", err);
      }
    };

    fetchUserData();
    fetchFeedbacks();
  }, []);

  // AUTO SCROLL LOGIC: Scroll every 5 seconds
  useEffect(() => {
    if (feedbacks.length === 0) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const cardWidth = 350 + 25; // slide width + gap

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [feedbacks]);

  const initial = userName.charAt(0).toUpperCase();

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      {menuOpen && <HamburgerMenu closeMenu={() => setMenuOpen(false)} />}

      <div
        className="home-wrapper"
        onMouseMove={handleMouseMove}
        style={{
          "--bg-image": `url(${bgImage})`,
          "--mouse-x": `${mousePos.x}px`,
          "--mouse-y": `${mousePos.y}px`
        }}
      >

        <div className="bg-overlay"></div>

        {/* HEADER */}
        <header className="home-header">
          <div className="menu-icon" onClick={() => setMenuOpen(true)}>
            ☰
          </div>

          <div style={{ position: "relative" }}>
            <div
              className="brand-wrapper"
              onClick={() => setAboutOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <img src={logo} alt="logo" className="brand-logo" />
              <h1 className="app-title">
                <span className="brand-light">Local</span>
                <span className="brand-bold">Sathi</span>
              </h1>
            </div>

            {/* INVISIBLE OVERLAY TO CLOSE ABOUT */}
            {aboutOpen && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 1999 }}
                onClick={(e) => { e.stopPropagation(); setAboutOpen(false); }}
              />
            )}

            {/* ABOUT LOCALSATHI CARD */}
            {aboutOpen && (
              <div
                className="about-card-popup"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="about-card-header">
                  <div className="about-icon-bounce">
                    <img src={logo} alt="LocalSathi" className="about-card-logo" />
                  </div>
                  <h3>Discover <span style={{ color: "#FFD700" }}>LocalSathi</span></h3>
                </div>
                <p className="about-text">
                  Your ultimate local companion. Designed to make city exploration effortless, planning your journey seamless, and discovering nearby hidden gems magical.
                </p>
                <div className="about-stats">
                  <div className="stat">
                    <span className="stat-icon">👥</span>
                    <strong>10K+</strong>
                    <span>Users</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🏙️</span>
                    <strong>50+</strong>
                    <span>Cities</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">⭐</span>
                    <strong>4.8</strong>
                    <span>Rating</span>
                  </div>
                </div>
                <button
                  className="about-close-btn"
                  onClick={() => setAboutOpen(false)}
                >
                  Start Exploring
                </button>
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <div
              className="profile-icon"
              onClick={() => setProfileOpen(true)}
              style={{
                backgroundImage: avatar ? `url(${avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: avatar ? 'transparent' : 'inherit'
              }}
            >
              {!avatar && initial}
            </div>

            {/* INVISIBLE OVERLAY TO CLOSE PROFILE */}
            {profileOpen && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 1999 }}
                onClick={(e) => { e.stopPropagation(); setProfileOpen(false); }}
              />
            )}

            {/* PROFILE DROP-DOWN CARD */}
            {profileOpen && (
              <div
                className="profile-card-top"
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
                  {avatar ? (
                    <img src={avatar} alt="Profile" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #3b82f6" }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", border: "2px solid rgba(255,255,255,0.2)", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
                      {initial}
                    </div>
                  )}
                </div>
                <div className="profile-field">
                  <span>{t("full_name")}:</span>
                  <div className="profile-value">{userName}</div>
                </div>

                <div className="profile-field">
                  <span>{t("email_address")}:</span>
                  <div className="profile-value">{email || t("not_provided")}</div>
                </div>

                <div className="profile-field">
                  <span>{t("phone_number")}:</span>
                  <div className="profile-value">{phone || t("not_provided")}</div>
                </div>

                <Link
                  to="/profile"
                  className="profile-view-btn"
                  onClick={() => setProfileOpen(false)}
                >
                  {t("view_profile")}
                </Link>
              </div>
            )}
          </div>
        </header>

        <div className="home-main-content">
          {/* WELCOME */}
          <section className="welcome-section">
            <h2 className="welcome-text">
              {t("welcome")} {title}{userName}
            </h2>
          </section>

          {/* CARDS */}
          <main className="card-grid">
            <Link to="/nearby" className="feature-card">
              <div className="card-content">
                <img src={nearbyImg} alt="Nearby" className="card-icon" />
                <span className="card-label">{t("nearby_places")}</span>
              </div>
            </Link>

            <Link to="/plan" className="feature-card">
              <div className="card-content">
                <img src={planImg} alt="Plan" className="card-icon" />
                <span className="card-label">{t("plan_journey")}</span>
              </div>
            </Link>

            <Link to="/city" className="feature-card">
              <div className="card-content">
                <img src={cityImg} alt="City" className="card-icon" />
                <span className="card-label">{t("city_guide")}</span>
              </div>
            </Link>

            <Link to="/suggestion" className="feature-card suggestion-card">
              <div className="card-content">
                <img src={suggestionImg} alt="Suggestion" className="card-icon" />
                <span className="card-label">{t("suggestion")}</span>
              </div>
            </Link>
          </main>

          {/* FEEDBACK SLIDER */}
          {feedbacks.length > 0 && (
            <section className="feedback-slider-container">
              <h3 className="slider-title">{t("what_users_say")}</h3>
              <div className="feedback-slider-wrapper" ref={sliderRef}>
                <div className="feedback-slider">
                  {feedbacks.map((fb, idx) => (
                    <div key={idx} className="feedback-slide">
                      <div className="fb-header">
                        <div className="fb-avatar">
                          {fb.userName ? fb.userName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="fb-name">
                          <h4>{fb.userName || "Anonymous"}</h4>
                          <div className="fb-rating">
                            {"★".repeat(fb.rating || 0)}
                            {"☆".repeat(Math.max(0, 5 - (fb.rating || 0)))}
                          </div>
                        </div>
                      </div>
                      <p className="fb-comment">
                        "{fb.suggestion || fb.problem || t("great_experience")}"
                      </p>
                    </div>
                  ))}

                  <div className="feedback-slide more-slide-btn">
                    <Link to="/feedback" className="leave-fb-btn">
                      {t("share_experience")}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* SEPARATE FOOTER SECTION */}
      <Footer />

      {/* <LocalsathiBot /> */}
    </>
  );
}
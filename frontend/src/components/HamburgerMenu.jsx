import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function HamburgerMenu({ closeMenu }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Overlay */}
      <div className="menu-overlay" onClick={closeMenu}></div>

      {/* Sliding Menu */}
      <div className="hamburger-menu slide-in">
        <div className="menu-header">
          <h3>{t("menu")}</h3>
          <button className="close-btn" onClick={closeMenu}>✕</button>
        </div>

        <nav className="menu-links">
          <a onClick={() => { navigate("/profile"); closeMenu(); }}>{t("profile")}</a>
          <a onClick={() => { navigate("/trips"); closeMenu(); }}>{t("previous_trips")}</a>
          <a onClick={() => { navigate("/nearby"); closeMenu(); }}>{t("nearby_places")}</a>
          <a onClick={() => { navigate("/plan"); closeMenu(); }}>{t("plan_journey")}</a>
          <a onClick={() => { navigate("/expense"); closeMenu(); }}>{t("expense_estimator")}</a>
          <a onClick={() => { navigate("/feedback"); closeMenu(); }}>{t("feedback")}</a>
          <a onClick={() => { navigate("/contact"); closeMenu(); }}>{t("contact_us")}</a>
          <a onClick={() => { navigate("/setting"); closeMenu(); }}>{t("settings")}</a>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          {t("logout")}
        </button>
      </div>
    </>
  );
}
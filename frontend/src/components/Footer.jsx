import { Link } from "react-router-dom";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import logo from "../assets/logo.png";
import { useLanguage } from "../context/LanguageContext";
import "../styles/footer.css";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand-section">
            <div className="footer-logo-wrapper">
              <img src={logo} alt="logo" className="footer-logo-img" />
              <div className="footer-brand-text">
                <span className="brand-light">Local</span>
                <span className="brand-bold">Sathi</span>
              </div>
            </div>
            <p className="footer-description">
              {t("footer_desc")}
            </p>
            <div className="footer-contact-info">
              <a href="mailto:localsathi579@gmail.com" className="footer-contact-item">
                <FaEnvelope /> <span>localsathi579@gmail.com</span>
              </a>
              <a href="tel:9870585196" className="footer-contact-item">
                <FaPhone /> <span>9870585196</span>
              </a>
            </div>
          </div>

          <div className="footer-links-section">
            <div className="footer-link-group">
              <h4>{t("quick_links")}</h4>
              <ul>
                <li><Link to="/nearby">{t("nearby_places")}</Link></li>
                <li><Link to="/plan">{t("plan_journey")}</Link></li>
                <li><Link to="/city">{t("city_guide")}</Link></li>
              </ul>
            </div>
            <div className="footer-link-group">
              <h4>{t("contact_info")}</h4>
              <ul>
                <li><Link to="/feedback">{t("feedback")}</Link></li>
                <li><Link to="/contact">{t("contact_us")}</Link></li>
                <li><Link to="/profile">{t("view_profile")}</Link></li>
              </ul>
            </div>
            <div className="footer-link-group">
              <h4>{t("legal") || "Legal"}</h4>
              <ul>
                <li><Link to="/privacy">{t("privacy_policy")}</Link></li>
                <li><Link to="/terms">{t("terms_of_service")}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 LocalSathi. {t("all_rights_reserved")}. {t("made_for_mumbai")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

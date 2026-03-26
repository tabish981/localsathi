import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { MdHistory, MdDeleteOutline, MdArrowForward, MdRoute, MdAttachMoney, MdDirectionsCar } from "react-icons/md";
import "../styles/previousTrips.css";

export default function PreviousTrips() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/trips/${userId}`);
        const data = await res.json();
        setTrips(data);
      } catch (err) {
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [userId]);

  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all trip history?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/trips/${userId}`, {
        method: "DELETE"
      });
      setTrips([]);
    } catch (err) {
      console.error("Error clearing trips:", err);
    }
  };

  const mostUsed = () => {
    if (trips.length === 0) return "N/A";
    const count = {};
    trips.forEach(t => count[t.mode] = (count[t.mode] || 0) + 1);
    return Object.keys(count).sort((a,b)=>count[b]-count[a])[0];
  };

  const planAgain = (trip) => {
    // We navigate to /plan and pass the trip data via state or pre-fill logic if implemented
    navigate("/plan", { state: { from: trip.from, to: trip.to } });
  };

  if (loading) return (
    <div className="trips-loading">
      <div className="spinner"></div>
      <p>Fetching your journey history...</p>
    </div>
  );

  return (
    <div className="trips-wrapper">
      <div className="trips-header-nav">
        <button onClick={() => navigate(-1)} className="back-arrow" aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h3 className="trips-title-text"><MdHistory className="title-icon" /> {t("previous_trips") || "Previous Trips"}</h3>
        {trips.length > 0 && (
          <button onClick={clearAll} className="clear-btn" title="Clear All History">
            <MdDeleteOutline size={22} />
          </button>
        )}
      </div>

      <div className="trips-content">
        {trips.length > 0 ? (
          <>
            <div className="stats-container">
              <div className="stat-card">
                <span className="stat-label">Total Trips</span>
                <span className="stat-value">{trips.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Most Used Mode</span>
                <span className="stat-value">{mostUsed()}</span>
              </div>
            </div>

            <div className="trips-list">
              {trips.map((t, i) => (
                <div key={i} className="trip-glass-card" onClick={() => planAgain(t)}>
                  <div className="trip-time">
                    {new Date(t.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="trip-main">
                    <div className="route-info">
                      <div className="loc from">{t.from}</div>
                      <div className="route-arrow"><MdArrowForward /></div>
                      <div className="loc to">{t.to}</div>
                    </div>
                    <div className="trip-meta">
                      <span className="meta-item"><MdDirectionsCar /> {t.mode}</span>
                      <span className="meta-item"><MdRoute /> {t.distance} km</span>
                      <span className="meta-item"><MdAttachMoney /> ₹{t.cost}</span>
                    </div>
                  </div>
                  <div className="plan-again-indicator">
                    <MdArrowForward size={24} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-trips-card">
            <div className="empty-icon">📂</div>
            <h4>No Journeys Found</h4>
            <p>Your search history will appear here once you start planning your journeys!</p>
            <button className="start-planning-btn" onClick={() => navigate("/plan")}>
              Start Planning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

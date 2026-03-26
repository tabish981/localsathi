import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import ExpenseEstimator from "./ExpenseEstimator";
import "../styles/suggestion.css";

const GOOGLE_KEY = "AIzaSyBOXYLhLbF6Y4pGHdmVv8tRaxAxL0v5e1E";

const BUDGET_MAPPING = {
  comfort: {
    food: "street foods",
    transport: "public transport",
    stay: "hostel",
    places: "free places to visit"
  },
  premium: {
    food: "fine dining restaurant",
    transport: "car rental",
    stay: "luxury hotel",
    places: "shopping malls"
  }
};

const SUGGESTIONS_BASE = [
  { id: 1, title_key: "dining", type: "food", desc_key: "dining_desc" },
  { id: 2, title_key: "transport_options", type: "transport", desc_key: "transport_desc" },
  { id: 3, title_key: "places_relax", type: "places", desc_key: "relax_desc" },
  { id: 4, title_key: "ideal_stay", type: "stay", desc_key: "stay_desc" }
];

export default function Suggestion() {
  const location = useLocation();
  const { t } = useLanguage();
  const [googleApi, setGoogleApi] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showEstimator, setShowEstimator] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const budget = location.state?.budgetType || localStorage.getItem("userBudget") || "comfort";
  const userName = localStorage.getItem("userName") || "Anonymous";

  useEffect(() => {
    setOpenId(null);
    setResults([]);
  }, [budget]);

  useEffect(() => {
    if (window.google?.maps?.places) {
      setGoogleApi(window.google);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleApi(window.google);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchPlaces = (item) => {
    if (!googleApi || !userLoc) return;
    if (openId === item.id) {
      setOpenId(null);
      return;
    }
    setOpenId(item.id);
    setLoading(true);
    setResults([]);
    const service = new googleApi.maps.places.PlacesService(document.createElement("div"));
    const searchKeyword = BUDGET_MAPPING[budget][item.type];
    const request = {
      location: userLoc,
      radius: 5000,
      keyword: searchKeyword
    };
    service.nearbySearch(request, (res, status) => {
      setLoading(false);
      if (status === googleApi.maps.places.PlacesServiceStatus.OK && res) {
        const formatted = res.slice(0, 8).map((p) => ({
          name: p.name,
          address: p.vicinity,
          rating: p.rating,
          lat: p.geometry.location.lat(),
          lng: p.geometry.location.lng(),
          placeId: p.place_id
        }));
        setResults(formatted);
      } else {
        setResults([]);
      }
    });
  };

  const handlePlaceClick = async (place) => {
    setSelectedPlace(place);
    setLoadingReviews(true);
    setReviews([]);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reviews/${place.placeId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
    setLoadingReviews(false);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;
    setSubmittingReview(true);
    try {
      const payload = {
        placeId: selectedPlace.placeId,
        placeName: selectedPlace.name,
        userName,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      };
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setReviewForm({ rating: 5, comment: "" });
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    }
    setSubmittingReview(false);
  };

  const openInGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
  };

  return (
    <>
      {showEstimator && (
        <ExpenseEstimator onClose={() => setShowEstimator(false)} />
      )}
      <div className="suggestion-wrapper">
        <button className="change-budget-btn" onClick={() => setShowEstimator(true)}>
          {t("change_budget")}
        </button>
        
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-airplane">✈</div>
            <div className="hero-travel">{t("discover")}</div>
            <div className="hero-dash-container">
              <div className="hero-dash-line"></div>
              <div className="hero-the">LOCAL</div>
              <div className="hero-dash-line"></div>
            </div>
            <div className="hero-world">SATHI</div>
          </div>
          <div 
            className="hero-scroll" 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5"></path>
            </svg>
          </div>
        </div>

        {!openId ? (
          <div className="options-section" id="options-section">
            <div className="options-header">
              <div className="budget-badge">{budget.toUpperCase()} MODE</div>
              <h3>{t("local_suggestions")}</h3>
              <p className="budget-indicator">{t("finding_best_spots") || `Finding the best ${budget} spots near you`}</p>
            </div>

            <div className="bento-grid">
              <div className="bento-center">
                <span className="bc-travel">{t("discover")}</span>
                <span className="bc-the">- local -</span>
                <span className="bc-world">SATHI</span>
              </div>

              <div className="bento-row">
                <div className="bento-item bento-item-1" onClick={() => fetchPlaces(SUGGESTIONS_BASE[0])}>
                  <svg className="bento-icon-svg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                  </svg>
                  <div className="bento-title">{t("dining")}</div>
                </div>
                
                <div className="bento-item bento-item-2" onClick={() => fetchPlaces(SUGGESTIONS_BASE[1])}>
                  <div className="bento-title">{t("transport_options")}</div>
                  <svg className="bento-icon-svg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-2.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-6 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0" />
                  </svg>
                </div>
              </div>

              <div className="bento-row">
                <div className="bento-item bento-item-3" onClick={() => fetchPlaces(SUGGESTIONS_BASE[2])}>
                  <div className="bento-title">{t("places_relax")}</div>
                  <svg className="bento-icon-svg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
                    <line x1="6" y1="2" x2="6" y2="4"/>
                    <line x1="10" y1="2" x2="10" y2="4"/>
                    <line x1="14" y1="2" x2="14" y2="4"/>
                  </svg>
                </div>

                <div className="bento-item bento-item-4" onClick={() => fetchPlaces(SUGGESTIONS_BASE[3])}>
                  <div className="bento-title">{t("ideal_stay")}</div>
                  <svg className="bento-icon-svg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`places-fullscreen-section ${isClosing ? 'closing' : ''}`} id="options-section">
            <div className="places-fullscreen-header">
              <button 
                className="fullscreen-back-btn" 
                onClick={() => { 
                  setIsClosing(true);
                  setTimeout(() => {
                    setOpenId(null); 
                    setSelectedPlace(null); 
                    setIsClosing(false);
                  }, 400);
                }}
              >
                ← {t("back")}
              </button>
              <h2>
                {t(SUGGESTIONS_BASE.find(s => s.id === openId)?.title_key) || "Places"}
              </h2>
              <div style={{ width: '80px' }}></div>
            </div>

            <div className="places-fullscreen-body">
              <div className="places-list-col">
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>{t("scouting_places")}</p>
                  </div>
                ) : results.length > 0 ? (
                  results.map((r, i) => (
                    <div
                      key={i}
                      className={`result-item ${selectedPlace?.placeId === r.placeId ? 'selected-result' : ''}`}
                      onClick={() => handlePlaceClick(r)}
                    >
                      <div className="result-main">
                        <span className="name">{r.name}</span>
                        {r.rating && <span className="rating">⭐ {r.rating}</span>}
                      </div>
                      <div className="result-sub">
                        <span className="address">{r.address}</span>
                        <span className="map-link" onClick={(e) => { e.stopPropagation(); openInGoogleMaps(r.lat, r.lng); }}>
                          {t("view_on_map")} →
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>{t("no_results_found")}</p>
                  </div>
                )}
              </div>

              {selectedPlace && (
                <div className="review-side-panel">
                  <div className="review-header">
                    <h4>{selectedPlace.name}</h4>
                    <button className="close-panel-btn" onClick={() => setSelectedPlace(null)}>✕</button>
                  </div>
                  
                  <div className="review-content">
                    <div className="add-review-section">
                      <h5>{t("leave_review")}</h5>
                      <form onSubmit={submitReview} className="review-form">
                        <div className="rating-selector">
                          {[1, 2, 3, 4, 5].map(num => (
                            <span 
                              key={num} 
                              className={`star ${num <= reviewForm.rating ? 'active' : ''}`}
                              onClick={() => setReviewForm({...reviewForm, rating: num})}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <textarea 
                          placeholder={t("share_exp")} 
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                          required
                        ></textarea>
                        <button type="submit" disabled={submittingReview} className="submit-btn">
                          {submittingReview ? "..." : t("post_review")}
                        </button>
                      </form>
                    </div>

                    <div className="reviews-list-section">
                      <h5>{t("community_reviews")}</h5>
                      {loadingReviews ? (
                        <p className="loading-text">...</p>
                      ) : reviews.length > 0 ? (
                        <div className="reviews-list">
                          {reviews.map((rev, i) => (
                            <div key={i} className="review-card">
                              <div className="review-card-header">
                                <span className="reviewer-name">{rev.userName}</span>
                                <span className="reviewer-rating">
                                  {Array(rev.rating).fill("★").join("")}
                                </span>
                              </div>
                              <p className="review-comment">{rev.comment}</p>
                              <span className="review-date">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-reviews-text">No reviews yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { PLACES } from "../data/places";
import "../styles/cityGuide.css";

const Flashcard = ({ place, isFavorite, onToggleFavorite }) => {
  const { t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const name = t(`${place.key}_title`);
  const desc = t(`${place.key}_desc`);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`flashcard ${isFlipped ? "flipped" : ""}`} 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div 
            className={`fav-heart ${isFavorite ? "active" : ""}`} 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          >
            {isFavorite ? "❤️" : "🤍"}
          </div>
          <img src={place.image} alt={name} loading="lazy" />
          <h3 className="front-title">{name}</h3>
          <span className="region-tag">{place.region}</span>
        </div>

        <div className="flashcard-back">
          <div className="back-content">
            <h3>{name}</h3>
            <p>{desc}</p>
          </div>
          <a 
            className="direction-btn"
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {t("get_directions") || "Get Directions"}
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const MumbaiMap = ({ activeRegion, onRegionClick }) => {
  const { t } = useLanguage();
  const regions = [
    { 
      id: "North", 
      name: "NORTH", 
      icon: "🏞️",
      path: "M 25,5 L 45,2 L 70,5 L 85,20 L 95,50 L 75,75 L 60,70 L 40,65 L 20,60 L 12,35 Z", 
      textX: 53, textY: 38,
      fillColor: "rgba(100, 200, 100, 0.2)",
      desc: t("north_mumbai_desc") || "Home to lush national parks and peaceful beaches." 
    },
    { 
      id: "West", 
      name: "WEST", 
      icon: "🎬",
      path: "M 20,60 L 40,65 L 45,85 L 45,110 L 20,110 L 10,95 L 5,75 Z", 
      textX: 25, textY: 85,
      fillColor: "rgba(150, 150, 255, 0.2)",
      desc: t("western_suburbs_desc") || "The heart of Bollywood and vibrant nightlife." 
    },
    { 
      id: "Central", 
      name: "CENTRAL", 
      icon: "🏙️",
      path: "M 40,65 L 60,70 L 75,75 L 85,90 L 90,105 L 70,120 L 55,115 L 45,110 L 45,85 Z", 
      textX: 63, textY: 95,
      fillColor: "rgba(255, 200, 150, 0.2)",
      desc: t("central_mumbai_desc") || "The industrial pulse and commercial soul of the city." 
    },
    { 
      id: "South", 
      name: "SOUTH", 
      icon: "🏛️",
      path: "M 20,110 L 45,110 L 55,115 L 70,120 L 60,130 L 45,145 L 35,170 L 25,195 L 18,185 L 12,160 L 15,135 Z", 
      textX: 30, textY: 150,
      fillColor: "rgba(255, 100, 100, 0.2)",
      desc: t("south_mumbai_desc") || "Historic architecture and the iconic Queen's Necklace." 
    }
  ];

  const mumbaiOutline = "M 25,5 L 45,2 L 70,5 L 85,20 L 95,50 L 75,75 L 85,90 L 90,105 L 70,120 L 60,130 L 45,145 L 35,170 L 25,195 L 18,185 L 12,160 L 15,135 L 20,110 L 10,95 L 5,75 L 20,60 L 12,35 Z";
  const dottedBoundary = "M 12,35 L 20,60 L 40,65 L 45,85 L 45,110 L 20,110";

  const activeRegionData = regions.find(r => r.id === activeRegion);

  return (
    <div className="interactive-map-container premium-glass">
      <div className="map-labels">
        <div className="map-header">
          <h3>{t("select_region") || "Mumbai Regions"} 🗺️</h3>
          <p>{t("filter_by_region_desc") || "Click on the map to explore vibrant localities."}</p>
        </div>
        
        {activeRegion && (
          <motion.button 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="clear-map-btn"
            onClick={() => onRegionClick(null)}
          >
            ❌ Clear Selection
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {activeRegionData ? (
            <motion.div 
              key={activeRegion}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="region-info-box"
              style={{ '--accent-color': activeRegionData.color }}
            >
              <h4><span style={{ marginRight: '8px' }}>{activeRegionData.icon}</span> {activeRegionData.name}</h4>
              <p>{activeRegionData.desc}</p>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="region-info-box placeholder-info"
            >
              <h4>👋 Choose a region</h4>
              <p>Select any region on the interactive map to filter places and see more details here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="svg-map-wrapper">
        <svg viewBox="0 0 100 200" className="mumbai-svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* BASE MUMBAI LANDMASS */}
          <path d={mumbaiOutline} fill="#E0E0E0" />


          {/* ADDITIONAL BORDERS */}
          {regions.map(r => (
             <path key={`border-${r.id}`} d={r.path} fill="none" stroke="#d0d0d0" strokeWidth="0.5" strokeLinejoin="round" />
          ))}

          {/* INTERACTIVE REGIONS */}
          {regions.map(r => (
            <motion.g
              key={r.id}
              onClick={() => onRegionClick(r.id)}
              whileHover={{ scale: 1 }}
              style={{ cursor: 'pointer', transformOrigin: `${r.textX}px ${r.textY}px` }}
            >
              <motion.path
                d={r.path}
                className={`map-area ${activeRegion === r.id ? 'selected' : ''}`}
                initial={false}
                strokeLinejoin="round"
                strokeLinecap="round"
                animate={{
                  fill: activeRegion === r.id ? r.fillColor : "transparent",
                  stroke: activeRegion === r.id ? "#fff" : "transparent",
                  strokeWidth: activeRegion === r.id ? 2 : 0
                }}
                whileHover={{
                  fill: r.fillColor,
                  stroke: "rgba(255,255,255,0.8)",
                  strokeWidth: 1.5
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.text 
                x={r.textX} 
                y={r.textY - 3} 
                fontSize="6" 
                fill="#333333" 
                textAnchor="middle" 
                pointerEvents="none" 
                initial={false}
                animate={{
                  opacity: activeRegion === null || activeRegion === r.id ? 1 : 0.4
                }}
              >
                {r.icon}
              </motion.text>
              <motion.text 
                x={r.textX} 
                y={r.textY + 4} 
                fontSize="4" 
                fill="#333333" 
                textAnchor="middle" 
                pointerEvents="none" 
                fontFamily="sans-serif"
                fontWeight="bold"
                letterSpacing="0.4"
                initial={false}
                animate={{
                  opacity: activeRegion === null || activeRegion === r.id ? 1 : 0.4
                }}
              >
                {r.name}
              </motion.text>
            </motion.g>
          ))}
          
        </svg>
      </div>
    </div>
  );
};

export default function CityGuide() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [userFavorites, setUserFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Filtered places based on map selection
  const filteredPlaces = selectedRegion 
    ? PLACES.filter(p => p.region === selectedRegion) 
    : PLACES;

  // 🔄 Fetch real favorites & reviews on load
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/user/${userId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setUserFavorites(data.favorites || []);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reviews/general_mumbai`);
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    fetchUserData();
    fetchReviews();
  }, [userId, token]);

  // 🏆 Badge Unlocking Logic
  const checkBadges = async (updatedFavorites) => {
    if (updatedFavorites.length >= 3) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/user/${userId}/badge`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({
            name: "Mumbai Explorer",
            icon: "🏆",
            description: "Unlocked for favoriting 3 iconic places!"
          })
        });
      } catch (err) {
        console.error("Badge unlock failed:", err);
      }
    }
  };

  const toggleFavorite = async (placeKey) => {
    if (!userId || !token) {
      alert("Please login to save favorites!");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/user/${userId}/favorite`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ placeKey })
      });
      const updatedFavs = await res.json();
      setUserFavorites(updatedFavs);
      checkBadges(updatedFavs);
    } catch (err) {
      console.error("Toggle favorite failed:", err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!userId) return alert("Login to post reviews!");
    setIsSubmitting(true);
    try {
      await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: "general_mumbai",
          placeName: "Mumbai Guide",
          userName: localStorage.getItem("username") || "Explorer",
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      alert("Review posted! 🗣️");
      setShowReviewModal(false);
      setNewReview({ rating: 5, comment: "" });
      
      // Refresh reviews
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reviews/general_mumbai`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      alert("Failed to post review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="city-wrapper">
      <header className="city-header-nav">
        <button onClick={() => navigate(-1)} className="back-arrow">←</button>
        <div className="city-title-container">
          <h1>{t("explore_mumbai") || "Explore Mumbai"}</h1>
          <p>{t("discover_best_places") || "Discover the best places to visit in the city of dreams."}</p>
        </div>
        <div className="header-spacer"></div>
      </header>
      
      <MumbaiMap activeRegion={selectedRegion} onRegionClick={setSelectedRegion} />

      <motion.div layout className="city-grid">
        <AnimatePresence mode="popLayout">
          {filteredPlaces.map((place) => (
            <Flashcard 
              key={place.key} 
              place={place} 
              isFavorite={userFavorites.includes(place.key)}
              onToggleFavorite={() => toggleFavorite(place.key)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <section className="community-section">
        <div className="community-header">
          <h2>{t("what_users_say") || "What Users Say"} 🗣️</h2>
          <button className="add-review-btn" onClick={() => setShowReviewModal(true)}>Write a Review</button>
        </div>
        
        {/* Review Modal */}
        {showReviewModal && (
          <div className="modal-overlay">
            <div className="premium-glass modal-content">
              <h3>Share your experience! ✍️</h3>
              <form onSubmit={submitReview}>
                <div className="star-input">
                  {[1,2,3,4,5].map(s => (
                    <span 
                      key={s} 
                      onClick={() => setNewReview({...newReview, rating: s})}
                      style={{ cursor: 'pointer', fontSize: '24px', color: s <= newReview.rating ? '#FFD700' : '#ccc'}}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <textarea 
                  required
                  placeholder="Tell us what you loved about Mumbai..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                />
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="submit-btn">
                    {isSubmitting ? "Posting..." : "Post Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="reviews-gallery">
          {reviews.length > 0 ? reviews.map((r, idx) => (
            <ReviewCard 
              key={r._id || idx}
              img={`https://images.unsplash.com/photo-${1570160897040 + idx}-3a2b587f1ce2?auto=format&fit=crop&q=80&w=400`}
              name={r.userName}
              date={new Date(r.createdAt).toLocaleDateString()}
              text={r.comment}
              stars={"⭐".repeat(Math.max(0, Math.min(5, Math.round(r.rating || 5))))}
            />
          )) : (
            <>
              <ReviewCard 
                img="https://images.unsplash.com/photo-1570160897040-3a2b587f1ce2?auto=format&fit=crop&q=80&w=400"
                name="Rahul S."
                date="January 20, 2024"
                text="The sunset at Marine Drive is absolutely magical. The Queen's necklace view never gets old!"
                stars="⭐⭐⭐⭐⭐"
              />
              <ReviewCard 
                img="https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&q=80&w=400"
                name="Anjali P."
                date="February 05, 2024"
                text="Colaba Causeway is a shopper's paradise. Don't forget to bargain and grab a beer at Leopold!"
                stars="⭐⭐⭐⭐✨"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

const ReviewCard = ({ img, name, date, text, stars }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="review-card-premium"
  >
    <div className="review-image-placeholder">
      <img src={img} alt="review" />
    </div>
    <div className="review-content">
      <div className="user-meta">
        <img className="user-avatar" src={`https://i.pravatar.cc/150?u=${name}`} alt="User" />
        <div>
          <span className="user-name">{name}</span>
          <span className="review-date">{date}</span>
        </div>
      </div>
      <p>"{text}"</p>
      <div className="review-rating">{stars}</div>
    </div>
  </motion.div>
);
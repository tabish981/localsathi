import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/nearby.css";

const GOOGLE_KEY = "AIzaSyBOXYLhLbF6Y4pGHdmVv8tRaxAxL0v5e1E";

const FILTER_KEYWORDS = {
  transport: "bus stop railway station metro station",
  food: "restaurant cafe street food fast food bakery sweets dessert food court",
  hotels: "hotel lodge",
  local: "local market grocery store medical store"
};

export default function Nearby() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [googleApi, setGoogleApi] = useState(null);
  const [map, setMap] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);

  useEffect(() => {
    if (window.google?.maps?.places) {
      setGoogleApi(window.google);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setGoogleApi(window.google);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!googleApi) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        const m = new googleApi.maps.Map(document.getElementById("map"), {
          center: loc,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
        });

        new googleApi.maps.Marker({
          position: loc,
          map: m,
          title: t("you_are_here") || "You are here",
          icon: {
            path: googleApi.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4facfe",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3
          }
        });
        setMap(m);
      },
      () => alert("Please allow location access"),
      { enableHighAccuracy: true }
    );
  }, [googleApi, t]);

  const getDistance = (lat, lng) => {
    const R = 6371;
    const dLat = ((lat - userLoc.lat) * Math.PI) / 180;
    const dLng = ((lng - userLoc.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(userLoc.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  const clearMarkers = () => {
    markers.forEach((m) => m.setMap(null));
    setMarkers([]);
  };

  const fetchPlaces = (category, searchRadius = radius, keyword = null) => {
    if (!googleApi || !map || !userLoc) return;
    setActiveFilter(category);
    setLoading(true);
    setPlaces([]);
    clearMarkers();

    const searchKeyword = keyword || (category ? FILTER_KEYWORDS[category] : "");
    const service = new googleApi.maps.places.PlacesService(map);
    service.nearbySearch(
      { location: userLoc, radius: searchRadius * 1000, keyword: searchKeyword },
      (results, status) => {
        if (status !== "OK" || !results) {
          setLoading(false);
          return;
        }
        const processed = results.map((p) => {
          if (!p.geometry) return null;
          const lat = p.geometry.location.lat();
          const lng = p.geometry.location.lng();
          return { name: p.name, address: p.vicinity, lat, lng, distance: getDistance(lat, lng) };
        }).filter(p => p && p.distance <= searchRadius).sort((a, b) => a.distance - b.distance);

        const newMarkers = processed.map((p, i) => {
          const marker = new googleApi.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map,
            label: (i + 1).toString(),
            animation: i === 0 ? googleApi.maps.Animation.BOUNCE : null
          });
          marker.addListener("click", () => openInMaps(p.lat, p.lng));
          return marker;
        });

        setMarkers(newMarkers);
        setPlaces(processed);
        setLoading(false);
      }
    );
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery) return;
    fetchPlaces(null, radius, searchQuery);
  };

  const openInMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="nearby-wrapper">
      <div className="nearby-header-nav">
        <button onClick={() => navigate(-1)} className="back-arrow">←</button>
        <h3 className="nearby-nav-title">{t("nearby_places")}</h3>
        <div className="header-spacer"></div>
      </div>

      <div className="nearby-container">
        <div className="nearby-left">
          <div className="map-card-container">
            <div className="map-wrapper">
              <div id="map" className="map-box"></div>

              {!userLoc && (
                <div className="map-skeleton-overlay wow-radar-overlay">
                  <div className="radar-container">
                    <div className="radar-core"></div>
                    <div className="radar-ripple r1"></div>
                    <div className="radar-ripple r2"></div>
                    <div className="radar-ripple r3"></div>
                    <div className="radar-sweep"></div>
                    
                    <div className="radar-blip b1"></div>
                    <div className="radar-blip b2"></div>
                    <div className="radar-blip b3"></div>
                  </div>
                  <div className="tracing-text radar-text-glow">
                    {"ESTABLISHING CONNECTION.."}
                  </div>
                </div>
              )}
            </div>
            <div className="map-badge-container">
              <div className="map-overlay-info">
                {userLoc ? (
                  <div className="radius-selector-container">
                    <span>{t("results_within")} </span>
                    <select
                      className="radius-dropdown"
                      value={radius}
                      onChange={(e) => {
                        const newRadius = Number(e.target.value);
                        setRadius(newRadius);
                        if (activeFilter) {
                          fetchPlaces(activeFilter, newRadius);
                        }
                      }}
                    >
                      <option value={1}>1 km</option>
                      <option value={2}>2 km</option>
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={20}>20 km</option>
                    </select>
                    <span> {t("of_your_location")}</span>
                  </div>
                ) : (t("finding_location") || "Finding your location...")}
              </div>
            </div>
          </div>
        </div>

        <div className="nearby-right">
          <div className="nearby-content-glass">
            <div className="search-section">
              <form className="search-bar-form" onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    placeholder={t("search_nearby_placeholder") || "Search for places (e.g. Park, Cafe)..."} 
                    className="nearby-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="search-submit-btn">
                  {t("search") || "Search"}
                </button>
              </form>
            </div>

            <div className="filter-row">
              {Object.keys(FILTER_KEYWORDS).map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${activeFilter === cat ? "active" : ""}`}
                  onClick={() => fetchPlaces(cat)}
                >
                  {cat === "transport" && (
                    <svg className="filter-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2" ry="2"></rect><path d="M4 11h16"></path><path d="M12 3v8"></path><path d="M8 19l-2 3"></path><path d="M16 19l2 3"></path><path d="M8 15h.01"></path><path d="M16 15h.01"></path></svg>
                  )}
                  {cat === "food" && (
                    <svg className="filter-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
                  )}
                  {cat === "hotels" && (
                    <svg className="filter-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M13 3l8 4v14"></path><path d="M7 11h2"></path><path d="M7 15h2"></path><path d="M15 11h2"></path><path d="M15 15h2"></path></svg>
                  )}
                  {cat === "local" && (
                    <svg className="filter-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  )}
                  <span className="btn-text">
                    {t(cat) || (cat.charAt(0).toUpperCase() + cat.slice(1))}
                  </span>
                </button>
              ))}
            </div>

            <div className="results-container">
              {loading && (
                <div className="loading-state-modern">
                  <div className="pulse-ring"></div>
                  <div className="pulse-ring delayed"></div>
                  <div className="loading-content">
                    <svg className="map-marker-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <p>{t("scouting_places") || "Scouting the best places for you..."}</p>
                  </div>
                </div>
              )}

              {!loading && places.map((p, i) => (
                <div key={i} className={`place-item ${i === 0 ? "nearest-card" : ""}`} onClick={() => openInMaps(p.lat, p.lng)}>
                  <div className="place-header">
                    <span className="place-index">{i + 1}</span>
                    <div className="place-main-info">
                      <div className="place-name">
                        {p.name}
                        {i === 0 && <span className="nearest-badge">{t("nearest")}</span>}
                      </div>
                      <div className="place-address">{p.address}</div>
                    </div>
                    <div className="place-distance-box">
                      <div className="dist-val">{p.distance}</div>
                      <div className="dist-unit">km</div>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && places.length === 0 && activeFilter && (
                <div className="empty-state">
                  <p>{t("no_results_found")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
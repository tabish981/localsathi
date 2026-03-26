import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { PLACES } from "../data/places";
import "../styles/profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    dob: "",
    email: "",
    avatar: "",
    gender: "other",
    bio: "",
  });
  const [stats, setStats] = useState({
    trips: 0,
    rating: 4.8,
    places: 0
  });
  const [badges, setBadges] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || userId === "undefined" || !token) {
        console.warn("Guest mode: No credentials found to fetch profile.");
        setLoading(false);
        return;
      }

      console.log(`Fetching profile for UID: ${userId} with token: ${token.substring(0, 10)}...`);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.status === 404) {
          console.error("404: User record missing from DB");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server responded with ${res.status}`);
        }
        const data = await res.json();
        console.log("Profile data received successfully:", data);

        setUser(data);
        setBadges(data.badges || []);
        setFavorites(data.favorites || []);
        setEditData({
          ...data,
          name: data.name || "",
          phone: data.phone || "",
          dob: data.dob || "",
          avatar: data.avatar || "",
          gender: data.gender || "other",
          bio: data.bio || ""
        });

        // 🟢 Fetch Background Stats (Non-blocking)
        try {
          const tripsRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/trips/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (tripsRes.ok) {
            const tripsData = await tripsRes.json();
            setStats(prev => ({ ...prev, trips: tripsData.length }));
          }
        } catch (sErr) {
          console.warn("Background stats fetch warning (non-fatal):", sErr);
        }
      } catch (err) {
        console.error("Profile Load Error Details:", err);
        showToast(`Profile Load Error: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setEditData({
          ...updated,
          gender: updated.gender || "other",
          bio: updated.bio || ""
        });
        setIsEditing(false);
        showToast("Profile Updated Successfully!");
        localStorage.setItem("userName", updated.name);
      } else if (res.status === 401 || res.status === 403) {
        showToast("Session expired. Please login again.", "error");
      } else {
        throw new Error();
      }
    } catch (err) {
      showToast("Update failed. Please try again.", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/user/${user._id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          localStorage.clear();
          window.location.href = "/signup";
        } else {
          showToast("Failed to delete account.", "error");
        }
      } catch (err) {
        showToast("Error deleting account.", "error");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      ...user,
      gender: user.gender || "other",
      bio: user.bio || ""
    });
  };

  if (loading) return <div className="profile-loading">Loading Profile...</div>;

  const predefinedBadges = [
    { id: "first_trip", name: "First Ride", icon: "🚇", desc: "Plan your first trip", isUnlocked: stats.trips >= 1, progress: Math.min((stats.trips / 1) * 100, 100) },
    { id: "explorer", name: "City Explorer", icon: "🏙️", desc: "Plan 5 total trips", isUnlocked: stats.trips >= 5, progress: Math.min((stats.trips / 5) * 100, 100) },
    { id: "collector", name: "Spot Collector", icon: "📸", desc: "Save 3 favorite places", isUnlocked: favorites.length >= 3, progress: Math.min((favorites.length / 3) * 100, 100) },
    { id: "legend", name: "Local Legend", icon: "🚊", desc: "Plan 10 total trips", isUnlocked: stats.trips >= 10, progress: Math.min((stats.trips / 10) * 100, 100) },
    { id: "guide", name: "Tour Guide", icon: "🧳", desc: "Save 10 favorite places", isUnlocked: favorites.length >= 10, progress: Math.min((favorites.length / 10) * 100, 100) },
    { id: "veteran", name: "Mumbai Veteran", icon: "🌟", desc: "Plan 25 total trips", isUnlocked: stats.trips >= 25, progress: Math.min((stats.trips / 25) * 100, 100) }
  ];

  const dbBadges = badges.map(b => ({
    id: b.id || b.name,
    name: b.name,
    icon: b.icon || "🏅",
    desc: b.description || "Special Badge",
    isUnlocked: true,
    progress: 100
  }));

  const allDisplayBadges = [...predefinedBadges];
  dbBadges.forEach(dbB => {
    if (!allDisplayBadges.find(pb => pb.name === dbB.name)) {
      allDisplayBadges.push(dbB);
    }
  });

  const unlockedCount = allDisplayBadges.filter(b => b.isUnlocked).length;

  return (
    <div className="profile-wrapper">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="profile-header-nav">
        <button onClick={() => navigate(-1)} className="back-arrow" aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h3 className="profile-title-text">{t("profile")}</h3>
        <button onClick={handleLogout} className="logout-text-btn">
          {t("logout")}
        </button>
      </div>

      <div className="profile-content-container">
        {/* Left Card: Profile Details */}
        <div className="profile-card profile-details-card">
          <div className="avatar-section">
            <div className="avatar-box">
              <img
                src={editData.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Profile avatar"
              />
            </div>
            {isEditing && (
              <div className="camera-overlay" onClick={() => fileInputRef.current?.click()} title="Change Avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setEditData({ ...editData, avatar: reader.result });
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>

          <div className="profile-stats">
            <div
              className="stat-item clickable"
              onClick={() => navigate("/trips")}
              title="View my previous trips"
            >
              <span className="stat-value">{stats.trips}</span>
              <span className="stat-label">Trips</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item clickable" onClick={() => navigate("/city")}>
              <span className="stat-value">{favorites.length}</span>
              <span className="stat-label">Places</span>
            </div>
            <div className="stat-divider"></div>
          </div>

          <div className="profile-form">
            <div className="field">
              <label htmlFor="name">{t("full_name")}</label>
              <div className="input-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={editData.name || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder={t("name_placeholder")}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="bio">About Me</label>
              <div className="textarea-container">
                <textarea
                  id="bio"
                  name="bio"
                  value={editData.bio || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  maxLength="200"
                />
                <span className="char-count">{editData.bio?.length || 0}/200</span>
              </div>
            </div>



            <div className="field">
              <label htmlFor="phone">{t("phone_number")}</label>
              <div className="input-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={editData.phone || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+91 00000 00000"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="dob">Date of Birth</label>
              <div className="input-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input
                  id="dob"
                  name="dob"
                  type={isEditing ? "date" : "text"}
                  value={editData.dob || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">{t("email_address")}</label>
              <div className="input-with-icon disabled">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={editData.email || ""}
                  disabled={true}
                  style={{ cursor: "not-allowed" }}
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <div className="main-actions">
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Profile
                </button>
                <button
                  className="delete-acc-btn"
                  onClick={handleDeleteAccount}
                  title="Delete Account"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete Account
                </button>
              </div>
            ) : (
              <div className="edit-options">
                <button className="save-btn" onClick={handleSave}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div> {/* End Left Card */}

        {/* Right Card: Badges and Favorites */}
        <div className="profile-card profile-achievements-card">
          {/* 🏆 Mumbai Explorer Badges */}
          <div className="profile-section-premium">
            <div className="section-header">
              <h4>🏆 Mumbai Explorer Badges</h4>
              <span className="badge-count">{unlockedCount} / {allDisplayBadges.length} Unlocked</span>
            </div>

            <div className="badges-progress-container">
               <div className="badges-progress-fill" style={{width: `${(unlockedCount / allDisplayBadges.length) * 100}%`}}></div>
            </div>

          <div className="badges-grid expanded">
            {allDisplayBadges.map((badge, idx) => (
              <div 
                key={idx} 
                className={`badge-card realistic ${badge.isUnlocked ? 'unlocked' : 'locked'}`} 
                onClick={() => setSelectedBadge(badge)}
                title="Click to see details"
              >
                <div className="badge-icon-circle">
                  <span className="icon">{badge.icon}</span>
                  {!badge.isUnlocked && <span className="lock-icon">🔒</span>}
                </div>
                <div className="badge-info">
                  <span className="badge-name">{badge.name}</span>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* ❤️ Saved Favorites */}
          <div className="profile-section-premium">
            <div className="section-header">
              <h4>❤️ Saved Favorites</h4>
              <span className="view-all" onClick={() => navigate("/city")}>Explore More</span>
            </div>
            <div className="favorites-list">
              {favorites.length > 0 ? favorites.map((favKey, idx) => {
                const place = PLACES.find(p => p.key === favKey);
                return (
                  <div key={idx} className="fav-pill" onClick={() => navigate("/city")}>
                    <span>📍</span>
                    <span>{place ? t(`${place.key}_title`) : favKey}</span>
                  </div>
                );
              }) : <p className="empty-msg">No favorites saved yet.</p>}
            </div>
          </div>
        </div> {/* End Right Card */}
      </div> {/* End Content Container */}

      {/* Badge Pop-up Modal */}
      {selectedBadge && (
        <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="badge-modal-card" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedBadge(null)}>×</button>
            
            <div className={`badge-modal-icon-wrapper ${selectedBadge.isUnlocked ? 'unlocked' : 'locked'}`}>
              <span className="badge-modal-icon">{selectedBadge.icon}</span>
              {!selectedBadge.isUnlocked && <span className="lock-icon-large">🔒</span>}
            </div>
            
            <h3 className="badge-modal-title">{selectedBadge.name}</h3>
            
            {selectedBadge.isUnlocked ? (
               <div className="badge-modal-completed">
                  <p className="badge-modal-desc">{selectedBadge.desc}</p>
                  <p className="badge-unlocked-text">🎉 Unlocked!</p>
               </div>
            ) : (
               <div className="badge-modal-locked">
                  <p className="badge-modal-desc">{selectedBadge.desc}</p>
                  <div className="badge-modal-progress-area">
                    <div className="progress-labels">
                      <span>Progress</span>
                      <span>{Math.floor(selectedBadge.progress)}%</span>
                    </div>
                    <div className="badge-large-progress">
                      <div className="large-fill" style={{width: `${selectedBadge.progress}%`}}></div>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
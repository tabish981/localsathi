import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/feedback.css";

const Feedback = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(null);
  const [problem, setProblem] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emojis = [
    { id: 1, char: "😟", label: "Poor" },
    { id: 2, char: "🙂", label: "Fair" },
    { id: 3, char: "😊", label: "Good" },
    { id: 4, char: "😁", label: "Great" },
    { id: 5, char: "😍", label: "Love it" },
  ];

  const handleSubmit = async () => {
    if (!rating) {
      alert("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    const feedbackData = { 
      userId: localStorage.getItem("userId") || "", 
      userName: localStorage.getItem("userName") || "Anonymous User",
      rating, 
      problem, 
      suggestion 
    };

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        alert("Awesome! Thanks for your feedback!");
        navigate("/home");
      } else {
        alert("Oops! Failed to save feedback.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-wrapper">
      <div className="feedback-glass-card">
        <header className="feedback-header">
          <button className="back-btn" onClick={() => navigate(-1)} title="Go Back">
            ←
          </button>
          <div className="header-text">
            <h2>Your Feedback Matter</h2>
            <p>Help us make LocalSathi even better!</p>
          </div>
        </header>

        <main className="feedback-body">
          {/* Rating Section */}
          <section className="feedback-section rating-section">
            <h3>How was your experience?</h3>
            <div className="emoji-grid">
              {emojis.map((emoji) => (
                <div key={emoji.id} className="emoji-item">
                  <button
                    className={`emoji-btn ${rating === emoji.id ? "active" : ""}`}
                    onClick={() => setRating(emoji.id)}
                  >
                    {emoji.char}
                  </button>
                  <span className={`emoji-label ${rating === emoji.id ? "visible" : ""}`}>
                    {emoji.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Problem Section */}
          <section className="feedback-section">
            <div className="section-header">
              <span className="section-icon">⚠️</span>
              <label>Any problems you faced?</label>
            </div>
            <textarea
              placeholder="Tell us about any glitches or issues..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            ></textarea>
          </section>

          {/* Suggestions Section */}
          <section className="feedback-section">
            <div className="section-header">
              <span className="section-icon">💡</span>
              <label>Got an idea to share?</label>
            </div>
            <textarea
              placeholder="What new features would you love to see?"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
            ></textarea>
          </section>

          <button 
            className={`submit-btn ${isSubmitting ? "loading" : ""}`} 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Submit Review"}
          </button>
        </main>
      </div>
    </div>
  );
};

export default Feedback;
// Force Redeploy: Dependencies Updated
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Send, ArrowLeft } from "lucide-react";
import "../styles/contact.css";

export default function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Message from LocalSathi",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // 1. Send data to backend directly
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Message sent successfully!");
        setFormData({ name: "", email: "", subject: "Message from LocalSathi", message: "" });
      } else {
        alert(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Contact Hub Error:", err);
      alert("Network error! Server isn't responding, bhai.");
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-overlay"></div>
      
      {/* BACK BUTTON */}
      <button className="contact-back-btn" onClick={() => navigate(-1)} title="Go Back">
        <ArrowLeft size={20} />
      </button>

      <div className="contact-container">
        {/* INFO SECTION */}
        <section className="contact-info-section">
          <h1>Get In <span>Touch</span></h1>
          <p className="contact-tagline">
            Have questions or suggestions for your next Mumbai journey? 
            Reach out to our experts and let's make it unforgettable.
          </p>

          <div className="contact-methods-group">
            <div className="contact-method">
              <div className="method-icon"><Mail size={22} /></div>
              <div className="method-text">
                <h4>Email Us</h4>
                <p>localsathi579@gmail.com</p>
              </div>
            </div>

            <div className="contact-method">
              <div className="method-icon"><Phone size={22} /></div>
              <div className="method-text">
                <h4>Call Us</h4>
                <p>+91 98705 85196</p>
              </div>
            </div>
          </div>
        </section>

        {/* FORM SECTION */}
        <section className="contact-form-section">
          <form onSubmit={handleSendEmail} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name"
                placeholder="Ex. John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                placeholder="Ex. john@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Your Message</label>
              <textarea 
                name="message"
                rows="6" 
                placeholder="Tell us what's on your mind..." 
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="contact-submit-btn">
              <Send size={20} />
              Send Message
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

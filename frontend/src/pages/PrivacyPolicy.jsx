import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/legal.css";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="legal-wrapper">
      <div className="legal-card">
        <header className="legal-header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>Privacy Policy</h1>
        </header>

        <main className="legal-content">
          <p>At LocalSathi, we take your privacy seriously. This policy describes how we collect, use, and handle your information when you use our services.</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your name, email address, and phone number when you create an account or update your profile.</p>

          <h2>2. How We Use Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services.</li>
            <li>Send you technical notices and support messages.</li>
            <li>Respond to your comments and questions.</li>
            <li>Monitor and analyze trends, usage, and activities.</li>
          </ul>

          <h2>3. Sharing of Information</h2>
          <p>We do not share your personal information with third parties except as described in this policy, such as with your consent or for legal reasons.</p>

          <h2>4. Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>

          <div className="last-updated">Last Updated: March 2026</div>
        </main>
      </div>
    </div>
  );
}

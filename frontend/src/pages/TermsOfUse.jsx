import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/legal.css";

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="legal-wrapper">
      <div className="legal-card">
        <header className="legal-header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>Terms of Use</h1>
        </header>

        <main className="legal-content">
          <p>By using LocalSathi, you agree to these terms. Please read them carefully.</p>

          <h2>1. Use of Services</h2>
          <p>You must follow any policies made available to you within the services. Do not misuse our services or try to access them using a method other than the interface and the instructions that we provide.</p>

          <h2>2. Your Account</h2>
          <p>You may need a LocalSathi account in order to use some of our services. You are responsible for the activity that happens on or through your account.</p>

          <h2>3. Privacy and Copyright Protection</h2>
          <p>LocalSathi’s privacy policies explain how we treat your personal data and protect your privacy when you use our services.</p>

          <h2>4. Modifying and Terminating Services</h2>
          <p>We are constantly changing and improving our services. We may add or remove functionalities or features, and we may suspend or stop a service altogether.</p>

          <div className="last-updated">Last Updated: March 2026</div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import "./styles/global.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PlanJourney from "./pages/PlanJourney";
import Nearby from "./pages/Nearby";
import CityGuide from "./pages/CityGuide";
import Suggestions from "./pages/suggestion";
import PreviousTrips from "./pages/PreviousTrips";
import Profile from "./pages/Profile";
import ExpenseEstimator from "./pages/ExpenseEstimator";
import Feedback from "./pages/Feedback";
import Setting from "./pages/Settings";
import Contact from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { LanguageProvider } from "./context/LanguageContext";

export default function App() {
  // Initialize theme state from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Apply theme class to body whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* ROOT REDIRECT */}
          <Route path="/" element={<Home />} />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* OPEN ROUTES */}
          <Route path="/home" element={<Home />} />
          <Route path="/plan" element={<PlanJourney />} />
          <Route path="/nearby" element={<Nearby />} />
          <Route path="/city" element={<CityGuide />} />
          <Route path="/suggestion" element={<Suggestions />} />
          <Route path="/trips" element={<PreviousTrips />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/expense" element={<ExpenseEstimator />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* Settings page */}
          <Route
            path="/setting"
            element={<Setting isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
          />

          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
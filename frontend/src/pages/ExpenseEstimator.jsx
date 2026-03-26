import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/expenseEstimator.css';

const ExpenseEstimator = ({ onClose }) => {
    const [budgetType, setBudgetType] = useState('comfort');
    const [people, setPeople] = useState(1);
    const [days, setDays] = useState(1);
    const [showSummary, setShowSummary] = useState(false);
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleClose = () => {
        if (onClose) onClose();
        else navigate(-1);
    };

    const handleStart = () => {
        setShowSummary(true);
    };

    const handleConfirm = () => {
        if (onClose) {
            navigate('/suggestion', { state: { budgetType, people, days }, replace: true });
            onClose();
        } else {
            navigate('/home');
        }
    };

    const dailyRate = budgetType === 'premium' ? 5000 : 1500;
    const totalBudget = people * days * dailyRate;

    if (showSummary) {
        return (
            <div className="estimator-overlay" onClick={handleClose}>
                <div className="estimator-card summary-card" onClick={e => e.stopPropagation()}>
                    <h2 style={{ marginBottom: "25px", fontSize: "24px", textAlign: "center", fontWeight: "800", letterSpacing: "1px", color: "#fff" }}>
                        {t("trip_summary")}
                    </h2>
                    <div style={{ marginBottom: "30px", fontSize: "16px", lineHeight: "1.8", color: "#ddd" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>{t("budget_mode")}:</span>
                            <strong style={{ color: "#fff" }}>{budgetType === 'premium' ? `Premium 💎` : `Comfort 🎒`}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>{t("travelers")}:</span>
                            <strong style={{ color: "#fff" }}>{people} {t("people") || "Person(s)"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>{t("duration")}:</span>
                            <strong style={{ color: "#fff" }}>{days} {t("days") || "Day(s)"}</strong>
                        </div>
                        <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.15)", margin: "20px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "700", color: "#FFD700" }}>
                            <span>{t("est_budget")}:</span>
                            <span>₹ {totalBudget.toLocaleString()}</span>
                        </div>
                    </div>
                    <button className="start-btn" onClick={handleConfirm}>
                        {onClose ? t("update_suggestions") || "Update Suggestions" : t("back_to_home") || "Back to Home"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="estimator-overlay" onClick={handleClose}>
            <div className="estimator-card" onClick={e => e.stopPropagation()}>
                <div className="budget-selection">
                    <button 
                        className={`budget-btn ${budgetType === 'comfort' ? 'active' : ''}`}
                        onClick={() => setBudgetType('comfort')}
                    >
                        {t("comfort_budget")}
                    </button>
                    <button 
                        className={`budget-btn ${budgetType === 'premium' ? 'active' : ''}`}
                        onClick={() => setBudgetType('premium')}
                    >
                        {t("premium_budget")}
                    </button>
                </div>

                <div className="input-group">
                    <div className="input-row">
                        <span className="row-label">{t("no_of_people")}:</span>
                        <div className="counter-plain">
                            <button onClick={() => setPeople(Math.max(1, people - 1))}>-</button>
                            <span>{people}</span>
                            <button onClick={() => setPeople(people + 1)}>+</button>
                        </div>
                    </div>
                    <div className="input-row">
                        <span className="row-label">{t("no_of_days")}:</span>
                        <div className="counter-plain">
                            <button onClick={() => setDays(Math.max(1, days - 1))}>-</button>
                            <span>{days}</span>
                            <button onClick={() => setDays(days + 1)}>+</button>
                        </div>
                    </div>
                </div>

                <button className="start-btn" onClick={handleStart}>
                    {t("start_trip")}
                </button>
            </div>
        </div>
    );
};

export default ExpenseEstimator;

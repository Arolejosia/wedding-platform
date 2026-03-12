import React from "react";
import { useNavigate } from "react-router-dom";
import "./ChoosePlan.css";

const plans = [
  {
    id: "free",
    name: "Gratuit",
    price: "0",
    currency: "FCFA",
    desc: "Pour découvrir la plateforme",
    features: [
      "5 thèmes fixes",
      "RSVP & livre d’or",
      "Compte à rebours",
      "Lien partageable",
    ],
    highlight: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "49 000",
    currency: "FCFA",
    desc: "Pour un site unique",
    features: [
      "Tous les thèmes",
      "Personnalisation complète",
      "Galerie photos",
      "Sans branding",
    ],
    highlight: true,
  },
];

const ChoosePlan = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planId) => {
    sessionStorage.setItem("selectedPlan", planId);
    navigate(`/choose-theme?plan=${planId}`);
  };

  return (
    <div className="choose-plan-page">
      <div className="choose-plan-inner">
        <h1>Choisissez votre formule</h1>
        <p>Commencez gratuitement. Passez en premium quand vous voulez.</p>

        <div className="choose-plan-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`choose-plan-card ${
                plan.highlight ? "choose-plan-card--highlight" : ""
              }`}
            >
              <h2>{plan.name}</h2>
              <div className="choose-plan-price">
                {plan.price} {plan.currency}
              </div>
              <p className="choose-plan-desc">{plan.desc}</p>

              <ul className="choose-plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>

              <button
                className="choose-plan-btn"
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.id === "free"
                  ? "Commencer gratuitement"
                  : "Choisir Premium"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlan;
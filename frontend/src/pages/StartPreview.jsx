// pages/StartPreview.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StartPreview.css";

const StartPreview = () => {
  const navigate = useNavigate();

  const [person1, setPerson1] = useState("");
  const [person2, setPerson2] = useState("");
  const [date, setDate]       = useState("");

  const names = person1 && person2
    ? `${person1} & ${person2}`
    : person1 || person2 || "Emma & Lucas";

  const getDaysLeft = () => {
    if (!date) return "--";
    const diff = new Date(date) - new Date();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const isValid = person1.trim() && person2.trim() && date;

  const handleSubmit = () => {
    if (!isValid) return;
    const selectedTheme = sessionStorage.getItem("selectedTheme") || "royal";

const creationSession = {
  theme: selectedTheme,
  person1,
  person2,
  date
};

sessionStorage.setItem("creationSession", JSON.stringify(creationSession));
   
    navigate(`/preview/${selectedTheme}`);
  };

  return (
    <div className="start-preview">
      <div className="sp-container">

        {/* LEFT — Formulaire */}
        <div className="sp-form">
          <p className="sp-step">💍 Étape 3 sur 3</p>
          <h1>Votre mariage commence ici</h1>
          <p className="sp-sub">Entrez vos prénoms et la date pour voir votre site en action.</p>

          {/* Prénoms côte à côte */}
          <div className="sp-names-row">
            <div className="sp-field">
              <label>Prénom 1</label>
              <input
                type="text"
                placeholder="Emma"
                value={person1}
                onChange={(e) => setPerson1(e.target.value)}
                maxLength={30}
              />
            </div>

            <div className="sp-ampersand">&</div>

            <div className="sp-field">
              <label>Prénom 2</label>
              <input
                type="text"
                placeholder="Lucas"
                value={person2}
                onChange={(e) => setPerson2(e.target.value)}
                maxLength={30}
              />
            </div>
          </div>

          {/* Date */}
          <div className="sp-field">
            <label>Date du mariage</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <button
            className={`sp-btn ${isValid ? "sp-btn--active" : ""}`}
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Voir mon aperçu →
          </button>
        </div>

        {/* RIGHT — Aperçu live */}
        <div className="sp-preview">
          <div className="preview-card">
            <div className="pc-ring">💑</div>
            <h2 className="pc-names">{names}</h2>
            <div className="pc-divider" />
            <p className="pc-days">
              <span className="pc-days-num">{getDaysLeft()}</span>
              <span className="pc-days-lbl">jours avant le grand jour</span>
            </p>
          {date && (
  <p className="pc-date">
    📅 {(() => {
      const [y, m, d] = date.split('-');
      return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    })()}
  </p>
)}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StartPreview;

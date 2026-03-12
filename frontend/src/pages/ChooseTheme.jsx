// pages/ChooseTheme.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { THEMES } from '../config/themes';
import './ChooseTheme.css';

const ChooseTheme = () => {
  const navigate     = useNavigate();
  const [hovered, setHovered] = useState(null);

  const selectedPlan = sessionStorage.getItem('selectedPlan');

  useEffect(() => {
  const selectedPlan = sessionStorage.getItem('selectedPlan');
  if (!selectedPlan) navigate('/'); // ← vérifie seulement le plan
}, [navigate]);

  // Tous gratuits selon ta décision
  const themeList = Object.values(THEMES).filter(theme => theme.free);

const handleSelectTheme = (themeId) => {

  const selectedPlan = sessionStorage.getItem("selectedPlan");

  const session = {
    plan: selectedPlan,
    theme: themeId
  };

  sessionStorage.setItem("creationSession", JSON.stringify(session));

  navigate(`/start-preview?theme=${themeId}`);
};

  const handlePreview = (e, themeId) => {
    e.stopPropagation();
    navigate(`/preview/${themeId}`);
  };

  return (
    <div className="choose-theme-page">

      {/* Header */}
      <div className="ct-header">
        <p className="ct-eyebrow">💍 Étape 2 sur 3</p>
        <h1 className="ct-title">Choisissez votre thème</h1>
        <p className="ct-sub">
          Chaque thème est une expérience visuelle unique.
          Cliquez sur <strong>Aperçu</strong> pour voir le rendu complet.
        </p>
      </div>

      {/* Grille des thèmes */}
      <div className="ct-grid">
        {themeList.map((theme) => (
          <div
            key={theme.id}
            className={`ct-card ${hovered === theme.id ? 'ct-card--hovered' : ''}`}
            style={{ '--t-primary': theme.primary, '--t-secondary': theme.secondary }}
            onMouseEnter={() => setHovered(theme.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Mockup mini */}
            <div className="ct-mockup" style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.background} 100%)` }}>
              {/* Navbar mock */}
              <div className="mock-nav" style={{ borderBottomColor: `${theme.secondary}40` }}>
                <div className="mock-logo" style={{ background: theme.secondary }} />
                <div className="mock-nav-links">
                  {[1,2,3].map(i => <div key={i} className="mock-link" style={{ background: `${theme.secondary}60` }} />)}
                </div>
              </div>

              {/* Hero mock selon layout */}
              <div className={`mock-hero mock-hero--${theme.heroLayout}`}>
                {(theme.heroLayout === 'split' || theme.heroLayout === 'split-reverse') ? (
                  <>
                    <div className="mock-photo-half" style={{ background: `${theme.secondary}30` }}>
                      <span style={{ fontSize: '1.8rem' }}>💑</span>
                    </div>
                    <div className="mock-text-half">
                      <div className="mock-title-bar" style={{ background: theme.secondary }} />
                      <div className="mock-sub-bar"   style={{ background: `${theme.secondary}60` }} />
                      <div className="mock-countdown-row">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="mock-cd-box" style={{ borderColor: `${theme.secondary}60` }} />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mock-centered-content">
                    <div className="mock-circle" style={{ borderColor: theme.secondary }}>
                      <span style={{ fontSize: '1.4rem' }}>💑</span>
                    </div>
                    <div className="mock-title-bar centered" style={{ background: theme.secondary }} />
                    <div className="mock-sub-bar centered"   style={{ background: `${theme.secondary}60` }} />
                    <div className="mock-countdown-row centered">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="mock-cd-box" style={{ borderColor: `${theme.secondary}60` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Badge emoji thème */}
              <div className="mock-emoji-badge">{theme.emoji}</div>
            </div>

            {/* Infos */}
            <div className="ct-card-info">
              <div className="ct-card-top">
                <div>
                  <h3 className="ct-theme-name">{theme.name}</h3>
                  <p className="ct-theme-desc">{theme.description}</p>
                </div>
                <div className="ct-color-dots">
                  <span className="ct-dot" style={{ background: theme.primary }} title="Couleur principale" />
                  <span className="ct-dot" style={{ background: theme.secondary }} title="Couleur accent" />
                </div>
              </div>

              <div className="ct-font-tag">
                <span>Aa</span> {theme.font}
              </div>

              {/* Boutons */}
              <div className="ct-card-actions">
                <button
                  className="ct-btn-preview"
                  onClick={(e) => handlePreview(e, theme.id)}
                  style={{ borderColor: theme.primary, color: theme.primary }}
                >
                  👁 Aperçu
                </button>
                <button
                  className="ct-btn-select"
                  onClick={() => handleSelectTheme(theme.id)}
                  style={{ background: theme.primary }}
                >
                  Choisir →
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="ct-footer-note">
        Vous pourrez personnaliser les couleurs et le contenu après la création.
      </p>

    </div>
  );
};

export default ChooseTheme;

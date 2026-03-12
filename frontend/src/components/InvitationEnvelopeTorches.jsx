import React, { useState } from 'react';
import './InvitationEnvelopeTorches.css';

const InvitationEnvelopeTorches = ({ children, guestName }) => {
  const [stage, setStage] = useState('closed');
  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    if (clicked) return;
    setClicked(true);

    // Étape 1: Flambeaux s'intensifient (1 seconde)
    setStage('torches-ignite');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Étape 2: Sceau se brise (1 seconde)
    setStage('seal-break');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Étape 3: Enveloppe s'ouvre (2 secondes)
    setStage('opening');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Étape 4: Contenu apparaît
    setStage('opened');
  };

  if (stage === 'opened') {
    return (
      <div className="invitation-content-torches fade-in-final-torches">
        {children}
      </div>
    );
  }

  return (
    <div className="invitation-wrapper-torches">
      
      {/* Particules dorées (50 particules) */}
      <div className="golden-particles-torches">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="particle-torches" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 3}s`
          }}></div>
        ))}
      </div>

      {/* Lumière divine du haut */}
      <div className={`divine-light ${stage !== 'closed' ? 'light-intensify' : ''}`}></div>

      {/* Flambeaux GAUCHE */}
      <div className={`torch-holder left-torch ${stage === 'torches-ignite' ? 'torch-bright' : ''}`}>
        <div className="torch-pole"></div>
        <div className="torch-holder-top"></div>
        <div className="torch-flame">
          <div className="flame-core"></div>
          <div className="flame-glow"></div>
          {/* Particules de feu */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="fire-particle" style={{
              animationDelay: `${i * 0.15}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* Flambeaux DROIT */}
      <div className={`torch-holder right-torch ${stage === 'torches-ignite' ? 'torch-bright' : ''}`}>
        <div className="torch-pole"></div>
        <div className="torch-holder-top"></div>
        <div className="torch-flame">
          <div className="flame-core"></div>
          <div className="flame-glow"></div>
          {/* Particules de feu */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="fire-particle" style={{
              animationDelay: `${i * 0.15}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* Rayons de lumière depuis l'enveloppe */}
      {stage !== 'closed' && (
        <div className="light-rays">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="ray" style={{
              transform: `rotate(${i * 30}deg)`
            }}></div>
          ))}
        </div>
      )}

      {/* Flash doré lors du brisement du sceau */}
      {stage === 'seal-break' && (
        <div className="golden-flash"></div>
      )}

      {/* ENVELOPPE */}
      <div 
        className={`envelope-torches ${stage === 'closed' ? 'clickable-torches' : ''}`}
        onClick={handleClick}
      >
        
        {/* Couronne lumineuse au-dessus */}
        <div className="royal-crown">
          <span className="crown-icon">👑</span>
          <div className="crown-glow"></div>
        </div>

        {/* Ornements de coins améliorés */}
        <div className="border-ornament-torches top-left-torches">
          <div className="ornament-detail"></div>
        </div>
        <div className="border-ornament-torches top-right-torches">
          <div className="ornament-detail"></div>
        </div>
        <div className="border-ornament-torches bottom-left-torches">
          <div className="ornament-detail"></div>
        </div>
        <div className="border-ornament-torches bottom-right-torches">
          <div className="ornament-detail"></div>
        </div>

        {/* Bordure dorée épaisse avec relief */}
        <div className="golden-border"></div>

        {/* Rabat */}
        <div className={`envelope-flap-torches ${
          stage === 'opening' ? 'flap-opening-torches' : ''
        }`}>
          <div className="flap-pattern-torches"></div>
          <div className="flap-embossed"></div>
          <div className="flap-shine-torches"></div>
        </div>

        {/* Corps */}
        <div className="envelope-body-torches">
          
          {/* Ruban avec noeud 3D */}
          <div className="ribbon-container-torches">
            <div className="ribbon-left-torches"></div>
            <div className="ribbon-right-torches"></div>
            <div className="ribbon-knot">
              <div className="knot-left"></div>
              <div className="knot-right"></div>
              <div className="knot-center"></div>
            </div>
          </div>

          {/* Sceau de cire amélioré */}
          <div className={`wax-seal-torches ${
            stage === 'seal-break' || stage === 'opening' ? 'seal-breaking-torches' : ''
          }`}>
            {/* Cracks */}
            {(stage === 'seal-break' || stage === 'opening') && (
              <div className="seal-cracks-torches">
                <div className="crack-torches crack-1-torches"></div>
                <div className="crack-torches crack-2-torches"></div>
                <div className="crack-torches crack-3-torches"></div>
                <div className="crack-torches crack-4-torches"></div>
              </div>
            )}
            
            {/* Anneaux multiples */}
            <div className="seal-ring ring-1"></div>
            <div className="seal-ring ring-2"></div>
            <div className="seal-ring ring-3"></div>
            
            <div className="seal-inner-torches">
              {/* Monogramme avec décoration */}
              <div className="monogram-decoration top"></div>
              <div className="monogram-torches">
                <span className="letter-a-torches">A</span>
                <span className="ampersand-torches">&</span>
                <span className="letter-u-torches">U</span>
              </div>
              <div className="monogram-decoration bottom"></div>
            </div>
            <div className="seal-shine-torches"></div>
            <div className="seal-texture"></div>
          </div>

          {/* Parchemin avec nom */}
          <div className="scroll-container">
            <div className="scroll-left"></div>
            <div className="scroll-paper">
              <p className="invitation-label-torches">⚜️ Invitation Royale ⚜️</p>
              <p className="guest-name-torches">{guestName}</p>
            </div>
            <div className="scroll-right"></div>
          </div>

          {/* Ligne décorative luxueuse */}
          <div className="decorative-line-torches">
            <span className="line-ornament-torches">❖</span>
            <span className="line-torches"></span>
            <span className="line-ornament-center">✦</span>
            <span className="line-torches"></span>
            <span className="line-ornament-torches">❖</span>
          </div>
          
          {stage === 'closed' && (
            <div className="click-instruction-torches">
              <span className="touch-icon-torches">👆</span>
              <span className="touch-text-torches">Touchez le sceau pour révéler votre invitation</span>
            </div>
          )}
          
          {stage === 'torches-ignite' && (
            <p className="stage-text-torches fade-in-torches">
              ✨ Les flambeaux s'embrasent en votre honneur ✨
            </p>
          )}
          {stage === 'seal-break' && (
            <p className="stage-text-torches fade-in-torches">
              💥 Le sceau royal se brise ⚡
            </p>
          )}
          {stage === 'opening' && (
            <p className="stage-text-torches fade-in-torches">
              📜 Votre invitation se dévoile majestueusement 👑
            </p>
          )}

          {/* Brillance qui traverse */}
          <div className="shimmer-effect-torches"></div>
          
          {/* Texture parchemin */}
          <div className="paper-texture"></div>
        </div>

        {/* Ombres multiples pour profondeur */}
        <div className="envelope-shadow-torches shadow-1"></div>
        <div className="envelope-shadow-torches shadow-2"></div>
        <div className="envelope-shadow-torches shadow-3"></div>
      </div>

      {/* Message d'instruction */}
      {stage === 'closed' && (
        <div className="instruction-message-torches">
          <div className="instruction-border">
            <p className="instruction-text-torches">
              ✨ Touchez l'enveloppe pour découvrir votre invitation royale ✨
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationEnvelopeTorches;

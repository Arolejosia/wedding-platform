// components/Footer.jsx — 5 LAYOUTS PAR THÈME
import React from 'react';
import './Footer.css';

// ── Ornement SVG commun ──────────────────────────────────────────
const Ornament = ({ color }) => (
  <div className="footer-ornament">
    <svg width="100" height="30" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg" style={{color}}>
      <path d="M10,15 Q30,8 50,15 T90,15" stroke="currentColor" fill="none" strokeWidth="2"/>
      <circle cx="50" cy="15" r="4" fill="currentColor"/>
      <circle cx="25" cy="13" r="2" fill="currentColor"/>
      <circle cx="75" cy="13" r="2" fill="currentColor"/>
    </svg>
  </div>
);

// ── Liens sociaux communs ────────────────────────────────────────
const SocialLinks = ({ links, variant }) => {
  if (!links) return null;
  const { instagram, facebook, twitter } = links;
  if (!instagram && !facebook && !twitter) return null;
  return (
    <div className={`footer-social footer-social--${variant}`}>
      {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`footer-social-link footer-social-link--${variant}`}>📷</a>}
      {facebook  && <a href={facebook}  target="_blank" rel="noopener noreferrer" aria-label="Facebook"  className={`footer-social-link footer-social-link--${variant}`}>📘</a>}
      {twitter   && <a href={twitter}   target="_blank" rel="noopener noreferrer" aria-label="Twitter"   className={`footer-social-link footer-social-link--${variant}`}>🐦</a>}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 1 — ROYAL : fond bleu nuit, noms blancs, or
// ════════════════════════════════════════════════════════════════
const FooterRoyal = ({ wedding }) => {
  const year = new Date(wedding.weddingDate).getFullYear();
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;
  return (
    <footer className="footer footer--royal">
      <div className="footer__inner">
        {wedding.footer?.message && <p className="footer-royal-message">"{wedding.footer.message}"</p>}
        <div className="footer-royal-divider"><span className="frd-line"/><span className="frd-gem">✦</span><span className="frd-line"/></div>
        <h2 className="footer-royal-names">{name}</h2>
        <p className="footer-royal-year">{year}</p>
        <Ornament color="#D4AF37"/>
        <SocialLinks links={wedding.footer?.socialLinks} variant="royal"/>
        <p className="footer-copyright footer-copyright--royal">Made with 💝</p>
      </div>
    </footer>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 2 — MINIMAL : fond noir pur, lignes fines, typo bold
// ════════════════════════════════════════════════════════════════
const FooterMinimal = ({ wedding }) => {
  const year = new Date(wedding.weddingDate).getFullYear();
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;
  return (
    <footer className="footer footer--minimal">
      <div className="footer__inner">
        <div className="footer-minimal-top">
          <h2 className="footer-minimal-names">{name}</h2>
          <span className="footer-minimal-year">{year}</span>
        </div>
        <div className="footer-minimal-rule"/>
        {wedding.footer?.message && <p className="footer-minimal-message">{wedding.footer.message}</p>}
        <SocialLinks links={wedding.footer?.socialLinks} variant="minimal"/>
        <p className="footer-copyright footer-copyright--minimal">Made with 💝</p>
      </div>
    </footer>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 3 — FLORAL : fond bordeaux, ornements floraux, terracotta
// ════════════════════════════════════════════════════════════════
const FooterFloral = ({ wedding }) => {
  const year = new Date(wedding.weddingDate).getFullYear();
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;
  return (
    <footer className="footer footer--floral">
      <div className="footer-floral-deco footer-floral-deco--l">🌸</div>
      <div className="footer-floral-deco footer-floral-deco--r">🌿</div>
      <div className="footer__inner">
        <div className="footer-floral-ornament">❧</div>
        {wedding.footer?.message && <p className="footer-floral-message">"{wedding.footer.message}"</p>}
        <h2 className="footer-floral-names">{name}</h2>
        <p className="footer-floral-year">{year}</p>
        <SocialLinks links={wedding.footer?.socialLinks} variant="floral"/>
        <p className="footer-copyright footer-copyright--floral">Made with 💝</p>
      </div>
    </footer>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 4 — BOHO : fond brun tabac, texte beige, ambiance naturelle
// ════════════════════════════════════════════════════════════════
const FooterBoho = ({ wedding }) => {
  const year = new Date(wedding.weddingDate).getFullYear();
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;
  return (
    <footer className="footer footer--boho">
      <div className="footer__inner">
        <p className="footer-boho-eyebrow">~ merci ~</p>
        {wedding.footer?.message && <p className="footer-boho-message">"{wedding.footer.message}"</p>}
        <h2 className="footer-boho-names">{name}</h2>
        <div className="footer-boho-branch">𝓪𝓶𝓸𝓾𝓻 · {year}</div>
        <SocialLinks links={wedding.footer?.socialLinks} variant="boho"/>
        <p className="footer-copyright footer-copyright--boho">Made with 💝</p>
      </div>
    </footer>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 5 — LUXURY : fond noir absolu, lettres espacées or
// ════════════════════════════════════════════════════════════════
const FooterLuxury = ({ wedding }) => {
  const year = new Date(wedding.weddingDate).getFullYear();
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;
  return (
    <footer className="footer footer--luxury">
      <div className="luxury-footer-frame">
        <div className="lff-tl"/><div className="lff-tr"/>
        <div className="lff-bl"/><div className="lff-br"/>
      </div>
      <div className="footer__inner">
        <div className="footer-luxury-rule"/>
        {wedding.footer?.message && <p className="footer-luxury-message">{wedding.footer.message}</p>}
        <h2 className="footer-luxury-names">{name}</h2>
        <p className="footer-luxury-year">{year}</p>
        <div className="footer-luxury-rule"/>
        <SocialLinks links={wedding.footer?.socialLinks} variant="luxury"/>
        <p className="footer-copyright footer-copyright--luxury">Made with 💝</p>
      </div>
    </footer>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
const Footer = ({ wedding }) => {
  const layout = wedding.settings.theme.heroLayout || 'centered';
  switch (layout) {
    case 'split':           return <FooterMinimal wedding={wedding}/>;
    case 'fullscreen':      return <FooterFloral  wedding={wedding}/>;
    case 'split-reverse':   return <FooterBoho    wedding={wedding}/>;
    case 'fullscreen-dark': return <FooterLuxury  wedding={wedding}/>;
    default:                return <FooterRoyal   wedding={wedding}/>;
  }
};

export default Footer;

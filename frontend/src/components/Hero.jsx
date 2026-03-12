// components/Hero.jsx — 5 LAYOUTS PAR THÈME
import React, { useState, useEffect } from 'react';
import './Hero.css';
import defaultCouple from '../assets/couple_default.png';

// ── Hook countdown ───────────────────────────────────────────────
const useCountdown = (weddingDate) => {
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date(weddingDate).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff > 0) setCd({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [weddingDate]);
  return cd;
};

// ── Date formatée sans bug timezone ─────────────────────────────
const useFormattedDate = (dateStr) => {
  // ✅ Prend juste la partie date avant le T
  const datePart = (dateStr || '').split('T')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return {
    day:   date.getDate(),
    month: date.toLocaleDateString('fr-FR', { month: 'long' }),
    year:  date.getFullYear(),
    full:  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
};
// ── Countdown display ────────────────────────────────────────────
const Countdown = ({ cd, variant = 'royal' }) => (
  <div className={`hcd hcd--${variant}`}>
    {[['days','Jours'],['hours','Heures'],['minutes','Min'],['seconds','Sec']].map(([k, l], i) => (
      <React.Fragment key={k}>
        <div className="hcd-box">
          <span className="hcd-num">{String(cd[k]).padStart(2,'0')}</span>
          <span className="hcd-lbl">{l}</span>
        </div>
        {i < 3 && <span className="hcd-sep">:</span>}
      </React.Fragment>
    ))}
  </div>
);

// ── Photo avec fallback ──────────────────────────────────────────
const CouplePhoto = ({ photo, name, className }) => (
  <img
    src={photo || defaultCouple}
    alt={name}
    className={className}
    onError={(e) => {
      if (e.target.dataset.fallback) return;
      e.target.dataset.fallback = 'true';
      e.target.src = defaultCouple;
    }}
  />
);

// ════════════════════════════════════════════════════════════════
// LAYOUT 1 — ROYAL : Centré, fond bleu nuit, cadre circulaire doré
// ════════════════════════════════════════════════════════════════
const HeroRoyal = ({ wedding, cd, date }) => {
  const p    = wedding.settings.theme;
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;

  return (
    <section id="home" className="hero hero--royal"
      style={{ '--hp': p.primaryColor, '--hs': p.secondaryColor }}>

      <div className="royal-particles" aria-hidden>
        {Array.from({length:18}).map((_,i) => (
          <span key={i} className="rp" style={{
            left: `${5 + i * 5.2}%`,
            animationDelay: `${(i * 0.4) % 6}s`,
            animationDuration: `${7 + (i % 4)}s`,
          }}/>
        ))}
      </div>

      <div className="royal-corner royal-corner--tl"/>
      <div className="royal-corner royal-corner--tr"/>
      <div className="royal-corner royal-corner--bl"/>
      <div className="royal-corner royal-corner--br"/>

      <div className="hero__inner">
        <div className="royal-frame">
          <div className="royal-frame__ring royal-frame__ring--outer"/>
          <div className="royal-frame__ring royal-frame__ring--inner"/>
          <div className="royal-frame__photo">
            <CouplePhoto photo={
  wedding.settings?.theme?.heroImage ||
  wedding.couple.person1.photo
} name={name} className="royal-photo"/>
          </div>
          <div className="royal-frame__gems">
            {[0,60,120,180,240,300].map(deg => (
              <span key={deg} className="royal-gem" style={{ '--deg': `${deg}deg` }}/>
            ))}
          </div>
        </div>

        <div className="royal-divider">
          <span className="royal-divider__line"/>
          <span className="royal-divider__diamond">✦</span>
          <span className="royal-divider__line"/>
        </div>

        <h1 className="royal-names">{name}</h1>
        <p className="royal-tagline">se diront <em>OUI</em></p>
        <Countdown cd={cd} variant="royal"/>
        <p className="royal-date">{date.day} {date.month} {date.year} · {wedding.venue.city}</p>
        <a href="#rsvp" className="royal-cta">Répondre à l'invitation ↓</a>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 2 — MINIMAL : Split 50/50, fond blanc, typo bold épurée
// ════════════════════════════════════════════════════════════════
const HeroMinimal = ({ wedding, cd, date }) => {
  const p    = wedding.settings.theme;
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;

  return (
    <section id="home" className="hero hero--minimal"
      style={{ '--hp': p.primaryColor, '--hs': p.secondaryColor }}>
      <div className="minimal-grid">

        <div className="minimal-text">
          <span className="minimal-eyebrow">Mariage</span>
          <h1 className="minimal-names">
            {wedding.couple.person1.firstName}
            <span className="minimal-amp"> & </span>
            {wedding.couple.person2.firstName}
          </h1>
          <div className="minimal-rule"/>
          <p className="minimal-date-str">{date.full}</p>
          <p className="minimal-location">📍 {wedding.venue.city}, {wedding.venue.country}</p>
          <Countdown cd={cd} variant="minimal"/>
          <a href="#rsvp" className="minimal-cta">RSVP →</a>
        </div>

        <div className="minimal-photo-wrap">
          <div className="minimal-photo-inner">
            <CouplePhoto photo={
  wedding.settings?.theme?.heroImage ||
  wedding.couple.person1.photo
} name={name} className="minimal-photo"/>
          </div>
          <div className="minimal-date-badge">
            <span className="mdb-day">{date.day}</span>
            <span className="mdb-month">{date.month}</span>
          </div>
        </div>

      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 3 — FLORAL : Plein écran, overlay rosé, carte centrale
// ════════════════════════════════════════════════════════════════
const HeroFloral = ({ wedding, cd, date }) => {
  const p    = wedding.settings.theme;
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;

  return (
    <section id="home" className="hero hero--floral"
      style={{ '--hp': p.primaryColor, '--hs': p.secondaryColor }}>

      <div className="floral-bg">
        <CouplePhoto photo={
  wedding.settings?.theme?.heroImage ||
  wedding.couple.person1.photo
} name={name} className="floral-bg__photo"/>
        <div className="floral-bg__overlay"/>
      </div>

      <div className="floral-deco floral-deco--tl">🌸</div>
      <div className="floral-deco floral-deco--tr">🌺</div>
      <div className="floral-deco floral-deco--bl">🌿</div>
      <div className="floral-deco floral-deco--br">🌸</div>

      <div className="hero__inner hero__inner--center">
        <div className="floral-card">
          <p className="floral-pre">Nous vous invitons à célébrer</p>
          <h1 className="floral-names">{name}</h1>
          <div className="floral-ornament">❧</div>
          <p className="floral-tagline">qui unissent leurs vies</p>
          <Countdown cd={cd} variant="floral"/>
          <p className="floral-date">{date.full} · {wedding.venue.city}</p>
          <a href="#rsvp" className="floral-cta">Je confirme ma présence</a>
        </div>
      </div>

      <div className="floral-scroll">
        <span className="floral-scroll__dot"/>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 4 — BOHO : Split inversé, fond beige chaud, style naturel
// ════════════════════════════════════════════════════════════════
const HeroBoho = ({ wedding, cd, date }) => {
  const p    = wedding.settings.theme;
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;

  return (
    <section id="home" className="hero hero--boho"
      style={{ '--hp': p.primaryColor, '--hs': p.secondaryColor }}>
      <div className="boho-grid">

        <div className="boho-photo-wrap">
          <div className="boho-photo-frame">
            <CouplePhoto photo={
  wedding.settings?.theme?.heroImage ||
  wedding.couple.person1.photo
} name={name} className="boho-photo"/>
          </div>
          <div className="boho-leaf boho-leaf--1">🌿</div>
          <div className="boho-leaf boho-leaf--2">🍃</div>
        </div>

        <div className="boho-text">
          <p className="boho-eyebrow">~ mariage ~</p>
          <h1 className="boho-names">
            {wedding.couple.person1.firstName}
            <span className="boho-amp"> & </span>
            {wedding.couple.person2.firstName}
          </h1>
          <div className="boho-script">avec amour</div>
          <Countdown cd={cd} variant="boho"/>
          <div className="boho-info">
            <span>📅 {date.full}</span>
            <span>📍 {wedding.venue.city}</span>
          </div>
          <a href="#rsvp" className="boho-cta">Confirmer ma venue ↓</a>
        </div>

      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 5 — LUXURY : Plein écran noir, overlay sombre, tout en or
// ════════════════════════════════════════════════════════════════
const HeroLuxury = ({ wedding, cd, date }) => {
  const p    = wedding.settings.theme;
  const name = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;

  return (
    <section id="home" className="hero hero--luxury"
      style={{ '--hp': p.primaryColor, '--hs': p.secondaryColor }}>

      <div className="luxury-bg">
        <CouplePhoto photo={
  wedding.settings?.theme?.heroImage ||
  wedding.couple.person1.photo
} name={name} className="luxury-bg__photo"/>
        <div className="luxury-bg__overlay"/>
        <div className="luxury-bg__vignette"/>
      </div>

      <div className="luxury-frame-deco">
        <div className="lfd-tl"/><div className="lfd-tr"/>
        <div className="lfd-bl"/><div className="lfd-br"/>
      </div>

      <div className="hero__inner hero__inner--center">
        <p className="luxury-pre">L'honneur de votre présence est demandé au mariage de</p>
        <h1 className="luxury-names">{name}</h1>
        <div className="luxury-rule"/>
        <p className="luxury-tagline">Une soirée d'exception vous attend</p>
        <Countdown cd={cd} variant="luxury"/>
        <p className="luxury-date">{date.full}</p>
        <p className="luxury-venue">{wedding.venue.city}, {wedding.venue.country}</p>
        <a href="#rsvp" className="luxury-cta">
          <span className="luxury-cta__text">Réserver ma place</span>
        </a>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
const Hero = ({ wedding }) => {
  const cd     = useCountdown(wedding.weddingDate);
  const date   = useFormattedDate(wedding.weddingDate);
  const layout = wedding.settings.theme.heroLayout || 'centered';
  const props  = { wedding, cd, date };

  switch (layout) {
    case 'split':           return <HeroMinimal {...props}/>;
    case 'fullscreen':      return <HeroFloral  {...props}/>;
    case 'split-reverse':   return <HeroBoho    {...props}/>;
    case 'fullscreen-dark': return <HeroLuxury  {...props}/>;
    case 'centered':
    default:                return <HeroRoyal   {...props}/>;
  }
};

export default Hero;

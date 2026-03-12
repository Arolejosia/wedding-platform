// src/components/HeroSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import './HeroSection.css';



// ── CONFETTI / PAILLETTES ────────────────────────────────────────
const COLORS = ['#C9A84C','#FFD700','#FF69B4','#87CEEB','#98FB98','#DDA0DD','#F0E68C','#FF8C69'];
const SHAPES = ['circle','square','diamond','star'];

const Particle = ({ style, shape }) => (
  <div className={`particle particle--${shape}`} style={style} />
);

const Confetti = () => {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animDelay: `${Math.random() * 6}s`,
    animDuration: `${4 + Math.random() * 5}s`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: `${4 + Math.random() * 8}px`,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    rotate: `${Math.random() * 360}deg`,
    drift: `${(Math.random() - 0.5) * 120}px`,
  }));

  return (
    <div className="confetti-container" aria-hidden>
      {particles.map(p => (
        <Particle
          key={p.id}
          shape={p.shape}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.animDelay,
            animationDuration: p.animDuration,
            '--drift': p.drift,
            '--rotate': p.rotate,
          }}
        />
      ))}
    </div>
  );
};

// ── ANIMATED WORD ────────────────────────────────────────────────
const AnimatedWord = ({ word, delay = 0, className = '' }) => {
  return (
    <span className={`aword ${className}`} style={{ '--delay': `${delay}s` }}>
      {word.split('').map((char, i) => (
        <span
          key={i}
          className="achar"
          style={{ '--i': i, '--total': word.length }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

// ── SHIMMER TEXT ─────────────────────────────────────────────────
const ShimmerText = ({ text, className = '' }) => (
  <span className={`shimmer-text ${className}`}>{text}</span>
);

// ── VIEWS DATA ───────────────────────────────────────────────────
const TABS = [
  { id: 'site',      icon: '💍', labelFr: 'Site public',    labelEn: 'Public site',    color: '#C9A84C', bg: '#0A2463' },
  { id: 'budget',    icon: '💰', labelFr: 'Budget',         labelEn: 'Budget',         color: '#4CAF9A', bg: '#0D2B1E' },
  { id: 'seating',   icon: '🪑', labelFr: 'Plan de tables', labelEn: 'Seating plan',   color: '#7C6FF7', bg: '#12103A' },
  { id: 'checklist', icon: '✅', labelFr: 'Checklist',      labelEn: 'Checklist',      color: '#E07B5A', bg: '#2B1408' },
  { id: 'rsvp',      icon: '✉️', labelFr: 'RSVP',           labelEn: 'RSVP',           color: '#5A9BE0', bg: '#0A1F35' },
];

// ── SCREEN: SITE PUBLIC ──────────────────────────────────────────
const ScreenSite = () => (
  <div className="mock-screen mock-site">
    <div className="ms-hero">
      <div className="ms-photo-ring">
        <div className="ms-photo" />
      </div>
      <div className="ms-couple-name">
        <div className="ms-bar w-60 gold-bar" />
        <div className="ms-bar w-40 white-bar slim" />
      </div>
      <div className="ms-countdown">
        {['J','H','M','S'].map(l => (
          <div key={l} className="ms-box">
            <span className="ms-box-num">--</span>
            <span className="ms-box-lbl">{l}</span>
          </div>
        ))}
      </div>
      <div className="ms-cta-btn" />
    </div>
    <div className="ms-nav-dots">
      {[1,2,3,4,5].map(i => <div key={i} className={`ms-dot ${i===1?'active':''}`} />)}
    </div>
  </div>
);

// ── SCREEN: BUDGET ───────────────────────────────────────────────
const ScreenBudget = () => (
  <div className="mock-screen mock-budget">
    <div className="mb-header">
      <div className="mb-title">
        <div className="ms-bar w-50 white-bar" />
      </div>
      <div className="mb-total">
        <span className="mb-amount">2 450 000</span>
        <span className="mb-currency">FCFA</span>
      </div>
    </div>
    <div className="mb-progress-row">
      <div className="mb-prog-bar">
        <div className="mb-prog-fill" style={{ width: '62%', background: '#4CAF9A' }} />
      </div>
      <span className="mb-pct">62%</span>
    </div>
    <div className="mb-cards">
      {[
        { label: 'Lieu', pct: 85, color: '#FF6B9D' },
        { label: 'Traiteur', pct: 50, color: '#4CAF9A' },
        { label: 'Photo', pct: 30, color: '#FFD93D' },
        { label: 'Tenues', pct: 100, color: '#7C6FF7' },
      ].map(c => (
        <div key={c.label} className="mb-card">
          <div className="mb-card-top">
            <span className="mb-card-lbl">{c.label}</span>
            <span className="mb-card-pct" style={{ color: c.color }}>{c.pct}%</span>
          </div>
          <div className="mb-mini-bar">
            <div className="mb-mini-fill" style={{ width: `${c.pct}%`, background: c.color }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── SCREEN: SEATING ──────────────────────────────────────────────
const ScreenSeating = () => (
  <div className="mock-screen mock-seating">
    <div className="mst-header">
      <div className="ms-bar w-40 white-bar" />
      <div className="mst-btn">+ Table</div>
    </div>
    <div className="mst-canvas">
      {/* Tables */}
      {[
        { x: 18, y: 15, w: 44, h: 44, r: '50%', n: 1, color: '#C9A84C', guests: 7 },
        { x: 55, y: 12, w: 38, h: 38, r: '50%', n: 2, color: '#7C6FF7', guests: 6 },
        { x: 15, y: 52, w: 50, h: 30, r: '8px', n: 3, color: '#4CAF9A', guests: 10 },
        { x: 60, y: 55, w: 34, h: 34, r: '50%', n: 4, color: '#E07B5A', guests: 5 },
      ].map(t => (
        <div
          key={t.n}
          className="mst-table"
          style={{
            left: `${t.x}%`, top: `${t.y}%`,
            width: `${t.w}px`, height: `${t.h}px`,
            borderRadius: t.r,
            borderColor: t.color,
            boxShadow: `0 0 12px ${t.color}55`,
          }}
        >
          <span className="mst-num" style={{ color: t.color }}>{t.n}</span>
          <span className="mst-guests">{t.guests}p</span>
        </div>
      ))}
      {/* Grid lines */}
      <div className="mst-grid" />
    </div>
  </div>
);

// ── SCREEN: CHECKLIST ────────────────────────────────────────────
const ScreenChecklist = () => (
  <div className="mock-screen mock-checklist">
    <div className="mc-header">
      <div className="ms-bar w-50 white-bar" />
      <div className="mc-stats">
        <span className="mc-stat done">12 ✓</span>
        <span className="mc-stat urgent">3 !</span>
      </div>
    </div>
    <div className="mc-progress">
      <div className="mc-prog-bar">
        <div className="mc-prog-fill" />
      </div>
      <span className="mc-pct">67%</span>
    </div>
    <div className="mc-items">
      {[
        { label: 'Réserver le lieu', done: true,  priority: 'high',   cat: '🏛️' },
        { label: 'Traiteur confirmé', done: true,  priority: 'high',   cat: '🍽️' },
        { label: 'Photographe',       done: false, priority: 'urgent', cat: '📸' },
        { label: 'Envoyer invitations',done: false,priority: 'medium', cat: '💌' },
        { label: 'Robes & costumes',  done: false, priority: 'low',    cat: '👗' },
      ].map((item, i) => (
        <div key={i} className={`mc-item ${item.done ? 'mc-done' : ''}`}>
          <div className={`mc-check ${item.done ? 'checked' : ''}`}>
            {item.done && '✓'}
          </div>
          <span className="mc-cat">{item.cat}</span>
          <span className="mc-lbl">{item.label}</span>
          <span className={`mc-badge mc-${item.priority}`}>
            {item.priority === 'urgent' ? '🔴' : item.priority === 'high' ? '🟠' : item.priority === 'medium' ? '🟡' : '🟢'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ── SCREEN: RSVP ─────────────────────────────────────────────────
const ScreenRSVP = () => (
  <div className="mock-screen mock-rsvp">
    <div className="mr-header">
      <div className="ms-bar w-40 white-bar" />
      <div className="mr-total">142 invités</div>
    </div>
    <div className="mr-donut-wrap">
      <svg viewBox="0 0 80 80" className="mr-donut">
        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
        <circle cx="40" cy="40" r="30" fill="none" stroke="#4CAF9A" strokeWidth="12"
          strokeDasharray="113 75" strokeDashoffset="0" strokeLinecap="round"/>
        <circle cx="40" cy="40" r="30" fill="none" stroke="#E07B5A" strokeWidth="12"
          strokeDasharray="40 148" strokeDashoffset="-113" strokeLinecap="round"/>
        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12"
          strokeDasharray="35 153" strokeDashoffset="-153" strokeLinecap="round"/>
        <text x="40" y="37" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">96</text>
        <text x="40" y="47" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6">confirmés</text>
      </svg>
    </div>
    <div className="mr-legend">
      {[
        { color: '#4CAF9A', label: 'Confirmés', n: 96 },
        { color: '#E07B5A', label: 'Refusés',   n: 28 },
        { color: 'rgba(255,255,255,0.2)', label: 'En attente', n: 18 },
      ].map(l => (
        <div key={l.label} className="mr-leg-item">
          <div className="mr-leg-dot" style={{ background: l.color }} />
          <span className="mr-leg-lbl">{l.label}</span>
          <span className="mr-leg-n">{l.n}</span>
        </div>
      ))}
    </div>
    <div className="mr-guests">
      {[
        { name: 'Marie D.', code: 'MD12', status: 'confirmed' },
        { name: 'Jean P.',  code: 'JP05', status: 'confirmed' },
        { name: 'Sophie L.',code: 'SL34', status: 'pending'   },
        { name: 'Ahmed K.', code: 'AK89', status: 'declined'  },
      ].map(g => (
        <div key={g.code} className="mr-guest">
          <div className="mr-avatar">{g.name[0]}</div>
          <span className="mr-name">{g.name}</span>
          <span className="mr-code">{g.code}</span>
          <div className={`mr-status mr-${g.status}`} />
        </div>
      ))}
    </div>
  </div>
);

const SCREENS = { site: ScreenSite, budget: ScreenBudget, seating: ScreenSeating, checklist: ScreenChecklist, rsvp: ScreenRSVP };

// ── LAPTOP MOCKUP ────────────────────────────────────────────────
const LaptopMockup = ({ activeTab, lang }) => {
  const ActiveScreen = SCREENS[activeTab.id];
  const tab = TABS.find(t => t.id === activeTab.id);

  return (
    <div className="laptop-wrap">
      {/* Glow behind laptop */}
      <div className="laptop-glow" style={{ '--glow-color': tab.color }} />

      <div className="laptop">
        {/* Screen */}
        <div className="laptop-screen">
          <div className="laptop-bezel">
            {/* Browser bar */}
            <div className="browser-bar">
              <div className="browser-dots">
                <span /><span /><span />
              </div>
              <div className="browser-url">
                <span className="url-lock">🔒</span>
                <span className="url-text">weddingapp.com/{activeTab.id}</span>
              </div>
              <div className="browser-spacer" />
            </div>

            {/* App tabs */}
            <div className="app-tabs">
              {TABS.map(t => (
                <div
                  key={t.id}
                  className={`app-tab ${t.id === activeTab.id ? 'app-tab--active' : ''}`}
                  style={{ '--tab-color': t.color }}
                >
                  <span>{t.icon}</span>
                  <span>{lang === 'fr' ? t.labelFr : t.labelEn}</span>
                </div>
              ))}
            </div>

            {/* Screen content */}
            <div
              className="screen-viewport"
              style={{ background: tab.bg }}
            >
              <ActiveScreen />
            </div>
          </div>
        </div>

        {/* Base */}
        <div className="laptop-hinge" />
        <div className="laptop-base">
          <div className="laptop-trackpad" />
        </div>
      </div>
    </div>
  );
};

// ── FLOATING BADGES ──────────────────────────────────────────────
const FloatingBadge = ({ icon, label, value, style, color }) => (
  <div className="float-badge" style={{ ...style, '--badge-color': color }}>
    <span className="fb-icon">{icon}</span>
    <div className="fb-text">
      <span className="fb-value">{value}</span>
      <span className="fb-label">{label}</span>
    </div>
  </div>
);

// ── MAIN HERO ────────────────────────────────────────────────────
const HeroSection = ({ lang = 'fr' }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIdx(p => (p + 1) % TABS.length);
        setIsAnimating(false);
      }, 300);
    }, 3500);
  };

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleTabClick = (i) => {
    clearInterval(intervalRef.current);
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIdx(i);
      setIsAnimating(false);
      startInterval();
    }, 300);
  };

  const activeTab = TABS[activeIdx];

  const T = {
    fr: {
      badge: '✨ Plateforme tout-en-un pour votre mariage',
      line1: 'Votre mariage,',
      line2: 'votre histoire.',
      line3: 'Tout géré.',
      sub: 'Site public élégant, budget, plan de tables, checklist, gestion des invités. Tout en un seul endroit.',
      cta1: 'Créer mon site gratuit',
      cta2: 'Voir les aperçus',
      stat1: ['1 200+', 'Mariages'],
      stat2: ['48k+', 'RSVP gérés'],
      stat3: ['98%', 'Satisfaction'],
      badge1: ['💍', '142', 'Invités'],
      badge2: ['✅', '67%', 'Checklist'],
      badge3: ['💰', '2.4M', 'Budget FCFA'],
    },
    en: {
      badge: '✨ All-in-one wedding platform',
      line1: 'Your wedding,',
      line2: 'your story.',
      line3: 'All managed.',
      sub: 'Elegant public site, budget, seating plan, checklist, guest management. All in one place.',
      cta1: 'Create my free site',
      cta2: 'See previews',
      stat1: ['1,200+', 'Weddings'],
      stat2: ['48k+', 'RSVPs managed'],
      stat3: ['98%', 'Satisfaction'],
      badge1: ['💍', '142', 'Guests'],
      badge2: ['✅', '67%', 'Checklist'],
      badge3: ['💰', '2.4M', 'Budget FCFA'],
    },
  }[lang];

  return (
    <section className="hero-section">
      <Confetti />

      {/* Background effects */}
      <div className="hero-bg">
        <div className="hero-mesh" />
        <div className="hero-orb hero-orb--gold" />
        <div className="hero-orb hero-orb--blue" />
        <div className="hero-orb hero-orb--pink" />
      </div>

      <div className="hero-container">

        {/* ── LEFT: TEXT ── */}
        <div className="hero-left">

          {/* Badge */}
          <div className="hero-badge-pill">
            <span className="hbp-dot" />
            {T.badge}
          </div>

          {/* Title */}
          <h1 className="hero-heading">
            <span className="hh-line hh-line--1">
              <AnimatedWord word={T.line1} delay={0} />
            </span>
            <span className="hh-line hh-line--2">
              <AnimatedWord word={T.line2} delay={0.3} />
            </span>
            <span className="hh-line hh-line--3">
              <ShimmerText text={T.line3} />
              <span className="hh-sparkles" aria-hidden>
                <span className="sp sp1">✦</span>
                <span className="sp sp2">✦</span>
                <span className="sp sp3">✦</span>
              </span>
            </span>
          </h1>

          {/* Sub */}
          <p className="hero-sub">{T.sub}</p>

          {/* CTAs */}
          <div className="hero-ctas">
            <a href="/choose-plan" className="hcta hcta--primary">
              <span>{T.cta1}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#themes" className="hcta hcta--ghost">{T.cta2}</a>
          </div>

          {/* Stats */}
          <div className="hero-stats-row">
            {[T.stat1, T.stat2, T.stat3].map(([n, l], i) => (
              <React.Fragment key={i}>
                <div className="hstat">
                  <span className="hstat-n">{n}</span>
                  <span className="hstat-l">{l}</span>
                </div>
                {i < 2 && <div className="hstat-sep" />}
              </React.Fragment>
            ))}
          </div>

          {/* Feature tabs (mobile) */}
          <div className="hero-tabs-mobile">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                className={`htab ${i === activeIdx ? 'htab--active' : ''}`}
                style={{ '--tc': t.color }}
                onClick={() => handleTabClick(i)}
              >
                {t.icon} {lang === 'fr' ? t.labelFr : t.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: MOCKUP ── */}
        <div className="hero-right">

          {/* Floating badges */}
          <FloatingBadge
            icon={T.badge1[0]} value={T.badge1[1]} label={T.badge1[2]}
            color="#C9A84C"
            style={{ top: '8%', left: '-8%', animationDelay: '0s' }}
          />
          <FloatingBadge
            icon={T.badge2[0]} value={T.badge2[1]} label={T.badge2[2]}
            color="#4CAF9A"
            style={{ top: '40%', right: '-10%', animationDelay: '1.5s' }}
          />
          <FloatingBadge
            icon={T.badge3[0]} value={T.badge3[1]} label={T.badge3[2]}
            color="#7C6FF7"
            style={{ bottom: '15%', left: '-5%', animationDelay: '3s' }}
          />

          {/* Laptop */}
          <div className={`mockup-wrapper ${isAnimating ? 'mockup-exit' : 'mockup-enter'}`}>
            <LaptopMockup activeTab={activeTab} lang={lang} />
          </div>

          {/* Tab indicators */}
          <div className="tab-indicators">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                className={`ti ${i === activeIdx ? 'ti--active' : ''}`}
                style={{ '--tc': t.color }}
                onClick={() => handleTabClick(i)}
                title={lang === 'fr' ? t.labelFr : t.labelEn}
              >
                <span className="ti-icon">{t.icon}</span>
                <span className="ti-label">{lang === 'fr' ? t.labelFr : t.labelEn}</span>
                {i === activeIdx && <div className="ti-progress" />}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;

// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';
import HeroSection from '../components/HeroSection';
import { useNavigate } from "react-router-dom";
import { THEMES } from '../config/themes'; // ← AJOUT
import VendorsSection from '../components/VendorsSection';

// ─── TRANSLATIONS ────────────────────────────────────────────────
const T = {
  fr: {
    nav: { preview: 'Aperçus', pricing: 'Tarifs', login: 'Connexion', cta: 'Commencer' },
    hero: {
      badge: 'Plateforme de sites de mariage',
      title1: 'Votre mariage,',
      title2: 'votre histoire.',
      title3: 'En ligne.',
      sub: 'Créez un site élégant pour votre mariage en quelques minutes. Partagez le programme, gérez les RSVP, et offrez à vos invités une expérience inoubliable.',
      cta1: 'Créer mon site',
      cta2: 'Voir les aperçus',
      stat1: 'Sites créés',
      stat2: 'Invités RSVP',
      stat3: 'Satisfaction',
    },
    how: {
      label: 'Comment ça marche',
      title: 'De zéro à en ligne\nen 3 étapes',
      steps: [
        { num: '01', title: 'Choisissez votre thème', desc: 'Cinq designs élégants : Royal, Minimal, Floral, Bohème, Luxury. Chaque thème est soigneusement conçu pour refléter votre personnalité.' },
        { num: '02', title: 'Personnalisez le contenu', desc: 'Ajoutez vos photos, votre histoire, le programme, la liste d\'invités. Tout est intuitif et rapide.' },
        { num: '03', title: 'Partagez le lien', desc: 'Votre site est disponible en quelques secondes. Envoyez le lien à tous vos invités par WhatsApp ou email.' },
      ]
    },
    themes: {
      label: 'Thèmes disponibles',
      title: 'Cinq visions,\nune seule élégance',
      sub: 'Chaque thème est une expérience complète — pas juste un habillage.',
      preview: 'Voir l\'aperçu',
    },
    pricing: {
      label: 'Tarifs',
      title: 'Un prix pour\nchaque projet',
      sub: 'Commencez gratuitement. Évoluez selon vos besoins.',
      plans: [
        {
          name: 'Gratuit',
          oldPrice: null,
          oldDiscount: null,
          price: '0',
          currency: 'FCFA',
          period: '',
          desc: 'Pour découvrir la plateforme',
          features: ['5 thèmes inclus', 'RSVP & livre d\'or', 'Photos des invités', 'Compte à rebours', 'Lien partageable'],
          missing: ['Couleurs personnalisées', 'Sans branding', 'Domaine personnalisé'],
          cta: 'Commencer gratuitement',
          ctaClass: 'plan-cta--outline',
          highlight: false,
          premium: false,
        },
        {
          name: 'Standard',
          oldPrice: '49 000',
          oldDiscount: '-41%',
          price: '29 000',
          currency: 'FCFA',
          period: 'paiement unique',
          desc: 'Le choix le plus populaire',
          features: ['Tout du plan Gratuit', 'Couleurs personnalisées', 'Polices personnalisées', 'Sans branding WeddingApp', 'Sections supplémentaires', 'Animations premium'],
          missing: ['Domaine personnalisé'],
          cta: 'Choisir Standard',
          ctaClass: 'plan-cta--primary',
          highlight: true,
          badge: 'Populaire',
          premium: false,
        },
        {
          name: 'Premium',
          oldPrice: '120 000',
          oldDiscount: '-34%',
          price: '79 000',
          currency: 'FCFA',
          period: 'paiement unique',
          desc: 'Pour un site vraiment unique',
          features: ['Tout du plan Standard', 'Domaine personnalisé', 'Design 100% custom', 'Support prioritaire', 'Export PDF invitations', 'Statistiques avancées'],
          missing: [],
          cta: 'Choisir Premium',
          ctaClass: 'plan-cta--gold',
          highlight: false,
          premium: true,
        },
      ]
    },
    faq: {
      label: 'FAQ',
      title: 'Questions fréquentes',
      items: [
        { q: 'Combien de temps dure le site ?', a: 'Votre site reste en ligne pendant 2 ans après la date du mariage, inclus dans tous les plans.' },
        { q: 'Peut-on modifier le site après la création ?', a: 'Oui, vous pouvez modifier le contenu à tout moment depuis votre dashboard d\'administration.' },
        { q: 'Les invités ont-ils besoin d\'un compte ?', a: 'Non. Vos invités accèdent au site directement via le lien. Aucune inscription requise.' },
        { q: 'Le paiement est-il sécurisé ?', a: 'Oui. Nous acceptons Mobile Money (MTN, Orange) et Stripe pour les paiements internationaux.' },
      ]
    },
    footer: {
      tagline: 'Votre histoire mérite d\'être racontée.',
      links: ['Confidentialité', 'Conditions', 'Contact'],
      copy: '© 2025 WeddingApp. Fait avec amour.',
    }
  },
  en: {
    nav: { preview: 'Previews', pricing: 'Pricing', login: 'Login', cta: 'Get Started' },
    hero: {
      badge: 'Wedding website platform',
      title1: 'Your wedding,',
      title2: 'your story.',
      title3: 'Online.',
      sub: 'Create an elegant wedding website in minutes. Share the program, manage RSVPs, and give your guests an unforgettable experience.',
      cta1: 'Create my site',
      cta2: 'See previews',
      stat1: 'Sites created',
      stat2: 'Guest RSVPs',
      stat3: 'Satisfaction',
    },
    how: {
      label: 'How it works',
      title: 'From zero to live\nin 3 steps',
      steps: [
        { num: '01', title: 'Choose your theme', desc: 'Five elegant designs: Royal, Minimal, Floral, Boho, Luxury. Each theme is carefully crafted to reflect your personality.' },
        { num: '02', title: 'Customize the content', desc: 'Add your photos, story, program, guest list. Everything is intuitive and fast.' },
        { num: '03', title: 'Share the link', desc: 'Your site is available in seconds. Send the link to all your guests via WhatsApp or email.' },
      ]
    },
    themes: {
      label: 'Available themes',
      title: 'Five visions,\none elegance',
      sub: 'Each theme is a complete experience — not just a skin.',
      preview: 'See preview',
    },
    pricing: {
      label: 'Pricing',
      title: 'A price for\nevery project',
      sub: 'Start for free. Scale as you need.',
      plans: [
        {
          name: 'Free',
          oldPrice: null,
          oldDiscount: null,
          price: '0',
          currency: 'FCFA',
          period: '',
          desc: 'To discover the platform',
          features: ['5 themes included', 'RSVP & guest book', 'Guest photos', 'Countdown timer', 'Shareable link'],
          missing: ['Custom colors', 'Remove branding', 'Custom domain'],
          cta: 'Start for free',
          ctaClass: 'plan-cta--outline',
          highlight: false,
          premium: false,
        },
        {
          name: 'Standard',
          oldPrice: '49,000',
          oldDiscount: '-41%',
          price: '29,000',
          currency: 'FCFA',
          period: 'one-time',
          desc: 'The most popular choice',
          features: ['Everything in Free', 'Custom colors', 'Custom fonts', 'Remove branding', 'Extra sections', 'Premium animations'],
          missing: ['Custom domain'],
          cta: 'Choose Standard',
          ctaClass: 'plan-cta--primary',
          highlight: true,
          badge: 'Popular',
          premium: false,
        },
        {
          name: 'Premium',
          oldPrice: '120,000',
          oldDiscount: '-34%',
          price: '79,000',
          currency: 'FCFA',
          period: 'one-time',
          desc: 'For a truly unique site',
          features: ['Everything in Standard', 'Custom domain', '100% custom design', 'Priority support', 'PDF invitation export', 'Advanced analytics'],
          missing: [],
          cta: 'Choose Premium',
          ctaClass: 'plan-cta--gold',
          highlight: false,
          premium: true,
        },
      ]
    },
    faq: {
      label: 'FAQ',
      title: 'Frequently asked questions',
      items: [
        { q: 'How long does the site last?', a: 'Your site stays online for 2 years after the wedding date, included in all plans.' },
        { q: 'Can I edit the site after creation?', a: 'Yes, you can edit the content at any time from your admin dashboard.' },
        { q: 'Do guests need an account?', a: 'No. Your guests access the site directly via the link. No registration required.' },
        { q: 'Is payment secure?', a: 'Yes. We accept Mobile Money (MTN, Orange) and Stripe for international payments.' },
      ]
    },
    footer: {
      tagline: 'Your story deserves to be told.',
      links: ['Privacy', 'Terms', 'Contact'],
      copy: '© 2025 WeddingApp. Made with love.',
    }
  }
};

// ─── HOOK: INTERSECTION OBSERVER ─────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── THEME CARD — utilise THEMES de themes.js ────────────────────
const ThemeCard = ({ theme, lang, active, onClick }) => {
  const navigate = useNavigate();

  const handlePreviewClick = (e) => {
    e.stopPropagation();
    const previewData = sessionStorage.getItem("previewData");
    if (!previewData) {
      sessionStorage.setItem("selectedTheme", theme.id);
      navigate("/start-preview");
      return;
    }
    navigate(`/preview/${theme.id}`);
  };

  return (
    <div
      className={`theme-card ${active ? "theme-card--active" : ""}`}
      onClick={onClick}
      style={{ "--accent": theme.secondary }}
    >
      {/* Mini mockup */}
      <div className="theme-mockup" style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.background} 100%)`
      }}>
        <div className="mockup-dots" style={{ background: `${theme.secondary}20` }} />
        <div className="mockup-photo" style={{ borderColor: theme.secondary }} />
        <div className="mockup-names">
          <div className="mockup-name-bar" style={{ background: theme.secondary, opacity: 0.9 }} />
          <div className="mockup-name-bar small" style={{ background: `${theme.secondary}80` }} />
        </div>
        <div className="mockup-countdown">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mockup-box" style={{ borderColor: theme.secondary }} />
          ))}
        </div>
        <div className="mockup-cta" style={{ background: theme.secondary }} />
        {/* Emoji badge */}
        <div style={{ position: 'absolute', top: 8, right: 10, fontSize: '1rem' }}>
          {theme.emoji}
        </div>
      </div>

      {/* Info */}
      <div className="theme-info">
        <div className="theme-dot" style={{ background: theme.secondary }} />
        <div>
          <h3 className="theme-name">{theme.name}</h3>
          <p className="theme-desc">{theme.description}</p>
        </div>
      </div>

      <button className="theme-preview-btn" onClick={handlePreviewClick}>
        {T[lang].themes.preview} →
      </button>
    </div>
  );
};

// ─── FAQ ITEM ────────────────────────────────────────────────────
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-item--open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className="faq-icon">{open ? '−' : '+'}</span>
      </div>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────
const LandingPage = () => {
  const [lang, setLang] = useState('fr');
  const [activeTheme, setActiveTheme] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const t = T[lang];

  // Liste des thèmes depuis themes.js
  const themeList = Object.values(THEMES);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-rotate themes
  useEffect(() => {
    const id = setInterval(() => setActiveTheme(p => (p + 1) % themeList.length), 4000);
    return () => clearInterval(id);
  }, [themeList.length]);

  const [howRef, howInView] = useInView();
  const [themesRef, themesInView] = useInView();
  const [pricingRef, pricingInView] = useInView();
  const [faqRef, faqInView] = useInView();

  return (
    <div className="landing">

      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <span className="logo-ring">💍</span>
            <span>Wedding<strong>App</strong></span>
          </a>
        
          <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
            <a href="#themes" onClick={() => setMenuOpen(false)}>{t.nav.preview}</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>{t.nav.pricing}</a>
            <a href="/login" onClick={() => setMenuOpen(false)}>{t.nav.login}</a>
            <a href="/prestataires" onClick={() => setMenuOpen(false)}>Prestataires</a>
            <button
              className="lang-toggle"
              onClick={() => { setLang(l => l === 'fr' ? 'en' : 'fr'); setMenuOpen(false); }}
            >
              {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>
            <a href="/choose-plan" className="nav-cta">{t.nav.cta}</a>
          </div>

          <button className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`} onClick={() => setMenuOpen(m => !m)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <HeroSection lang={lang} />

      {/* ── HOW IT WORKS ── */}
      <section className="section how" id="how" ref={howRef}>
        <div className={`section-inner ${howInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.how.label}</div>
          <h2 className="section-title">{t.how.title}</h2>
          <div className="steps">
            {t.how.steps.map((step, i) => (
              <div key={i} className="step" style={{ '--delay': `${i * 0.12}s` }}>
                <div className="step-num">{step.num}</div>
                <div className="step-body">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
                {i < 2 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THEMES ── */}
      <section className="section themes-section" id="themes" ref={themesRef}>
        <div className={`section-inner ${themesInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.themes.label}</div>
          <h2 className="section-title">{t.themes.title}</h2>
          <p className="section-sub">{t.themes.sub}</p>

          <div className="themes-grid">
            {themeList.map((theme, i) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                lang={lang}
                active={activeTheme === i}
                onClick={() => setActiveTheme(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section pricing-section" id="pricing" ref={pricingRef}>
        <div className={`section-inner ${pricingInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.pricing.label}</div>
          <h2 className="section-title">{t.pricing.title}</h2>
          <p className="section-sub">{t.pricing.sub}</p>

          <div className="plans">
            {t.pricing.plans.map((plan, i) => (
              <div
                key={i}
                className={[
                  'plan',
                  plan.highlight ? 'plan--highlight' : '',
                  plan.premium   ? 'plan--premium'   : '',
                ].filter(Boolean).join(' ')}
              >
                {plan.badge && <div className="plan-badge">{plan.badge}</div>}
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-desc">{plan.desc}</p>
                </div>
                <div className="plan-price">
                  {plan.oldPrice && (
                    <div className="plan-price-old">
                      <span className="plan-price-old-amount">{plan.oldPrice} {plan.currency}</span>
                      {plan.oldDiscount && <span className="plan-price-old-badge">{plan.oldDiscount}</span>}
                    </div>
                  )}
                  <div className="plan-price-new">
                    <span className="price-num">{plan.price}</span>
                    <div className="price-meta">
                      <span className="price-currency">{plan.currency}</span>
                      {plan.period && <span className="price-period">{plan.period}</span>}
                    </div>
                  </div>
                </div>
                <div className="plan-features">
                  {plan.features.map((f, j) => (
                    <div key={j} className="feature feature--yes">
                      <div className="feature-check">✓</div>{f}
                    </div>
                  ))}
                  {plan.missing.map((f, j) => (
                    <div key={j} className="feature feature--no">
                      <div className="feature-check">✗</div>{f}
                    </div>
                  ))}
                </div>
                <a href={`/choose-plan?plan=${plan.name.toLowerCase()}`} className={`plan-cta ${plan.ctaClass}`}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section faq-section" ref={faqRef}>
        <div className={`section-inner ${faqInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.faq.label}</div>
          <h2 className="section-title">{t.faq.title}</h2>
          <div className="faq-list">
            {t.faq.items.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>
      

      {/* ── CTA FINAL ── */}
      <section className="section cta-final">
        <div className="cta-final-inner">
          <div className="cta-glow" />
          <p className="cta-eyebrow">💍 WeddingApp</p>
          <h2 className="cta-title">
            {lang === 'fr' ? 'Prêt à créer\nvotre site ?' : 'Ready to create\nyour site?'}
          </h2>
          <p className="cta-sub">
            {lang === 'fr'
              ? 'Rejoignez plus de 1 200 couples qui ont fait confiance à WeddingApp.'
              : 'Join over 1,200 couples who trusted WeddingApp.'}
          </p>
          <a href="/choose-plan" className="btn btn--primary btn--large">
            {t.nav.cta}
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-ring">💍</span>
            <span>Wedding<strong>App</strong></span>
          </div>
          <p className="footer-tagline">{t.footer.tagline}</p>
          <div className="footer-links">
            {t.footer.links.map((l, i) => <a key={i} href="#">{l}</a>)}
          </div>
          <p className="footer-copy">{t.footer.copy}</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

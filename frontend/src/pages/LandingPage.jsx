// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';
import HeroSection from '../components/HeroSection';
import { useNavigate } from "react-router-dom";
import { THEMES } from '../config/themes';

const T = {
  fr: {
    nav: { preview: 'Aperçus', pricing: 'Tarifs', login: 'Connexion', cta: 'Créer en 5 min', vendors: 'Prestataires' },
    hero: {
      badge: 'Plateforme de sites de mariage',
      title1: 'Votre mariage,', title2: 'votre histoire.', title3: 'En ligne.',
      sub: 'Créez un site élégant pour votre mariage en quelques minutes. Partagez le programme, gérez les RSVP, et offrez à vos invités une expérience inoubliable.',
      cta1: 'Créer notre site de mariage', cta2: 'Voir les thèmes',
      stat1: 'Sites créés', stat2: 'Invités RSVP', stat3: 'Satisfaction',
    },
    how: {
      label: 'Comment ça marche', title: 'De zéro à en ligne\nen 3 étapes',
      steps: [
        { num: '01', title: 'Choisissez votre thème', desc: 'Cinq designs élégants soigneusement conçus pour refléter votre personnalité.' },
        { num: '02', title: 'Personnalisez le contenu', desc: 'Ajoutez vos photos, votre histoire, le programme. Tout est intuitif et rapide.' },
        { num: '03', title: 'Partagez le lien', desc: 'Envoyez le lien à tous vos invités par WhatsApp ou email en quelques secondes.' },
      ]
    },
    themes: {
      label: 'Thèmes disponibles', title: 'Cinq visions,\nune seule élégance',
      sub: 'Chaque thème est une expérience complète — pas juste un habillage.', preview: "Voir l'aperçu",
    },
    testimonials: { label: 'Témoignages', title: 'Ils ont dit oui\nà WeddApp' },
    pricing: {
      label: 'Tarifs', title: 'Simple\net transparent', sub: 'Commencez gratuitement. Passez au Pro quand vous voulez.',
      plans: [
        {
          name: 'Gratuit', price: '0', currency: 'FCFA', period: 'pour toujours',
          desc: 'Pour découvrir la plateforme',
          features: ["5 thèmes inclus", "RSVP & livre d'or", 'Photos des invités', 'Compte à rebours', 'Lien partageable'],
          missing: ['Couleurs personnalisées', 'Sans branding WeddApp', 'Support prioritaire'],
          cta: 'Commencer gratuitement', ctaClass: 'plan-cta--outline', highlight: false,
          href: '/choose-theme?plan=free',
        },
        {
          name: 'Pro', oldPrice: '49 000', oldDiscount: '-41%', price: '29 000', currency: 'FCFA', period: 'paiement unique',
          desc: 'Tout ce qu\'il faut pour votre grand jour',
          features: ['Tout du plan Gratuit', 'Couleurs personnalisées', 'Sans branding WeddApp', 'Sections supplémentaires', 'Animations premium', 'Support prioritaire WhatsApp'],
          missing: [],
          cta: 'Créer notre site →', ctaClass: 'plan-cta--primary', highlight: true, badge: '🔥 Offre de lancement',
          href: '/checkout?plan=pro',
        },
      ]
    },
    vendors: {
      label: 'Espace Prestataires', title: 'Trouvez vos\nprestataires',
      sub: 'Photographes, DJ, traiteurs et bien d\'autres experts dans votre région.',
      cta: 'Voir tous les prestataires →',
      categories: [
        { icon: '📸', label: 'Photographes' },
        { icon: '🎵', label: 'DJ & Musique' },
        { icon: '🍽️', label: 'Traiteurs' },
      ],
      more: '+ Fleuristes, transport, pâtissiers…',
    },
    faq: {
      label: 'FAQ', title: 'Questions fréquentes',
      items: [
        { q: 'Combien de temps dure le site ?', a: 'Votre site reste en ligne pendant 2 ans après la date du mariage, inclus dans tous les plans.' },
        { q: 'Les invités ont-ils besoin d\'un compte ?', a: 'Non. Vos invités accèdent directement via le lien. Aucune inscription requise.' },
        { q: 'Comment se passe le paiement ?', a: 'Vous payez par MTN MoMo ou Orange Money. Votre accès Pro est activé dans les 2 heures après confirmation.' },
      ]
    },
    footer: { tagline: "Votre histoire mérite d'être racontée.", links: ['Confidentialité', 'Conditions', 'Contact', 'Prestataires'], copy: '© 2025 WeddApp. Fait avec amour.' }
  },
  en: {
    nav: { preview: 'Previews', pricing: 'Pricing', login: 'Login', cta: 'Create in 5 min', vendors: 'Vendors' },
    hero: {
      badge: 'Wedding website platform',
      title1: 'Your wedding,', title2: 'your story.', title3: 'Online.',
      sub: 'Create an elegant wedding website in minutes. Share the program, manage RSVPs, and give your guests an unforgettable experience.',
      cta1: 'Create our wedding site', cta2: 'See themes',
      stat1: 'Sites created', stat2: 'Guest RSVPs', stat3: 'Satisfaction',
    },
    how: {
      label: 'How it works', title: 'From zero to live\nin 3 steps',
      steps: [
        { num: '01', title: 'Choose your theme', desc: 'Five elegant designs carefully crafted to reflect your personality.' },
        { num: '02', title: 'Customize the content', desc: 'Add photos, your story, the program. Everything is intuitive and fast.' },
        { num: '03', title: 'Share the link', desc: 'Send the link to all your guests via WhatsApp or email in seconds.' },
      ]
    },
    themes: { label: 'Available themes', title: 'Five visions,\none elegance', sub: 'Each theme is a complete experience — not just a skin.', preview: 'See preview' },
    testimonials: { label: 'Testimonials', title: 'They said yes\nto WeddApp' },
    pricing: {
      label: 'Pricing', title: 'Simple\nand transparent', sub: "Start for free. Go Pro whenever you're ready.",
      plans: [
        {
          name: 'Free', price: '0', currency: 'FCFA', period: 'forever',
          desc: 'To discover the platform',
          features: ['5 themes included', 'RSVP & guest book', 'Guest photos', 'Countdown timer', 'Shareable link'],
          missing: ['Custom colors', 'Remove branding', 'Priority support'],
          cta: 'Start for free', ctaClass: 'plan-cta--outline', highlight: false,
          href: '/choose-theme?plan=free',
        },
        {
          name: 'Pro', oldPrice: '49,000', oldDiscount: '-41%', price: '29,000', currency: 'FCFA', period: 'one-time',
          desc: 'Everything you need for your big day',
          features: ['Everything in Free', 'Custom colors', 'Remove branding', 'Extra sections', 'Premium animations', 'WhatsApp priority support'],
          missing: [],
          cta: 'Create our site →', ctaClass: 'plan-cta--primary', highlight: true, badge: '🔥 Launch offer',
          href: '/checkout?plan=pro',
        },
      ]
    },
    vendors: {
      label: 'Vendor Space', title: 'Find your\nvendors',
      sub: 'Photographers, DJs, caterers and more experts near you.',
      cta: 'Browse all vendors →',
      categories: [
        { icon: '📸', label: 'Photographers' },
        { icon: '🎵', label: 'DJ & Music' },
        { icon: '🍽️', label: 'Caterers' },
      ],
      more: '+ Florists, transport, bakers…',
    },
    faq: {
      label: 'FAQ', title: 'Frequently asked questions',
      items: [
        { q: 'How long does the site last?', a: 'Your site stays online for 2 years after the wedding date, included in all plans.' },
        { q: 'Do guests need an account?', a: 'No. Your guests access the site directly via the link. No registration required.' },
        { q: 'How does payment work?', a: 'You pay via MTN MoMo or Orange Money. Your Pro access is activated within 2 hours of confirmation.' },
      ]
    },
    footer: { tagline: 'Your story deserves to be told.', links: ['Privacy', 'Terms', 'Contact', 'Vendors'], copy: '© 2025 WeddApp. Made with love.' }
  }
};

const TESTIMONIALS = [
  { name: 'Sophie & Marc', country: '🇫🇷', text: "Notre site était prêt en 20 minutes. Tous nos invités ont adoré l'expérience !", theme: 'Royal' },
  { name: 'Amina & Kwame', country: '🇨🇲', text: 'WeddApp a rendu notre mariage inoubliable. Simple, beau, parfait pour nous.', theme: 'Floral' },
  { name: 'Laura & James', country: '🇨🇦', text: 'Le plan Pro vaut chaque franc. Design magnifique, support très réactif.', theme: 'Luxury' },
];

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

const ThemeCard = ({ theme, lang, active, onClick }) => {
  const navigate = useNavigate();
  const handlePreviewClick = (e) => {
    e.stopPropagation();
    const previewData = sessionStorage.getItem("previewData");
    if (!previewData) { sessionStorage.setItem("selectedTheme", theme.id); navigate("/start-preview"); return; }
    navigate(`/preview/${theme.id}`);
  };
  return (
    <div className={`theme-card ${active ? "theme-card--active" : ""}`} onClick={onClick} style={{ "--accent": theme.secondary }}>
      <div className="theme-mockup" style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.background} 100%)` }}>
        <div className="mockup-dots" style={{ background: `${theme.secondary}20` }} />
        <div className="mockup-photo" style={{ borderColor: theme.secondary }} />
        <div className="mockup-names">
          <div className="mockup-name-bar" style={{ background: theme.secondary, opacity: 0.9 }} />
          <div className="mockup-name-bar small" style={{ background: `${theme.secondary}80` }} />
        </div>
        <div className="mockup-countdown">
          {[1,2,3,4].map(i => <div key={i} className="mockup-box" style={{ borderColor: theme.secondary }} />)}
        </div>
        <div className="mockup-cta" style={{ background: theme.secondary }} />
        <div style={{ position:'absolute', top:8, right:10, fontSize:'1rem' }}>{theme.emoji}</div>
      </div>
      <div className="theme-info">
        <div className="theme-dot" style={{ background: theme.secondary }} />
        <div>
          <h3 className="theme-name">{theme.name}</h3>
          <p className="theme-desc">{theme.description}</p>
        </div>
      </div>
      <button className="theme-preview-btn" onClick={handlePreviewClick}>{T[lang].themes.preview} →</button>
    </div>
  );
};

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-item--open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-q"><span>{q}</span><span className="faq-icon">{open ? '−' : '+'}</span></div>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('fr');
  const [activeTheme, setActiveTheme] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const themeScrollRef = useRef(null);
  const t = T[lang];
  const themeList = Object.values(THEMES);

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 40); setShowFloat(window.scrollY > 300); };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveTheme(p => (p + 1) % themeList.length), 4000);
    return () => clearInterval(id);
  }, [themeList.length]);

  const scrollThemes = (dir) => {
    if (themeScrollRef.current) themeScrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const [howRef, howInView] = useInView();
  const [themesRef, themesInView] = useInView();
  const [testimonialsRef, testimonialsInView] = useInView();
  const [pricingRef, pricingInView] = useInView();
  const [vendorsRef, vendorsInView] = useInView();
  const [faqRef, faqInView] = useInView();

  return (
    <div className="landing">

      <a href="/checkout?plan=pro" className={`float-cta ${showFloat ? 'float-cta--visible' : ''}`}>
        <span className="float-cta-icon">💍</span>
        <span className="float-cta-label">{lang === 'fr' ? 'Créer notre site' : 'Create our site'}</span>
      </a>

      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <span className="logo-ring">💍</span>
            <span>Wedd<strong>App</strong></span>
          </a>
          <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
            <a href="#themes" onClick={() => setMenuOpen(false)}>{t.nav.preview}</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>{t.nav.pricing}</a>
            <a href="/prestataires" onClick={() => setMenuOpen(false)}>{t.nav.vendors}</a>
            <a href="/login" onClick={() => setMenuOpen(false)}>{t.nav.login}</a>
            <button className="lang-toggle" onClick={() => { setLang(l => l === 'fr' ? 'en' : 'fr'); setMenuOpen(false); }}>
              {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>
            <a href="/checkout?plan=pro" className="nav-cta">{t.nav.cta}</a>
          </div>
          <button className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`} onClick={() => setMenuOpen(m => !m)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <HeroSection lang={lang} />

      <section className="section how" id="how" ref={howRef}>
        <div className={`section-inner ${howInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.how.label}</div>
          <h2 className="section-title">{t.how.title}</h2>
          <div className="steps">
            {t.how.steps.map((step, i) => (
              <div key={i} className="step">
                <div className="step-num">{step.num}</div>
                <div className="step-body">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section themes-section" id="themes" ref={themesRef}>
        <div className={`section-inner ${themesInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.themes.label}</div>
          <h2 className="section-title">{t.themes.title}</h2>
          <p className="section-sub">{t.themes.sub}</p>
          <div className="themes-row-wrap">
            <button className="themes-arrow" onClick={() => scrollThemes(-1)}>‹</button>
            <div className="themes-row" ref={themeScrollRef}>
              {themeList.map((theme, i) => (
                <ThemeCard key={theme.id} theme={theme} lang={lang} active={activeTheme === i} onClick={() => setActiveTheme(i)} />
              ))}
            </div>
            <button className="themes-arrow" onClick={() => scrollThemes(1)}>›</button>
          </div>
          <div className="themes-dots">
            {themeList.map((_, i) => (
              <button key={i} className={`themes-dot ${activeTheme === i ? 'themes-dot--active' : ''}`} onClick={() => setActiveTheme(i)} />
            ))}
          </div>
        </div>
      </section>

      <section className="section testimonials-section" ref={testimonialsRef}>
        <div className={`section-inner ${testimonialsInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.testimonials.label}</div>
          <h2 className="section-title">{t.testimonials.title}</h2>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((item, i) => (
              <div key={i} className="testimonial-card" style={{ '--delay': `${i * 0.1}s` }}>
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{item.text}</p>
                <div className="testimonial-footer">
                  <div className="testimonial-avatar">{item.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{item.country} {item.name}</div>
                    <div className="testimonial-theme">Thème {item.theme}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pricing-section" id="pricing" ref={pricingRef}>
        <div className={`section-inner ${pricingInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.pricing.label}</div>
          <h2 className="section-title">{t.pricing.title}</h2>
          <p className="section-sub">{t.pricing.sub}</p>
          <div className="plans plans--two">
            {t.pricing.plans.map((plan, i) => (
              <div key={i} className={['plan', plan.highlight ? 'plan--highlight' : ''].filter(Boolean).join(' ')}>
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
                  {plan.features.map((f, j) => <div key={j} className="feature feature--yes"><div className="feature-check">✓</div>{f}</div>)}
                  {plan.missing.map((f, j) => <div key={j} className="feature feature--no"><div className="feature-check">✗</div>{f}</div>)}
                </div>
                <a href={plan.href} className={`plan-cta ${plan.ctaClass}`}>{plan.cta}</a>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'32px' }}>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', flexWrap:'wrap' }}>
              <span>🔒</span> Paiement MTN MoMo & Orange Money
              <span>·</span>
              <span>⚡</span> Activation sous 2h
              <span>·</span>
              <span>💬</span> Support WhatsApp
            </p>
          </div>
        </div>
      </section>

      <section className="section vendors-section" id="prestataires" ref={vendorsRef}>
        <div className={`section-inner ${vendorsInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.vendors.label}</div>
          <h2 className="section-title">{t.vendors.title}</h2>
          <p className="section-sub">{t.vendors.sub}</p>
          <div className="vendors-categories">
            {t.vendors.categories.map((cat, i) => (
              <div key={i} className="vendor-cat-card" onClick={() => navigate('/prestataires')}>
                <span className="vendor-cat-icon">{cat.icon}</span>
                <span className="vendor-cat-label">{cat.label}</span>
              </div>
            ))}
          </div>
          <p className="vendors-more">{t.vendors.more}</p>
          <a href="/prestataires" className="vendors-cta-btn">{t.vendors.cta}</a>
        </div>
      </section>

      <section className="section faq-section" ref={faqRef}>
        <div className={`section-inner ${faqInView ? 'in-view' : ''}`}>
          <div className="section-label">{t.faq.label}</div>
          <h2 className="section-title">{t.faq.title}</h2>
          <div className="faq-list">
            {t.faq.items.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      <section className="section cta-final">
        <div className="cta-final-inner">
          <div className="cta-glow" />
          <p className="cta-eyebrow">💍 WeddApp</p>
          <h2 className="cta-title">
            {lang === 'fr' ? 'Prêt à créer\nvotre site ?' : 'Ready to create\nyour site?'}
          </h2>
          <p className="cta-sub">
            {lang === 'fr'
              ? 'Rejoignez les premiers couples qui font confiance à WeddApp. Gratuit pour commencer.'
              : 'Join the first couples who trust WeddApp. Free to start.'}
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/checkout?plan=pro" className="btn btn--primary btn--large">
              {lang === 'fr' ? 'Créer notre site de mariage' : 'Create our wedding site'}
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="/choose-theme?plan=free" className="btn btn--ghost btn--large">
              {lang === 'fr' ? 'Essayer gratuitement' : 'Try for free'}
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-ring">💍</span>
            <span>Wedd<strong>App</strong></span>
          </div>
          <p className="footer-tagline">{t.footer.tagline}</p>
          <div className="footer-links">
            {t.footer.links.map((l, i) => (
              <a key={i} href={l === 'Prestataires' || l === 'Vendors' ? '/prestataires' : '#'}>{l}</a>
            ))}
          </div>
          <p className="footer-copy">{t.footer.copy}</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

// components/Navbar.jsx - VERSION DYNAMIQUE + THEMES
import React, { useState, useEffect } from 'react';
import './NavBar.css';

// ── Styles visuels par navStyle ──────────────────────────────────
const NAV_STYLES = {
  'dark': {
    bg:          'rgba(10, 36, 99, 0.95)',
    bgScrolled:  'rgba(7, 21, 64, 0.98)',
    text:        '#FFFFFF',
    logo:        '#D4AF37',
    border:      'rgba(212, 175, 55, 0.2)',
    hamburger:   '#D4AF37',
  },
  'light': {
    bg:          'rgba(255, 255, 255, 0.95)',
    bgScrolled:  'rgba(255, 255, 255, 0.99)',
    text:        '#1A1A1A',
    logo:        '#1A1A1A',
    border:      'rgba(0, 0, 0, 0.08)',
    hamburger:   '#1A1A1A',
  },
  'transparent-light': {
    bg:          'rgba(253, 246, 240, 0.7)',
    bgScrolled:  'rgba(253, 246, 240, 0.97)',
    text:        '#4A1530',
    logo:        '#C4836A',
    border:      'rgba(196, 131, 106, 0.2)',
    hamburger:   '#C4836A',
  },
  'earthy': {
    bg:          'rgba(253, 248, 242, 0.92)',
    bgScrolled:  'rgba(253, 248, 242, 0.99)',
    text:        '#8B4513',
    logo:        '#D2691E',
    border:      'rgba(139, 69, 19, 0.15)',
    hamburger:   '#8B4513',
  },
  'black-gold': {
    bg:          'rgba(0, 0, 0, 0.9)',
    bgScrolled:  'rgba(0, 0, 0, 0.99)',
    text:        '#C6A75E',
    logo:        '#C6A75E',
    border:      'rgba(198, 167, 94, 0.2)',
    hamburger:   '#C6A75E',
  },
};

const Navbar = ({ wedding }) => {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    closeMenu();
    if (href.startsWith('/')) {
      setTimeout(() => { window.location.href = href; }, 300);
      return;
    }
    setTimeout(() => {
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  // ── Style selon thème ────────────────────────────────────────
  const navStyle  = wedding.settings.theme.navStyle || 'dark';
  const style     = NAV_STYLES[navStyle] || NAV_STYLES['dark'];
  const navBg     = scrolled ? style.bgScrolled : style.bg;

  // ── Logo & menu ──────────────────────────────────────────────
  const logoText = `${wedding.couple.person1.firstName} & ${wedding.couple.person2.firstName}`;

  const menuItems = [
    { href: '#home',      icon: '🏠', label: 'Accueil',              always: true },
    { href: '#story',     icon: '💑', label: 'Notre Histoire',        show: wedding.navigation?.showStory },
    { href: '#programme', icon: '📅', label: 'Programme',             show: wedding.navigation?.showEventInfo },
    { href: '#rsvp',      icon: '✉️', label: 'RSVP',                  always: true },
    { href: '#dress',     icon: '👑', label: 'Code Vestimentaire',    show: wedding.navigation?.showDressCode },
    { href: '#photos',    icon: '📸', label: 'Défis Photos',          show: wedding.navigation?.showPhotos && wedding.photoChallenge?.enabled },
    { href: '#guestbook', icon: '📌', label: "Livre d'Or",            show: wedding.navigation?.showGuestbook && wedding.guestbook?.enabled },
    { href: '#gifts', icon: '🎁', label: 'Liste de Cadeaux', show: wedding.gifts?.enabled },
  ].filter(item => item.always || item.show);

  const customLinks = wedding.navigation?.customLinks || [];

  return (
    <>
      <nav
        className={`navbar ${scrolled ? 'scrolled' : ''} navbar--${navStyle}`}
        style={{
          '--nav-primary':   wedding.settings.theme.primaryColor,
          '--nav-secondary': wedding.settings.theme.secondaryColor,
          '--nav-bg':        navBg,
          '--nav-text':      style.text,
          '--nav-logo':      style.logo,
          '--nav-border':    style.border,
          '--nav-hamburger': style.hamburger,
          background:        navBg,
          borderBottomColor: style.border,
          backdropFilter:    'blur(12px)',
          transition:        'background 0.3s ease',
        }}
      >
        <div className="nav-content">
          <a
            href="#home"
            className="nav-logo"
            style={{ color: style.logo }}
            onClick={(e) => handleNavClick(e, '#home')}
          >
            {logoText}
          </a>

          <button
            className={`hamburger ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            style={{ '--hb-color': style.hamburger }}
          >
            <span style={{ background: style.hamburger }} />
            <span style={{ background: style.hamburger }} />
            <span style={{ background: style.hamburger }} />
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        className={`menu-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Menu overlay */}
      <div
        className={`menu-overlay ${menuOpen ? 'open' : ''} menu-overlay--${navStyle}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        style={{
          '--overlay-bg':     navStyle === 'light' || navStyle === 'transparent-light' || navStyle === 'earthy'
                                ? style.bgScrolled
                                : 'rgba(5, 15, 40, 0.98)',
          '--overlay-text':   style.text,
          '--overlay-accent': style.logo,
        }}
      >
        <button
          className="close-menu"
          onClick={closeMenu}
          aria-label="Fermer le menu"
          style={{ color: style.logo }}
        >
          ×
        </button>

        <ul className="menu-items">
          {menuItems.map((item, i) => (
            <li key={item.href} style={{ animationDelay: menuOpen ? `${0.05 + i * 0.06}s` : '0s' }}>
              <a
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                style={{ color: style.text }}
              >
                <span className="menu-icon">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}

          {customLinks.map((link, i) => (
            <li key={`custom-${i}`} style={{ animationDelay: menuOpen ? `${0.05 + (menuItems.length + i) * 0.06}s` : '0s' }}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: style.text }}
              >
                <span className="menu-icon">🔗</span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Navbar;

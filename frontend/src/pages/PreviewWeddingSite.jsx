// pages/PreviewWeddingSite.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTheme, getThemeVars } from '../config/themes';
import { useAuth } from '../contexts/AuthContext';
import Navbar          from '../components/Navbar';
import Hero            from '../components/Hero';
import Story           from '../components/Story';
import EventInfo       from '../components/EventInfo';
import DressCode       from '../components/DressCode';
import PhotoChallenge  from '../components/PhotoChallenge';
import GuestBook       from '../components/GuestBook';
import RSVP            from '../components/RSVP';
import Footer          from '../components/Footer';
import Gifts from '../components/Gifts';

import './preview.css';

const THEME_LIST = ['royal', 'minimal', 'floral', 'boho', 'luxury'];

const PreviewWeddingSite = () => {
  const { theme: themeId } = useParams();
  const navigate           = useNavigate();
const { isAuthenticated } = useAuth();

  const themeConfig = getTheme(themeId);

  const previewData = (() => {
    try {
      const s = JSON.parse(sessionStorage.getItem('previewData'));
      if (s) return s;
    } catch {}
    return {
      names:   'Emma & Lucas',
      date:    new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      city:    'Paris',
      country: 'France',
    };
  })();

  const wedding = {
    weddingDate: previewData.date,
    couple: {
      person1: { firstName: previewData.names?.split('&')[0]?.trim() || 'Emma', photo: '' },
      person2: { firstName: previewData.names?.split('&')[1]?.trim() || 'Lucas', photo: '' },
    },
    venue: {
      city:    previewData.city    || 'Paris',
      country: previewData.country || 'France',
    },
    settings: {
      theme: {
        id:             themeConfig.id,
        primaryColor:   themeConfig.primary,
        secondaryColor: themeConfig.secondary,
        accentColor:    themeConfig.accent,
        fontFamily:     themeConfig.font,
        heroLayout:     themeConfig.heroLayout,
        navStyle:       themeConfig.navStyle,
        sectionBg:      themeConfig.sectionBg,
      },
      features: { countdown: true },
    },
    navigation: {
      showStory: true, showEventInfo: true, showDressCode: true,
      showPhotos: true, showGuestbook: true,
    },
    story:          { enabled: true,  title: 'Notre Histoire', versions: null },
    eventInfo:      { enabled: true,  title: 'Le Programme',   events: []     },
    dressCode:      { enabled: true,  showCarousel: true                       },
    photoChallenge: { enabled: true,  uploadEnabled: true, title: 'Mission Photos' },
    guestbook:      { enabled: true,  title: "Livre d'Or"                     },
    gifts: { enabled: true, title: 'Liste de Mariage' }
  };

  const handleCreate      = () => navigate(isAuthenticated ? '/finalize-creation' : '/register');
  const handleSwitchTheme = (t) => navigate(`/preview/${t}`);

  // ✅ DANS PreviewWeddingSite.jsx — filtrer les propriétés de fond
const themeVars = getThemeVars(themeId);

// On retire background/backgroundColor pour ne pas écraser les sections
const { background, backgroundColor, ...safeThemeVars } = themeVars;

return (
  
 
  <div
    className={`public-wedding-site theme-${themeConfig.id}`}
    style={{ ...safeThemeVars, fontFamily: `'${themeConfig.font}', serif` }}
  >
      {/* Barre flottante */}
      <div className="preview-floating-controls">
        <div className="theme-switcher">
          {THEME_LIST.map(t => (
            <button key={t} className={themeId === t ? 'active' : ''}
              onClick={() => handleSwitchTheme(t)} title={getTheme(t).name}>
              {getTheme(t).emoji} {getTheme(t).name.split(' ')[0]}
            </button>
          ))}
        </div>
        <button className="create-site-floating" onClick={handleCreate}>
          Créer mon site 💍
        </button>
      </div>

      {/* Tous les composants avec isPreview={true} */}
      <Navbar         wedding={wedding} />
      <Hero           wedding={wedding} />
      <Story          wedding={wedding} isPreview={true} />
      <EventInfo      wedding={wedding} isPreview={true} />
      <DressCode      wedding={wedding} />
      <RSVP           wedding={wedding} isPreview={true} />
      <PhotoChallenge wedding={wedding} isPreview={true} />
      <GuestBook      wedding={wedding} isPreview={true} />
      <Gifts wedding={wedding} isPreview={true} />
      
      <Footer         wedding={wedding} />
    </div>
  
  );
};

export default PreviewWeddingSite;

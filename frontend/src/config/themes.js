// src/config/themes.js

export const THEMES = {
  royal: {
    id: 'royal',
    name: 'Royal Elegance',
    description: 'Bleu profond & or champagne. Pour un mariage de prestige.',
    primary: '#0A2463',
    secondary: '#D4AF37',
    accent: '#ffffffa9',
    background: '#071540',
    font: 'Playfair Display',
    free: true,
    emoji: '👑',
    heroLayout: 'centered',
    navStyle: 'dark',
    sectionBg: 'dark',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Chic',
    description: 'Blanc & encre. La beauté dans la simplicité.',
    primary: '#1A1A1A',
    secondary: '#C9A84C',
    accent: '#F0EEE8',
    background: '#FAFAFA',
    font: 'Montserrat',
    free: true,
    emoji: '🤍',
    heroLayout: 'split',
    navStyle: 'light',
    sectionBg: 'light',
  },
  floral: {
    id: 'floral',
    name: 'Floral Romance',
    description: 'Rose poudré & vert sauge. Romantique et naturel.',
    primary: '#4A1530',
    secondary: '#C4836A',
    accent: '#F5E6E0',
    background: '#FDF6F0',
    font: 'Cormorant Garamond',
    free: true,
    emoji: '🌸',
    heroLayout: 'fullscreen',
    navStyle: 'transparent-light',
    sectionBg: 'warm',
  },
  boho: {
    id: 'boho',
    name: 'Bohème Nature',
    description: 'Terracotta & beige. Ambiance champêtre et naturelle.',
    primary: '#8B4513',
    secondary: '#D2691E',
    accent: '#EED5B7',
    background: '#FDF8F2',
    font: 'Lora',
    free: true,
    emoji: '🌿',
    heroLayout: 'split-reverse',
    navStyle: 'earthy',
    sectionBg: 'earthy',
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury Black & Gold',
    description: 'Noir profond & or brillant. Ultra sophistiqué.',
    primary: '#0D0D0D',
    secondary: '#C6A75E',
    accent: '#FFD700',
    background:  'white', // retiré pour éviter conflit avec sections
    font: 'Cinzel',
    free: true,
    emoji: '✦',
    heroLayout: 'fullscreen-dark',
    navStyle: 'black-gold',
    sectionBg: 'black',
  },
};

export const getTheme = (id) => THEMES[id] || THEMES.royal;

// ✅ FIX CRITIQUE : on n'injecte PAS --site-background ni background/backgroundColor
// Ces propriétés héritent sur tous les composants enfants et écrasent
// les fonds définis dans Story.css, GuestBook.css, PhotoChallenge.css etc.
// Chaque composant gère son propre fond via sa classe .story--royal, .gb--royal etc.
export const getThemeVars = (id) => {
  const t = getTheme(id);
  return {
    '--site-primary':   t.primary,
    '--site-secondary': t.secondary,
    '--site-accent':    t.accent,
    // '--site-background' retiré intentionnellement — NE PAS REMETTRE
    '--site-font':      t.font,
  };
};
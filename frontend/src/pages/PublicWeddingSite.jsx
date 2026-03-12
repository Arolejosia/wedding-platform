// pages/PublicWeddingSite.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getThemeVars } from '../config/themes';

import Navbar         from '../components/Navbar';
import Hero           from '../components/Hero';
import Story          from '../components/Story';
import EventInfo      from '../components/EventInfo';
import DressCode      from '../components/DressCode';
import PhotoChallenge from '../components/PhotoChallenge';
import GuestBook      from '../components/GuestBook';
import RSVP           from '../components/RSVP';
import Footer         from '../components/Footer';
import Gifts          from '../components/Gifts';


import './PublicWeddingSite.css';
import API_URL from '../config/api';

const PublicWeddingSite = () => {
  const { slug } = useParams();
  const [wedding, setWedding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!slug) return;
    fetchWedding();
  }, [slug]); // eslint-disable-line

  const fetchWedding = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/public/wedding/${slug}`);
      if (!response.ok) throw new Error('Mariage introuvable');
      const data = await response.json();
      setWedding(data.wedding);
    } catch (err) {
      console.error('Erreur chargement wedding:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!slug) return (
    <div className="error-container">
      <div className="error-icon">🔗</div>
      <h2>Lien invalide</h2>
      <p>Aucun identifiant de mariage trouvé dans l'URL.</p>
    </div>
  );

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Chargement du site...</p>
    </div>
  );

  if (error || !wedding) return (
    <div className="error-container">
      <div className="error-icon">😔</div>
      <h2>Mariage introuvable</h2>
      <p>Le site que vous cherchez n'existe pas ou n'est plus disponible.</p>
      <p className="error-slug">Slug recherché : <strong>{slug}</strong></p>
    </div>
  );

  const themeId   = wedding.settings?.theme?.id || wedding.theme || 'royal';
  const themeVars = getThemeVars(themeId);

  return (
    <div
      className={`public-wedding-site theme-${themeId}`}
      style={{ ...themeVars, fontFamily: `'${wedding.settings?.theme?.fontFamily || 'Playfair Display'}', serif` }}
    >
      <Navbar wedding={wedding} />
      <Hero   wedding={wedding} />

      {wedding.story?.enabled        && <Story          wedding={wedding} />}
      {wedding.eventInfo?.enabled    && <EventInfo      wedding={wedding} />}
      <RSVP wedding={wedding} />
      {wedding.dressCode?.enabled    && <DressCode      wedding={wedding} />}
      {wedding.photoChallenge?.enabled && <PhotoChallenge wedding={wedding} />}
      {wedding.guestbook?.enabled    && <GuestBook      wedding={wedding} />}
      {wedding.gifts?.enabled        && <Gifts          wedding={wedding} />}

      <Footer wedding={wedding} />
    </div>
  );
};

export default PublicWeddingSite;

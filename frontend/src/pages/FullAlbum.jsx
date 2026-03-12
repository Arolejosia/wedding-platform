// pages/FullAlbum.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import './FullAlbum.css';

import API_URL from '../config/api';
const API = API_URL;  // ✅
const THEME_STYLES = {
  royal:   { bg: 'linear-gradient(160deg,#0A2463 0%,#030d2a 100%)', color: '#fff',    accent: '#D4AF37', headerBg: 'rgba(255,255,255,0.05)', border: 'rgba(212,175,55,0.3)',  filterActive: '#D4AF37', filterActiveTxt: '#030d2a' },
  minimal: { bg: '#fafafa',   color: '#1a1a1a', accent: '#1a1a1a', headerBg: '#fff',       border: '#e8e8e8',               filterActive: '#1a1a1a', filterActiveTxt: '#fff'    },
  floral:  { bg: '#fdf0f4',   color: '#4A1530', accent: '#C4836A', headerBg: '#fff',       border: 'rgba(196,131,106,0.25)',filterActive: '#4A1530', filterActiveTxt: '#fff'    },
  boho:    { bg: '#fdf8f2',   color: '#5c3d2e', accent: '#8B4513', headerBg: '#fff9f4',    border: 'rgba(210,105,30,0.2)',  filterActive: '#8B4513', filterActiveTxt: '#fff'    },
  luxury:  { bg: '#080808',   color: '#C6A75E', accent: '#C6A75E', headerBg: 'rgba(198,167,94,0.06)', border: 'rgba(198,167,94,0.2)', filterActive: '#C6A75E', filterActiveTxt: '#080808' },
};

// ── Lightbox ──────────────────────────────────────────────────────
const Lightbox = ({ photos, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft')  setCurrent(c => (c - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % photos.length);
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [photos.length, onClose]);

  return (
    <div className="fa-lightbox" onClick={onClose}>
      <button className="fa-lb-close" onClick={onClose}>✕</button>
      <button className="fa-lb-nav fa-lb-nav--prev"
        onClick={e => { e.stopPropagation(); setCurrent(c => (c-1+photos.length)%photos.length); }}>❮</button>
      <div className="fa-lb-content" onClick={e => e.stopPropagation()}>
        <img src={photos[current]?.url || photos[current]?.thumbnailUrl} alt="" className="fa-lb-img" />
        <div className="fa-lb-counter">{current+1} / {photos.length}</div>
      </div>
      <button className="fa-lb-nav fa-lb-nav--next"
        onClick={e => { e.stopPropagation(); setCurrent(c => (c+1)%photos.length); }}>❯</button>
    </div>
  );
};

// ── FullAlbum ─────────────────────────────────────────────────────
const FullAlbum = () => {
  const { weddingSlug } = useParams();
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();

  const theme = searchParams.get('theme') || sessionStorage.getItem('weddingTheme') || 'royal';
  const ts    = THEME_STYLES[theme] || THEME_STYLES.royal;

  const [weddingId,   setWeddingId]   = useState(null);
  const [categories,  setCategories]  = useState([]); // ✅ dynamiques
  const [photos,      setPhotos]      = useState([]);
  const [total,       setTotal]       = useState(0);
  const [nextCursor,  setNextCursor]  = useState(null);
  const [hasMore,     setHasMore]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category,    setCategory]    = useState('all');
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [error,       setError]       = useState(null);

  // ── Résoudre slug → weddingId + charger catégories ──────────────
  useEffect(() => {
    const resolve = async () => {
      try {
        let id = weddingSlug;

        if (!/^[a-f\d]{24}$/i.test(weddingSlug)) {
          const res  = await fetch(`${API_URL}/public/wedding/${weddingSlug}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          id = data._id || data.wedding?._id || weddingSlug;
          // ✅ Charger les catégories dynamiques depuis le mariage
          const cats = data.photoChallenge?.categories || data.wedding?.photoChallenge?.categories || [];
          setCategories(cats);
        } else {
          // Si c'est un _id direct, on essaie quand même de charger le mariage
          const res  = await fetch(`${API_URL}/public/wedding-by-id/${weddingSlug}`).catch(() => null);
          if (res?.ok) {
            const data = await res.json();
            const cats = data.photoChallenge?.categories || data.wedding?.photoChallenge?.categories || [];
            setCategories(cats);
          }
        }

        setWeddingId(id);
      } catch {
        setWeddingId(weddingSlug);
      }
    };
    resolve();
  }, [weddingSlug]);

  // ── Charger les photos ───────────────────────────────────────────
  const fetchPhotos = useCallback(async (cat, cursor, append = false) => {
    if (!weddingId) return;
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const catParam = cat && cat !== 'all' ? `&category=${cat}` : '';
      const curParam = cursor ? `&next_cursor=${encodeURIComponent(cursor)}` : '';
      const res  = await fetch(`${API_URL}/public/photos?weddingId=${weddingId}&limit=24${catParam}${curParam}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      const newPhotos = Array.isArray(data.photos) ? data.photos : [];
      setPhotos(prev => append ? [...prev, ...newPhotos] : newPhotos);
      setTotal(typeof data.total === 'number' ? data.total : newPhotos.length);
      setNextCursor(data.next_cursor || null);
      setHasMore(data.hasMore === true);
    } catch (err) {
      setError('Impossible de charger les photos.');
      if (!append) setPhotos([]);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    if (!weddingId) return;
    setPhotos([]); setNextCursor(null); setHasMore(false);
    fetchPhotos(category, null, false);
  }, [category, weddingId]); // eslint-disable-line

  // Catégorie map pour les badges
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  return (
    <div className="fa-page" style={{ background: ts.bg, color: ts.color, minHeight: '100vh' }}>

      {/* Header */}
      <div className="fa-header" style={{ background: ts.headerBg, borderBottom: `1px solid ${ts.border}` }}>
        <button className="fa-back" style={{ color: ts.accent }} onClick={() => navigate(-1)}>← Retour</button>
        <div className="fa-header-center">
          <h1 className="fa-title" style={{ color: ts.accent }}>Album Photos</h1>
          <p className="fa-subtitle" style={{ color: ts.color, opacity: 0.7 }}>
            {total} photo{total > 1 ? 's' : ''} partagée{total > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Filtres — dynamiques ✅ */}
      {categories.length > 0 && (
        <div className="fa-filters" style={{ borderBottom: `1px solid ${ts.border}` }}>
          {/* Bouton "Toutes" */}
          <button className="fa-filter-btn"
            style={category === 'all'
              ? { background: ts.filterActive, color: ts.filterActiveTxt, border: `2px solid ${ts.filterActive}` }
              : { background: 'transparent', color: ts.color, border: `2px solid ${ts.border}`, opacity: 0.7 }}
            onClick={() => setCategory('all')}>
            📸 Toutes
          </button>

          {/* Une catégorie par entrée dans photoChallenge.categories */}
          {categories.map(cat => (
            <button key={cat.id} className="fa-filter-btn"
              style={category === cat.id
                ? { background: cat.color, color: '#fff', border: `2px solid ${cat.color}` }
                : { background: 'transparent', color: ts.color, border: `2px solid ${ts.border}`, opacity: 0.7 }}
              onClick={() => setCategory(cat.id)}>
              {cat.icon} {cat.title}
            </button>
          ))}
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="fa-loading">
          <div className="fa-spinner" style={{ borderTopColor: ts.accent }} />
          <p style={{ color: ts.color, opacity: 0.6 }}>Chargement de l'album…</p>
        </div>
      ) : error ? (
        <div className="fa-empty">
          <span>⚠️</span>
          <p style={{ color: ts.color }}>{error}</p>
          <button className="fa-retry-btn" style={{ borderColor: ts.accent, color: ts.accent }}
            onClick={() => fetchPhotos(category, null, false)}>Réessayer</button>
        </div>
      ) : photos.length === 0 ? (
        <div className="fa-empty">
          <span>📷</span>
          <p style={{ color: ts.color, opacity: 0.8 }}>Aucune photo dans cette catégorie</p>
          {category !== 'all' && (
            <button className="fa-retry-btn" style={{ borderColor: ts.accent, color: ts.accent }}
              onClick={() => setCategory('all')}>Voir toutes les photos</button>
          )}
        </div>
      ) : (
        <>
          <div className="fa-grid">
            {photos.map((photo, i) => {
              const cat = catMap[photo.category];
              return (
                <div key={photo.publicId || photo._id || i} className="fa-photo"
                  onClick={() => setLightboxIdx(i)}>
                  <img src={photo.thumbnailUrl || photo.url} alt="" loading="lazy"
                    onError={e => { e.target.style.opacity = '0.3'; }} />
                  {/* Badge catégorie dynamique */}
                  {cat && (
                    <div className="fa-photo-cat" style={{ background: cat.color }}>
                      {cat.icon}
                    </div>
                  )}
                  <div className="fa-photo-overlay"><span>🔍</span></div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="fa-load-more">
              <button className="fa-load-btn"
                style={{ background: ts.accent, color: ts.filterActiveTxt }}
                onClick={() => fetchPhotos(category, nextCursor, true)}
                disabled={loadingMore}>
                {loadingMore ? <><span className="fa-spin" /> Chargement…</> : 'Charger plus de photos'}
              </button>
            </div>
          )}
        </>
      )}

      {lightboxIdx !== null && photos.length > 0 && (
        <Lightbox photos={photos} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  );
};

export default FullAlbum;

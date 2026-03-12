// pages/AllMessages.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import './AllMessages.css';

const API = 'API_URL';

const POST_IT_COLORS = ['#FFF8DC','#FFF0C4','#F4E5C2','#EEF4FF','#F0F8F0','#FFF0F5'];
const ROTATIONS      = [-3,-2,-1,0,1,2,3,-1.5,1.5,-2.5];

const THEME_STYLES = {
  royal:   { bg: 'linear-gradient(160deg,#0A2463 0%,#030d2a 100%)', color: '#fff',    accent: '#D4AF37', headerBg: 'rgba(255,255,255,0.05)', border: 'rgba(212,175,55,0.3)',   btnColor: '#030d2a' },
  minimal: { bg: '#fafafa',                                          color: '#1a1a1a', accent: '#1a1a1a', headerBg: '#fff',                   border: '#e8e8e8',                btnColor: '#fff'    },
  floral:  { bg: '#fdf0f4',                                          color: '#4A1530', accent: '#C4836A', headerBg: '#fff',                   border: 'rgba(196,131,106,0.25)', btnColor: '#fff'    },
  boho:    { bg: '#fdf8f2',                                          color: '#5c3d2e', accent: '#8B4513', headerBg: '#fff9f4',                 border: 'rgba(210,105,30,0.2)',   btnColor: '#fff'    },
  luxury:  { bg: '#080808',                                          color: '#C6A75E', accent: '#C6A75E', headerBg: 'rgba(198,167,94,0.06)',  border: 'rgba(198,167,94,0.2)',   btnColor: '#080808' },
};

const PostIt = ({ message, index }) => {
  const rotation = message.isFromCouple ? 0 : ROTATIONS[index % ROTATIONS.length];
  const pinColor = ['#D4AF37','#0A2463','#FF69B4','#4169E1'][index % 4];
  return (
    <div
      className={`am-postit ${message.isFromCouple ? 'am-postit--couple' : ''}`}
      style={{
        background:     message.color || POST_IT_COLORS[index % POST_IT_COLORS.length],
        transform:      `rotate(${rotation}deg)`,
        animationDelay: `${(index % 8) * 0.06}s`,
      }}
    >
      <div className="am-pin" style={{ background: pinColor }}>
        <div className="am-pin-head" style={{ background: pinColor }} />
        <div className="am-pin-needle" />
      </div>
      {message.isFromCouple && <div className="am-couple-badge">💍 Mariés</div>}
      <div className="am-emoji">{message.emoji || '💛'}</div>
      <p className="am-message">"{message.message}"</p>
      <div className="am-author">— {message.name}</div>
      <div className="am-date">
        {new Date(message.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}
      </div>
      <div className="am-fold" />
    </div>
  );
};

const AllMessages = () => {
  const { weddingSlug } = useParams();
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();

  // Thème : URL param → sessionStorage → défaut royal
  const theme = searchParams.get('theme')
    || sessionStorage.getItem('weddingTheme')
    || 'royal';
  const ts = THEME_STYLES[theme] || THEME_STYLES.royal;

  const [weddingId,   setWeddingId]   = useState(null);
  const [weddingName, setWeddingName] = useState('');
  const [messages,    setMessages]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState(null);

  // Étape 1 — résoudre slug → weddingId
  useEffect(() => {
    const resolve = async () => {
      if (!weddingSlug) { setLoading(false); return; }
      // ObjectId MongoDB direct
      if (/^[a-f\d]{24}$/i.test(weddingSlug)) {
        setWeddingId(weddingSlug);
        return;
      }
      // Thème preview (royal, minimal, etc.) → pas de fetch backend
      if (['royal','minimal','floral','boho','luxury'].includes(weddingSlug)) {
        setWeddingId(null);
        setLoading(false);
        return;
      }
      // Slug réel → chercher par slug
      try {
        const res  = await fetch(`${API}/api/weddings/by-slug/${weddingSlug}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setWeddingId(data._id);
        const p1 = data.couple?.person1?.firstName || '';
        const p2 = data.couple?.person2?.firstName || '';
        if (p1 && p2) setWeddingName(`${p1} & ${p2}`);
      } catch {
        setWeddingId(weddingSlug); // fallback
      }
    };
    resolve();
  }, [weddingSlug]);

  // Étape 2 — charger les messages
  const fetchPage = useCallback(async (p, append = false) => {
    if (!weddingId) return;
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const res  = await fetch(
        `${API}/api/guestbook?weddingId=${weddingId}&limit=15&page=${p}&priority=true`
      );
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setMessages(prev => append ? [...prev, ...(data.messages || [])] : (data.messages || []));
      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);
    } catch {
      setError('Impossible de charger les messages.');
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    if (weddingId) { setPage(1); fetchPage(1, false); }
  }, [weddingId, fetchPage]);

  const loadMore = () => { const next = page + 1; setPage(next); fetchPage(next, true); };

  return (
    <div className="am-page" style={{ background: ts.bg, color: ts.color, minHeight: '100vh' }}>

      {/* Header */}
      <div className="am-header" style={{ background: ts.headerBg, borderBottom: `1px solid ${ts.border}` }}>
        <button className="am-back" style={{ color: ts.accent }} onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <div className="am-header-center">
          <h1 className="am-title" style={{ color: ts.accent }}>Livre d'Or</h1>
          <p className="am-subtitle" style={{ color: ts.color, opacity: 0.7 }}>
            {weddingName && <span>{weddingName} · </span>}
            {total} message{total > 1 ? 's' : ''} d'amour
          </p>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Contenu */}
      {!weddingId && !loading ? (
        <div className="am-empty">
          <span>👁</span>
          <p style={{ color: ts.color }}>Mode aperçu — les messages apparaîtront ici</p>
        </div>
      ) : loading ? (
        <div className="am-loading">
          <div className="am-spinner" style={{ borderTopColor: ts.accent }} />
          <p style={{ color: ts.color, opacity: 0.6 }}>Chargement des messages…</p>
        </div>
      ) : error ? (
        <div className="am-empty">
          <span>⚠️</span>
          <p style={{ color: ts.color }}>{error}</p>
          <button className="am-retry-btn"
            style={{ borderColor: ts.accent, color: ts.accent }}
            onClick={() => fetchPage(1)}>Réessayer</button>
        </div>
      ) : messages.length === 0 ? (
        <div className="am-empty">
          <span>📌</span>
          <p style={{ color: ts.color }}>Aucun message pour l'instant</p>
          <small style={{ color: ts.color, opacity: 0.5 }}>Soyez le premier à laisser un mot d'amour !</small>
        </div>
      ) : (
        <>
          <div className="am-wall">
            {messages.map((m, i) => <PostIt key={m._id} message={m} index={i} />)}
          </div>
          {hasMore && (
            <div className="am-load-more">
              <button className="am-load-btn"
                style={{ background: ts.accent, color: ts.btnColor }}
                onClick={loadMore} disabled={loadingMore}>
                {loadingMore
                  ? <><span className="am-spin" /> Chargement…</>
                  : 'Voir plus de messages'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllMessages;

// components/GuestBook.jsx — 2 messages preview + bouton voir tout
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuestBook.css';
import API_URL from '../config/api';

const API            = API_URL;
const EMOJIS         = ['💛','💍','🌸','✨','💫','🎉','💝','🥂','🌹','💒'];
const POST_IT_COLORS = ['#FFF8DC','#FFF0C4','#F4E5C2','#EEF4FF','#F0F8F0','#FFF0F5'];
const ROTATIONS      = [-3,-2,-1,0,1,2,3,-1.5,1.5,-2.5];

const PREVIEW_MESSAGES = [
  { _id:'p1', name:'Emma & Lucas', message:'Ce jour restera gravé dans nos cœurs pour toujours. Merci à tous nos invités pour votre amour et votre présence.', emoji:'💍', color:'#EEF4FF', isFromCouple:true,  createdAt:new Date().toISOString() },
  { _id:'p2', name:'Sophie Martin', message:"Une cérémonie magnifique, pleine d'émotion et de joie. Vous formez un couple extraordinaire !", emoji:'🌸', color:POST_IT_COLORS[0], isFromCouple:false, createdAt:new Date().toISOString() },
];

// ── Post-it ───────────────────────────────────────────────────────
const PostIt = ({ message, index, isNew, isHighlight }) => {
  const rotation = isHighlight ? 0 : ROTATIONS[index % ROTATIONS.length];
  const pinColor = ['#D4AF37','#0A2463','#FF69B4','#4169E1'][index % 4];
  return (
    <div className={`postit ${isNew ? 'postit-new' : ''} ${isHighlight ? 'postit--highlight' : ''}`}
      style={{
        background:    message.color || POST_IT_COLORS[index % POST_IT_COLORS.length],
        transform:     `rotate(${rotation}deg)`,
        animationDelay:`${(index % 5) * 0.1}s`,
      }}>
      <div className="postit-pin" style={{ background: pinColor }}>
        <div className="pin-head"   style={{ background: pinColor }} />
        <div className="pin-needle" />
      </div>
      {isHighlight && <div className="postit-couple-badge">💍 Message des mariés</div>}
      <div className="postit-emoji">{message.emoji || '💛'}</div>
      <p className="postit-message">"{message.message}"</p>
      <div className="postit-author">— {message.name}</div>
      <div className="postit-date">
        {new Date(message.createdAt).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
      </div>
      <div className="postit-fold" />
    </div>
  );
};

// ── Formulaire ────────────────────────────────────────────────────
const GBForm = ({ wedding, onMessageAdded, isPreview, variant }) => {
  const [name,    setName]    = useState('');
  const [msg,     setMsg]     = useState('');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [err,     setErr]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) { setErr('Veuillez remplir tous les champs'); return; }
    setSending(true); setErr('');
    if (isPreview) {
      setTimeout(() => {
        onMessageAdded({ _id:`p-${Date.now()}`, name:name.trim(), message:msg.trim(),
          emoji:EMOJIS[Math.floor(Math.random()*EMOJIS.length)],
          color:POST_IT_COLORS[Math.floor(Math.random()*POST_IT_COLORS.length)],
          isFromCouple:false, createdAt:new Date().toISOString() });
        setSent(true); setName(''); setMsg(''); setSending(false);
        setTimeout(() => setSent(false), 4000);
      }, 600);
      return;
    }
    try {
      const res = await fetch(`${API}/guestbook`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ weddingId:wedding._id, name:name.trim(), message:msg.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onMessageAdded(data.message);
      setSent(true); setName(''); setMsg('');
      setTimeout(() => setSent(false), 4000);
    } catch { setErr("Erreur lors de l'envoi. Réessayez."); }
    finally { setSending(false); }
  };

  if (sent) return (
    <div className={`gb-success gb-success--${variant}`}>
      <span>🎉</span><h3>Message épinglé !</h3><p>Merci pour votre message d'amour 💝</p>
    </div>
  );

  return (
    <form className={`gb-form gb-form--${variant}`} onSubmit={handleSubmit}>
      <div className="rsvp-field">
        <label>Votre prénom</label>
        <input type="text" placeholder="Ex: Marie" value={name}
          onChange={e => setName(e.target.value)} maxLength={100} disabled={sending}
          className={`rsvp-input rsvp-input--${variant}`} />
      </div>
      <div className="rsvp-field">
        <label>Votre message ({msg.length}/500)</label>
        <textarea placeholder="Écrivez vos vœux..." value={msg}
          onChange={e => setMsg(e.target.value)} maxLength={500} disabled={sending} rows={4}
          className={`rsvp-input rsvp-textarea rsvp-input--${variant}`} />
      </div>
      {err && <p className="rsvp-error">{err}</p>}
      <button type="submit" className={`gb-btn gb-btn--${variant}`}
        disabled={sending || !name.trim() || !msg.trim()}>
        {sending ? 'Épinglage…' : '📌 Épingler mon message'}
      </button>
    </form>
  );
};

// ── Mur (2 messages + compteur + bouton voir tout) ─────────────────
const Wall = ({ messages, loading, newMessageId, totalCount, fetchMessages,
                isPreview, variant, weddingSlug, themeId }) => {
  const navigate = useNavigate();

  const sorted  = [...messages].sort((a,b) => (b.isFromCouple?1:0)-(a.isFromCouple?1:0));
  const visible = sorted.slice(0, 2);

  // ✅ Navigation avec thème passé en URL + sessionStorage
  const goToMessages = () => {
    sessionStorage.setItem('weddingTheme', themeId || 'royal');
    navigate(`/wedding/${weddingSlug}/guestbook?theme=${themeId || 'royal'}`);
  };

  return (
    <div className={`gb-wall-section gb-wall-section--${variant}`}>
      <div className="gb-wall-header">
        <h3 className={`gb-wall-title gb-wall-title--${variant}`}>🪡 Le Mur des Souvenirs</h3>
        {!isPreview && (
          <button className={`gb-refresh gb-refresh--${variant}`} onClick={fetchMessages}>🔄</button>
        )}
      </div>

      {totalCount > 0 && (
        <div className={`gb-counter gb-counter--${variant}`}>
          <span className="gb-counter__num">{totalCount}</span>
          <span className="gb-counter__lbl">message{totalCount > 1 ? 's' : ''} épinglé{totalCount > 1 ? 's' : ''}</span>
        </div>
      )}

      {loading ? (
        <div className="gb-loading">
          <span className={`gb-spinner gb-spinner--${variant}`}/><p>Chargement…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="gb-empty">
          <span>📌</span><p>Le mur est vide pour l'instant</p>
          <p className="gb-empty-sub">Soyez le premier à épingler un message !</p>
        </div>
      ) : (
        <div className="postit-wall postit-wall--preview">
          {visible.map((m, i) => (
            <PostIt key={m._id} message={m} index={i}
              isNew={m._id === newMessageId} isHighlight={m.isFromCouple} />
          ))}
          {totalCount > 2 && (
            <div className={`postit postit--ghost postit--ghost-${variant}`}
              onClick={goToMessages} style={{ cursor:'pointer' }}>
              <div className="postit-ghost-inner">
                <span>+{totalCount - 2}</span>
                <p>autres messages</p>
              </div>
            </div>
          )}
        </div>
      )}

      {totalCount > 2 && (
        <button className={`gb-see-all gb-see-all--${variant}`} onClick={goToMessages}>
          Voir tous les {totalCount} messages →
        </button>
      )}
    </div>
  );
};

// ── Hook ──────────────────────────────────────────────────────────
const useGuestBook = (wedding, isPreview) => {
  const [messages,     setMessages]  = useState(isPreview ? PREVIEW_MESSAGES : []);
  const [loading,      setLoading]   = useState(!isPreview);
  const [newMessageId, setNewMsgId]  = useState(null);
  const [totalCount,   setTotal]     = useState(isPreview ? 128 : 0);

  const fetchMessages = useCallback(async () => {
    if (isPreview || !wedding._id) return;
    try {
      const res  = await fetch(`${API}/guestbook?weddingId=${wedding._id}&limit=2&priority=true`);
      const data = await res.json();
      setMessages(data.messages || []);
      setTotal(data.total || 0);
    } catch {} finally { setLoading(false); }
  }, [wedding._id, isPreview]);

  useEffect(() => {
    fetchMessages();
    if (!isPreview) { const t = setInterval(fetchMessages, 20000); return () => clearInterval(t); }
  }, [fetchMessages, isPreview]);

  const handleMessageAdded = (msg) => {
    setMessages(prev => [msg, ...prev].slice(0, 2));
    setTotal(prev => prev + 1);
    setNewMsgId(msg._id);
    setTimeout(() => setNewMsgId(null), 3000);
  };

  return { messages, loading, newMessageId, totalCount, fetchMessages, handleMessageAdded };
};

// ── Layouts ───────────────────────────────────────────────────────
const GuestBookRoyal = ({ wedding, isPreview }) => {
  const gb      = useGuestBook(wedding, isPreview);
  const themeId = wedding?.settings?.theme?.id || 'royal';
  const slug    = wedding?.slug || wedding?._id || themeId;
  return (
    <section id="guestbook" className="gb gb--royal">
      <div className="gb__inner">
        <div className="royal-divider"><span className="royal-divider__line"/><span className="royal-divider__gem">✦</span><span className="royal-divider__line"/></div>
        <h2 className="gb-royal-title">{wedding.guestbook?.title || "Livre d'Or"}</h2>
        <p className="gb-royal-sub">Laissez un message pour {wedding.couple.person1.firstName} & {wedding.couple.person2.firstName}</p>
        {isPreview && <div className="gb-preview-banner gb-preview-banner--royal">👁 Aperçu</div>}
        <div className="gb-royal-card">
          <div className="gb-royal-card-header"><span>📌</span><h3>Épinglez votre message</h3></div>
          <GBForm wedding={wedding} onMessageAdded={gb.handleMessageAdded} isPreview={isPreview} variant="royal"/>
        </div>
        <Wall {...gb} isPreview={isPreview} variant="royal" weddingSlug={slug} themeId={themeId} />
      </div>
    </section>
  );
};

const GuestBookMinimal = ({ wedding, isPreview }) => {
  const gb      = useGuestBook(wedding, isPreview);
  const themeId = wedding?.settings?.theme?.id || 'minimal';
  const slug    = wedding?.slug || wedding?._id || themeId;
  return (
    <section id="guestbook" className="gb gb--minimal">
      <div className="gb__inner">
        <span className="gb-minimal-eyebrow">Livre d'Or</span>
        <h2 className="gb-minimal-title">{wedding.guestbook?.title || "Laissez un message"}</h2>
        <div className="gb-minimal-rule"/>
        {isPreview && <div className="gb-preview-banner gb-preview-banner--minimal">👁 Aperçu</div>}
        <div className="gb-minimal-card">
          <GBForm wedding={wedding} onMessageAdded={gb.handleMessageAdded} isPreview={isPreview} variant="minimal"/>
        </div>
        <Wall {...gb} isPreview={isPreview} variant="minimal" weddingSlug={slug} themeId={themeId} />
      </div>
    </section>
  );
};

const GuestBookFloral = ({ wedding, isPreview }) => {
  const gb      = useGuestBook(wedding, isPreview);
  const themeId = wedding?.settings?.theme?.id || 'floral';
  const slug    = wedding?.slug || wedding?._id || themeId;
  return (
    <section id="guestbook" className="gb gb--floral">
      <div className="floral-gb-deco floral-gb-deco--tl">🌸</div>
      <div className="floral-gb-deco floral-gb-deco--br">🌿</div>
      <div className="gb__inner">
        <div className="gb-floral-ornament">❧</div>
        <h2 className="gb-floral-title">{wedding.guestbook?.title || "Livre d'Or"}</h2>
        <p className="gb-floral-sub">Vos mots seront épinglés sur leur mur des souvenirs ✨</p>
        {isPreview && <div className="gb-preview-banner gb-preview-banner--floral">👁 Aperçu</div>}
        <div className="gb-floral-card">
          <GBForm wedding={wedding} onMessageAdded={gb.handleMessageAdded} isPreview={isPreview} variant="floral"/>
        </div>
        <Wall {...gb} isPreview={isPreview} variant="floral" weddingSlug={slug} themeId={themeId} />
      </div>
    </section>
  );
};

const GuestBookBoho = ({ wedding, isPreview }) => {
  const gb      = useGuestBook(wedding, isPreview);
  const themeId = wedding?.settings?.theme?.id || 'boho';
  const slug    = wedding?.slug || wedding?._id || themeId;
  return (
    <section id="guestbook" className="gb gb--boho">
      <div className="gb__inner">
        <p className="gb-boho-eyebrow">~ vœux ~</p>
        <h2 className="gb-boho-title">{wedding.guestbook?.title || "Livre d'Or"}</h2>
        <div className="gb-boho-branch">𝓪𝓶𝓸𝓾𝓻</div>
        {isPreview && <div className="gb-preview-banner gb-preview-banner--boho">👁 Aperçu</div>}
        <div className="gb-boho-card">
          <GBForm wedding={wedding} onMessageAdded={gb.handleMessageAdded} isPreview={isPreview} variant="boho"/>
        </div>
        <Wall {...gb} isPreview={isPreview} variant="boho" weddingSlug={slug} themeId={themeId} />
      </div>
    </section>
  );
};

const GuestBookLuxury = ({ wedding, isPreview }) => {
  const gb      = useGuestBook(wedding, isPreview);
  const themeId = wedding?.settings?.theme?.id || 'luxury';
  const slug    = wedding?.slug || wedding?._id || themeId;
  return (
    <section id="guestbook" className="gb gb--luxury">
      <div className="luxury-gb-frame"><div className="lgf-tl"/><div className="lgf-tr"/><div className="lgf-bl"/><div className="lgf-br"/></div>
      <div className="gb__inner">
        <div className="gb-luxury-rule"/>
        <h2 className="gb-luxury-title">{wedding.guestbook?.title || "Livre d'Or"}</h2>
        <p className="gb-luxury-sub">Laissez un message d'exception</p>
        <div className="gb-luxury-rule"/>
        {isPreview && <div className="gb-preview-banner gb-preview-banner--luxury">👁 Aperçu</div>}
        <div className="gb-luxury-card">
          <GBForm wedding={wedding} onMessageAdded={gb.handleMessageAdded} isPreview={isPreview} variant="luxury"/>
        </div>
        <Wall {...gb} isPreview={isPreview} variant="luxury" weddingSlug={slug} themeId={themeId} />
      </div>
    </section>
  );
};

// ── Principal ─────────────────────────────────────────────────────
const GuestBook = ({ wedding, isPreview = false }) => {
  if (!wedding.guestbook?.enabled && !isPreview) return null;
  const layout = wedding.settings.theme.heroLayout || 'centered';
  const props  = { wedding, isPreview };
  switch (layout) {
    case 'split':           return <GuestBookMinimal {...props}/>;
    case 'fullscreen':      return <GuestBookFloral  {...props}/>;
    case 'split-reverse':   return <GuestBookBoho    {...props}/>;
    case 'fullscreen-dark': return <GuestBookLuxury  {...props}/>;
    default:                return <GuestBookRoyal   {...props}/>;
  }
};

export default GuestBook;

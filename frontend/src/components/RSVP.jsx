// components/RSVP.jsx — 5 LAYOUTS PAR THÈME
import React, { useState, useEffect } from 'react';
import CodeModal from './CodeModal';
import './RSVP.css';
import API_URL from '../config/api';

const PREVIEW_GUEST = { code: 'DEMO01', ticketType: 'couple', hasRsvp: false };

// ── Hook logique RSVP (partagé) ──────────────────────────────────
const useRSVP = (wedding, isPreview) => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [guestData, setGuestData]         = useState(isPreview ? PREVIEW_GUEST : null);
  const [formData, setFormData]           = useState({
    person1Name:'', person2Name:'', email:'', phone:'',
    rsvpStatus:'confirmed', attendanceType:'full', dietaryRestrictions:'',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const API = 'API_URL/api/public/rsvp';

  useEffect(() => {
    if (isPreview) return;
    const code = localStorage.getItem('wedding_guest_code');
    if (code) verifyCode(code);
  }, []);

  const verifyCode = async (code) => {
    try {
      const res  = await fetch(`${API}/verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code, weddingId: wedding._id }) });
      const data = await res.json();
      if (res.ok) {
        setGuestData(data.guest);
        if (data.guest.hasRsvp) { populateForm(data.guest); setSubmitted(true); }
      } else { localStorage.removeItem('wedding_guest_code'); setShowCodeModal(true); }
    } catch { setShowCodeModal(true); }
  };

  const populateForm = (g) => setFormData({
    person1Name: g.person1Name||'', person2Name: g.person2Name||'',
    email: g.email||'', phone: g.phone||'',
    rsvpStatus: g.rsvpStatus, attendanceType: g.attendanceType||'full',
    dietaryRestrictions: g.dietaryRestrictions||'',
  });

  const handleCodeVerified = (guest) => {
    setGuestData(guest); setShowCodeModal(false);
    if (guest.hasRsvp) { populateForm(guest); setSubmitted(true); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPreview) { setSubmitting(true); setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1000); return; }
    if (!formData.person1Name.trim()) { setError('Veuillez entrer votre nom'); return; }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) { setError('Email valide requis'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ weddingId:wedding._id, code:guestData.code, person1Name:formData.person1Name.trim(), person2Name:guestData.ticketType==='couple'?formData.person2Name.trim():null, email:formData.email.trim(), phone:formData.phone.trim(), rsvpStatus:formData.rsvpStatus, attendanceType:formData.rsvpStatus==='confirmed'?formData.attendanceType:null, dietaryRestrictions:formData.dietaryRestrictions.trim() }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||'Erreur'); return; }
      setSubmitted(true);
    } catch { setError('Erreur de connexion.'); }
    finally { setSubmitting(false); }
  };

  const handleChangeCode = () => {
    if (isPreview) return;
    localStorage.removeItem('wedding_guest_code');
    setGuestData(null); setSubmitted(false);
    setFormData({ person1Name:'', person2Name:'', email:'', phone:'', rsvpStatus:'confirmed', attendanceType:'full', dietaryRestrictions:'' });
    setShowCodeModal(true);
  };

  return { showCodeModal, setShowCodeModal, guestData, formData, setFormData, submitting, submitted, error, handleCodeVerified, handleSubmit, handleChangeCode };
};

// ── Champs de formulaire communs ─────────────────────────────────
const FormFields = ({ formData, setFormData, guestData, submitting, variant }) => (
  <>
    <div className={`rsvp-radio-group rsvp-radio-group--${variant}`}>
      {['confirmed','declined'].map(s => (
        <label key={s} className={`rsvp-radio ${formData.rsvpStatus===s?'rsvp-radio--active':''} rsvp-radio--${variant}`}>
          <input type="radio" name="rsvpStatus" value={s} checked={formData.rsvpStatus===s} onChange={e=>setFormData({...formData,rsvpStatus:e.target.value})} disabled={submitting}/>
          <span className="rsvp-radio__icon">{s==='confirmed'?'🎉':'😔'}</span>
          <strong>{s==='confirmed'?'Oui, avec plaisir !':'Malheureusement non'}</strong>
        </label>
      ))}
    </div>
    <div className="rsvp-row">
      <div className="rsvp-field">
        <label>Nom complet *</label>
        <input type="text" placeholder="Ex: Marie Dupont" value={formData.person1Name} onChange={e=>setFormData({...formData,person1Name:e.target.value})} required disabled={submitting} className={`rsvp-input rsvp-input--${variant}`}/>
      </div>
      {guestData?.ticketType==='couple' && formData.rsvpStatus==='confirmed' && (
        <div className="rsvp-field">
          <label>Nom (Personne 2) *</label>
          <input type="text" placeholder="Ex: Jean Martin" value={formData.person2Name} onChange={e=>setFormData({...formData,person2Name:e.target.value})} required disabled={submitting} className={`rsvp-input rsvp-input--${variant}`}/>
        </div>
      )}
    </div>
    <div className="rsvp-row">
      <div className="rsvp-field">
        <label>Email *</label>
        <input type="email" placeholder="votre@email.com" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} required disabled={submitting} className={`rsvp-input rsvp-input--${variant}`}/>
      </div>
      <div className="rsvp-field">
        <label>Téléphone</label>
        <input type="tel" placeholder="+237 6XX XX XX XX" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} disabled={submitting} className={`rsvp-input rsvp-input--${variant}`}/>
      </div>
    </div>
    {formData.rsvpStatus==='confirmed' && (
      <div className="rsvp-field">
        <label>Restrictions alimentaires</label>
        <textarea placeholder="Végétarien, allergies…" rows="3" value={formData.dietaryRestrictions} onChange={e=>setFormData({...formData,dietaryRestrictions:e.target.value})} disabled={submitting} className={`rsvp-textarea rsvp-input--${variant}`}/>
      </div>
    )}
  </>
);

// ════════════════════════════════════════════════════════════════
// LAYOUT 1 — ROYAL
// ════════════════════════════════════════════════════════════════
const RSVPRoyal = ({ wedding, isPreview }) => {
  const r = useRSVP(wedding, isPreview);
  return (
    <>
      {!isPreview && r.showCodeModal && <CodeModal wedding={wedding} onCodeVerified={r.handleCodeVerified} onClose={()=>r.setShowCodeModal(false)}/>}
      <section id="rsvp" className="rsvp rsvp--royal">
        <div className="rsvp__inner">
          <div className="royal-divider"><span className="royal-divider__line"/><span className="royal-divider__gem">✦</span><span className="royal-divider__line"/></div>
          <h2 className="rsvp-royal-title">Confirmation de Présence</h2>
          <p className="rsvp-royal-sub">Avec tout notre amour, {wedding.couple.person1.firstName} & {wedding.couple.person2.firstName} 💝</p>
          {isPreview && <div className="rsvp-preview-banner">👁 Aperçu — Le formulaire RSVP sera fonctionnel sur votre vrai site</div>}
          <div className="rsvp-royal-card">
            {r.submitted ? (
              <div className="rsvp-success rsvp-success--royal">
                <span>{r.formData.rsvpStatus==='confirmed'?'🎉':'😢'}</span>
                <h3>{r.formData.rsvpStatus==='confirmed'?'Merci pour votre confirmation !':'Merci de votre réponse'}</h3>
                <p>{isPreview?'Aperçu — vos invités verront leur confirmation ici.':`${r.formData.person1Name}, nous avons hâte de vous voir !`}</p>
              </div>
            ) : r.guestData ? (
              <form onSubmit={r.handleSubmit}>
                <div className="rsvp-royal-code"><span>🎫 {r.guestData.code}</span><span>{r.guestData.ticketType==='couple'?'👥 Couple':'👤 Simple'}</span></div>
                <FormFields formData={r.formData} setFormData={r.setFormData} guestData={r.guestData} submitting={r.submitting} variant="royal"/>
                {r.error && <p className="rsvp-error">{r.error}</p>}
                <div className="rsvp-btns">
                  {!isPreview && <button type="button" className="rsvp-btn rsvp-btn--outline-royal" onClick={r.handleChangeCode}>Changer de code</button>}
                  <button type="submit" className="rsvp-btn rsvp-btn--royal" disabled={r.submitting}>{r.submitting?'Envoi…':'✓ Confirmer'}</button>
                </div>
              </form>
            ) : (
              <div className="rsvp-waiting rsvp-waiting--royal">
                <span>🎫</span>
                <p>Entrez votre code d'invitation pour continuer</p>
                <button className="rsvp-btn rsvp-btn--royal" onClick={()=>r.setShowCodeModal(true)}>Entrer mon code</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 2 — MINIMAL
// ════════════════════════════════════════════════════════════════
const RSVPMinimal = ({ wedding, isPreview }) => {
  const r = useRSVP(wedding, isPreview);
  return (
    <>
      {!isPreview && r.showCodeModal && <CodeModal wedding={wedding} onCodeVerified={r.handleCodeVerified} onClose={()=>r.setShowCodeModal(false)}/>}
      <section id="rsvp" className="rsvp rsvp--minimal">
        <div className="rsvp__inner">
          <span className="rsvp-minimal-eyebrow">Confirmation</span>
          <h2 className="rsvp-minimal-title">Serez-vous présent ?</h2>
          <div className="rsvp-minimal-rule"/>
          {isPreview && <div className="rsvp-preview-banner rsvp-preview-banner--minimal">👁 Aperçu</div>}
          <div className="rsvp-minimal-card">
            {r.submitted ? (
              <div className="rsvp-success rsvp-success--minimal">
                <span>{r.formData.rsvpStatus==='confirmed'?'🎉':'😔'}</span>
                <h3>{r.formData.rsvpStatus==='confirmed'?'Confirmé !':'Réponse reçue'}</h3>
                <p>{isPreview?'Aperçu.':r.formData.person1Name+', merci pour votre réponse.'}</p>
              </div>
            ) : r.guestData ? (
              <form onSubmit={r.handleSubmit}>
                <FormFields formData={r.formData} setFormData={r.setFormData} guestData={r.guestData} submitting={r.submitting} variant="minimal"/>
                {r.error && <p className="rsvp-error">{r.error}</p>}
                <div className="rsvp-btns">
                  {!isPreview && <button type="button" className="rsvp-btn rsvp-btn--outline-minimal" onClick={r.handleChangeCode}>Changer</button>}
                  <button type="submit" className="rsvp-btn rsvp-btn--minimal" disabled={r.submitting}>{r.submitting?'Envoi…':'RSVP →'}</button>
                </div>
              </form>
            ) : (
              <div className="rsvp-waiting rsvp-waiting--minimal">
                <span>🎫</span><p>Entrez votre code d'invitation</p>
                <button className="rsvp-btn rsvp-btn--minimal" onClick={()=>r.setShowCodeModal(true)}>Entrer le code</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 3 — FLORAL
// ════════════════════════════════════════════════════════════════
const RSVPFloral = ({ wedding, isPreview }) => {
  const r = useRSVP(wedding, isPreview);
  return (
    <>
      {!isPreview && r.showCodeModal && <CodeModal wedding={wedding} onCodeVerified={r.handleCodeVerified} onClose={()=>r.setShowCodeModal(false)}/>}
      <section id="rsvp" className="rsvp rsvp--floral">
        <div className="floral-rsvp-deco floral-rsvp-deco--tl">🌸</div>
        <div className="floral-rsvp-deco floral-rsvp-deco--br">🌿</div>
        <div className="rsvp__inner">
          <div className="floral-rsvp-ornament">❧</div>
          <h2 className="rsvp-floral-title">Confirmation de Présence</h2>
          <p className="rsvp-floral-sub">Avec tout notre amour, {wedding.couple.person1.firstName} & {wedding.couple.person2.firstName} 💝</p>
          {isPreview && <div className="rsvp-preview-banner rsvp-preview-banner--floral">👁 Aperçu</div>}
          <div className="rsvp-floral-card">
            {r.submitted ? (
              <div className="rsvp-success rsvp-success--floral">
                <span>{r.formData.rsvpStatus==='confirmed'?'🎉':'😢'}</span>
                <h3>{r.formData.rsvpStatus==='confirmed'?'Merci !':'Réponse reçue'}</h3>
                <p>{isPreview?'Aperçu.':r.formData.person1Name+', nous avons hâte de vous voir !'}</p>
              </div>
            ) : r.guestData ? (
              <form onSubmit={r.handleSubmit}>
                <FormFields formData={r.formData} setFormData={r.setFormData} guestData={r.guestData} submitting={r.submitting} variant="floral"/>
                {r.error && <p className="rsvp-error">{r.error}</p>}
                <div className="rsvp-btns">
                  {!isPreview && <button type="button" className="rsvp-btn rsvp-btn--outline-floral" onClick={r.handleChangeCode}>Changer</button>}
                  <button type="submit" className="rsvp-btn rsvp-btn--floral" disabled={r.submitting}>{r.submitting?'Envoi…':'Je confirme ma présence'}</button>
                </div>
              </form>
            ) : (
              <div className="rsvp-waiting rsvp-waiting--floral">
                <span>🎫</span><p>Entrez votre code d'invitation</p>
                <button className="rsvp-btn rsvp-btn--floral" onClick={()=>r.setShowCodeModal(true)}>Entrer le code</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 4 — BOHO
// ════════════════════════════════════════════════════════════════
const RSVPBoho = ({ wedding, isPreview }) => {
  const r = useRSVP(wedding, isPreview);
  return (
    <>
      {!isPreview && r.showCodeModal && <CodeModal wedding={wedding} onCodeVerified={r.handleCodeVerified} onClose={()=>r.setShowCodeModal(false)}/>}
      <section id="rsvp" className="rsvp rsvp--boho">
        <div className="rsvp__inner">
          <p className="rsvp-boho-eyebrow">~ répondre ~</p>
          <h2 className="rsvp-boho-title">Confirmation de Présence</h2>
          <div className="rsvp-boho-branch">𝓪𝓶𝓸𝓾𝓻</div>
          {isPreview && <div className="rsvp-preview-banner rsvp-preview-banner--boho">👁 Aperçu</div>}
          <div className="rsvp-boho-card">
            {r.submitted ? (
              <div className="rsvp-success rsvp-success--boho">
                <span>{r.formData.rsvpStatus==='confirmed'?'🎉':'😔'}</span>
                <h3>{r.formData.rsvpStatus==='confirmed'?'Merci !':'Réponse reçue'}</h3>
                <p>{isPreview?'Aperçu.':r.formData.person1Name+', merci pour votre réponse.'}</p>
              </div>
            ) : r.guestData ? (
              <form onSubmit={r.handleSubmit}>
                <FormFields formData={r.formData} setFormData={r.setFormData} guestData={r.guestData} submitting={r.submitting} variant="boho"/>
                {r.error && <p className="rsvp-error">{r.error}</p>}
                <div className="rsvp-btns">
                  {!isPreview && <button type="button" className="rsvp-btn rsvp-btn--outline-boho" onClick={r.handleChangeCode}>Changer</button>}
                  <button type="submit" className="rsvp-btn rsvp-btn--boho" disabled={r.submitting}>{r.submitting?'Envoi…':'Confirmer ma venue ↓'}</button>
                </div>
              </form>
            ) : (
              <div className="rsvp-waiting rsvp-waiting--boho">
                <span>🎫</span><p>Entrez votre code d'invitation</p>
                <button className="rsvp-btn rsvp-btn--boho" onClick={()=>r.setShowCodeModal(true)}>Entrer le code</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 5 — LUXURY
// ════════════════════════════════════════════════════════════════
const RSVPLuxury = ({ wedding, isPreview }) => {
  const r = useRSVP(wedding, isPreview);
  return (
    <>
      {!isPreview && r.showCodeModal && <CodeModal wedding={wedding} onCodeVerified={r.handleCodeVerified} onClose={()=>r.setShowCodeModal(false)}/>}
      <section id="rsvp" className="rsvp rsvp--luxury">
        <div className="luxury-rsvp-frame"><div className="lrf-tl"/><div className="lrf-tr"/><div className="lrf-bl"/><div className="lrf-br"/></div>
        <div className="rsvp__inner">
          <div className="rsvp-luxury-rule"/>
          <h2 className="rsvp-luxury-title">Confirmation de Présence</h2>
          <p className="rsvp-luxury-sub">L'honneur de votre réponse est demandé</p>
          <div className="rsvp-luxury-rule"/>
          {isPreview && <div className="rsvp-preview-banner rsvp-preview-banner--luxury">👁 Aperçu</div>}
          <div className="rsvp-luxury-card">
            {r.submitted ? (
              <div className="rsvp-success rsvp-success--luxury">
                <span>{r.formData.rsvpStatus==='confirmed'?'🎉':'😢'}</span>
                <h3>{r.formData.rsvpStatus==='confirmed'?'Confirmation reçue':'Réponse enregistrée'}</h3>
                <p>{isPreview?'Aperçu.':r.formData.person1Name+', votre réponse a été enregistrée.'}</p>
              </div>
            ) : r.guestData ? (
              <form onSubmit={r.handleSubmit}>
                <FormFields formData={r.formData} setFormData={r.setFormData} guestData={r.guestData} submitting={r.submitting} variant="luxury"/>
                {r.error && <p className="rsvp-error rsvp-error--luxury">{r.error}</p>}
                <div className="rsvp-btns">
                  {!isPreview && <button type="button" className="rsvp-btn rsvp-btn--outline-luxury" onClick={r.handleChangeCode}>Changer</button>}
                  <button type="submit" className="rsvp-btn rsvp-btn--luxury" disabled={r.submitting}>{r.submitting?'Envoi…':'Confirmer ma présence'}</button>
                </div>
              </form>
            ) : (
              <div className="rsvp-waiting rsvp-waiting--luxury">
                <span>🎫</span><p>Entrez votre code d'invitation</p>
                <button className="rsvp-btn rsvp-btn--luxury" onClick={()=>r.setShowCodeModal(true)}>Entrer le code</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
const RSVP = ({ wedding, isPreview = false }) => {
  const layout = wedding.settings.theme.heroLayout || 'centered';
  const props  = { wedding, isPreview };
  switch (layout) {
    case 'split':           return <RSVPMinimal {...props}/>;
    case 'fullscreen':      return <RSVPFloral  {...props}/>;
    case 'split-reverse':   return <RSVPBoho    {...props}/>;
    case 'fullscreen-dark': return <RSVPLuxury  {...props}/>;
    default:                return <RSVPRoyal   {...props}/>;
  }
};

export default RSVP;

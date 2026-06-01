// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PLANS = {
  pro: {
    name: 'Pro',
    price: 29000,
    oldPrice: 49000,
    currency: 'FCFA',
    features: ['Couleurs personnalisées', 'Sans branding WeddApp', 'Sections supplémentaires', 'Animations premium', 'Support WhatsApp'],
    badge: '🔥 Offre de lancement',
  },
  standard: {
    name: 'Standard',
    price: 29000,
    oldPrice: 49000,
    currency: 'FCFA',
    features: ['Couleurs personnalisées', 'Sans branding WeddApp', 'Sections supplémentaires', 'Animations premium'],
    badge: '🔥 Populaire',
  },
  premium: {
    name: 'Premium',
    price: 79000,
    oldPrice: 120000,
    currency: 'FCFA',
    features: ['Domaine personnalisé', 'Design 100% custom', 'Support prioritaire', 'Export PDF invitations'],
    badge: '👑 Premium',
  },
};

const THEMES = [
  { id:'royal',   label:'👑 Royal',          desc:'Bleu nuit & or, élégant' },
  { id:'minimal', label:'🤍 Minimal',         desc:'Blanc pur, épuré' },
  { id:'floral',  label:'🌸 Floral',          desc:'Rose & vert, romantique' },
  { id:'boho',    label:'🌿 Bohème',          desc:'Beige & naturel' },
  { id:'luxury',  label:'✨ Luxury',          desc:'Noir & or, prestige' },
];

const WHATSAPP_NUMBER = '15815744688';
const MTN_NUMBER      = '640894553';
const ORANGE_NUMBER   = '677506216';

const inp = {
  width:'100%', padding:'12px 16px',
  background:'rgba(255,255,255,0.05)',
  border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:'12px', color:'white',
  fontSize:'14px', outline:'none',
  boxSizing:'border-box',
};

const Checkout = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const planId         = searchParams.get('plan') || 'pro';
  const plan           = PLANS[planId] || PLANS.pro;

  const [step,   setStep]   = useState(1);
  const [method, setMethod] = useState('');
  const [copied, setCopied] = useState('');

  // Infos client
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Formulaire commande (étape 4)
  const [partner1, setPartner1]   = useState('');
  const [partner2, setPartner2]   = useState('');
  const [wDate,    setWDate]      = useState('');
  const [lieu,     setLieu]       = useState('');
  const [theme,    setTheme]      = useState('');
  const [couleurs, setCouleurs]   = useState('');
  const [photos,   setPhotos]     = useState('');
  const [souhaits, setSouhaits]   = useState('');
  const [sending,  setSending]    = useState(false);
  const [orderSent,setOrderSent]  = useState(false);

  const payNumber   = method === 'mtn' ? MTN_NUMBER : ORANGE_NUMBER;

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const whatsappPayMsg = encodeURIComponent(
    `Bonjour WeddApp 👋\n\nJe viens de payer le plan ${plan.name} (${plan.price.toLocaleString()} FCFA) via ${method === 'mtn' ? 'MTN MoMo' : 'Orange Money'}.\n\nMon nom : ${name}\nMon email : ${email}\nMon numéro : ${phone}\n\nVoici ma capture de confirmation 👇`
  );
  const whatsappPayUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappPayMsg}`;

  const handleContinue = () => {
    if (!name || !email || !phone) { alert('Veuillez remplir tous les champs'); return; }
    setStep(2);
  };

  // Envoyer la commande par WhatsApp
  const handleSendOrder = () => {
    if (!partner1 || !partner2 || !wDate || !lieu || !theme) {
      alert('Veuillez remplir les champs obligatoires (*)');
      return;
    }
    setSending(true);

    const orderMsg = encodeURIComponent(
      `💍 NOUVELLE COMMANDE WEDDAPP\n\n` +
      `👤 Client : ${name}\n` +
      `📧 Email : ${email}\n` +
      `📱 Téléphone : ${phone}\n` +
      `💳 Plan : ${plan.name} — ${plan.price.toLocaleString()} FCFA\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💑 INFOS DU MARIAGE\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👰 Marié(e) 1 : ${partner1}\n` +
      `🤵 Marié(e) 2 : ${partner2}\n` +
      `📅 Date : ${wDate}\n` +
      `📍 Lieu : ${lieu}\n` +
      `🎨 Thème souhaité : ${theme}\n` +
      `🎨 Couleurs : ${couleurs || 'Non spécifié'}\n` +
      `📸 Photos : ${photos || 'Non spécifié'}\n` +
      `💬 Souhaits particuliers :\n${souhaits || 'Aucun'}`
    );

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${orderMsg}`;
    window.open(url, '_blank');

    setTimeout(() => {
      setSending(false);
      setOrderSent(true);
    }, 1000);
  };

  const s = {
    page:   { minHeight:'100vh', background:'#0a0908', fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif", color:'white' },
    inner:  { maxWidth:'520px', margin:'0 auto', padding:'40px 24px' },
    label:  { display:'block', fontSize:'12px', fontWeight:'600', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' },
    field:  { marginBottom:'16px' },
    btnGold:{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#c9a84c,#e8c96a)', color:'#0a0908', border:'none', borderRadius:'14px', fontSize:'15px', fontWeight:'800', cursor:'pointer' },
  };

  return (
    <div style={s.page}>

      {/* Header */}
      <header style={{ borderBottom:'1px solid rgba(201,168,76,0.15)', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.02)' }}>
        <a href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'20px' }}>💍</span>
          <span style={{ fontWeight:'800', fontSize:'16px', color:'white', letterSpacing:'-0.03em' }}>
            Wedd<span style={{ color:'#c9a84c' }}>App</span>
          </span>
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {[1,2,3,4].map(s => (
            <React.Fragment key={s}>
              <div style={{
                width:'28px', height:'28px', borderRadius:'50%',
                background: step >= s ? '#c9a84c' : 'rgba(255,255,255,0.1)',
                color:      step >= s ? '#0a0908' : 'rgba(255,255,255,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'12px', fontWeight:'700', transition:'all 0.3s',
              }}>
                {step > s ? '✓' : s}
              </div>
              {s < 4 && <div style={{ width:'20px', height:'1px', background: step > s ? '#c9a84c' : 'rgba(255,255,255,0.1)' }} />}
            </React.Fragment>
          ))}
        </div>
      </header>

      <div style={s.inner}>

        {/* ── STEP 1 : Infos + méthode ── */}
        {step === 1 && (
          <div>
            {/* Récap plan */}
            <div style={{ background:'linear-gradient(135deg,#1e1810,#14100a)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:'20px', padding:'24px', marginBottom:'32px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                <div>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:'#c9a84c', letterSpacing:'0.1em', textTransform:'uppercase' }}>Plan sélectionné</span>
                  <h2 style={{ fontSize:'24px', fontWeight:'800', margin:'4px 0 0' }}>{plan.name}</h2>
                </div>
                <span style={{ background:'rgba(201,168,76,0.15)', color:'#c9a84c', fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px' }}>{plan.badge}</span>
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'16px' }}>
                <span style={{ fontSize:'36px', fontWeight:'800', color:'#c9a84c' }}>{plan.price.toLocaleString()}</span>
                <span style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)' }}>FCFA</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.3)', textDecoration:'line-through' }}>{plan.oldPrice.toLocaleString()} FCFA</span>
              </div>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display:'flex', gap:'8px', alignItems:'center', fontSize:'13px', color:'rgba(255,255,255,0.75)', marginBottom:'4px' }}>
                  <span style={{ color:'#c9a84c' }}>✓</span> {f}
                </div>
              ))}
            </div>

            <h3 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'20px' }}>Vos informations</h3>

            {[
              { label:'Votre nom complet', value:name, setter:setName, placeholder:'Ex: Josia Ambe', type:'text' },
              { label:'Votre email', value:email, setter:setEmail, placeholder:'votre@email.com', type:'email' },
              { label:'Votre numéro WhatsApp', value:phone, setter:setPhone, placeholder:'+237 6XX XX XX XX', type:'tel' },
            ].map(({ label, value, setter, placeholder, type }) => (
              <div key={label} style={s.field}>
                <label style={s.label}>{label}</label>
                <input type={type} value={value} placeholder={placeholder}
                  onChange={e => setter(e.target.value)}
                  style={inp}
                  onFocus={e => e.target.style.borderColor='rgba(201,168,76,0.6)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>
            ))}

            <h3 style={{ fontSize:'18px', fontWeight:'700', margin:'28px 0 16px' }}>Méthode de paiement</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'28px' }}>
              {[
                { id:'mtn',    label:'MTN MoMo',     color:'#FFCC00', bg:'#1a1600', emoji:'📱', num:MTN_NUMBER },
                { id:'orange', label:'Orange Money',  color:'#FF6600', bg:'#1a0a00', emoji:'🍊', num:ORANGE_NUMBER },
              ].map(m => (
                <div key={m.id} onClick={() => setMethod(m.id)} style={{
                  padding:'20px 16px', borderRadius:'16px', cursor:'pointer', textAlign:'center',
                  background: method === m.id ? m.bg : 'rgba(255,255,255,0.03)',
                  border:`2px solid ${method === m.id ? m.color : 'rgba(255,255,255,0.08)'}`,
                  transition:'all 0.2s',
                }}>
                  <div style={{ fontSize:'28px', marginBottom:'8px' }}>{m.emoji}</div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color: method === m.id ? m.color : 'rgba(255,255,255,0.7)' }}>{m.label}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'4px' }}>{m.num}</div>
                </div>
              ))}
            </div>

            <button onClick={handleContinue} disabled={!method} style={{ ...s.btnGold, background: method ? 'linear-gradient(135deg,#c9a84c,#e8c96a)' : 'rgba(255,255,255,0.1)', color: method ? '#0a0908' : 'rgba(255,255,255,0.3)', cursor: method ? 'pointer' : 'not-allowed' }}>
              Voir les instructions de paiement →
            </button>
          </div>
        )}

        {/* ── STEP 2 : Instructions paiement ── */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'14px', marginBottom:'24px', padding:'0' }}>
              ← Retour
            </button>
            <h2 style={{ fontSize:'24px', fontWeight:'800', marginBottom:'8px' }}>Instructions de paiement</h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'14px', marginBottom:'32px' }}>Suivez ces étapes pour finaliser votre commande</p>

            {[
              { num:'1', icon: method==='mtn'?'📱':'🍊', title:`Ouvrez ${method==='mtn'?'MTN MoMo':'Orange Money'}`, desc:`Ouvrez l'application ou composez le menu USSD.` },
              { num:'2', icon:'💸', title:'Envoyez le paiement', desc:`Envoyez exactement ${plan.price.toLocaleString()} FCFA au numéro ci-dessous.`,
                action:(
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'14px 16px', marginTop:'12px' }}>
                    <div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'4px' }}>Numéro</div>
                      <div style={{ fontSize:'22px', fontWeight:'800', letterSpacing:'2px', color: method==='mtn'?'#FFCC00':'#FF6600' }}>{payNumber}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>WeddApp — {method==='mtn'?'MTN MoMo':'Orange Money'}</div>
                    </div>
                    <button onClick={() => copy(payNumber,'num')} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'8px', padding:'8px 14px', color:'white', cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
                      {copied==='num'?'✓ Copié':'Copier'}
                    </button>
                  </div>
                )
              },
              { num:'3', icon:'💰', title:'Montant exact', desc:'Envoyez ce montant exact.',
                action:(
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'12px', padding:'14px 16px', marginTop:'12px' }}>
                    <div>
                      <div style={{ fontSize:'11px', color:'rgba(201,168,76,0.7)', marginBottom:'4px' }}>Montant</div>
                      <div style={{ fontSize:'28px', fontWeight:'800', color:'#c9a84c' }}>{plan.price.toLocaleString()} FCFA</div>
                    </div>
                    <button onClick={() => copy(String(plan.price),'amount')} style={{ background:'rgba(201,168,76,0.15)', border:'none', borderRadius:'8px', padding:'8px 14px', color:'#c9a84c', cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
                      {copied==='amount'?'✓ Copié':'Copier'}
                    </button>
                  </div>
                )
              },
              { num:'4', icon:'📸', title:"Prenez une capture d'écran", desc:'Faites une capture après le paiement.' },
              { num:'5', icon:'💬', title:'Envoyez sur WhatsApp', desc:`Envoyez la capture + votre email (${email}) sur WhatsApp.` },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', gap:'16px', marginBottom:'20px' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'800', color:'#c9a84c', flexShrink:0, marginTop:'2px' }}>
                  {item.num}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                    <span style={{ fontSize:'16px' }}>{item.icon}</span>
                    <span style={{ fontSize:'14px', fontWeight:'700' }}>{item.title}</span>
                  </div>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:'1.6', margin:0 }}>{item.desc}</p>
                  {item.action}
                </div>
              </div>
            ))}

            <a href={whatsappPayUrl} target="_blank" rel="noreferrer"
              onClick={() => setTimeout(() => setStep(3), 1000)}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', width:'100%', padding:'18px', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'white', border:'none', borderRadius:'14px', fontSize:'16px', fontWeight:'800', textDecoration:'none', marginTop:'8px', boxShadow:'0 8px 24px rgba(37,211,102,0.3)' }}>
              <span style={{ fontSize:'22px' }}>📲</span>
              Envoyer ma capture sur WhatsApp
            </a>
            <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'12px' }}>
              Activation sous 2h après réception ⚡
            </p>
          </div>
        )}

        {/* ── STEP 3 : Confirmation paiement ── */}
        {step === 3 && (
          <div style={{ textAlign:'center', paddingTop:'20px' }}>
            <div style={{ fontSize:'56px', marginBottom:'16px' }}>✅</div>
            <h2 style={{ fontSize:'24px', fontWeight:'800', marginBottom:'8px' }}>Paiement envoyé !</h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'14px', marginBottom:'32px' }}>
              En attendant la validation, remplissez maintenant les informations de votre mariage pour qu'on commence à créer votre site.
            </p>
            <button onClick={() => setStep(4)} style={s.btnGold}>
              📋 Remplir le formulaire de commande →
            </button>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'12px' }}>
              Ça prend 2 minutes ⏱️
            </p>
          </div>
        )}

        {/* ── STEP 4 : Formulaire commande ── */}
        {step === 4 && (
          <div>
            {!orderSent ? (
              <>
                <div style={{ marginBottom:'28px' }}>
                  <h2 style={{ fontSize:'22px', fontWeight:'800', marginBottom:'8px' }}>📋 Votre commande</h2>
                  <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>
                    Ces informations nous permettront de créer votre site. Nous vous le livrons sous <strong style={{ color:'#c9a84c' }}>48h</strong>.
                  </p>
                </div>

                {/* Noms */}
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
                  <h4 style={{ color:'#c9a84c', fontSize:'13px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'16px' }}>💑 Le couple</h4>
                  <div style={s.field}>
                    <label style={s.label}>Prénom & Nom marié(e) 1 *</label>
                    <input style={inp} value={partner1} onChange={e=>setPartner1(e.target.value)} placeholder="Ex: Josia Arole"
                      onFocus={e=>e.target.style.borderColor='rgba(201,168,76,0.6)'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Prénom & Nom marié(e) 2 *</label>
                    <input style={inp} value={partner2} onChange={e=>setPartner2(e.target.value)} placeholder="Ex: Ulrich Lele"
                      onFocus={e=>e.target.style.borderColor='rgba(201,168,76,0.6)'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                  </div>
                </div>

                {/* Date & Lieu */}
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
                  <h4 style={{ color:'#c9a84c', fontSize:'13px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'16px' }}>📅 Date & Lieu</h4>
                  <div style={s.field}>
                    <label style={s.label}>Date du mariage *</label>
                    <input style={inp} type="date" value={wDate} onChange={e=>setWDate(e.target.value)}
                      onFocus={e=>e.target.style.borderColor='rgba(201,168,76,0.6)'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Lieu / Ville *</label>
                    <input style={inp} value={lieu} onChange={e=>setLieu(e.target.value)} placeholder="Ex: Douala, Cameroun"
                      onFocus={e=>e.target.style.borderColor='rgba(201,168,76,0.6)'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                  </div>
                </div>

                {/* Thème */}
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
                  <h4 style={{ color:'#c9a84c', fontSize:'13px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'16px' }}>🎨 Design</h4>
                  <div style={s.field}>
                    <label style={s.label}>Thème préféré *</label>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      {THEMES.map(t => (
                        <div key={t.id} onClick={() => setTheme(t.label)}
                          style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'10px', cursor:'pointer', border:`2px solid ${theme===t.label?'#c9a84c':'rgba(255,255,255,0.08)'}`, background: theme===t.label?'rgba(201,168,76,0.08)':'transparent', transition:'all 0.15s' }}>
                          <span style={{ fontSize:'20px' }}>{t.label.split(' ')[0]}</span>
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:'700', color:'white' }}>{t.label}</div>
                            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{t.desc}</div>
                          </div>
                          {theme === t.label && <span style={{ marginLeft:'auto', color:'#c9a84c', fontWeight:'800' }}>✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Couleurs souhaitées (optionnel)</label>
                    <input style={inp} value={couleurs} onChange={e=>setCouleurs(e.target.value)} placeholder="Ex: Bordeaux & or, bleu marine..."
                      onFocus={e=>e.target.style.borderColor='rgba(201,168,76,0.6)'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                  </div>
                </div>

                {/* Photos & Souhaits */}
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:'16px', padding:'20px', marginBottom:'24px' }}>
                  <h4 style={{ color:'#c9a84c', fontSize:'13px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'16px' }}>📸 Photos & Détails</h4>
                  <div style={s.field}>
                    <label style={s.label}>Lien vers vos photos (Google Drive, iCloud...)</label>
                    <input style={inp} value={photos} onChange={e=>setPhotos(e.target.value)} placeholder="https://drive.google.com/..."
                      onFocus={e=>e.target.style.borderColor='rgba(201,168,76,0.6)'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                    <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'6px' }}>
                      Vous pouvez aussi nous les envoyer directement par WhatsApp après.
                    </p>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Souhaits particuliers</label>
                    <textarea value={souhaits} onChange={e=>setSouhaits(e.target.value)}
                      placeholder="Ex: Je veux une section histoire d'amour, un programme avec 3 cérémonies, dress code blanc..."
                      rows={4}
                      style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}
                      onFocus={e=>e.target.style.borderColor='rgba(201,168,76,0.6)'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>

                <button onClick={handleSendOrder} disabled={sending}
                  style={{ ...s.btnGold, opacity: sending ? 0.7 : 1, cursor: sending ? 'not-allowed' : 'pointer' }}>
                  {sending ? '⏳ Envoi...' : '📲 Envoyer ma commande sur WhatsApp'}
                </button>
                <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'12px' }}>
                  Votre site sera livré sous 48h ⚡
                </p>
              </>
            ) : (
              /* Commande envoyée */
              <div style={{ textAlign:'center', paddingTop:'40px' }}>
                <div style={{ fontSize:'64px', marginBottom:'24px' }}>🎉</div>
                <h2 style={{ fontSize:'28px', fontWeight:'800', marginBottom:'12px' }}>
                  Commande reçue, {name.split(' ')[0]} !
                </h2>
                <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'15px', lineHeight:'1.7', marginBottom:'32px' }}>
                  Nous créons votre site sous <strong style={{ color:'#c9a84c' }}>48h</strong>.<br/>
                  Vous recevrez le lien par WhatsApp dès qu'il sera prêt.
                </p>

                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'20px', marginBottom:'24px', textAlign:'left' }}>
                  <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px' }}>Récapitulatif</p>
                  {[
                    { label:'Couple',  value:`${partner1} & ${partner2}` },
                    { label:'Date',    value:wDate },
                    { label:'Lieu',    value:lieu },
                    { label:'Thème',   value:theme },
                    { label:'Plan',    value:`${plan.name} — ${plan.price.toLocaleString()} FCFA` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'8px' }}>
                      <span style={{ color:'rgba(255,255,255,0.4)' }}>{label}</span>
                      <span style={{ fontWeight:'600' }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'24px', textAlign:'left' }}>
                  <p style={{ fontSize:'13px', color:'#c9a84c', fontWeight:'700', marginBottom:'8px' }}>📋 Prochaines étapes</p>
                  {[
                    'Nous validons votre paiement',
                    'Nous créons votre site (48h)',
                    'Vous recevez le lien par WhatsApp',
                    'Vous partagez le lien à vos invités 🎉',
                  ].map((step, i) => (
                    <div key={i} style={{ display:'flex', gap:'10px', alignItems:'center', fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'6px' }}>
                      <span style={{ color:'#c9a84c', fontWeight:'800', minWidth:'16px' }}>{i+1}.</span>
                      {step}
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate('/')}
                  style={{ width:'100%', padding:'14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'rgba(255,255,255,0.6)', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}>
                  Retour à l'accueil
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>
    </div>
  );
};

export default Checkout;

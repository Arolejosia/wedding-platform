// src/pages/SecretAdmin.jsx
// URL secrète : /weddapp-admin-secret
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';

const ADMIN_PASSWORD = 'weddapp2026secret';

const CATEGORIES = {
  photographe:     '📸 Photographe',
  traiteur:        '🍽️ Traiteur',
  dj:              '🎵 DJ / Musique',
  fleuriste:       '💐 Fleuriste',
  salle:           '🏛️ Salle',
  decorateur:      '✨ Décorateur',
  robe:            '👗 Robe / Costume',
  transport:       '🚗 Transport',
  wedding_planner: '📋 Wedding Planner',
  autre:           '💼 Autre',
};

const STATUS_COLORS = {
  pending:  { bg:'rgba(245,158,11,0.1)',  color:'#f59e0b', label:'⏳ En attente' },
  approved: { bg:'rgba(34,197,94,0.1)',   color:'#22c55e', label:'✅ Approuvé'   },
  rejected: { bg:'rgba(239,68,68,0.1)',   color:'#ef5350', label:'❌ Refusé'     },
};

const s = {
  page:    { minHeight:'100vh', background:'#0a0908', fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif" },
  header:  { background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(201,168,76,0.15)', padding:'18px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  card:    { background:'#161310', border:'1px solid rgba(201,168,76,0.2)', borderRadius:'16px', padding:'24px' },
  label:   { display:'block', fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' },
  input:   { width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white', fontSize:'14px', outline:'none', boxSizing:'border-box' },
  btnGold: { width:'100%', padding:'13px', background:'linear-gradient(135deg,#c9a84c,#e8c96a)', color:'#0a0908', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'800', cursor:'pointer', marginBottom:'10px' },
  btnGray: { width:'100%', padding:'13px', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
  success: { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'10px', padding:'12px 16px', color:'#6ee7b7', fontSize:'13px', marginBottom:'16px' },
  error:   { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'12px 16px', color:'#fca5a5', fontSize:'13px', marginBottom:'16px' },
};

// ══════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════
const LoginScreen = ({ onLogin }) => {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const handle = () => {
    if (pwd === ADMIN_PASSWORD) { onLogin(); }
    else { setErr('Mot de passe incorrect'); setPwd(''); }
  };
  return (
    <div style={{ ...s.page, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ ...s.card, maxWidth:'400px', width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔐</div>
        <h1 style={{ fontSize:'22px', fontWeight:'800', color:'white', marginBottom:'4px' }}>WeddApp Admin</h1>
        <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', marginBottom:'32px' }}>Accès restreint</p>
        {err && <div style={s.error}>{err}</div>}
        <div style={{ marginBottom:'16px' }}>
          <label style={s.label}>Mot de passe</label>
          <input style={s.input} type="password" value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="••••••••" autoFocus
          />
        </div>
        <button style={s.btnGold} onClick={handle}>Accéder →</button>
        <Link to="/" style={{ display:'block', marginTop:'12px', color:'rgba(255,255,255,0.3)', fontSize:'12px', textDecoration:'none' }}>
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ONGLET 1 — COMPTES PRO
// ══════════════════════════════════════════════════════════
const ComptesPro = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);

  const call = async (action) => {
    if (!email.trim()) { setMessage({ type:'error', text:'Entre un email' }); return; }
    if (action === 'deactivate' && !window.confirm(`Rétrograder ${email} en Free ?`)) return;
    setLoading(true); setMessage(null);
    try {
      const route = action === 'activate'
        ? `${API_URL}/weddings/activate-pro/${encodeURIComponent(email.trim())}`
        : `${API_URL}/weddings/deactivate-pro/${encodeURIComponent(email.trim())}`;
      const res  = await fetch(route, { method:'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      const label = action === 'activate' ? 'Pro activé' : 'Rétrogradé Free';
      setMessage({ type:'success', text:`✅ ${label} pour ${email}` });
      setHistory(prev => [{ email: email.trim(), action: label, date: new Date().toLocaleString('fr-FR') }, ...prev]);
      if (action === 'activate') setEmail('');
    } catch (err) {
      setMessage({ type:'error', text:`❌ ${err.message}` });
    } finally { setLoading(false); }
  };

  const lastActivation = history.find(h => h.action === 'Pro activé');
  const whatsappMsg = lastActivation
    ? `Bonjour ! 🎉\n\nVotre accès WeddApp Pro est activé !\n\n🔗 https://weddapp.com/login\n📧 ${lastActivation.email}\n🔑 Mot de passe : WeddApp2026!\n\nConnectez-vous et changez votre mot de passe dans les paramètres.\n\nDes questions ? Répondez ici 💬`
    : '';

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>

      {/* Activation */}
      <div style={s.card}>
        <h3 style={{ color:'white', fontSize:'15px', fontWeight:'700', marginBottom:'20px' }}>⚡ Gestion des plans</h3>
        {message && <div style={message.type === 'success' ? s.success : s.error}>{message.text}</div>}
        <div style={{ marginBottom:'16px' }}>
          <label style={s.label}>Email du client</label>
          <input style={s.input} type="email" value={email}
            onChange={e => { setEmail(e.target.value); setMessage(null); }}
            onKeyDown={e => e.key === 'Enter' && call('activate')}
            placeholder="client@email.com"
          />
        </div>
        <button style={{ ...s.btnGold, opacity: loading ? 0.6 : 1 }}
          onClick={() => call('activate')} disabled={loading}>
          {loading ? '⏳...' : '⚡ Activer Plan Pro'}
        </button>
        <button style={{ ...s.btnGray, opacity: loading ? 0.6 : 1 }}
          onClick={() => call('deactivate')} disabled={loading}>
          Rétrograder en Free
        </button>
      </div>

      {/* Message WhatsApp + historique */}
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {lastActivation && (
          <div style={{ ...s.card, background:'rgba(37,211,102,0.06)', border:'1px solid rgba(37,211,102,0.2)' }}>
            <p style={{ fontSize:'11px', fontWeight:'700', color:'rgba(37,211,102,0.8)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px' }}>
              📲 Message WhatsApp
            </p>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', lineHeight:'1.7', margin:'0 0 12px', whiteSpace:'pre-line' }}>
              {whatsappMsg}
            </p>
            <button
              onClick={() => { navigator.clipboard.writeText(whatsappMsg); setMessage({ type:'success', text:'✅ Copié !' }); }}
              style={{ background:'rgba(37,211,102,0.15)', border:'1px solid rgba(37,211,102,0.3)', color:'#6ee7b7', borderRadius:'8px', padding:'8px 16px', cursor:'pointer', fontSize:'12px', fontWeight:'700' }}
            >
              📋 Copier
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div style={s.card}>
            <p style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px' }}>
              Historique de session
            </p>
            {history.map((h, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:'12px' }}>
                <span style={{ color:'white' }}>{h.email}</span>
                <div style={{ textAlign:'right' }}>
                  <span style={{ color: h.action === 'Pro activé' ? '#c9a84c' : 'rgba(255,255,255,0.4)', fontWeight:'600' }}>{h.action}</span>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>{h.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ONGLET 2 — PRESTATAIRES
// ══════════════════════════════════════════════════════════
const Prestataires = () => {
  const [vendors,       setVendors]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filterStatus,  setFilterStatus]  = useState('pending');
  const [selected,      setSelected]      = useState(null);
  const [rejectReason,  setRejectReason]  = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [stats,         setStats]         = useState({ pending:0, approved:0, rejected:0, total:0 });

  const token = localStorage.getItem('token');

  useEffect(() => { fetchVendors(); }, [filterStatus]); // eslint-disable-line

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filterStatus, limit: 50 });
      const res  = await fetch(`${API_URL}/vendors/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVendors(data.vendors || []);
      const [p, a, r] = await Promise.all([
        fetch(`${API_URL}/vendors/admin/all?status=pending&limit=1`,  { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
        fetch(`${API_URL}/vendors/admin/all?status=approved&limit=1`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
        fetch(`${API_URL}/vendors/admin/all?status=rejected&limit=1`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
      ]);
      setStats({ pending:p.total||0, approved:a.total||0, rejected:r.total||0, total:(p.total||0)+(a.total||0)+(r.total||0) });
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await fetch(`${API_URL}/vendors/admin/${id}/approve`, { method:'PUT', headers:{ Authorization:`Bearer ${token}` } });
      fetchVendors(); setSelected(null);
    } catch { alert('Erreur'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) { alert('Entrez une raison'); return; }
    setActionLoading(true);
    try {
      await fetch(`${API_URL}/vendors/admin/${id}/reject`, {
        method:'PUT',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason }),
      });
      fetchVendors(); setSelected(null); setRejectReason('');
    } catch { alert('Erreur'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement ?')) return;
    try {
      await fetch(`${API_URL}/vendors/admin/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
      fetchVendors(); setSelected(null);
    } catch { alert('Erreur'); }
  };

  const handleFeatured = async (id) => {
    try {
      await fetch(`${API_URL}/vendors/admin/${id}/featured`, { method:'PUT', headers:{ Authorization:`Bearer ${token}` } });
      fetchVendors();
    } catch { alert('Erreur'); }
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap' }}>
        {[
          { label:'Total',      value:stats.total,    color:'#c9a84c' },
          { label:'En attente', value:stats.pending,  color:'#f59e0b' },
          { label:'Approuvés',  value:stats.approved, color:'#22c55e' },
          { label:'Refusés',    value:stats.rejected, color:'#ef5350' },
        ].map(st => (
          <div key={st.label} style={{ ...s.card, flex:1, minWidth:'100px', textAlign:'center' }}>
            <div style={{ fontSize:'28px', fontWeight:'900', color:st.color }}>{st.value}</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'4px' }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {['pending','approved','rejected'].map(st => (
          <button key={st} onClick={() => { setFilterStatus(st); setSelected(null); }}
            style={{ padding:'8px 18px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'13px',
              background: filterStatus === st ? '#c9a84c' : 'rgba(255,255,255,0.06)',
              color:      filterStatus === st ? '#0a0908' : 'rgba(255,255,255,0.6)',
            }}>
            {STATUS_COLORS[st].label}
            <span style={{ marginLeft:'6px', background:'rgba(0,0,0,0.15)', borderRadius:'10px', padding:'1px 6px', fontSize:'11px' }}>
              {st==='pending'?stats.pending:st==='approved'?stats.approved:stats.rejected}
            </span>
          </button>
        ))}
        <button onClick={fetchVendors} style={{ marginLeft:'auto', padding:'8px 14px', background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'10px', cursor:'pointer', color:'rgba(255,255,255,0.5)' }}>🔄</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap:'16px' }}>

        {/* Liste */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.4)' }}>⏳ Chargement...</div>
          ) : vendors.length === 0 ? (
            <div style={{ ...s.card, textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize:'36px', marginBottom:'8px' }}>✅</div>
              Aucun prestataire {filterStatus === 'pending' ? 'en attente' : filterStatus === 'approved' ? 'approuvé' : 'refusé'}
            </div>
          ) : vendors.map(vendor => {
            const st = STATUS_COLORS[vendor.status];
            const isSel = selected?._id === vendor._id;
            return (
              <div key={vendor._id} onClick={() => setSelected(isSel ? null : vendor)}
                style={{ ...s.card, cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px',
                  border:`1px solid ${isSel ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.15)'}`,
                  transition:'all 0.15s',
                }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>
                  {CATEGORIES[vendor.category]?.split(' ')[0] || '💼'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'2px' }}>
                    <span style={{ fontWeight:'700', fontSize:'14px', color:'white' }}>{vendor.businessName}</span>
                    {vendor.featured && <span style={{ fontSize:'10px', background:'rgba(201,168,76,0.15)', color:'#c9a84c', padding:'1px 6px', borderRadius:'6px', fontWeight:'700' }}>⭐</span>}
                  </div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{CATEGORIES[vendor.category]} · {vendor.city}, {vendor.country}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>{vendor.ownerName} · {vendor.email}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'6px', background:st.bg, color:st.color }}>{st.label}</span>
                  <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'4px' }}>{new Date(vendor.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Détail */}
        {selected && (
          <div style={{ ...s.card, height:'fit-content', position:'sticky', top:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h3 style={{ color:'white', fontSize:'15px', fontWeight:'700', margin:0 }}>{selected.businessName}</h3>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'18px', cursor:'pointer' }}>✕</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'16px', fontSize:'13px' }}>
              {[
                { label:'Catégorie',  value: CATEGORIES[selected.category] },
                { label:'Propriétaire', value: selected.ownerName },
                { label:'Email',      value: selected.email },
                selected.phone && { label:'Tél', value: selected.phone },
                { label:'Lieu',       value: `${selected.city}, ${selected.country}` },
                selected.website && { label:'Site', value: selected.website },
                { label:'Gamme',      value: selected.priceRange },
                selected.startingPrice > 0 && { label:'Prix', value: `${selected.startingPrice.toLocaleString()} ${selected.currency}` },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} style={{ display:'flex', gap:'8px' }}>
                  <span style={{ color:'rgba(255,255,255,0.4)', minWidth:'80px' }}>{label} :</span>
                  <span style={{ color:'white' }}>{value}</span>
                </div>
              ))}
            </div>

            {selected.tagline && (
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'10px', marginBottom:'14px', fontStyle:'italic', color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>
                "{selected.tagline}"
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {selected.status !== 'approved' && (
                <button onClick={() => handleApprove(selected._id)} disabled={actionLoading}
                  style={{ padding:'11px', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'14px' }}>
                  ✅ Approuver
                </button>
              )}
              {selected.status !== 'rejected' && (
                <>
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="Raison du refus..."
                    style={{ ...s.input, height:'60px', resize:'vertical', fontSize:'13px' }}
                  />
                  <button onClick={() => handleReject(selected._id)} disabled={actionLoading || !rejectReason.trim()}
                    style={{ padding:'10px', background:'rgba(239,68,68,0.1)', color:'#ef5350', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>
                    ❌ Refuser
                  </button>
                </>
              )}
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={() => handleFeatured(selected._id)}
                  style={{ flex:1, padding:'9px', background:'rgba(201,168,76,0.1)', color:'#c9a84c', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'12px' }}>
                  {selected.featured ? '⭐ Retirer vedette' : '⭐ Mettre en vedette'}
                </button>
                <button onClick={() => handleDelete(selected._id)}
                  style={{ padding:'9px 14px', background:'rgba(239,68,68,0.1)', color:'#ef5350', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', cursor:'pointer', fontSize:'16px' }}>
                  🗑️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// DASHBOARD PRINCIPAL
// ══════════════════════════════════════════════════════════
const AdminMain = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('comptes');

  const tabs = [
    { id:'comptes',       label:'⚡ Comptes Pro' },
    { id:'prestataires',  label:'💼 Prestataires' },
  ];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={{ color:'#c9a84c', fontSize:'18px', fontWeight:'800', margin:0, letterSpacing:'-0.03em' }}>
            💍 WeddApp Admin
          </h1>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'12px', margin:'2px 0 0' }}>
            Panneau de gestion
          </p>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <Link to="/prestataires" target="_blank"
            style={{ color:'rgba(201,168,76,0.7)', fontSize:'12px', textDecoration:'none' }}>
            Voir l'annuaire →
          </Link>
          <button onClick={onLogout}
            style={{ background:'transparent', border:'1px solid rgba(201,168,76,0.2)', color:'rgba(255,255,255,0.5)', borderRadius:'8px', padding:'6px 14px', cursor:'pointer', fontSize:'12px' }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', display:'flex', gap:'4px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding:'14px 20px', background:'none', border:'none', cursor:'pointer',
              fontSize:'13px', fontWeight:'600',
              color:      activeTab === tab.id ? '#c9a84c' : 'rgba(255,255,255,0.4)',
              borderBottom: activeTab === tab.id ? '2px solid #c9a84c' : '2px solid transparent',
              transition:'all 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div style={{ padding:'28px 32px', maxWidth:'1200px', margin:'0 auto' }}>
        {activeTab === 'comptes'      && <ComptesPro />}
        {activeTab === 'prestataires' && <Prestataires />}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════════
const SecretAdmin = () => {
  const [auth, setAuth] = useState(() => sessionStorage.getItem('weddapp_admin_auth') === '1');

  const handleLogin  = () => { sessionStorage.setItem('weddapp_admin_auth', '1'); setAuth(true); };
  const handleLogout = () => { sessionStorage.removeItem('weddapp_admin_auth'); setAuth(false); };

  if (!auth) return <LoginScreen onLogin={handleLogin} />;
  return <AdminMain onLogout={handleLogout} />;
};

export default SecretAdmin;

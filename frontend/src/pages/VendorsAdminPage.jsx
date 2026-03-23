// src/pages/VendorsAdminPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';

// ── MOT DE PASSE ADMIN (change-le ici) ──────────────────────────
const ADMIN_PASSWORD = 'mariageplus2026';

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
  pending:  { bg:'#fff8e1', color:'#f59e0b', label:'⏳ En attente' },
  approved: { bg:'#f0fff4', color:'#22c55e', label:'✅ Approuvé'   },
  rejected: { bg:'#fff0f0', color:'#ef5350', label:'❌ Refusé'     },
};

// ── LOGIN ────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [pwd,   setPwd]   = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem('vendor_admin_auth', '1');
      onLogin();
    } else {
      setError('Mot de passe incorrect');
      setPwd('');
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#1a1a2e,#16213e)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'48px', maxWidth:'380px', width:'100%', textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔐</div>
        <h2 style={{ fontSize:'22px', fontWeight:'800', color:'#1a1a2e', marginBottom:'8px' }}>Admin Prestataires</h2>
        <p style={{ color:'#888', fontSize:'13px', marginBottom:'28px' }}>Accès restreint — MariagePlus</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password" value={pwd} onChange={e=>setPwd(e.target.value)}
            placeholder="Mot de passe admin"
            style={{ width:'100%', padding:'12px 16px', border:'2px solid #e0e0e0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'12px', fontFamily:'inherit' }}
            autoFocus
          />
          {error && <p style={{ color:'#ef5350', fontSize:'13px', marginBottom:'12px', fontWeight:'600' }}>❌ {error}</p>}
          <button type="submit" style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a1a2e', border:'none', borderRadius:'10px', fontWeight:'800', cursor:'pointer', fontSize:'15px' }}>
            Accéder →
          </button>
        </form>
        <Link to="/" style={{ display:'block', marginTop:'16px', color:'#aaa', fontSize:'12px', textDecoration:'none' }}>← Retour à l'accueil</Link>
      </div>
    </div>
  );
};

// ── DASHBOARD ADMIN ──────────────────────────────────────────────
const AdminDashboard = ({ onLogout }) => {
  const [vendors,      setVendors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selected,     setSelected]     = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading,setActionLoading]= useState(false);
  const [stats,        setStats]        = useState({ pending:0, approved:0, rejected:0, total:0 });

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

      // Stats globales
      const [p, a, r] = await Promise.all([
        fetch(`${API_URL}/vendors/admin/all?status=pending&limit=1`,  { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
        fetch(`${API_URL}/vendors/admin/all?status=approved&limit=1`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
        fetch(`${API_URL}/vendors/admin/all?status=rejected&limit=1`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
      ]);
      setStats({ pending:p.total||0, approved:a.total||0, rejected:r.total||0, total:(p.total||0)+(a.total||0)+(r.total||0) });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await fetch(`${API_URL}/vendors/admin/${id}/approve`, {
        method:'PUT', headers:{ Authorization:`Bearer ${token}` },
      });
      fetchVendors();
      setSelected(null);
    } catch { alert('Erreur'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) { alert('Entrez une raison de refus'); return; }
    setActionLoading(true);
    try {
      await fetch(`${API_URL}/vendors/admin/${id}/reject`, {
        method:'PUT',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason }),
      });
      fetchVendors();
      setSelected(null);
      setRejectReason('');
    } catch { alert('Erreur'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer définitivement ce prestataire ?')) return;
    try {
      await fetch(`${API_URL}/vendors/admin/${id}`, {
        method:'DELETE', headers:{ Authorization:`Bearer ${token}` },
      });
      fetchVendors();
      setSelected(null);
    } catch { alert('Erreur'); }
  };

  const handleFeatured = async (id) => {
    try {
      await fetch(`${API_URL}/vendors/admin/${id}/featured`, {
        method:'PUT', headers:{ Authorization:`Bearer ${token}` },
      });
      fetchVendors();
    } catch { alert('Erreur'); }
  };

  const statCard = (label, value, color) => (
    <div style={{ background:'white', borderRadius:'14px', padding:'20px 24px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', flex:1 }}>
      <div style={{ fontSize:'28px', fontWeight:'900', color }}>{value}</div>
      <div style={{ fontSize:'12px', color:'#888', marginTop:'4px', fontWeight:'600' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f5f6fa', fontFamily:'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1a1a2e,#16213e)', padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ color:'#c9a84c', fontSize:'20px', fontWeight:'800', margin:0 }}>💼 Admin — Prestataires</h1>
          <p style={{ color:'#a0a8c0', fontSize:'12px', margin:'4px 0 0' }}>MariagePlus · Gestion des inscriptions</p>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <Link to="/prestataires" target="_blank" style={{ color:'#c9a84c', fontSize:'13px', textDecoration:'none' }}>Voir l'annuaire →</Link>
          <button onClick={onLogout} style={{ background:'transparent', border:'1px solid #c9a84c40', color:'#c9a84c', borderRadius:'8px', padding:'7px 14px', cursor:'pointer', fontSize:'12px' }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'32px 24px' }}>

        {/* Stats */}
        <div style={{ display:'flex', gap:'16px', marginBottom:'32px', flexWrap:'wrap' }}>
          {statCard('Total',     stats.total,    '#1a1a2e')}
          {statCard('En attente', stats.pending,  '#f59e0b')}
          {statCard('Approuvés', stats.approved, '#22c55e')}
          {statCard('Refusés',   stats.rejected, '#ef5350')}
        </div>

        {/* Filtres statut */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
          {['pending','approved','rejected'].map(s => (
            <button key={s} onClick={()=>{ setFilterStatus(s); setSelected(null); }}
              style={{ padding:'8px 20px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'13px',
                background: filterStatus===s ? '#1a1a2e' : 'white',
                color:      filterStatus===s ? '#c9a84c'  : '#555',
                boxShadow:  filterStatus===s ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.06)',
              }}>
              {STATUS_COLORS[s].label}
              <span style={{ marginLeft:'6px', background:'rgba(255,255,255,0.2)', borderRadius:'10px', padding:'1px 6px', fontSize:'11px' }}>
                {s==='pending'?stats.pending:s==='approved'?stats.approved:stats.rejected}
              </span>
            </button>
          ))}
          <button onClick={fetchVendors} style={{ marginLeft:'auto', padding:'8px 16px', background:'white', border:'none', borderRadius:'10px', cursor:'pointer', color:'#555', boxShadow:'0 2px 6px rgba(0,0,0,0.06)' }}>🔄</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap:'20px' }}>

          {/* Liste */}
          <div>
            {loading ? (
              <div style={{ textAlign:'center', padding:'60px', color:'#888' }}>⏳ Chargement...</div>
            ) : vendors.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px', color:'#888', background:'white', borderRadius:'16px' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>✅</div>
                <p>Aucun prestataire {filterStatus === 'pending' ? 'en attente' : filterStatus === 'approved' ? 'approuvé' : 'refusé'}</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {vendors.map(vendor => {
                  const st = STATUS_COLORS[vendor.status];
                  const isSelected = selected?._id === vendor._id;
                  return (
                    <div key={vendor._id}
                      onClick={() => setSelected(isSelected ? null : vendor)}
                      style={{ background:'white', borderRadius:'14px', padding:'16px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', cursor:'pointer', border:`2px solid ${isSelected ? '#c9a84c' : 'transparent'}`, display:'flex', alignItems:'center', gap:'16px', transition:'all 0.15s' }}
                    >
                      <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:vendor.logo?`url(${vendor.logo}) center/cover`:'linear-gradient(135deg,#1a1a2e,#2a2a4e)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>
                        {!vendor.logo && (CATEGORIES[vendor.category]?.split(' ')[0] || '💼')}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'2px' }}>
                          <span style={{ fontWeight:'800', fontSize:'14px', color:'#1a1a2e' }}>{vendor.businessName}</span>
                          {vendor.featured && <span style={{ fontSize:'10px', background:'#c9a84c20', color:'#c9a84c', padding:'1px 6px', borderRadius:'8px', fontWeight:'700' }}>⭐ Vedette</span>}
                        </div>
                        <div style={{ fontSize:'12px', color:'#888' }}>{CATEGORIES[vendor.category]} · {vendor.city}, {vendor.country}</div>
                        <div style={{ fontSize:'11px', color:'#aaa', marginTop:'2px' }}>{vendor.ownerName} · {vendor.email}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'8px', background:st.bg, color:st.color }}>
                          {st.label}
                        </span>
                        <div style={{ fontSize:'10px', color:'#bbb', marginTop:'4px' }}>
                          {new Date(vendor.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Détail */}
          {selected && (
            <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', height:'fit-content', position:'sticky', top:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#1a1a2e', margin:0 }}>{selected.businessName}</h3>
                <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#888' }}>✕</button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px', fontSize:'13px' }}>
                <div><span style={{ color:'#888' }}>Catégorie :</span> {CATEGORIES[selected.category]}</div>
                <div><span style={{ color:'#888' }}>Propriétaire :</span> {selected.ownerName}</div>
                <div><span style={{ color:'#888' }}>Email :</span> <a href={`mailto:${selected.email}`} style={{ color:'#1a1a2e' }}>{selected.email}</a></div>
                {selected.phone && <div><span style={{ color:'#888' }}>Tél :</span> {selected.phone}</div>}
                <div><span style={{ color:'#888' }}>Localisation :</span> {selected.city}, {selected.country}</div>
                {selected.website && <div><span style={{ color:'#888' }}>Site :</span> <a href={selected.website} target="_blank" rel="noreferrer" style={{ color:'#c9a84c' }}>{selected.website}</a></div>}
                {selected.instagram && <div><span style={{ color:'#888' }}>Instagram :</span> {selected.instagram}</div>}
                <div><span style={{ color:'#888' }}>Gamme :</span> {selected.priceRange}</div>
                {selected.startingPrice > 0 && <div><span style={{ color:'#888' }}>Prix :</span> {selected.startingPrice.toLocaleString()} {selected.currency}</div>}
                <div><span style={{ color:'#888' }}>Vues :</span> {selected.views}</div>
              </div>

              {selected.tagline && (
                <div style={{ background:'#f8f9ff', borderRadius:'10px', padding:'12px', marginBottom:'16px', fontStyle:'italic', color:'#555', fontSize:'13px' }}>
                  "{selected.tagline}"
                </div>
              )}

              {selected.description && (
                <div style={{ marginBottom:'20px' }}>
                  <p style={{ fontSize:'11px', fontWeight:'700', color:'#888', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px' }}>Description</p>
                  <p style={{ fontSize:'13px', color:'#444', lineHeight:1.6 }}>{selected.description}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {selected.status !== 'approved' && (
                  <button onClick={()=>handleApprove(selected._id)} disabled={actionLoading}
                    style={{ padding:'11px', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'14px' }}>
                    ✅ Approuver
                  </button>
                )}

                {selected.status !== 'rejected' && (
                  <div>
                    <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)}
                      placeholder="Raison du refus..."
                      style={{ width:'100%', padding:'10px', border:'1px solid #e0e0e0', borderRadius:'10px', fontSize:'13px', resize:'vertical', height:'60px', boxSizing:'border-box', marginBottom:'6px', fontFamily:'inherit' }}
                    />
                    <button onClick={()=>handleReject(selected._id)} disabled={actionLoading || !rejectReason.trim()}
                      style={{ width:'100%', padding:'10px', background:'#fff0f0', color:'#ef5350', border:'1px solid #ef535040', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>
                      ❌ Refuser
                    </button>
                  </div>
                )}

                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={()=>handleFeatured(selected._id)}
                    style={{ flex:1, padding:'10px', background:'#fff8e1', color:'#c9a84c', border:'1px solid #c9a84c40', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>
                    {selected.featured ? '⭐ Retirer vedette' : '⭐ Mettre en vedette'}
                  </button>
                  <button onClick={()=>handleDelete(selected._id)}
                    style={{ padding:'10px 14px', background:'#fff0f0', color:'#ef5350', border:'1px solid #ef535040', borderRadius:'10px', cursor:'pointer', fontSize:'16px' }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────
const VendorsAdminPage = () => {
  const [auth, setAuth] = useState(() => sessionStorage.getItem('vendor_admin_auth') === '1');

  const handleLogout = () => {
    sessionStorage.removeItem('vendor_admin_auth');
    setAuth(false);
  };

  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
};

export default VendorsAdminPage;

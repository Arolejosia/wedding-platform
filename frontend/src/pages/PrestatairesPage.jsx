// src/pages/PrestatairesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';

const CATEGORIES = [
  { value: '',                 label: 'Tous',             icon: '🌟' },
  { value: 'photographe',     label: 'Photographes',      icon: '📸' },
  { value: 'traiteur',        label: 'Traiteurs',         icon: '🍽️' },
  { value: 'dj',              label: 'DJ / Musique',      icon: '🎵' },
  { value: 'fleuriste',       label: 'Fleuristes',        icon: '💐' },
  { value: 'salle',           label: 'Salles',            icon: '🏛️' },
  { value: 'decorateur',      label: 'Décorateurs',       icon: '✨' },
  { value: 'robe',            label: 'Robes / Costumes',  icon: '👗' },
  { value: 'transport',       label: 'Transport',         icon: '🚗' },
  { value: 'wedding_planner', label: 'Wedding Planners',  icon: '📋' },
  { value: 'autre',           label: 'Autre',             icon: '💼' },
];

const PRICE_RANGES = [
  { value: '',        label: 'Tous les prix',  color: '#888' },
  { value: 'budget',  label: 'Budget',         color: '#26a69a' },
  { value: 'moyen',   label: 'Moyen',          color: '#c9a84c' },
  { value: 'premium', label: 'Premium',        color: '#7c3aed' },
  { value: 'luxe',    label: 'Luxe',           color: '#1a1a2e' },
];

const SORT_OPTIONS = [
  { value: 'featured',   label: '⭐ En vedette' },
  { value: 'newest',     label: '🆕 Plus récent' },
  { value: 'price_asc',  label: '💰 Prix croissant' },
  { value: 'price_desc', label: '💰 Prix décroissant' },
  { value: 'name_asc',   label: '🔤 Nom A → Z' },
];

const PRICE_LABELS = {
  budget:  { label: 'Budget',  color: '#26a69a' },
  moyen:   { label: 'Moyen',   color: '#c9a84c' },
  premium: { label: 'Premium', color: '#7c3aed' },
  luxe:    { label: 'Luxe',    color: '#1a1a2e' },
};

// ── Skeleton Card ────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
    <div style={{ height:'180px', background:'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>
    <div style={{ padding:'16px' }}>
      {[70,50,40,100].map((w,i) => (
        <div key={i} style={{ height: i===3?36:12, background:'#f0f0f0', borderRadius:'8px', marginBottom:'8px', width:`${w}%` }}/>
      ))}
    </div>
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
  </div>
);

// ── Carte prestataire ────────────────────────────────────────────
const VendorCard = ({ vendor, onContact }) => {
  const price  = PRICE_LABELS[vendor.priceRange] || PRICE_LABELS.moyen;
  const catObj = CATEGORIES.find(c => c.value === vendor.category);
  return (
    <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', transition:'transform 0.2s,box-shadow 0.2s', position:'relative' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.12)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)';}}
    >
      {vendor.featured && (
        <div style={{ position:'absolute', top:'10px', left:'10px', background:'#c9a84c', color:'#1a1a2e', fontSize:'9px', fontWeight:'800', padding:'3px 8px', borderRadius:'20px', zIndex:2, letterSpacing:'1px' }}>
          ⭐ EN VEDETTE
        </div>
      )}
      <div style={{ height:'175px', background: vendor.logo ? `url(${vendor.logo}) center/cover` : 'linear-gradient(135deg,#1a1a2e,#2a2a4e)', position:'relative' }}>
        {!vendor.logo && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px' }}>
            {catObj?.icon || '💼'}
          </div>
        )}
        <div style={{ position:'absolute', bottom:'8px', right:'8px', background:'rgba(0,0,0,0.55)', color:'white', fontSize:'10px', padding:'3px 8px', borderRadius:'20px' }}>
          {catObj?.icon} {catObj?.label}
        </div>
      </div>
      <div style={{ padding:'14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'5px' }}>
          <h3 style={{ fontSize:'14px', fontWeight:'800', color:'#1a1a2e', margin:0, lineHeight:1.3 }}>{vendor.businessName}</h3>
          <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 7px', borderRadius:'10px', background:`${price.color}18`, color:price.color, flexShrink:0, marginLeft:'6px' }}>
            {price.label}
          </span>
        </div>
        {vendor.tagline && <p style={{ fontSize:'11px', color:'#999', margin:'0 0 6px', fontStyle:'italic', lineHeight:1.4 }}>{vendor.tagline}</p>}
        <div style={{ fontSize:'11px', color:'#777', marginBottom:'10px' }}>📍 {vendor.city}, {vendor.country}</div>
        {vendor.startingPrice > 0 && (
          <div style={{ fontSize:'12px', color:'#c9a84c', fontWeight:'700', marginBottom:'10px' }}>
            À partir de {vendor.startingPrice.toLocaleString()} {vendor.currency}
          </div>
        )}
        <button onClick={()=>onContact(vendor)} style={{ width:'100%', padding:'9px', background:'linear-gradient(135deg,#1a1a2e,#2a2a4e)', color:'white', border:'none', borderRadius:'9px', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
          Contacter →
        </button>
      </div>
    </div>
  );
};

// ── Formulaire inscription ───────────────────────────────────────
const RegisterForm = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    businessName:'', ownerName:'', email:'', phone:'', website:'', instagram:'',
    category:'photographe', country:'', city:'',
    description:'', tagline:'', priceRange:'moyen', startingPrice:'', currency:'FCFA',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.ownerName || !form.email || !form.country || !form.city) {
      setError('Veuillez remplir tous les champs obligatoires *'); return;
    }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_URL}/vendors/register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, startingPrice: Number(form.startingPrice)||0 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error||'Erreur'); return; }
      onSuccess();
    } catch { setError('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid #e8e8e8', borderRadius:'10px', fontSize:'13px', boxSizing:'border-box', outline:'none', fontFamily:'inherit', transition:'border-color 0.15s' };
  const lbl = { fontSize:'11px', fontWeight:'700', color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'580px', maxHeight:'92vh', overflowY:'auto', padding:'32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1a1a2e', margin:0 }}>💼 Rejoindre l'annuaire</h2>
            <p style={{ fontSize:'12px', color:'#999', margin:'4px 0 0' }}>Profil visible après approbation (sous 48h)</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'22px', cursor:'pointer', color:'#aaa' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div><label style={lbl}>Nom entreprise *</label><input style={inp} value={form.businessName} onChange={e=>setForm({...form,businessName:e.target.value})} placeholder="Mon Studio Photo"/></div>
            <div><label style={lbl}>Votre nom *</label><input style={inp} value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})} placeholder="Jean Dupont"/></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div><label style={lbl}>Email *</label><input style={inp} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="contact@studio.com"/></div>
            <div><label style={lbl}>Téléphone</label><input style={inp} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+237 6XX XX XX XX"/></div>
          </div>
          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Catégorie *</label>
            <select style={inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              {CATEGORIES.filter(c=>c.value).map(c=><option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div><label style={lbl}>Pays *</label><input style={inp} value={form.country} onChange={e=>setForm({...form,country:e.target.value})} placeholder="Cameroun"/></div>
            <div><label style={lbl}>Ville *</label><input style={inp} value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="Douala"/></div>
          </div>
          <div style={{ marginBottom:'12px' }}><label style={lbl}>Slogan (court)</label><input style={inp} value={form.tagline} onChange={e=>setForm({...form,tagline:e.target.value})} placeholder="Des photos qui racontent votre histoire" maxLength={150}/></div>
          <div style={{ marginBottom:'12px' }}><label style={lbl}>Description</label><textarea style={{...inp,height:'80px',resize:'vertical'}} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Décrivez vos services..." maxLength={1000}/></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div>
              <label style={lbl}>Gamme</label>
              <select style={inp} value={form.priceRange} onChange={e=>setForm({...form,priceRange:e.target.value})}>
                <option value="budget">Budget</option><option value="moyen">Moyen</option><option value="premium">Premium</option><option value="luxe">Luxe</option>
              </select>
            </div>
            <div><label style={lbl}>Prix de départ</label><input style={inp} type="number" value={form.startingPrice} onChange={e=>setForm({...form,startingPrice:e.target.value})} placeholder="50000"/></div>
            <div>
              <label style={lbl}>Devise</label>
              <select style={inp} value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>
                <option value="FCFA">FCFA</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="CAD">CAD</option>
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
            <div><label style={lbl}>Site web</label><input style={inp} value={form.website} onChange={e=>setForm({...form,website:e.target.value})} placeholder="https://monstudio.com"/></div>
            <div><label style={lbl}>Instagram</label><input style={inp} value={form.instagram} onChange={e=>setForm({...form,instagram:e.target.value})} placeholder="@monstudio"/></div>
          </div>
          {error && <p style={{ color:'#ef5350', fontSize:'13px', marginBottom:'12px', fontWeight:'600' }}>❌ {error}</p>}
          <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a1a2e', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:'800', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1 }}>
            {loading ? '⏳ Envoi...' : '✅ Soumettre mon profil'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Modal contact ────────────────────────────────────────────────
const ContactModal = ({ vendor, onClose }) => {
  const waMsg    = encodeURIComponent(`Bonjour, j'ai trouvé votre profil sur WaddApp et je suis intéressé(e) par vos services.`);
  const waNumber = vendor.phone ? vendor.phone.replace(/\D/g,'') : null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'32px', maxWidth:'420px', width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h3 style={{ fontSize:'18px', fontWeight:'800', color:'#1a1a2e', margin:0 }}>{vendor.businessName}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'22px', cursor:'pointer', color:'#aaa' }}>✕</button>
        </div>
        {vendor.description && <p style={{ color:'#666', fontSize:'13px', marginBottom:'20px', lineHeight:1.5 }}>{vendor.description}</p>}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}?text=${waMsg}`} target="_blank" rel="noreferrer"
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'#25D36615', borderRadius:'10px', textDecoration:'none', color:'#128C7E', fontWeight:'700', fontSize:'14px' }}>
              💬 WhatsApp
            </a>
          )}
          {vendor.phone && <a href={`tel:${vendor.phone}`} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'#f5f5f5', borderRadius:'10px', textDecoration:'none', color:'#1a1a2e', fontWeight:'600', fontSize:'14px' }}>📞 {vendor.phone}</a>}
          {vendor.website && <a href={vendor.website} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'#f5f5f5', borderRadius:'10px', textDecoration:'none', color:'#1a1a2e', fontWeight:'600', fontSize:'14px' }}>🌐 Visiter le site web</a>}
          {vendor.instagram && <a href={`https://instagram.com/${vendor.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'#f5f5f5', borderRadius:'10px', textDecoration:'none', color:'#1a1a2e', fontWeight:'600', fontSize:'14px' }}>📸 {vendor.instagram}</a>}
        </div>
        <p style={{ fontSize:'11px', color:'#ccc', textAlign:'center', marginTop:'16px' }}>📍 {vendor.city}, {vendor.country}</p>
      </div>
    </div>
  );
};

// ── Divider sidebar ──────────────────────────────────────────────
const SideLabel = ({ children }) => (
  <p style={{ fontSize:'10px', fontWeight:'800', color:'#bbb', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 8px' }}>{children}</p>
);

// ── PAGE PRINCIPALE ──────────────────────────────────────────────
const PrestatairesPage = () => {
  const [vendors,       setVendors]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [category,      setCategory]      = useState('');
  const [country,       setCountry]       = useState('');
  const [city,          setCity]          = useState('');
  const [priceRange,    setPriceRange]    = useState('');
  const [sortBy,        setSortBy]        = useState('featured');
  const [search,        setSearch]        = useState('');
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [total,         setTotal]         = useState(0);
  const [countries,     setCountries]     = useState([]);
  const [cities,        setCities]        = useState([]);
  const [showRegister,  setShowRegister]  = useState(false);
  const [showSuccess,   setShowSuccess]   = useState(false);
  const [contactVendor, setContactVendor] = useState(null);
  const [sidebarOpen,   setSidebarOpen]   = useState(false); // mobile
  const debounceRef = useRef(null);

  // ── Charger pays ────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/vendors/countries`)
      .then(r => r.json())
      .then(d => setCountries(d.countries || []))
      .catch(() => {});
  }, []);

  // ── Charger villes quand pays change ────────────────────────────
  useEffect(() => {
    setCity('');
    setCities([]);
    if (!country) return;
    fetch(`${API_URL}/vendors/cities?country=${encodeURIComponent(country)}`)
      .then(r => r.json())
      .then(d => setCities(d.cities || []))
      .catch(() => {});
  }, [country]);

  // ── Fetch prestataires ──────────────────────────────────────────
  const fetchVendors = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:   overrides.page  ?? page,
        limit:  12,
        sortBy: overrides.sortBy ?? sortBy,
      });
      const _cat   = overrides.category   !== undefined ? overrides.category   : category;
      const _cntry = overrides.country    !== undefined ? overrides.country    : country;
      const _city  = overrides.city       !== undefined ? overrides.city       : city;
      const _pr    = overrides.priceRange !== undefined ? overrides.priceRange : priceRange;
      const _srch  = overrides.search     !== undefined ? overrides.search     : search;

      if (_cat)   params.append('category',   _cat);
      if (_cntry) params.append('country',    _cntry);
      if (_city)  params.append('city',       _city);
      if (_pr)    params.append('priceRange', _pr);
      if (_srch)  params.append('search',     _srch);

      const res  = await fetch(`${API_URL}/vendors?${params}`);
      const data = await res.json();
      setVendors(data.vendors || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVendors(); }, [category, country, city, priceRange, sortBy, page]); // eslint-disable-line

  // Debounce search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchVendors({ search: val, page: 1 }); }, 400);
  };

  const resetFilters = () => {
    setCategory(''); setCountry(''); setCity(''); setPriceRange('');
    setSortBy('featured'); setSearch(''); setPage(1);
  };

  const activeCount = [category, country, city, priceRange, search].filter(Boolean).length;

  // ── Styles réutilisables ────────────────────────────────────────
  const selStyle = {
    width:'100%', padding:'9px 12px', border:'1.5px solid #eee',
    borderRadius:'10px', fontSize:'13px', outline:'none',
    background:'white', cursor:'pointer', color:'#333',
    appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center',
  };

  // ── SIDEBAR content (réutilisé desktop + mobile drawer) ─────────
  const SidebarContent = () => (
    <div>
      {/* Recherche */}
      <div style={{ marginBottom:'20px' }}>
        <SideLabel>Recherche</SideLabel>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', pointerEvents:'none' }}>🔍</span>
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Nom, service..."
            style={{ width:'100%', padding:'9px 12px 9px 32px', border:'1.5px solid #eee', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}
          />
        </div>
      </div>

      {/* Catégorie */}
      <div style={{ marginBottom:'20px' }}>
        <SideLabel>Catégorie</SideLabel>
        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => { setCategory(cat.value); setPage(1); setSidebarOpen(false); }}
              style={{
                display:'flex', alignItems:'center', gap:'8px',
                padding:'8px 12px', borderRadius:'10px', border:'none', cursor:'pointer',
                fontSize:'13px', fontWeight: category === cat.value ? '700' : '500',
                background: category === cat.value ? '#1a1a2e' : 'transparent',
                color:      category === cat.value ? '#c9a84c' : '#444',
                textAlign:'left', transition:'all 0.12s',
              }}
              onMouseEnter={e => { if (category !== cat.value) e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={e => { if (category !== cat.value) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize:'15px' }}>{cat.icon}</span>
              <span>{cat.label}</span>
              {category === cat.value && <span style={{ marginLeft:'auto', fontSize:'10px' }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Séparateur */}
      <hr style={{ border:'none', borderTop:'1px solid #f0f0f0', margin:'4px 0 20px' }}/>

      {/* Localisation */}
      <div style={{ marginBottom:'16px' }}>
        <SideLabel>Pays</SideLabel>
        <select value={country} onChange={e => { setCountry(e.target.value); setPage(1); }} style={selStyle}>
          <option value="">🌍 Tous les pays</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ marginBottom:'20px' }}>
        <SideLabel>Ville</SideLabel>
        <select
          value={city}
          onChange={e => { setCity(e.target.value); setPage(1); }}
          disabled={!country || cities.length === 0}
          style={{ ...selStyle, opacity: (!country || cities.length === 0) ? 0.45 : 1 }}
        >
          <option value="">🏙️ Toutes les villes</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {country && cities.length === 0 && (
          <p style={{ fontSize:'11px', color:'#bbb', marginTop:'4px' }}>Aucune ville disponible</p>
        )}
      </div>

      {/* Séparateur */}
      <hr style={{ border:'none', borderTop:'1px solid #f0f0f0', margin:'4px 0 20px' }}/>

      {/* Gamme de prix */}
      <div style={{ marginBottom:'20px' }}>
        <SideLabel>Gamme de prix</SideLabel>
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {PRICE_RANGES.map(p => (
            <button key={p.value} onClick={() => { setPriceRange(p.value); setPage(1); }}
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'8px 12px', borderRadius:'10px', border: priceRange === p.value ? `1.5px solid ${p.color}` : '1.5px solid #eee',
                cursor:'pointer', fontSize:'13px', fontWeight: priceRange === p.value ? '700' : '500',
                background: priceRange === p.value ? `${p.color}12` : 'white',
                color: priceRange === p.value ? p.color : '#555',
                textAlign:'left', transition:'all 0.12s',
              }}
            >
              <span style={{ width:'8px', height:'8px', borderRadius:'50%', background: p.value ? p.color : '#ccc', flexShrink:0 }}/>
              {p.label}
              {priceRange === p.value && <span style={{ marginLeft:'auto', fontSize:'12px' }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Séparateur */}
      <hr style={{ border:'none', borderTop:'1px solid #f0f0f0', margin:'4px 0 20px' }}/>

      {/* Tri */}
      <div style={{ marginBottom:'20px' }}>
        <SideLabel>Trier par</SideLabel>
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} style={selStyle}>
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Reset */}
      {activeCount > 0 && (
        <button onClick={resetFilters}
          style={{ width:'100%', padding:'10px', background:'#fff3f3', color:'#e53935', border:'1px solid #ffcdd2', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>
          ✕ Effacer les filtres ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f4f5fb', fontFamily:'system-ui, -apple-system, sans-serif' }}>

      {/* Modals */}
      {showRegister && <RegisterForm onClose={()=>setShowRegister(false)} onSuccess={()=>{setShowRegister(false);setShowSuccess(true);}}/>}
      {showSuccess && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:'20px', padding:'40px', maxWidth:'400px', textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎉</div>
            <h3 style={{ fontSize:'20px', fontWeight:'800', color:'#1a1a2e', marginBottom:'8px' }}>Demande envoyée !</h3>
            <p style={{ color:'#666', fontSize:'14px', marginBottom:'24px' }}>Votre profil sera examiné et publié après approbation sous 48h.</p>
            <button onClick={()=>setShowSuccess(false)} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a1a2e', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer' }}>Parfait !</button>
          </div>
        </div>
      )}
      {contactVendor && <ContactModal vendor={contactVendor} onClose={()=>setContactVendor(null)}/>}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={()=>setSidebarOpen(false)}/>
          <div style={{ position:'relative', width:'280px', background:'white', height:'100%', overflowY:'auto', padding:'24px', zIndex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <strong style={{ fontSize:'15px', color:'#1a1a2e' }}>Filtres</strong>
              <button onClick={()=>setSidebarOpen(false)} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#aaa' }}>✕</button>
            </div>
            <SidebarContent/>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ background:'linear-gradient(135deg,#1a1a2e,#16213e)', padding:'14px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 16px rgba(0,0,0,0.2)' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'8px', textDecoration:'none', color:'#c9a84c', fontWeight:'800', fontSize:'18px', letterSpacing:'-0.3px' }}>
          <span>💍<strong>WeddApp</strong></span>
        </Link>
        <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
          <Link to="/" style={{ color:'#a0a8c0', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Accueil</Link>
          <Link to="/login" style={{ color:'#a0a8c0', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>Connexion</Link>
          <button onClick={()=>setShowRegister(true)} style={{ padding:'8px 16px', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a1a2e', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>
            + Inscrire mon entreprise
          </button>
        </div>
      </nav>

      {/* Hero compact */}
      <div style={{ background:'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)', padding:'48px 28px 40px', textAlign:'center' }}>
        <div style={{ display:'inline-block', background:'rgba(201,168,76,0.15)', color:'#c9a84c', fontSize:'10px', fontWeight:'800', letterSpacing:'3px', textTransform:'uppercase', padding:'5px 14px', borderRadius:'20px', marginBottom:'16px' }}>
          Annuaire Mondial
        </div>
        <h1 style={{ fontSize:'clamp(24px,4vw,44px)', fontWeight:'900', color:'white', lineHeight:1.15, marginBottom:'10px' }}>
          Trouvez les meilleurs<br/>
          <span style={{ color:'#c9a84c' }}>prestataires de mariage</span>
        </h1>
        <p style={{ fontSize:'15px', color:'#a0a8c0', maxWidth:'480px', margin:'0 auto', lineHeight:1.6 }}>
          Des professionnels vérifiés dans le monde entier.
        </p>
      </div>

      {/* Layout principal : sidebar + grille */}
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'32px 24px', display:'flex', gap:'28px', alignItems:'flex-start' }}>

        {/* ── SIDEBAR desktop (sticky) ─────────────────────────── */}
        <aside style={{
          width:'260px', flexShrink:0,
          background:'white', borderRadius:'16px',
          padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
          position:'sticky', top:'74px',
          maxHeight:'calc(100vh - 90px)', overflowY:'auto',
          // Caché sur mobile via mediaQuery simulé dans le JSX
          display:'block',
        }}
          className="vendors-sidebar"
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <strong style={{ fontSize:'15px', color:'#1a1a2e' }}>🎚️ Filtres</strong>
            {activeCount > 0 && (
              <span style={{ background:'#c9a84c', color:'#1a1a2e', fontSize:'10px', fontWeight:'800', padding:'2px 7px', borderRadius:'20px' }}>
                {activeCount}
              </span>
            )}
          </div>
          <SidebarContent/>
        </aside>

        {/* ── CONTENU PRINCIPAL ───────────────────────────────── */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Barre supérieure : compteur + bouton filtre mobile + tri rapide */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              {/* Bouton filtre mobile */}
              <button onClick={()=>setSidebarOpen(true)}
                style={{ padding:'8px 14px', background:'white', border:'1.5px solid #eee', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'13px', color:'#444', display:'flex', alignItems:'center', gap:'6px' }}
                className="mobile-filter-btn"
              >
                🎚️ Filtres {activeCount > 0 && `(${activeCount})`}
              </button>
              <span style={{ fontSize:'13px', color:'#999', fontWeight:'500' }}>
                {loading ? '...' : `${total} prestataire${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`}
              </span>
            </div>
            {/* Tri rapide */}
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'12px', color:'#bbb', fontWeight:'600' }}>Trier :</span>
              <select value={sortBy} onChange={e=>{setSortBy(e.target.value);setPage(1);}}
                style={{ padding:'7px 28px 7px 10px', border:'1.5px solid #eee', borderRadius:'10px', fontSize:'12px', outline:'none', background:'white', cursor:'pointer', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}>
                {SORT_OPTIONS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grille */}
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'20px' }}>
              {Array.from({length:9}).map((_,i)=><SkeletonCard key={i}/>)}
            </div>
          ) : vendors.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 20px', background:'white', borderRadius:'16px' }}>
              <div style={{ fontSize:'52px', marginBottom:'16px' }}>🔍</div>
              <h3 style={{ fontSize:'18px', color:'#1a1a2e', marginBottom:'8px' }}>Aucun prestataire trouvé</h3>
              <p style={{ color:'#999', marginBottom:'24px', fontSize:'14px' }}>
                {activeCount > 0 ? 'Essayez de modifier vos filtres.' : "Soyez le premier à rejoindre l'annuaire !"}
              </p>
              <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
                {activeCount > 0 && (
                  <button onClick={resetFilters} style={{ padding:'10px 20px', background:'white', color:'#555', border:'1.5px solid #ddd', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>
                    Effacer les filtres
                  </button>
                )}
                <button onClick={()=>setShowRegister(true)} style={{ padding:'10px 20px', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a1a2e', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>
                  + Ajouter mon entreprise
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'20px', marginBottom:'32px' }}>
              {vendors.map(vendor=><VendorCard key={vendor._id} vendor={vendor} onContact={setContactVendor}/>)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'6px', marginBottom:'32px' }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{ padding:'8px 14px', borderRadius:'8px', border:'1.5px solid #eee', background:'white', cursor:page===1?'not-allowed':'pointer', color:page===1?'#ccc':'#555', fontWeight:'600', fontSize:'13px' }}>
                ← Préc.
              </button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  style={{ width:'34px', height:'34px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'13px', background:page===p?'#1a1a2e':'white', color:page===p?'#c9a84c':'#666', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  {p}
                </button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{ padding:'8px 14px', borderRadius:'8px', border:'1.5px solid #eee', background:'white', cursor:page===totalPages?'not-allowed':'pointer', color:page===totalPages?'#ccc':'#555', fontWeight:'600', fontSize:'13px' }}>
                Suiv. →
              </button>
            </div>
          )}

          {/* CTA */}
          <div style={{ background:'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius:'16px', padding:'40px', textAlign:'center' }}>
            <h2 style={{ fontSize:'24px', fontWeight:'900', color:'white', marginBottom:'10px' }}>Vous êtes prestataire ?</h2>
            <p style={{ color:'#a0a8c0', fontSize:'14px', marginBottom:'24px', maxWidth:'380px', margin:'0 auto 24px' }}>
              Rejoignez notre annuaire et trouvez de nouveaux clients.
            </p>
            <button onClick={()=>setShowRegister(true)} style={{ padding:'13px 28px', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a1a2e', border:'none', borderRadius:'12px', fontWeight:'800', cursor:'pointer', fontSize:'15px' }}>
              💼 Inscrire mon entreprise gratuitement
            </button>
          </div>
        </div>
      </div>

      {/* CSS responsive */}
      <style>{`
        .vendors-sidebar { display: block !important; }
        .mobile-filter-btn { display: none !important; }
        @media (max-width: 768px) {
          .vendors-sidebar { display: none !important; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>

      <footer style={{ background:'#1a1a2e', color:'#a0a8c0', textAlign:'center', padding:'20px', fontSize:'12px' }}>
        <Link to="/" style={{ color:'#c9a84c', textDecoration:'none', fontWeight:'700' }}>💍 WeddApp</Link>
        {' · '}Annuaire des prestataires de mariage
      </footer>
    </div>
  );
};

export default PrestatairesPage;

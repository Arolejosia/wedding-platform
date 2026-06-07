// src/components/VendorsSection.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import API_URL from '../config/api';

const CATEGORIES = [
  { value: '',                label: 'Tous',            icon: '🌟' },
  { value: 'photographe',    label: 'Photographes',     icon: '📸' },
  { value: 'traiteur',       label: 'Traiteurs',        icon: '🍽️' },
  { value: 'dj',             label: 'DJ / Musique',     icon: '🎵' },
  { value: 'fleuriste',      label: 'Fleuristes',       icon: '💐' },
  { value: 'salle',          label: 'Salles',           icon: '🏛️' },
  { value: 'decorateur',     label: 'Décorateurs',      icon: '✨' },
  { value: 'robe',           label: 'Robes / Costumes', icon: '👗' },
  { value: 'transport',      label: 'Transport',        icon: '🚗' },
  { value: 'wedding_planner',label: 'Wedding Planners', icon: '📋' },
  { value: 'autre',          label: 'Autre',            icon: '💼' },
];

const PRICE_RANGES = [
  { value: '',        label: 'Tous les prix' },
  { value: 'budget',  label: '💚 Budget' },
  { value: 'moyen',   label: '💛 Moyen' },
  { value: 'premium', label: '💜 Premium' },
  { value: 'luxe',    label: '🖤 Luxe' },
];

const SORT_OPTIONS = [
  { value: 'featured', label: '⭐ En vedette d\'abord' },
  { value: 'newest',   label: '🆕 Plus récent' },
  { value: 'price_asc',label: '💰 Prix croissant' },
  { value: 'price_desc',label: '💰 Prix décroissant' },
  { value: 'name_asc', label: '🔤 Nom A → Z' },
];

const PRICE_LABELS = {
  budget:  { label: 'Budget',  color: '#26a69a' },
  moyen:   { label: 'Moyen',   color: '#c9a84c' },
  premium: { label: 'Premium', color: '#7c3aed' },
  luxe:    { label: 'Luxe',    color: '#1a1a2e' },
};

// ── Skeleton Card ────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
    <div style={{ height: '180px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
    <div style={{ padding: '16px' }}>
      <div style={{ height: '16px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '8px', width: '70%' }} />
      <div style={{ height: '12px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '8px', width: '50%' }} />
      <div style={{ height: '12px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '16px', width: '40%' }} />
      <div style={{ height: '36px', background: '#f0f0f0', borderRadius: '10px' }} />
    </div>
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
  </div>
);

// ── Carte prestataire ────────────────────────────────────────────
const VendorCard = ({ vendor, onContact }) => {
  const price  = PRICE_LABELS[vendor.priceRange] || PRICE_LABELS.moyen;
  const catObj = CATEGORIES.find(c => c.value === vendor.category);

  return (
    <div style={{
      background: 'white', borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer', position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
    >
      {vendor.featured && (
        <div style={{ position:'absolute', top:'12px', left:'12px', background:'#c9a84c', color:'#1a1a2e', fontSize:'10px', fontWeight:'800', padding:'3px 8px', borderRadius:'20px', letterSpacing:'1px', zIndex:2 }}>
          ⭐ EN VEDETTE
        </div>
      )}

      <div style={{ height: '180px', background: vendor.logo ? `url(${vendor.logo}) center/cover` : 'linear-gradient(135deg, #1a1a2e, #2a2a4e)', position: 'relative', overflow: 'hidden' }}>
        {!vendor.logo && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px' }}>
            {catObj?.icon || '💼'}
          </div>
        )}
        <div style={{ position:'absolute', bottom:'10px', right:'10px', background:'rgba(0,0,0,0.6)', color:'white', fontSize:'11px', padding:'3px 8px', borderRadius:'20px' }}>
          {catObj?.icon} {catObj?.label}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
          <h3 style={{ fontSize:'15px', fontWeight:'800', color:'#1a1a2e', margin:0, lineHeight:1.3 }}>{vendor.businessName}</h3>
          <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', background:`${price.color}15`, color:price.color, flexShrink:0, marginLeft:'8px' }}>
            {price.label}
          </span>
        </div>

        {vendor.tagline && (
          <p style={{ fontSize:'12px', color:'#888', margin:'0 0 8px', fontStyle:'italic' }}>{vendor.tagline}</p>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#666', marginBottom:'12px' }}>
          <span>📍</span>
          <span>{vendor.city}, {vendor.country}</span>
        </div>

        {vendor.startingPrice > 0 && (
          <div style={{ fontSize:'12px', color:'#c9a84c', fontWeight:'700', marginBottom:'12px' }}>
            À partir de {vendor.startingPrice.toLocaleString()} {vendor.currency}
          </div>
        )}

        <button
          onClick={() => onContact(vendor)}
          style={{ width:'100%', padding:'10px', background:'linear-gradient(135deg,#1a1a2e,#2a2a4e)', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}
        >
          Contacter →
        </button>
      </div>
    </div>
  );
};

// ── Formulaire inscription prestataire ───────────────────────────
const VendorRegisterForm = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    businessName:'', ownerName:'', email:'', phone:'', website:'', instagram:'',
    category:'photographe', country:'', city:'', region:'',
    description:'', tagline:'', priceRange:'moyen', startingPrice:'', currency:'FCFA',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.ownerName || !form.email || !form.country || !form.city) {
      setError('Veuillez remplir tous les champs obligatoires'); return;
    }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_URL}/vendors/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, startingPrice: Number(form.startingPrice) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      onSuccess();
    } catch { setError('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  const inp = { width:'100%', padding:'10px 14px', border:'1px solid #e0e0e0', borderRadius:'10px', fontSize:'13px', boxSizing:'border-box', outline:'none' };
  const lbl = { fontSize:'11px', fontWeight:'700', color:'#555', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'560px', maxHeight:'90vh', overflowY:'auto', padding:'32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#1a1a2e', margin:0 }}>💼 Rejoindre l'annuaire</h2>
            <p style={{ fontSize:'12px', color:'#888', margin:'4px 0 0' }}>Votre profil sera visible après approbation</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#888' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div><label style={lbl}>Nom de l'entreprise *</label><input style={inp} value={form.businessName} onChange={e => setForm({...form, businessName:e.target.value})} placeholder="Mon Studio Photo" /></div>
            <div><label style={lbl}>Votre nom *</label><input style={inp} value={form.ownerName} onChange={e => setForm({...form, ownerName:e.target.value})} placeholder="Jean Dupont" /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div><label style={lbl}>Email *</label><input style={inp} type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="contact@studio.com" /></div>
            <div><label style={lbl}>Téléphone</label><input style={inp} value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="+237 6XX XX XX XX" /></div>
          </div>
          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Catégorie *</label>
            <select style={inp} value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
              {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div><label style={lbl}>Pays *</label><input style={inp} value={form.country} onChange={e => setForm({...form, country:e.target.value})} placeholder="Cameroun" /></div>
            <div><label style={lbl}>Ville *</label><input style={inp} value={form.city} onChange={e => setForm({...form, city:e.target.value})} placeholder="Douala" /></div>
          </div>
          <div style={{ marginBottom:'12px' }}><label style={lbl}>Slogan (court)</label><input style={inp} value={form.tagline} onChange={e => setForm({...form, tagline:e.target.value})} placeholder="Des photos qui racontent votre histoire" maxLength={150} /></div>
          <div style={{ marginBottom:'12px' }}><label style={lbl}>Description</label><textarea style={{...inp, height:'80px', resize:'vertical'}} value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Décrivez vos services..." maxLength={1000} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div>
              <label style={lbl}>Gamme de prix</label>
              <select style={inp} value={form.priceRange} onChange={e => setForm({...form, priceRange:e.target.value})}>
                <option value="budget">Budget</option><option value="moyen">Moyen</option><option value="premium">Premium</option><option value="luxe">Luxe</option>
              </select>
            </div>
            <div><label style={lbl}>Prix de départ</label><input style={inp} type="number" value={form.startingPrice} onChange={e => setForm({...form, startingPrice:e.target.value})} placeholder="50000" /></div>
            <div>
              <label style={lbl}>Devise</label>
              <select style={inp} value={form.currency} onChange={e => setForm({...form, currency:e.target.value})}>
                <option value="FCFA">FCFA</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="CAD">CAD</option>
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
            <div><label style={lbl}>Site web</label><input style={inp} value={form.website} onChange={e => setForm({...form, website:e.target.value})} placeholder="https://monstudio.com" /></div>
            <div><label style={lbl}>Instagram</label><input style={inp} value={form.instagram} onChange={e => setForm({...form, instagram:e.target.value})} placeholder="@monstudio" /></div>
          </div>
          {error && <p style={{ color:'#ef5350', fontSize:'13px', marginBottom:'12px', fontWeight:'600' }}>❌ {error}</p>}
          <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a1a2e', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:'800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Envoi en cours...' : '✅ Soumettre mon profil'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Modal contact prestataire ────────────────────────────────────
const ContactModal = ({ vendor, onClose }) => {
  if (!vendor) return null;
  const waMessage = encodeURIComponent(`Bonjour, j'ai trouvé votre profil sur WeddApp et je suis intéressé(e) par vos services pour mon mariage.`);
  const waNumber  = vendor.phone ? vendor.phone.replace(/\D/g, '') : null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'32px', maxWidth:'420px', width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h3 style={{ fontSize:'18px', fontWeight:'800', color:'#1a1a2e', margin:0 }}>{vendor.businessName}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'22px', cursor:'pointer', color:'#888' }}>✕</button>
        </div>
        <p style={{ color:'#666', fontSize:'13px', marginBottom:'20px' }}>{vendor.description || vendor.tagline}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}?text=${waMessage}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'#25D36615', borderRadius:'10px', textDecoration:'none', color:'#1a1a2e', fontWeight:'600', fontSize:'14px' }}>
              💬 Envoyer un message WhatsApp
            </a>
          )}
          {vendor.phone && (
            <a href={`tel:${vendor.phone}`} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'#f5f5f5', borderRadius:'10px', textDecoration:'none', color:'#1a1a2e', fontWeight:'600', fontSize:'14px' }}>
              📞 {vendor.phone}
            </a>
          )}
          {vendor.website && (
            <a href={vendor.website} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'#f5f5f5', borderRadius:'10px', textDecoration:'none', color:'#1a1a2e', fontWeight:'600', fontSize:'14px' }}>
              🌐 Visiter le site web
            </a>
          )}
          {vendor.instagram && (
            <a href={`https://instagram.com/${vendor.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'#f5f5f5', borderRadius:'10px', textDecoration:'none', color:'#1a1a2e', fontWeight:'600', fontSize:'14px' }}>
              📸 {vendor.instagram}
            </a>
          )}
        </div>
        <p style={{ fontSize:'11px', color:'#bbb', textAlign:'center', marginTop:'16px' }}>📍 {vendor.city}, {vendor.country}</p>
      </div>
    </div>
  );
};

// ── Badge filtre actif ───────────────────────────────────────────
const ActiveFilterBadge = ({ label, onRemove }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'4px 10px', background:'#1a1a2e', color:'#c9a84c', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>
    {label}
    <button onClick={onRemove} style={{ background:'none', border:'none', color:'#c9a84c', cursor:'pointer', fontSize:'14px', lineHeight:1, padding:0 }}>×</button>
  </span>
);

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────
const VendorsSection = ({ lang = 'fr' }) => {
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
  const [totalCount,    setTotalCount]    = useState(0);
  const [countries,     setCountries]     = useState([]);
  const [cities,        setCities]        = useState([]);
  const [showRegister,  setShowRegister]  = useState(false);
  const [showSuccess,   setShowSuccess]   = useState(false);
  const [contactVendor, setContactVendor] = useState(null);

  const LIMIT       = 9;
  const debounceRef = useRef(null);

  // ── Charger les pays disponibles ────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/vendors/countries`)
      .then(r => r.json())
      .then(data => setCountries(data.countries || []))
      .catch(() => {});
  }, []);

  // ── Charger les villes quand le pays change ─────────────────────
  useEffect(() => {
    setCity('');
    setCities([]);
    if (!country) return;
    fetch(`${API_URL}/vendors/cities?country=${encodeURIComponent(country)}`)
      .then(r => r.json())
      .then(data => setCities(data.cities || []))
      .catch(() => {});
  }, [country]);

  // ── Fetch prestataires ──────────────────────────────────────────
  const fetchVendors = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  overrides.page  ?? page,
        limit: LIMIT,
        sortBy: overrides.sortBy ?? sortBy,
      });
      const cat   = overrides.category  !== undefined ? overrides.category  : category;
      const cntry = overrides.country   !== undefined ? overrides.country   : country;
      const cty   = overrides.city      !== undefined ? overrides.city      : city;
      const pr    = overrides.priceRange !== undefined ? overrides.priceRange : priceRange;
      const srch  = overrides.search    !== undefined ? overrides.search    : search;

      if (cat)   params.append('category',   cat);
      if (cntry) params.append('country',    cntry);
      if (cty)   params.append('city',       cty);
      if (pr)    params.append('priceRange', pr);
      if (srch)  params.append('search',     srch);

      const res  = await fetch(`${API_URL}/vendors?${params}`);
      const data = await res.json();
      setVendors(data.vendors || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, category, country, city, priceRange, sortBy, search]); // eslint-disable-line

  useEffect(() => { fetchVendors(); }, [category, country, city, priceRange, sortBy, page]); // eslint-disable-line

  // ── Debounce recherche texte ────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchVendors({ search: val, page: 1 });
    }, 400);
  };

  // ── Réinitialiser tous les filtres ──────────────────────────────
  const resetFilters = () => {
    setCategory(''); setCountry(''); setCity(''); setPriceRange('');
    setSortBy('featured'); setSearch(''); setPage(1);
  };

  const hasActiveFilters = category || country || city || priceRange || search;

  const sel = {
    padding:'10px 14px', border:'1px solid #e0e0e0', borderRadius:'12px',
    fontSize:'13px', outline:'none', background:'white', cursor:'pointer',
    color:'#333', minWidth:'0',
  };

  return (
    <section style={{ padding:'80px 0', background:'#f8f9ff' }} id="prestataires">

      {/* Modals */}
      {showRegister && (
        <VendorRegisterForm
          onClose={() => setShowRegister(false)}
          onSuccess={() => { setShowRegister(false); setShowSuccess(true); }}
        />
      )}
      {showSuccess && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:'20px', padding:'40px', maxWidth:'400px', textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎉</div>
            <h3 style={{ fontSize:'20px', fontWeight:'800', color:'#1a1a2e', marginBottom:'8px' }}>Demande envoyée !</h3>
            <p style={{ color:'#666', fontSize:'14px', marginBottom:'24px' }}>Votre profil sera examiné et publié après approbation. Vous recevrez une confirmation par email.</p>
            <button onClick={() => setShowSuccess(false)} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a1a2e', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'14px' }}>Parfait !</button>
          </div>
        </div>
      )}
      {contactVendor && <ContactModal vendor={contactVendor} onClose={() => setContactVendor(null)} />}

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <div style={{ display:'inline-block', background:'linear-gradient(135deg,#c9a84c20,#c9a84c10)', color:'#c9a84c', fontSize:'11px', fontWeight:'800', letterSpacing:'3px', textTransform:'uppercase', padding:'6px 16px', borderRadius:'20px', marginBottom:'16px' }}>
            Annuaire
          </div>
          <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:'900', color:'#1a1a2e', lineHeight:1.2, marginBottom:'12px' }}>
            {lang === 'fr' ? 'Trouvez vos prestataires de mariage' : 'Find your wedding vendors'}
          </h2>
          <p style={{ fontSize:'16px', color:'#888', maxWidth:'500px', margin:'0 auto 24px' }}>
            {lang === 'fr' ? 'Des professionnels vérifiés partout dans le monde, sélectionnés pour vous.' : 'Verified professionals worldwide, selected for you.'}
          </p>
          <button
            onClick={() => setShowRegister(true)}
            style={{ padding:'12px 24px', background:'linear-gradient(135deg,#1a1a2e,#2a2a4e)', color:'#c9a84c', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'700', cursor:'pointer' }}
          >
            💼 {lang === 'fr' ? 'Inscrire mon entreprise' : 'List my business'}
          </button>
        </div>

        {/* Filtres catégories */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center', marginBottom:'24px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setPage(1); }}
              style={{
                padding:'8px 16px', borderRadius:'20px', border:'none', cursor:'pointer',
                fontSize:'13px', fontWeight:'600', transition:'all 0.15s',
                background: category === cat.value ? '#1a1a2e' : 'white',
                color:      category === cat.value ? '#c9a84c'  : '#555',
                boxShadow:  category === cat.value ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* ── Barre de filtres avancés ────────────────────────────── */}
        <div style={{ background:'white', borderRadius:'16px', padding:'16px 20px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr auto', gap:'10px', alignItems:'end' }}>

            {/* Recherche texte */}
            <div>
              <label style={{ fontSize:'10px', fontWeight:'700', color:'#aaa', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Recherche</label>
              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="🔍 Nom, ville, service..."
                style={{ ...sel, width:'100%', boxSizing:'border-box' }}
              />
            </div>

            {/* Pays */}
            <div>
              <label style={{ fontSize:'10px', fontWeight:'700', color:'#aaa', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Pays</label>
              <select
                value={country}
                onChange={e => { setCountry(e.target.value); setPage(1); }}
                style={{ ...sel, width:'100%' }}
              >
                <option value="">🌍 Tous les pays</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Ville */}
            <div>
              <label style={{ fontSize:'10px', fontWeight:'700', color:'#aaa', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Ville</label>
              <select
                value={city}
                onChange={e => { setCity(e.target.value); setPage(1); }}
                disabled={!country || cities.length === 0}
                style={{ ...sel, width:'100%', opacity: (!country || cities.length === 0) ? 0.5 : 1 }}
              >
                <option value="">🏙️ Toutes les villes</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Gamme de prix */}
            <div>
              <label style={{ fontSize:'10px', fontWeight:'700', color:'#aaa', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Prix</label>
              <select
                value={priceRange}
                onChange={e => { setPriceRange(e.target.value); setPage(1); }}
                style={{ ...sel, width:'100%' }}
              >
                {PRICE_RANGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {/* Tri */}
            <div>
              <label style={{ fontSize:'10px', fontWeight:'700', color:'#aaa', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Trier par</label>
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                style={{ ...sel, width:'100%' }}
              >
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Filtres actifs + compteur */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'10px' }}>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
            {hasActiveFilters && (
              <>
                {category  && <ActiveFilterBadge label={CATEGORIES.find(c => c.value === category)?.label} onRemove={() => { setCategory(''); setPage(1); }} />}
                {country   && <ActiveFilterBadge label={`📍 ${country}`}  onRemove={() => { setCountry(''); setPage(1); }} />}
                {city      && <ActiveFilterBadge label={`🏙️ ${city}`}     onRemove={() => { setCity('');    setPage(1); }} />}
                {priceRange && <ActiveFilterBadge label={PRICE_RANGES.find(p => p.value === priceRange)?.label} onRemove={() => { setPriceRange(''); setPage(1); }} />}
                {search    && <ActiveFilterBadge label={`"${search}"`}    onRemove={() => { setSearch('');  setPage(1); }} />}
                <button
                  onClick={resetFilters}
                  style={{ padding:'4px 12px', background:'none', border:'1px solid #ddd', borderRadius:'20px', fontSize:'12px', color:'#888', cursor:'pointer', fontWeight:'600' }}
                >
                  ✕ Tout effacer
                </button>
              </>
            )}
          </div>
          {!loading && (
            <span style={{ fontSize:'12px', color:'#aaa', fontWeight:'600' }}>
              {totalCount} prestataire{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Grille prestataires */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'24px', marginBottom:'40px' }}>
            {Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', color:'#888' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔍</div>
            <h3 style={{ fontSize:'18px', color:'#1a1a2e', marginBottom:'8px' }}>
              {lang === 'fr' ? 'Aucun prestataire trouvé' : 'No vendors found'}
            </h3>
            <p style={{ marginBottom:'20px' }}>
              {lang === 'fr' ? "Soyez le premier à rejoindre l'annuaire dans cette région !" : 'Be the first to join the directory in this region!'}
            </p>
            {hasActiveFilters && (
              <button onClick={resetFilters} style={{ marginRight:'12px', padding:'10px 24px', background:'white', color:'#1a1a2e', border:'1px solid #ddd', borderRadius:'10px', fontWeight:'700', cursor:'pointer', marginBottom:'10px' }}>
                Effacer les filtres
              </button>
            )}
            <button onClick={() => setShowRegister(true)} style={{ padding:'10px 24px', background:'#c9a84c', color:'#1a1a2e', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer' }}>
              {lang === 'fr' ? '+ Ajouter mon entreprise' : '+ Add my business'}
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'24px', marginBottom:'40px' }}>
            {vendors.map(vendor => (
              <VendorCard key={vendor._id} vendor={vendor} onContact={setContactVendor} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'8px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding:'8px 14px', borderRadius:'8px', border:'none', cursor: page === 1 ? 'not-allowed' : 'pointer', background:'white', color: page === 1 ? '#ccc' : '#1a1a2e', fontWeight:'700', boxShadow:'0 2px 6px rgba(0,0,0,0.06)' }}
            >
              ← Préc.
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p} onClick={() => setPage(p)}
                style={{ width:'36px', height:'36px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'14px', background: page === p ? '#1a1a2e' : 'white', color: page === p ? '#c9a84c' : '#555', boxShadow:'0 2px 6px rgba(0,0,0,0.06)' }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding:'8px 14px', borderRadius:'8px', border:'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', background:'white', color: page === totalPages ? '#ccc' : '#1a1a2e', fontWeight:'700', boxShadow:'0 2px 6px rgba(0,0,0,0.06)' }}
            >
              Suiv. →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default VendorsSection;

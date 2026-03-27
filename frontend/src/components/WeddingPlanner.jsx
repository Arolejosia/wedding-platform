import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API_URL from '../config/api';

const THEMES_PREDEFINIS = {
  Royal:  { bg: '#1a1a2e', accent: '#c9a84c', text: '#ffffff', bar: '#c9a84c', label: '👑 Royal' },
  Floral: { bg: '#fff0f5', accent: '#c2185b', text: '#3e1a2e', bar: '#c2185b', label: '🌸 Floral' },
  Luxury: { bg: '#0d0d0d', accent: '#d4af37', text: '#f5f0e8', bar: '#d4af37', label: '✨ Luxury' },
  Boho:   { bg: '#fdf6e3', accent: '#8b5e3c', text: '#3d2b1f', bar: '#8b5e3c', label: '🌿 Boho'  },
  Blanc:  { bg: '#ffffff', accent: '#0A2463', text: '#1a1a1a', bar: '#D4AF37', label: '🤍 Blanc Élégant' },
};
const PALETTE = ['#FF69B4','#FFD700','#4169E1','#32CD32','#FF6B6B','#9B59B6','#1ABC9C','#E67E22'];

const labelStyle = { fontSize:'11px', fontWeight:'700', color:'#555', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' };
const inputStyle = { width:'100%', border:'2px solid #e0e0e0', borderRadius:'10px', padding:'10px 14px', fontSize:'14px', background:'white', boxSizing:'border-box', outline:'none' };
const btnPrimary = { background:'linear-gradient(135deg, #c9a84c, #f0d080)', color:'#1a1a1a', border:'none', borderRadius:'10px', padding:'12px 20px', fontSize:'14px', fontWeight:'700', cursor:'pointer', boxShadow:'0 4px 16px #c9a84c30' };
const btnSecondary = { background:'#f5f5f5', color:'#555', border:'2px solid #e0e0e0', borderRadius:'10px', padding:'12px 20px', fontSize:'14px', fontWeight:'600', cursor:'pointer' };

const initCustomColors = () => ({ bg:'#1a1a2e', accent:'#c9a84c', text:'#ffffff', bar:'#c9a84c' });
const initSide = (name) => ({ name, themeMode:'predefini', themeKey:'Royal', customColors:initCustomColors(), totalPlaces:100, usedPlaces:0, categories:[] });
const resolveTheme = (side) => {
  if (side.themeMode === 'custom') return { bg:side.customColors.bg, accent:side.customColors.accent, text:side.customColors.text, bar:side.customColors.bar };
  return THEMES_PREDEFINIS[side.themeKey] || THEMES_PREDEFINIS.Royal;
};

// Normalise code : string OU objet {code,...} → string
const codeStr = (c) => (typeof c === 'string' ? c : c?.code || '');

// ── COMPOSANT PRINCIPAL ──
export default function WeddingPlanner() {
  const { weddingId } = useParams();
  const [wedding,    setWedding]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [josia,      setJosia]      = useState(initSide('Côté A'));
  const [ulrich,     setUlrich]     = useState(initSide('Côté B'));
  const [activeSide, setActiveSide] = useState('josia');
  const [activeTab,  setActiveTab]  = useState('codes');

  useEffect(() => { if (weddingId) initializePlanner(); }, [weddingId]); // eslint-disable-line

  const initializePlanner = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [weddingRes, plannerRes] = await Promise.all([
        fetch(`${API_URL}/weddings/${weddingId}`,         { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/weddings/${weddingId}/planner`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!weddingRes.ok) throw new Error('Erreur chargement wedding');
      const weddingData = await weddingRes.json();
      const w = weddingData.wedding;
      setWedding(w);
      const p1name = w?.couple?.person1?.firstName || 'Côté A';
      const p2name = w?.couple?.person2?.firstName || 'Côté B';
      if (plannerRes.ok) {
        const plannerData = await plannerRes.json();
        const planner = plannerData.planner || {};
        // Supporte sideA/sideB (MongoDB) ET josia/ulrich (legacy localStorage)
        const sideAData = planner.sideA || planner.josia || {};
        const sideBData = planner.sideB || planner.ulrich || {};
        setJosia({ ...initSide(p1name), ...sideAData, name: sideAData.name || p1name });
        setUlrich({ ...initSide(p2name), ...sideBData, name: sideBData.name || p2name });
      } else {
        setJosia(initSide(p1name));
        setUlrich(initSide(p2name));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Sauvegarde thème/config via PUT /planner ──
  const savePlanner = async (nextJosia = null, nextUlrich = null) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/weddings/${weddingId}/planner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sideA: nextJosia ?? josia, sideB: nextUlrich ?? ulrich }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur sauvegarde');
      const p1name = wedding?.couple?.person1?.firstName || 'Côté A';
      const p2name = wedding?.couple?.person2?.firstName || 'Côté B';
      if (data.planner?.sideA) setJosia({ ...initSide(p1name), ...data.planner.sideA });
      if (data.planner?.sideB) setUlrich({ ...initSide(p2name), ...data.planner.sideB });
      return data.planner;
    } catch (error) {
      console.error(error);
      alert(error.message || 'Erreur de sauvegarde');
      return null;
    } finally {
      setSaving(false);
    }
  };

const generateCodesBackend = async (sideKey, categoryId, count) => {
  try {
    const token = localStorage.getItem('token');

    // 1. Générer les codes dans le planner
    const res = await fetch(`${API_URL}/weddings/${weddingId}/planner/generate-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sideKey, categoryId, count }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Erreur génération'); return null; }

    const generated = data.generated || [];
    const plannerSide = sideKey === 'sideA' ? data.planner?.sideA : data.planner?.sideB;
    const cat = plannerSide?.categories?.find(c => c.id === categoryId);

    // 2. Sync avec collection Guest
    if (generated.length > 0) {
      const bulkRes = await fetch(`${API_URL}/weddings/${weddingId}/guests/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          codes: generated.map(item => ({
            code:          typeof item === 'string' ? item : item.code,
            ticketType:    cat?.ticketType || 'couple',
            categoryLabel: cat?.label || '',
          })),
        }),
      });
      const bulkData = await bulkRes.json();
      console.log('Bulk sync:', bulkData);
    }

    // 3. Mettre à jour l'état local
    const p1name = wedding?.couple?.person1?.firstName || 'Côté A';
    const p2name = wedding?.couple?.person2?.firstName || 'Côté B';
    if (data.planner?.sideA) setJosia({ ...initSide(p1name), ...data.planner.sideA });
    if (data.planner?.sideB) setUlrich({ ...initSide(p2name), ...data.planner.sideB });

    return generated;

  } catch (error) {
    console.error('generateCodesBackend error:', error);
    alert('Erreur de connexion');
    return null;
  }
};

  const getInfo = () => {
    if (!wedding) return {};
    const w = wedding, p1 = w.couple?.person1, p2 = w.couple?.person2;
    let dateStr = '';
    if (w.weddingDate) {
      try {
        const parts = w.weddingDate.split('T')[0].split('-');
        const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1])-1, Number(parts[2])));
        dateStr = d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' });
      } catch { dateStr = w.weddingDate; }
    }
    const lieu       = [w.venue?.name, w.venue?.city, w.venue?.country].filter(Boolean).join(', ');
    const nomMariee  = [p1?.firstName, p1?.lastName].filter(Boolean).join(' ') || 'Mariée';
    const nomMarie   = [p2?.firstName, p2?.lastName].filter(Boolean).join(' ') || 'Marié';
    const dressCode  = [w.dressCode?.theme, w.dressCode?.description].filter(Boolean).join(' — ') || '';
    const dressHomme = w.dressCode?.men   || '';
    const dressFemme = w.dressCode?.women || '';
    const events     = (w.eventInfo?.enabled && w.eventInfo?.events) ? w.eventInfo.events : [];
    const pay        = w.gifts?.paymentNumbers || {};
    const heroImage  = w.settings?.theme?.heroImage || '';
    return { nomMariee, nomMarie, dateStr, lieu, dressCode, dressHomme, dressFemme, events, pay, heroImage };
  };

  const getSide = () => activeSide === 'josia' ? josia : ulrich;
  const getSideKey = () => activeSide === 'josia' ? 'sideA' : 'sideB';
  const setSide = (fn) => activeSide === 'josia' ? setJosia(prev => fn(prev)) : setUlrich(prev => fn(prev));

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}><div style={{ textAlign:'center', color:'#888' }}><div style={{ fontSize:'32px', marginBottom:'12px' }}>💍</div><p>Chargement...</p></div></div>;
  if (!wedding) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}><div style={{ textAlign:'center', color:'#888' }}><div style={{ fontSize:'32px', marginBottom:'12px' }}>😔</div><p>Impossible de charger le mariage.</p></div></div>;

  const info = getInfo();
  const side = getSide();
  const t    = resolveTheme(side);

  return (
    <div style={{ fontFamily:'system-ui, sans-serif', minHeight:'100vh', background:'#f5f6fa' }}>

      <div style={{ background:'linear-gradient(135deg,#1a1a2e,#16213e)', padding:'20px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #c9a84c40' }}>
        <div>
          <h1 style={{ color:'#c9a84c', fontSize:'20px', fontWeight:'800', margin:0 }}>💍 MariagePlus — Invitations</h1>
          <p style={{ color:'#a0a8c0', fontSize:'12px', margin:'4px 0 0' }}>{info.nomMariee} & {info.nomMarie} · {info.dateStr} · {info.lieu}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {saving && <span style={{ color:'#c9a84c', fontSize:'12px' }}>💾 Sauvegarde...</span>}
          <a href={`/dashboard/${weddingId}/settings`} style={{ background:'transparent', border:'1px solid #c9a84c60', color:'#c9a84c', borderRadius:'8px', padding:'8px 14px', fontSize:'12px', textDecoration:'none' }}>⚙️ Settings</a>
        </div>
      </div>

      <div style={{ background:'#1a1a2e08', borderBottom:'1px solid #e0e0e0', padding:'10px 28px', display:'flex', gap:'20px', flexWrap:'wrap', alignItems:'center' }}>
        {[
          { icon:'📅', label:'Date',       value: info.dateStr   || '—' },
          { icon:'📍', label:'Lieu',       value: info.lieu      || '—' },
          { icon:'👗', label:'Dress Code', value: info.dressCode || '—' },
          { icon:'🎊', label:'Cérémonies', value: info.events?.length ? `${info.events.length} événement(s)` : '—' },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <span>{icon}</span>
            <span style={{ fontSize:'11px', color:'#888', textTransform:'uppercase', letterSpacing:'1px' }}>{label} :</span>
            <span style={{ fontSize:'12px', color:'#1a1a2e', fontWeight:'600' }}>{value}</span>
          </div>
        ))}
        <span style={{ fontSize:'11px', color:'#bbb', marginLeft:'auto' }}>✏️ Modifiable dans Settings</span>
      </div>

      <div style={{ display:'flex', gap:'12px', padding:'20px 28px 0' }}>
        {['josia','ulrich'].map(sid => {
          const s = sid === 'josia' ? josia : ulrich;
          const nom = sid === 'josia' ? info.nomMariee : info.nomMarie;
          const th = resolveTheme(s);
          const rem = s.totalPlaces - s.usedPlaces;
          const isActive = activeSide === sid;
          return (
            <button key={sid} onClick={() => setActiveSide(sid)} style={{ flex:1, padding:'16px 20px', borderRadius:'14px', cursor:'pointer', border:`2px solid ${isActive ? th.accent : '#e0e0e0'}`, background: isActive ? th.bg : 'white', color: isActive ? th.text : '#333', transition:'all 0.2s', textAlign:'left' }}>
              <div style={{ fontWeight:'800', fontSize:'16px', marginBottom:'4px' }}>{nom}</div>
              <div style={{ fontSize:'12px', opacity:0.8 }}>{rem} / {s.totalPlaces} places restantes</div>
              <div style={{ marginTop:'8px', height:'6px', borderRadius:'3px', background:'#00000020', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:'3px', width:`${Math.max(0,(s.usedPlaces/s.totalPlaces)*100)}%`, background: rem < 10 ? '#ef5350' : th.accent, transition:'width 0.3s' }} />
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display:'flex', gap:'8px', padding:'16px 28px 0' }}>
        {[{ key:'codes', label:'🎫 Codes' }, { key:'billets', label:'🖨️ Billets' }, { key:'config', label:'⚙️ Config' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'600', border: activeTab === tab.key ? '2px solid #c9a84c' : '2px solid #e0e0e0', background: activeTab === tab.key ? '#1a1a2e' : 'white', color: activeTab === tab.key ? '#c9a84c' : '#555' }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ padding:'20px 28px' }}>
        {activeTab === 'codes'   && <CodesTab side={side} setSide={setSide} sideKey={getSideKey()} weddingId={weddingId} generateCodesBackend={generateCodesBackend} savePlanner={savePlanner} josia={josia} ulrich={ulrich} nomSide={activeSide === 'josia' ? info.nomMariee : info.nomMarie} t={t} />}
        {activeTab === 'billets' && <BilletsTab side={side} info={info} t={t} />}
        {activeTab === 'config'  && <ConfigTab side={side} setSide={setSide} savePlanner={savePlanner} activeSide={activeSide} josia={josia} ulrich={ulrich} />}
      </div>
    </div>
  );
}

// ── ConfigTab ──
function ConfigTab({ side, setSide, savePlanner, activeSide, josia, ulrich }) {
  const isCustom = side.themeMode === 'custom';
  const handleSave = () => {
    if (activeSide === 'josia') savePlanner(side, null);
    else savePlanner(null, side);
  };
  return (
    <div style={{ maxWidth:'560px', display:'flex', flexDirection:'column', gap:'16px' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#1a1a2e', marginBottom:'16px' }}>🎟️ Places disponibles</h3>
        <label style={labelStyle}>Nombre total de places</label>
        <input type="number" min="1" value={side.totalPlaces} onChange={e => setSide(p => ({ ...p, totalPlaces: Number(e.target.value) }))} style={inputStyle} />
      </div>
      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#1a1a2e', marginBottom:'16px' }}>🎨 Thème du billet</h3>
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
          {[{ key:'predefini', label:'Thèmes prédéfinis' }, { key:'custom', label:'Couleurs personnalisées' }].map(opt => (
            <button key={opt.key} onClick={() => setSide(p => ({ ...p, themeMode: opt.key }))} style={{ flex:1, padding:'10px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'600', border: side.themeMode === opt.key ? '2px solid #c9a84c' : '2px solid #e0e0e0', background: side.themeMode === opt.key ? '#1a1a2e' : 'white', color: side.themeMode === opt.key ? '#c9a84c' : '#555' }}>{opt.label}</button>
          ))}
        </div>
        {!isCustom && (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {Object.entries(THEMES_PREDEFINIS).map(([key, th]) => (
              <div key={key} onClick={() => setSide(p => ({ ...p, themeKey: key }))} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'12px', cursor:'pointer', border:`2px solid ${side.themeKey === key ? th.accent : '#e0e0e0'}`, background: side.themeKey === key ? th.bg : '#fafafa', transition:'all 0.15s' }}>
                <div style={{ width:'48px', height:'30px', borderRadius:'6px', background:th.bg, border:`2px solid ${th.accent}`, flexShrink:0, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'4px', background:th.bar }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'4px', background:th.bar }} />
                </div>
                <span style={{ fontSize:'13px', fontWeight:'600', color: side.themeKey === key ? th.text : '#333' }}>{th.label}</span>
                {side.themeKey === key && <span style={{ marginLeft:'auto', color:th.accent, fontWeight:'800' }}>✓</span>}
              </div>
            ))}
          </div>
        )}
        {isCustom && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              {[{ key:'bg', label:'🖼️ Fond' }, { key:'accent', label:'✨ Accent' }, { key:'text', label:'🔤 Texte' }, { key:'bar', label:'📏 Barres' }].map(({ key, label }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <input type="color" value={side.customColors[key] || '#000000'} onChange={e => setSide(p => ({ ...p, customColors: { ...p.customColors, [key]: e.target.value } }))} style={{ width:'48px', height:'40px', border:'2px solid #e0e0e0', borderRadius:'8px', cursor:'pointer', padding:'2px' }} />
                    <input type="text" value={side.customColors[key] || ''} onChange={e => setSide(p => ({ ...p, customColors: { ...p.customColors, [key]: e.target.value } }))} placeholder="#000000" style={{ ...inputStyle, flex:1 }} />
                  </div>
                </div>
              ))}
            </div>
            <label style={labelStyle}>Aperçu</label>
            <div style={{ background: side.customColors.bg || '#1a1a2e', borderRadius:'12px', overflow:'hidden', border:`2px solid ${side.customColors.accent || '#c9a84c'}60` }}>
              <div style={{ height:'6px', background: side.customColors.bar || '#c9a84c' }} />
              <div style={{ padding:'16px 20px' }}>
                <div style={{ fontWeight:'700', fontSize:'18px', color: side.customColors.text || '#ffffff', marginBottom:'4px' }}>Josia & Ulrich</div>
                <div style={{ fontFamily:'monospace', fontSize:'18px', fontWeight:'800', color: side.customColors.accent || '#c9a84c', letterSpacing:'4px', background:`${side.customColors.accent || '#c9a84c'}18`, padding:'6px 12px', borderRadius:'6px', display:'inline-block' }}>JF01</div>
              </div>
              <div style={{ height:'6px', background: side.customColors.bar || '#c9a84c' }} />
            </div>
          </div>
        )}
      </div>
      <button onClick={handleSave} style={{ ...btnPrimary, alignSelf:'flex-start', padding:'12px 28px' }}>
        💾 Enregistrer la configuration
      </button>
    </div>
  );
}

// ── CodesTab ──
function CodesTab({ side, setSide, sideKey, weddingId, generateCodesBackend, savePlanner, josia, ulrich, nomSide, t }) {
  const [newCatLabel,     setNewCatLabel]     = useState('');
  const [newCatPrefix,    setNewCatPrefix]    = useState('');
  const [newCatColor,     setNewCatColor]     = useState(PALETTE[0]);
  const [newCatTicketType,setNewCatTicketType]= useState('couple');
  const [showAddCat,      setShowAddCat]      = useState(false);
  const [genCatId,        setGenCatId]        = useState('');
  const [genCount,        setGenCount]        = useState(1);
  const [lastGenerated,   setLastGenerated]   = useState([]);
  const [generating,      setGenerating]      = useState(false);

  const remaining = side.totalPlaces - side.usedPlaces;

  // Ajoute catégorie puis sauvegarde en MongoDB
  const addCategory = async () => {
    if (!newCatLabel.trim() || !newCatPrefix.trim()) { alert('Remplissez le nom et le préfixe'); return; }
    if (newCatPrefix.length < 1 || newCatPrefix.length > 3) { alert('Le préfixe doit faire 1 à 3 lettres'); return; }
    const newCat = { id: Date.now().toString(), label: newCatLabel.trim(), prefix: newCatPrefix.toUpperCase().trim(), color: newCatColor, ticketType: newCatTicketType, codes: [] };
    const nextSide = { ...side, categories: [...side.categories, newCat] };
    if (sideKey === 'sideA') await savePlanner(nextSide, null);
    else await savePlanner(null, nextSide);
    setNewCatLabel(''); setNewCatPrefix(''); setNewCatColor(PALETTE[0]); setNewCatTicketType('couple'); setShowAddCat(false);
  };

  // Supprime catégorie puis sauvegarde
  const deleteCategory = async (catId) => {
    if (!window.confirm('Supprimer cette catégorie et tous ses codes ?')) return;
    const cat = side.categories.find(c => c.id === catId);
    const freedPlaces = cat ? cat.codes.length * (cat.ticketType === 'couple' ? 2 : 1) : 0;
    const nextSide = { ...side, usedPlaces: Math.max(0, side.usedPlaces - freedPlaces), categories: side.categories.filter(c => c.id !== catId) };
    if (sideKey === 'sideA') await savePlanner(nextSide, null);
    else await savePlanner(null, nextSide);
  };

  // Génère les codes via backend
  const generateCodes = async () => {
    if (!genCatId) { alert('Sélectionnez une catégorie'); return; }
    if (genCount < 1) { alert('Entrez un nombre valide'); return; }
    setGenerating(true);
    const generated = await generateCodesBackend(sideKey, genCatId, genCount);
    if (generated) {
      setLastGenerated(generated.map(item => codeStr(item)));
    }
    setGenerating(false);
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#1a1a2e', margin:0 }}>📁 Catégories de {nomSide}</h3>
          <button onClick={() => setShowAddCat(!showAddCat)} style={{ background:'#1a1a2e', color:'#c9a84c', border:'none', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>+ Ajouter</button>
        </div>

        {showAddCat && (
          <div style={{ background:'white', borderRadius:'14px', padding:'18px', marginBottom:'14px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', border:'2px solid #c9a84c40' }}>
            <h4 style={{ margin:'0 0 14px', fontSize:'14px', color:'#1a1a2e' }}>Nouvelle catégorie</h4>
            <div style={{ marginBottom:'10px' }}><label style={labelStyle}>Nom</label><input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} style={inputStyle} placeholder="Famille, Amis..." /></div>
            <div style={{ marginBottom:'10px' }}><label style={labelStyle}>Préfixe (1-3 lettres)</label><input value={newCatPrefix} onChange={e => setNewCatPrefix(e.target.value.toUpperCase())} maxLength={3} style={inputStyle} placeholder="JF" /></div>
            <div style={{ marginBottom:'14px' }}>
              <label style={labelStyle}>Type de billet</label>
              <div style={{ display:'flex', gap:'8px' }}>
                {['couple', 'simple'].map(type => (
                  <button key={type} type="button" onClick={() => setNewCatTicketType(type)} style={{ flex:1, padding:'10px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'600', border: newCatTicketType === type ? '2px solid #c9a84c' : '2px solid #e0e0e0', background: newCatTicketType === type ? '#1a1a2e' : 'white', color: newCatTicketType === type ? '#c9a84c' : '#555' }}>
                    {type === 'couple' ? '👥 Couple' : '👤 Simple'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={labelStyle}>Couleur</label>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>{PALETTE.map(c => <div key={c} onClick={() => setNewCatColor(c)} style={{ width:'28px', height:'28px', borderRadius:'50%', background:c, cursor:'pointer', border: newCatColor === c ? '3px solid #1a1a2e' : '3px solid transparent' }} />)}</div>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={addCategory} style={{ ...btnPrimary, flex:1 }}>✅ Créer</button>
              <button onClick={() => setShowAddCat(false)} style={{ ...btnSecondary, flex:1 }}>Annuler</button>
            </div>
          </div>
        )}

        {side.categories.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#aaa', background:'white', borderRadius:'14px' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>📁</div>
            <p>Aucune catégorie. Créez-en une pour commencer.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {side.categories.map(cat => (
              <div key={cat.id} style={{ background:'white', borderRadius:'12px', padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', borderLeft:`4px solid ${cat.color}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:'700', fontSize:'14px', color:'#1a1a2e' }}>{cat.label}</div>
                  <div style={{ fontSize:'12px', color:'#888', marginTop:'2px' }}>
                    Préfixe : <b style={{ color:cat.color }}>{cat.prefix}</b> — {cat.codes.length} code(s)
                    {' · '}
                    <span style={{ background: cat.ticketType === 'couple' ? '#e3f2fd' : '#f3e5f5', color: cat.ticketType === 'couple' ? '#1565c0' : '#6a1b9a', padding:'1px 6px', borderRadius:'4px', fontSize:'11px', fontWeight:'700' }}>
                      {cat.ticketType === 'couple' ? '👥 Couple' : '👤 Simple'}
                    </span>
                  </div>
                  {cat.codes.length > 0 && (
                    <div style={{ marginTop:'6px', display:'flex', gap:'4px', flexWrap:'wrap' }}>
                      {cat.codes.slice(-5).map(c => (
                        <span key={codeStr(c)} style={{ fontSize:'11px', fontFamily:'monospace', fontWeight:'700', background:cat.color+'20', color:cat.color, padding:'2px 6px', borderRadius:'4px' }}>{codeStr(c)}</span>
                      ))}
                      {cat.codes.length > 5 && <span style={{ fontSize:'11px', color:'#aaa' }}>+{cat.codes.length - 5}</span>}
                    </div>
                  )}
                </div>
                <button onClick={() => deleteCategory(cat.id)} style={{ background:'#fff0f0', color:'#ef5350', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', fontSize:'14px' }}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={{ background: remaining < 10 ? '#fff0f0' : 'white', borderRadius:'14px', padding:'20px', marginBottom:'16px', border:`2px solid ${remaining < 10 ? '#ef535040' : '#c9a84c40'}`, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize:'12px', color:'#888', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'1px' }}>Places restantes — {nomSide}</div>
          <div style={{ fontSize:'36px', fontWeight:'800', color: remaining < 10 ? '#ef5350' : '#1a1a2e' }}>{remaining}<span style={{ fontSize:'16px', color:'#aaa', fontWeight:'400' }}> / {side.totalPlaces}</span></div>
          <div style={{ marginTop:'10px', height:'8px', borderRadius:'4px', background:'#f0f0f0', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:'4px', width:`${(side.usedPlaces/side.totalPlaces)*100}%`, background: remaining < 10 ? '#ef5350' : t.accent, transition:'width 0.3s' }} />
          </div>
          {genCatId && (() => {
            const cat = side.categories.find(c => c.id === genCatId);
            if (!cat) return null;
            const placesParCode = cat.ticketType === 'couple' ? 2 : 1;
            return <div style={{ fontSize:'12px', color:'#888', marginTop:'6px' }}>= <b>{Math.floor(remaining / placesParCode)}</b> code(s) {cat.ticketType} disponibles</div>;
          })()}
        </div>

        <div style={{ background:'white', borderRadius:'14px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:'16px' }}>
          <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#1a1a2e', marginBottom:'16px' }}>🎫 Générer des codes</h3>
          <div style={{ marginBottom:'12px' }}>
            <label style={labelStyle}>Catégorie</label>
            <select value={genCatId} onChange={e => setGenCatId(e.target.value)} style={inputStyle}>
              <option value="">Sélectionner...</option>
              {side.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label} ({cat.prefix})</option>)}
            </select>
          </div>
          <div style={{ marginBottom:'16px' }}>
            <label style={labelStyle}>Nombre de codes</label>
            <input type="number" min="1" max={remaining} value={genCount} onChange={e => setGenCount(Number(e.target.value))} style={inputStyle} />
            {genCatId && (() => {
              const cat = side.categories.find(c => c.id === genCatId);
              if (!cat) return null;
              const placesParCode = cat.ticketType === 'couple' ? 2 : 1;
              return (
                <div style={{ fontSize:'11px', color:'#888', marginTop:'4px' }}>
                  Prochain : <b style={{ color:'#1a1a2e' }}>{`${cat.prefix}${String(cat.codes.length + 1).padStart(2, '0')}`}</b>
                  {' · '}
                  <span style={{ color:'#c9a84c', fontWeight:'600' }}>{genCount * placesParCode} place(s) utilisée(s)</span>
                </div>
              );
            })()}
          </div>
          <button onClick={generateCodes} disabled={!genCatId || remaining === 0 || generating} style={{ ...btnPrimary, width:'100%', opacity:(!genCatId || remaining === 0 || generating) ? 0.5 : 1, cursor:(!genCatId || remaining === 0 || generating) ? 'not-allowed' : 'pointer' }}>
            {generating ? '⏳ Génération...' : `✅ Générer ${genCount} code(s)`}
          </button>
        </div>

        {lastGenerated.length > 0 && (
          <div style={{ background:'#f0fff4', borderRadius:'14px', padding:'16px', border:'2px solid #26a69a40' }}>
            <div style={{ fontSize:'13px', fontWeight:'700', color:'#26a69a', marginBottom:'10px' }}>✅ {lastGenerated.length} code(s) générés :</div>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {lastGenerated.map(c => <span key={c} style={{ fontFamily:'monospace', fontWeight:'800', fontSize:'16px', background:'#26a69a20', color:'#26a69a', padding:'4px 10px', borderRadius:'6px', letterSpacing:'2px' }}>{c}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PARTIE 2 : Designs HTML + BilletsTab ──
// Voir WeddingPlanner_PART2.jsx — coller à la suite de ce fichier
// ════════════════════════════════════════════════════════════════
// WeddingPlanner_PART2.jsx
// À COLLER à la suite de WeddingPlanner_PART1.jsx
// (supprimez le commentaire final de PART1 avant de fusionner)
// ════════════════════════════════════════════════════════════════

// ── SCRIPT PDF UNIVERSEL ──
const makePdfScript = (code, billetWidth = 750) => `
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
<script>
window.addEventListener('load', function() {
  var btn = document.getElementById('btnPDF');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var el=document.getElementById('billet'),toolbar=document.querySelector('.no-print'),spacer=document.querySelector('.spacer-top'),self=this;
    self.textContent='⏳ Génération...';self.disabled=true;
    if(toolbar)toolbar.style.display='none';if(spacer)spacer.style.display='none';
    document.body.style.padding='0';document.body.style.margin='0';document.body.style.background='transparent';document.body.style.minWidth='${billetWidth}px';
    requestAnimationFrame(function(){
      document.documentElement.style.width='${billetWidth}px';document.body.style.width='${billetWidth}px';document.body.style.overflow='hidden';
      setTimeout(function(){
        var w=${billetWidth},h=el.offsetHeight;
        html2pdf().set({margin:0,filename:'invitation-${code}.pdf',image:{type:'jpeg',quality:0.98},html2canvas:{scale:2,useCORS:true,allowTaint:true,logging:false,backgroundColor:null,width:w,height:h,windowWidth:w,windowHeight:h,scrollX:0,scrollY:0},jsPDF:{unit:'px',format:[w,h],orientation:'portrait',hotfixes:['px_scaling']}}).from(el).save().then(function(){
          document.documentElement.style.width='';document.body.style.width='';document.body.style.overflow='';
          if(toolbar)toolbar.style.display='';if(spacer)spacer.style.display='';
          document.body.style.padding=document.body.style.margin=document.body.style.background=document.body.style.minWidth='';
          self.textContent='⬇️ Exporter en PDF';self.disabled=false;
        }).catch(function(e){console.error(e);if(toolbar)toolbar.style.display='';if(spacer)spacer.style.display='';document.body.style.minWidth='';self.textContent='⬇️ Exporter en PDF';self.disabled=false;});
      },150);
    });
  });
});
<\/script>`;

const DESIGNS = {
  magazine:  { label:'📸 Magazine Cover',     desc:'Photo hero en fond, style couverture de magazine' },
  luxe:      { label:'👑 Grand Luxe',         desc:'Noms en grand, ornements dorés, très élégant' },
  editorial: { label:'🎨 Magazine Éditorial', desc:'Layout moderne, blocs colorés, très contrasté' },
  parchemin: { label:'📜 Parchemin Classique',desc:'Style carton physique, bordures ornées, classique' },
  classique: { label:'🕊️ Classique Élégant', desc:'Icônes par cérémonie, typographie manuscrite, style carton' },
};

const buildPayMethods = (pay) => [
  pay.mtnMoMo     && { ico:'📱', lbl:'MTN MoMo',    val:pay.mtnMoMo,     nm:pay.mtnName     },
  pay.orangeMoney && { ico:'🍊', lbl:'Orange Money', val:pay.orangeMoney,  nm:pay.orangeName  },
  pay.interac     && { ico:'🏦', lbl:'Interac',      val:pay.interac,      nm:pay.interacName },
  pay.paypal      && { ico:'🅿️', lbl:'PayPal',       val:pay.paypal,       nm:pay.paypalName  },
  pay.bankAccount && { ico:'🏛️', lbl:pay.bankName||'Banque', val:pay.bankAccount, nm:pay.bankHolder },
].filter(Boolean);



const TOOLBAR = (code, nomMariee, nomMarie) => `
<div class="no-print">
  <span style="color:white;font-size:13px;font-weight:600;letter-spacing:1px;">💍 ${nomMariee} &amp; ${nomMarie} — Billet ${code}</span>
  <div style="display:flex;gap:10px;">
    <button id="btnPDF" style="background:#c9a84c;color:#111;border:none;padding:9px 22px;border-radius:6px;font-weight:800;cursor:pointer;font-size:13px;">⬇️ Exporter en PDF</button>
    <button onclick="window.print()" style="background:transparent;color:white;border:1px solid rgba(255,255,255,0.3);padding:9px 16px;border-radius:6px;cursor:pointer;font-size:13px;">🖨️ Imprimer</button>
    <button onclick="window.close()" style="background:transparent;color:white;border:1px solid rgba(255,255,255,0.3);padding:9px 16px;border-radius:6px;cursor:pointer;font-size:13px;">✕</button>
  </div>
</div>
<div class="spacer-top"></div>`;

// ── HELPERS BILLETS — coller juste avant buildMagazine ──────────────────────

// Badge dress code visuel
const buildDressCodeBadges = (info, t) => {
  if (!info.dressCode && !info.dressHomme && !info.dressFemme) return '';
  return `
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;">
      ${info.dressCode ? `
        <div style="display:flex;align-items:center;gap:8px;background:${t.accent}15;border:1px solid ${t.accent}40;border-radius:8px;padding:10px 14px;flex:1;min-width:160px;">
          <span style="font-size:22px;">👗</span>
          <div>
            <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:${t.accent};margin-bottom:2px;">Tenue soirée</div>
            <div style="font-size:12px;font-weight:700;color:${t.text};">${info.dressCode}</div>
          </div>
        </div>` : ''}
      ${info.dressHomme ? `
        <div style="display:flex;align-items:center;gap:8px;background:${t.accent}10;border:1px solid ${t.accent}30;border-radius:8px;padding:10px 14px;flex:1;min-width:140px;">
          <span style="font-size:22px;">👔</span>
          <div>
            <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:${t.accent};margin-bottom:2px;">Messieurs</div>
            <div style="font-size:12px;font-weight:700;color:${t.text};">${info.dressHomme}</div>
          </div>
        </div>` : ''}
      ${info.dressFemme ? `
        <div style="display:flex;align-items:center;gap:8px;background:${t.accent}10;border:1px solid ${t.accent}30;border-radius:8px;padding:10px 14px;flex:1;min-width:140px;">
          <span style="font-size:22px;">💃</span>
          <div>
            <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:${t.accent};margin-bottom:2px;">Mesdames</div>
            <div style="font-size:12px;font-weight:700;color:${t.text};">${info.dressFemme}</div>
          </div>
        </div>` : ''}
    </div>`;
};

// Séparateur élégant entre sections
const buildSeparateur = (t, label = '') => `
  <div style="display:flex;align-items:center;gap:12px;margin:18px 0 14px;">
    <div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,${t.accent}50);"></div>
    ${label ? `<span style="font-size:8px;letter-spacing:4px;text-transform:uppercase;color:${t.accent};font-weight:700;white-space:nowrap;">${label}</span>` : `<span style="color:${t.accent};font-size:12px;letter-spacing:6px;">✦ ✦ ✦</span>`}
    <div style="flex:1;height:1px;background:linear-gradient(90deg,${t.accent}50,transparent);"></div>
  </div>`;

// Footer famille en évidence
const buildFamilleFooter = (cat, code, t, nomMariee, nomMarie) => {
  const familleLabel = cat?.label ? `FAMILLE ${cat.label.toUpperCase()}` : '';
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0 4px;border-top:2px solid ${t.accent}40;margin-top:14px;">
      <div>
        <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:${t.accent}70;margin-bottom:6px;">CODE D'ENTRÉE :</div>
        <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:800;color:${t.accent};letter-spacing:6px;background:${t.accent}15;padding:8px 14px;border:1px solid ${t.accent}40;display:inline-block;">${code}</div>
      </div>
      ${familleLabel ? `
        <div style="text-align:right;">
          <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:${t.accent}70;margin-bottom:6px;">Invitation de :</div>
          <div style="font-size:14px;font-weight:800;color:${t.accent};letter-spacing:2px;text-transform:uppercase;border:2px solid ${t.accent}50;padding:8px 16px;background:${t.accent}10;">🎊 ${familleLabel}</div>
        </div>` : ''}
    </div>`;
};

// ── MAGAZINE ──
const buildMagazine = (t, info, cat, nom1, nom2, code) => {
  const pay=info.pay||{}, methods=buildPayMethods(pay), hasBg=!!info.heroImage;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Billet ${code}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600;700&display=swap" rel="stylesheet">
${makePdfScript(code,750)}
<style>*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}html,body{background:#111;font-family:'Montserrat',sans-serif;}@media print{.no-print{display:none!important;}body{background:transparent;padding:0;}@page{margin:0;size:750px auto;}}
.no-print{position:fixed;top:0;left:0;right:0;background:rgba(0,0,0,0.92);padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:9999;}.spacer-top{height:56px;}
#billet{width:750px;background:${t.bg};position:relative;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.8);margin:0 auto;}
.cover{position:relative;height:480px;overflow:hidden;${hasBg?`background:url('${info.heroImage}') center/cover no-repeat;`:`background:linear-gradient(160deg,${t.bg} 0%,#2a2a2a 100%);`}}
.cover-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.55) 0%,rgba(0,0,0,.1) 35%,rgba(0,0,0,.55) 65%,rgba(0,0,0,.96) 100%);}
.cover-top{position:absolute;top:22px;left:28px;right:28px;z-index:3;display:flex;justify-content:space-between;align-items:flex-start;}
.cover-invite-tag{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.75);font-weight:600;line-height:1.7;}
.cover-date-box{text-align:right;background:rgba(0,0,0,.45);border:1px solid ${t.accent}70;padding:10px 16px;}
.cover-date-label{font-size:8px;letter-spacing:4px;text-transform:uppercase;color:${t.accent};margin-bottom:4px;}
.cover-date-big{font-family:'Bebas Neue',sans-serif;font-size:22px;color:white;letter-spacing:2px;line-height:1.1;}
.cover-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;text-align:center;width:100%;}
.mariage-word{font-family:'Bebas Neue',sans-serif;font-size:130px;color:white;line-height:1;letter-spacing:10px;text-shadow:0 4px 30px rgba(0,0,0,.5);opacity:.90;}
.noms-cover{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:white;letter-spacing:2px;text-shadow:0 2px 10px rgba(0,0,0,.6);margin-top:6px;}
.noms-et{font-style:italic;color:${t.accent};margin:0 10px;font-size:28px;}
.cover-bottom{position:absolute;bottom:0;left:0;right:0;z-index:3;padding:0 28px 22px;}
.invite-code-row{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,.2);padding-top:14px;}
.invite-lbl-cover{font-size:8px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:5px;}
.invite-nom-cover{font-family:'Playfair Display',serif;font-size:34px;color:white;font-weight:800;}
.code-cover-bloc{text-align:right;}.code-cover-lbl{font-size:8px;letter-spacing:4px;text-transform:uppercase;color:${t.accent};margin-bottom:5px;}
.code-cover{font-family:'Courier New',monospace;font-size:26px;font-weight:800;color:${t.accent};letter-spacing:6px;background:rgba(0,0,0,.6);padding:8px 16px;border:2px solid ${t.accent}80;display:inline-block;}
.corps{padding:24px 30px 22px;}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
.info-bloc{background:${t.accent}10;border-left:3px solid ${t.accent};padding:12px 14px;}.info-bloc.full{grid-column:span 2;}
.info-lbl{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:4px;}.info-val{font-size:13px;color:${t.text};font-weight:600;line-height:1.4;}
.section-titre{font-size:8px;letter-spacing:4px;text-transform:uppercase;color:${t.accent};font-weight:700;margin-bottom:10px;}
.ev-list{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;}.ev-row{display:flex;gap:12px;align-items:flex-start;}
.ev-time{font-family:'Bebas Neue',sans-serif;font-size:24px;color:${t.accent};min-width:54px;line-height:1;}
.ev-line{width:1px;background:${t.accent}30;margin:3px 0;align-self:stretch;flex-shrink:0;}.ev-content{flex:1;padding-bottom:6px;}
.ev-name{font-size:13px;font-weight:700;color:${t.text};}.ev-loc{font-size:11px;color:${t.text};opacity:.55;margin-top:1px;}.ev-dress{font-size:10px;color:${t.accent}70;margin-top:2px;}
.pay-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}.pay-it{display:flex;gap:8px;background:${t.accent}08;padding:10px 12px;align-items:center;}
.pay-ico{font-size:16px;}.pay-lb{font-size:8px;text-transform:uppercase;letter-spacing:1px;color:${t.accent}70;}.pay-vl{font-size:12px;font-weight:700;color:${t.text};word-break:break-all;}.pay-nm{font-size:10px;color:${t.text};opacity:.4;}
.pied{text-align:center;padding:12px 0 4px;border-top:1px solid ${t.accent}20;font-size:9px;color:${t.accent}60;letter-spacing:3px;text-transform:uppercase;}
</style></head><body>
${TOOLBAR(code, info.nomMariee, info.nomMarie)}
<div id="billet">
  <div class="cover"><div class="cover-overlay"></div>
    <div class="cover-top"><div class="cover-invite-tag">Venez vous joindre<br>à nous pour...</div><div class="cover-date-box"><div class="cover-date-label">Date du mariage</div><div class="cover-date-big">${info.dateStr||'—'}</div></div></div>
    <div class="cover-center"><div class="mariage-word">MARIAGE</div><div class="noms-cover">${info.nomMariee}<span class="noms-et">&amp;</span>${info.nomMarie}</div></div>
    <div class="cover-bottom"><div class="invite-code-row"><div><div class="invite-lbl-cover">Invitation remise à</div><div class="invite-nom-cover">${nom1||'—'}${nom2?` &amp; ${nom2}`:''}</div></div><div class="code-cover-bloc"><div class="code-cover-lbl">Code d'invitation</div><div class="code-cover">${code}</div></div></div></div>
  </div>
  <div class="corps">
    ${info.lieu?`<div class="info-grid"><div class="info-bloc full"><div class="info-lbl">📍 Lieu</div><div class="info-val">${info.lieu}</div></div></div>`:''}
    ${(info.dressCode||info.dressHomme||info.dressFemme)?`<div class="info-grid">${info.dressCode?`<div class="info-bloc full"><div class="info-lbl">👗 Dress Code</div><div class="info-val">${info.dressCode}</div></div>`:''} ${info.dressHomme?`<div class="info-bloc"><div class="info-lbl">👔 Messieurs</div><div class="info-val">${info.dressHomme}</div></div>`:''} ${info.dressFemme?`<div class="info-bloc"><div class="info-lbl">👗 Mesdames</div><div class="info-val">${info.dressFemme}</div></div>`:''}</div>`:''}
    ${info.events?.length?`<div class="section-titre">🎊 Programme</div><div class="ev-list">${info.events.map(ev=>`<div class="ev-row"><div class="ev-time">${ev.time||'—'}</div><div class="ev-line"></div><div class="ev-content"><div class="ev-name">${ev.title||ev.type||''}</div><div class="ev-loc">${[ev.location,ev.address].filter(Boolean).join(', ')}</div>${ev.dressCode?`<div class="ev-dress">👗 ${ev.dressCode}</div>`:''}</div></div>`).join('')}</div>`:''}
    ${methods.length?`<div class="section-titre">🎁 Cadeaux &amp; Contributions</div>${pay.message?`<div style="font-size:10px;color:${t.text};opacity:.55;font-style:italic;margin-bottom:8px;">${pay.message}</div>`:''}<div class="pay-grid">${methods.map(m=>`<div class="pay-it"><div class="pay-ico">${m.ico}</div><div><div class="pay-lb">${m.lbl}</div><div class="pay-vl">${m.val}</div>${m.nm?`<div class="pay-nm">${m.nm}</div>`:''}</div></div>`).join('')}</div>`:''}
    <div class="pied">Mariage · ${info.nomMariee} &amp; ${info.nomMarie}</div>
  </div>
</div></body></html>`;
};

// ── LUXE ──
const buildLuxe = (t, info, cat, nom1, nom2, code) => {
  const pay=info.pay||{}, methods=buildPayMethods(pay);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Billet ${code}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cormorant+Garamond:wght@300;400;600&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
${makePdfScript(code,700)}
<style>*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}html,body{background:#111;font-family:'Lato',sans-serif;}@media print{.no-print{display:none!important;}body{background:transparent;padding:0;}@page{margin:0;size:720px auto;}}
.no-print{position:fixed;top:0;left:0;right:0;background:rgba(0,0,0,0.92);padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:9999;font-family:sans-serif;}.spacer-top{height:56px;}
#billet{width:700px;background:${t.bg};position:relative;box-shadow:0 40px 100px rgba(0,0,0,.6);margin:0 auto;}#billet::before{content:'';position:absolute;inset:10px;border:1px solid ${t.accent}50;pointer-events:none;z-index:10;}
.bar-top{height:10px;background:linear-gradient(90deg,${t.bar}00,${t.bar},${t.bar}00);}.bar-thin{height:3px;background:linear-gradient(90deg,${t.bar}00,${t.bar}60,${t.bar}00);margin-top:2px;}
.content{padding:44px 56px;}.tag{text-align:center;font-size:9px;letter-spacing:6px;text-transform:uppercase;color:${t.accent};font-family:'Cormorant Garamond',serif;display:flex;align-items:center;gap:12px;margin-bottom:28px;}
.tag::before,.tag::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,${t.accent}60);}.tag::after{background:linear-gradient(90deg,${t.accent}60,transparent);}
.noms{text-align:center;margin-bottom:6px;}.nom-big{font-family:'Playfair Display',serif;font-size:62px;font-weight:900;color:${t.text};line-height:1;letter-spacing:-1px;}
.et{font-family:'Playfair Display',serif;font-size:28px;font-style:italic;color:${t.accent};display:block;margin:6px 0;}
.date-box{text-align:center;margin:22px 0;padding:16px;background:linear-gradient(135deg,${t.accent}18,${t.accent}06);border:1px solid ${t.accent}30;}
.date-big{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:${t.accent};letter-spacing:3px;text-transform:uppercase;}
.lieu-sm{font-size:12px;color:${t.text};opacity:.65;margin-top:5px;letter-spacing:2px;text-transform:uppercase;}
.orn{text-align:center;margin:18px 0;color:${t.accent};font-size:16px;letter-spacing:10px;}
.inv-lbl{text-align:center;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${t.accent}70;margin-bottom:8px;}
.inv-nom{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;color:${t.text};text-align:center;padding-bottom:12px;border-bottom:1px solid ${t.accent}40;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0;}.bloc{background:${t.accent}08;border:1px solid ${t.accent}22;padding:13px 15px;position:relative;}
.bloc::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:${t.accent};}.bloc.full{grid-column:span 2;}
.bloc-lbl{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:5px;}.bloc-val{font-size:12px;color:${t.text};font-weight:600;line-height:1.5;}
.prog-titre{text-align:center;font-size:9px;letter-spacing:5px;text-transform:uppercase;color:${t.accent};margin:20px 0 12px;}
.ev-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-bottom:18px;}
.ev{background:${t.accent}08;border:1px solid ${t.accent}25;padding:12px 14px;position:relative;overflow:hidden;}.ev::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:${t.bar};}
.ev-h{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:${t.accent};}.ev-n{font-size:12px;font-weight:700;color:${t.text};margin:3px 0 2px;}.ev-l{font-size:11px;color:${t.text};opacity:.55;}.ev-d{font-size:10px;color:${t.accent}70;margin-top:3px;font-style:italic;}
.pay-titre{text-align:center;font-size:9px;letter-spacing:5px;text-transform:uppercase;color:${t.accent};margin:16px 0 10px;}
.pay-msg{text-align:center;font-size:11px;color:${t.text};opacity:.6;font-style:italic;margin-bottom:10px;}
.pay-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:8px;margin-bottom:18px;}
.pay{background:${t.accent}08;border:1px solid ${t.accent}20;padding:10px 12px;display:flex;gap:8px;}.pay-i{font-size:16px;}.pay-l{font-size:8px;text-transform:uppercase;letter-spacing:1px;color:${t.accent}80;}.pay-v{font-size:11px;font-weight:700;color:${t.text};word-break:break-all;}.pay-n{font-size:10px;color:${t.text};opacity:.45;}
.footer{display:flex;justify-content:space-between;align-items:center;padding:18px 0 6px;border-top:1px solid ${t.accent}30;margin-top:10px;}
.code-lbl{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:${t.accent}70;margin-bottom:6px;}
.code{font-family:'Courier New',monospace;font-size:30px;font-weight:800;color:${t.accent};letter-spacing:8px;background:${t.accent}15;padding:10px 18px;border:1px solid ${t.accent}40;display:inline-block;}
.cat-lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${t.accent};border:1px solid ${t.accent}50;padding:7px 14px;}
</style></head><body>
${TOOLBAR(code, info.nomMariee, info.nomMarie)}
<div id="billet"><div class="bar-top"></div><div class="bar-thin"></div>
<div class="content">
<div class="tag">💍 &nbsp; Mariage &nbsp; 💍</div>
<div class="noms"><div class="nom-big">${info.nomMariee}</div><span class="et">&amp;</span><div class="nom-big">${info.nomMarie}</div></div>
<div class="date-box"><div class="date-big">${info.dateStr||'—'}</div>${info.lieu?`<div class="lieu-sm">${info.lieu}</div>`:''}</div>
<div class="orn">✦ &nbsp; ✦ &nbsp; ✦</div>
<div class="inv-lbl">Invitation spécialement remise à</div>
<div class="inv-nom">${nom1||'—'}${nom2?` &nbsp;&amp;&nbsp; ${nom2}`:''}</div>
${(info.dressCode||info.dressHomme||info.dressFemme)?`<div class="grid">${info.dressCode?`<div class="bloc full"><div class="bloc-lbl">👗 Dress Code</div><div class="bloc-val">${info.dressCode}</div></div>`:''} ${info.dressHomme?`<div class="bloc"><div class="bloc-lbl">👔 Messieurs</div><div class="bloc-val">${info.dressHomme}</div></div>`:''} ${info.dressFemme?`<div class="bloc"><div class="bloc-lbl">👗 Mesdames</div><div class="bloc-val">${info.dressFemme}</div></div>`:''}</div>`:''}
${info.events?.length?`<div class="prog-titre">— Programme —</div><div class="ev-grid">${info.events.map(ev=>`<div class="ev"><div class="ev-h">${ev.time||'—'}</div><div class="ev-n">${ev.title||ev.type||''}</div>${ev.location?`<div class="ev-l">📍 ${ev.location}${ev.address?', '+ev.address:''}</div>`:''} ${ev.dressCode?`<div class="ev-d">${ev.dressCode}</div>`:''}</div>`).join('')}</div>`:''}
${methods.length?`<div class="pay-titre">— Cadeaux & Contributions —</div>${pay.message?`<div class="pay-msg">${pay.message}</div>`:''}<div class="pay-grid">${methods.map(m=>`<div class="pay"><div class="pay-i">${m.ico}</div><div><div class="pay-l">${m.lbl}</div><div class="pay-v">${m.val}</div>${m.nm?`<div class="pay-n">${m.nm}</div>`:''}</div></div>`).join('')}</div>`:''}
<div class="footer"><div><div class="code-lbl">Code d'entrée</div><div class="code">${code}</div></div>${cat?`<div class="cat-lbl">🎊 ${cat.label}</div>`:''}</div>
</div><div class="bar-thin" style="margin-top:2px"></div><div class="bar-top"></div></div>
</body></html>`;
};

// ── EDITORIAL ──
// ── EDITORIAL ──
const buildEditorial = (t, info, cat, nom1, nom2, code) => {
  const pay=info.pay||{}, methods=buildPayMethods(pay);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Billet ${code}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,700;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet">
${makePdfScript(code,700)}
<style>*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}html,body{background:#e0e0e0;font-family:'Montserrat',sans-serif;}@media print{.no-print{display:none!important;}body{background:transparent;padding:0;}@page{margin:0;size:720px auto;}}
.no-print{position:fixed;top:0;left:0;right:0;background:rgba(0,0,0,0.92);padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:9999;font-family:sans-serif;}.spacer-top{height:56px;}
#billet{width:700px;background:${t.bg};overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4);margin:0 auto;}
.hero{background:linear-gradient(135deg,${t.accent},${t.accent}cc);padding:42px 52px 34px;position:relative;overflow:hidden;}
.hero::after{content:'';position:absolute;right:-50px;top:-50px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.06);}
.hero-sub{font-size:9px;letter-spacing:5px;text-transform:uppercase;color:${t.bg}80;margin-bottom:10px;font-weight:700;}
.hero-noms-row{font-family:'Playfair Display',serif;font-size:42px;font-weight:700;color:${t.bg};line-height:1.1;margin:4px 0;}
.hero-et-inline{font-size:32px;font-style:italic;color:${t.bg}80;margin:0 8px;}
.hero-date{margin-top:18px;}.hero-d{font-size:14px;color:${t.bg};font-weight:700;letter-spacing:1px;}.hero-l{font-size:11px;color:${t.bg}60;letter-spacing:2px;text-transform:uppercase;margin-top:2px;}
.hero-num{font-size:80px;font-weight:900;color:${t.bg};opacity:.10;position:absolute;right:48px;bottom:8px;font-family:'Montserrat',sans-serif;line-height:1;}
.inv-strip{background:${t.accent}18;border-left:6px solid ${t.accent};padding:20px 52px;display:flex;justify-content:space-between;align-items:center;}
.inv-lbl{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:5px;}
.inv-nom{font-family:'Playfair Display',serif;font-size:34px;color:${t.text};font-weight:800;letter-spacing:1px;}
.code-chip{font-family:'Courier New',monospace;font-size:28px;font-weight:900;color:${t.accent};background:${t.accent}15;padding:12px 20px;border:2px solid ${t.accent};letter-spacing:6px;flex-shrink:0;}
.section{padding:22px 52px;margin-bottom:10px;border-top:1px solid ${t.accent}12;}.sec-head{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.sec-num{font-size:36px;font-weight:900;color:${t.accent}18;line-height:1;}.sec-lbl{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};font-weight:700;}
.dress-badges{display:flex;flex-wrap:wrap;gap:8px;}
.dress-badge{display:flex;align-items:center;gap:8px;background:${t.accent}12;border:1px solid ${t.accent}40;border-radius:8px;padding:10px 14px;flex:1;min-width:150px;}
.dress-badge-icon{font-size:20px;}
.dress-badge-lbl{font-size:8px;text-transform:uppercase;letter-spacing:2px;color:${t.accent};margin-bottom:2px;}
.dress-badge-val{font-size:12px;font-weight:700;color:${t.text};}
.ev-list{display:flex;flex-direction:column;gap:10px;}.ev-row{display:flex;gap:12px;align-items:flex-start;}
.ev-t{min-width:55px;text-align:right;font-size:20px;font-weight:900;color:${t.accent};line-height:1;font-family:'Montserrat',sans-serif;}
.ev-line{width:2px;background:${t.accent}25;margin:4px 6px 0;flex-shrink:0;}.ev-cnt{flex:1;padding-bottom:8px;border-bottom:1px solid ${t.accent}08;}
.ev-n{font-size:13px;font-weight:700;color:${t.text};}.ev-d{font-size:11px;color:${t.text};opacity:.55;margin-top:2px;}
.pay-list{display:grid;grid-template-columns:1fr 1fr;gap:8px;}.pay-it{display:flex;gap:8px;align-items:center;background:${t.accent}08;padding:10px 12px;border-radius:3px;}
.pay-ico{font-size:18px;}.pay-lb{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${t.accent}70;}.pay-vl{font-size:12px;font-weight:700;color:${t.text};}.pay-nm{font-size:10px;color:${t.text};opacity:.45;}
.cta-bloc{text-align:center;margin:20px 52px 0;padding-top:16px;border-top:1px solid ${t.accent}30;}
.cta-msg{font-size:12px;color:${t.text};opacity:.7;margin-bottom:12px;}
.cta-btn{display:inline-block;background:linear-gradient(135deg,${t.accent},#f0d080);color:#1a1a2e;font-weight:800;padding:13px 28px;border-radius:10px;font-size:14px;letter-spacing:1px;box-shadow:0 6px 18px ${t.accent}50;text-decoration:none;}
.cta-sub{margin-top:8px;font-size:11px;color:${t.text};opacity:.5;}
.footer-band{background:linear-gradient(135deg,${t.accent}20,${t.accent}06);padding:16px 52px;display:flex;justify-content:space-between;align-items:center;border-top:2px solid ${t.accent}40;margin-top:16px;}
.ft-lbl{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${t.accent}70;margin-bottom:4px;}
.ft-code{font-family:'Courier New',monospace;font-size:20px;font-weight:800;color:${t.accent};letter-spacing:4px;}
.ft-famille{text-align:right;}.ft-famille-lbl{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:${t.accent}70;margin-bottom:4px;}
.ft-famille-val{font-size:14px;font-weight:800;color:${t.accent};letter-spacing:2px;text-transform:uppercase;border:2px solid ${t.accent}50;padding:6px 14px;background:${t.accent}10;display:inline-block;}
</style></head><body>
${TOOLBAR(code, info.nomMariee, info.nomMarie)}
<div id="billet">
<div class="hero">
  <div class="hero-sub">💍 &nbsp; Mariage &nbsp; 💍</div>
  <div class="hero-noms-row">${info.nomMariee} <span class="hero-et-inline">&amp;</span> ${info.nomMarie}</div>
  <div class="hero-date"><div class="hero-d">${info.dateStr||'—'}</div>${info.lieu?`<div class="hero-l">${info.lieu}</div>`:''}</div>
  <div class="hero-num">${info.dateStr?.split(' ')[0]||''}</div>
</div>

<div class="inv-strip">
  <div><div class="inv-lbl">Invitation remise à</div><div class="inv-nom">${nom1||'—'}${nom2?` &amp; ${nom2}`:''}</div></div>
  <div class="code-chip">${code}</div>
</div>

${(info.dressCode||info.dressHomme||info.dressFemme)?`
<div class="section">
  <div class="sec-head"><div class="sec-num">01</div><div class="sec-lbl">Dress Code</div></div>
  <div class="dress-badges">
    ${info.dressCode?`<div class="dress-badge"><span class="dress-badge-icon">👗</span><div><div class="dress-badge-lbl">Tenue soirée</div><div class="dress-badge-val">${info.dressCode}</div></div></div>`:''}
    ${info.dressHomme?`<div class="dress-badge"><span class="dress-badge-icon">👔</span><div><div class="dress-badge-lbl">Messieurs</div><div class="dress-badge-val">${info.dressHomme}</div></div></div>`:''}
    ${info.dressFemme?`<div class="dress-badge"><span class="dress-badge-icon">💃</span><div><div class="dress-badge-lbl">Mesdames</div><div class="dress-badge-val">${info.dressFemme}</div></div></div>`:''}
  </div>
</div>`:''}

${info.events?.length?`
<div class="section">
  <div class="sec-head"><div class="sec-num">02</div><div class="sec-lbl">Programme</div></div>
  <div class="ev-list">${info.events.map(ev=>`
    <div class="ev-row">
      <div class="ev-t">${ev.time||'—'}</div>
      <div class="ev-line"></div>
      <div class="ev-cnt">
        <div class="ev-n">${ev.title||ev.type||''}</div>
        <div class="ev-d">${[ev.location,ev.address,ev.dressCode?'👗 '+ev.dressCode:''].filter(Boolean).join(' · ')}</div>
      </div>
    </div>`).join('')}
  </div>
</div>`:''}

${methods.length?`
<div class="section">
  <div class="sec-head"><div class="sec-num">03</div><div class="sec-lbl">Cadeaux &amp; Contributions</div></div>
  <div style="font-size:11px;color:${t.text};opacity:.7;font-style:italic;margin-bottom:12px;">
    💛 ${pay.message||'Votre présence est notre plus beau cadeau. Si vous souhaitez contribuer, voici quelques options :'}
  </div>
  <div class="pay-list">${methods.map(m=>`
    <div class="pay-it">
      <div class="pay-ico">${m.ico}</div>
      <div><div class="pay-lb">${m.lbl}</div><div class="pay-vl">${m.val}</div>${m.nm?`<div class="pay-nm">${m.nm}</div>`:''}</div>
    </div>`).join('')}
  </div>
</div>`:''}

<div class="cta-bloc">
  <div class="cta-msg">Nous avons hâte de célébrer ce moment avec vous ✨</div>
  <a href="https://wedding-platform-1.onrender.com/w/josia-ulrich" target="_blank" class="cta-btn">📲 Cliquez ici  pour confirmer votre présence</a>
  <div class="cta-sub">🎟️ Votre Code sera requis à l'entrée</div>
</div>

<div class="footer-band">
  <div>
    <div class="ft-lbl">Code d'entrée :</div>
    <div class="ft-code">${code}</div>
  </div>
  ${cat?`<div class="ft-famille"><div class="ft-famille-lbl">Invitation de :</div><div class="ft-famille-val"> ${cat.label.toUpperCase()}</div></div>`:''}
</div>

</div></body></html>`;
};

// ── PARCHEMIN ──
// ── PARCHEMIN ──
// ── PARCHEMIN ──
// ── PARCHEMIN ──
const buildParchemin = (t, info, cat, nom1, nom2, code) => {
  const pay=info.pay||{}, methods=buildPayMethods(pay);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Billet ${code}</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
${makePdfScript(code,700)}
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
html,body{background:#1a140a;font-family:'Lato',sans-serif;}
@media print{.no-print{display:none!important;}body{background:transparent;padding:0;}@page{margin:0;size:720px auto;}}
.no-print{position:fixed;top:0;left:0;right:0;background:rgba(0,0,0,0.88);padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:9999;font-family:sans-serif;}
.spacer-top{height:56px;}
#billet{width:700px;background:${t.bg};box-shadow:0 40px 100px rgba(0,0,0,.7);margin:0 auto;position:relative;}
.cadre1{padding:12px;background:linear-gradient(135deg,${t.accent}50,${t.accent}15,${t.accent}50);}
.cadre2{padding:10px;background:${t.bg};}
.cadre3{border:1px solid ${t.accent}40;padding:3px;}
.cadre4{border:2px solid ${t.accent}60;}
.corner{position:absolute;width:36px;height:36px;border-color:${t.accent};border-style:solid;}
.c-tl{top:24px;left:24px;border-width:2px 0 0 2px;}
.c-tr{top:24px;right:24px;border-width:2px 2px 0 0;}
.c-bl{bottom:24px;left:24px;border-width:0 0 2px 2px;}
.c-br{bottom:24px;right:24px;border-width:0 2px 2px 0;}
.inner{padding:34px 52px;position:relative;}

/* ── HEADER ── */
.tag{font-family:'Cinzel',serif;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:${t.accent};display:flex;align-items:center;gap:10px;margin-bottom:22px;}
.tag::before,.tag::after{content:'';flex:1;height:1px;background:${t.accent}50;}
.nom-c{font-family:'Cinzel',serif;font-size:52px;font-weight:700;color:#ffffff;text-align:center;line-height:1.1;}
.et-c{font-family:'IM Fell English',serif;font-size:32px;font-style:italic;color:${t.accent};margin:0 10px;}
.noms-row-p{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;text-align:center;margin-bottom:4px;}
.date-f{text-align:center;margin:18px auto;max-width:400px;padding:16px 24px;border-top:2px solid ${t.accent};border-bottom:2px solid ${t.accent};}
.date-txt{font-family:'Cinzel',serif;font-size:22px;color:#ffffff;letter-spacing:3px;text-transform:uppercase;}
.lieu-txt{font-family:'IM Fell English',serif;font-size:15px;color:#ffffff;opacity:.85;font-style:italic;margin-top:6px;}

/* ── FILET SÉPARATEUR ── */
.filet{display:flex;align-items:center;gap:8px;margin:18px 0;color:${t.accent};font-size:14px;letter-spacing:8px;justify-content:center;}
.filet::before{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,${t.accent}60);}
.filet::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,${t.accent}60,transparent);}

/* ── INVITÉ ── */
.inv-lbl{font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${t.accent};text-align:center;margin-bottom:10px;}
.inv-nom{font-family:'IM Fell English',serif;font-size:40px;font-weight:700;color:#ffffff;font-style:italic;text-align:center;padding-bottom:14px;border-bottom:1px solid ${t.accent}40;}

/* ── TITRES SECTIONS ── */
.section-titre{font-family:'Cinzel',serif;font-size:14px;letter-spacing:5px;text-transform:uppercase;color:#ffffff;background:${t.accent}35;border:1px solid ${t.accent}60;text-align:center;margin:20px 0 14px;padding:12px 0;}

/* ── PROGRAMME ── */
.prog-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:16px;}
.prog-i{border:1px solid ${t.accent}40;padding:14px 16px;background:${t.accent}10;}
.prog-h{font-family:'Cinzel',serif;font-size:26px;color:${t.accent};font-weight:700;}
.prog-n{font-family:'IM Fell English',serif;font-size:17px;color:#ffffff;font-style:italic;margin:6px 0 4px;}
.prog-l{font-size:14px;color:#ffffff;opacity:.85;}

/* ── CADEAUX ── */
.cad-msg{font-family:'IM Fell English',serif;font-size:15px;color:#ffffff;opacity:.85;text-align:center;font-style:italic;margin-bottom:14px;}
.cad-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:8px;margin-bottom:14px;}
.cad-i{border:1px solid ${t.accent}35;padding:14px;display:flex;gap:10px;background:${t.accent}12;align-items:flex-start;}
.cad-ico{font-size:22px;flex-shrink:0;}
.cad-l{font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${t.accent};margin-bottom:5px;}
.cad-v{font-size:15px;font-weight:800;color:#ffffff;word-break:break-all;}
.cad-n{font-size:13px;color:#ffffff;opacity:.85;margin-top:3px;}

/* ── CTA ── */
.cta-bloc{text-align:center;margin-top:22px;padding-top:18px;border-top:1px solid ${t.accent}30;}
.cta-msg-gold{font-size:15px;color:${t.accent};font-weight:700;margin-bottom:8px;}
.cta-msg-white{font-size:14px;color:#ffffff;opacity:.8;margin-bottom:16px;}
.cta-btn{display:inline-block;background:linear-gradient(135deg,${t.accent},#f0d080);color:#1a1a2e;font-weight:800;padding:14px 32px;border-radius:10px;font-size:16px;letter-spacing:1px;box-shadow:0 6px 18px ${t.accent}50;text-decoration:none;}
.cta-sub{margin-top:10px;font-size:13px;color:#ffffff;opacity:.65;}

/* ── PIED ── */
.pied{display:flex;justify-content:space-between;align-items:center;padding:18px 0 6px;border-top:2px solid ${t.accent}40;margin-top:18px;}
.pied-l{font-family:'Cinzel',serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:6px;}
.pied-code{font-family:'Courier New',monospace;font-size:30px;font-weight:800;color:${t.accent};letter-spacing:8px;border:1px solid ${t.accent}60;padding:10px 18px;background:${t.accent}15;display:inline-block;}
.pied-famille-lbl{font-family:'Cinzel',serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:6px;text-align:right;}
.pied-famille-val{font-size:16px;font-weight:800;color:${t.accent};letter-spacing:2px;text-transform:uppercase;border:2px solid ${t.accent}60;padding:10px 18px;background:${t.accent}15;display:inline-block;}
</style></head><body>
${TOOLBAR(code, info.nomMariee, info.nomMarie)}
<div id="billet">
<div class="corner c-tl"></div><div class="corner c-tr"></div><div class="corner c-bl"></div><div class="corner c-br"></div>
<div class="cadre1"><div class="cadre2"><div class="cadre3"><div class="cadre4"><div class="inner">

<div class="tag">💍 &nbsp; Mariage &nbsp; 💍</div>

<div style="display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,${t.accent}25,${t.accent}10);border:2px solid ${t.accent}60;padding:14px 20px;margin-bottom:22px;">
  <div style="text-align:left;">
    <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${t.accent};margin-bottom:5px;">⚠️ Action requise</div>
    <div style="font-size:14px;color:#ffffff;font-weight:700;">Confirmez votre présence avant le <span style="color:${t.accent};">30 avril 2026</span></div>
    <div style="font-size:12px;color:#ffffff;opacity:.75;margin-top:4px;">Utilisez le bouton en bas de ce billet</div>
  </div>
  <div style="flex-shrink:0;margin-left:20px;text-align:center;">
    <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:5px;">Votre code</div>
    <div style="font-family:'Courier New',monospace;font-size:20px;font-weight:800;color:${t.accent};letter-spacing:5px;background:${t.accent}20;padding:8px 14px;border:1px solid ${t.accent}50;">${code}</div>
  </div>
</div>

<div class="noms-row-p">
  <span class="nom-c">${info.nomMariee}</span>
  <span class="et-c">&amp;</span>
  <span class="nom-c">${info.nomMarie}</span>
</div>

<div class="date-f">
  <div class="date-txt">${info.dateStr||'—'}</div>
  ${info.lieu?`<div class="lieu-txt">${info.lieu}</div>`:''}
</div>

<div class="filet">✦ ✦ ✦</div>

<div class="inv-lbl">Invitation spécialement remise à</div>
<div class="inv-nom">${nom1||'—'}${nom2?` &amp; ${nom2}`:''}</div>

${info.events?.length?`
<div class="section-titre">✦ &nbsp; Programme &nbsp; ✦</div>
<div class="prog-g">
  ${info.events.map(ev=>`
    <div class="prog-i">
      <div class="prog-h">${ev.time||'—'}</div>
      <div class="prog-n">${ev.title||ev.type||''}</div>
      ${ev.location?`<div class="prog-l">📍 ${[ev.location,ev.address].filter(Boolean).join(', ')}</div>`:''}
    </div>`).join('')}
  <div class="prog-i" style="border-color:${t.accent}70;background:${t.accent}20;">
    <div class="prog-h">👑</div>
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${t.accent};margin:6px 0 4px;">Thème vestimentaire</div>
    <div class="prog-n">Élégance Royale</div>
    <div class="prog-l" style="font-style:italic;">Revêtez-vous de gloire</div>
  </div>
</div>`:''}

${methods.length?`
<div class="section-titre">✦ &nbsp; Cadeaux &amp; Contributions &nbsp; ✦</div>
<div class="cad-msg">💛 ${pay.message||'Votre présence est notre plus beau cadeau. Si vous souhaitez contribuer :'}</div>
<div class="cad-g">
  ${methods.map(m=>`
    <div class="cad-i">
      <div class="cad-ico">${m.ico}</div>
      <div>
        <div class="cad-l">${m.lbl}</div>
        <div class="cad-v">${m.val}</div>
        ${m.nm?`<div class="cad-n">${m.nm}</div>`:''}
      </div>
    </div>`).join('')}
</div>`:''}

<div class="cta-bloc">
  <div class="cta-msg-gold">💛 Votre présence est notre plus beau cadeau</div>
  <div class="cta-msg-white">Merci de confirmer votre présence en utilisant votre invitation personnelle.</div>
  <a href="https://wedding-platform-1.onrender.com/w/josia-ulrich" target="_blank" class="cta-btn">📲 Confirmer votre présence</a>
  <div class="cta-sub">🎟️ Votre code d'invitation sera requis à l'entrée</div>
</div>

<div class="pied">
  <div>
    <div class="pied-l">Code d'entrée</div>
    <div class="pied-code">${code}</div>
  </div>
  ${cat?`<div style="text-align:right;"><div class="pied-famille-lbl">Invitation de :</div><div class="pied-famille-val">🎊 FAMILLE ${cat.label.toUpperCase()}</div></div>`:''}
</div>

</div></div></div></div></div>
</div></body></html>`;
};

// ── CLASSIQUE ──
const buildClassique = (t, info, cat, nom1, nom2, code) => {
  const pay=info.pay||{}, methods=buildPayMethods(pay);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Billet ${code}</title>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
${makePdfScript(code,600)}
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
html,body{background:#111;font-family:'Lato',sans-serif;}
@media print{.no-print{display:none!important;}body{background:transparent;padding:0;}@page{margin:0;size:620px auto;}}
.no-print{position:fixed;top:0;left:0;right:0;background:rgba(0,0,0,0.88);padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:9999;font-family:sans-serif;}
.spacer-top{height:56px;}

#billet{
  width:600px;
  background:${t.bg};
  margin:0 auto;
  position:relative;
  box-shadow:0 40px 100px rgba(0,0,0,.7);
  overflow:hidden;
}

/* ── COINS FLORAUX ── */
.floral-tl{position:absolute;top:0;left:0;width:120px;height:120px;opacity:.15;background:radial-gradient(ellipse at top left, ${t.accent} 0%, transparent 70%);}
.floral-tr{position:absolute;top:0;right:0;width:120px;height:120px;opacity:.15;background:radial-gradient(ellipse at top right, ${t.accent} 0%, transparent 70%);}
.floral-bl{position:absolute;bottom:0;left:0;width:120px;height:120px;opacity:.15;background:radial-gradient(ellipse at bottom left, ${t.accent} 0%, transparent 70%);}
.floral-br{position:absolute;bottom:0;right:0;width:120px;height:120px;opacity:.15;background:radial-gradient(ellipse at bottom right, ${t.accent} 0%, transparent 70%);}

/* ── BORDURE ── */
.bordure{position:absolute;inset:12px;border:1px solid ${t.accent}40;pointer-events:none;z-index:1;}
.bordure2{position:absolute;inset:16px;border:1px solid ${t.accent}20;pointer-events:none;z-index:1;}

.inner{padding:40px 52px;position:relative;z-index:2;}

/* ── ACTION REQUISE ── */
.action-band{display:flex;justify-content:space-between;align-items:center;background:${t.accent}20;border:1px solid ${t.accent}50;padding:12px 18px;margin-bottom:28px;}
.action-left{}
.action-tag{font-family:'Cinzel',serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${t.accent};margin-bottom:4px;}
.action-txt{font-size:13px;color:#ffffff;font-weight:700;}
.action-date{color:${t.accent};}
.action-sub{font-size:11px;color:#ffffff;opacity:.7;margin-top:3px;}
.action-code-lbl{font-family:'Cinzel',serif;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:4px;text-align:center;}
.action-code{font-family:'Courier New',monospace;font-size:18px;font-weight:800;color:${t.accent};letter-spacing:5px;background:${t.accent}15;padding:7px 12px;border:1px solid ${t.accent}50;}

/* ── NOMS ── */
.noms-bloc{text-align:center;margin-bottom:6px;}
.noms-script{font-family:'Great Vibes',cursive;font-size:62px;color:#ffffff;line-height:1.1;}
.noms-et{color:${t.accent};}
.invite-vous{font-family:'Lato',sans-serif;font-size:13px;color:#ffffff;opacity:.7;text-align:center;letter-spacing:2px;margin-bottom:4px;}

/* ── DATE ── */
.date-bloc{text-align:center;margin:16px 0;}
.date-le{font-family:'Lato',sans-serif;font-size:11px;color:#ffffff;opacity:.6;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;}
.date-val{font-family:'Cinzel',serif;font-size:22px;color:#ffffff;letter-spacing:3px;}

/* ── SÉPARATEUR ── */
.sep{display:flex;align-items:center;gap:10px;margin:18px 0;}
.sep::before,.sep::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,${t.accent}50);}
.sep-ico{color:${t.accent};font-size:12px;letter-spacing:6px;}

/* ── INVITÉ ── */
.inv-lbl{font-family:'Cinzel',serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${t.accent};text-align:center;margin-bottom:8px;}
.inv-nom{font-family:'Great Vibes',cursive;font-size:44px;color:#ffffff;text-align:center;padding-bottom:12px;border-bottom:1px solid ${t.accent}30;}

/* ── PROGRAMME ICÔNES ── */
.prog-titre{font-family:'Cinzel',serif;font-size:12px;letter-spacing:5px;text-transform:uppercase;color:#ffffff;background:${t.accent}30;border:1px solid ${t.accent}50;text-align:center;padding:10px 0;margin:20px 0 16px;}
.prog-icones{display:flex;justify-content:center;gap:0;margin-bottom:16px;flex-wrap:wrap;}
.prog-item{flex:1;min-width:120px;text-align:center;padding:16px 10px;position:relative;}
.prog-item:not(:last-child)::after{content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:${t.accent}30;}
.prog-ico{font-size:32px;margin-bottom:8px;}
.prog-nom{font-family:'Lato',sans-serif;font-size:13px;font-weight:700;color:#ffffff;margin-bottom:4px;line-height:1.3;}
.prog-heure{font-family:'Cinzel',serif;font-size:13px;color:${t.accent};letter-spacing:2px;}
.prog-heure::before{content:'• ';}
.prog-heure::after{content:' •';}
.prog-lieu{font-size:11px;color:#ffffff;opacity:.7;margin-top:4px;}

/* ── LIEU GÉNÉRAL ── */
.lieu-bloc{text-align:center;margin:14px 0;padding:12px;background:${t.accent}08;border:1px solid ${t.accent}20;}
.lieu-lbl{font-family:'Cinzel',serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${t.accent};margin-bottom:4px;}
.lieu-val{font-size:13px;color:#ffffff;opacity:.85;}

/* ── THÈME ── */
.theme-bloc{display:flex;align-items:center;justify-content:center;gap:12px;background:${t.accent}15;border:1px solid ${t.accent}40;padding:12px 20px;margin:14px 0;}
.theme-ico{font-size:24px;}
.theme-titre{font-family:'Cinzel',serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:3px;}
.theme-sub{font-size:12px;color:#ffffff;font-style:italic;opacity:.85;}

/* ── CADEAUX ── */
.cad-titre{font-family:'Cinzel',serif;font-size:12px;letter-spacing:5px;text-transform:uppercase;color:#ffffff;background:${t.accent}30;border:1px solid ${t.accent}50;text-align:center;padding:10px 0;margin:20px 0 12px;}
.cad-msg{font-size:13px;color:#ffffff;opacity:.8;text-align:center;font-style:italic;margin-bottom:12px;}
.cad-g{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}
.cad-i{border:1px solid ${t.accent}30;padding:12px 14px;display:flex;gap:10px;background:${t.accent}10;align-items:flex-start;}
.cad-ico{font-size:20px;flex-shrink:0;}
.cad-l{font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${t.accent};margin-bottom:4px;}
.cad-v{font-size:14px;font-weight:800;color:#ffffff;word-break:break-all;}
.cad-n{font-size:12px;color:#ffffff;opacity:.8;margin-top:2px;}

/* ── CTA ── */
.cta-bloc{text-align:center;margin-top:22px;padding-top:16px;border-top:1px solid ${t.accent}30;}
.cta-msg{font-size:14px;color:#ffffff;opacity:.8;margin-bottom:14px;font-style:italic;}
.cta-btn{display:inline-block;background:linear-gradient(135deg,${t.accent},#f0d080);color:#1a1a2e;font-weight:800;padding:14px 32px;border-radius:8px;font-size:15px;letter-spacing:1px;box-shadow:0 6px 18px ${t.accent}50;text-decoration:none;}
.cta-sub{margin-top:10px;font-size:12px;color:#ffffff;opacity:.6;}

/* ── PIED ── */
.pied{display:flex;justify-content:space-between;align-items:center;padding:16px 0 4px;border-top:2px solid ${t.accent}40;margin-top:18px;}
.pied-l{font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:5px;}
.pied-code{font-family:'Courier New',monospace;font-size:26px;font-weight:800;color:${t.accent};letter-spacing:6px;border:1px solid ${t.accent}50;padding:8px 16px;background:${t.accent}15;display:inline-block;}
.pied-famille-lbl{font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:5px;text-align:right;}
.pied-famille-val{font-size:15px;font-weight:800;color:${t.accent};letter-spacing:2px;text-transform:uppercase;border:2px solid ${t.accent}50;padding:8px 16px;background:${t.accent}15;display:inline-block;}
</style></head><body>
${TOOLBAR(code, info.nomMariee, info.nomMarie)}
<div id="billet">
  <div class="floral-tl"></div>
  <div class="floral-tr"></div>
  <div class="floral-bl"></div>
  <div class="floral-br"></div>
  <div class="bordure"></div>
  <div class="bordure2"></div>
  <div class="inner">

    <!-- ACTION REQUISE + CODE -->
    <div class="action-band">
      <div class="action-left">
        <div class="action-tag">⚠️ Action requise</div>
        <div class="action-txt">Confirmez votre présence avant le <span class="action-date">30 avril 2026</span></div>
        <div class="action-sub">Utilisez le bouton en bas de ce billet</div>
      </div>
      <div style="flex-shrink:0;margin-left:20px;text-align:center;">
        <div class="action-code-lbl">Votre code</div>
        <div class="action-code">${code}</div>
      </div>
    </div>

    <!-- NOMS -->
    <div class="noms-bloc">
      <div class="noms-script">${info.nomMariee} <span class="noms-et">&amp;</span> ${info.nomMarie}</div>
    </div>
    <div class="invite-vous">vous invitent à célébrer leur union</div>

    <!-- DATE -->
    <div class="date-bloc">
      <div class="date-le">le</div>
      <div class="date-val">${info.dateStr||'—'}</div>
    </div>

    <div class="sep"><span class="sep-ico">✦ ✦ ✦</span></div>

    <!-- INVITÉ -->
    <div class="inv-lbl">Invitation spécialement remise à</div>
    <div class="inv-nom">${nom1||'—'}${nom2?` &amp; ${nom2}`:''}</div>

    <!-- PROGRAMME AVEC ICÔNES -->
    ${info.events?.length?`
    <div class="prog-titre">✦ &nbsp; Programme &nbsp; ✦</div>
    <div class="prog-icones">
      ${info.events.map(ev => {
        const ico = ev.title?.toLowerCase().includes('civil') ? '💍'
          : ev.title?.toLowerCase().includes('b\u00e9n\u00e9diction') || ev.title?.toLowerCase().includes('\u00e9glise') || ev.title?.toLowerCase().includes('religieux') ? '⛪'
          : ev.title?.toLowerCase().includes('soir\u00e9e') || ev.title?.toLowerCase().includes('dîner') || ev.title?.toLowerCase().includes('cocktail') || ev.title?.toLowerCase().includes('dansante') ? '🥂'
          : '🎊';
        return `<div class="prog-item">
          <div class="prog-ico">${ico}</div>
          <div class="prog-nom">${ev.title||ev.type||''}</div>
          <div class="prog-heure">${ev.time||'—'}</div>
          ${ev.location?`<div class="prog-lieu">📍 ${ev.location}</div>`:''}
        </div>`;
      }).join('')}
      <div class="prog-item">
        <div class="prog-ico">👑</div>
        <div class="prog-nom" style="color:${t.accent};">Thème vestimentaire</div>
        <div style="font-size:13px;color:#ffffff;font-style:italic;margin-top:4px;">Élégance Royale</div>
        <div class="prog-lieu" style="font-style:italic;">Revêtez-vous de gloire</div>
      </div>
    </div>`:''}

    ${info.lieu?`
    <div class="lieu-bloc">
      <div class="lieu-lbl">📍 Lieu</div>
      <div class="lieu-val">${info.lieu}</div>
    </div>`:''}

    <!-- CADEAUX -->
    ${methods.length?`
    <div class="cad-titre">✦ &nbsp; Cadeaux &amp; Contributions &nbsp; ✦</div>
    <div class="cad-msg">💛 ${pay.message||'Votre présence est notre plus beau cadeau. Si vous souhaitez contribuer :'}</div>
    <div class="cad-g">
      ${methods.map(m=>`
        <div class="cad-i">
          <div class="cad-ico">${m.ico}</div>
          <div>
            <div class="cad-l">${m.lbl}</div>
            <div class="cad-v">${m.val}</div>
            ${m.nm?`<div class="cad-n">${m.nm}</div>`:''}
          </div>
        </div>`).join('')}
    </div>`:''}

    <!-- CTA -->
    <div class="cta-bloc">
      <div class="cta-msg">Nous avons hâte de célébrer ce moment avec vous ✨</div>
      <a href="https://wedding-platform-1.onrender.com/w/josia-ulrich" target="_blank" class="cta-btn">📲 Confirmer votre présence</a>
      <div class="cta-sub">🎟️ Votre code d'invitation sera requis à l'entrée</div>
    </div>

    <!-- PIED -->
    <div class="pied">
      <div>
        <div class="pied-l">Code d'entrée</div>
        <div class="pied-code">${code}</div>
      </div>
      ${cat?`<div style="text-align:right;"><div class="pied-famille-lbl">Invitation de :</div><div class="pied-famille-val">🎊 FAMILLE ${cat.label.toUpperCase()}</div></div>`:''}
    </div>

  </div>
</div>
</body></html>`;
};
// ── BilletsTab ──
function BilletsTab({ side, info, t }) {
  const [selectedCat,  setSelectedCat]  = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [nom1,   setNom1]   = useState('');
  const [nom2,   setNom2]   = useState('');
  const [design, setDesign] = useState('magazine');

  const cat = side.categories.find(c => c.id === selectedCat);

  const imprimerBillet = () => {
    if (!selectedCode) { alert('Sélectionnez un code'); return; }
    let html = '';
    if (design === 'classique') html = buildClassique(t, info, cat, nom1, nom2, selectedCode);
    if (design === 'magazine')  html = buildMagazine(t, info, cat, nom1, nom2, selectedCode);
    if (design === 'luxe')      html = buildLuxe(t, info, cat, nom1, nom2, selectedCode);
    if (design === 'editorial') html = buildEditorial(t, info, cat, nom1, nom2, selectedCode);
    if (design === 'parchemin') html = buildParchemin(t, info, cat, nom1, nom2, selectedCode);
    const billetWidth = design === 'magazine' ? 750 : 700;
    const blob = new Blob([html], { type:'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const w = window.open(url, '_blank', `width=${billetWidth},height=900,scrollbars=yes,resizable=yes`);
    if (w) { w.addEventListener('load', () => URL.revokeObjectURL(url)); }
    else { URL.revokeObjectURL(url); alert('Autorise les popups pour ce site.'); }
  };

  const labelStyle = { fontSize:'11px', fontWeight:'700', color:'#555', display:'block', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' };
  const inputStyle = { width:'100%', border:'2px solid #e0e0e0', borderRadius:'10px', padding:'10px 14px', fontSize:'14px', background:'white', boxSizing:'border-box', outline:'none' };
  const btnPrimary = { background:'linear-gradient(135deg,#c9a84c,#f0d080)', color:'#1a1a1a', border:'none', borderRadius:'10px', padding:'12px 20px', fontSize:'14px', fontWeight:'700', cursor:'pointer' };

  return (
    <div style={{ maxWidth:'640px' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize:'16px', fontWeight:'700', color:'#1a1a2e', marginBottom:'20px' }}>🖨️ Générer un billet</h3>
        <div style={{ marginBottom:'20px' }}>
          <label style={labelStyle}>1. Choisir le design</label>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {Object.entries(DESIGNS).map(([key, d]) => (
              <div key={key} onClick={() => setDesign(key)} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'10px', cursor:'pointer', border:`2px solid ${design === key ? t.accent : '#e0e0e0'}`, background: design === key ? t.bg : '#fafafa', transition:'all 0.15s' }}>
                <span style={{ fontSize:'22px' }}>{key === 'magazine' ? '📸' : key === 'luxe' ? '👑' : key === 'editorial' ? '🎨' : '📜'}</span>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color: design === key ? t.text : '#1a1a2e' }}>{d.label}</div>
                  <div style={{ fontSize:'11px', color: design === key ? t.text : '#888', opacity: design === key ? 0.7 : 1 }}>{d.desc}</div>
                </div>
                {design === key && <span style={{ marginLeft:'auto', color:t.accent, fontWeight:'800', fontSize:'18px' }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>2. Catégorie</label>
          <select value={selectedCat} onChange={e => { setSelectedCat(e.target.value); setSelectedCode(''); }} style={inputStyle}>
            <option value="">Sélectionner...</option>
            {side.categories.map(c => <option key={c.id} value={c.id}>{c.label} — {c.codes.length} code(s)</option>)}
          </select>
        </div>
        {cat && (
          <div style={{ marginBottom:'14px' }}>
            <label style={labelStyle}>3. Code d'invitation</label>
            <select value={selectedCode} onChange={e => setSelectedCode(e.target.value)} style={inputStyle}>
              <option value="">Sélectionner...</option>
              {cat.codes.map(c => <option key={codeStr(c)} value={codeStr(c)}>{codeStr(c)}</option>)}
            </select>
          </div>
        )}
        {selectedCode && (
          <>
            <div style={{ marginBottom:'14px' }}><label style={labelStyle}>4. Nom invité(e) 1 (optionnel)</label><input value={nom1} onChange={e => setNom1(e.target.value)} placeholder="Prénom Nom" style={inputStyle} /></div>
            <div style={{ marginBottom:'20px' }}><label style={labelStyle}>Nom invité(e) 2 (optionnel)</label><input value={nom2} onChange={e => setNom2(e.target.value)} placeholder="Prénom Nom" style={inputStyle} /></div>
            <div style={{ background:t.bg, borderRadius:'10px', overflow:'hidden', marginBottom:'20px', border:`2px solid ${t.accent}40` }}>
              <div style={{ height:'5px', background:t.bar }} />
              <div style={{ padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:'9px', color:t.accent, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'4px' }}>{DESIGNS[design].label}</div>
                  <div style={{ color:t.text, fontWeight:'700', fontSize:'15px' }}>{nom1||'—'}{nom2?` & ${nom2}`:''}</div>
                  <div style={{ color:t.accent, fontSize:'12px', marginTop:'2px' }}>{info.nomMariee} & {info.nomMarie}</div>
                  <div style={{ color:t.text, fontSize:'11px', opacity:.6, marginTop:'2px' }}>{info.dateStr} · {info.lieu}</div>
                  {info.events?.length > 0 && <div style={{ color:t.accent, fontSize:'10px', marginTop:'2px' }}>🎊 {info.events.length} cérémonie(s) incluse(s)</div>}
                </div>
                <div style={{ fontFamily:'monospace', fontSize:'22px', fontWeight:'800', color:t.accent, letterSpacing:'4px', background:t.accent+'20', padding:'8px 14px', borderRadius:'6px' }}>{selectedCode}</div>
              </div>
              <div style={{ height:'5px', background:t.bar }} />
            </div>
            <button onClick={imprimerBillet} style={{ ...btnPrimary, width:'100%', fontSize:'15px', padding:'16px' }}>🖨️ Générer le billet — {DESIGNS[design].label}</button>
            <div style={{ marginTop:'12px', background:'#fff8e1', border:'1px solid #ffe082', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#7a6000' }}>
              ⚠️ <b>Pour conserver les couleurs :</b> active <b>"Graphiques en arrière-plan"</b> dans Chrome ou <b>"Imprimer les fonds de page"</b> dans Firefox/Edge.
            </div>
          </>
        )}
        {side.categories.length === 0 && <div style={{ textAlign:'center', padding:'30px', color:'#aaa' }}>Créez d'abord des catégories dans l'onglet Codes</div>}
      </div>
    </div>
  );
}

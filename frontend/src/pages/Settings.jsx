// pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { THEMES } from '../config/themes';
import './Settings.css';
import API_URL from '../config/api';

const Settings = () => {
  const { weddingId } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  const [wedding,   setWedding]   = useState(null);
  const [formData,  setFormData]  = useState({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [message,   setMessage]   = useState({ type: '', text: '' });

  useEffect(() => { if (weddingId) fetchWedding(); }, [weddingId]); // eslint-disable-line

  const fetchWedding = async () => {
    try {
      const token    = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/weddings/${weddingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur chargement');
      const data = await response.json();
      setWedding(data.wedding);
      setFormData(data.wedding);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de chargement' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSimple = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleChange = (section, field, value) =>
    setFormData(prev => ({ ...prev, [section]: { ...(prev[section] || {}), [field]: value } }));

  const handleNestedChange = (section, subsection, field, value) =>
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [subsection]: { ...(prev[section]?.[subsection] || {}), [field]: value }
      }
    }));
  const handleHeroUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  console.log("UPLOAD HERO FILE:", file);

  const form = new FormData();
  form.append("image", file);

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/upload/hero/${wedding._id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form
      }
    );

    const data = await res.json();
  

if (data.success) {
  await fetchWedding();   // recharge les données du mariage
}

    console.log("UPLOAD HERO RESPONSE:", data);

    if (data.success) {

      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          theme: {
            ...prev.settings?.theme,
            heroImage: data.heroImage
          }
        }
      }));

    }

  } catch (err) {
    console.error("Upload hero error:", err);
  }
};
  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token    = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/weddings/${wedding._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body:    JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Erreur sauvegarde');
      const data = await response.json();
      setWedding(data.wedding);
      setMessage({ type: 'success', text: '✓ Modifications enregistrées !' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="settings-page"><div className="loading">Chargement...</div></div>;

  if (!wedding) return (
    <div className="settings-page">
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center', padding:'40px' }}>
        <h2 style={{ fontSize:'2rem', color:'#0A2463', marginBottom:'20px' }}>😔 Aucun mariage trouvé</h2>
        <p style={{ color:'#666', marginBottom:'30px' }}>Créez d'abord un mariage depuis le dashboard.</p>
      </div>
    </div>
  );

 const tabProps = {
  wedding,
  formData,
  handleChange,
  handleChangeSimple,
  handleNestedChange,
  handleHeroUpload
};

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Paramètres</h1>
        <p>Personnalisez votre site de mariage</p>
        {wedding.customSlug && (
          <a href={`/w/${wedding.customSlug}`} target="_blank" rel="noreferrer"
            style={{ display:'inline-block', marginTop:'8px', color:'#0A2463', fontWeight:600 }}>
            🌐 Voir mon site : /w/{wedding.customSlug}
          </a>
        )}
      </div>

      <div className="settings-tabs">
        {[
          { id:'general',        label:'Général',    icon:'⚙️'  },
          { id:'story',          label:'Histoire',   icon:'📖'  },
          { id:'eventInfo',      label:'Programme',  icon:'📅'  },
          { id:'dressCode',      label:'Dress Code', icon:'👔'  },
          { id:'theme',          label:'Thème',      icon:'🎨'  },
          { id:'photoChallenge', label:'Photos',     icon:'📸'  },
          { id:'guestbook',      label:"Livre d'Or", icon:'💌'  },
          { id:'gifts',          label:'Cadeaux',    icon:'🎁'  },
          { id:'footer',         label:'Footer',     icon:'📄'  },
        ].map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-content">
        {activeTab === 'general'        && <GeneralTab        {...tabProps} />}
        {activeTab === 'story'          && <StoryTab          {...tabProps} />}
        {activeTab === 'eventInfo'      && <EventInfoTab      {...tabProps} />}
        {activeTab === 'dressCode'      && <DressCodeTab      {...tabProps} />}
        {activeTab === 'theme'          && <ThemeTab          {...tabProps} />}
        {activeTab === 'photoChallenge' && <PhotoChallengeTab {...tabProps} />}
        {activeTab === 'guestbook'      && <GuestbookTab      {...tabProps} />}
        {activeTab === 'gifts'          && <GiftsTab          {...tabProps} />}
        {activeTab === 'footer'         && <FooterTab         {...tabProps} />}
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="settings-footer">
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// GENERAL
// ════════════════════════════════════════════════════════════════
const GeneralTab = ({
  wedding,
  formData,
  handleChange,
  handleChangeSimple,
  handleNestedChange,
  handleHeroUpload
}) => (
  <div className="tab-content">
    <h2>Informations Générales</h2>
    <div className="form-section">
      <h3>👫 Couple</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Prénom (Personne 1)</label>
          <input type="text" value={formData.couple?.person1?.firstName || ''}
            onChange={(e) => handleNestedChange('couple','person1','firstName',e.target.value)} />
        </div>
        <div className="form-group">
          <label>Nom (Personne 1)</label>
          <input type="text" value={formData.couple?.person1?.lastName || ''}
            onChange={(e) => handleNestedChange('couple','person1','lastName',e.target.value)} />
        </div>
        <div className="form-group">
          <label>Prénom (Personne 2)</label>
          <input type="text" value={formData.couple?.person2?.firstName || ''}
            onChange={(e) => handleNestedChange('couple','person2','firstName',e.target.value)} />
        </div>
        <div className="form-group">
          <label>Nom (Personne 2)</label>
          <input type="text" value={formData.couple?.person2?.lastName || ''}
            onChange={(e) => handleNestedChange('couple','person2','lastName',e.target.value)} />
        </div>
      </div>

    </div>
    <div className="form-section">
  <h3>🖼️ Image du Hero</h3>

  {formData.settings?.theme?.heroImage && (
    <div style={{ marginBottom: '10px' }}>
      <img
        src={formData.settings.theme.heroImage}
        alt="Hero preview"
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '10px',
          objectFit: 'cover'
        }}
      />
    </div>
  )}

  <label className="carousel-upload-btn">
    📤 Upload image Hero
   <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    console.log("UPLOAD HERO CLICK");
    handleHeroUpload(e);
  }}
/>
  </label>

  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>
    Cette image sera utilisée dans le Hero de votre site.
  </p>
</div>
    <div className="form-section">
      <h3>📅 Date & Lieu</h3>
      <div className="form-group">
        <label>Date du Mariage</label>
        <input type="date" value={formData.weddingDate?.split('T')[0] || ''}
          onChange={(e) => handleChangeSimple('weddingDate', e.target.value)} />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Nom du Lieu</label>
          <input type="text" value={formData.venue?.name || ''}
            onChange={(e) => handleChange('venue','name',e.target.value)} />
        </div>
        <div className="form-group">
          <label>Ville</label>
          <input type="text" value={formData.venue?.city || ''}
            onChange={(e) => handleChange('venue','city',e.target.value)} />
        </div>
        <div className="form-group">
          <label>Pays</label>
          <input type="text" value={formData.venue?.country || ''}
            onChange={(e) => handleChange('venue','country',e.target.value)} />
        </div>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// STORY
// ════════════════════════════════════════════════════════════════
const StoryTab = ({ formData, handleChange, handleNestedChange }) => (
  <div className="tab-content">
    <h2>📖 Notre Histoire</h2>
    <div className="form-group">
      <label className="toggle-label">
        <input type="checkbox" checked={formData.story?.enabled || false}
          onChange={(e) => handleChange('story','enabled',e.target.checked)} />
        <span>Activer la section Histoire</span>
      </label>
    </div>
    {formData.story?.enabled && <>
      <div className="form-group">
        <label>Titre</label>
        <input type="text" value={formData.story?.title || ''}
          onChange={(e) => handleChange('story','title',e.target.value)} />
      </div>
      <div className="form-group">
        <label>Mode d'affichage</label>
        <select value={formData.story?.mode || 'single'}
          onChange={(e) => handleChange('story','mode',e.target.value)}>
          <option value="single">Une seule histoire (commune)</option>
          <option value="three">3 versions (commune + 2 points de vue)</option>
        </select>
      </div>
      <div className="form-section">
        <h3>👑 Notre histoire (commune)</h3>
        <textarea rows="8"
          value={formData.story?.versions?.nous || formData.story?.content || ''}
          onChange={(e) => handleNestedChange('story','versions','nous',e.target.value)}
          placeholder="Racontez votre histoire..." />
      </div>
      {formData.story?.mode === 'three' && <>
        <div className="form-section">
          <h3>💙 Vision de {formData.couple?.person1?.firstName || 'Personne 1'}</h3>
          <textarea rows="8"
            value={formData.story?.versions?.elle || ''}
            onChange={(e) => handleNestedChange('story','versions','elle',e.target.value)}
            placeholder="Son point de vue..." />
        </div>
        <div className="form-section">
          <h3>✨ Vision de {formData.couple?.person2?.firstName || 'Personne 2'}</h3>
          <textarea rows="8"
            value={formData.story?.versions?.lui || ''}
            onChange={(e) => handleNestedChange('story','versions','lui',e.target.value)}
            placeholder="Son point de vue..." />
        </div>
      </>}
    </>}
  </div>
);

// ════════════════════════════════════════════════════════════════
// EVENTINFO
// ════════════════════════════════════════════════════════════════
const EVENT_TYPES = [
  { value: 'ceremonie', label: '💍 Cérémonie' },
  { value: 'cocktail',  label: '🥂 Cocktail'  },
  { value: 'diner',     label: '🍽️ Dîner'     },
  { value: 'autre',     label: '✨ Autre'      },
];
const EMPTY_EVENT = {
  type: 'ceremonie', title: '', time: '', location: '', address: '',
  dressCode: '', description: '', googleMapsUrl: '',
};

const EventInfoTab = ({ formData, handleChange }) => {
  const events    = formData.eventInfo?.events || [];
  const setEvents = (e) => handleChange('eventInfo','events',e);
  const addEvent    = () => setEvents([...events, { ...EMPTY_EVENT, _id: Date.now().toString() }]);
  const removeEvent = (i) => setEvents(events.filter((_,j) => j !== i));
  const updateEvent = (i,f,v) => setEvents(events.map((ev,j) => j===i ? {...ev,[f]:v} : ev));
  const moveEvent   = (i,dir) => {
    const arr=[...events], s=i+dir;
    if(s<0||s>=arr.length) return;
    [arr[i],arr[s]]=[arr[s],arr[i]]; setEvents(arr);
  };

  return (
    <div className="tab-content">
      <h2>📅 Programme</h2>
      <div className="form-group">
        <label className="toggle-label">
          <input type="checkbox" checked={formData.eventInfo?.enabled || false}
            onChange={(e) => handleChange('eventInfo','enabled',e.target.checked)} />
          <span>Activer la section Programme</span>
        </label>
      </div>
      {formData.eventInfo?.enabled && <>
        <div className="form-group">
          <label>Titre de la section</label>
          <input type="text" value={formData.eventInfo?.title || ''}
            onChange={(e) => handleChange('eventInfo','title',e.target.value)} placeholder="Le Programme" />
        </div>
        {events.map((event, index) => (
          <div key={event._id||index} className="form-section event-block">
            <div className="event-block__header">
              <h3>Événement {index+1}</h3>
              <div className="event-block__actions">
                <button type="button" onClick={()=>moveEvent(index,-1)} disabled={index===0}>↑</button>
                <button type="button" onClick={()=>moveEvent(index,1)} disabled={index===events.length-1}>↓</button>
                <button type="button" className="btn-remove-event" onClick={()=>removeEvent(index)}>🗑️</button>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Type</label>
                <select value={event.type} onChange={(e)=>updateEvent(index,'type',e.target.value)}>
                  {EVENT_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Heure</label>
                <input type="time" value={event.time} onChange={(e)=>updateEvent(index,'time',e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Titre</label>
              <input type="text" value={event.title} onChange={(e)=>updateEvent(index,'title',e.target.value)} placeholder="Ex: Cérémonie religieuse" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Lieu</label>
                <input type="text" value={event.location} onChange={(e)=>updateEvent(index,'location',e.target.value)} placeholder="Nom du lieu" />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input type="text" value={event.address} onChange={(e)=>updateEvent(index,'address',e.target.value)} placeholder="123 rue..." />
              </div>
            </div>
            <div className="form-group">
              <label>Code vestimentaire</label>
              <input type="text" value={event.dressCode} onChange={(e)=>updateEvent(index,'dressCode',e.target.value)} placeholder="Tenue de soirée" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="3" value={event.description} onChange={(e)=>updateEvent(index,'description',e.target.value)} placeholder="Détails..." />
            </div>
            <div className="form-group">
              <label>Lien Google Maps</label>
              <input type="url" value={event.googleMapsUrl} onChange={(e)=>updateEvent(index,'googleMapsUrl',e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
          </div>
        ))}
        <button type="button" className="btn-add-event" onClick={addEvent}>➕ Ajouter un événement</button>
      </>}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// DRESSCODE
// ════════════════════════════════════════════════════════════════
const DressCodeTab = ({ formData, handleChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const images    = formData.dressCode?.images || [];
  const getToken  = () => localStorage.getItem('token');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (images.length >= 3) { setUploadMsg('❌ Maximum 3 photos atteint'); return; }
    setUploading(true);
    const form = new FormData();
    form.append('image', file);
    form.append('label', `Photo ${images.length+1}`);
    try {
      const res  = await fetch(`${API_URL}/upload/dresscode/${formData._id}`, {
        method:'POST', headers:{'Authorization':`Bearer ${getToken()}`}, body:form,
      });
      const data = await res.json();
      if (data.success) { handleChange('dressCode','images',data.images); setUploadMsg('✓ Photo ajoutée !'); }
      else setUploadMsg('❌ Erreur upload');
    } catch { setUploadMsg('❌ Erreur réseau'); }
    finally { setUploading(false); e.target.value=''; setTimeout(()=>setUploadMsg(''),3000); }
  };

  const handleDelete = async (publicId) => {
    if (!window.confirm('Supprimer cette photo ?')) return;
    try {
      const res  = await fetch(
        `${API_URL}/upload/dresscode/${formData._id}/${encodeURIComponent(publicId)}`,
        { method:'DELETE', headers:{'Authorization':`Bearer ${getToken()}`} }
      );
      const data = await res.json();
      if (data.success) handleChange('dressCode','images',data.images);
    } catch { alert('Erreur suppression'); }
  };

  const updateLabel = (i,label) =>
    handleChange('dressCode','images', images.map((img,j) => j===i ? {...img,label} : img));

  return (
    <div className="tab-content">
      <h2>👔 Code Vestimentaire</h2>
      <div className="form-group">
        <label className="toggle-label">
          <input type="checkbox" checked={formData.dressCode?.enabled || false}
            onChange={(e) => handleChange('dressCode','enabled',e.target.checked)} />
          <span>Activer la section Dress Code</span>
        </label>
      </div>
      {formData.dressCode?.enabled && <>
        <div className="form-group">
          <label>Titre</label>
          <input type="text" value={formData.dressCode?.title || ''}
            onChange={(e) => handleChange('dressCode','title',e.target.value)} placeholder="Code Vestimentaire" />
        </div>
        <div className="form-group">
          <label>Thème / Style</label>
          <input type="text" value={formData.dressCode?.theme || ''}
            onChange={(e) => handleChange('dressCode','theme',e.target.value)} placeholder="Ex: BLACK TIE, Bohème Chic..." />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows="4" value={formData.dressCode?.description || ''}
            onChange={(e) => handleChange('dressCode','description',e.target.value)} placeholder="Décrivez l'ambiance vestimentaire..." />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>👔 Pour les Messieurs</label>
            <textarea rows="4" value={formData.dressCode?.men || ''}
              onChange={(e) => handleChange('dressCode','men',e.target.value)} placeholder="Ex: Costume sombre..." />
          </div>
          <div className="form-group">
            <label>👗 Pour les Mesdames</label>
            <textarea rows="4" value={formData.dressCode?.women || ''}
              onChange={(e) => handleChange('dressCode','women',e.target.value)} placeholder="Ex: Robe longue..." />
          </div>
        </div>
        <div className="form-group">
          <label>Note supplémentaire</label>
          <input type="text" value={formData.dressCode?.notes || ''}
            onChange={(e) => handleChange('dressCode','notes',e.target.value)} placeholder="Ex: Évitez le blanc et le noir." />
        </div>
        <div className="form-section">
          <h3>📸 Photos d'inspiration ({images.length}/3)</h3>
          {images.length > 0 && (
            <div className="carousel-upload-grid">
              {images.map((img,i) => (
                <div key={img.publicId||i} className="carousel-upload-item">
                  <img src={img.url} alt={img.label}
                    style={{width:'100%',height:'180px',objectFit:'cover',borderRadius:'8px'}} />
                  <input type="text" value={img.label||''} onChange={(e)=>updateLabel(i,e.target.value)}
                    placeholder="Légende..." style={{width:'100%',marginTop:'6px',fontSize:'0.85rem'}} />
                  <button type="button" onClick={()=>handleDelete(img.publicId)}
                    style={{width:'100%',marginTop:'6px',padding:'4px',background:'#fff0f0',
                      border:'1px solid #fcc',borderRadius:'6px',color:'#e53e3e',cursor:'pointer',fontSize:'0.8rem'}}>
                    🗑️ Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length < 3 && (
            <label className="carousel-upload-btn">
              {uploading ? '⏳ Upload en cours...' : '➕ Ajouter une photo'}
              <input type="file" accept="image/*" style={{display:'none'}} onChange={handleUpload} disabled={uploading} />
            </label>
          )}
          {uploadMsg && <p style={{marginTop:'8px',fontSize:'0.9rem',color:uploadMsg.startsWith('✓')?'#38a169':'#e53e3e'}}>{uploadMsg}</p>}
          <div className="form-group" style={{marginTop:'16px'}}>
            <label className="toggle-label">
              <input type="checkbox" checked={formData.dressCode?.showCarousel !== false}
                onChange={(e) => handleChange('dressCode','showCarousel',e.target.checked)} />
              <span>Afficher le carousel</span>
            </label>
          </div>
        </div>
      </>}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// THEME
// ════════════════════════════════════════════════════════════════
const ThemeTab = ({ formData, handleNestedChange }) => {
  const selectTheme = (t) => {
    handleNestedChange('settings','theme','id',             t.id);
    handleNestedChange('settings','theme','primaryColor',   t.primary);
    handleNestedChange('settings','theme','secondaryColor', t.secondary);
    handleNestedChange('settings','theme','accentColor',    t.accent);
    handleNestedChange('settings','theme','fontFamily',     t.font);
    handleNestedChange('settings','theme','heroLayout',     t.heroLayout);
    handleNestedChange('settings','theme','navStyle',       t.navStyle);
    handleNestedChange('settings','theme','sectionBg',      t.sectionBg);
  };
  return (
    <div className="tab-content">
      <h2>🎨 Thème du site</h2>
      <div className="themes-grid">
        {Object.values(THEMES).map(t => (
          <div key={t.id}
            className={`theme-card ${formData.settings?.theme?.id === t.id ? 'active' : ''}`}
            onClick={() => selectTheme(t)}>
            <div className="theme-emoji">{t.emoji}</div>
            <h3>{t.name}</h3>
            <div className="theme-preview"
              style={{background:`linear-gradient(135deg, ${t.primary}, ${t.secondary})`}} />
            <p style={{fontSize:'0.8rem',color:'#666',marginTop:'6px'}}>{t.description}</p>
          </div>
        ))}
      </div>
      <h3 style={{marginTop:'40px'}}>Couleurs personnalisées</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Couleur principale</label>
          <input type="color" value={formData.settings?.theme?.primaryColor || '#0A2463'}
            onChange={(e) => handleNestedChange('settings','theme','primaryColor',e.target.value)} />
        </div>
        <div className="form-group">
          <label>Couleur secondaire</label>
          <input type="color" value={formData.settings?.theme?.secondaryColor || '#D4AF37'}
            onChange={(e) => handleNestedChange('settings','theme','secondaryColor',e.target.value)} />
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PHOTOCHALLENGE
// ════════════════════════════════════════════════════════════════
const EMPTY_CATEGORY = {
  id:'', icon:'📸', title:'', description:'', color:'#FF69B4', challenges:[],
};

const PhotoChallengeTab = ({ formData, handleChange }) => {
  const categories = formData.photoChallenge?.categories || [];
  const setCats    = (c) => handleChange('photoChallenge','categories',c);
  const addCat     = () => setCats([...categories, {
    ...EMPTY_CATEGORY, id:Date.now().toString(),
    color:['#FF69B4','#4169E1','#D4AF37','#38a169','#9b59b6'][categories.length%5],
  }]);
  const removeCat    = (i) => setCats(categories.filter((_,j)=>j!==i));
  const updateCat    = (i,f,v) => setCats(categories.map((c,j)=>j===i?{...c,[f]:v}:c));
  const moveCat      = (i,dir) => { const a=[...categories],s=i+dir; if(s<0||s>=a.length)return; [a[i],a[s]]=[a[s],a[i]]; setCats(a); };
  const addChal      = (i) => updateCat(i,'challenges',[...(categories[i].challenges||[]),'']);
  const updateChal   = (ci,chi,v) => { const ch=[...(categories[ci].challenges||[])]; ch[chi]=v; updateCat(ci,'challenges',ch); };
  const removeChal   = (ci,chi) => updateCat(ci,'challenges',(categories[ci].challenges||[]).filter((_,j)=>j!==chi));

  return (
    <div className="tab-content">
      <h2>📸 Mission Photos</h2>
      <div className="form-group">
        <label className="toggle-label">
          <input type="checkbox" checked={formData.photoChallenge?.enabled || false}
            onChange={(e) => handleChange('photoChallenge','enabled',e.target.checked)} />
          <span>Activer la section Mission Photos</span>
        </label>
      </div>
      {formData.photoChallenge?.enabled && <>
        <div className="form-group">
          <label>Titre</label>
          <input type="text" value={formData.photoChallenge?.title || ''}
            onChange={(e) => handleChange('photoChallenge','title',e.target.value)} placeholder="Mission Photos" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows="3" value={formData.photoChallenge?.description || ''}
            onChange={(e) => handleChange('photoChallenge','description',e.target.value)} placeholder="Capturez les moments magiques..." />
        </div>
        <div className="form-group">
          <label>Hashtag</label>
          <input type="text" value={formData.photoChallenge?.hashtag || ''}
            onChange={(e) => handleChange('photoChallenge','hashtag',e.target.value)} placeholder="#MonMariage2026" />
        </div>
        <div className="form-group">
          <label className="toggle-label">
            <input type="checkbox" checked={formData.photoChallenge?.uploadEnabled !== false}
              onChange={(e) => handleChange('photoChallenge','uploadEnabled',e.target.checked)} />
            <span>Autoriser les invités à uploader des photos</span>
          </label>
        </div>
        <div className="form-section">
          <h3>🗂️ Catégories ({categories.length})</h3>
          <p style={{color:'#888',fontSize:'0.85rem',marginBottom:'16px'}}>
            Si aucune catégorie → la section n'est pas affichée sur le site public.
          </p>
          {categories.map((cat,index) => (
            <div key={cat.id||index} className="event-block">
              <div className="event-block__header">
                <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{fontSize:'1.4rem'}}>{cat.icon||'📸'}</span>
                  {cat.title||`Catégorie ${index+1}`}
                </h3>
                <div className="event-block__actions">
                  <button type="button" onClick={()=>moveCat(index,-1)} disabled={index===0}>↑</button>
                  <button type="button" onClick={()=>moveCat(index,1)} disabled={index===categories.length-1}>↓</button>
                  <button type="button" className="btn-remove-event" onClick={()=>removeCat(index)}>🗑️</button>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Icône</label>
                  <input type="text" value={cat.icon||''} onChange={(e)=>updateCat(index,'icon',e.target.value)}
                    maxLength={4} placeholder="💑" style={{fontSize:'1.4rem',textAlign:'center'}} />
                </div>
                <div className="form-group">
                  <label>Couleur</label>
                  <input type="color" value={cat.color||'#FF69B4'} onChange={(e)=>updateCat(index,'color',e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Titre</label>
                <input type="text" value={cat.title||''} onChange={(e)=>updateCat(index,'title',e.target.value)} placeholder="Ex: Moments des Mariés" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={cat.description||''} onChange={(e)=>updateCat(index,'description',e.target.value)} placeholder="Ex: Sourires, bisous..." />
              </div>
              <div className="form-group">
                <label>Défis photos</label>
                {(cat.challenges||[]).map((ch,ci) => (
                  <div key={ci} style={{display:'flex',gap:'8px',marginBottom:'6px'}}>
                    <input type="text" value={ch} onChange={(e)=>updateChal(index,ci,e.target.value)}
                      placeholder="Ex: 😊 Sourires" style={{flex:1}} />
                    <button type="button" onClick={()=>removeChal(index,ci)}
                      style={{padding:'4px 10px',background:'#fff0f0',border:'1px solid #fcc',borderRadius:'6px',color:'#e53e3e',cursor:'pointer'}}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={()=>addChal(index)}
                  style={{fontSize:'0.85rem',color:'#0A2463',background:'none',border:'1px dashed #0A2463',
                    borderRadius:'6px',padding:'4px 10px',cursor:'pointer',marginTop:'4px'}}>
                  + Ajouter un défi
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn-add-event" onClick={addCat}>➕ Ajouter une catégorie</button>
        </div>
      </>}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// GUESTBOOK
// ════════════════════════════════════════════════════════════════
const GuestbookTab = ({ formData, handleChange }) => (
  <div className="tab-content">
    <h2>💌 Livre d'Or</h2>
    <div className="form-group">
      <label className="toggle-label">
        <input type="checkbox" checked={formData.guestbook?.enabled || false}
          onChange={(e) => handleChange('guestbook','enabled',e.target.checked)} />
        <span>Activer</span>
      </label>
    </div>
    {formData.guestbook?.enabled && <>
      <div className="form-group">
        <label>Titre</label>
        <input type="text" value={formData.guestbook?.title || ''}
          onChange={(e) => handleChange('guestbook','title',e.target.value)} />
      </div>
      <div className="form-group">
        <label className="toggle-label">
          <input type="checkbox" checked={formData.guestbook?.requireApproval || false}
            onChange={(e) => handleChange('guestbook','requireApproval',e.target.checked)} />
          <span>Modération des messages</span>
        </label>
      </div>
    </>}
  </div>
);

// ── GiftsTab — à intégrer dans Settings.jsx ─────────────────────
// Remplace le composant GiftsTab existant

const CURRENCIES = ['FCFA', 'CAD', 'EUR', 'USD'];

const GiftsTab = ({ formData, handleChange, handleNestedChange }) => {
  const links = formData.gifts?.externalLinks || [];
  const items = formData.gifts?.items         || [];
  const pay   = formData.gifts?.paymentNumbers || {};

  // ── Liens ──
  const setLinks   = (v) => handleChange('gifts', 'externalLinks', v);
  const addLink    = () => setLinks([...links, { id: Date.now().toString(), icon: '📦', label: '', url: '' }]);
  const removeLink = (i) => setLinks(links.filter((_, j) => j !== i));
  const updateLink = (i, f, v) => setLinks(links.map((l, j) => j === i ? { ...l, [f]: v } : l));

  // ── Cadeaux ──
  const setItems   = (v) => handleChange('gifts', 'items', v);
  const addItem    = () => setItems([...items, { id: Date.now().toString(), icon: '🎁', name: '', price: 0, collected: 0, currency: 'FCFA', link: '', reserved: false }]);
  const removeItem = (i) => setItems(items.filter((_, j) => j !== i));
  const updateItem = (i, f, v) => setItems(items.map((it, j) => j === i ? { ...it, [f]: v } : it));

  return (
    <div className="tab-content">
      <h2>🎁 Liste de Mariage</h2>
      <p className="tab-intro">Configurez ce que les invités verront dans la section Cadeaux.</p>

      {/* ── En-tête ──────────────────────────────────────────── */}
      <div className="form-section">
        <div className="form-section__label">
          <span className="fsn">01</span>
          <h3>En-tête de la section</h3>
        </div>
        <div className="form-group">
          <label>Titre</label>
          <input
            type="text"
            value={formData.gifts?.title || ''}
            onChange={(e) => handleChange('gifts', 'title', e.target.value)}
            placeholder="Liste de Mariage"
          />
        </div>
        <div className="form-group">
          <label>Sous-titre</label>
          <textarea
            rows="2"
            value={formData.gifts?.subtitle || ''}
            onChange={(e) => handleChange('gifts', 'subtitle', e.target.value)}
            placeholder="Votre présence est notre plus beau cadeau..."
          />
        </div>
      </div>

      {/* ── 01 Liens externes ────────────────────────────────── */}
      <div className="form-section">
        <div className="form-section__label">
          <span className="fsn">01</span>
          <h3>Listes externes <small>({links.length})</small></h3>
        </div>
        <p className="form-hint">Amazon, IKEA, Temu... les invités achètent directement.</p>

        {links.map((link, i) => (
          <div key={link.id || i} className="gift-row">
            <div className="gift-row__icon">
              <input
                type="text"
                value={link.icon || ''}
                onChange={(e) => updateLink(i, 'icon', e.target.value)}
                maxLength={4}
                placeholder="📦"
                className="input-emoji"
              />
            </div>
            <div className="gift-row__main">
              <input
                type="text"
                value={link.label || ''}
                onChange={(e) => updateLink(i, 'label', e.target.value)}
                placeholder="Nom de la liste (ex: Amazon)"
              />
              <input
                type="url"
                value={link.url || ''}
                onChange={(e) => updateLink(i, 'url', e.target.value)}
                placeholder="https://..."
                className="input-url"
              />
            </div>
            <button type="button" className="btn-remove-row" onClick={() => removeLink(i)}>✕</button>
          </div>
        ))}

        <button type="button" className="btn-add-row" onClick={addLink}>
          ➕ Ajouter un lien
        </button>
      </div>

      {/* ── 02 Dépôt direct ──────────────────────────────────── */}
      <div className="form-section">
        <div className="form-section__label">
          <span className="fsn">02</span>
          <h3>Dépôt direct</h3>
        </div>
        <p className="form-hint">Les invités envoient l'argent directement. Le numéro sera affiché avec un bouton "Copier".</p>

        <div className="form-group">
          <label>Nom du compte</label>
          <input
            type="text"
            value={pay.accountName || ''}
            onChange={(e) => handleNestedChange('gifts', 'paymentNumbers', 'accountName', e.target.value)}
            placeholder="Ex: Josia & Ulrich"
          />
        </div>

        <div className="form-group">
          <label>👤 Nom du titulaire <small style={{color:'#aaa',fontWeight:400}}>(affiché sur toutes les méthodes)</small></label>
          <input
            type="text"
            value={pay.accountName || ''}
            onChange={(e) => handleNestedChange('gifts', 'paymentNumbers', 'accountName', e.target.value)}
            placeholder="Ex: Josia & Ulrich LELE"
          />
        </div>

         <p className="form-hint">🇨🇲 Mobile Money Cameroun</p>
        <div className="form-grid">
          <div className="form-group">
            <label>📱 Numéro MTN MoMo</label>
            <input type="tel" value={pay.mtnMoMo || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','mtnMoMo',e.target.value)}
              placeholder="+237 6XX XXX XXX" />
          </div>
          <div className="form-group">
            <label>Nom du compte MTN</label>
            <input type="text" value={pay.mtnName || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','mtnName',e.target.value)}
              placeholder="Nom enregistré sur MTN" />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>🍊 Numéro Orange Money</label>
            <input type="tel" value={pay.orangeMoney || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','orangeMoney',e.target.value)}
              placeholder="+237 6XX XXX XXX" />
          </div>
          <div className="form-group">
            <label>Nom du compte Orange</label>
            <input type="text" value={pay.orangeName || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','orangeName',e.target.value)}
              placeholder="Nom enregistré sur Orange" />
          </div>
        </div>

        <p className="form-hint" style={{marginTop:12}}>🌐 International / Diaspora</p>
        <div className="form-grid">
          <div className="form-group">
            <label>🏦 Email Interac (Canada)</label>
            <input type="email" value={pay.interac || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','interac',e.target.value)}
              placeholder="email@interac.ca" />
          </div>
          <div className="form-group">
            <label>Nom Interac</label>
            <input type="text" value={pay.interacName || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','interacName',e.target.value)}
              placeholder="Nom du compte Interac" />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>🅿️ PayPal</label>
            <input type="text" value={pay.paypal || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','paypal',e.target.value)}
              placeholder="email@paypal.com" />
          </div>
          <div className="form-group">
            <label>Nom PayPal</label>
            <input type="text" value={pay.paypalName || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','paypalName',e.target.value)}
              placeholder="Nom du compte PayPal" />
          </div>
        </div>

        <p className="form-hint" style={{marginTop:12}}>🏛️ Virement bancaire</p>
        <div className="form-grid">
          <div className="form-group">
            <label>Nom de la banque</label>
            <input type="text" value={pay.bankName || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','bankName',e.target.value)}
              placeholder="Ex: Afriland First Bank" />
          </div>
          <div className="form-group">
            <label>Titulaire du compte</label>
            <input type="text" value={pay.bankHolder || ''}
              onChange={(e) => handleNestedChange('gifts','paymentNumbers','bankHolder',e.target.value)}
              placeholder="Nom complet" />
          </div>
        </div>
        <div className="form-group">
          <label>Numéro de compte / IBAN</label>
          <input type="text" value={pay.bankAccount || ''}
            onChange={(e) => handleNestedChange('gifts','paymentNumbers','bankAccount',e.target.value)}
            placeholder="FR76 XXXX ou numéro local" />
        </div>

        <div className="form-group" style={{marginTop:8}}>
          <label>Message / Référence</label>
          <input type="text" value={pay.message || ''}
            onChange={(e) => handleNestedChange('gifts','paymentNumbers','message',e.target.value)}
            placeholder="Ex: Mariage Josia & Ulrich — Mai 2026" />
        </div>

      {/* ── 03 Liste de cadeaux ──────────────────────────────── */}
      <div className="form-section">
        <div className="form-section__label">
          <span className="fsn">03</span>
          <h3>Liste de cadeaux <small>({items.length})</small></h3>
        </div>
        <p className="form-hint">Les invités voient la progression et peuvent participer.</p>

        {items.map((item, i) => (
          <div key={item.id || i} className="event-block" style={{ marginBottom: 16 }}>
            <div className="event-block__header">
              <h4 style={{ display:'flex', gap:8, alignItems:'center', margin:0 }}>
                <span style={{ fontSize:'1.3rem' }}>{item.icon || '🎁'}</span>
                {item.name || `Cadeau ${i + 1}`}
              </h4>
              <button type="button" className="btn-remove-event" onClick={() => removeItem(i)}>🗑️</button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Icône</label>
                <input
                  type="text"
                  value={item.icon || ''}
                  onChange={(e) => updateItem(i, 'icon', e.target.value)}
                  maxLength={4}
                  className="input-emoji"
                />
              </div>
              <div className="form-group">
                <label>Devise</label>
                <select
                  value={item.currency || 'FCFA'}
                  onChange={(e) => updateItem(i, 'currency', e.target.value)}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Nom du cadeau</label>
              <input
                type="text"
                value={item.name || ''}
                onChange={(e) => updateItem(i, 'name', e.target.value)}
                placeholder="Ex: Lit king size"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Prix total</label>
                <input
                  type="number"
                  value={item.price || 0}
                  onChange={(e) => updateItem(i, 'price', Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label>Montant collecté</label>
                <input
                  type="number"
                  value={item.collected || 0}
                  onChange={(e) => updateItem(i, 'collected', Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Lien produit (optionnel)</label>
              <input
                type="url"
                value={item.link || ''}
                onChange={(e) => updateItem(i, 'link', e.target.value)}
                placeholder="https://amazon.fr/..."
              />
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={item.reserved || false}
                  onChange={(e) => updateItem(i, 'reserved', e.target.checked)}
                />
                <span>Marquer comme déjà offert ✓</span>
              </label>
            </div>
          </div>
        ))}

        <button type="button" className="btn-add-event" onClick={addItem}>
          ➕ Ajouter un cadeau
        </button>
      </div>

      {/* ── 04 Jour J ────────────────────────────────────────── */}
      <div className="form-section form-section--info">
        <div className="form-section__label">
          <span className="fsn">04</span>
          <h3>Apporter le jour du mariage</h3>
        </div>
        <p style={{ color:'#666', fontSize:'0.9rem', margin:0 }}>
          Cette section est toujours affichée automatiquement — aucune configuration nécessaire.
          Les invités peuvent apporter un cadeau ou une enveloppe directement le jour J.
        </p>
      </div>
</div>
    </div>
  );
};






// ════════════════════════════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════════════════════════════
const FooterTab = ({ formData, handleChange, handleNestedChange }) => (
  <div className="tab-content">
    <h2>📄 Footer</h2>
    <div className="form-group">
      <label>Message</label>
      <input type="text" value={formData.footer?.message || ''}
        onChange={(e) => handleChange('footer','message',e.target.value)} />
    </div>
    <div className="form-section">
      <h3>Réseaux Sociaux</h3>
      {['instagram','facebook','twitter'].map(s => (
        <div className="form-group" key={s}>
          <label style={{textTransform:'capitalize'}}>{s}</label>
          <input type="text" value={formData.footer?.socialLinks?.[s]||''}
            onChange={(e)=>handleNestedChange('footer','socialLinks',s,e.target.value)}
            placeholder={s==='instagram'||s==='twitter'?'@votre_compte':'URL'} />
        </div>
      ))}
    </div>
  </div>
);

export default Settings;

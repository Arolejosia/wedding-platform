// components/PhotoChallenge.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PhotoChallenge.css';
import API_URL from '../config/api';

const API = API_URL;  // ✅

const PREVIEW_CATEGORIES = [
  { id:'moments', icon:'💑', title:'Moments des Mariés', description:'Sourires, bisous, regards complices', color:'#FF69B4', challenges:['😊 Sourires','💋 Bisous','🥹 Larmes de joie'] },
  { id:'invites', icon:'🥂', title:'Ambiance & Invités',  description:'Tables, groupes, fête',              color:'#4169E1', challenges:['👥 Tables','💃 Danse','🎉 Célébration'] },
  { id:'details', icon:'🎂', title:'Détails & Décors',    description:'Gâteau, fleurs, décorations',        color:'#D4AF37', challenges:['🎂 Gâteau','🌸 Fleurs','💍 Alliances'] },
];

const PREVIEW_PHOTOS = [
  { publicId:'p1', url:'https://placehold.co/400x500/FF69B4/white?text=💑', category:'moments' },
  { publicId:'p2', url:'https://placehold.co/400x400/4169E1/white?text=🥂', category:'invites' },
  { publicId:'p3', url:'https://placehold.co/400x600/D4AF37/white?text=🎂', category:'details' },
  { publicId:'p4', url:'https://placehold.co/400x450/FF69B4/white?text=💍', category:'moments' },
  { publicId:'p5', url:'https://placehold.co/400x380/4169E1/white?text=🎉', category:'invites' },
  { publicId:'p6', url:'https://placehold.co/400x520/D4AF37/white?text=🌸', category:'details' },
];

const THEME_CLASS = {
  royal:'pc--royal', minimal:'pc--minimal',
  floral:'pc--floral', boho:'pc--boho', luxury:'pc--luxury',
};

// ── Lightbox ──────────────────────────────────────────────────────
const Lightbox = ({ photos, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft')  setCurrent(c => (c - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % photos.length);
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [photos.length, onClose]);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>✕</button>
      {photos.length > 1 && <>
        <button className="lb-nav lb-nav--prev"
          onClick={e => { e.stopPropagation(); setCurrent(c => (c - 1 + photos.length) % photos.length); }}>❮</button>
        <button className="lb-nav lb-nav--next"
          onClick={e => { e.stopPropagation(); setCurrent(c => (c + 1) % photos.length); }}>❯</button>
      </>}
      <div className="lb-content" onClick={e => e.stopPropagation()}>
        <img src={photos[current].url} alt="" className="lb-img" />
        <div className="lb-counter">{current + 1} / {photos.length}</div>
      </div>
    </div>
  );
};

// ── CategoryCard ──────────────────────────────────────────────────
const CategoryCard = ({ category, wedding, guestCode, onUploaded, isPreview }) => {
  const [files,    setFiles]    = useState([]);
  const [uploading, setUploading] = useState(false);
  const [done,     setDone]     = useState(0);

  const addFiles = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length + files.length > 10) { alert('Maximum 10 photos'); return; }
    setFiles(p => [...p, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (i) => setFiles(p => p.filter((_, j) => j !== i));

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    if (isPreview) {
      await new Promise(r => setTimeout(r, 800));
      setDone(p => p + files.length);
      setFiles([]);
      setUploading(false);
      onUploaded();
      return;
    }
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('photos', f));
      fd.append('category', category.id);
      fd.append('guestCode', guestCode || 'anonymous');
      fd.append('weddingId', wedding._id);
      const res = await fetch(`${API}/api/public/photos/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDone(p => p + data.count);
      setFiles([]);
      onUploaded();
    } catch { alert("❌ Erreur lors de l'envoi."); }
    finally { setUploading(false); }
  };

  return (
    <div className="pc-cat-card" style={{ '--cat': category.color }}>
      {/* Header */}
      <div className="pc-cat-header">
        <div className="pc-cat-icon" style={{ background:`${category.color}18`, borderColor:category.color }}>
          {category.icon}
        </div>
        <div className="pc-cat-meta">
          <h3 className="pc-cat-title">{category.title}</h3>
          <p className="pc-cat-desc">{category.description}</p>
        </div>
        {done > 0 && <span className="pc-cat-done" style={{ background:category.color }}>+{done} ✓</span>}
      </div>

      {/* Défis */}
      {category.challenges?.length > 0 && (
        <div className="pc-cat-tags">
          {category.challenges.map((c, i) => (
            <span key={i} className="pc-cat-tag" style={{ borderColor:`${category.color}60`, color:category.color }}>
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <label className="pc-upload-zone" htmlFor={`up-${category.id}`}
        style={{ borderColor:`${category.color}40` }}>
        <input id={`up-${category.id}`} type="file" multiple accept="image/*"
          onChange={addFiles} style={{ display:'none' }} />
        <span className="pc-upload-icon">📷</span>
        <span className="pc-upload-text">Ajouter des photos</span>
        <span className="pc-upload-hint">Max 10 · 20 Mo</span>
      </label>

      {/* Prévisualisation */}
      {files.length > 0 && (
        <div className="pc-pending">
          <div className="pc-pending-bar">
            <span>{files.length} photo{files.length > 1 ? 's' : ''} sélectionnée{files.length > 1 ? 's' : ''}</span>
            <button className="pc-clear" onClick={() => setFiles([])}>Effacer</button>
          </div>
          <div className="pc-thumbs">
            {files.map((f, i) => (
              <div key={i} className="pc-thumb">
                <img src={URL.createObjectURL(f)} alt="" />
                <button className="pc-thumb-rm" onClick={() => removeFile(i)}>✕</button>
              </div>
            ))}
          </div>
          <button className="pc-send-btn" onClick={handleUpload} disabled={uploading}
            style={{ background:`linear-gradient(135deg, ${category.color}, ${category.color}bb)` }}>
            {uploading
              ? <><span className="pc-spin" /> Envoi en cours...</>
              : <>🚀 Envoyer {files.length} photo{files.length > 1 ? 's' : ''}</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Album par catégorie ───────────────────────────────────────────
const AlbumSection = ({ photos, total, categories, themeId, weddingSlug, navigate, onDelete, canDelete }) => {
  const [activeCat, setActiveCat]   = useState('all');
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const scrollRef = useRef(null);

  const handleDelete = async (photo, e) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer cette photo ?')) return;
    setDeleting(photo._id || photo.publicId);
    await onDelete(photo);
    setDeleting(null);
  };

  // Construire la map catégorie id → meta
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const filtered = activeCat === 'all'
    ? photos
    : photos.filter(p => p.category === activeCat);

  const goToAlbum = () => navigate(`/wedding/${weddingSlug}/photos?theme=${themeId}`);

  if (!photos.length) return (
    <div className="pc-album-empty">
      <span>📷</span>
      <p>Aucune photo partagée pour l'instant</p>
      <span className="pc-album-empty-hint">Soyez le premier à partager un souvenir !</span>
    </div>
  );

  return (
    <div className="pc-album">
      <div className="pc-album-head">
        <div>
          <h3 className="pc-album-title">📸 Album partagé</h3>
          <p className="pc-album-sub">{total} photo{total > 1 ? 's' : ''}</p>
        </div>
        <button className="pc-album-all-btn" onClick={goToAlbum}>Voir tout →</button>
      </div>

      {/* Filtres par catégorie — dynamiques */}
      <div className="pc-filters" ref={scrollRef}>
        <button
          className={`pc-filter-btn ${activeCat === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCat('all')}>
          Tout ({photos.length})
        </button>
        {categories.map(cat => {
          const count = photos.filter(p => p.category === cat.id).length;
          if (!count) return null;
          return (
            <button key={cat.id}
              className={`pc-filter-btn ${activeCat === cat.id ? 'active' : ''}`}
              style={activeCat === cat.id ? { background:cat.color, borderColor:cat.color, color:'#fff' } : { borderColor:`${cat.color}60`, color:cat.color }}
              onClick={() => setActiveCat(cat.id)}>
              {cat.icon} {cat.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Grille masonry-like */}
      <div className="pc-album-grid">
        {filtered.map((photo, i) => {
          const cat = catMap[photo.category];
          return (
            <div key={photo.publicId}
              className={`pc-album-item ${deleting === (photo._id || photo.publicId) ? 'pc-album-item--deleting' : ''}`}
              onClick={() => setLightboxIdx(i)}>
              <img src={photo.thumbnailUrl || photo.url} alt="" loading="lazy" />
              <div className="pc-album-item-overlay">
                {cat && <span className="pc-album-item-cat" style={{ background:cat.color }}>{cat.icon} {cat.title}</span>}
                <span className="pc-album-zoom">🔍</span>
              </div>
              {canDelete(photo) && (
                <button className="pc-album-delete" onClick={(e) => handleDelete(photo, e)}
                  title="Supprimer">✕</button>
              )}
            </div>
          );
        })}
        {total > photos.length && (
          <div className="pc-album-item pc-album-more" onClick={goToAlbum}>
            <span className="pc-more-num">+{total - photos.length}</span>
            <span className="pc-more-txt">photos</span>
          </div>
        )}
      </div>

      {lightboxIdx !== null && (
        <Lightbox photos={filtered} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  );
};

// ── Composant principal ───────────────────────────────────────────
const PhotoChallenge = ({ wedding, guestCode, isPreview = false, isOwner = false }) => {
  const navigate = useNavigate();

  const [photos,  setPhotos] = useState(isPreview ? PREVIEW_PHOTOS : []);
  const [total,   setTotal]  = useState(isPreview ? PREVIEW_PHOTOS.length : 0);
  const [loading, setLoading] = useState(false);

  const themeId    = wedding?.settings?.theme?.id || 'royal';
  const themeClass = THEME_CLASS[themeId] || 'pc--royal';
  const weddingSlug = wedding?.customSlug || wedding?._id || 'preview';

  // Catégories dynamiques — preview ou réelles
  // Guard — ne pas afficher si désactivé ou sans catégories
  if (!isPreview && (!wedding?.photoChallenge?.enabled || !wedding?.photoChallenge?.categories?.length)) return null;

  const categories = isPreview
    ? PREVIEW_CATEGORIES
    : (wedding?.photoChallenge?.categories || []);

  const fetchPhotos = useCallback(async () => {
    if (isPreview || !wedding?._id) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/public/photos?weddingId=${wedding._id}&limit=12`);
      const data = await res.json();
      setPhotos(Array.isArray(data.photos) ? data.photos : []);
      setTotal(data.total || 0);
    } catch (e) { console.error('PhotoChallenge fetch:', e); }
    finally { setLoading(false); }
  }, [wedding?._id, isPreview]);

  useEffect(() => {
    fetchPhotos();
    if (!isPreview) {
      const t = setInterval(fetchPhotos, 30000);
      return () => clearInterval(t);
    }
  }, [fetchPhotos, isPreview]);

  // Supprimer une photo (invité ou marié)
  const deletePhoto = useCallback(async (photo) => {
    if (isPreview) {
      setPhotos(p => p.filter(ph => ph.publicId !== photo.publicId));
      setTotal(t => t - 1);
      return;
    }
    try {
      const params = new URLSearchParams({ weddingId: wedding._id });
      if (guestCode) params.append('guestCode', guestCode);
      const res = await fetch(`${API}/api/public/photos/${photo._id}?${params}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPhotos(p => p.filter(ph => ph._id !== photo._id));
      setTotal(t => t - 1);
    } catch { alert("❌ Impossible de supprimer cette photo."); }
  }, [isPreview, wedding?._id, guestCode]);

  // Qui peut supprimer ? — invité (sa propre photo) OU marié (toutes)
  const canDelete = useCallback((photo) => {
    if (isPreview) return true;
    if (isOwner) return true; // prop isOwner passée par le dashboard
    return guestCode && photo.guestCode === guestCode;
  }, [isPreview, isOwner, guestCode]);

  return (
    <section id="photos" className={`pc ${themeClass}`}>
      <div className="pc__inner">

        {/* En-tête */}
        <div className="pc-header">
          <p className="pc-eyebrow">Mission photos</p>
          <h2 className="pc-title">{wedding?.photoChallenge?.title || 'Partagez vos photos'}</h2>
          <p className="pc-desc">{wedding?.photoChallenge?.description || 'Capturez les moments magiques et partagez-les avec nous !'}</p>
          {wedding?.photoChallenge?.hashtag && (
            <span className="pc-hashtag">{wedding.photoChallenge.hashtag}</span>
          )}
        </div>

        {isPreview && (
          <div className="pc-preview-banner">👁 Aperçu — Les vraies photos apparaîtront ici</div>
        )}

        {/* Upload par catégorie */}
        {wedding?.photoChallenge?.uploadEnabled !== false && (
          <div className="pc-cats-grid">
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                wedding={wedding}
                guestCode={guestCode}
                onUploaded={fetchPhotos}
                isPreview={isPreview}
              />
            ))}
          </div>
        )}

        {/* Album */}
        <div className="pc-album-wrap">
          {loading ? (
            <div className="pc-loading"><span className="pc-spin-gold" /><p>Chargement...</p></div>
          ) : (
            <AlbumSection
              photos={photos}
              total={total}
              categories={categories}
              themeId={themeId}
              weddingSlug={weddingSlug}
              navigate={navigate}
              onDelete={deletePhoto}
              canDelete={canDelete}
            />
          )}
        </div>

      </div>
    </section>
  );
};

export default PhotoChallenge;

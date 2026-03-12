// src/pages/AdminPhotos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

const API = 'API_URL';

const AdminPhotos = () => {
  const { weddingId } = useParams();
  const [photos,    setPhotos]   = useState([]);
  const [total,     setTotal]    = useState(0);
  const [loading,   setLoading]  = useState(true);
  const [deleting,  setDeleting] = useState(null);
  const [filter,    setFilter]   = useState('all');
  const [categories, setCats]    = useState([]);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch wedding to get categories
      const wRes  = await fetch(`${API}/api/weddings/${weddingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const wData = await wRes.json();
      setCats(wData.wedding?.photoChallenge?.categories || []);

      // Fetch all photos (no limit)
      const pRes  = await fetch(`${API}/api/public/photos?weddingId=${weddingId}&limit=200`);
      const pData = await pRes.json();
      setPhotos(Array.isArray(pData.photos) ? pData.photos : []);
      setTotal(pData.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [weddingId]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleDelete = async (photo) => {
    if (!window.confirm('Supprimer cette photo définitivement ?')) return;
    setDeleting(photo._id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API}/api/public/photos/${photo._id}?weddingId=${weddingId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setPhotos(p => p.filter(ph => ph._id !== photo._id));
      setTotal(t => t - 1);
    } catch { alert('❌ Erreur lors de la suppression'); }
    finally { setDeleting(null); }
  };

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const filtered = filter === 'all' ? photos : photos.filter(p => p.category === filter);

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'#0A2463', margin:0 }}>
            📸 Photos des invités
          </h1>
          <p style={{ color:'#888', fontSize:'0.9rem', marginTop:4 }}>
            {total} photo{total > 1 ? 's' : ''} partagée{total > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={fetchPhotos}
          style={{ padding:'8px 16px', borderRadius:8, border:'1.5px solid #ddd',
            background:'#fff', cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}>
          🔄 Actualiser
        </button>
      </div>

      {/* Filtres catégories */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        <button onClick={() => setFilter('all')}
          style={{ padding:'6px 14px', borderRadius:20, border:'1.5px solid',
            borderColor: filter==='all' ? '#0A2463' : '#ddd',
            background: filter==='all' ? '#0A2463' : '#fff',
            color: filter==='all' ? '#fff' : '#555',
            fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
          Toutes ({photos.length})
        </button>
        {categories.map(cat => {
          const count = photos.filter(p => p.category === cat.id).length;
          if (!count) return null;
          return (
            <button key={cat.id} onClick={() => setFilter(cat.id)}
              style={{ padding:'6px 14px', borderRadius:20, border:'1.5px solid',
                borderColor: filter===cat.id ? cat.color : `${cat.color}60`,
                background: filter===cat.id ? cat.color : '#fff',
                color: filter===cat.id ? '#fff' : cat.color,
                fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
              {cat.icon} {cat.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Grille photos */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#aaa' }}>
          <div style={{ fontSize:'2rem', marginBottom:12 }}>⏳</div>
          <p>Chargement des photos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#aaa' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>📷</div>
          <p style={{ fontSize:'1rem' }}>Aucune photo pour le moment</p>
          <p style={{ fontSize:'0.85rem', marginTop:6 }}>
            Les photos partagées par les invités apparaîtront ici
          </p>
        </div>
      ) : (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
          gap:12
        }}>
          {filtered.map(photo => {
            const cat = catMap[photo.category];
            return (
              <div key={photo._id} style={{
                position:'relative', borderRadius:12, overflow:'hidden',
                aspectRatio:'1', background:'#eee',
                boxShadow:'0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <img src={photo.thumbnailUrl || photo.url} alt=""
                  style={{ width:'100%', height:'100%', objectFit:'cover' }} />

                {/* Overlay info */}
                <div style={{
                  position:'absolute', bottom:0, left:0, right:0,
                  background:'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  padding:'20px 8px 8px', opacity:0,
                  transition:'opacity 0.2s'
                }} className="photo-overlay">
                  {cat && (
                    <span style={{
                      fontSize:'0.65rem', fontWeight:700, color:'#fff',
                      background:cat.color, padding:'2px 8px', borderRadius:10
                    }}>
                      {cat.icon} {cat.title}
                    </span>
                  )}
                  {photo.guestName && (
                    <p style={{ color:'#fff', fontSize:'0.72rem', margin:'4px 0 0', opacity:0.9 }}>
                      👤 {photo.guestName}
                    </p>
                  )}
                </div>

                {/* Bouton supprimer */}
                <button onClick={() => handleDelete(photo)}
                  disabled={deleting === photo._id}
                  style={{
                    position:'absolute', top:6, right:6,
                    background: deleting===photo._id ? '#aaa' : 'rgba(220,38,38,0.9)',
                    color:'#fff', border:'none', borderRadius:'50%',
                    width:28, height:28, fontSize:'0.75rem', fontWeight:700,
                    cursor: deleting===photo._id ? 'not-allowed' : 'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 2px 6px rgba(0,0,0,0.3)'
                  }}>
                  {deleting === photo._id ? '...' : '✕'}
                </button>

                {/* Badge catégorie (toujours visible) */}
                {cat && (
                  <div style={{
                    position:'absolute', top:6, left:6,
                    background:`${cat.color}dd`, color:'#fff',
                    fontSize:'0.65rem', fontWeight:700,
                    padding:'2px 8px', borderRadius:10
                  }}>
                    {cat.icon}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        div:hover > .photo-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default AdminPhotos;

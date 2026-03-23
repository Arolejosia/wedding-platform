// src/components/dashboard/WeddingCard.jsx
import React, { useState } from 'react';

const WeddingCard = ({ wedding, onOpen, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Lire les codes depuis localStorage ──
  const getCodes = () => {
    try {
      const raw = localStorage.getItem(`weddingplanner_codes_v2_${wedding._id}`);
      if (!raw) return { josia: null, ulrich: null };
      return JSON.parse(raw);
    } catch { return { josia: null, ulrich: null }; }
  };

  const codes = getCodes();

  // Compter les codes réels dans les catégories
  const countCodes = (side) => {
    if (!side?.categories) return 0;
    return side.categories.reduce((sum, cat) => sum + cat.codes.length, 0);
  };

  const josiaCodesCount  = countCodes(codes.josia);
  const ulrichCodesCount = countCodes(codes.ulrich);
  const totalCodes       = josiaCodesCount + ulrichCodesCount;

  const josiaPlaces  = codes.josia?.totalPlaces  || 0;
  const ulrichPlaces = codes.ulrich?.totalPlaces || 0;
  const totalPlaces  = josiaPlaces + ulrichPlaces;

  const josiaUsed  = codes.josia?.usedPlaces  || 0;
  const ulrichUsed = codes.ulrich?.usedPlaces || 0;

  // ── Formatage date ──
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    const weddingDate = new Date(Number(year), Number(month) - 1, Number(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    weddingDate.setHours(0, 0, 0, 0);
    const diff = weddingDate - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysUntil = getDaysUntil(wedding.weddingDate);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleConfirm = (e) => {
    e.stopPropagation();
    setConfirmDelete(false);
    onDelete?.();
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <div className="wedding-card" onClick={onOpen}>
      <div className="wedding-card-header">
        <h3 className="wedding-title">
          {wedding.couple.person1.firstName} & {wedding.couple.person2.firstName}
        </h3>
        {wedding.status === 'active' && <span className="badge-active">Actif</span>}
      </div>

      <div className="wedding-card-body">
        <div className="wedding-date">
          <span className="date-icon">📅</span>
          <span>{formatDate(wedding.weddingDate)}</span>
        </div>

        {daysUntil > 0 && (
          <div className="wedding-countdown">
            <span className="countdown-icon">⏰</span>
            <span>Dans {daysUntil} jours</span>
          </div>
        )}

        {wedding.venue?.city && (
          <div className="wedding-location">
            <span className="location-icon">📍</span>
            <span>{wedding.venue.city}</span>
          </div>
        )}

        {/* Stats invitations */}
        <div className="wedding-stats">
          <div className="stat-item">
            <span className="stat-number">{totalCodes}</span>
            <span className="stat-label">Codes générés</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{totalPlaces}</span>
            <span className="stat-label">Places totales</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{Math.max(0, totalPlaces - (josiaUsed + ulrichUsed))}</span>
            <span className="stat-label">Places restantes</span>
          </div>
        </div>

        {/* Détail par côté */}
        {(josiaPlaces > 0 || ulrichPlaces > 0) && (
          <div style={{ marginTop:'10px', display:'flex', gap:'8px' }}>
            {josiaPlaces > 0 && (
              <div style={{ flex:1, background:'#f5f6fa', borderRadius:'8px', padding:'8px 10px', fontSize:'11px' }}>
                <div style={{ fontWeight:'700', color:'#1a1a2e', marginBottom:'3px' }}>
                  {wedding.couple.person1.firstName}
                </div>
                <div style={{ color:'#888' }}>
                  {josiaCodesCount} codes · {josiaUsed}/{josiaPlaces} places
                </div>
                <div style={{ marginTop:'4px', height:'4px', borderRadius:'2px', background:'#e0e0e0', overflow:'hidden' }}>
                  <div style={{
                    height:'100%', borderRadius:'2px',
                    width:`${josiaPlaces > 0 ? (josiaUsed / josiaPlaces) * 100 : 0}%`,
                    background:'#c9a84c',
                    transition:'width 0.3s'
                  }} />
                </div>
              </div>
            )}
            {ulrichPlaces > 0 && (
              <div style={{ flex:1, background:'#f5f6fa', borderRadius:'8px', padding:'8px 10px', fontSize:'11px' }}>
                <div style={{ fontWeight:'700', color:'#1a1a2e', marginBottom:'3px' }}>
                  {wedding.couple.person2.firstName}
                </div>
                <div style={{ color:'#888' }}>
                  {ulrichCodesCount} codes · {ulrichUsed}/{ulrichPlaces} places
                </div>
                <div style={{ marginTop:'4px', height:'4px', borderRadius:'2px', background:'#e0e0e0', overflow:'hidden' }}>
                  <div style={{
                    height:'100%', borderRadius:'2px',
                    width:`${ulrichPlaces > 0 ? (ulrichUsed / ulrichPlaces) * 100 : 0}%`,
                    background:'#c9a84c',
                    transition:'width 0.3s'
                  }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message si pas encore de codes */}
        {totalPlaces === 0 && (
          <div style={{ marginTop:'10px', fontSize:'11px', color:'#bbb', textAlign:'center', padding:'8px', background:'#f9f9f9', borderRadius:'8px' }}>
            Aucun code généré — ouvrez les Invitations
          </div>
        )}
      </div>

      <div className="wedding-card-footer">
        <button className="btn-open-wedding" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          Ouvrir →
        </button>

        {!confirmDelete ? (
          <button className="btn-delete-wedding" onClick={handleDeleteClick} title="Supprimer">
            🗑️
          </button>
        ) : (
          <div className="delete-confirm" onClick={e => e.stopPropagation()}>
            <span>Supprimer ?</span>
            <button className="btn-confirm-yes" onClick={handleConfirm}>Oui</button>
            <button className="btn-confirm-no"  onClick={handleCancel}>Non</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeddingCard;

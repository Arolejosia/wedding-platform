// src/components/dashboard/WeddingCard.jsx
import React, { useState } from 'react';

const WeddingCard = ({ wedding, onOpen, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (dateString) => {
  // ✅ Forcer UTC pour éviter le décalage de fuseau horaire
  const [year, month, day] = dateString.split('T')[0].split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

const getDaysUntil = (dateString) => {
  const [year, month, day] = dateString.split('T')[0].split('-');
  const weddingDate = new Date(Number(year), Number(month) - 1, Number(day));
  
  // ✅ Comparer en ignorant l'heure (minuit local)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weddingDate.setHours(0, 0, 0, 0);
  
  const diff = weddingDate - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

  const daysUntil = getDaysUntil(wedding.weddingDate);

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // ← ne pas ouvrir la card
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
        <div className="wedding-stats">
          <div className="stat-item">
            <span className="stat-number">{wedding.stats?.totalGuests || 0}</span>
            <span className="stat-label">Invités</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{wedding.stats?.confirmedGuests || 0}</span>
            <span className="stat-label">Confirmés</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{wedding.stats?.tasksCompleted || 0}</span>
            <span className="stat-label">Tâches</span>
          </div>
        </div>
      </div>

      <div className="wedding-card-footer">
        <button className="btn-open-wedding" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          Ouvrir →
        </button>

        {/* ── Bouton supprimer ── */}
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

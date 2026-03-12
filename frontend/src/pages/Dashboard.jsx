// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreateWeddingModal from '../components/dashboard/CreateWeddingModal';
import WeddingCard from '../components/dashboard/WeddingCard';
import './Dashboard.css';
import API_URL from '../config/api';

const  API = API_URL; // ✅ centralisé, pas de "magic string" dans le code    

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, setActiveWedding } = useAuth();

  const [weddings,        setWeddings]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting,        setDeleting]        = useState(null); // ✅ ici, pas dans handleDelete

  // ✅ Token robuste : Context → localStorage → sessionStorage
  const getToken = () =>
    token ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token');

  useEffect(() => { fetchWeddings(); }, []); // eslint-disable-line

  const fetchWeddings = async () => {
    try {
      const authToken = getToken();
      if (!authToken) { navigate('/login'); return; }

      const res  = await fetch(`${API_URL}/weddings`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (res.status === 401) { logout(); navigate('/login'); return; }

      const data = await res.json();
      if (res.ok) setWeddings(data.weddings || []);
    } catch (err) {
      console.error('Erreur chargement mariages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (weddingId, weddingTitle) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer "${weddingTitle}" ?\n\nCette action est irréversible.`
    );
    if (!confirmed) return;

    setDeleting(weddingId);
    try {
      const authToken = getToken(); // ✅ localStorage, cohérent
      const res = await fetch(`${API_URL}/weddings/${weddingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Erreur suppression');
      setWeddings(prev => prev.filter(w => w._id !== weddingId));
      alert('✓ Mariage supprimé avec succès');
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('❌ Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenWedding = (weddingId) => {
    //setActiveWedding(weddingId);
    navigate(`/admin/${weddingId}`);
  };

  const handleCreateSuccess = (newWedding) => {
    setWeddings(prev => [...prev, newWedding]);
    setShowCreateModal(false);
    handleOpenWedding(newWedding._id);
  };

  if (loading) return (
    <div className="dashboard-loading">
      <div className="spinner-large" />
      <p>Chargement...</p>
    </div>
  );

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1>👋 Bonjour {user?.firstName} !</h1>
            <p>Gérez vos événements de mariage</p>
          </div>
          <div className="header-actions">
            <button className="btn-profile" onClick={() => alert('Profil - À implémenter')}>
              👤 Profil
            </button>
            <button className="btn-logout" onClick={logout}>
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="dashboard-content">
        <div className="section-header">
          <h2>💍 Mes Mariages ({weddings.length})</h2>
        <button className="btn-create-wedding" onClick={() => navigate("/start-preview")}>
  ➕ Nouveau mariage
</button>
        </div>

        {weddings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💐</div>
            <h3>Aucun mariage pour le moment</h3>
            <p>Créez votre premier mariage pour commencer !</p>
            <button className="btn-create-first" onClick={() => navigate("/start-preview")}>
              ✨ Créer mon premier mariage
            </button>
          </div>
        ) : (
          <div className="weddings-grid">
            {weddings.map(wedding => (
              <WeddingCard
                key={wedding._id}
                wedding={wedding}
                onOpen={() => handleOpenWedding(wedding._id)}
                onDelete={() => handleDelete(wedding._id, wedding.title || `${wedding.couple?.person1?.firstName} & ${wedding.couple?.person2?.firstName}`)}
                isDeleting={deleting === wedding._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <CreateWeddingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          token={getToken()} // ✅ passe le token résolu, pas juste token du context
        />
      )}

    </div>
  );
};

export default Dashboard;

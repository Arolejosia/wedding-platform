import React, { useState, useEffect } from 'react';
import './Admindashboard.css';
import API_URL from '../config/api';
import WeddingPlanner from './WeddingPlanner';

const GUESTS_URL = `${API_URL}/guests`;

const AdminDashboard = () => {
  const [guests,         setGuests]         = useState([]);
  const [stats,          setStats]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('overview');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus,   setFilterStatus]   = useState('all');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res  = await fetch(GUESTS_URL);
      const data = await res.json();
      setGuests(data.guests || []);
      setStats(data.stats  || {});
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res  = await fetch(`${GUESTS_URL}/export`);
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `invites-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err) {
      alert('Erreur export');
    }
  };

  const handleDeleteGuest = async (id) => {
    if (!confirm('Supprimer cet invité ?')) return;
    try {
      await fetch(`${GUESTS_URL}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  // Catégories dynamiques extraites des guests MongoDB
  const dynamicCategories = [...new Set(guests.map(g => g.categoryLabel || g.category).filter(Boolean))];

  const filteredGuests = guests.filter(g => {
    const matchSearch   = g.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (g.person1Name && g.person1Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (g.person2Name && g.person2Name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = filterCategory === 'all' || (g.categoryLabel || g.category) === filterCategory;
    const matchStatus   = filterStatus   === 'all' || g.rsvpStatus === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner-large"></div>
        <p>Chargement du dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>🎯 Dashboard Admin - Mariage J&U</h1>
          <button className="btn-export" onClick={handleExport}>
            📥 Exporter Excel
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Vue d'ensemble
        </button>
        <button
          className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          💌 Invitations
        </button>
        <button
          className={`tab-btn ${activeTab === 'guests' ? 'active' : ''}`}
          onClick={() => setActiveTab('guests')}
        >
          👥 Liste invités ({guests.length})
        </button>
      </div>

      <div className="admin-content">

        {/* TAB: Vue d'ensemble */}
        {activeTab === 'overview' && stats && (
          <div className="overview-tab">

            <h2 style={{ marginBottom:'16px' }}>🗄️ RSVP en ligne (MongoDB)</h2>
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">🎫</div>
                <div className="stat-info">
                  <h3>{stats.total || 0}</h3>
                  <p>Codes générés</p>
                </div>
              </div>
              <div className="stat-card confirmed">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.confirmed || 0}</h3>
                  <p>Confirmés</p>
                </div>
              </div>
              <div className="stat-card declined">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <h3>{stats.declined || 0}</h3>
                  <p>Déclinés</p>
                </div>
              </div>
              <div className="stat-card pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pending || 0}</h3>
                  <p>En attente</p>
                </div>
              </div>
            </div>

            {/* Stats par catégorie — dynamique depuis MongoDB */}
            <div className="category-stats" style={{ marginTop:'28px' }}>
              <h2>📋 Par catégorie (RSVP)</h2>
              <div className="category-grid">
                {Object.entries(stats.byCategory || {}).map(([catKey, catStats]) => (
                  <div key={catKey} className="category-card">
                    <h3>{catKey}</h3>
                    <div className="cat-stats-row">
                      <span className="cat-total">{catStats.total} codes</span>
                      <span className="cat-confirmed">✅ {catStats.confirmed}</span>
                      <span className="cat-pending">⏳ {catStats.pending}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${catStats.total > 0 ? Math.round((catStats.confirmed / catStats.total) * 100) : 0}%`,
                        background: '#c9a84c'
                      }}></div>
                    </div>
                    <p className="cat-rate">
                      {catStats.total > 0 ? Math.round((catStats.confirmed / catStats.total) * 100) : 0}% confirmés
                    </p>
                  </div>
                ))}
                {Object.keys(stats.byCategory || {}).length === 0 && (
                  <p style={{ color:'#aaa', fontSize:'13px' }}>Aucun code généré pour l'instant.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB: Invitations (WeddingPlanner) */}
        {activeTab === 'planner' && <WeddingPlanner />}

        {/* TAB: Liste invités */}
        {activeTab === 'guests' && (
          <div className="guests-tab">
            <div className="filters-bar">
              <input
                type="text"
                placeholder="🔍 Rechercher par code ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">Toutes catégories</option>
                {dynamicCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous statuts</option>
                <option value="confirmed">Confirmés</option>
                <option value="declined">Déclinés</option>
                <option value="pending">En attente</option>
              </select>
              <button className="btn-refresh" onClick={fetchData}>🔄</button>
            </div>

            <div className="guests-table-wrap">
              <table className="guests-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Catégorie</th>
                    <th>Statut</th>
                    <th>Date RSVP</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.length === 0 ? (
                    <tr><td colSpan="7" className="no-results">Aucun invité trouvé</td></tr>
                  ) : (
                    filteredGuests.map(guest => (
                      <tr key={guest._id}>
                        <td><code className="code-badge">{guest.code}</code></td>
                        <td>
                          {guest.person1Name || <span className="text-muted">-</span>}
                          {guest.person2Name && <><br/><small>{guest.person2Name}</small></>}
                        </td>
                        <td>
                          <span className="ticket-badge">
                            {guest.ticketType === 'couple' ? '👥' : '👤'}
                          </span>
                        </td>
                        <td>
                          <span className="category-badge">
                            {guest.categoryLabel || guest.category || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${guest.rsvpStatus}`}>
                            {guest.rsvpStatus === 'confirmed' && '✅ Confirmé'}
                            {guest.rsvpStatus === 'declined'  && '❌ Décliné'}
                            {guest.rsvpStatus === 'pending'   && '⏳ En attente'}
                          </span>
                        </td>
                        <td className="text-muted">
                          {guest.rsvpDate ? new Date(guest.rsvpDate).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td>
                          <button
                            className="btn-delete-small"
                            onClick={() => handleDeleteGuest(guest._id)}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className="table-footer">
              {filteredGuests.length} invité(s) affiché(s) sur {guests.length} total
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;

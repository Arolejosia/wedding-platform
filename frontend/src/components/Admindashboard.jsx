import React, { useState, useEffect } from 'react';
import './Admindashboard.css';
import API_URL from '../config/api';
import WeddingPlanner from './WeddingPlanner';

const GUESTS_URL = `${API_URL}/guests`;

// ─── Modal d'édition ────────────────────────────────────────────────────────
const EditGuestModal = ({ guest, dynamicCategories, onClose, onSave }) => {
  const [form, setForm] = useState({
    person1Name:   guest.person1Name   || '',
    person2Name:   guest.person2Name   || '',
    ticketType:    guest.ticketType    || 'solo',
    category:      guest.categoryLabel || guest.category || '',
    categoryLabel: guest.categoryLabel || guest.category || '',
    rsvpStatus:    guest.rsvpStatus    || 'pending',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      // sync category + categoryLabel ensemble
      ...(name === 'category'      ? { categoryLabel: value } : {}),
      ...(name === 'categoryLabel' ? { category: value }      : {}),
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${GUESTS_URL}/${guest._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      onSave();
    } catch (err) {
      setError('Impossible de sauvegarder. Vérifie que le backend tourne.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Modifier le billet</h2>
          <code className="modal-code">{guest.code}</code>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Type de billet */}
          <div className="form-group">
            <label>Type de billet</label>
            <div className="radio-group">
              <label className={`radio-card ${form.ticketType === 'solo' ? 'selected' : ''}`}>
                <input type="radio" name="ticketType" value="solo"
                  checked={form.ticketType === 'solo'} onChange={handleChange} />
                👤 Solo
              </label>
              <label className={`radio-card ${form.ticketType === 'couple' ? 'selected' : ''}`}>
                <input type="radio" name="ticketType" value="couple"
                  checked={form.ticketType === 'couple'} onChange={handleChange} />
                👥 Couple
              </label>
            </div>
          </div>

          {/* Nom personne 1 */}
          <div className="form-group">
            <label>Nom {form.ticketType === 'couple' ? '(Personne 1)' : ''}</label>
            <input
              type="text" name="person1Name"
              value={form.person1Name}
              onChange={handleChange}
              placeholder="Prénom Nom"
              className="modal-input"
            />
          </div>

          {/* Nom personne 2 (si couple) */}
          {form.ticketType === 'couple' && (
            <div className="form-group">
              <label>Nom (Personne 2)</label>
              <input
                type="text" name="person2Name"
                value={form.person2Name}
                onChange={handleChange}
                placeholder="Prénom Nom"
                className="modal-input"
              />
            </div>
          )}

          {/* Catégorie */}
          <div className="form-group">
            <label>Catégorie</label>
            <input
              type="text" name="categoryLabel"
              value={form.categoryLabel}
              onChange={handleChange}
              placeholder="Ex: Famille, Amis, Collègues..."
              className="modal-input"
              list="cat-suggestions"
            />
            <datalist id="cat-suggestions">
              {dynamicCategories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Statut RSVP */}
          <div className="form-group">
            <label>Statut RSVP</label>
            <select name="rsvpStatus" value={form.rsvpStatus}
              onChange={handleChange} className="modal-input">
              <option value="pending">⏳ En attente</option>
              <option value="confirmed">✅ Confirmé</option>
              <option value="declined">❌ Décliné</option>
            </select>
          </div>

          {error && <p className="modal-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard principal ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [guests,         setGuests]         = useState([]);
  const [stats,          setStats]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('overview');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [editingGuest,   setEditingGuest]   = useState(null); // guest en cours d'édition

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
    if (!window.confirm('Supprimer ce billet définitivement ?')) return;
    try {
      await fetch(`${GUESTS_URL}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const handleSaveEdit = () => {
    setEditingGuest(null);
    fetchData();
  };

  const dynamicCategories = [...new Set(guests.map(g => g.categoryLabel || g.category).filter(Boolean))];

  const filteredGuests = guests.filter(g => {
    const matchSearch   = g.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (g.person1Name && g.person1Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (g.person2Name && g.person2Name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = filterCategory === 'all' || (g.categoryLabel || g.category) === filterCategory;
    const matchStatus   = filterStatus   === 'all' || g.rsvpStatus === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  // Stats rapides pour l'historique
  const incomplets = guests.filter(g => !g.person1Name).length;

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

      {/* Modal édition */}
      {editingGuest && (
        <EditGuestModal
          guest={editingGuest}
          dynamicCategories={dynamicCategories}
          onClose={() => setEditingGuest(null)}
          onSave={handleSaveEdit}
        />
      )}

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
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}>
          📊 Vue d'ensemble
        </button>
        <button className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}>
          💌 Invitations
        </button>
        <button className={`tab-btn ${activeTab === 'guests' ? 'active' : ''}`}
          onClick={() => setActiveTab('guests')}>
          🎫 Historique billets ({guests.length})
          {incomplets > 0 && <span className="badge-incomplete">{incomplets} incomplets</span>}
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

        {/* TAB: Invitations */}
        {activeTab === 'planner' && <WeddingPlanner />}

        {/* TAB: Historique billets */}
        {activeTab === 'guests' && (
          <div className="guests-tab">

            {/* Bannière billets incomplets */}
            {incomplets > 0 && (
              <div className="incomplete-banner">
                ⚠️ <strong>{incomplets} billet(s) sans nom</strong> — clique ✏️ pour les compléter
              </div>
            )}

            <div className="filters-bar">
              <input
                type="text"
                placeholder="🔍 Rechercher par code ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select">
                <option value="all">Toutes catégories</option>
                {dynamicCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select">
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
                    <th>Nom(s)</th>
                    <th>Type</th>
                    <th>Catégorie</th>
                    <th>Statut RSVP</th>
                    <th>Créé le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.length === 0 ? (
                    <tr><td colSpan="7" className="no-results">Aucun billet trouvé</td></tr>
                  ) : (
                    filteredGuests.map(guest => (
                      <tr key={guest._id} className={!guest.person1Name ? 'row-incomplete' : ''}>
                        <td><code className="code-badge">{guest.code}</code></td>
                        <td>
                          {guest.person1Name
                            ? <>{guest.person1Name}{guest.person2Name && <><br/><small className="text-muted">{guest.person2Name}</small></>}</>
                            : <span className="text-incomplete">— à compléter</span>
                          }
                        </td>
                        <td>
                          <span className="ticket-badge">
                            {guest.ticketType === 'couple' ? '👥 Couple' : '👤 Solo'}
                          </span>
                        </td>
                        <td>
                          <span className="category-badge">
                            {guest.categoryLabel || guest.category || <span className="text-incomplete">—</span>}
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
                          {guest.createdAt
                            ? new Date(guest.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' })
                            : guest.rsvpDate
                              ? new Date(guest.rsvpDate).toLocaleDateString('fr-FR')
                              : '—'
                          }
                        </td>
                        <td className="actions-cell">
                          <button
                            className="btn-edit-small"
                            onClick={() => setEditingGuest(guest)}
                            title="Modifier ce billet"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete-small"
                            onClick={() => handleDeleteGuest(guest._id)}
                            title="Supprimer ce billet"
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
              {filteredGuests.length} billet(s) affiché(s) sur {guests.length} total
              {incomplets > 0 && <span style={{ color:'#e07b39', marginLeft:'12px' }}>• {incomplets} incomplets</span>}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;

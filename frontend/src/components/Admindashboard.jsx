import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import API_URL from '../config/api';

const GUESTS_URL = `${API_URL}/guests`;

// CATEGORIES MODIFIABLES
const DEFAULT_CATEGORIES = [
  { value: 'JF', label: 'Famille Josia', prefix: 'JF', color: '#FF69B4' },
  { value: 'JA', label: 'Amis Josia', prefix: 'JA', color: '#FFD700' },
  { value: 'UF', label: 'Famille Ulrich', prefix: 'UF', color: '#4169E1' },
  { value: 'UA', label: 'Amis Ulrich', prefix: 'UA', color: '#32CD32' },
];

const AdminDashboard = () => {
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Gestion catégories
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    value: '',
    label: '',
    prefix: '',
    color: '#999999',
  });

  // Formulaire génération
  const [genForm, setGenForm] = useState({
  count: 10,
  category: 'JF',
  prefix: 'JF',
  ticketType: 'couple',
  ticketsPerCode: 2, // ← AJOUTER CETTE LIGNE
});
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(GUESTS_URL);
      const data = await res.json();
      setGuests(data.guests || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGenResult(null);

    try {
      const res = await fetch(`${GUESTS_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genForm),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erreur génération');
        return;
      }

      setGenResult(data);
      fetchData();
    } catch (err) {
      alert('Erreur de connexion');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${GUESTS_URL}/export`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
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

  // Gestion catégories
  const handleAddCategory = () => {
    if (!newCategory.value || !newCategory.label || !newCategory.prefix) {
      alert('Tous les champs sont requis');
      return;
    }
    
    if (newCategory.prefix.length !== 2) {
      alert('Le préfixe doit contenir exactement 2 lettres');
      return;
    }

    if (categories.find(c => c.value === newCategory.value)) {
      alert('Cette catégorie existe déjà');
      return;
    }

    setCategories([...categories, { ...newCategory }]);
    setNewCategory({ value: '', label: '', prefix: '', color: '#999999' });
    setShowCategoryModal(false);
    alert('Catégorie ajoutée !');
  };

  const handleDeleteCategory = (value) => {
    if (categories.length <= 1) {
      alert('Vous devez garder au moins une catégorie');
      return;
    }
    if (!confirm(`Supprimer la catégorie "${value}" ?`)) return;
    setCategories(categories.filter(cat => cat.value !== value));
    alert('Catégorie supprimée !');
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setNewCategory(cat);
    setShowCategoryModal(true);
  };

  const handleUpdateCategory = () => {
    setCategories(categories.map(cat => 
      cat.value === editingCategory.value ? { ...newCategory } : cat
    ));
    setEditingCategory(null);
    setNewCategory({ value: '', label: '', prefix: '', color: '#999999' });
    setShowCategoryModal(false);
    alert('Catégorie mise à jour !');
  };

  // Filtres
  const filteredGuests = guests.filter(g => {
    const matchSearch = g.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (g.person1Name && g.person1Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (g.person2Name && g.person2Name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = filterCategory === 'all' || g.category === filterCategory;
    const matchStatus = filterStatus === 'all' || g.rsvpStatus === filterStatus;
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
          className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          🎫 Générer des codes
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
            
            {/* Stats globales */}
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">🎫</div>
                <div className="stat-info">
                  <h3>{stats.total}</h3>
                  <p>Codes générés</p>
                </div>
              </div>

              <div className="stat-card confirmed">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.confirmed}</h3>
                  <p>Confirmés</p>
                </div>
              </div>

              <div className="stat-card declined">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <h3>{stats.declined}</h3>
                  <p>Déclinés</p>
                </div>
              </div>

              <div className="stat-card pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pending}</h3>
                  <p>En attente</p>
                </div>
              </div>
            </div>

            {/* Stats par catégorie */}
            <div className="category-stats">
              <h2>📋 Par catégorie</h2>
              <div className="category-grid">
                {categories.map(cat => {
                  const catStats = stats.byCategory?.[cat.value] || {};
                  const total = catStats.total || 0;
                  const confirmed = catStats.confirmed || 0;
                  const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

                  return (
                    <div key={cat.value} className="category-card" style={{ borderLeftColor: cat.color }}>
                      <h3>{cat.label}</h3>
                      <div className="cat-stats-row">
                        <span className="cat-total">{total} codes</span>
                        <span className="cat-confirmed">✅ {confirmed}</span>
                        <span className="cat-pending">⏳ {catStats.pending || 0}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${rate}%`, background: cat.color }}></div>
                      </div>
                      <p className="cat-rate">{rate}% confirmés</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB: Générer codes */}
        {activeTab === 'generate' && (
          <div className="generate-tab">
            
            <div className="generate-card">
              <h2>🎫 Générer des codes d'invitation</h2>
              <p className="generate-desc">
                Créez des codes uniques par catégorie. Format : 2 lettres + 2 chiffres
              </p>

              <form onSubmit={handleGenerate} className="generate-form">
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Catégorie</label>
                    <select
                      value={genForm.category}
                      onChange={(e) => {
                        const cat = categories.find(c => c.value === e.target.value);
                        setGenForm({
                          ...genForm,
                          category: e.target.value,
                          prefix: cat?.prefix || '',
                        });
                      }}
                      className="form-select"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                   <div className="form-group">
    <label>Nombre de billets par code</label>
    <input
      type="number"
      value={genForm.ticketsPerCode}
      onChange={(e) => setGenForm({...genForm, ticketsPerCode: parseInt(e.target.value) || 1})}
      className="form-input"
      min={1}
      max={10}
      placeholder="2"
    />
    <small style={{fontSize: '0.8rem', color: '#666', marginTop: '4px', display: 'block'}}>
      Nombre de personnes autorisées avec ce code (1-10)
    </small>
  </div>

                  <div className="form-group">
                    <label>Préfixe (2 lettres)</label>
                    <input
                      type="text"
                      value={genForm.prefix}
                      onChange={(e) => setGenForm({...genForm, prefix: e.target.value.toUpperCase()})}
                      className="form-input"
                      maxLength={2}
                      placeholder="JF"
                    />
                  </div>

                  <div className="form-group">
                    <label>Nombre de codes</label>
                    <input
                      type="number"
                      value={genForm.count}
                      onChange={(e) => setGenForm({...genForm, count: parseInt(e.target.value)})}
                      className="form-input"
                      min={1}
                      max={500}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type de ticket</label>
                    <select
                      value={genForm.ticketType}
                      onChange={(e) => setGenForm({...genForm, ticketType: e.target.value})}
                      className="form-select"
                    >
                      <option value="couple">👥 Couple (2 personnes)</option>
                      <option value="simple">👤 Simple (1 personne)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-generate"
                  disabled={generating}
                >
                  {generating ? (
                    <><span className="spinner-btn"></span> Génération en cours...</>
                  ) : (
                    <><span>🎯</span> Générer {genForm.count} codes</>
                  )}
                </button>
              </form>

              {/* Résultat génération AMÉLIORÉ */}
              {genResult && (
                <div className="gen-result">
                  <div className="gen-result-header">
                    <h3>✅ {genResult.count} codes générés pour {genResult.category} !</h3>
                    <button
                      className="btn-copy-codes"
                      onClick={() => {
                        navigator.clipboard.writeText(genResult.codes.join('\n'));
                        alert('Codes copiés dans le presse-papier !');
                      }}
                    >
                      📋 Copier tous
                    </button>
                  </div>
                  
                  <div className="codes-display-scroll">
                    {genResult.codes.map((code, i) => (
                      <div key={i} className="code-chip-row">
                        <span className="code-chip">{code}</span>
                        <button
                          className="btn-copy-single"
                          onClick={() => {
                            navigator.clipboard.writeText(code);
                            const btn = document.activeElement;
                            const originalText = btn.textContent;
                            btn.textContent = '✓';
                            setTimeout(() => btn.textContent = originalText, 1000);
                          }}
                          title="Copier ce code"
                        >
                          📋
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="gen-result-actions">
                    <button
                      className="btn-view-list"
                      onClick={() => setActiveTab('guests')}
                    >
                      👥 Voir dans la liste
                    </button>
                    <button
                      className="btn-generate-more"
                      onClick={() => setGenResult(null)}
                    >
                      🔄 Générer d'autres codes
                    </button>
                  </div>
                </div>
              )}

              {/* GESTION CATÉGORIES */}
              <div className="categories-list-section">
                <h4>📁 Catégories existantes</h4>
                <div className="categories-chips">
                  {categories.map(cat => (
                    <div key={cat.value} className="category-chip" style={{borderLeftColor: cat.color}}>
                      <div className="cat-chip-info">
                        <strong>{cat.label}</strong>
                        <span>Code: {cat.value} | Préfixe: {cat.prefix}</span>
                      </div>
                      <div className="cat-chip-actions">
                        <button 
                          onClick={() => handleEditCategory(cat)}
                          title="Modifier"
                          className="btn-edit-cat"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.value)}
                          title="Supprimer"
                          className="btn-delete-cat"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    className="category-chip add-category"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    <span>➕</span>
                    Ajouter une catégorie
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB: Liste invités */}
        {activeTab === 'guests' && (
          <div className="guests-tab">
            
            {/* Filtres */}
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
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
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

            {/* Table */}
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
                    <tr>
                      <td colSpan="7" className="no-results">Aucun invité trouvé</td>
                    </tr>
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
                            {categories.find(c => c.value === guest.category)?.label || guest.category}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${guest.rsvpStatus}`}>
                            {guest.rsvpStatus === 'confirmed' && '✅ Confirmé'}
                            {guest.rsvpStatus === 'declined' && '❌ Décliné'}
                            {guest.rsvpStatus === 'pending' && '⏳ En attente'}
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

      {/* Modal Gestion Catégories */}
      {showCategoryModal && (
        <div className="category-modal-overlay" onClick={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
          setNewCategory({ value: '', label: '', prefix: '', color: '#999999' });
        }}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
            
            <div className="category-form">
              <div className="form-group">
                <label>Code (ex: JF, UA) *</label>
                <input
                  type="text"
                  value={newCategory.value}
                  onChange={(e) => setNewCategory({...newCategory, value: e.target.value.toUpperCase()})}
                  maxLength={2}
                  placeholder="JF"
                  disabled={editingCategory}
                />
              </div>

              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={newCategory.label}
                  onChange={(e) => setNewCategory({...newCategory, label: e.target.value})}
                  placeholder="Famille Josia"
                />
              </div>

              <div className="form-group">
                <label>Préfixe (2 lettres) *</label>
                <input
                  type="text"
                  value={newCategory.prefix}
                  onChange={(e) => setNewCategory({...newCategory, prefix: e.target.value.toUpperCase()})}
                  maxLength={2}
                  placeholder="JF"
                />
              </div>

              <div className="form-group">
                <label>Couleur</label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                />
              </div>

              <div className="category-modal-buttons">
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    setNewCategory({ value: '', label: '', prefix: '', color: '#999999' });
                  }}
                >
                  Annuler
                </button>
                <button 
                  className="btn-save"
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                >
                  {editingCategory ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

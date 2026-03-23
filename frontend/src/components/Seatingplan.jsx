import React, { useState, useEffect, useRef } from 'react';
import './Seatingplan.css';
import API_URL from '../config/api';

const SEATING_URL = `${API_URL}/seating`;

const SHAPES = [
  { value: 'round',       label: 'Ronde',        icon: '⭕' },
  { value: 'rectangular', label: 'Rectangulaire', icon: '▭' },
  { value: 'square',      label: 'Carrée',        icon: '▢' },
];

const PRESET_COLORS = [
  '#D4AF37','#FF69B4','#4169E1','#32CD32',
  '#FFD700','#FF6347','#9370DB','#20B2AA',
];

const SeatingPlan = () => {
  const [plan,             setPlan]             = useState(null);
  const [unassignedGuests, setUnassignedGuests] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [selectedTable,    setSelectedTable]    = useState(null);
  const [draggingTable,    setDraggingTable]    = useState(null);
  const [draggingGuest,    setDraggingGuest]    = useState(null);
  const [showTableModal,   setShowTableModal]   = useState(false);
  const [filterCategory,   setFilterCategory]   = useState('all');
  const [filterStatus,     setFilterStatus]     = useState('confirmed');
  const [tableForm,        setTableForm]        = useState({
    tableNumber: 1, tableName: '', shape: 'round', capacity: 8,
    theme: { color: '#D4AF37', icon: '' },
  });
  const canvasRef   = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x:0, y:0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [planRes, guestsRes] = await Promise.all([
        fetch(SEATING_URL),
        fetch(`${SEATING_URL}/unassigned`),
      ]);
      const planData   = await planRes.json();
      const guestsData = await guestsRes.json();
      setPlan(planData.plan);
      setUnassignedGuests(guestsData.guests || []);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      const nextNumber = plan?.tables?.length > 0
        ? Math.max(...plan.tables.map(t => t.tableNumber)) + 1
        : 1;
      const res  = await fetch(`${SEATING_URL}/tables`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...tableForm, tableNumber: nextNumber, position: { x:100, y:100 } }),
      });
      const data = await res.json();
      setPlan(data.plan);
      setShowTableModal(false);
      resetTableForm();
    } catch { alert('Erreur ajout table'); }
  };

  const handleDeleteTable = async (tableNumber) => {
    if (!confirm('Supprimer cette table ?')) return;
    try {
      const res  = await fetch(`${SEATING_URL}/tables/${tableNumber}`, { method:'DELETE' });
      const data = await res.json();
      setPlan(data.plan);
      setSelectedTable(null);
    } catch { alert('Erreur suppression'); }
  };

  const handleTableDragStart = (e, table) => {
    setDraggingTable(table);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleCanvasDragOver = (e) => e.preventDefault();

  const handleCanvasDrop = async (e) => {
    e.preventDefault();
    if (draggingTable) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top  - dragOffset.y;
      try {
        const res  = await fetch(`${SEATING_URL}/tables`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...draggingTable, position: { x, y } }),
        });
        const data = await res.json();
        setPlan(data.plan);
      } catch (err) { console.error('Erreur déplacement:', err); }
      setDraggingTable(null);
    }
    if (draggingGuest && selectedTable) {
      try {
        const res  = await fetch(`${SEATING_URL}/assign`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ guestId: draggingGuest._id, tableNumber: selectedTable.tableNumber }),
        });
        const data = await res.json();
        setPlan(data.plan);
        fetchData();
      } catch (err) { console.error('Erreur assignation:', err); }
      setDraggingGuest(null);
    }
  };

  const handleUnassignGuest = async (guestId) => {
    try {
      const res  = await fetch(`${SEATING_URL}/unassign/${guestId}`, { method:'DELETE' });
      const data = await res.json();
      setPlan(data.plan);
      fetchData();
    } catch { alert('Erreur désassignation'); }
  };

  const resetTableForm = () => setTableForm({
    tableNumber:1, tableName:'', shape:'round', capacity:8,
    theme:{ color:'#D4AF37', icon:'' },
  });

  const getGuestsAtTable = (tableNumber) => {
    if (!plan) return [];
    return plan.assignments
      .filter(a => a.tableNumber === tableNumber)
      .map(a => a.guestId)
      .filter(Boolean);
  };

  // Catégories dynamiques pour le filtre
  const allCategories = [...new Set(unassignedGuests.map(g => g.categoryLabel || g.category).filter(Boolean))];

  const filteredUnassigned = unassignedGuests.filter(g => {
    const matchCat    = filterCategory === 'all' || (g.categoryLabel || g.category) === filterCategory;
    return matchCat;
  });

  if (loading) return (
    <div className="seating-loading">
      <div className="spinner-large"></div>
      <p>Chargement du plan de table...</p>
    </div>
  );

  const exportCSV = () => {
  if (!plan) return;
  let csv = 'Table,Nom table,Invité 1,Invité 2,Code,Type,Catégorie\n';
  plan.tables.forEach(table => {
    const guests = getGuestsAtTable(table.tableNumber);
    if (guests.length === 0) {
      csv += `${table.tableNumber},"${table.tableName || `Table ${table.tableNumber}`}",,,,\n`;
    } else {
      guests.forEach(g => {
        csv += `${table.tableNumber},"${table.tableName || `Table ${table.tableNumber}`}","${g.person1Name || ''}","${g.person2Name || ''}","${g.code}","${g.ticketType}","${g.categoryLabel || g.category || ''}"\n`;
      });
    }
  });
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `plan-de-table-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportPDF = () => {
  if (!plan) return;
  let html = `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Plan de table</title>
    <style>
      body { font-family: 'Georgia', serif; padding: 40px; color: #1a1a2e; }
      h1 { text-align: center; color: #c9a84c; font-size: 28px; margin-bottom: 4px; }
      .subtitle { text-align: center; color: #888; font-size: 13px; margin-bottom: 32px; }
      .table-block { margin-bottom: 24px; break-inside: avoid; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
      .table-header { background: #1a1a2e; color: #c9a84c; padding: 10px 16px; font-weight: 700; font-size: 15px; display: flex; justify-content: space-between; }
      .table-header span { color: #888; font-size: 12px; font-weight: 400; }
      .guest-row { padding: 8px 16px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
      .guest-row:last-child { border-bottom: none; }
      .guest-code { color: #aaa; font-family: monospace; font-size: 11px; }
      .guest-cat { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
      .empty { padding: 12px 16px; color: #bbb; font-style: italic; font-size: 13px; }
      @media print { body { padding: 20px; } }
    </style></head><body>
    <h1>💍 Plan de Table</h1>
    <div class="subtitle">${plan.venue?.name || 'Salle de réception'} · ${plan.tables.length} tables · ${plan.assignments.length} invités placés · Généré le ${new Date().toLocaleDateString('fr-FR')}</div>
  `;

  plan.tables.forEach(table => {
    const guests = getGuestsAtTable(table.tableNumber);
    html += `
      <div class="table-block">
        <div class="table-header">
          Table ${table.tableNumber} — ${table.tableName || `Table ${table.tableNumber}`}
          <span>${guests.length}/${table.capacity} places</span>
        </div>
    `;
    if (guests.length === 0) {
      html += `<div class="empty">Aucun invité assigné</div>`;
    } else {
      guests.forEach(g => {
        const nom = g.person1Name || '—';
        const nom2 = g.person2Name ? ` & ${g.person2Name}` : '';
        const cat  = g.categoryLabel || g.category || '';
        html += `
          <div class="guest-row">
            <span>${nom}${nom2}</span>
            <div style="display:flex;gap:8px;align-items:center;">
              ${cat ? `<span class="guest-cat">${cat}</span>` : ''}
              <span class="guest-code">${g.code}</span>
            </div>
          </div>
        `;
      });
    }
    html += `</div>`;
  });

  html += `</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const w    = window.open(url, '_blank', 'width=900,height=700,scrollbars=yes');
  if (w) w.addEventListener('load', () => { w.print(); URL.revokeObjectURL(url); });
  else { URL.revokeObjectURL(url); alert('Autorise les popups pour ce site.'); }
};

  return (
    <div className="seating-plan">

      <header className="seating-header">
        <h1>🪑 Plan de Table</h1>
      
  <div className="header-actions">
    <button onClick={exportCSV} style={{ background:'#26a69a', color:'white', border:'none', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>
      📊 Exporter CSV
    </button>
    <button onClick={exportPDF} style={{ background:'#c9a84c', color:'#1a1a2e', border:'none', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>
      🖨️ Exporter PDF
    </button>
    <button className="btn-add-table" onClick={() => setShowTableModal(true)} style={{ background:'#5b4cc9', color:'#1a1a2e', border:'none', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>
      ➕ Ajouter une table
    </button>
  </div>
      </header>

      <div className="seating-content">

        {/* Canvas */}
        <div className="canvas-panel">
          <div className="canvas-info">
            <h3>{plan?.venue?.name || 'Salle de réception'}</h3>
            <p>{plan?.tables?.length || 0} tables · {plan?.assignments?.length || 0} invités placés</p>
          </div>
          <div
            ref={canvasRef}
            className="seating-canvas"
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            style={{ width: plan?.venue?.dimensions?.width || 1200, height: plan?.venue?.dimensions?.height || 800 }}
          >
            {plan?.tables?.map(table => {
              const guests    = getGuestsAtTable(table.tableNumber);
              const isSelected = selectedTable?.tableNumber === table.tableNumber;
              const isFull    = guests.length >= table.capacity;
              return (
                <div
                  key={table.tableNumber}
                  className={`table-item ${table.shape} ${isSelected ? 'selected' : ''} ${isFull ? 'full' : ''}`}
                  draggable
                  onDragStart={(e) => handleTableDragStart(e, table)}
                  onClick={() => setSelectedTable(table)}
                  style={{ left:table.position.x, top:table.position.y, borderColor:table.theme?.color || '#D4AF37' }}
                >
                  <div className="table-number">{table.tableNumber}</div>
                  <div className="table-name">{table.tableName || `Table ${table.tableNumber}`}</div>
                  <div className="table-count">{guests.length}/{table.capacity}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panneau droit */}
        <div className="details-panel">

          {/* Détails table sélectionnée */}
          {selectedTable ? (
            <div className="table-details">
              <div className="details-header">
                <h3>Table {selectedTable.tableNumber} — {selectedTable.tableName || ''}</h3>
                <button className="btn-delete-table" onClick={() => handleDeleteTable(selectedTable.tableNumber)}>🗑️</button>
              </div>
              <div className="table-info-grid">
                <div className="info-item">
                  <span className="label">Forme</span>
                  <span className="value">{SHAPES.find(s => s.value === selectedTable.shape)?.icon} {SHAPES.find(s => s.value === selectedTable.shape)?.label}</span>
                </div>
                <div className="info-item">
                  <span className="label">Capacité</span>
                  <span className="value">{selectedTable.capacity} places</span>
                </div>
              </div>
              <div className="table-guests">
                <h4>Invités assignés ({getGuestsAtTable(selectedTable.tableNumber).length})</h4>
                <div className="guests-list">
                  {getGuestsAtTable(selectedTable.tableNumber).map(guest => (
                    <div key={guest._id} className="guest-card">
                      <div className="guest-info">
                        <strong>{guest.person1Name || '—'}</strong>
                        {guest.person2Name && <span> & {guest.person2Name}</span>}
                        <small style={{ display:'block', color:'#aaa' }}>{guest.code}</small>
                      </div>
                      <button className="btn-unassign" onClick={() => handleUnassignGuest(guest._id)}>✕</button>
                    </div>
                  ))}
                </div>
                {getGuestsAtTable(selectedTable.tableNumber).length === 0 && (
                  <p className="empty-state">Glissez des invités ici</p>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Cliquez sur une table pour voir les détails</p>
            </div>
          )}

          {/* Invités non placés */}
          <div className="unassigned-panel">
            <h4>Invités confirmés non placés ({filteredUnassigned.length})</h4>

            {/* Filtres */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'10px', flexWrap:'wrap' }}>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                style={{ flex:1, padding:'6px 10px', borderRadius:'8px', border:'1px solid #e0e0e0', fontSize:'12px' }}
              >
                <option value="all">Toutes catégories</option>
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {filteredUnassigned.length === 0 && (
              <p style={{ color:'#aaa', fontSize:'12px', textAlign:'center', padding:'20px 0' }}>
                Tous les invités confirmés sont placés 🎉
              </p>
            )}

            <div className="unassigned-list">
              {filteredUnassigned.map(guest => (
                <div
                  key={guest._id}
                  className="guest-card unassigned"
                  draggable
                  onDragStart={() => setDraggingGuest(guest)}
                >
                  <div className="guest-info">
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <strong>{guest.person1Name || '(sans nom)'}</strong>
                      <span style={{
                        fontSize:'10px', padding:'1px 6px', borderRadius:'4px',
                        background: '#e3f2fd', color:'#1565c0', fontWeight:'700'
                      }}>
                        {guest.categoryLabel || guest.category || '—'}
                      </span>
                    </div>
                    {guest.person2Name && <span style={{ fontSize:'12px', color:'#666' }}> & {guest.person2Name}</span>}
                    <small style={{ display:'block', color:'#aaa' }}>{guest.code} · {guest.ticketType === 'couple' ? '👥' : '👤'}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajouter Table */}
      {showTableModal && (
        <div className="table-modal-overlay" onClick={() => setShowTableModal(false)}>
          <div className="table-modal" onClick={e => e.stopPropagation()}>
            <h3>Nouvelle table</h3>
            <form onSubmit={handleAddTable} className="table-form">
              <div className="form-group">
                <label>Nom (optionnel)</label>
                <input type="text" value={tableForm.tableName} onChange={e => setTableForm({...tableForm, tableName:e.target.value})} placeholder="Ex: Table d'honneur"/>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Forme</label>
                  <select value={tableForm.shape} onChange={e => setTableForm({...tableForm, shape:e.target.value})}>
                    {SHAPES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacité</label>
                  <input type="number" value={tableForm.capacity} onChange={e => setTableForm({...tableForm, capacity:parseInt(e.target.value)})} min="2" max="20"/>
                </div>
              </div>
              <div className="form-group">
                <label>Couleur</label>
                <div className="color-picker">
                  {PRESET_COLORS.map(color => (
                    <button key={color} type="button"
                      className={`color-btn ${tableForm.theme.color === color ? 'selected' : ''}`}
                      style={{ background:color }}
                      onClick={() => setTableForm({...tableForm, theme:{...tableForm.theme, color}})}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowTableModal(false)}>Annuler</button>
                <button type="submit" className="btn-save">Créer la table</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatingPlan;

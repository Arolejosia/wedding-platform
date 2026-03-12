import React, { useState, useEffect, useRef } from 'react';
import './SeatingPlan.css';
import API_URL from '../config/api';

const SEATING_PLAN_URL = `${API_URL}/api/seatingplan`;

const SHAPES = [
  { value: 'round', label: 'Ronde', icon: '⭕' },
  { value: 'rectangular', label: 'Rectangulaire', icon: '▭' },
  { value: 'square', label: 'Carrée', icon: '▢' },
];

const PRESET_COLORS = [
  '#D4AF37', '#FF69B4', '#4169E1', '#32CD32', 
  '#FFD700', '#FF6347', '#9370DB', '#20B2AA'
];

const SeatingPlan = () => {
  const [plan, setPlan] = useState(null);
  const [unassignedGuests, setUnassignedGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [draggingTable, setDraggingTable] = useState(null);
  const [draggingGuest, setDraggingGuest] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableForm, setTableForm] = useState({
    tableNumber: 1,
    tableName: '',
    shape: 'round',
    capacity: 8,
    theme: { color: '#D4AF37', icon: '' },
  });
  const canvasRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [planRes, guestsRes] = await Promise.all([
        fetch(SEATING_PLAN_URL),
        fetch(`${API_URL}/unassigned`)
      ]);
      
      const planData = await planRes.json();
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
      const nextNumber = plan.tables.length > 0 
        ? Math.max(...plan.tables.map(t => t.tableNumber)) + 1 
        : 1;

      const res = await fetch(`${API_URL}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tableForm,
          tableNumber: nextNumber,
          position: { x: 100, y: 100 },
        }),
      });

      const data = await res.json();
      setPlan(data.plan);
      setShowTableModal(false);
      resetTableForm();
    } catch (err) {
      alert('Erreur ajout table');
    }
  };

  const handleDeleteTable = async (tableNumber) => {
    if (!confirm('Supprimer cette table ?')) return;
    
    try {
      const res = await fetch(`${API_URL}/tables/${tableNumber}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      setPlan(data.plan);
      setSelectedTable(null);
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const handleTableDragStart = (e, table) => {
    setDraggingTable(table);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  const handleCanvasDrop = async (e) => {
    e.preventDefault();
    
    if (draggingTable) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      try {
        const res = await fetch(`${API_URL}/tables`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...draggingTable,
            position: { x, y },
          }),
        });

        const data = await res.json();
        setPlan(data.plan);
      } catch (err) {
        console.error('Erreur déplacement:', err);
      }
      
      setDraggingTable(null);
    }
    
    if (draggingGuest && selectedTable) {
      try {
        const res = await fetch(`${API_URL}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: draggingGuest._id,
            tableNumber: selectedTable.tableNumber,
          }),
        });

        const data = await res.json();
        setPlan(data.plan);
        fetchData(); // Refresh unassigned
      } catch (err) {
        console.error('Erreur assignation:', err);
      }
      
      setDraggingGuest(null);
    }
  };

  const handleUnassignGuest = async (guestId) => {
    try {
      const res = await fetch(`${API_URL}/unassign/${guestId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      setPlan(data.plan);
      fetchData();
    } catch (err) {
      alert('Erreur désassignation');
    }
  };

  const resetTableForm = () => {
    setTableForm({
      tableNumber: 1,
      tableName: '',
      shape: 'round',
      capacity: 8,
      theme: { color: '#D4AF37', icon: '' },
    });
  };

  const getGuestsAtTable = (tableNumber) => {
    if (!plan) return [];
    return plan.assignments
      .filter(a => a.tableNumber === tableNumber)
      .map(a => a.guestId)
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="seating-loading">
        <div className="spinner-large"></div>
        <p>Chargement du plan de table...</p>
      </div>
    );
  }

  return (
    <div className="seating-plan">
      
      <header className="seating-header">
        <h1>🪑 Plan de Table</h1>
        <div className="header-actions">
          <button className="btn-add-table" onClick={() => setShowTableModal(true)}>
            ➕ Ajouter une table
          </button>
        </div>
      </header>

      <div className="seating-content">
        
        {/* Panneau gauche - Canvas */}
        <div className="canvas-panel">
          <div className="canvas-info">
            <h3>{plan?.venue?.name || 'Salle de réception'}</h3>
            <p>{plan?.tables?.length || 0} tables • {plan?.assignments?.length || 0} invités placés</p>
          </div>

          <div
            ref={canvasRef}
            className="seating-canvas"
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            style={{
              width: plan?.venue?.dimensions?.width || 1200,
              height: plan?.venue?.dimensions?.height || 800,
            }}
          >
            {plan?.tables?.map(table => {
              const guests = getGuestsAtTable(table.tableNumber);
              const isSelected = selectedTable?.tableNumber === table.tableNumber;
              const isFull = guests.length >= table.capacity;

              return (
                <div
                  key={table.tableNumber}
                  className={`table-item ${table.shape} ${isSelected ? 'selected' : ''} ${isFull ? 'full' : ''}`}
                  draggable
                  onDragStart={(e) => handleTableDragStart(e, table)}
                  onClick={() => setSelectedTable(table)}
                  style={{
                    left: table.position.x,
                    top: table.position.y,
                    borderColor: table.theme?.color || '#D4AF37',
                  }}
                >
                  <div className="table-number">{table.tableNumber}</div>
                  <div className="table-name">{table.tableName || `Table ${table.tableNumber}`}</div>
                  <div className="table-count">{guests.length}/{table.capacity}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panneau droit - Détails */}
        <div className="details-panel">
          
          {selectedTable ? (
            <div className="table-details">
              <div className="details-header">
                <h3>Table {selectedTable.tableNumber}</h3>
                <button 
                  className="btn-delete-table"
                  onClick={() => handleDeleteTable(selectedTable.tableNumber)}
                >
                  🗑️
                </button>
              </div>

              <div className="table-info-grid">
                <div className="info-item">
                  <span className="label">Forme</span>
                  <span className="value">
                    {SHAPES.find(s => s.value === selectedTable.shape)?.icon} {SHAPES.find(s => s.value === selectedTable.shape)?.label}
                  </span>
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
                        <strong>{guest.person1Name}</strong>
                        {guest.person2Name && <span> & {guest.person2Name}</span>}
                        <small>{guest.code}</small>
                      </div>
                      <button
                        className="btn-unassign"
                        onClick={() => handleUnassignGuest(guest._id)}
                      >
                        ✕
                      </button>
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

          <div className="unassigned-panel">
            <h4>Invités non placés ({unassignedGuests.length})</h4>
            <div className="unassigned-list">
              {unassignedGuests.map(guest => (
                <div
                  key={guest._id}
                  className="guest-card unassigned"
                  draggable
                  onDragStart={() => setDraggingGuest(guest)}
                >
                  <div className="guest-info">
                    <strong>{guest.person1Name}</strong>
                    {guest.person2Name && <span> & {guest.person2Name}</span>}
                    <small>{guest.code}</small>
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
          <div className="table-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nouvelle table</h3>
            <form onSubmit={handleAddTable} className="table-form">
              <div className="form-group">
                <label>Nom de la table (optionnel)</label>
                <input
                  type="text"
                  value={tableForm.tableName}
                  onChange={(e) => setTableForm({...tableForm, tableName: e.target.value})}
                  placeholder="Ex: Table d'honneur"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Forme</label>
                  <select
                    value={tableForm.shape}
                    onChange={(e) => setTableForm({...tableForm, shape: e.target.value})}
                  >
                    {SHAPES.map(s => (
                      <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Capacité</label>
                  <input
                    type="number"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({...tableForm, capacity: parseInt(e.target.value)})}
                    min="2"
                    max="20"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Couleur</label>
                <div className="color-picker">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-btn ${tableForm.theme.color === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setTableForm({
                        ...tableForm,
                        theme: { ...tableForm.theme, color }
                      })}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowTableModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-save">
                  Créer la table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SeatingPlan;

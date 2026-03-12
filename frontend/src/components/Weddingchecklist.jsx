import React, { useState, useEffect } from 'react';
import './WeddingChecklist.css';
import { useParams } from "react-router-dom";
import API_URL from '../config/api';

const TASKS_URL = `${API_URL}/api/tasks`;


const CATEGORIES = [
  { value: 'venue', label: 'Lieu', icon: '🏛️', color: '#FF6B9D' },
  { value: 'catering', label: 'Traiteur', icon: '🍽️', color: '#4ECDC4' },
  { value: 'decoration', label: 'Décoration', icon: '🎨', color: '#FFD93D' },
  { value: 'photography', label: 'Photo/Vidéo', icon: '📸', color: '#95E1D3' },
  { value: 'music', label: 'Musique', icon: '🎵', color: '#AA96DA' },
  { value: 'invitations', label: 'Invitations', icon: '💌', color: '#FCBAD3' },
  { value: 'outfits', label: 'Tenues', icon: '👗', color: '#F38181' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#6A2C70' },
  { value: 'flowers', label: 'Fleurs', icon: '💐', color: '#B8E994' },
  { value: 'cake', label: 'Gâteau', icon: '🎂', color: '#FFA07A' },
  { value: 'paperwork', label: 'Administratif', icon: '📋', color: '#778899' },
  { value: 'other', label: 'Autre', icon: '📌', color: '#999' },
];

const PRIORITIES = [
  { value: 'low', label: 'Faible', color: '#90caf9' },
  { value: 'medium', label: 'Moyenne', color: '#ffb74d' },
  { value: 'high', label: 'Haute', color: '#ff8a65' },
  { value: 'urgent', label: 'Urgent', color: '#e57373' },
];

const WeddingChecklist = () => {
  const [showMembersModal, setShowMembersModal] = useState(false);
  const { weddingId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
const [newMember, setNewMember] = useState("");
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'other',
    description: '',
    status: 'todo',
    priority: 'medium',
    deadline: '',
    cost: 0,
    paid: false,
    supplier: { name: '', contact: '', phone: '' },
    assignedTo: [],
    notes: '',
  });
  
  const fetchMembers = async () => {

  const res = await fetch(
    `${API_URL}/api/members/${weddingId}`
  );

  const data = await res.json();

  setMembers(data);

};

const addMember = async () => {

  if (!newMember) return;

  await fetch(`${API_URL}/api/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: newMember,
      weddingId
    })
  });

  setNewMember("");
  fetchMembers();
};

const deleteMember = async (id) => {

  await fetch(`${API_URL}/members/${id}`, {
    method: "DELETE"
  });

  fetchMembers();
};

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [filterCategory, filterStatus]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);

     params.append("weddingId", weddingId);

const res = await fetch(`${API_URL}?${params}`);
      const data = await res.json();
      setTasks(data.tasks || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Erreur chargement tâches:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTasks = async () => {
  try {

    const res = await fetch(`${API_URL}/generate/${weddingId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error();

    fetchTasks();

  } catch (err) {
    alert("Erreur génération checklist");
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingTask ? `${API_URL}/${editingTask._id}` : API_URL;
      const method = editingTask ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  ...formData,
  weddingId
})
      });

      if (!res.ok) throw new Error();

      setShowModal(false);
      setEditingTask(null);
      resetForm();
      fetchTasks();
    } catch (err) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await fetch(`${API_URL}/${id}/toggle-status`, { method: 'PATCH' });
      fetchTasks();
    } catch (err) {
      console.error('Erreur toggle:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette tâche ?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      category: task.category,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      cost: task.cost || 0,
      paid: task.paid || false,
      supplier: task.supplier || { name: '', contact: '', phone: '' },
      assignedTo: task.assignedTo || [],
      notes: task.notes || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'other',
      description: '',
      status: 'todo',
      priority: 'medium',
      deadline: '',
      cost: 0,
      paid: false,
      supplier: { name: '', contact: '', phone: '' },
      assignedTo: [],
      notes: '',
    });
  };

  const isOverdue = (deadline, status) => {
    if (!deadline || status === 'done') return false;
    return new Date(deadline) < new Date();
  };

  const groupedTasks = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = tasks.filter(t => t.category === cat.value);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="checklist-loading">
        <div className="spinner-large"></div>
        <p>Chargement de la checklist...</p>
      </div>
    );
  }
  const progress = stats?.total
  ? Math.round((stats.done / stats.total) * 100)
  : 0;

  const timelineAdvice = () => {

  if (!stats) return null;

  if (stats.todo > 10) {
    return "⚠️ Beaucoup de tâches restent à faire";
  }

  if (stats.urgent > 0) {
    return "⚠️ Certaines tâches sont urgentes";
  }

  if (stats.done === stats.total) {
    return "🎉 Toutes les tâches sont terminées !";
  }

  return "✔️ Bon avancement du mariage";
};

  return (
    <div className="wedding-checklist">
      
      <header className="checklist-header">
        <div className="header-content">
          <h1>📋 Checklist Mariage</h1>
          <div className="tabs">

<button
className={activeTab === "tasks" ? "active" : ""}
onClick={() => setActiveTab("tasks")}
>
📋 Tâches
</button>
<button onClick={() => setShowMembersModal(true)}>
👥 Membres
</button>

<button
className={activeTab === "budget" ? "active" : ""}
onClick={() => setActiveTab("budget")}
>
💰 Budget
</button>

</div>
          <button className="btn-add-task" onClick={() => setShowModal(true)}>
            ➕ Nouvelle tâche
          </button>
          <button className="btn-generate" onClick={generateTasks}>
✨ Générer les tâches
</button>
<div className="progress-bar">
  <div
    className="progress-fill"
    style={{ width: `${progress}%` }}
  />
</div>

<p className="progress-text">
Checklist complétée à {progress}%
</p>
<div className="timeline-advice">
{timelineAdvice()}
</div>
        </div>

        {stats && (
          <div className="checklist-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.done}/{stats.total}</span>
              <span className="stat-label">Terminées</span>
            </div>
            <div className="stat-item urgent">
              <span className="stat-value">{stats.urgent}</span>
              <span className="stat-label">Urgentes</span>
            </div>
            <div className="stat-item overdue">
              <span className="stat-value">{stats.overdue}</span>
              <span className="stat-label">En retard</span>
            </div>
            <div className="stat-item budget">
              <span className="stat-value">
                {stats.totalPaid?.toLocaleString('fr-FR')} / {stats.totalCost?.toLocaleString('fr-FR')} FCFA
              </span>
              <span className="stat-label">Payé / Total</span>
            </div>
          </div>
        )}

        <div className="checklist-filters">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
            <option value="all">Toutes catégories</option>
            {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">Tous statuts</option>
            <option value="todo">À faire</option>
            <option value="in-progress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </div>
      </header>

      <div className="checklist-content">
        {CATEGORIES.filter(cat => filterCategory === 'all' || filterCategory === cat.value).map(cat => {
          const catTasks = groupedTasks[cat.value] || [];
          if (catTasks.length === 0) return null;
          return (
            <div key={cat.value} className="category-section">
              <div className="category-header" style={{ borderLeftColor: cat.color }}>
                <h3><span className="cat-icon">{cat.icon}</span>{cat.label}<span className="cat-count">({catTasks.length})</span></h3>
              </div>
              <div className="tasks-list">
                {catTasks.map(task => (
                  <div key={task._id} className={`task-card ${task.status} ${isOverdue(task.deadline, task.status) ? 'overdue' : ''}`}>
                    <div className="task-main">
                      <button className="task-checkbox" onClick={() => handleToggleStatus(task._id)}>
                        {task.status === 'done' && '✓'}
                        {task.status === 'in-progress' && '⏳'}
                      </button>
                      <div className="task-info">
                        <h4>{task.title}</h4>
                        {task.description && <p className="task-desc">{task.description}</p>}
                        <div className="task-meta">
                          {task.deadline && <span className="meta-item deadline">📅 {new Date(task.deadline).toLocaleDateString('fr-FR')}</span>}
                          {task.assignedTo && <span className="meta-item assigned">👤{Array.isArray(task.assignedTo)
                              ? task.assignedTo.join(", ")
                            : task.assignedTo}</span>}
                          {task.cost > 0 && (
<span className={`meta-item cost ${task.paid ? 'paid' : ''}`}>
💰 {task.cost.toLocaleString('fr-FR')} FCFA 
{task.paid ? " ✅ payé" : " ⏳ à payer"}
</span>
)}
                        </div>
                      </div>
                      <div className="task-actions">
                        <span className="priority-badge" style={{ background: PRIORITIES.find(p => p.value === task.priority)?.color }}>
                          {PRIORITIES.find(p => p.value === task.priority)?.label}
                        </span>
                        <button className="btn-edit" onClick={() => handleEdit(task)}>✏️</button>
                        <button className="btn-delete" onClick={() => handleDelete(task._id)}>🗑️</button>
                      </div>
                    </div>
                    {task.supplier?.name && <div className="task-supplier">📞 {task.supplier.name}{task.supplier.phone && ` - ${task.supplier.phone}`}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
 
{activeTab === "budget" && (
<div>
Budget du mariage
</div>
)}
      {showMembersModal && (
<div 
className="task-modal-overlay"
onClick={() => setShowMembersModal(false)}
>

<div 
className="task-modal"
onClick={(e)=>e.stopPropagation()}
>

<h3>👥 Commite d'organisation du mariage du mariage</h3>

<div className="add-member">
<input
type="text"
placeholder="Nom du membre"
value={newMember}
onChange={(e)=>setNewMember(e.target.value)}
/>

<button onClick={addMember}>
Ajouter
</button>
</div>

<div className="members-list">
{members.map(member => (
<div key={member._id} className="member-item">

<span>{member.name}</span>

<button onClick={()=>deleteMember(member._id)}>
❌
</button>

</div>
))}
</div>

<div className="modal-buttons">
<button 
className="btn-cancel"
onClick={()=>setShowMembersModal(false)}
>
Fermer
</button>
</div>

</div>
</div>
)}

      {showModal && (
        <div className="task-modal-overlay" onClick={() => { setShowModal(false); setEditingTask(null); resetForm(); }}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h3>
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label>Titre de la tâche *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Réserver le lieu de réception" required />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priorité</label>
                  <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Détails de la tâche..." rows="3" />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Date limite</label>
                  <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                </div>
            <div className="form-group">

<label>Assigné à</label>

{members.map(member => (

<label key={member._id}>

<input
type="checkbox"

checked={formData.assignedTo.includes(member._id)}

onChange={(e)=>{

let updated=[...formData.assignedTo];

if(e.target.checked){
updated.push(member._id);
}else{
updated=updated.filter(id=>id!==member._id);
}

setFormData({
...formData,
assignedTo:updated
});

}}
/>

{member.name}

</label>

))}

</div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Coût (FCFA)</label>
                  <input type="number" value={formData.cost} onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value) || 0})} min="0" />
                </div>
                <div className="form-group checkbox-group">
                  <label><input type="checkbox" checked={formData.paid} onChange={(e) => setFormData({...formData, paid: e.target.checked})} /><span>Déjà payé</span></label>
                </div>
              </div>
              <div className="form-section">
                <h4>Fournisseur (optionnel)</h4>
                <div className="form-group">
                  <label>Nom du fournisseur</label>
                  <input type="text" value={formData.supplier.name} onChange={(e) => setFormData({...formData, supplier: {...formData.supplier, name: e.target.value}})} placeholder="Ex: Hôtel Hilton" />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Contact</label>
                    <input type="text" value={formData.supplier.contact} onChange={(e) => setFormData({...formData, supplier: {...formData.supplier, contact: e.target.value}})} placeholder="Nom du contact" />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" value={formData.supplier.phone} onChange={(e) => setFormData({...formData, supplier: {...formData.supplier, phone: e.target.value}})} placeholder="+237 6XX XX XX XX" />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Notes supplémentaires..." rows="2" />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); setEditingTask(null); resetForm(); }}>Annuler</button>
                <button type="submit" className="btn-save">{editingTask ? 'Mettre à jour' : 'Créer la tâche'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
    
  );
};

export default WeddingChecklist;

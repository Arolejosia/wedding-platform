// src/components/Adminlayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Adminlayout.css';

const AdminLayout = ({ children, weddingId, weddingSlug, coupleName, onLogout }) => {
  const location = useLocation();
  const adminBase = `/admin/${weddingId}`;
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
       <div className="admin-sidebar-header">

  <h2>💍 Espace Admin</h2>

  <div className="admin-wedding-header">

    <p>{coupleName || 'Mon mariage'}</p>

    <Link 
      to={`/admin/${weddingId}/share`}
      className="btn-share-site"
    >
      🔗 Partager
    </Link>
    <Link 
  to={`/w/${weddingSlug}`}
  target="_blank"
  className="btn-view-site"
>
  🌐 Voir
</Link>

  </div>

</div>

        <div className="admin-menu">
          <Link to="/dashboard" className={`menu-item ${isActive('/dashboard')}`}>
            <span className="menu-icon">🏠</span>
            <span className="menu-label">Mes mariages</span>
          </Link>
          <Link to={adminBase} className={`menu-item ${location.pathname === adminBase ? 'active' : ''}`}>
            <span className="menu-icon">📊</span>
            <span className="menu-label">Dashboard</span>
          </Link>
          <Link to={`${adminBase}/checklist`} className={`menu-item ${isActive(`${adminBase}/checklist`)}`}>
            <span className="menu-icon">📋</span>
            <span className="menu-label">Checklist</span>
          </Link>
          <Link to={`${adminBase}/photos`} className={`menu-item ${isActive(`${adminBase}/photos`)}`}>
  <span className="menu-icon">📸</span>
  <span className="menu-label">Photos</span>
</Link>
          <Link to={`${adminBase}/seating`} className={`menu-item ${isActive(`${adminBase}/seating`)}`}>
            <span className="menu-icon">🪑</span>
            <span className="menu-label">Plan de table</span>
          </Link>
          <Link to={`${adminBase}/budget`} className={`menu-item ${isActive(`${adminBase}/budget`)}`}>
            <span className="menu-icon">💰</span>
            <span className="menu-label">Budget</span>
          </Link>
          <Link to={`${adminBase}/settings`} className={`menu-item ${isActive(`${adminBase}/settings`)}`}>
            <span className="menu-icon">⚙️</span>
            <span className="menu-label">Paramètres</span>
          </Link>
        </div>

        <div className="admin-sidebar-footer">
          <a href="/" className="btn-back-home">🏠 Retour au site</a>
          <button onClick={onLogout} className="btn-logout">🚪 Déconnexion</button>
        </div>
      </nav>

      <div className="admin-main">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

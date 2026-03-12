import React, { useState } from 'react';
import './AdminLogin.css';

// Mot de passe admin (à mettre dans .env en production)
const ADMIN_PASSWORD = 'JU2026'; // Changez ce mot de passe !

const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simuler un délai de vérification
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        // Sauvegarder la session
        localStorage.setItem('admin_session', 'authenticated');
        onLoginSuccess();
      } else {
        setError('Mot de passe incorrect');
        setPassword('');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-bg"></div>
      
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-lock-icon">🔐</div>
          <h1>Dashboard Admin</h1>
          <p>Mariage Josia & Ulrich</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Mot de passe administrateur</label>
            <input
              type="password"
              className="admin-password-input"
              placeholder="Entrez le mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading || !password}
          >
            {loading ? (
              <>
                <span className="spinner-login"></span>
                Vérification...
              </>
            ) : (
              <>
                <span>🔓</span>
                Accéder au dashboard
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Accès réservé aux administrateurs uniquement</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

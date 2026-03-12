// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    partner1FirstName: '',
    partner1LastName: '',
    partner2FirstName: '',
    partner2LastName: '',
    weddingDate: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Les champs marqués * sont requis');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    // Appel API
    const result = await register(formData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card large">
        <div className="auth-header">
          <h1>✨ Créer mon espace mariage</h1>
          <p>Commencez à organiser votre grand jour</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Compte */}
          <div className="form-section">
            <h3>📧 Votre compte</h3>
            
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="firstName">Prénom *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Josia"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nom *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Arole"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="password">Mot de passe * (min 6 caractères)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {/* Couple */}
          <div className="form-section">
            <h3>💑 Le couple</h3>
            
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="partner1FirstName">Prénom marié(e) 1</label>
                <input
                  type="text"
                  id="partner1FirstName"
                  name="partner1FirstName"
                  value={formData.partner1FirstName}
                  onChange={handleChange}
                  placeholder="Josia"
                />
              </div>

              <div className="form-group">
                <label htmlFor="partner1LastName">Nom marié(e) 1</label>
                <input
                  type="text"
                  id="partner1LastName"
                  name="partner1LastName"
                  value={formData.partner1LastName}
                  onChange={handleChange}
                  placeholder="Arole"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="partner2FirstName">Prénom marié(e) 2</label>
                <input
                  type="text"
                  id="partner2FirstName"
                  name="partner2FirstName"
                  value={formData.partner2FirstName}
                  onChange={handleChange}
                  placeholder="Ulrich"
                />
              </div>

              <div className="form-group">
                <label htmlFor="partner2LastName">Nom marié(e) 2</label>
                <input
                  type="text"
                  id="partner2LastName"
                  name="partner2LastName"
                  value={formData.partner2LastName}
                  onChange={handleChange}
                  placeholder="Lele"
                />
              </div>
            </div>
          </div>

          {/* Mariage */}
          <div className="form-section">
            <h3>💍 Le mariage</h3>
            
            <div className="form-group">
              <label htmlFor="weddingDate">Date du mariage</label>
              <input
                type="date"
                id="weddingDate"
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Création...' : '✨ Créer mon espace mariage'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Déjà un compte ?{' '}
            <Link to="/login" className="auth-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

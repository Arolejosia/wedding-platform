// src/components/dashboard/CreateWeddingModal.jsx
import React, { useState } from 'react';

import API_URL from '../../config/api';

const  API = API_URL; // ✅ centralisé, pas de "magic string" dans le code

const CreateWeddingModal = ({ onClose, onSuccess, token }) => {
  const [formData, setFormData] = useState({
    person1FirstName: '',
    person1LastName:  '',
    person2FirstName: '',
    person2LastName:  '',
    weddingDate:      '',
    venueName:        '',
    venueCity:        '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const getToken = () =>
    token ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ✅ Seulement prénom marié(e) 1 et date obligatoires
    if (!formData.person1FirstName.trim()) {
      setError('Le prénom du/de la marié(e) 1 est requis');
      return;
    }
    if (!formData.weddingDate) {
      setError('La date du mariage est requise');
      return;
    }

    const authToken = getToken();
    if (!authToken) {
      setError('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/weddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la création');
      onSuccess(data.wedding);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✨ Créer un nouveau mariage</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">⚠️ {error}</div>}

          <div className="form-section">
            <h3>💑 Le couple</h3>

            <div className="form-row-2">
              <div className="form-group">
                <label>Prénom marié(e) 1 *</label>
                <input type="text" name="person1FirstName"
                  value={formData.person1FirstName} onChange={handleChange}
                  placeholder="Pierre" />
              </div>
              <div className="form-group">
                <label>Nom marié(e) 1</label>
                <input type="text" name="person1LastName"
                  value={formData.person1LastName} onChange={handleChange}
                  placeholder="Dupont (optionnel)" />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Prénom marié(e) 2</label>
                <input type="text" name="person2FirstName"
                  value={formData.person2FirstName} onChange={handleChange}
                  placeholder="Marie (optionnel)" />
              </div>
              <div className="form-group">
                <label>Nom marié(e) 2</label>
                <input type="text" name="person2LastName"
                  value={formData.person2LastName} onChange={handleChange}
                  placeholder="Martin (optionnel)" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>💍 Le mariage</h3>
            <div className="form-group">
              <label>Date du mariage *</label>
              <input type="date" name="weddingDate"
                value={formData.weddingDate} onChange={handleChange} />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Lieu (nom)</label>
                <input type="text" name="venueName"
                  value={formData.venueName} onChange={handleChange}
                  placeholder="Château de... (optionnel)" />
              </div>
              <div className="form-group">
                <label>Ville</label>
                <input type="text" name="venueCity"
                  value={formData.venueCity} onChange={handleChange}
                  placeholder="Paris (optionnel)" />
              </div>
            </div>
          </div>

          <p className="form-note">* Champs obligatoires</p>

          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Création...' : '✨ Créer le mariage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWeddingModal;

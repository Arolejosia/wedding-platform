import React, { useState } from 'react';
import './CodeModal.css';
import API_URL from '../config/api';

const CodeModal = ({ wedding, onCodeVerified, onClose }) => {
  const API = `${API_URL}/guests`;  // ← bonne URL
  // ✅ DYNAMIQUE - API avec wedding
  
  
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 4) {
      setError('Le code doit contenir 4 caractères (2 lettres + 2 chiffres)');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const res = await fetch(`${API}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.toUpperCase(),
          weddingId: wedding._id  // ← AJOUTÉ
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Code invalide');
        setVerifying(false);
        return;
      }

      // Code valide - sauvegarder et fermer
      localStorage.setItem('wedding_guest_code', code.toUpperCase());
      onCodeVerified(data.guest);
      
    } catch (err) {
      setError('Erreur de connexion. Réessayez.');
      setVerifying(false);
    }
  };

  return (
    <div className="code-modal-overlay" onClick={onClose}>
      <div className="code-modal" onClick={(e) => e.stopPropagation()}>
        
        <button className="code-modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>

        <div className="code-modal-icon">🎫</div>
        
        <h2 className="code-modal-title">Code d'Invitation</h2>
        
        <p className="code-modal-text">
          Entrez le code à 4 caractères que vous avez reçu par WhatsApp
          <br />
          <small style={{color: '#999', fontSize: '0.88rem', marginTop: '5px', display: 'block'}}>
            Format: 2 lettres + 2 chiffres (ex: JF12, UA05)
          </small>
        </p>

        <form onSubmit={handleSubmit} className="code-form">
          <input
            type="text"
            className="code-input"
            placeholder="JF12"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            autoFocus
            disabled={verifying}
          />

          {error && <div className="code-error">{error}</div>}

          <button
            type="submit"
            className="code-submit-btn"
            disabled={verifying || code.length !== 4}
          >
            {verifying ? (
              <>
                <span className="spinner-small"></span>
                Vérification...
              </>
            ) : (
              <>
                <span>✓</span>
                Valider le code
              </>
            )}
          </button>
        </form>

        <p className="code-modal-help">
          Vous n'avez pas reçu de code ? Veuillez contactez la personne qui vous invite pour le code
        </p>

      </div>
    </div>
  );
};

export default CodeModal;

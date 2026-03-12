import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { THEMES } from "../config/themes";
import "./RegisterWedding.css";

const RegisterWedding = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    person1FirstName: "",
    person1LastName: "",
    person1Photo: "",

    person2FirstName: "",
    person2LastName: "",
    person2Photo: "",

    weddingDate: "",
    venueName: "",
    venueCity: "",
    venueCountry: "",
    venueAddress: "",

    primaryColor: "#0A2463",
    secondaryColor: "#D4AF37",
    fontFamily: "Playfair Display",
    style: "classic",

    enableStory: true,
    enableEventInfo: true,
    enableDressCode: true,
    enablePhotoChallenge: true,
    enableGuestbook: true,

    customSlug: "",
    language: "fr",
    timezone: "Africa/Douala"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  ========================================
  RÉCUPÉRATION SESSION DE CRÉATION
  ========================================
  */

  useEffect(() => {

    const session = JSON.parse(sessionStorage.getItem("creationSession"));

    if (!session) return;

    const theme = THEMES[session.theme];

    setFormData(prev => ({
      ...prev,

      person1FirstName: session.person1 || prev.person1FirstName,
      person2FirstName: session.person2 || prev.person2FirstName,
      weddingDate: session.date || prev.weddingDate,

      primaryColor: theme?.primary || prev.primaryColor,
      secondaryColor: theme?.secondary || prev.secondaryColor,
      fontFamily: theme?.font || prev.fontFamily
    }));

    if (session.person1 && session.person2) {
      setCurrentStep(2);
    }

  }, []);
  // ========== HANDLERS ==========
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.person1FirstName || !formData.person2FirstName) {
          setError('Veuillez entrer les prénoms des deux mariés');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.weddingDate || !formData.venueCity) {
          setError('Date et ville du mariage requises');
          return false;
        }
        return true;
      
      case 3:
        return true; // Couleurs ont des valeurs par défaut
      
      case 4:
        return true; // Au moins une section par défaut
      
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Générer slug si pas fourni
      const slug = formData.customSlug || 
        `${formData.person1FirstName}-${formData.person2FirstName}`.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');

      // Préparer les données pour l'API
      const weddingData = {
        couple: {
          person1: {
            firstName: formData.person1FirstName,
            lastName: formData.person1LastName,
            photo: formData.person1Photo
          },
          person2: {
            firstName: formData.person2FirstName,
            lastName: formData.person2LastName,
            photo: formData.person2Photo
          }
        },
        weddingDate: formData.weddingDate,
        venue: {
          name: formData.venueName,
          city: formData.venueCity,
          country: formData.venueCountry,
          address: formData.venueAddress
        },
        settings: {
          theme: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            fontFamily: formData.fontFamily,
            style: formData.style
          },
          language: formData.language,
          timezone: formData.timezone,
          features: {
            countdown: true,
            music: false,
            animations: true
          }
        },
        story: {
          enabled: formData.enableStory,
          title: 'Notre Histoire',
          content: '<p>Racontez votre histoire ici...</p>'
        },
        eventInfo: {
          enabled: formData.enableEventInfo,
          title: 'Programme',
          ceremony: {
            title: 'Cérémonie',
            time: '',
            location: formData.venueName,
            address: formData.venueAddress
          }
        },
        dressCode: {
          enabled: formData.enableDressCode,
          title: 'Code Vestimentaire',
          theme: '',
          description: ''
        },
        photoChallenge: {
          enabled: formData.enablePhotoChallenge,
          title: 'Mission Photos',
          description: 'Capturez les moments magiques !',
          hashtag: slug.replace(/-/g, ''),
          uploadEnabled: true
        },
        guestbook: {
          enabled: formData.enableGuestbook,
          title: 'Livre d\'Or',
          requireApproval: false
        },
        invitation: {
          message: 'Nous serons honorés et heureux de votre présence !'
        },
        navigation: {
          showStory: formData.enableStory,
          showEventInfo: formData.enableEventInfo,
          showDressCode: formData.enableDressCode,
          showPhotos: formData.enablePhotoChallenge,
          showGuestbook: formData.enableGuestbook,
          customLinks: []
        },
        footer: {
          message: 'Avec amour',
          socialLinks: {}
        },
        customSlug: slug
      };

      // Appel API
      const token = localStorage.getItem('token');
      const response = await fetch('API_URL/api/weddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(weddingData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      // Redirection vers le dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error('Erreur création:', err);
      setError(err.message || 'Erreur lors de la création du mariage');
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER STEPS ==========
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Couple formData={formData} handleChange={handleChange} />;
      case 2:
        return <Step2DateVenue formData={formData} handleChange={handleChange} />;
      case 3:
        return <Step3ThemeColors formData={formData} handleChange={handleChange} />;
      case 4:
        return <Step4Sections formData={formData} handleChange={handleChange} />;
      case 5:
        return <Step5Preview formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="register-wedding-page">
      {/* Progress Bar */}
      <div className="wizard-progress">
        {[1, 2, 3, 4, 5].map(step => (
          <div 
            key={step}
            className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
          >
            <div className="step-circle">{step}</div>
            <div className="step-label">
              {step === 1 && 'Couple'}
              {step === 2 && 'Date & Lieu'}
              {step === 3 && 'Thème'}
              {step === 4 && 'Sections'}
              {step === 5 && 'Validation'}
            </div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="wizard-content">
        <div className="wizard-card">
          {renderStep()}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="wizard-buttons">
            {currentStep > 1 && (
              <button 
                type="button"
                className="btn-secondary"
                onClick={prevStep}
                disabled={loading}
              >
                ← Précédent
              </button>
            )}

            {currentStep < 5 ? (
              <button 
                type="button"
                className="btn-primary"
                onClick={nextStep}
              >
                Suivant →
              </button>
            ) : (
              <button 
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Création...' : '✓ Créer mon site'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// STEP 1 : COUPLE
// ========================================
const Step1Couple = ({ formData, handleChange }) => (
  <div className="wizard-step">
    <h2 className="step-title">👫 Les Mariés</h2>
    <p className="step-subtitle">Qui êtes-vous ?</p>

    <div className="form-grid">
      <div className="form-group">
        <label>Prénom (Personne 1) *</label>
        <input
          type="text"
          name="person1FirstName"
          value={formData.person1FirstName}
          onChange={handleChange}
          placeholder="Ex: Marie"
          required
        />
      </div>

      <div className="form-group">
        <label>Nom (Personne 1)</label>
        <input
          type="text"
          name="person1LastName"
          value={formData.person1LastName}
          onChange={handleChange}
          placeholder="Ex: Dupont"
        />
      </div>
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label>Prénom (Personne 2) *</label>
        <input
          type="text"
          name="person2FirstName"
          value={formData.person2FirstName}
          onChange={handleChange}
          placeholder="Ex: Jean"
          required
        />
      </div>

      <div className="form-group">
        <label>Nom (Personne 2)</label>
        <input
          type="text"
          name="person2LastName"
          value={formData.person2LastName}
          onChange={handleChange}
          placeholder="Ex: Martin"
        />
      </div>
    </div>

    <div className="form-group">
      <label>URL Slug (optionnel)</label>
      <input
        type="text"
        name="customSlug"
        value={formData.customSlug}
        onChange={handleChange}
        placeholder="Ex: marie-jean-2026"
      />
      <small>Votre site sera accessible sur : /w/{formData.customSlug || 'votre-slug'}</small>
    </div>
  </div>
);

// ========================================
// STEP 2 : DATE & VENUE
// ========================================
const Step2DateVenue = ({ formData, handleChange }) => (
  <div className="wizard-step">
    <h2 className="step-title">📅 Date & Lieu</h2>
    <p className="step-subtitle">Quand et où se marient-ils ?</p>

    <div className="form-group">
      <label>Date du Mariage *</label>
      <input
        type="date"
        name="weddingDate"
        value={formData.weddingDate}
        onChange={handleChange}
        required
      />
    </div>

    <div className="form-group">
      <label>Nom du Lieu</label>
      <input
        type="text"
        name="venueName"
        value={formData.venueName}
        onChange={handleChange}
        placeholder="Ex: Château de Versailles"
      />
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label>Ville *</label>
        <input
          type="text"
          name="venueCity"
          value={formData.venueCity}
          onChange={handleChange}
          placeholder="Ex: Paris"
          required
        />
      </div>

      <div className="form-group">
        <label>Pays *</label>
        <input
          type="text"
          name="venueCountry"
          value={formData.venueCountry}
          onChange={handleChange}
          placeholder="Ex: France"
          required
        />
      </div>
    </div>

    <div className="form-group">
      <label>Adresse Complète</label>
      <textarea
        name="venueAddress"
        value={formData.venueAddress}
        onChange={handleChange}
        placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
        rows="3"
      />
    </div>
  </div>
);

// ========================================
// STEP 3 : THEME & COLORS
// ========================================
const Step3ThemeColors = ({ formData, handleChange }) => (
  <div className="wizard-step">
    <h2 className="step-title">🎨 Thème & Couleurs</h2>
    <p className="step-subtitle">Personnalisez l'apparence de votre site</p>

    <div className="form-grid">
      <div className="form-group">
        <label>Couleur Principale</label>
        <input
          type="color"
          name="primaryColor"
          value={formData.primaryColor}
          onChange={handleChange}
        />
        <small>{formData.primaryColor}</small>
      </div>

      <div className="form-group">
        <label>Couleur Secondaire</label>
        <input
          type="color"
          name="secondaryColor"
          value={formData.secondaryColor}
          onChange={handleChange}
        />
        <small>{formData.secondaryColor}</small>
      </div>
    </div>

    <div className="form-group">
      <label>Style du Site</label>
      <select 
        name="style"
        value={formData.style}
        onChange={handleChange}
      >
        <option value="classic">Classique Élégant</option>
        <option value="modern">Moderne Minimaliste</option>
        <option value="romantic">Romantique</option>
        <option value="rustic">Champêtre</option>
      </select>
    </div>

    <div className="form-group">
      <label>Police de Caractères</label>
      <select 
        name="fontFamily"
        value={formData.fontFamily}
        onChange={handleChange}
      >
        <option value="Playfair Display">Playfair Display (Élégant)</option>
        <option value="Cormorant Garamond">Cormorant Garamond (Raffiné)</option>
        <option value="Montserrat">Montserrat (Moderne)</option>
        <option value="Great Vibes">Great Vibes (Romantique)</option>
      </select>
    </div>
  </div>
);

// ========================================
// STEP 4 : SECTIONS
// ========================================
const Step4Sections = ({ formData, handleChange }) => (
  <div className="wizard-step">
    <h2 className="step-title">⚙️ Sections du Site</h2>
    <p className="step-subtitle">Quelles sections voulez-vous activer ?</p>

    <div className="sections-grid">
      <label className="section-checkbox">
        <input
          type="checkbox"
          name="enableStory"
          checked={formData.enableStory}
          onChange={handleChange}
        />
        <div className="section-card">
          <div className="section-icon">📖</div>
          <div className="section-info">
            <strong>Notre Histoire</strong>
            <small>Racontez votre rencontre</small>
          </div>
        </div>
      </label>

      <label className="section-checkbox">
        <input
          type="checkbox"
          name="enableEventInfo"
          checked={formData.enableEventInfo}
          onChange={handleChange}
        />
        <div className="section-card">
          <div className="section-icon">📅</div>
          <div className="section-info">
            <strong>Programme</strong>
            <small>Horaires et lieux</small>
          </div>
        </div>
      </label>

      <label className="section-checkbox">
        <input
          type="checkbox"
          name="enableDressCode"
          checked={formData.enableDressCode}
          onChange={handleChange}
        />
        <div className="section-card">
          <div className="section-icon">👔</div>
          <div className="section-info">
            <strong>Code Vestimentaire</strong>
            <small>Indiquez le dress code</small>
          </div>
        </div>
      </label>

      <label className="section-checkbox">
        <input
          type="checkbox"
          name="enablePhotoChallenge"
          checked={formData.enablePhotoChallenge}
          onChange={handleChange}
        />
        <div className="section-card">
          <div className="section-icon">📸</div>
          <div className="section-info">
            <strong>Mission Photos</strong>
            <small>Album partagé</small>
          </div>
        </div>
      </label>

      <label className="section-checkbox">
        <input
          type="checkbox"
          name="enableGuestbook"
          checked={formData.enableGuestbook}
          onChange={handleChange}
        />
        <div className="section-card">
          <div className="section-icon">💌</div>
          <div className="section-info">
            <strong>Livre d'Or</strong>
            <small>Messages des invités</small>
          </div>
        </div>
      </label>
    </div>
  </div>
);

// ========================================
// STEP 5 : PREVIEW
// ========================================
const Step5Preview = ({ formData }) => (
  <div className="wizard-step">
    <h2 className="step-title">✨ Récapitulatif</h2>
    <p className="step-subtitle">Vérifiez vos informations avant de créer votre site</p>

    <div className="preview-section">
      <h3>👫 Couple</h3>
      <p><strong>{formData.person1FirstName} {formData.person1LastName}</strong> & <strong>{formData.person2FirstName} {formData.person2LastName}</strong></p>
    </div>

    <div className="preview-section">
      <h3>📅 Mariage</h3>
      <p>{new Date(formData.weddingDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p>{formData.venueCity}, {formData.venueCountry}</p>
    </div>

    <div className="preview-section">
      <h3>🎨 Thème</h3>
      <div className="color-preview">
        <div className="color-box" style={{ background: formData.primaryColor }}></div>
        <div className="color-box" style={{ background: formData.secondaryColor }}></div>
      </div>
      <p>{formData.fontFamily} - Style {formData.style}</p>
    </div>

    <div className="preview-section">
      <h3>⚙️ Sections Activées</h3>
      <ul>
        {formData.enableStory && <li>✓ Notre Histoire</li>}
        {formData.enableEventInfo && <li>✓ Programme</li>}
        {formData.enableDressCode && <li>✓ Code Vestimentaire</li>}
        {formData.enablePhotoChallenge && <li>✓ Mission Photos</li>}
        {formData.enableGuestbook && <li>✓ Livre d'Or</li>}
      </ul>
    </div>

    <div className="preview-section">
      <h3>🔗 URL du site</h3>
      <p className="site-url">/w/{formData.customSlug || `${formData.person1FirstName}-${formData.person2FirstName}`.toLowerCase()}</p>
    </div>
  </div>
);

export default RegisterWedding;

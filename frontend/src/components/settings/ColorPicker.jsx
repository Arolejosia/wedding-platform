// src/components/settings/ColorPicker.jsx
import React, { useState } from 'react';

const ColorPicker = ({ color, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Palettes de couleurs prédéfinies
  const presets = [
    // Bleus
    { name: 'Bleu Royal', color: '#0A2463' },
    { name: 'Bleu Ciel', color: '#87CEEB' },
    { name: 'Bleu Marine', color: '#000080' },
    { name: 'Bleu Turquoise', color: '#40E0D0' },
    
    // Ors et Jaunes
    { name: 'Or Champagne', color: '#D4AF37' },
    { name: 'Or Rose', color: '#B76E79' },
    { name: 'Jaune Pâle', color: '#FFFACD' },
    { name: 'Moutarde', color: '#FFDB58' },
    
    // Roses et Rouges
    { name: 'Rose Poudré', color: '#FFB6C1' },
    { name: 'Rose Fuchsia', color: '#FF69B4' },
    { name: 'Bordeaux', color: '#800020' },
    { name: 'Rouge Passion', color: '#DC143C' },
    
    // Verts
    { name: 'Vert Sauge', color: '#87AE73' },
    { name: 'Vert Émeraude', color: '#50C878' },
    { name: 'Vert Olive', color: '#808000' },
    { name: 'Vert Forêt', color: '#228B22' },
    
    // Neutres
    { name: 'Beige', color: '#F5F5DC' },
    { name: 'Ivoire', color: '#FFFFF0' },
    { name: 'Gris Perle', color: '#E5E4E2' },
    { name: 'Charbon', color: '#36454F' },
  ];

  return (
    <div className="color-picker">
      
      {/* Bouton avec couleur actuelle */}
      <div className="color-picker-button" onClick={() => setShowPicker(!showPicker)}>
        <div 
          className="color-preview-swatch" 
          style={{ background: color }}
        ></div>
        <span className="color-value">{color}</span>
        <span className="dropdown-arrow">{showPicker ? '▲' : '▼'}</span>
      </div>

      {/* Panel avec couleurs */}
      {showPicker && (
        <div className="color-picker-panel">
          
          {/* Input manuel */}
          <div className="color-input-section">
            <label>Code couleur :</label>
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#0A2463"
              maxLength={7}
            />
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="native-color-picker"
            />
          </div>

          {/* Palettes prédéfinies */}
          <div className="color-presets">
            <label>Couleurs populaires :</label>
            <div className="presets-grid">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  className={`preset-item ${color === preset.color ? 'active' : ''}`}
                  style={{ background: preset.color }}
                  onClick={() => {
                    onChange(preset.color);
                    setShowPicker(false);
                  }}
                  title={preset.name}
                >
                  {color === preset.color && '✓'}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ColorPicker;

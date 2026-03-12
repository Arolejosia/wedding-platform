// components/Gifts.jsx — Section cadeaux restructurée (4 blocs)
import React, { useState } from 'react';
import './Gifts.css';

// ── Helpers ───────────────────────────────────────────────────────
const fmt = (amount, currency) => {
  if (!amount) return '';
  if (currency === 'FCFA') return `${Number(amount).toLocaleString('fr-FR')} FCFA`;
  if (currency === 'CAD')  return `${Number(amount).toLocaleString('fr-CA', { style:'currency', currency:'CAD' })}`;
  if (currency === 'EUR')  return `${Number(amount).toLocaleString('fr-FR', { style:'currency', currency:'EUR' })}`;
  return `${Number(amount).toLocaleString()} ${currency}`;
};
const pct = (c, g) => (!g ? 0 : Math.min(100, Math.round((c / g) * 100)));

// ── Données preview ───────────────────────────────────────────────
const PREVIEW_DATA = {
  title:    'Liste de Mariage',
  subtitle: 'Votre présence est notre plus beau cadeau. Mais si vous souhaitez nous gâter davantage, voici quelques idées.',
  externalLinks: [
    { id:'e1', icon:'📦', label:'Liste Amazon',  url:'https://amazon.fr'  },
    { id:'e2', icon:'🏠', label:'Liste IKEA',    url:'https://ikea.com'   },
    { id:'e3', icon:'🛍️', label:'Liste Temu',    url:'https://temu.com'   },
  ],
  paymentNumbers: {
    mtnMoMo:     '+237 677 000 111',
    mtnName:     'LELE Josia',
    orangeMoney:  '+237 699 000 222',
    orangeName:   'LELE Ulrich',
    interac:      'josia@email.com',
    interacName:  'Josia Lele',
    paypal:       'josia@email.com',
    paypalName:   'Josia Lele',
    bankName:     'Afriland First Bank',
    bankHolder:   'LELE Josia',
    bankAccount:  'CM21 10005 00001 12345678901 22',
    message:      'Référence : Mariage Josia & Ulrich — Mai 2026',
  },
  items: [
    { id:'i1', icon:'🛏️', name:'Lit king size',  price:250000, collected:180000, currency:'FCFA', link:'', reserved:false },
    { id:'i2', icon:'🛋️', name:'Canapé salon',   price:300000, collected:300000, currency:'FCFA', link:'', reserved:true  },
    { id:'i3', icon:'📺', name:'Télévision 55"', price:400000, collected:95000,  currency:'FCFA', link:'', reserved:false },
    { id:'i4', icon:'🍳', name:'Robot cuiseur',  price:120000, collected:0,      currency:'FCFA', link:'', reserved:false },
  ],
};

// ════════════════════════════════════════════════════════════════
// 1️⃣  LIENS EXTERNES
// ════════════════════════════════════════════════════════════════
const ExternalLinks = ({ links }) => (
  <div className="gifts-block">
    <div className="gifts-block__head">
      <span className="gifts-block__num">01</span>
      <div>
        <h3 className="gifts-block__title">Listes externes</h3>
        <p className="gifts-block__sub">Choisissez et achetez directement sur la boutique</p>
      </div>
    </div>
    <div className="gifts-links-grid">
      {links.map(l => (
        <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="gifts-link-card">
          <span className="glc-icon">{l.icon}</span>
          <span className="glc-label">{l.label}</span>
          <span className="glc-arrow">↗</span>
        </a>
      ))}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// 2️⃣  DÉPÔT DIRECT (MoMo + Interac + PayPal + Banque)
// ════════════════════════════════════════════════════════════════
const DepotDirect = ({ data }) => {
  const [copied, setCopied] = useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const methods = [
    data.mtnMoMo     && { key:'mtn',     icon:'📱', label:'MTN MoMo',    value:data.mtnMoMo,     name:data.mtnName,     badge:'Cameroun',      color:'#FFC300' },
    data.orangeMoney && { key:'orange',  icon:'🍊', label:'Orange Money', value:data.orangeMoney, name:data.orangeName,  badge:'Cameroun',      color:'#FF6B00' },
    data.interac     && { key:'interac', icon:'🏦', label:'Interac',      value:data.interac,     name:data.interacName, badge:'Canada',        color:'#E8291C' },
    data.paypal      && { key:'paypal',  icon:'🅿️', label:'PayPal',       value:data.paypal,      name:data.paypalName,  badge:'International', color:'#003087' },
  ].filter(Boolean);

  const hasBank = data.bankAccount;

  if (!methods.length && !hasBank) return null;

  return (
    <div className="gifts-block">
      <div className="gifts-block__head">
        <span className="gifts-block__num">02</span>
        <div>
          <h3 className="gifts-block__title">Dépôt direct</h3>
          <p className="gifts-block__sub">Envoyez directement — rapide et sans frais</p>
        </div>
      </div>

      {methods.length > 0 && (
        <div className="gifts-depot-grid">
          {methods.map(m => (
            <div key={m.key} className="gifts-depot-card" style={{ '--depot-color': m.color }}>
              <div className="gdc-header">
                <span className="gdc-icon">{m.icon}</span>
                <div>
                  <span className="gdc-label">{m.label}</span>
                  <span className="gdc-badge">{m.badge}</span>
                </div>
              </div>
              {m.name && <p className="gdc-name">👤 {m.name}</p>}
              {m.name && <p className="gdc-name">{m.name}</p>}
              <div className="gdc-value-row">
                <code className="gdc-value">{m.value}</code>
                <button className="gdc-copy" onClick={() => copy(m.value, m.key)}>
                  {copied === m.key ? '✓' : '⎘'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasBank && (
        <div className="gifts-bank-card">
          <div className="gbc-header">
            <span className="gbc-icon">🏛️</span>
            <div>
              <span className="gbc-label">Virement bancaire</span>
              {data.bankName && <span className="gdc-badge">{data.bankName}</span>}
            </div>
          </div>
          <div className="gbc-rows">
            {data.bankHolder && (
              <div className="gbc-row">
                <span className="gbc-field">Titulaire</span>
                <div className="gdc-value-row">
                  <code className="gdc-value">{data.bankHolder}</code>
                  <button className="gdc-copy" onClick={() => copy(data.bankHolder, 'holder')}>
                    {copied === 'holder' ? '✓' : '⎘'}
                  </button>
                </div>
              </div>
            )}
            <div className="gbc-row">
              <span className="gbc-field">Compte / IBAN</span>
              <div className="gdc-value-row">
                <code className="gdc-value">{data.bankAccount}</code>
                <button className="gdc-copy" onClick={() => copy(data.bankAccount, 'bank')}>
                  {copied === 'bank' ? '✓' : '⎘'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {data.message && (
        <div className="gifts-depot-note">
          <span className="gdn-icon">💬</span>
          <p>{data.message}</p>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// 3️⃣  LISTE DE CADEAUX
// ════════════════════════════════════════════════════════════════
const GiftList = ({ items }) => (
  <div className="gifts-block">
    <div className="gifts-block__head">
      <span className="gifts-block__num">03</span>
      <div>
        <h3 className="gifts-block__title">Liste de cadeaux</h3>
        <p className="gifts-block__sub">Participez à l'un de nos projets communs</p>
      </div>
    </div>
    <div className="gifts-items-grid">
      {items.map(item => {
        const p = pct(item.collected, item.price);
        return (
          <div key={item.id} className={`gifts-item ${item.reserved ? 'gifts-item--done' : ''}`}>
            {item.reserved && <div className="gi-badge">✓ Offert</div>}
            <div className="gi-top">
              <span className="gi-icon">{item.icon}</span>
              <div className="gi-info">
                <h4 className="gi-name">{item.name}</h4>
                <p className="gi-price">{fmt(item.price, item.currency)}</p>
              </div>
            </div>
            <div className="gi-progress">
              <div className="gi-bar">
                <div className="gi-bar-fill" style={{ width:`${p}%` }} />
              </div>
              <div className="gi-progress-labels">
                <span className="gi-collected">{fmt(item.collected, item.currency)} collectés</span>
                <span className="gi-pct">{p}%</span>
              </div>
            </div>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="gi-link">
                Voir le produit ↗
              </a>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// 4️⃣  APPORTER LE JOUR J
// ════════════════════════════════════════════════════════════════
const ApporterJourJ = () => (
  <div className="gifts-block gifts-block--envelope">
    <div className="gifts-block__head">
      <span className="gifts-block__num">04</span>
      <div>
        <h3 className="gifts-block__title">Apporter le jour du mariage</h3>
        <p className="gifts-block__sub">Un geste du cœur, quel que soit le montant</p>
      </div>
    </div>
    <div className="gifts-envelope-card">
      <div className="gec-visual">
        <span className="gec-envelope">💌</span>
        <div className="gec-lines">
          <span/><span/><span/>
        </div>
      </div>
      <div className="gec-text">
        <p>Vous pouvez nous remettre une enveloppe ou un cadeau directement lors de la réception.</p>
        <div className="gec-tags">
          <span>🌍 Locaux</span>
          <span>🇨🇦 Diaspora</span>
          <span>🌐 International</span>
        </div>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
const Gifts = ({ wedding, isPreview = false }) => {
  const themeId = wedding?.settings?.theme?.id || 'royal';

  const data = isPreview ? PREVIEW_DATA : {
    title:          wedding?.gifts?.title    || 'Liste de Mariage',
    subtitle:       wedding?.gifts?.subtitle || '',
    externalLinks:  wedding?.gifts?.externalLinks  || [],
    paymentNumbers: wedding?.gifts?.paymentNumbers || {},
    items:          wedding?.gifts?.items          || [],
  };

  // Masquer si rien à afficher
  if (!isPreview) {
    const empty =
      !data.externalLinks?.length &&
      !data.paymentNumbers?.mtnMoMo &&
      !data.paymentNumbers?.orangeMoney &&
      !data.paymentNumbers?.interac &&
      !data.items?.length;
    if (empty) return null;
  }

  return (
    <section id="gifts" className={`gifts gifts--${themeId}`}>
      <div className="gifts__inner">

        {/* En-tête */}
        <div className="gifts-header">
          <p className="gifts-eyebrow">Liste de mariage</p>
          <h2 className="gifts-title">{data.title}</h2>
          {data.subtitle && <p className="gifts-subtitle">{data.subtitle}</p>}
          <div className="gifts-divider"><span>✦</span></div>
        </div>

        {isPreview && (
          <div className="gifts-preview-banner">👁 Aperçu — données simulées</div>
        )}

        {/* 4 blocs */}
        <div className="gifts-blocks">
          {data.externalLinks?.length > 0 && (
            <ExternalLinks links={data.externalLinks} />
          )}
          {(data.paymentNumbers?.mtnMoMo || data.paymentNumbers?.orangeMoney || data.paymentNumbers?.interac) && (
            <DepotDirect data={data.paymentNumbers} />
          )}
          {data.items?.length > 0 && (
            <GiftList items={data.items} />
          )}
          <ApporterJourJ />
        </div>

      </div>
    </section>
  );
};

export default Gifts;

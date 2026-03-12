// components/EventInfo.jsx — 5 LAYOUTS PAR THÈME
import React, { useState } from 'react';
import './EventInfo.css';

// ── Icônes / Labels ──────────────────────────────────────────────
const EVENT_ICONS  = { ceremonie:'💍', cocktail:'🥂', diner:'🍽️', autre:'✨' };
const EVENT_LABELS = { ceremonie:'Cérémonie', cocktail:'Cocktail', diner:'Dîner', autre:'Événement' };

// ── Événements preview ───────────────────────────────────────────
const PREVIEW_EVENTS = [
  {
    _id: 'p1', type: 'ceremonie',
    title: 'Cérémonie de Mariage',
    description: 'La célébration de notre union dans toute sa splendeur.',
    time: '14:00', location: 'Église Saint-Michel',
    address: '12 Rue de la Paix, Paris',
    googleMapsUrl: '', dressCode: 'Tenue de cérémonie',
  },
  {
    _id: 'p2', type: 'diner',
    title: 'Dîner & Réception',
    description: 'Venez célébrer avec nous autour d\'un dîner gastronomique.',
    time: '19:00', location: 'Château de Versailles',
    address: '1 Avenue de Paris, Versailles',
    googleMapsUrl: '', dressCode: 'Tenue de soirée',
  },
];

// ── Ligne d'info commune ─────────────────────────────────────────
const InfoRow = ({ icon, text, small }) => (
  <div className="ei-row">
    <span className="ei-row__icon">{icon}</span>
    <span className={`ei-row__text ${small ? 'ei-row__text--small' : ''}`}>{text}</span>
  </div>
);

// ════════════════════════════════════════════════════════════════
// LAYOUT 1 — ROYAL : fond bleu nuit, cartes verre dépoli, or
// ════════════════════════════════════════════════════════════════
const EventCardRoyal = ({ event, index }) => {
  const [open, setOpen] = useState(false);
  const icon  = EVENT_ICONS[event.type]  || '✨';
  const label = EVENT_LABELS[event.type] || 'Événement';

  return (
    <div className="ecard ecard--royal" style={{ animationDelay:`${index*0.15}s` }}>
      <div className="ecard-royal__header">
        <div className="ecard-royal__icon">{icon}</div>
        <div className="ecard-royal__info">
          <span className="ecard-royal__badge">{label}</span>
          <h3 className="ecard-royal__title">{event.title}</h3>
        </div>
        <span className="ecard-royal__num">{String(index+1).padStart(2,'0')}</span>
      </div>
      <div className="ecard-royal__body">
        {event.time     && <InfoRow icon="🕐" text={event.time}/>}
        {event.location && <InfoRow icon="📍" text={event.location}/>}
        {event.address  && <InfoRow icon="🗺️" text={event.address} small/>}
        {event.dressCode && <InfoRow icon="👔" text={event.dressCode}/>}
        {event.description && (
          <>
            <button className="ecard__toggle ecard__toggle--royal" onClick={()=>setOpen(!open)}>
              {open ? '▲ Moins' : '▼ Plus d\'infos'}
            </button>
            {open && <p className="ecard-royal__desc">{event.description}</p>}
          </>
        )}
      </div>
      {event.googleMapsUrl && (
        <div className="ecard-royal__footer">
          <a href={event.googleMapsUrl} target="_blank" rel="noopener noreferrer"
            className="ecard-royal__mapbtn">📍 Voir sur Google Maps</a>
        </div>
      )}
      <div className="ecard-royal__line"/>
    </div>
  );
};

const EventInfoRoyal = ({ wedding, events }) => (
  <section id="programme" className="ei ei--royal">
    <div className="ei__inner">
      <div className="ei-royal-header">
        <div className="royal-divider">
          <span className="royal-divider__line"/>
          <span className="royal-divider__gem">✦</span>
          <span className="royal-divider__line"/>
        </div>
        <h2 className="ei-royal-title">{wedding.eventInfo?.title || 'Le Programme'}</h2>
        <p className="ei-royal-sub">Retrouvez tous les détails de notre journée</p>
      </div>
      <div className="ei-royal-grid">
        {events.map((ev,i) => <EventCardRoyal key={ev._id||i} event={ev} index={i}/>)}
      </div>
    </div>
  </section>
);

// ════════════════════════════════════════════════════════════════
// LAYOUT 2 — MINIMAL : fond blanc, timeline verticale noire
// ════════════════════════════════════════════════════════════════
const EventCardMinimal = ({ event, index }) => {
  const [open, setOpen] = useState(false);
  const icon  = EVENT_ICONS[event.type]  || '✨';
  const label = EVENT_LABELS[event.type] || 'Événement';

  return (
    <div className="ecard ecard--minimal" style={{ animationDelay:`${index*0.15}s` }}>
      <div className="ecard-minimal__dot"/>
      <div className="ecard-minimal__content">
        <div className="ecard-minimal__top">
          <span className="ecard-minimal__time">{event.time || '--:--'}</span>
          <span className="ecard-minimal__label">{icon} {label}</span>
        </div>
        <h3 className="ecard-minimal__title">{event.title}</h3>
        <div className="ecard-minimal__details">
          {event.location  && <InfoRow icon="📍" text={event.location}/>}
          {event.address   && <InfoRow icon="🗺️" text={event.address} small/>}
          {event.dressCode && <InfoRow icon="👔" text={event.dressCode}/>}
        </div>
        {event.description && (
          <>
            <button className="ecard__toggle ecard__toggle--minimal" onClick={()=>setOpen(!open)}>
              {open ? '− Réduire' : '+ Détails'}
            </button>
            {open && <p className="ecard-minimal__desc">{event.description}</p>}
          </>
        )}
        {event.googleMapsUrl && (
          <a href={event.googleMapsUrl} target="_blank" rel="noopener noreferrer"
            className="ecard-minimal__mapbtn">Voir sur Google Maps →</a>
        )}
      </div>
    </div>
  );
};

const EventInfoMinimal = ({ wedding, events }) => (
  <section id="programme" className="ei ei--minimal">
    <div className="ei__inner">
      <div className="ei-minimal-header">
        <span className="ei-minimal-eyebrow">Programme</span>
        <h2 className="ei-minimal-title">{wedding.eventInfo?.title || 'Le Programme'}</h2>
        <div className="ei-minimal-rule"/>
      </div>
      <div className="ei-minimal-timeline">
        <div className="ei-minimal-line"/>
        {events.map((ev,i) => <EventCardMinimal key={ev._id||i} event={ev} index={i}/>)}
      </div>
    </div>
  </section>
);

// ════════════════════════════════════════════════════════════════
// LAYOUT 3 — FLORAL : fond rosé, cartes blanches, accents bordeaux
// ════════════════════════════════════════════════════════════════
const EventCardFloral = ({ event, index }) => {
  const [open, setOpen] = useState(false);
  const icon  = EVENT_ICONS[event.type]  || '✨';
  const label = EVENT_LABELS[event.type] || 'Événement';

  return (
    <div className="ecard ecard--floral" style={{ animationDelay:`${index*0.15}s` }}>
      <div className="ecard-floral__top">
        <span className="ecard-floral__icon">{icon}</span>
        <span className="ecard-floral__badge">{label}</span>
        {event.time && <span className="ecard-floral__time">{event.time}</span>}
      </div>
      <h3 className="ecard-floral__title">{event.title}</h3>
      <div className="ecard-floral__divider">❧</div>
      <div className="ecard-floral__details">
        {event.location  && <InfoRow icon="📍" text={event.location}/>}
        {event.address   && <InfoRow icon="🗺️" text={event.address} small/>}
        {event.dressCode && <InfoRow icon="👔" text={event.dressCode}/>}
      </div>
      {event.description && (
        <>
          <button className="ecard__toggle ecard__toggle--floral" onClick={()=>setOpen(!open)}>
            {open ? '▲ Moins' : '▼ En savoir plus'}
          </button>
          {open && <p className="ecard-floral__desc">{event.description}</p>}
        </>
      )}
      {event.googleMapsUrl && (
        <div className="ecard-floral__footer">
          <a href={event.googleMapsUrl} target="_blank" rel="noopener noreferrer"
            className="ecard-floral__mapbtn">📍 Itinéraire</a>
        </div>
      )}
    </div>
  );
};

const EventInfoFloral = ({ wedding, events }) => (
  <section id="programme" className="ei ei--floral">
    <div className="floral-ei-deco floral-ei-deco--tl">🌸</div>
    <div className="floral-ei-deco floral-ei-deco--tr">🌺</div>
    <div className="ei__inner">
      <div className="ei-floral-header">
        <div className="ei-floral-ornament">❧</div>
        <h2 className="ei-floral-title">{wedding.eventInfo?.title || 'Le Programme'}</h2>
        <p className="ei-floral-sub">Notre journée, heure par heure</p>
      </div>
      <div className="ei-floral-grid">
        {events.map((ev,i) => <EventCardFloral key={ev._id||i} event={ev} index={i}/>)}
      </div>
    </div>
  </section>
);

// ════════════════════════════════════════════════════════════════
// LAYOUT 4 — BOHO : fond beige, cartes kraft, accents terracotta
// ════════════════════════════════════════════════════════════════
const EventCardBoho = ({ event, index }) => {
  const [open, setOpen] = useState(false);
  const icon  = EVENT_ICONS[event.type]  || '✨';
  const label = EVENT_LABELS[event.type] || 'Événement';

  return (
    <div className="ecard ecard--boho" style={{ animationDelay:`${index*0.15}s` }}>
      <div className="ecard-boho__badge">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <h3 className="ecard-boho__title">{event.title}</h3>
      {event.time && <p className="ecard-boho__time">à {event.time}</p>}
      <div className="ecard-boho__details">
        {event.location  && <InfoRow icon="📍" text={event.location}/>}
        {event.address   && <InfoRow icon="🗺️" text={event.address} small/>}
        {event.dressCode && <InfoRow icon="👔" text={event.dressCode}/>}
      </div>
      {event.description && (
        <>
          <button className="ecard__toggle ecard__toggle--boho" onClick={()=>setOpen(!open)}>
            {open ? '− Moins' : '+ Détails'}
          </button>
          {open && <p className="ecard-boho__desc">{event.description}</p>}
        </>
      )}
      {event.googleMapsUrl && (
        <a href={event.googleMapsUrl} target="_blank" rel="noopener noreferrer"
          className="ecard-boho__mapbtn">🗺️ Y aller</a>
      )}
      <div className="ecard-boho__leaf">🌿</div>
    </div>
  );
};

const EventInfoBoho = ({ wedding, events }) => (
  <section id="programme" className="ei ei--boho">
    <div className="ei__inner">
      <div className="ei-boho-header">
        <p className="ei-boho-eyebrow">~ programme ~</p>
        <h2 className="ei-boho-title">{wedding.eventInfo?.title || 'Le Programme'}</h2>
        <div className="ei-boho-branch">𝓪𝓶𝓸𝓾𝓻</div>
      </div>
      <div className="ei-boho-grid">
        {events.map((ev,i) => <EventCardBoho key={ev._id||i} event={ev} index={i}/>)}
      </div>
    </div>
  </section>
);

// ════════════════════════════════════════════════════════════════
// LAYOUT 5 — LUXURY : fond noir, cartes transparentes, tout or
// ════════════════════════════════════════════════════════════════
const EventCardLuxury = ({ event, index }) => {
  const [open, setOpen] = useState(false);
  const icon  = EVENT_ICONS[event.type]  || '✨';
  const label = EVENT_LABELS[event.type] || 'Événement';

  return (
    <div className="ecard ecard--luxury" style={{ animationDelay:`${index*0.15}s` }}>
      <div className="ecard-luxury__header">
        <span className="ecard-luxury__num">0{index+1}</span>
        <div className="ecard-luxury__info">
          <span className="ecard-luxury__badge">{icon} {label}</span>
          <h3 className="ecard-luxury__title">{event.title}</h3>
        </div>
        {event.time && <span className="ecard-luxury__time">{event.time}</span>}
      </div>
      <div className="ecard-luxury__rule"/>
      <div className="ecard-luxury__details">
        {event.location  && <InfoRow icon="📍" text={event.location}/>}
        {event.address   && <InfoRow icon="🗺️" text={event.address} small/>}
        {event.dressCode && <InfoRow icon="👔" text={event.dressCode}/>}
      </div>
      {event.description && (
        <>
          <button className="ecard__toggle ecard__toggle--luxury" onClick={()=>setOpen(!open)}>
            {open ? '▲ Réduire' : '▼ Détails'}
          </button>
          {open && <p className="ecard-luxury__desc">{event.description}</p>}
        </>
      )}
      {event.googleMapsUrl && (
        <a href={event.googleMapsUrl} target="_blank" rel="noopener noreferrer"
          className="ecard-luxury__mapbtn">Voir l'adresse</a>
      )}
    </div>
  );
};

const EventInfoLuxury = ({ wedding, events }) => (
  <section id="programme" className="ei ei--luxury">
    <div className="luxury-ei-frame">
      <div className="lef-tl"/><div className="lef-tr"/>
      <div className="lef-bl"/><div className="lef-br"/>
    </div>
    <div className="ei__inner">
      <div className="ei-luxury-header">
        <div className="ei-luxury-rule"/>
        <h2 className="ei-luxury-title">{wedding.eventInfo?.title || 'Le Programme'}</h2>
        <p className="ei-luxury-sub">Le déroulement de notre soirée d'exception</p>
        <div className="ei-luxury-rule"/>
      </div>
      <div className="ei-luxury-grid">
        {events.map((ev,i) => <EventCardLuxury key={ev._id||i} event={ev} index={i}/>)}
      </div>
    </div>
  </section>
);

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
// Fix pour EventInfo.jsx — remplace uniquement le COMPOSANT PRINCIPAL (bas du fichier)

const EventInfo = ({ wedding, isPreview = false }) => {
  // ✅ Ne pas afficher si désactivé ou aucun événement (sauf preview)
  if (!isPreview) {
    if (!wedding.eventInfo?.enabled) return null;
    if (!wedding.eventInfo?.events?.length) return null;
  }

  const events = isPreview
    ? PREVIEW_EVENTS
    : wedding.eventInfo.events;

  const layout = wedding.settings.theme.heroLayout || 'centered';
  const props  = { wedding, events };

  switch (layout) {
    case 'split':           return <EventInfoMinimal {...props}/>;
    case 'fullscreen':      return <EventInfoFloral  {...props}/>;
    case 'split-reverse':   return <EventInfoBoho    {...props}/>;
    case 'fullscreen-dark': return <EventInfoLuxury  {...props}/>;
    case 'centered':
    default:                return <EventInfoRoyal   {...props}/>;
  }
};

export default EventInfo;


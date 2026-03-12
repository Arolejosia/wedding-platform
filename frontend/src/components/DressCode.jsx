// components/DressCode.jsx — 5 LAYOUTS PAR THÈME
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DressCode.css';
import couple from '../assets/dresscode/couple.png';
import woman  from '../assets/dresscode/woman.jpg';
import man    from '../assets/dresscode/man.jpg';

// ── Carousel hook (partagé) ──────────────────────────────────────
const useCarousel = (length) => {
  const [idx, setIdx]         = useState(0);
  const [paused, setPaused]   = useState(false);
  const ref                   = useRef(null);
  const autoRef               = useRef(null);
  const pauseRef              = useRef(null);

  const goTo = useCallback((i) => {
    if (!ref.current) return;
    ref.current.scrollTo({ left: i * ref.current.offsetWidth, behavior:'smooth' });
    setIdx(i);
  }, []);

  const resume = useCallback(() => {
    if (pauseRef.current) clearTimeout(pauseRef.current);
    pauseRef.current = setTimeout(() => setPaused(false), 3000);
  }, []);

  useEffect(() => {
    if (paused) return;
    autoRef.current = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % length;
        if (ref.current) ref.current.scrollTo({ left: next * ref.current.offsetWidth, behavior:'smooth' });
        return next;
      });
    }, 4000);
    return () => clearInterval(autoRef.current);
  }, [paused, length]);

  const onScroll = useCallback(() => {
    if (!ref.current) return;
    setIdx(Math.round(ref.current.scrollLeft / ref.current.offsetWidth));
  }, []);

  return { idx, paused, ref, goTo, resume, onScroll, setPaused };
};

// ── Photos par défaut ────────────────────────────────────────────
const defaultImages = [
  { src: couple, alt:'Inspiration couple', label:'Inspiration Couple' },
  { src: woman,  alt:'Pour Madame',        label:'Pour Madame' },
  { src: man,    alt:'Pour Monsieur',      label:'Pour Monsieur' },
];

const getImages = (wedding) =>
  wedding.dressCode.images?.length > 0
    ? wedding.dressCode.images.map(i => ({ src:i.url, alt:i.alt||'Inspiration', label:i.label||'Inspiration' }))
    : defaultImages;

// ── Carousel commun ──────────────────────────────────────────────
const Carousel = ({ images, variant }) => {
  const { idx, ref, goTo, resume, onScroll, setPaused } = useCarousel(images.length);
  return (
    <div className={`dc-carousel dc-carousel--${variant}`}>
      <div className="dc-carousel__track" ref={ref} onScroll={onScroll}
        onTouchStart={()=>{ setPaused(true); }}
        onTouchEnd={resume}>
        {images.map((img, i) => (
          <div key={i} className={`dc-slide ${i===idx?'dc-slide--active':''}`}>
            <img src={img.src} alt={img.alt}
              onError={e=>{ if(e.target.dataset.fallback) return; e.target.dataset.fallback='true'; e.target.src='https://placehold.co/400x500/888/fff?text=Inspiration'; }}/>
            <span className="dc-slide__label">{img.label}</span>
          </div>
        ))}
      </div>
      <div className="dc-indicators">
        {images.map((_,i) => (
          <button key={i} className={`dc-dot ${i===idx?`dc-dot--active dc-dot--${variant}`:''}`}
            onClick={()=>{ setPaused(true); goTo(i); resume(); }}/>
        ))}
      </div>
    </div>
  );
};

// ── Swatches couleurs ────────────────────────────────────────────
const Swatches = ({ primary, secondary, variant }) => (
  <div className={`dc-swatches dc-swatches--${variant}`}>
    <div className="dc-swatch"><div className="dc-swatch__circle" style={{background:primary}}/><span>Couleur principale</span></div>
    <div className="dc-swatch"><div className="dc-swatch__circle" style={{background:secondary}}/><span>Couleur accent</span></div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// LAYOUT 1 — ROYAL : fond bleu nuit, carte verre, or
// ════════════════════════════════════════════════════════════════
const DressCodeRoyal = ({ wedding }) => {
  const images = getImages(wedding);
  return (
    <section id="dress" className="dc dc--royal">
      <div className="dc__inner">
        <div className="royal-divider"><span className="royal-divider__line"/><span className="royal-divider__gem">✦</span><span className="royal-divider__line"/></div>
        <h2 className="dc-royal-title">{wedding.dressCode.title||'Code Vestimentaire'}</h2>
        <div className="dc-royal-card">
          <div className="dc-royal-icon">👑</div>
          <h3 className="dc-royal-theme">{wedding.dressCode.theme||'ÉLÉGANCE & RAFFINEMENT'}</h3>
          <p className="dc-royal-desc">{wedding.dressCode.description||"Rayonnez avec élégance lors de cette soirée royale."}</p>
          <Swatches primary={wedding.settings.theme.primaryColor} secondary={wedding.settings.theme.secondaryColor} variant="royal"/>
          {wedding.dressCode.showCarousel!==false && <Carousel images={images} variant="royal"/>}
          {(wedding.dressCode.men||wedding.dressCode.women) && (
            <div className="dc-details dc-details--royal">
              {wedding.dressCode.men    && <div className="dc-detail--royal"><h4>👔 Pour Messieurs</h4><p>{wedding.dressCode.men}</p></div>}
              {wedding.dressCode.women  && <div className="dc-detail--royal"><h4>👗 Pour Mesdames</h4><p>{wedding.dressCode.women}</p></div>}
            </div>
          )}
          {wedding.dressCode.notes && <p className="dc-royal-note">{wedding.dressCode.notes}</p>}
        </div>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 2 — MINIMAL : fond blanc, layout 2 colonnes, typographie bold
// ════════════════════════════════════════════════════════════════
const DressCodeMinimal = ({ wedding }) => {
  const images = getImages(wedding);
  return (
    <section id="dress" className="dc dc--minimal">
      <div className="dc__inner">
        <span className="dc-minimal-eyebrow">Code Vestimentaire</span>
        <h2 className="dc-minimal-title">{wedding.dressCode.title||'Comment s\'habiller ?'}</h2>
        <div className="dc-minimal-rule"/>
        <div className="dc-minimal-layout">
          <div className="dc-minimal-left">
            <h3 className="dc-minimal-theme">{wedding.dressCode.theme||'Élégance & Raffinement'}</h3>
            <p className="dc-minimal-desc">{wedding.dressCode.description||"Rayonnez avec élégance lors de cette soirée."}</p>
            <Swatches primary={wedding.settings.theme.primaryColor} secondary={wedding.settings.theme.secondaryColor} variant="minimal"/>
            {(wedding.dressCode.men||wedding.dressCode.women) && (
              <div className="dc-details dc-details--minimal">
                {wedding.dressCode.men   && <div className="dc-detail--minimal"><h4>👔 Messieurs</h4><p>{wedding.dressCode.men}</p></div>}
                {wedding.dressCode.women && <div className="dc-detail--minimal"><h4>👗 Mesdames</h4><p>{wedding.dressCode.women}</p></div>}
              </div>
            )}
          </div>
          {wedding.dressCode.showCarousel!==false && (
            <div className="dc-minimal-right"><Carousel images={images} variant="minimal"/></div>
          )}
        </div>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 3 — FLORAL : fond rosé, carte blanche, ornements
// ════════════════════════════════════════════════════════════════
const DressCodeFloral = ({ wedding }) => {
  const images = getImages(wedding);
  return (
    <section id="dress" className="dc dc--floral">
      <div className="floral-dc-deco floral-dc-deco--tl">🌸</div>
      <div className="floral-dc-deco floral-dc-deco--br">🌿</div>
      <div className="dc__inner">
        <div className="dc-floral-ornament">❧</div>
        <h2 className="dc-floral-title">{wedding.dressCode.title||'Code Vestimentaire'}</h2>
        <p className="dc-floral-sub">Habillez-vous avec élégance et raffinement</p>
        <div className="dc-floral-card">
          <h3 className="dc-floral-theme">{wedding.dressCode.theme||'Élégance & Romantisme'}</h3>
          <p className="dc-floral-desc">{wedding.dressCode.description||"Rayonnez avec élégance lors de cette soirée romantique."}</p>
          <Swatches primary={wedding.settings.theme.primaryColor} secondary={wedding.settings.theme.secondaryColor} variant="floral"/>
          {wedding.dressCode.showCarousel!==false && <Carousel images={images} variant="floral"/>}
          {(wedding.dressCode.men||wedding.dressCode.women) && (
            <div className="dc-details dc-details--floral">
              {wedding.dressCode.men   && <div className="dc-detail--floral"><h4>👔 Pour Messieurs</h4><p>{wedding.dressCode.men}</p></div>}
              {wedding.dressCode.women && <div className="dc-detail--floral"><h4>👗 Pour Mesdames</h4><p>{wedding.dressCode.women}</p></div>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 4 — BOHO : fond beige, style naturel manuscrit
// ════════════════════════════════════════════════════════════════
const DressCodeBoho = ({ wedding }) => {
  const images = getImages(wedding);
  return (
    <section id="dress" className="dc dc--boho">
      <div className="dc__inner">
        <p className="dc-boho-eyebrow">~ tenue ~</p>
        <h2 className="dc-boho-title">{wedding.dressCode.title||'Code Vestimentaire'}</h2>
        <div className="dc-boho-branch">𝓷𝓪𝓽𝓾𝓻𝓮</div>
        <div className="dc-boho-card">
          <h3 className="dc-boho-theme">{wedding.dressCode.theme||'Bohème & Nature'}</h3>
          <p className="dc-boho-desc">{wedding.dressCode.description||"Laissez-vous inspirer par la nature et le bohème chic."}</p>
          <Swatches primary={wedding.settings.theme.primaryColor} secondary={wedding.settings.theme.secondaryColor} variant="boho"/>
          {wedding.dressCode.showCarousel!==false && <Carousel images={images} variant="boho"/>}
          {(wedding.dressCode.men||wedding.dressCode.women) && (
            <div className="dc-details dc-details--boho">
              {wedding.dressCode.men   && <div className="dc-detail--boho"><h4>👔 Messieurs</h4><p>{wedding.dressCode.men}</p></div>}
              {wedding.dressCode.women && <div className="dc-detail--boho"><h4>👗 Mesdames</h4><p>{wedding.dressCode.women}</p></div>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 5 — LUXURY : fond noir, or, minimalisme absolu
// ════════════════════════════════════════════════════════════════
const DressCodeLuxury = ({ wedding }) => {
  const images = getImages(wedding);
  return (
    <section id="dress" className="dc dc--luxury">
      <div className="luxury-dc-frame"><div className="ldf-tl"/><div className="ldf-tr"/><div className="ldf-bl"/><div className="ldf-br"/></div>
      <div className="dc__inner">
        <div className="dc-luxury-rule"/>
        <h2 className="dc-luxury-title">{wedding.dressCode.title||'Code Vestimentaire'}</h2>
        <p className="dc-luxury-sub">Dress code pour une soirée d'exception</p>
        <div className="dc-luxury-rule"/>
        <div className="dc-luxury-card">
          <h3 className="dc-luxury-theme">{wedding.dressCode.theme||'BLACK TIE'}</h3>
          <p className="dc-luxury-desc">{wedding.dressCode.description||"Une soirée d'exception mérite une tenue exceptionnelle."}</p>
          <Swatches primary={wedding.settings.theme.primaryColor} secondary={wedding.settings.theme.secondaryColor} variant="luxury"/>
          {wedding.dressCode.showCarousel!==false && <Carousel images={images} variant="luxury"/>}
          {(wedding.dressCode.men||wedding.dressCode.women) && (
            <div className="dc-details dc-details--luxury">
              {wedding.dressCode.men   && <div className="dc-detail--luxury"><h4>Pour Messieurs</h4><p>{wedding.dressCode.men}</p></div>}
              {wedding.dressCode.women && <div className="dc-detail--luxury"><h4>Pour Mesdames</h4><p>{wedding.dressCode.women}</p></div>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
const DressCode = ({ wedding }) => {
  if (!wedding.dressCode?.enabled) return null;
  const layout = wedding.settings.theme.heroLayout || 'centered';
  switch (layout) {
    case 'split':           return <DressCodeMinimal wedding={wedding}/>;
    case 'fullscreen':      return <DressCodeFloral  wedding={wedding}/>;
    case 'split-reverse':   return <DressCodeBoho    wedding={wedding}/>;
    case 'fullscreen-dark': return <DressCodeLuxury  wedding={wedding}/>;
    default:                return <DressCodeRoyal   wedding={wedding}/>;
  }
};

export default DressCode;

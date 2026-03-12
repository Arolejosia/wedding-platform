// components/Story.jsx — 5 LAYOUTS PAR THÈME + MODE SINGLE/THREE
import React, { useState } from 'react';
import './Story.css';
import { marked } from "marked";
import DOMPurify from "dompurify";

const renderMd = (md = "") => {
  const html = marked.parse(md);
  return DOMPurify.sanitize(html);
};

// ── Contenu fictif preview ───────────────────────────────────────
const PREVIEW_CONTENT = {
  nous: `<p>Tout a commencé par un regard échangé lors d'une soirée d'automne à Paris. Ni l'un ni l'autre n'aurait pu imaginer que ce moment fugace allait changer le cours de leur vie.</p>
    <p>Des semaines de messages tardifs, de rires partagés et de promenades sous la pluie ont tissé entre eux un lien invisible mais indéfectible. Ce qu'ils croyaient être une belle amitié s'est révélé être bien plus grand.</p>
    <p>Aujourd'hui, ils s'apprêtent à écrire ensemble le plus beau chapitre de leur histoire — celui qui commence par <em>"Oui, pour la vie."</em></p>`,
  elle: `<p>Je ne cherchais pas l'amour ce soir-là. J'étais simplement là, avec mes amies, profitant de la musique et de l'instant. Et puis je l'ai vu.</p>
    <p>Ce qui m'a frappée d'abord, ce n'était pas son sourire — même s'il était irrésistible — c'était sa façon d'écouter les gens, vraiment écouter, avec toute son attention. J'ai su à ce moment-là qu'il était différent.</p>
    <p>Quand il m'a demandé en mariage, j'ai dit oui avant même qu'il finisse sa phrase. 💙</p>`,
  lui: `<p>Je l'avais remarquée bien avant qu'elle me remarque. Il y avait quelque chose dans sa façon de rire, la tête légèrement penchée, les yeux qui pétillent.</p>
    <p>Me présenter a été la chose la plus courageuse et la plus terrifiante que j'aie jamais faite. Et quand elle a souri en répondant, j'ai eu l'impression que le monde entier s'était mis en pause.</p>
    <p>Elle est ma meilleure décision. La bague, la demande, les larmes de joie — tout ça, c'était juste la suite logique d'une évidence. ✨</p>`,
};

// ── Tabs selon mode ──────────────────────────────────────────────
const getTabs = (p1, p2, singleMode) => {
  if (singleMode) return [{ id: 'nous', icon: '👑', label: 'Notre histoire' }];
  return [
    { id: 'nous', icon: '👑', label: 'Notre histoire' },
    { id: 'elle', icon: '💙', label: `Vision de ${p1}` },
    { id: 'lui',  icon: '✨', label: `Vision de ${p2}` },
  ];
};

// ── Hook contenu ─────────────────────────────────────────────────
const useStory = (wedding, isPreview, singleMode) => {
  const [active, setActive]  = useState('nous');
  const [animating, setAnim] = useState(false);

  const getContent = (view) => {
    if (isPreview) return PREVIEW_CONTENT[view];
    return wedding.story?.versions?.[view] || wedding.story?.content || '';
  };

  const switchView = (view) => {
    if (view === active || animating) return;
    setAnim(true);
    setTimeout(() => { setActive(view); setAnim(false); }, 280);
  };

  return { active, animating, getContent, switchView };
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 1 — ROYAL
// ════════════════════════════════════════════════════════════════
const StoryRoyal = ({ wedding, isPreview, singleMode }) => {
  const { active, animating, getContent, switchView } = useStory(wedding, isPreview, singleMode);
  const tabs = getTabs(wedding.couple.person1.firstName, wedding.couple.person2.firstName, singleMode);

  return (
    <section id="story" className="story story--royal">
      <div className="royal-particles" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="rp" style={{
            left: `${5 + i * 8}%`,
            animationDelay: `${(i * 0.5) % 6}s`,
            animationDuration: `${8 + (i % 3)}s`,
          }} />
        ))}
      </div>

      <div className="story__inner">
        <div className="story-royal-header">
          <div className="royal-divider">
            <span className="royal-divider__line" />
            <span className="royal-divider__gem">✦</span>
            <span className="royal-divider__line" />
          </div>
          <h2 className="story-royal-title">{wedding.story?.title || 'Notre Histoire'}</h2>
          {!singleMode && <p className="story-royal-sub">Trois regards sur une même évidence</p>}
        </div>

        {!singleMode && (
          <div className="story-royal-tabs">
            {tabs.map(tab => (
              <button key={tab.id}
                className={`srt ${active === tab.id ? 'srt--active' : ''}`}
                onClick={() => switchView(tab.id)}>
                <span className="srt-icon">{tab.icon}</span>
                <span className="srt-label">{tab.label}</span>
                {active === tab.id && <span className="srt-bar" />}
              </button>
            ))}
          </div>
        )}

        <div className={`story-royal-content ${animating ? 'story--exit' : 'story--enter'}`}>
          {!singleMode && (
            <div className="story-royal-badge">
              <span>{tabs.find(t => t.id === active)?.icon}</span>
              <span>{tabs.find(t => t.id === active)?.label}</span>
            </div>
          )}
          <div className="story-royal-text"
              dangerouslySetInnerHTML={{ __html: renderMd(getContent(active)) }}/>
          {!singleMode && (
            <div className="story-royal-nav">
              {tabs.filter(t => t.id !== active).map(tab => (
                <button key={tab.id} className="story-royal-navbtn"
                  onClick={() => switchView(tab.id)}>
                  {tab.icon} {tab.label} →
                </button>
              ))}
            </div>
          )}
        </div>

        {!singleMode && (
          <div className="story-dots">
            {tabs.map(tab => (
              <button key={tab.id}
                className={`story-dot ${active === tab.id ? 'story-dot--active' : ''}`}
                onClick={() => switchView(tab.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 2 — MINIMAL
// ════════════════════════════════════════════════════════════════
const StoryMinimal = ({ wedding, isPreview, singleMode }) => {
  const { active, animating, getContent, switchView } = useStory(wedding, isPreview, singleMode);
  const p    = wedding.settings.theme;
  const tabs = getTabs(wedding.couple.person1.firstName, wedding.couple.person2.firstName, singleMode);

  return (
    <section id="story" className="story story--minimal"
      style={{ '--sp': p.primaryColor, '--ss': p.secondaryColor }}>
      <div className="story__inner">
        <div className="minimal-story-header">
          <span className="minimal-story-eyebrow">Notre histoire</span>
          <h2 className="minimal-story-title">{wedding.story?.title || 'Comment tout a commencé'}</h2>
          <div className="minimal-story-rule" />
        </div>

        <div className="minimal-story-layout">
          {!singleMode && (
            <div className="minimal-story-sidebar">
              {tabs.map((tab, i) => (
                <button key={tab.id}
                  className={`msb ${active === tab.id ? 'msb--active' : ''}`}
                  onClick={() => switchView(tab.id)}>
                  <span className="msb-num">0{i+1}</span>
                  <span className="msb-label">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
          <div className={`minimal-story-content ${animating ? 'story--exit' : 'story--enter'}`}>
            <div className="minimal-story-text"
                dangerouslySetInnerHTML={{ __html: renderMd(getContent(active)) }} />
          </div>
        </div>

        {!singleMode && (
          <div className="story-dots story-dots--minimal">
            {tabs.map(tab => (
              <button key={tab.id}
                className={`story-dot story-dot--dark ${active === tab.id ? 'story-dot--active' : ''}`}
                onClick={() => switchView(tab.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 3 — FLORAL
// ════════════════════════════════════════════════════════════════
const StoryFloral = ({ wedding, isPreview, singleMode }) => {
  const { active, animating, getContent, switchView } = useStory(wedding, isPreview, singleMode);
  const p    = wedding.settings.theme;
  const tabs = getTabs(wedding.couple.person1.firstName, wedding.couple.person2.firstName, singleMode);

  return (
    <section id="story" className="story story--floral"
      style={{ '--sp': p.primaryColor, '--ss': p.secondaryColor }}>
      <div className="floral-story-deco floral-story-deco--tl">🌸</div>
      <div className="floral-story-deco floral-story-deco--tr">🌺</div>
      <div className="floral-story-deco floral-story-deco--bl">🌿</div>
      <div className="floral-story-deco floral-story-deco--br">🌸</div>

      <div className="story__inner">
        <div className="floral-story-header">
          <div className="floral-story-ornament">❧</div>
          <h2 className="floral-story-title">{wedding.story?.title || 'Notre Histoire'}</h2>
          {!singleMode && <p className="floral-story-sub">Une histoire écrite à trois voix</p>}
        </div>

        {!singleMode && (
          <div className="floral-story-tabs">
            {tabs.map(tab => (
              <button key={tab.id}
                className={`fst ${active === tab.id ? 'fst--active' : ''}`}
                onClick={() => switchView(tab.id)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className={`floral-story-card ${animating ? 'story--exit' : 'story--enter'}`}>
          <div className="floral-story-text"
            dangerouslySetInnerHTML={{ __html: renderMd(getContent(active)) }} />
          {!singleMode && (
            <div className="floral-story-footer">
              {tabs.filter(t => t.id !== active).map(tab => (
                <button key={tab.id} className="floral-story-navbtn"
                  onClick={() => switchView(tab.id)}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {!singleMode && (
          <div className="story-dots">
            {tabs.map(tab => (
              <button key={tab.id}
                className={`story-dot story-dot--floral ${active === tab.id ? 'story-dot--active' : ''}`}
                onClick={() => switchView(tab.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 4 — BOHO
// ════════════════════════════════════════════════════════════════
const StoryBoho = ({ wedding, isPreview, singleMode }) => {
  const { active, animating, getContent, switchView } = useStory(wedding, isPreview, singleMode);
  const p    = wedding.settings.theme;
  const tabs = getTabs(wedding.couple.person1.firstName, wedding.couple.person2.firstName, singleMode);

  return (
    <section id="story" className="story story--boho"
      style={{ '--sp': p.primaryColor, '--ss': p.secondaryColor }}>
      <div className="story__inner">
        <div className="boho-story-header">
          <p className="boho-story-eyebrow">~ notre histoire ~</p>
          <h2 className="boho-story-title">{wedding.story?.title || 'Notre Histoire'}</h2>
          <div className="boho-story-branch">𝓪𝓶𝓸𝓾𝓻</div>
        </div>

        {!singleMode && (
          <div className="boho-story-tabs">
            {tabs.map(tab => (
              <button key={tab.id}
                className={`bst ${active === tab.id ? 'bst--active' : ''}`}
                onClick={() => switchView(tab.id)}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className={`boho-story-content ${animating ? 'story--exit' : 'story--enter'}`}>
          <div className="boho-story-text"
            dangerouslySetInnerHTML={{ __html: renderMd(getContent(active)) }} />
        </div>

        {!singleMode && (
          <div className="story-dots story-dots--boho">
            {tabs.map(tab => (
              <button key={tab.id}
                className={`story-dot story-dot--boho ${active === tab.id ? 'story-dot--active' : ''}`}
                onClick={() => switchView(tab.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// LAYOUT 5 — LUXURY
// ════════════════════════════════════════════════════════════════
const StoryLuxury = ({ wedding, isPreview, singleMode }) => {
  const { active, animating, getContent, switchView } = useStory(wedding, isPreview, singleMode);
  const tabs = getTabs(wedding.couple.person1.firstName, wedding.couple.person2.firstName, singleMode);

  return (
    <section id="story" className="story story--luxury">
      <div className="luxury-story-frame">
        <div className="lsf-tl" /><div className="lsf-tr" />
        <div className="lsf-bl" /><div className="lsf-br" />
      </div>

      <div className="story__inner">
        <div className="luxury-story-header">
          <div className="luxury-story-rule" />
          <h2 className="luxury-story-title">{wedding.story?.title || 'Notre Histoire'}</h2>
          {!singleMode && <p className="luxury-story-sub">L'histoire de deux âmes qui se trouvent</p>}
          <div className="luxury-story-rule" />
        </div>

        {!singleMode && (
          <div className="luxury-story-tabs">
            {tabs.map((tab, i) => (
              <button key={tab.id}
                className={`lst ${active === tab.id ? 'lst--active' : ''}`}
                onClick={() => switchView(tab.id)}>
                <span className="lst-num">0{i + 1}</span>
                <span className="lst-label">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className={`luxury-story-content ${animating ? 'story--exit' : 'story--enter'}`}>
          <div className="luxury-story-text"
            dangerouslySetInnerHTML={{ __html: renderMd(getContent(active)) }} />
        </div>

        {!singleMode && (
          <div className="story-dots story-dots--luxury">
            {tabs.map(tab => (
              <button key={tab.id}
                className={`story-dot story-dot--luxury ${active === tab.id ? 'story-dot--active' : ''}`}
                onClick={() => switchView(tab.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
const Story = ({ wedding, isPreview = false }) => {
  // ✅ Sur le site public : masquer si désactivé ou contenu vide
  if (!isPreview && (!wedding.story?.enabled ||
    (!wedding.story?.content && !wedding.story?.versions?.nous))) return null;

  const layout     = wedding.settings.theme.heroLayout || 'centered';
  const singleMode = wedding.story?.mode !== 'three'; // ✅ single par défaut
  const props      = { wedding, isPreview, singleMode };

  switch (layout) {
    case 'split':           return <StoryMinimal {...props} />;
    case 'fullscreen':      return <StoryFloral  {...props} />;
    case 'split-reverse':   return <StoryBoho    {...props} />;
    case 'fullscreen-dark': return <StoryLuxury  {...props} />;
    case 'centered':
    default:                return <StoryRoyal   {...props} />;
  }
};

export default Story;

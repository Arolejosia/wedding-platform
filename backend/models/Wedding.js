// backend/models/Wedding.js
const mongoose = require('mongoose');

const weddingSchema = new mongoose.Schema({
  planner: {
  sideA: {
    name: { type: String, default: 'Côté A' },
    themeMode: { type: String, enum: ['predefini', 'custom'], default: 'predefini' },
    themeKey: { type: String, default: 'Royal' },
    customColors: {
      bg: { type: String, default: '#1a1a2e' },
      accent: { type: String, default: '#c9a84c' },
      text: { type: String, default: '#ffffff' },
      bar: { type: String, default: '#c9a84c' },
    },
    totalPlaces: { type: Number, default: 100 },
    usedPlaces: { type: Number, default: 0 },
    categories: [{
      id: { type: String, required: true },
      label: { type: String, required: true },
      prefix: { type: String, required: true },
      color: { type: String, default: '#FF69B4' },
      ticketType: {
        type: String,
        enum: ['couple', 'simple'],
        default: 'couple',
      },
      codes: [{
        code: { type: String, required: true },
        used: { type: Boolean, default: false },
        guestNames: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
      }],
    }],
  },

  sideB: {
    name: { type: String, default: 'Côté B' },
    themeMode: { type: String, enum: ['predefini', 'custom'], default: 'predefini' },
    themeKey: { type: String, default: 'Royal' },
    customColors: {
      bg: { type: String, default: '#1a1a2e' },
      accent: { type: String, default: '#c9a84c' },
      text: { type: String, default: '#ffffff' },
      bar: { type: String, default: '#c9a84c' },
    },
    totalPlaces: { type: Number, default: 100 },
    usedPlaces: { type: Number, default: 0 },
    categories: [{
      id: { type: String, required: true },
      label: { type: String, required: true },
      prefix: { type: String, required: true },
      color: { type: String, default: '#4169E1' },
      ticketType: {
        type: String,
        enum: ['couple', 'simple'],
        default: 'couple',
      },
      codes: [{
        code: { type: String, required: true },
        used: { type: Boolean, default: false },
        guestNames: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
      }],
    }],
  },
},
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  title: { type: String, default: 'Mon mariage' },

  couple: {
    person1: {
      firstName: { type: String, required: true },
      lastName:  { type: String, default: '' },
      photo:     { type: String, default: '' },
    },
    person2: {
      firstName: { type: String, default: '' },
      lastName:  { type: String, default: '' },
      photo:     { type: String, default: '' },
    },
  },

  weddingDate: { type: Date, required: true },

  venue: {
    name:    { type: String, default: '' },
    address: { type: String, default: '' },
    city:    { type: String, default: '' },
    country: { type: String, default: '' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },

  // ── Histoire ────────────────────────────────────────────────────
  story: {
    enabled: { type: Boolean, default: true },
    title:   { type: String,  default: 'Notre Histoire' },
    mode:    { type: String, enum: ['single', 'three'], default: 'single' },
    content: { type: String, default: '' },
    versions: {
      nous: { type: String, default: '' },
      elle: { type: String, default: '' },
      lui:  { type: String, default: '' },
    },
    meetingDate:    { type: Date },
    engagementDate: { type: Date },
    timeline: [{
      date:        { type: Date },
      title:       { type: String },
      description: { type: String },
      icon:        { type: String },
    }],
  },

  // ── Programme (événements dynamiques) ───────────────────────────
  eventInfo: {
    enabled: { type: Boolean, default: true },
    title:   { type: String, default: 'Le Programme' },
    events: [{
      _id:          { type: String }, // ✅ String pour accepter Date.now()
      type:         { type: String, default: 'ceremonie' },
      title:        { type: String, default: '' },
      time:         { type: String, default: '' },
      location:     { type: String, default: '' },
      address:      { type: String, default: '' },
      dressCode:    { type: String, default: '' },
      description:  { type: String, default: '' },
      googleMapsUrl:{ type: String, default: '' },
    }],
  },

  // ── Dress Code ──────────────────────────────────────────────────
  dressCode: {
    enabled:     { type: Boolean, default: true },
    title:       { type: String, default: 'Code Vestimentaire' },
    theme:       { type: String, default: '' },
    description: { type: String, default: '' },
    men:         { type: String, default: '' },
    women:       { type: String, default: '' },
    colors:      { type: String, default: '' },
    notes:       { type: String, default: '' },
    showCarousel:{ type: Boolean, default: true },
    images: [{
      url:      { type: String },
      publicId: { type: String },
      alt:      { type: String, default: 'Inspiration' },
      label:    { type: String, default: 'Inspiration' },
    }],
  },

  // ── Photo Challenge ─────────────────────────────────────────────
  photoChallenge: {
    enabled:       { type: Boolean, default: true },
    title:         { type: String, default: 'Mission Photos' },
    description:   { type: String, default: 'Capturez les moments magiques !' },
    hashtag:       { type: String, default: '' },
    uploadEnabled: { type: Boolean, default: true },
    categories: [{
      _id:         { type: String }, // ✅ String
      id:          { type: String },
      icon:        { type: String, default: '📸' },
      title:       { type: String, default: '' },
      description: { type: String, default: '' },
      color:       { type: String, default: '#FF69B4' },
      challenges:  [{ type: String }],
    }],
  },

  // ── Livre d'Or ──────────────────────────────────────────────────
  guestbook: {
    enabled:         { type: Boolean, default: true },
    title:           { type: String, default: "Livre d'or" },
    requireApproval: { type: Boolean, default: false },
  },

  // ── Cadeaux ─────────────────────────────────────────────────────
  gifts: {
  enabled:  { type: Boolean, default: true },
  title:    { type: String, default: 'Liste de Mariage' },
  subtitle: { type: String, default: 'Votre présence est notre plus beau cadeau.' },

  paymentNumbers: {
    mtnMoMo:     { type: String, default: '' },
    mtnName:     { type: String, default: '' },
    orangeMoney: { type: String, default: '' },
    orangeName:  { type: String, default: '' },
    interac:     { type: String, default: '' },
    interacName: { type: String, default: '' },
    paypal:      { type: String, default: '' },
    paypalName:  { type: String, default: '' },
    bankName:    { type: String, default: '' },
    bankAccount: { type: String, default: '' },
    bankHolder:  { type: String, default: '' },
    message:     { type: String, default: '' },
  },

  externalLinks: [{
    _id:   { type: String },
    id:    { type: String },
    icon:  { type: String, default: '📦' },
    label: { type: String, default: '' },
    url:   { type: String, default: '' },
  }],

  cagnotte: {
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
    goal:        { type: Number, default: 0 },
    collected:   { type: Number, default: 0 },
    currency:    { type: String, default: 'FCFA' },
  },

  items: [{
    _id:       { type: String },
    id:        { type: String },
    icon:      { type: String, default: '🎁' },
    name:      { type: String, default: '' },
    price:     { type: Number, default: 0 },
    collected: { type: Number, default: 0 },
    currency:  { type: String, default: 'FCFA' },
    reserved:  { type: Boolean, default: false },
  }],
},

    // Liens externes
    externalLinks: [{
      _id:   { type: String }, // ✅ String
      id:    { type: String },
      icon:  { type: String, default: '📦' },
      label: { type: String, default: '' },
      url:   { type: String, default: '' },
    }],

    // Cagnotte
    cagnotte: {
      title:       { type: String, default: '' },
      description: { type: String, default: '' },
      goal:        { type: Number, default: 0 },
      collected:   { type: Number, default: 0 },
      currency:    { type: String, default: 'FCFA' },
    },

    // Liste de cadeaux
    items: [{
      _id:       { type: String }, // ✅ String
      id:        { type: String },
      icon:      { type: String, default: '🎁' },
      name:      { type: String, default: '' },
      price:     { type: Number, default: 0 },
      collected: { type: Number, default: 0 },
      currency:  { type: String, default: 'FCFA' },
      reserved:  { type: Boolean, default: false },
    }],
  

  // ── Invitation ──────────────────────────────────────────────────
  invitation: {
    message:     { type: String, default: 'Vous êtes invités à célébrer notre union' },
    specialNote: { type: String, default: '' },
  },

  // ── Navigation ──────────────────────────────────────────────────
  navigation: {
    showStory:     { type: Boolean, default: true },
    showEventInfo: { type: Boolean, default: true },
    showDressCode: { type: Boolean, default: true },
    showPhotos:    { type: Boolean, default: true },
    showGuestbook: { type: Boolean, default: true },
    customLinks: [{ label: { type: String }, url: { type: String } }],
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    message: { type: String, default: 'Avec amour' },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook:  { type: String, default: '' },
      twitter:   { type: String, default: '' },
    },
  },

  // ── Settings ────────────────────────────────────────────────────
  settings: {
    language: { type: String, default: 'fr', enum: ['fr', 'en'] },
    currency: { type: String, default: 'FCFA' },
    timezone: { type: String, default: 'Africa/Douala' },
    theme: {
      id:             { type: String, default: 'royal' },
      primaryColor:   { type: String, default: '#0A2463' },
      secondaryColor: { type: String, default: '#D4AF37' },
      accentColor:    { type: String, default: '' },
      fontFamily:     { type: String, default: 'Playfair Display' },
      heroLayout:     { type: String, default: 'centered' },
      navStyle:       { type: String, default: 'dark' },
      sectionBg:      { type: String, default: 'dark' },
      style:          { type: String, default: 'classic' },
      heroImage:      { type: String, default: '' }, // ✅ Photo du couple
    },
    features: {
      countdown:  { type: Boolean, default: true },
      music:      { type: Boolean, default: false },
      animations: { type: Boolean, default: true },
    },
  },

  customSlug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },

  plan:   { type: String, default: 'free' },
  theme:  { type: String, default: 'royal' },

  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active',
  },

  stats: {
    totalGuests:       { type: Number, default: 0 },
    confirmedGuests:   { type: Number, default: 0 },
    declinedGuests:    { type: Number, default: 0 },
    totalBudget:       { type: Number, default: 0 },
    tasksCompleted:    { type: Number, default: 0 },
    photosUploaded:    { type: Number, default: 0 },
    guestbookMessages: { type: Number, default: 0 },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},
 {
  // ✅ strict: false permet de sauvegarder des champs non déclarés
  // Utile pendant le dev, à repasser à true en prod
  strict: false,
});

weddingSchema.index({ userId: 1, status: 1 });
weddingSchema.index({ customSlug: 1 });

weddingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

weddingSchema.statics.generateSlug = async function(firstName1, firstName2) {
  const base = `${firstName1}-${firstName2}`.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  let slug = base;
  let counter = 1;
  while (await this.findOne({ customSlug: slug })) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
};

module.exports = mongoose.model('Wedding', weddingSchema);
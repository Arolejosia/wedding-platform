// backend/models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // Infos de base
  businessName: { type: String, required: true, trim: true },
  ownerName:    { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:        { type: String, default: '' },
  website:      { type: String, default: '' },
  instagram:    { type: String, default: '' },

  // Type de prestataire
  category: {
    type: String,
    required: true,
    enum: [
      'photographe',
      'traiteur',
      'dj',
      'fleuriste',
      'salle',
      'decorateur',
      'robe',
      'transport',
      'wedding_planner',
      'autre',
    ],
  },

  // Localisation
  country:  { type: String, required: true },
  city:     { type: String, required: true },
  region:   { type: String, default: '' },

  // Description
  description: { type: String, default: '', maxlength: 1000 },
  tagline:     { type: String, default: '', maxlength: 150 },

  // Médias
  logo:   { type: String, default: '' }, // URL Cloudinary
  photos: [{ type: String }],            // URLs Cloudinary

  // Tarifs
  priceRange: {
    type: String,
    enum: ['budget', 'moyen', 'premium', 'luxe'],
    default: 'moyen',
  },
  startingPrice: { type: Number, default: 0 },
  currency:      { type: String, default: 'FCFA' },

  // Statut d'approbation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: { type: String, default: '' },
  approvedAt:      { type: Date, default: null },
  approvedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Stats
  views:    { type: Number, default: 0 },
  contacts: { type: Number, default: 0 },

  // Mise en avant
  featured: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

vendorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

vendorSchema.index({ status: 1, category: 1, country: 1 });
vendorSchema.index({ status: 1, featured: -1, createdAt: -1 });

module.exports = mongoose.model('Vendor', vendorSchema);
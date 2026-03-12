// models/Gift.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  amount:      { type: Number, required: true },
  currency:    { type: String, required: true },
  method:      { type: String, enum: ['stripe', 'flutterwave', 'manual'], required: true },
  status:      { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  guestName:   { type: String },
  guestEmail:  { type: String },
  providerRef: { type: String }, // Stripe PaymentIntent ID ou Flutterwave tx_ref
  itemId:      { type: String }, // null si cagnotte ou enveloppe
  type:        { type: String, enum: ['item', 'cagnotte', 'free'] },
  createdAt:   { type: Date, default: Date.now },
});

const GiftItemSchema = new mongoose.Schema({
  id:        { type: String, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  collected: { type: Number, default: 0 },
  currency:  { type: String, default: 'FCFA' },
  icon:      { type: String, default: '🎁' },
  reserved:  { type: Boolean, default: false },
});

const GiftSchema = new mongoose.Schema({
  weddingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wedding', required: true, unique: true },

  // Config activée par le couple
  externalLinks: [{
    id:    String,
    label: String,
    url:   String,
    icon:  String,
  }],

  
  // Numéros Mobile Money
  paymentNumbers: {
    mtnMoMo:     { type: String, default: '' },
    orangeMoney:  { type: String, default: '' },
    accountName:  { type: String, default: '' },
    message:      { type: String, default: 'Merci pour votre générosité et votre soutien.' },
  },
  cagnotte: {
    enabled:   { type: Boolean, default: false },
    title:     { type: String, default: '✈️ Lune de Miel' },
    description: String,
    goal:      { type: Number, default: 0 },
    collected: { type: Number, default: 0 },
    currency:  { type: String, default: 'CAD' },
  },

  items: [GiftItemSchema],

  freeContribution: {
    enabled:  { type: Boolean, default: true },
    currency: { type: String, default: 'CAD' },
  },

  // Toutes les transactions
  transactions: [TransactionSchema],

  // Totaux mis à jour par webhooks
  totalCollected: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware : updatedAt auto
GiftSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Gift', GiftSchema);
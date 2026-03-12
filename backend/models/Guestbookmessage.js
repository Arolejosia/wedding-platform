// backend/models/GuestbookMessage.js
const mongoose = require('mongoose');

const GuestbookMessageSchema = new mongoose.Schema({
  weddingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true,
    index: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  emoji: {
    type: String,
    default: '💝'
  },
  
  color: {
    type: String,
    default: '#FFE4B5'
  },
  
  approved: {
    type: Boolean,
    default: true  // Auto-approuvé par défaut (peut être changé par wedding)
  },
  
  guestCode: {
    type: String,
    trim: true
  }
  
}, {
  timestamps: true
});

// Index pour requêtes rapides
GuestbookMessageSchema.index({ weddingId: 1, createdAt: -1 });
GuestbookMessageSchema.index({ weddingId: 1, approved: 1 });

module.exports = mongoose.model('GuestbookMessage', GuestbookMessageSchema);
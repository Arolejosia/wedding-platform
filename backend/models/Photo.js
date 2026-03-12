// backend/models/Photo.js
const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  weddingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true,
    index: true
  },
  
  category: {
    type: String,
    required: true,
 
  },
  
  url: {
    type: String,
    required: true
  },
  
  thumbnailUrl: {
    type: String
  },
  
  guestCode: {
    type: String,
    trim: true
  },
  
  guestName: {
    type: String,
    trim: true
  },
  
  approved: {
    type: Boolean,
    default: true
  },
  
  likes: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true
});

// Index pour requêtes rapides
PhotoSchema.index({ weddingId: 1, createdAt: -1 });
PhotoSchema.index({ weddingId: 1, category: 1 });
PhotoSchema.index({ weddingId: 1, approved: 1 });

module.exports = mongoose.model('Photo', PhotoSchema);
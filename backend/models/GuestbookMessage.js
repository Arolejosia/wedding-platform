// backend/models/GuestbookMessage.js
const mongoose = require('mongoose');

const GuestbookMessageSchema = new mongoose.Schema({
  weddingId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Wedding',
    required: true,
    index:    true,
  },
  name: {
    type:     String,
    required: true,
    trim:     true,
  },
  // "text" | "audio" | "both"
  type: {
    type:    String,
    enum:    ['text', 'audio', 'both'],
    default: 'text',
  },
  message: {
    type:      String,
    maxlength: 500,
    default:   '',
  },
  audioUrl: {
    type:    String,
    default: null,
  },
  audioDuration: {
    type:    Number, // secondes
    default: null,
  },
  emoji: {
    type:    String,
    default: '💝',
  },
  color: {
    type:    String,
    default: '#FFE4B5',
  },
  approved: {
    type:    Boolean,
    default: true,
  },
  guestCode: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

GuestbookMessageSchema.index({ weddingId: 1, createdAt: -1 });
GuestbookMessageSchema.index({ weddingId: 1, approved: 1 });

module.exports = mongoose.model('GuestbookMessage', GuestbookMessageSchema);
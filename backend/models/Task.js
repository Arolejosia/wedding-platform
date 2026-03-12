// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  weddingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true,
    index: true,
  },
  
    title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      'venue',        // Lieu de réception
      'catering',     // Traiteur
      'decoration',   // Décoration
      'photography',  // Photo/Vidéo
      'music',        // Musique/DJ
      'invitations',  // Invitations
      'outfits',      // Tenues
      'transport',    // Transport
      'flowers',      // Fleurs
      'cake',         // Gâteau
      'paperwork',    // Administratif
      'other',        // Autre
    ],
    default: 'other',
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  deadline: {
    type: Date,
    default: null,
  },
  cost: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  supplier: {
    name: { type: String, default: '' },
    contact: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
assignedTo: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WeddingMember"
  }
],
  notes: {
    type: String,
    default: '',
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  
});
taskSchema.index({ userId: 1, weddingId: 1, category: 1 });
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status === 'done' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  if (this.status !== 'done') {
    this.completedAt = null;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
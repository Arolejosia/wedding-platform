// models/Guest.js
const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  
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
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  ticketType: {
    type: String,
    enum: ['simple', 'couple'],
    required: true,
    default: 'couple'
  },
    ticketsPerCode: {        // ← NOUVEAU CHAMP
    type: Number,
    default: 1,
    min: 1,
    max: 10,
  },
  category: {
    type: String,
    required: true,
    enum: ['JF', 'JA', 'UF', 'UA']
  },
  
  person1Name: {
    type: String,
    default: null
  },
  
  person2Name: {
    type: String,
    default: null
  },
  
  email: {
    type: String,
    default: ''
  },
  
  phone: {
    type: String,
    default: ''
  },
  
  rsvpStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'declined'],
    default: 'pending'
  },

  // Type de participation
  attendanceType: {
    type: String,
    enum: ['full', 'party', 'morning'],
    default: null
  },
  
  rsvpDate: {
    type: Date,
    default: null
  },
  
  dietaryRestrictions: {
    type: String,
    default: ''
  },
  
  tableNumber: {
    type: Number,
    default: null
  },
  
  tableName: {
    type: String,
    default: null
  },
  
  seatNumber: {
    type: Number,
    default: null
  },
  
  assignedAt: {
    type: Date,
    default: null
  },
  
  notes: {
    type: String,
    default: ''
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
GuestSchema.index({ userId: 1, weddingId: 1, code: 1 }, { unique: true }); // Index unique sur code pour chaque mariage

GuestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Guest = mongoose.model('Guest', GuestSchema);

module.exports = Guest;
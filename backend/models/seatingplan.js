// models/SeatingPlan.js
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({

  
    tableNumber: {
    type: Number,
    required: true,
  },
  tableName: {
    type: String,
    default: '',
  },
  shape: {
    type: String,
    enum: ['round', 'rectangular', 'square'],
    default: 'round',
  },
  capacity: {
    type: Number,
    required: true,
    min: 2,
    max: 20,
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  rotation: {
    type: Number,
    default: 0,
  },
  theme: {
    color: { type: String, default: '#D4AF37' },
    icon: { type: String, default: '' },
  },
  notes: {
    type: String,
    default: '',
  },
});

const seatingPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    default: 'Plan principal',
  },
  venue: {
    name: { type: String, default: '' },
    dimensions: {
      width: { type: Number, default: 1200 },
      height: { type: Number, default: 800 },
    },
  },
  tables: [tableSchema],
  assignments: [{
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    seatNumber: {
      type: Number,
      default: null,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
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



seatingPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SeatingPlan', seatingPlanSchema);
const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  
  number: {
    type: Number,
    required: true,
    unique: true
  },
  
  name: {
    type: String,
    default: ''
  },
  
  capacity: {
    type: Number,
    required: true,
    default: 10
  },
  
  occupiedSeats: {
    type: Number,
    default: 0
  },
  
  type: {
    type: String,
    enum: ['ronde', 'rectangulaire', 'vip'],
    default: 'ronde'
  },
  
  location: {
    type: String,
    default: ''
  },
  
  preferredCategories: [{
    type: String,
    enum: ['JF', 'JA', 'UF', 'UA']
  }],
  
  isReserved: {
    type: Boolean,
    default: false
  },
  
  notes: {
    type: String,
    default: ''
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Table = mongoose.model('Table', TableSchema);

module.exports = Table;
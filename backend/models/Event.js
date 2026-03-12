const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    default: ''
  },
  
  date: {
    type: Date,
    required: true
  },
  
  time: {
    type: String,
    default: ''
  },
  
  location: {
    type: String,
    required: true
  },
  
  address: {
    type: String,
    default: ''
  },
  
  googleMapsUrl: {
    type: String,
    default: ''
  },
  
  dressCode: {
    type: String,
    default: ''
  },
  
  type: {
    type: String,
    enum: ['ceremonie', 'cocktail', 'diner', 'autre'],
    default: 'autre'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
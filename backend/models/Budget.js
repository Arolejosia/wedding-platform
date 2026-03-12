// models/Budget.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  
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
    required: true,
    enum: [
      'venue',
      'catering',
      'decoration',
      'photography',
      'music',
      'invitations',
      'outfits',
      'transport',
      'flowers',
      'cake',
      'gifts',
      'other',
    ],
  },
  estimatedCost: {
    type: Number,
    default: 0,
  },
  actualCost: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending',
  },
  supplier: {
    name: { type: String, default: '' },
    contact: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  dueDate: {
    type: Date,
    default: null,
  },
  paymentDate: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
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
expenseSchema.index({ userId: 1, weddingId: 1, category: 1 });
const budgetSchema = new mongoose.Schema({
  totalBudget: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: 'FCFA',
  },
  expenses: [expenseSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

budgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Mettre à jour le statut de chaque dépense
  this.expenses.forEach(expense => {
    expense.updatedAt = Date.now();
    
    if (expense.paid === 0) {
      expense.status = 'pending';
    } else if (expense.paid >= expense.actualCost || expense.paid >= expense.estimatedCost) {
      expense.status = 'paid';
      if (!expense.paymentDate) {
        expense.paymentDate = Date.now();
      }
    } else {
      expense.status = 'partial';
    }
  });
  
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
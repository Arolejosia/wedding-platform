// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'planner'],
    default: 'user',
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'cancelled'],
      default: 'trial',
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
});

// Hash password avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour vérifier l'abonnement
userSchema.methods.hasActiveSubscription = function() {
  const now = new Date();
  
  // Trial actif
  if (this.subscription.status === 'trial' && this.subscription.trialEndsAt > now) {
    return true;
  }
  
  // Abonnement actif
  if (this.subscription.status === 'active') {
    if (!this.subscription.expiresAt || this.subscription.expiresAt > now) {
      return true;
    }
  }
  
  return false;
};

// Méthode pour limites selon le plan
userSchema.methods.getLimits = function() {
  const limits = {
    free: {
      maxGuests: 50,
      maxWeddings: 1,
      features: ['rsvp', 'guestbook', 'photos'],
    },
    pro: {
      maxGuests: 200,
      maxWeddings: 3,
      features: ['rsvp', 'guestbook', 'photos', 'checklist', 'seating', 'budget'],
    },
    premium: {
      maxGuests: -1, // illimité
      maxWeddings: -1,
      features: ['all', 'white-label', 'custom-domain', 'analytics'],
    },
  };
  
  return limits[this.subscription.plan] || limits.free;
};

module.exports = mongoose.model('User', userSchema);
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// ========================================
// Middleware pour vérifier le token JWT
// ========================================
const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    // Vérifier l'abonnement actif (optionnel, peut être désactivé pour le dev)
  /*  if (!user.hasActiveSubscription()) {
      return res.status(403).json({ 
        error: 'Abonnement expiré',
        subscription: user.subscription 
      });
    }*/

    // Ajouter l'utilisateur à la requête
    req.userId = user._id;
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    
    console.error('Erreur auth middleware:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ========================================
// Middleware optionnel (pour routes publiques qui peuvent utiliser auth)
// ========================================
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        req.userId = user._id;
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignorer les erreurs, simplement ne pas authentifier
    next();
  }
};

// ========================================
// Middleware pour vérifier les limites du plan
// ========================================
const checkPlanLimit = (resource) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const limits = user.getLimits();

      // Vérifier selon le type de ressource
      switch(resource) {
        case 'guests':
          const Wedding = require('../models/Wedding');
          const wedding = await Wedding.findOne({ 
            _id: req.body.weddingId || req.params.weddingId,
            userId: user._id 
          });
          
          if (!wedding) {
            return res.status(404).json({ error: 'Mariage introuvable' });
          }

          if (limits.maxGuests !== -1 && wedding.stats.totalGuests >= limits.maxGuests) {
            return res.status(403).json({ 
              error: `Limite atteinte : ${limits.maxGuests} invités maximum pour le plan ${user.subscription.plan}`,
              upgrade: true 
            });
          }
          break;

        case 'weddings':
          const weddingCount = await Wedding.countDocuments({ userId: user._id });
          
          if (limits.maxWeddings !== -1 && weddingCount >= limits.maxWeddings) {
            return res.status(403).json({ 
              error: `Limite atteinte : ${limits.maxWeddings} mariages maximum pour le plan ${user.subscription.plan}`,
              upgrade: true 
            });
          }
          break;

        case 'feature':
          const feature = req.body.feature || req.query.feature;
          
          if (!limits.features.includes('all') && !limits.features.includes(feature)) {
            return res.status(403).json({ 
              error: `Fonctionnalité non disponible dans le plan ${user.subscription.plan}`,
              upgrade: true 
            });
          }
          break;
      }

      next();
    } catch (error) {
      console.error('Erreur checkPlanLimit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  checkPlanLimit,
};
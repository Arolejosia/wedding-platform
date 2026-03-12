// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wedding = require('../models/Wedding');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

// ========================================
// POST /api/auth/register - Inscription
// ========================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, weddingDate, partner1FirstName, partner1LastName, partner2FirstName, partner2LastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Créer l'utilisateur
    const user = new User({
      email,
      password,
      firstName,
      lastName,
    });

    await user.save();

    // Créer le premier mariage automatiquement
    const wedding = new Wedding({
      userId: user._id,
      title: `Mariage de ${partner1FirstName} & ${partner2FirstName}`,
      couple: {
        person1: {
          firstName: partner1FirstName || firstName,
          lastName: partner1LastName || lastName,
        },
        person2: {
          firstName: partner2FirstName || '',
          lastName: partner2LastName || '',
        },
      },
      weddingDate: weddingDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // +6 mois par défaut
    });

    // Générer slug unique
    wedding.customSlug = await Wedding.generateSlug(
      partner1FirstName || firstName,
      partner2FirstName || 'mariage'
    );

    await wedding.save();

    // Générer JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription,
      },
      wedding: {
        id: wedding._id,
        title: wedding.title,
        slug: wedding.customSlug,
      },
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// ========================================
// POST /api/auth/login - Connexion
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Générer JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription,
      },
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// ========================================
// GET /api/auth/me - Info utilisateur connecté
// ========================================
router.get('/me', async (req, res) => {
  try {
    // Le middleware auth aura ajouté req.userId
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Récupérer ses mariages
    const weddings = await Wedding.find({ userId: user._id });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription: user.subscription,
        limits: user.getLimits(),
      },
      weddings,
    });

  } catch (error) {
    console.error('Erreur récupération user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================================
// POST /api/auth/logout - Déconnexion
// ========================================
router.post('/logout', (req, res) => {
  // Avec JWT, la déconnexion se fait côté client (supprimer le token)
  res.json({ success: true, message: 'Déconnexion réussie' });
});

module.exports = router;
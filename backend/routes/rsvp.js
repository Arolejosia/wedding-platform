const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');

// ========== RSVP - Confirmer la présence ==========
router.post('/', async (req, res) => {
  try {
    const { code, status, dietaryRestrictions } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Le code est requis'
      });
    }
    
    const guest = await Guest.findOne({ code: code.toUpperCase() });
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Code invalide. Invité non trouvé.'
      });
    }
    
    if (guest.rsvpStatus === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà confirmé votre présence.'
      });
    }
    
    guest.rsvpStatus = status;
    guest.rsvpDate = new Date();
    
    if (dietaryRestrictions) {
      guest.dietaryRestrictions = dietaryRestrictions;
    }
    
    await guest.save();
    
    res.status(200).json({
      success: true,
      message: status === 'confirmed' 
        ? 'Merci ! Votre présence est confirmée 🎉' 
        : 'Nous avons bien reçu votre réponse.',
      data: {
        code: guest.code,
        person1Name: guest.person1Name,
        person2Name: guest.person2Name,
        status: guest.rsvpStatus,
        rsvpDate: guest.rsvpDate
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation',
      error: error.message
    });
  }
});

// ========== Vérifier un code ==========
router.get('/verify/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    
    const guest = await Guest.findOne({ code: code });
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Code invalide'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        code: guest.code,
        person1Name: guest.person1Name,
        person2Name: guest.person2Name,
        ticketType: guest.ticketType,
        rsvpStatus: guest.rsvpStatus
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
});

module.exports = router;
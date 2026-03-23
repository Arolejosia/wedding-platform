const express = require('express');
const router  = express.Router();
const Guest   = require('../models/Guest');

// POST /verify — vérifier un code
router.post('/verify', async (req, res) => {
  try {
    const { code, weddingId } = req.body;
    if (!code || !weddingId) return res.status(400).json({ error: 'Code et weddingId requis' });

    const guest = await Guest.findOne({ 
      code: code.toUpperCase(), 
      weddingId 
    });

    if (!guest) return res.status(404).json({ error: 'Code invalide' });

    res.json({
      guest: {
        code:               guest.code,
        ticketType:         guest.ticketType,
        hasRsvp:            guest.rsvpStatus !== 'pending',
        rsvpStatus:         guest.rsvpStatus,
        person1Name:        guest.person1Name || '',
        person2Name:        guest.person2Name || '',
        email:              guest.email || '',
        phone:              guest.phone || '',
        attendanceType:     guest.attendanceType || 'full',
        dietaryRestrictions: guest.dietaryRestrictions || '',
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST / — soumettre le RSVP
router.post('/', async (req, res) => {
  try {
    const { weddingId, code, person1Name, person2Name, email, phone, rsvpStatus, attendanceType, dietaryRestrictions } = req.body;
    if (!code || !weddingId) return res.status(400).json({ error: 'Code et weddingId requis' });

    const guest = await Guest.findOneAndUpdate(
      { code: code.toUpperCase(), weddingId },
      { person1Name, person2Name, email, phone, rsvpStatus, attendanceType, dietaryRestrictions, rsvpDate: new Date() },
      { new: true }
    );

    if (!guest) return res.status(404).json({ error: 'Code invalide' });

    res.json({ success: true, guest });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
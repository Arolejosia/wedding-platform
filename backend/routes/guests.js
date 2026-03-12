// routes/guests.js
const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');

// Fonction pour générer un code aléatoire 4 caractères (2 lettres + 2 chiffres)
const generateCode = (prefix = '') => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  
  let code = prefix.substring(0, 2).toUpperCase();
  
  while (code.length < 2) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  for (let i = 0; i < 2; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
};

// POST /api/guests/generate - Générer des codes
router.post('/generate', async (req, res) => {
  try {
    const { count, category, ticketType, ticketsPerCode } = req.body;
    
    if (!count || count < 1 || count > 500) {
      return res.status(400).json({ error: 'Nombre invalide (1-500)' });
    }

    if (!category || !['JF', 'JA', 'UF', 'UA'].includes(category)) {
      return res.status(400).json({ error: 'Catégorie invalide' });
    }

    const codes = [];
    const guests = [];
    let attempts = 0;

    while (codes.length < count && attempts < count * 10) {
      attempts++;
      const code = generateCode(category);
      
      const exists = await Guest.findOne({ code });
      if (!exists && !codes.includes(code)) {
        codes.push(code);
        guests.push({
          code,
          category,
          ticketType: ticketType || 'couple',
          ticketsPerCode: ticketsPerCode || 1,
    
        });
      }
    }

    if (codes.length < count) {
      return res.status(500).json({ 
        error: `Seulement ${codes.length} codes générés sur ${count}` 
      });
    }

    await Guest.insertMany(guests);

    console.log(`✅ ${codes.length} codes générés pour ${category}`);
    res.json({ success: true, count: codes.length, category, codes });
  } catch (error) {
    console.error('Erreur génération:', error);
    res.status(500).json({ error: 'Erreur génération' });
  }
});

// GET /api/guests - Liste tous les invités avec stats
router.get('/', async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    
    const stats = {
      total: guests.length,
      pending: guests.filter(g => g.rsvpStatus === 'pending').length,
      confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
      declined: guests.filter(g => g.rsvpStatus === 'declined').length,
      byCategory: {},
      byTicketType: {
        simple: guests.filter(g => g.ticketType === 'simple').length,
        couple: guests.filter(g => g.ticketType === 'couple').length,
      },
    };

    ['JF', 'JA', 'UF', 'UA'].forEach(cat => {
      const catGuests = guests.filter(g => g.category === cat);
      stats.byCategory[cat] = {
        total: catGuests.length,
        confirmed: catGuests.filter(g => g.rsvpStatus === 'confirmed').length,
        declined: catGuests.filter(g => g.rsvpStatus === 'declined').length,
        pending: catGuests.filter(g => g.rsvpStatus === 'pending').length,
      };
    });

    res.json({ success: true, guests, stats });
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération' });
  }
});

// POST /api/guests/verify - Vérifier un code
router.post('/verify', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.length !== 4) {
      return res.status(400).json({ error: 'Code invalide' });
    }

    const guest = await Guest.findOne({ code: code.toUpperCase() });

    if (!guest) {
      return res.status(404).json({ error: 'Code introuvable' });
    }

    res.json({
      success: true,
      guest: {
        code: guest.code,
        ticketType: guest.ticketType,
        person1Name: guest.person1Name,
        person2Name: guest.person2Name,
        email: guest.email,
        phone: guest.phone,
        rsvpStatus: guest.rsvpStatus,
        attendanceType: guest.attendanceType,
        dietaryRestrictions: guest.dietaryRestrictions,
        category: guest.category,
        hasRsvp: guest.rsvpStatus !== 'pending',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur vérification' });
  }
});

// POST /api/guests/rsvp - Confirmer présence
router.post('/rsvp', async (req, res) => {
  try {
    const { 
      code, 
      person1Name, 
      person2Name, 
      email, 
      phone,
      rsvpStatus,
      attendanceType,
      dietaryRestrictions 
    } = req.body;

    if (!code || !person1Name || !email || !rsvpStatus) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    if (!['confirmed', 'declined'].includes(rsvpStatus)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const guest = await Guest.findOne({ code: code.toUpperCase() });

    if (!guest) {
      return res.status(404).json({ error: 'Code introuvable' });
    }

    // Validation ticket couple
    if (guest.ticketType === 'couple' && rsvpStatus === 'confirmed' && !person2Name) {
      return res.status(400).json({ error: 'Nom de la 2ème personne requis pour ticket couple' });
    }

    // Mettre à jour
    guest.person1Name = person1Name.trim();
    guest.person2Name = guest.ticketType === 'couple' ? (person2Name?.trim() || null) : null;
    guest.email = email.trim();
    guest.phone = phone?.trim() || '';
    guest.rsvpStatus = rsvpStatus;
    guest.attendanceType = rsvpStatus === 'confirmed' ? attendanceType : null;
    guest.dietaryRestrictions = dietaryRestrictions?.trim() || '';
    guest.rsvpDate = new Date();
    
    await guest.save();

    console.log(`✅ RSVP: ${person1Name} ${person2Name ? `& ${person2Name}` : ''} (${code}) → ${rsvpStatus}`);

    res.json({
      success: true,
      message: rsvpStatus === 'confirmed' 
        ? '🎉 Merci pour votre confirmation !'
        : '😢 Nous sommes désolés que vous ne puissiez pas venir',
      guest: {
        code: guest.code,
        person1Name: guest.person1Name,
        person2Name: guest.person2Name,
        rsvpStatus: guest.rsvpStatus,
      },
    });
  } catch (error) {
    console.error('Erreur RSVP:', error);
    res.status(500).json({ error: 'Erreur enregistrement' });
  }
});

// DELETE /api/guests/:id - Supprimer un invité
router.delete('/:id', async (req, res) => {
  try {
    await Guest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});
// Ajoutez cette route dans routes/guests.js

// GET /api/guests/invite/:code - Route pour InvitePage
router.get('/invite/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (!code || code.length !== 4) {
      return res.status(400).json({ error: 'Code invalide' });
    }

    const guest = await Guest.findOne({ code: code.toUpperCase() });

    if (!guest) {
      return res.status(404).json({ error: 'Code introuvable' });
    }

    // Retourner les données pour pré-remplir le RSVP
    res.json({
      code: guest.code,
      ticketType: guest.ticketType,
      category: guest.category,
      person1Name: guest.person1Name,
      person2Name: guest.person2Name,
      email: guest.email,
      phone: guest.phone,
      rsvpStatus: guest.rsvpStatus,
      attendanceType: guest.attendanceType,
      dietaryRestrictions: guest.dietaryRestrictions,
      hasRsvp: guest.rsvpStatus !== 'pending',
    });
  } catch (error) {
    console.error('Erreur invite:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/guests/export - Export CSV
router.get('/export', async (req, res) => {
  try {
    const guests = await Guest.find().sort({ category: 1, code: 1 });
    
    let csv = 'Code,Type,Catégorie,Personne 1,Personne 2,Email,Téléphone,Statut,Participation,Restrictions,Table,Date RSVP\n';
    guests.forEach(g => {
      csv += `${g.code},${g.ticketType},${g.category},${g.person1Name || '-'},${g.person2Name || '-'},${g.email || '-'},${g.phone || '-'},${g.rsvpStatus},${g.attendanceType || '-'},${g.dietaryRestrictions || '-'},${g.tableNumber || '-'},${g.rsvpDate ? new Date(g.rsvpDate).toLocaleDateString('fr-FR') : '-'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=invites-josia-ulrich.csv');
    res.send('\ufeff' + csv);
  } catch (error) {
    res.status(500).json({ error: 'Erreur export' });
  }
});

module.exports = router;
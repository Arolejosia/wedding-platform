const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');

// ========== Générer des codes en masse ==========
router.post('/codes', async (req, res) => {
  try {
    const { category, count, ticketType } = req.body;
    
    // Validation
    if (!category || !count) {
      return res.status(400).json({
        success: false,
        message: 'Catégorie et nombre requis'
      });
    }
    
    if (!['JF', 'JA', 'UF', 'UA'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Catégorie invalide. Utilisez JF, JA, UF ou UA'
      });
    }
    
    if (count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre doit être entre 1 et 100'
      });
    }
    
    // Trouver le dernier numéro existant pour cette catégorie
    const lastGuest = await Guest.findOne({ category: category })
      .sort({ code: -1 })
      .limit(1);
    
    let startNumber = 1;
    if (lastGuest) {
      const lastNumber = parseInt(lastGuest.code.replace(category, ''));
      startNumber = lastNumber + 1;
    }
    
    // Générer les nouveaux invités
    const newGuests = [];
    const generatedCodes = [];
    
    for (let i = 0; i < count; i++) {
      const number = startNumber + i;
      const code = `${category}${number.toString().padStart(2, '0')}`;
      
      const guest = {
        code: code,
        category: category,
        ticketType: ticketType || 'couple',
        person1Name: '',
        person2Name: ticketType === 'couple' ? '' : null,
        email: '',
        phone: '',
        rsvpStatus: 'pending'
      };
      
      newGuests.push(guest);
      generatedCodes.push(code);
    }
    
    // Insérer tous les invités d'un coup
    await Guest.insertMany(newGuests);
    
    res.status(201).json({
      success: true,
      message: `${count} codes générés avec succès`,
      data: {
        category: category,
        count: count,
        ticketType: ticketType || 'couple',
        codes: generatedCodes
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération',
      error: error.message
    });
  }
});

// ========== Générer des tables automatiquement ==========
router.post('/tables', async (req, res) => {
  try {
    const { count, capacity } = req.body;
    
    if (!count || count < 1 || count > 50) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre de tables doit être entre 1 et 50'
      });
    }
    
    const tableCapacity = capacity || 10;
    const Table = require('../models/Table');
    
    // Trouver le dernier numéro de table
    const lastTable = await Table.findOne().sort({ number: -1 }).limit(1);
    let startNumber = 1;
    if (lastTable) {
      startNumber = lastTable.number + 1;
    }
    
    const newTables = [];
    
    for (let i = 0; i < count; i++) {
      const tableNumber = startNumber + i;
      const table = {
        number: tableNumber,
        name: `Table ${tableNumber}`,
        capacity: tableCapacity,
        occupiedSeats: 0,
        type: 'ronde',
        isReserved: false
      };
      newTables.push(table);
    }
    
    await Table.insertMany(newTables);
    
    res.status(201).json({
      success: true,
      message: `${count} tables générées avec succès`,
      data: {
        count: count,
        capacity: tableCapacity,
        startNumber: startNumber,
        endNumber: startNumber + count - 1
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des tables',
      error: error.message
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const Table = require('../models/Table');

// ========== Assignation automatique des tables ==========
router.post('/', async (req, res) => {
  try {
    // 1. Récupérer tous les invités confirmés sans table
    const unassignedGuests = await Guest.find({
      rsvpStatus: 'confirmed',
      tableNumber: null
    }).sort({ category: 1, code: 1 });
    
    if (unassignedGuests.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Aucun invité à assigner',
        data: { assigned: 0 }
      });
    }
    
    // 2. Récupérer toutes les tables disponibles
    const tables = await Table.find({ isReserved: false })
      .sort({ number: 1 });
    
    if (tables.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune table disponible'
      });
    }
    
    // 3. Grouper les invités par catégorie
    const guestsByCategory = {
      JF: [],
      JA: [],
      UF: [],
      UA: []
    };
    
    unassignedGuests.forEach(guest => {
      guestsByCategory[guest.category].push(guest);
    });
    
    // 4. Algorithme d'assignation
    let currentTableIndex = 0;
    let currentTable = tables[currentTableIndex];
    let assignedCount = 0;
    
    // Parcourir chaque catégorie
    for (const [category, guests] of Object.entries(guestsByCategory)) {
      for (const guest of guests) {
        // Vérifier si la table actuelle est pleine
        if (currentTable.occupiedSeats >= currentTable.capacity) {
          // Passer à la table suivante
          currentTableIndex++;
          
          if (currentTableIndex >= tables.length) {
            // Plus de tables disponibles
            break;
          }
          
          currentTable = tables[currentTableIndex];
        }
        
        // Calculer le nombre de places nécessaires
        const seatsNeeded = guest.ticketType === 'couple' ? 2 : 1;
        
        // Vérifier s'il y a assez de place
        if (currentTable.occupiedSeats + seatsNeeded <= currentTable.capacity) {
          // Assigner l'invité à cette table
          guest.tableNumber = currentTable.number;
          guest.tableName = currentTable.name;
          guest.assignedAt = new Date();
          
          await guest.save();
          
          // Mettre à jour les places occupées
          currentTable.occupiedSeats += seatsNeeded;
          await currentTable.save();
          
          assignedCount++;
        }
      }
    }
    
    // 5. Récupérer les invités assignés pour la réponse
    const assignedGuests = await Guest.find({
      rsvpStatus: 'confirmed',
      tableNumber: { $ne: null }
    });
    
    res.status(200).json({
      success: true,
      message: `${assignedCount} invités assignés avec succès`,
      data: {
        assigned: assignedCount,
        totalAssigned: assignedGuests.length,
        remaining: unassignedGuests.length - assignedCount
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'assignation',
      error: error.message
    });
  }
});

// ========== Réassigner un invité manuellement ==========
router.put('/manual', async (req, res) => {
  try {
    const { code, tableNumber } = req.body;
    
    if (!code || !tableNumber) {
      return res.status(400).json({
        success: false,
        message: 'Code et numéro de table requis'
      });
    }
    
    // Trouver l'invité
    const guest = await Guest.findOne({ code: code.toUpperCase() });
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Invité non trouvé'
      });
    }
    
    // Trouver la nouvelle table
    const newTable = await Table.findOne({ number: tableNumber });
    
    if (!newTable) {
      return res.status(404).json({
        success: false,
        message: 'Table non trouvée'
      });
    }
    
    const seatsNeeded = guest.ticketType === 'couple' ? 2 : 1;
    
    // Vérifier la capacité
    if (newTable.occupiedSeats + seatsNeeded > newTable.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Table pleine'
      });
    }
    
    // Si l'invité avait déjà une table, libérer les places
    if (guest.tableNumber) {
      const oldTable = await Table.findOne({ number: guest.tableNumber });
      if (oldTable) {
        oldTable.occupiedSeats -= seatsNeeded;
        await oldTable.save();
      }
    }
    
    // Assigner à la nouvelle table
    guest.tableNumber = newTable.number;
    guest.tableName = newTable.name;
    guest.assignedAt = new Date();
    await guest.save();
    
    // Mettre à jour la nouvelle table
    newTable.occupiedSeats += seatsNeeded;
    await newTable.save();
    
    res.status(200).json({
      success: true,
      message: 'Invité réassigné avec succès',
      data: guest
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réassignation',
      error: error.message
    });
  }
});

// ========== Supprimer l'assignation d'un invité ==========
router.delete('/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    
    const guest = await Guest.findOne({ code: code });
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Invité non trouvé'
      });
    }
    
    if (!guest.tableNumber) {
      return res.status(400).json({
        success: false,
        message: 'Invité pas encore assigné'
      });
    }
    
    // Libérer les places de la table
    const table = await Table.findOne({ number: guest.tableNumber });
    if (table) {
      const seatsNeeded = guest.ticketType === 'couple' ? 2 : 1;
      table.occupiedSeats -= seatsNeeded;
      await table.save();
    }
    
    // Supprimer l'assignation
    guest.tableNumber = null;
    guest.tableName = null;
    guest.assignedAt = null;
    await guest.save();
    
    res.status(200).json({
      success: true,
      message: 'Assignation supprimée',
      data: guest
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
});

module.exports = router;
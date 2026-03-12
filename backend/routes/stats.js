const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const Table = require('../models/Table');

// ========== Statistiques globales ==========
router.get('/', async (req, res) => {
  try {
    // 1. Statistiques des invités
    const totalGuests = await Guest.countDocuments();
    const confirmed = await Guest.countDocuments({ rsvpStatus: 'confirmed' });
    const declined = await Guest.countDocuments({ rsvpStatus: 'declined' });
    const pending = await Guest.countDocuments({ rsvpStatus: 'pending' });
    const assigned = await Guest.countDocuments({ 
      tableNumber: { $ne: null } 
    });
    
    // 2. Statistiques par catégorie
    const byCategory = {};
    const categories = ['JF', 'JA', 'UF', 'UA'];
    
    for (const category of categories) {
      const total = await Guest.countDocuments({ category: category });
      const confirmedCat = await Guest.countDocuments({ 
        category: category, 
        rsvpStatus: 'confirmed' 
      });
      const pendingCat = await Guest.countDocuments({ 
        category: category, 
        rsvpStatus: 'pending' 
      });
      const declinedCat = await Guest.countDocuments({ 
        category: category, 
        rsvpStatus: 'declined' 
      });
      
      byCategory[category] = {
        total: total,
        confirmed: confirmedCat,
        pending: pendingCat,
        declined: declinedCat
      };
    }
    
    // 3. Statistiques par type de billet
    const couples = await Guest.countDocuments({ ticketType: 'couple' });
    const simples = await Guest.countDocuments({ ticketType: 'simple' });
    
    // 4. Calculer le nombre de personnes réelles
    const coupleGuests = await Guest.find({ 
      ticketType: 'couple',
      rsvpStatus: 'confirmed'
    });
    const simpleGuests = await Guest.find({ 
      ticketType: 'simple',
      rsvpStatus: 'confirmed'
    });
    
    const confirmedPersons = (coupleGuests.length * 2) + simpleGuests.length;
    
    // 5. Statistiques des tables
    const tables = await Table.find();
    const totalTables = tables.length;
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
    const occupiedSeats = tables.reduce((sum, table) => sum + table.occupiedSeats, 0);
    const availableSeats = totalCapacity - occupiedSeats;
    
    // 6. Tables par statut
    const fullTables = tables.filter(t => t.occupiedSeats >= t.capacity).length;
    const emptyTables = tables.filter(t => t.occupiedSeats === 0).length;
    const partialTables = totalTables - fullTables - emptyTables;
    
    // 7. Pourcentages
    const confirmationRate = totalGuests > 0 
      ? ((confirmed / totalGuests) * 100).toFixed(1) 
      : 0;
    const assignmentRate = confirmed > 0 
      ? ((assigned / confirmed) * 100).toFixed(1) 
      : 0;
    const occupancyRate = totalCapacity > 0 
      ? ((occupiedSeats / totalCapacity) * 100).toFixed(1) 
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        guests: {
          total: totalGuests,
          confirmed: confirmed,
          declined: declined,
          pending: pending,
          assigned: assigned,
          confirmedPersons: confirmedPersons,
          confirmationRate: parseFloat(confirmationRate),
          assignmentRate: parseFloat(assignmentRate)
        },
        byCategory: byCategory,
        byTicketType: {
          couple: couples,
          simple: simples
        },
        tables: {
          total: totalTables,
          full: fullTables,
          partial: partialTables,
          empty: emptyTables,
          totalCapacity: totalCapacity,
          occupiedSeats: occupiedSeats,
          availableSeats: availableSeats,
          occupancyRate: parseFloat(occupancyRate)
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques',
      error: error.message
    });
  }
});

// ========== Plan de salle complet ==========
router.get('/seating-plan', async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    
    const seatingPlan = [];
    
    for (const table of tables) {
      const guests = await Guest.find({ 
        tableNumber: table.number 
      }).sort({ code: 1 });
      
      seatingPlan.push({
        tableNumber: table.number,
        tableName: table.name,
        capacity: table.capacity,
        occupiedSeats: table.occupiedSeats,
        availableSeats: table.capacity - table.occupiedSeats,
        type: table.type,
        guests: guests.map(g => ({
          code: g.code,
          person1Name: g.person1Name,
          person2Name: g.person2Name,
          ticketType: g.ticketType,
          category: g.category,
          dietaryRestrictions: g.dietaryRestrictions
        }))
      });
    }
    
    res.status(200).json({
      success: true,
      data: seatingPlan
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du plan de salle',
      error: error.message
    });
  }
});

// ========== Liste des invités non assignés ==========
router.get('/unassigned', async (req, res) => {
  try {
    const unassigned = await Guest.find({
      rsvpStatus: 'confirmed',
      tableNumber: null
    }).sort({ category: 1, code: 1 });
    
    res.status(200).json({
      success: true,
      count: unassigned.length,
      data: unassigned
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message
    });
  }
});

module.exports = router;
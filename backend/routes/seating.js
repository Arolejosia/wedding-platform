// routes/seating.js
const express = require('express');
const router = express.Router();
const SeatingPlan = require('../models/seatingPlan');
const Guest = require('../models/Guest');

// GET /api/seating - Récupérer le plan actif
router.get('/', async (req, res) => {
  try {
    let plan = await SeatingPlan.findOne({ isActive: true })
      .populate('assignments.guestId', 'code person1Name person2Name ticketType');

    if (!plan) {
      // Créer un plan par défaut
      plan = new SeatingPlan({
        planName: 'Plan principal',
        venue: {
          name: 'Salle de réception',
          dimensions: { width: 1200, height: 800 },
        },
        tables: [],
        assignments: [],
      });
      await plan.save();
    }

    res.json({ success: true, plan });
  } catch (error) {
    console.error('Erreur récupération plan:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/seating/tables - Ajouter/Mettre à jour une table
router.post('/tables', async (req, res) => {
  try {
    const plan = await SeatingPlan.findOne({ isActive: true });
    if (!plan) return res.status(404).json({ error: 'Plan introuvable' });

    const { tableNumber, tableName, shape, capacity, position, rotation, theme } = req.body;

    const existingIndex = plan.tables.findIndex(t => t.tableNumber === tableNumber);

    if (existingIndex >= 0) {
      // Mettre à jour
      plan.tables[existingIndex] = {
        ...plan.tables[existingIndex],
        tableName,
        shape,
        capacity,
        position,
        rotation,
        theme,
      };
    } else {
      // Ajouter
      plan.tables.push({
        tableNumber,
        tableName: tableName || `Table ${tableNumber}`,
        shape,
        capacity,
        position,
        rotation: rotation || 0,
        theme: theme || { color: '#D4AF37', icon: '' },
      });
    }

    await plan.save();
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Erreur ajout table:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/seating/tables/:tableNumber - Supprimer une table
router.delete('/tables/:tableNumber', async (req, res) => {
  try {
    const plan = await SeatingPlan.findOne({ isActive: true });
    if (!plan) return res.status(404).json({ error: 'Plan introuvable' });

    const tableNumber = parseInt(req.params.tableNumber);
    
    // Retirer la table
    plan.tables = plan.tables.filter(t => t.tableNumber !== tableNumber);
    
    // Retirer les assignations
    plan.assignments = plan.assignments.filter(a => a.tableNumber !== tableNumber);

    await plan.save();
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

// POST /api/seating/assign - Assigner un invité à une table
router.post('/assign', async (req, res) => {
  try {
    const { guestId, tableNumber, seatNumber } = req.body;

    const plan = await SeatingPlan.findOne({ isActive: true });
    if (!plan) return res.status(404).json({ error: 'Plan introuvable' });

    // Vérifier que la table existe
    const table = plan.tables.find(t => t.tableNumber === tableNumber);
    if (!table) return res.status(404).json({ error: 'Table introuvable' });

    // Retirer invité de l'ancienne table
    plan.assignments = plan.assignments.filter(a => a.guestId.toString() !== guestId);

    // Ajouter à la nouvelle table
    plan.assignments.push({
      guestId,
      tableNumber,
      seatNumber: seatNumber || null,
    });

    await plan.save();

    // Mettre à jour le guest
    await Guest.findByIdAndUpdate(guestId, {
      tableNumber,
      seatNumber,
      assignedAt: Date.now(),
    });

    const updatedPlan = await SeatingPlan.findOne({ isActive: true })
      .populate('assignments.guestId', 'code person1Name person2Name ticketType');

    res.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error('Erreur assignation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/seating/unassign/:guestId - Retirer un invité
router.delete('/unassign/:guestId', async (req, res) => {
  try {
    const plan = await SeatingPlan.findOne({ isActive: true });
    if (!plan) return res.status(404).json({ error: 'Plan introuvable' });

    plan.assignments = plan.assignments.filter(
      a => a.guestId.toString() !== req.params.guestId
    );

    await plan.save();

    // Mettre à jour le guest
    await Guest.findByIdAndUpdate(req.params.guestId, {
      tableNumber: null,
      seatNumber: null,
      assignedAt: null,
    });

    const updatedPlan = await SeatingPlan.findOne({ isActive: true })
      .populate('assignments.guestId', 'code person1Name person2Name ticketType');

    res.json({ success: true, plan: updatedPlan });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/seating/unassigned - Liste des invités non assignés
router.get('/unassigned', async (req, res) => {
  try {
    const plan = await SeatingPlan.findOne({ isActive: true });
    const assignedGuestIds = plan ? plan.assignments.map(a => a.guestId.toString()) : [];

    const unassignedGuests = await Guest.find({
      _id: { $nin: assignedGuestIds },
      rsvpStatus: 'confirmed',
    }).select('code person1Name person2Name ticketType category');

    res.json({ success: true, guests: unassignedGuests });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
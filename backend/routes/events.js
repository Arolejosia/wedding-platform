const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// CREATE - Créer un événement
router.post('/', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: newEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création',
      error: error.message
    });
  }
});

// READ ALL - Lire tous les événements
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message
    });
  }
});

// READ ONE - Lire un événement par ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message
    });
  }
});

// UPDATE - Modifier un événement
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Événement modifié avec succès',
      data: updatedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la modification',
      error: error.message
    });
  }
});

// DELETE - Supprimer un événement
router.delete('/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Événement supprimé avec succès',
      data: deletedEvent
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
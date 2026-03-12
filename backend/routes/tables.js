const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// CREATE - Créer une table
router.post('/', async (req, res) => {
  try {
    const newTable = new Table(req.body);
    await newTable.save();
    res.status(201).json({
      success: true,
      message: 'Table créée avec succès',
      data: newTable
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création',
      error: error.message
    });
  }
});

// READ ALL - Lire toutes les tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message
    });
  }
});

// READ ONE - Lire une table par numéro
router.get('/:number', async (req, res) => {
  try {
    const table = await Table.findOne({ number: req.params.number });
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table non trouvée'
      });
    }
    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message
    });
  }
});

// UPDATE - Modifier une table
router.put('/:number', async (req, res) => {
  try {
    const updatedTable = await Table.findOneAndUpdate(
      { number: req.params.number },
      req.body,
      { new: true }
    );
    if (!updatedTable) {
      return res.status(404).json({
        success: false,
        message: 'Table non trouvée'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Table modifiée avec succès',
      data: updatedTable
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la modification',
      error: error.message
    });
  }
});

// DELETE - Supprimer une table
router.delete('/:number', async (req, res) => {
  try {
    const deletedTable = await Table.findOneAndDelete({ number: req.params.number });
    if (!deletedTable) {
      return res.status(404).json({
        success: false,
        message: 'Table non trouvée'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Table supprimée avec succès',
      data: deletedTable
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
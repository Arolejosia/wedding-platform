// routes/budget.js
const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// GET /api/budget - Récupérer le budget
router.get('/', async (req, res) => {
  try {
    let budget = await Budget.findOne();
    
    if (!budget) {
      // Créer un budget par défaut
      budget = new Budget({
        totalBudget: 0,
        currency: 'FCFA',
        expenses: [],
      });
      await budget.save();
    }

    // Calculer les stats
    const stats = {
      totalBudget: budget.totalBudget,
      totalEstimated: budget.expenses.reduce((sum, e) => sum + (e.estimatedCost || 0), 0),
      totalActual: budget.expenses.reduce((sum, e) => sum + (e.actualCost || 0), 0),
      totalPaid: budget.expenses.reduce((sum, e) => sum + (e.paid || 0), 0),
      remaining: budget.totalBudget - budget.expenses.reduce((sum, e) => sum + (e.actualCost || e.estimatedCost || 0), 0),
      byCategory: {},
      byStatus: {
        pending: budget.expenses.filter(e => e.status === 'pending').length,
        partial: budget.expenses.filter(e => e.status === 'partial').length,
        paid: budget.expenses.filter(e => e.status === 'paid').length,
      },
    };

    // Stats par catégorie
    const categories = ['venue', 'catering', 'decoration', 'photography', 'music', 
                        'invitations', 'outfits', 'transport', 'flowers', 'cake', 'gifts', 'other'];
    
    categories.forEach(cat => {
      const catExpenses = budget.expenses.filter(e => e.category === cat);
      stats.byCategory[cat] = {
        count: catExpenses.length,
        estimated: catExpenses.reduce((sum, e) => sum + (e.estimatedCost || 0), 0),
        actual: catExpenses.reduce((sum, e) => sum + (e.actualCost || 0), 0),
        paid: catExpenses.reduce((sum, e) => sum + (e.paid || 0), 0),
      };
    });

    res.json({ success: true, budget, stats });
  } catch (error) {
    console.error('Erreur récupération budget:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/budget/total - Mettre à jour le budget total
router.put('/total', async (req, res) => {
  try {
    const { totalBudget } = req.body;
    
    let budget = await Budget.findOne();
    if (!budget) {
      budget = new Budget({ totalBudget });
    } else {
      budget.totalBudget = totalBudget;
    }
    
    await budget.save();
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

// POST /api/budget/expenses - Ajouter une dépense
router.post('/expenses', async (req, res) => {
  try {
    const budget = await Budget.findOne();
    if (!budget) return res.status(404).json({ error: 'Budget introuvable' });

    budget.expenses.push(req.body);
    await budget.save();
    
    res.status(201).json({ success: true, budget });
  } catch (error) {
    console.error('Erreur ajout dépense:', error);
    res.status(500).json({ error: 'Erreur ajout' });
  }
});

// PUT /api/budget/expenses/:id - Mettre à jour une dépense
router.put('/expenses/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne();
    if (!budget) return res.status(404).json({ error: 'Budget introuvable' });

    const expense = budget.expenses.id(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Dépense introuvable' });

    Object.assign(expense, req.body);
    await budget.save();
    
    res.json({ success: true, budget });
  } catch (error) {
    console.error('Erreur mise à jour dépense:', error);
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

// DELETE /api/budget/expenses/:id - Supprimer une dépense
router.delete('/expenses/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne();
    if (!budget) return res.status(404).json({ error: 'Budget introuvable' });

    budget.expenses.pull(req.params.id);
    await budget.save();
    
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

// PATCH /api/budget/expenses/:id/pay - Enregistrer un paiement
router.patch('/expenses/:id/pay', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const budget = await Budget.findOne();
    if (!budget) return res.status(404).json({ error: 'Budget introuvable' });

    const expense = budget.expenses.id(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Dépense introuvable' });

    expense.paid = (expense.paid || 0) + amount;
    await budget.save();
    
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ error: 'Erreur paiement' });
  }
});

module.exports = router;
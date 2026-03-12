// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/tasks - Récupérer toutes les tâches
router.get('/', async (req, res) => {
  try {

    const { category, status, priority, weddingId } = req.query;

    let filter = { weddingId };

    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;

    const tasks = await Task.find(filter).sort({ deadline: 1, priority: -1 });

    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length,
      overdue: tasks.filter(t => {
        if (!t.deadline || t.status === 'done') return false;
        return new Date(t.deadline) < new Date();
      }).length,
      totalCost: tasks.reduce((sum, t) => sum + (t.cost || 0), 0),
      totalPaid: tasks.reduce((sum, t) => sum + (t.paid ? (t.cost || 0) : 0), 0),
    };

    res.json({ success: true, tasks, stats });

  } catch (error) {
    console.error('Erreur récupération tâches:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.post('/generate/:weddingId', async (req, res) => {

  try {

    const weddingId = req.params.weddingId;

    const existing = await Task.find({ weddingId });

    if (existing.length > 0) {
      return res.json({ message: "Checklist déjà générée" });
    }

    const tasks = [
      {
        title: "Choisir la date du mariage",
        category: "paperwork",
        priority: "high",
        description: "Définir la date officielle du mariage",
      },
      {
        title: "Réserver la salle de réception",
        category: "venue",
        priority: "urgent",
        description: "Contacter et réserver la salle",
      },
      {
        title: "Réserver le photographe",
        category: "photography",
        priority: "high",
      },
      {
        title: "Choisir la robe de mariée",
        category: "outfits",
        priority: "medium",
      },
      {
        title: "Envoyer les invitations",
        category: "invitations",
        priority: "high",
      },
      {
        title: "Choisir le DJ",
        category: "music",
      },
      {
        title: "Commander le gâteau",
        category: "cake",
      },
      {
        title: "Plan de table",
        category: "paperwork",
      }
    ];

    const tasksToInsert = tasks.map(task => ({
      ...task,
      weddingId,
      userId: "000000000000000000000001"
    }));

    await Task.insertMany(tasksToInsert);

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur génération tâches" });
  }

});
// POST /api/tasks - Créer une tâche
router.post('/', async (req, res) => {
  try {

    const { weddingId } = req.body;

    const task = new Task({
      ...req.body,
     userId: req.body.userId || "000000000000000000000001",
      weddingId
    });

    await task.save();

    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Erreur création tâche:', error);
    res.status(500).json({ error: 'Erreur création' });
  }
});

// PUT /api/tasks/:id - Mettre à jour une tâche
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('Erreur mise à jour tâche:', error);
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression tâche:', error);
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

// PATCH /api/tasks/:id/toggle-status - Toggle statut rapide
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    // Cycle: todo → in-progress → done → todo
    const statusCycle = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo',
    };

    task.status = statusCycle[task.status];
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: 'Erreur toggle statut' });
  }
});

module.exports = router;
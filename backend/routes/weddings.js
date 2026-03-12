// routes/weddings.js
const express = require('express');
const router  = express.Router();
const Wedding = require('../models/Wedding');
const { authMiddleware } = require('../middleware/auth');

// ── GET /api/weddings/by-slug/:slug — PUBLIQUE (pas d'auth) ─────
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ customSlug: req.params.slug });
    if (!wedding) return res.status(404).json({ success:false, message:'Mariage introuvable' });
    res.json({ success:true, wedding });
  } catch (error) {
    res.status(500).json({ success:false, message:'Erreur serveur' });
  }
});

// ── Toutes les routes suivantes nécessitent auth ─────────────────
router.use(authMiddleware);

// ── GET /api/weddings/my-wedding ─────────────────────────────────
router.get('/my-wedding', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({
      userId: req.userId,
      status: { $ne: 'archived' }
    }).sort({ createdAt: 1 });
    if (!wedding) return res.status(404).json({ success:false, message:'Aucun mariage trouvé' });
    res.json({ success:true, wedding });
  } catch (error) {
    res.status(500).json({ success:false, error:'Erreur serveur' });
  }
});

// ── GET /api/weddings ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const weddings = await Wedding.find({
      userId: req.userId,
      status: { $ne: 'archived' }
    }).sort({ weddingDate: 1 });
    res.json({ success:true, weddings, count:weddings.length });
  } catch (error) {
    res.status(500).json({ error:'Erreur serveur' });
  }
});

// ── GET /api/weddings/:id ────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ _id:req.params.id, userId:req.userId });
    if (!wedding) return res.status(404).json({ error:'Mariage introuvable' });
    res.json({ success:true, wedding });
  } catch (error) {
    res.status(500).json({ error:'Erreur serveur' });
  }
});

// ── POST /api/weddings ───────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      person1FirstName, person1LastName,
      person2FirstName, person2LastName,
      venueName, venueCity,
      couple, plan, theme, settings,
      weddingDate,
    } = req.body;

    const firstName1 = person1FirstName?.trim() || couple?.person1?.firstName?.trim();
    if (!firstName1) return res.status(400).json({ success:false, error:'Prénom marié(e) 1 requis' });
    if (!weddingDate) return res.status(400).json({ success:false, error:'Date requise' });

    const coupleData = couple || {
      person1: { firstName: person1FirstName || '', lastName: person1LastName || '' },
      person2: { firstName: person2FirstName || '', lastName: person2LastName || '' },
    };

    const p1 = coupleData.person1?.firstName || 'Marié(e) 1';
    const p2 = coupleData.person2?.firstName || '';

    const wedding = new Wedding({
      userId:     req.userId,
      couple:     coupleData,
      weddingDate,
      plan:       plan    || 'free',
      theme:      theme   || 'royal',
      settings:   settings || {},
      status:     'active',
      title:      `Mariage de ${p1}${p2 ? ' & ' + p2 : ''}`,
      venue: {
        name: venueName || couple?.venue?.name || '',
        city: venueCity || couple?.venue?.city || '',
      },
    });

    if (!wedding.customSlug) {
      wedding.customSlug = await Wedding.generateSlug(p1, p2 || 'unique');
    }

    await wedding.save();
    res.status(201).json({ success:true, wedding });

  } catch (error) {
    console.error('Erreur création mariage:', error);
    res.status(500).json({ success:false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ _id:req.params.id, userId:req.userId });
    if (!wedding) return res.status(404).json({ error:'Mariage introuvable' });
    const { _id, userId, ...updateData } = req.body;
    Object.keys(updateData).forEach(key => { wedding[key] = updateData[key]; });
    await wedding.save();
    res.json({ success:true, wedding });
  } catch (error) {
    console.error('❌ Erreur PUT wedding:', error.message); // ← ajoute ça
    res.status(500).json({ error:'Erreur lors de la modification' });
  }
});

// ── DELETE /api/weddings/:id ─────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ _id:req.params.id, userId:req.userId });
    if (!wedding) return res.status(404).json({ error:'Mariage introuvable' });
    wedding.status = 'archived';
    await wedding.save();
    res.json({ success:true, message:'Mariage archivé' });
  } catch (error) {
    res.status(500).json({ error:'Erreur suppression' });
  }
});

// ── PATCH /api/weddings/:id/stats ───────────────────────────────
router.patch('/:id/stats', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ _id:req.params.id, userId:req.userId });
    if (!wedding) return res.status(404).json({ error:'Mariage introuvable' });
    if (req.body.stats) {
      wedding.stats = { ...wedding.stats, ...req.body.stats };
      await wedding.save();
    }
    res.json({ success:true, stats:wedding.stats });
  } catch (error) {
    res.status(500).json({ error:'Erreur serveur' });
  }
});

module.exports = router;
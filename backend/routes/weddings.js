// routes/weddings.js
const express = require('express');
const router  = express.Router();
const Wedding = require('../models/Wedding');
const { authMiddleware } = require('../middleware/auth');
const Guest = require('../models/Guest');

// ── GET /api/weddings/by-slug/:slug — PUBLIQUE ──────────────────
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

// ── PUT /api/weddings/:id ────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ _id:req.params.id, userId:req.userId });
    if (!wedding) return res.status(404).json({ error:'Mariage introuvable' });
    const { _id, userId, ...updateData } = req.body;
    Object.keys(updateData).forEach(key => { wedding[key] = updateData[key]; });
    await wedding.save();
    res.json({ success:true, wedding });
  } catch (error) {
    console.error('❌ Erreur PUT wedding:', error.message);
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

// ── PATCH /api/weddings/:id/stats ────────────────────────────────
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

router.post('/:id/guests/bulk', async (req, res) => {
  try {
    const { codes } = req.body;
    console.log('BULK codes reçus:', JSON.stringify(codes));
    
    const guests = codes.map(c => ({
      weddingId:     req.params.id,
      code:          c.code,
      ticketType:    c.ticketType || 'couple',
      category:      c.categoryLabel || 'custom',
      categoryLabel: c.categoryLabel || '',
      rsvpStatus:    'pending',
    }));
    
    console.log('BULK guests à insérer:', JSON.stringify(guests));
    
    const result = await Guest.insertMany(guests, { ordered: false });
    console.log('BULK résultat:', result.length, 'documents insérés');
    
    res.json({ success: true, count: result.length });
  } catch (e) {
    console.error('BULK ERROR:', e.message);
    console.error('BULK ERROR détail:', e);
    res.status(500).json({ error: e.message });
  }
});

// ────────────────────────────────────────────────────────────────
// PLANNER ROUTES
// ────────────────────────────────────────────────────────────────

// ── GET /api/weddings/:id/planner ────────────────────────────────
router.get('/:id/planner', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ _id: req.params.id, userId: req.userId });
    if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });

    // Initialiser le planner si vide
    if (!wedding.planner) {
      wedding.planner = {};
      await wedding.save();
    }

    res.json({ planner: wedding.planner });
  } catch (error) {
    console.error('Erreur GET planner:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── PUT /api/weddings/:id/planner ────────────────────────────────
router.put('/:id/planner', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ _id: req.params.id, userId: req.userId });
    if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });

    if (!wedding.planner) wedding.planner = {};

    if (req.body.sideA !== undefined) wedding.planner.sideA = req.body.sideA;
    if (req.body.sideB !== undefined) wedding.planner.sideB = req.body.sideB;

    wedding.markModified('planner');
    await wedding.save();

    res.json({ planner: wedding.planner });
  } catch (error) {
    console.error('Erreur PUT planner:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── POST /api/weddings/:id/planner/generate-codes ────────────────
router.post('/:id/planner/generate-codes', async (req, res) => {
  try {
    const { sideKey, categoryId, count } = req.body;

    if (!['sideA', 'sideB'].includes(sideKey)) {
      return res.status(400).json({ error: 'Côté invalide — utilise sideA ou sideB' });
    }

    const qty = Number(count);
    if (!qty || qty < 1) {
      return res.status(400).json({ error: 'Nombre invalide' });
    }

    const wedding = await Wedding.findOne({ _id: req.params.id, userId: req.userId });
    if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });

    const side = wedding.planner?.[sideKey];
    if (!side) return res.status(400).json({ error: `Côté "${sideKey}" introuvable dans le planner` });

    const category = side.categories.find(c => c.id === categoryId);
    if (!category) return res.status(404).json({ error: 'Catégorie introuvable' });

    const placesParCode     = category.ticketType === 'couple' ? 2 : 1;
    const placesNecessaires = qty * placesParCode;
    const remaining         = (side.totalPlaces || 0) - (side.usedPlaces || 0);

    if (placesNecessaires > remaining) {
      return res.status(400).json({
        error: `Places insuffisantes. Il reste ${remaining} place(s), besoin de ${placesNecessaires}.`
      });
    }

    const startIndex = (category.codes || []).length + 1;

    const newCodes = Array.from({ length: qty }, (_, i) => ({
      code:       `${category.prefix}${String(startIndex + i).padStart(2, '0')}`,
      used:       false,
      guestNames: [],
      createdAt:  new Date(),
    }));

    category.codes.push(...newCodes);
    side.usedPlaces = (side.usedPlaces || 0) + placesNecessaires;

    wedding.markModified('planner');
    await wedding.save();

    res.json({
      success:   true,
      generated: newCodes,
      planner:   wedding.planner,
    });
  } catch (error) {
    console.error('Erreur generate-codes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── GET /api/weddings/:id ────────────────────────────────────────
// ⚠️ Cette route doit rester EN DERNIER pour ne pas capturer /planner etc.
router.get('/:id', async (req, res) => {
  try {
    const wedding = await Wedding.findOne({ _id:req.params.id, userId:req.userId });
    if (!wedding) return res.status(404).json({ error:'Mariage introuvable' });
    res.json({ success:true, wedding });
  } catch (error) {
    res.status(500).json({ error:'Erreur serveur' });
  }
});

module.exports = router;
// backend/routes/vendors.js
const express = require('express');
const router  = express.Router();
const Vendor  = require('../models/Vendor');
const { authMiddleware } = require('../middleware/auth');

// ── GET /api/vendors — Liste publique (approuvés uniquement) ─────
router.get('/', async (req, res) => {
  try {
    const { category, country, city, featured, search, page = 1, limit = 12 } = req.query;

    const filter = { status: 'approved' };
    if (category) filter.category = category;
    if (country)  filter.country  = new RegExp(country, 'i');
    if (city)     filter.city     = new RegExp(city, 'i');
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { businessName: new RegExp(search, 'i') },
        { description:  new RegExp(search, 'i') },
        { tagline:      new RegExp(search, 'i') },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Vendor.countDocuments(filter);
    const vendors = await Vendor.find(filter)
      .sort({ featured: -1, approvedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-email -phone -rejectionReason -approvedBy');

    res.json({
      success: true,
      vendors,
      total,
      pages: Math.ceil(total / Number(limit)),
      page:  Number(page),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/vendors/register — Inscription prestataire ─────────
router.post('/register', async (req, res) => {
  try {
    const {
      businessName, ownerName, email, phone, website, instagram,
      category, country, city, region,
      description, tagline,
      priceRange, startingPrice, currency,
    } = req.body;

    if (!businessName || !ownerName || !email || !category || !country || !city) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const existing = await Vendor.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Un prestataire avec cet email existe déjà' });
    }

    const vendor = new Vendor({
      businessName, ownerName, email, phone, website, instagram,
      category, country, city, region,
      description, tagline,
      priceRange, startingPrice, currency,
      status: 'pending',
    });

    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Inscription envoyée ! Votre profil sera visible après approbation.',
      vendorId: vendor._id,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/vendors/:id — Détail prestataire ────────────────────
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id, status: 'approved' });
    if (!vendor) return res.status(404).json({ error: 'Prestataire introuvable' });

    // Incrémenter les vues
    await Vendor.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ────────────────────────────────────────────────────────────────
// ROUTES ADMIN (authentifiées)
// ────────────────────────────────────────────────────────────────

// ── GET /api/vendors/admin/all — Tous les prestataires (admin) ───
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;

    const skip    = (Number(page) - 1) * Number(limit);
    const total   = await Vendor.countDocuments(filter);
    const vendors = await Vendor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, vendors, total, pages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PUT /api/vendors/admin/:id/approve — Approuver ───────────────
router.put('/admin/:id/approve', authMiddleware, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedAt: new Date(), approvedBy: req.userId, rejectionReason: '' },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ error: 'Prestataire introuvable' });
    res.json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PUT /api/vendors/admin/:id/reject — Rejeter ──────────────────
router.put('/admin/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason || '' },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ error: 'Prestataire introuvable' });
    res.json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── DELETE /api/vendors/admin/:id — Supprimer ────────────────────
router.delete('/admin/:id', authMiddleware, async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PUT /api/vendors/admin/:id/featured — Mettre en avant ────────
router.put('/admin/:id/featured', authMiddleware, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Introuvable' });
    vendor.featured = !vendor.featured;
    await vendor.save();
    res.json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
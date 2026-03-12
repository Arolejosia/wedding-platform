// routes/gifts.js
const express      = require('express');
const router       = express.Router();
const Stripe       = require('stripe');
const Flutterwave  = require('flutterwave-node-v3');
const Gift         = require('../models/Gift');
// ✅ APRÈS
const { authMiddleware: protect } = require('../middleware/auth');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const flw    = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// ── COMMISSION PLATEFORME ────────────────────────────────────────
const PLATFORM_FEE_PCT = 0.03; // 3%

// ════════════════════════════════════════════════════════════════
// GET /api/gifts/:weddingId
// Public — invités récupèrent la config + progression
// ════════════════════════════════════════════════════════════════
router.get('/:weddingId', async (req, res) => {
  try {
    const gift = await Gift.findOne({ weddingId: req.params.weddingId })
      .select('-transactions'); // ne pas exposer les transactions aux invités

    if (!gift) return res.status(404).json({ error: 'Liste introuvable' });

    res.json({ gift });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// GET /api/gifts/:weddingId/dashboard
// Privé — couple voit tout (transactions incluses)
// ════════════════════════════════════════════════════════════════
router.get('/:weddingId/dashboard', protect, async (req, res) => {
  try {
    const gift = await Gift.findOne({ weddingId: req.params.weddingId });
    if (!gift) return res.status(404).json({ error: 'Liste introuvable' });
    res.json({ gift });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/gifts/:weddingId/config
// Privé — couple configure sa liste
// ════════════════════════════════════════════════════════════════
router.post('/:weddingId/config', protect, async (req, res) => {
  try {
    const { externalLinks, cagnotte, items, freeContribution } = req.body;

    const gift = await Gift.findOneAndUpdate(
      { weddingId: req.params.weddingId },
      { $set: { externalLinks, cagnotte, items, freeContribution, updatedAt: new Date() } },
      { new: true, upsert: true }
    );

    res.json({ success: true, gift });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/gifts/:weddingId/pay/stripe
// Public — invité initie paiement Stripe
// ════════════════════════════════════════════════════════════════
router.post('/:weddingId/pay/stripe', async (req, res) => {
  try {
    const { amount, currency, guestName, guestEmail, itemId, type } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: 'Montant invalide' });

    const fee          = Math.round(amount * PLATFORM_FEE_PCT * 100); // en centimes
    const amountCents  = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountCents,
      currency: (currency || 'cad').toLowerCase(),
      metadata: {
        weddingId: req.params.weddingId,
        guestName:  guestName || 'Anonyme',
        guestEmail: guestEmail || '',
        itemId:     itemId || '',
        type:       type || 'free',
        fee,
      },
    });

    // Créer transaction pending en DB
    await Gift.findOneAndUpdate(
      { weddingId: req.params.weddingId },
      {
        $push: {
          transactions: {
            amount,
            currency: currency || 'CAD',
            method:      'stripe',
            status:      'pending',
            guestName:   guestName || 'Anonyme',
            guestEmail:  guestEmail || '',
            providerRef: paymentIntent.id,
            itemId:      itemId || null,
            type:        type || 'free',
          },
        },
      },
      { upsert: true }
    );

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/gifts/:weddingId/pay/flutterwave
// Public — invité initie paiement Flutterwave (Mobile Money)
// ════════════════════════════════════════════════════════════════
router.post('/:weddingId/pay/flutterwave', async (req, res) => {
  try {
    const { amount, currency, guestName, guestEmail, phone, itemId, type } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: 'Montant invalide' });
    if (!phone)                  return res.status(400).json({ error: 'Numéro requis pour Mobile Money' });

    const tx_ref = `WEDDING_${req.params.weddingId}_${Date.now()}`;

    const payload = {
      tx_ref,
      amount,
      currency:     currency || 'XAF', // FCFA Cameroun
      payment_type: 'mobilemoney_franco', // MTN / Orange
      phone_number: phone,
      email:        guestEmail || 'guest@wedding.com',
      fullname:     guestName  || 'Invité',
      meta: {
        weddingId: req.params.weddingId,
        itemId:    itemId || '',
        type:      type   || 'free',
      },
      redirect_url: `${process.env.CLIENT_URL}/payment-callback`,
    };

    const response = await flw.MobileMoney.franco_phone(payload);

    if (response.status !== 'success') {
      return res.status(400).json({ error: response.message });
    }

    // Transaction pending
    await Gift.findOneAndUpdate(
      { weddingId: req.params.weddingId },
      {
        $push: {
          transactions: {
            amount,
            currency:    currency || 'XAF',
            method:      'flutterwave',
            status:      'pending',
            guestName:   guestName  || 'Anonyme',
            guestEmail:  guestEmail || '',
            providerRef: tx_ref,
            itemId:      itemId || null,
            type:        type   || 'free',
          },
        },
      },
      { upsert: true }
    );

    res.json({
      status:      'pending',
      tx_ref,
      redirect_url: response.data?.link || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
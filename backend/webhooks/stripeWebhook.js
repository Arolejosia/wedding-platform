// webhooks/stripeWebhook.js
const express = require('express');
const router  = express.Router();
const Stripe  = require('stripe');
const Gift    = require('../models/Gift');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ⚠️ Stripe exige le body RAW (pas parsé en JSON)
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi       = event.data.object;
    const { weddingId, guestName, itemId, type, fee } = pi.metadata;
    const amount   = pi.amount / 100; // centimes → unité
    const currency = pi.currency.toUpperCase();

    try {
      const gift = await Gift.findOne({ weddingId });
      if (!gift) return res.json({ received: true });

      // 1. Mettre à jour le statut de la transaction
      await Gift.updateOne(
        { weddingId, 'transactions.providerRef': pi.id },
        { $set: { 'transactions.$.status': 'completed' } }
      );

      // 2. Mettre à jour la progression selon le type
      if (type === 'cagnotte') {
        await Gift.updateOne(
          { weddingId },
          { $inc: { 'cagnotte.collected': amount, totalCollected: amount } }
        );
      } else if (type === 'item' && itemId) {
        await Gift.updateOne(
          { weddingId, 'items.id': itemId },
          {
            $inc: {
              'items.$.collected': amount,
              totalCollected:      amount,
            },
          }
        );
        // Marquer comme réservé si 100% atteint
        const updated = await Gift.findOne({ weddingId });
        const item    = updated?.items?.find(i => i.id === itemId);
        if (item && item.collected >= item.price) {
          await Gift.updateOne(
            { weddingId, 'items.id': itemId },
            { $set: { 'items.$.reserved': true } }
          );
        }
      } else if (type === 'free') {
        await Gift.updateOne(
          { weddingId },
          { $inc: { totalCollected: amount } }
        );
      }

      console.log(`✅ Stripe payment completed: ${amount} ${currency} — ${guestName}`);
    } catch (err) {
      console.error('Erreur mise à jour DB après Stripe:', err);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    await Gift.updateOne(
      { 'transactions.providerRef': pi.id },
      { $set: { 'transactions.$.status': 'failed' } }
    ).catch(console.error);
  }

  res.json({ received: true });
});

module.exports = router;
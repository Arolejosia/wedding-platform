// webhooks/flutterwaveWebhook.js
const express    = require('express');
const router     = express.Router();
const crypto     = require('crypto');
const Flutterwave = require('flutterwave-node-v3');
const Gift       = require('../models/Gift');

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

router.post('/', express.json(), async (req, res) => {
  // 1. Vérifier la signature Flutterwave
  const hash = req.headers['verif-hash'];
  if (!hash || hash !== process.env.FLW_WEBHOOK_HASH) {
    return res.status(401).json({ error: 'Signature invalide' });
  }

  const { event, data } = req.body;

  if (event === 'charge.completed' && data?.status === 'successful') {
    const { tx_ref, amount, currency, id: flwTxId } = data;

    try {
      // 2. Vérifier le paiement côté Flutterwave (sécurité)
      const verification = await flw.Transaction.verify({ id: flwTxId });
      if (
        verification.data?.status !== 'successful' ||
        verification.data?.amount < amount
      ) {
        return res.status(400).json({ error: 'Paiement non vérifié' });
      }

      // 3. Extraire les métadonnées
      const meta      = data.meta || {};
      const weddingId = meta.weddingId;
      const itemId    = meta.itemId;
      const type      = meta.type || 'free';

      if (!weddingId) return res.json({ received: true });

      // 4. Mettre à jour statut transaction
      await Gift.updateOne(
        { weddingId, 'transactions.providerRef': tx_ref },
        { $set: { 'transactions.$.status': 'completed' } }
      );

      // 5. Mettre à jour progression
      if (type === 'cagnotte') {
        await Gift.updateOne(
          { weddingId },
          { $inc: { 'cagnotte.collected': amount, totalCollected: amount } }
        );
      } else if (type === 'item' && itemId) {
        await Gift.updateOne(
          { weddingId, 'items.id': itemId },
          { $inc: { 'items.$.collected': amount, totalCollected: amount } }
        );
        // Vérifier si item complètement financé
        const gift = await Gift.findOne({ weddingId });
        const item = gift?.items?.find(i => i.id === itemId);
        if (item && item.collected >= item.price) {
          await Gift.updateOne(
            { weddingId, 'items.id': itemId },
            { $set: { 'items.$.reserved': true } }
          );
        }
      } else {
        await Gift.updateOne(
          { weddingId },
          { $inc: { totalCollected: amount } }
        );
      }

      console.log(`✅ Flutterwave payment: ${amount} ${currency} — ${tx_ref}`);
    } catch (err) {
      console.error('Erreur webhook Flutterwave:', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;
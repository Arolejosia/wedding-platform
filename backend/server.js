const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
require('dotenv').config();

// ── Routes ───────────────────────────────────────────────────────
const guestsRoutes       = require('./routes/guests');
const tablesRoutes       = require('./routes/tables');
const eventsRoutes       = require('./routes/events');
const rsvpRoutes         = require('./routes/rsvp');
const generateRoutes     = require('./routes/generate');
const assignRoutes       = require('./routes/assign');
const statsRoutes        = require('./routes/stats');
const photosRouter       = require('./routes/photos');
const guestbookRouter    = require('./routes/guestbook').router; // ✅ .router
const tasksRouter        = require('./routes/tasks');
const seatingRouter      = require('./routes/seating');
const budgetRouter       = require('./routes/budget');
const authRouter         = require('./routes/auth');
const weddingsRouter     = require('./routes/weddings');
const publicRoutes       = require('./routes/public');
const giftsRoutes        = require('./routes/gifts');
const stripeWebhook      = require('./webhooks/stripeWebhook');
const flutterwaveWebhook = require('./webhooks/flutterwaveWebhook');
const uploadRoutes = require('./routes/upload');
const app  = express();
const PORT = process.env.PORT || 5002;

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://wedding-platform-1.onrender.com'],
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ⚠️ Webhooks AVANT express.json() — Stripe exige le body RAW
app.use('/webhook/stripe',      stripeWebhook);
app.use('/webhook/flutterwave', flutterwaveWebhook);

// ── Body parser (après webhooks) ─────────────────────────────────
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: '🎉 Serveur mariage actif' }));
app.use('/api/upload', uploadRoutes);
app.use('/api/guests',    guestsRoutes);
app.use('/api/tables',    tablesRoutes);
app.use('/api/events',    eventsRoutes);
app.use('/api/rsvp',      rsvpRoutes);
app.use('/api/generate',  generateRoutes);
app.use('/api/assign',    assignRoutes);
app.use('/api/stats',     statsRoutes);
app.use('/api/photos',    photosRouter);
app.use('/api/guestbook', guestbookRouter);
app.use('/api/tasks',     tasksRouter);
app.use('/api/seating',   seatingRouter);
app.use('/api/public',    publicRoutes);
app.use('/api/budget',    budgetRouter);
app.use('/api/auth',      authRouter);
app.use('/api/weddings',  weddingsRouter);
//app.use('/api/gifts',     giftsRoutes);
app.use('/uploads', express.static('uploads'));

// ── MongoDB ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wedding-db')
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ MongoDB erreur:', err.message));

// ── Démarrage ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Serveur sur http://localhost:${PORT}`);
});
// backend/routes/guestbook.js — VERSION UNIFIÉE
const express     = require('express');
const router      = express.Router();
const multer      = require('multer');
const cloudinary  = require('cloudinary').v2;
const streamifier = require('streamifier');

// ── UN SEUL MODÈLE pour tout ──────────────────────────────────────
const GuestbookMessage = require('../models/GuestbookMessage');

const POST_IT_COLORS = ['#FFF8DC','#FFF0C4','#F4E5C2','#EEF4FF','#F0F8F0','#FFF0F5'];
const EMOJIS         = ['💛','💍','🌸','✨','💫','🎉','💝','🥂','🌹','💒'];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'weddapp/guestbook-audio', resource_type: 'video', format: 'mp3' },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ── GET /api/guestbook ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { weddingId, limit = 15, page = 1, priority } = req.query;
    if (!weddingId) return res.status(400).json({ error: 'weddingId requis' });

    const skip   = (Number(page) - 1) * Number(limit);
    const filter = { weddingId, approved: true };
    const sort   = priority === 'true'
      ? { isFromCouple: -1, createdAt: -1 }
      : { createdAt: -1 };

    const [messages, total] = await Promise.all([
      GuestbookMessage.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      GuestbookMessage.countDocuments(filter),
    ]);

    res.json({
      success: true, messages, total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      hasMore: skip + messages.length < total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/guestbook (texte) ──────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { weddingId, name, message } = req.body;
    if (!weddingId || !name || !message)
      return res.status(400).json({ error: 'weddingId, nom et message requis' });

    const newMessage = new GuestbookMessage({
      weddingId,
      name:    name.trim(),
      type:    'text',
      message: message.trim(),
      color:   POST_IT_COLORS[Math.floor(Math.random() * POST_IT_COLORS.length)],
      emoji:   EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    });
    await newMessage.save();
    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/guestbook/audio ────────────────────────────────────
router.post('/audio', upload.single('audio'), async (req, res) => {
  try {
    const { weddingId, name, message, duration } = req.body;
    if (!weddingId || !name)
      return res.status(400).json({ error: 'weddingId et name requis' });
    if (!req.file)
      return res.status(400).json({ error: 'Fichier audio manquant' });

    const result = await uploadToCloudinary(req.file.buffer);

    const newMessage = new GuestbookMessage({
      weddingId,
      name:          name.trim(),
      type:          message?.trim() ? 'both' : 'audio',
      message:       message?.trim() || '',
      audioUrl:      result.secure_url,
      audioDuration: duration ? Number(duration) : null,
      color:         POST_IT_COLORS[Math.floor(Math.random() * POST_IT_COLORS.length)],
      emoji:         EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    });
    await newMessage.save();
    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error('Erreur audio:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/guestbook/:id ────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await GuestbookMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// ── backend/routes/upload.js ─────────────────────────────────────
// npm install cloudinary multer multer-storage-cloudinary

const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { authMiddleware } = require('../middleware/auth');

// Config Cloudinary — ajoute dans .env :
// CLOUDINARY_CLOUD_NAME=xxx
// CLOUDINARY_API_KEY=xxx
// CLOUDINARY_API_SECRET=xxx
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'weddingapp/dresscode',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 1000, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Fichier non supporté'), false);
  },
});

// ── POST /api/upload/dresscode/:weddingId ────────────────────────
router.post('/dresscode/:weddingId', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const Wedding = require('../models/Wedding');
    const wedding = await Wedding.findOne({ _id: req.params.weddingId, userId: req.userId });
    if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });

    const images = wedding.dressCode?.images || [];

    // Max 3 photos
    if (images.length >= 3) {
      // Supprimer l'ancienne image Cloudinary si on dépasse
      await cloudinary.uploader.destroy(images[0].publicId);
      images.shift();
    }

    images.push({
      url:      req.file.path,
      publicId: req.file.filename,
      alt:      req.body.alt   || 'Inspiration',
      label:    req.body.label || 'Inspiration',
    });

    wedding.dressCode = { ...(wedding.dressCode || {}), images };
    await wedding.save();

    res.json({ success: true, images });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Erreur upload' });
  }
});

// ── DELETE /api/upload/dresscode/:weddingId/:publicId ────────────
router.delete('/dresscode/:weddingId/:publicId', authMiddleware, async (req, res) => {
  try {
    const Wedding = require('../models/Wedding');
    const wedding = await Wedding.findOne({ _id: req.params.weddingId, userId: req.userId });
    if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });

    const publicId = decodeURIComponent(req.params.publicId);

    // Supprimer de Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Supprimer du tableau
    wedding.dressCode.images = (wedding.dressCode.images || []).filter(
      img => img.publicId !== publicId
    );
    await wedding.save();

    res.json({ success: true, images: wedding.dressCode.images });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

router.post('/hero/:weddingId', authMiddleware, upload.single('image'), async (req, res) => {
  try {

    const Wedding = require('../models/Wedding');

    const wedding = await Wedding.findOne({
      _id: req.params.weddingId,
      userId: req.userId
    });

    if (!wedding) {
      return res.status(404).json({ error: 'Mariage introuvable' });
    }

    // URL Cloudinary
    const imageUrl = req.file.path;

    // sauvegarde dans settings.theme
   await Wedding.findByIdAndUpdate(
  req.params.weddingId,
  { $set: { 'settings.theme.heroImage': imageUrl } },
  { new: true }
);

    res.json({
      success: true,
      heroImage: imageUrl
    });

  } catch (err) {
    console.error('Hero upload error:', err);
    res.status(500).json({ error: 'Erreur upload hero' });
  }
});

module.exports = router;
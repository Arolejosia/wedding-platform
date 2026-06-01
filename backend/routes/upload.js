// backend/routes/upload.js — compatible Cloudinary v2 (sans multer-storage-cloudinary)
const express      = require('express');
const router       = express.Router();
const multer       = require('multer');
const cloudinary   = require('cloudinary').v2;
const streamifier  = require('streamifier');
const { authMiddleware } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Fichier non supporté'), false);
  },
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new Error('Audio non supporté'), false);
  },
});

// Helper upload buffer → Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ── POST /api/upload/guestbook-audio/:weddingId ─────────────────
router.post('/guestbook-audio/:weddingId', audioUpload.single('audio'), async (req, res) => {
  try {
    const Wedding = require('../models/Wedding');

    const wedding = await Wedding.findById(req.params.weddingId);
    if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun audio reçu' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'weddingapp/guestbook-audio',
      resource_type: 'video',
      format: 'webm',
    });

    res.json({
      success: true,
      audioUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error('Audio upload error:', err);
    res.status(500).json({ error: 'Erreur upload audio' });
  }
});

// ── POST /api/upload/dresscode/:weddingId ────────────────────────
router.post('/dresscode/:weddingId', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const Wedding = require('../models/Wedding');
    const wedding = await Wedding.findOne({ _id: req.params.weddingId, userId: req.userId });
    if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });

    const result = await uploadToCloudinary(req.file.buffer, {
      folder:         'weddingapp/dresscode',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 1000, crop: 'limit', quality: 'auto' }],
    });

    const images = wedding.dressCode?.images || [];

    if (images.length >= 3) {
      await cloudinary.uploader.destroy(images[0].publicId);
      images.shift();
    }

    images.push({
      url:      result.secure_url,
      publicId: result.public_id,
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
    await cloudinary.uploader.destroy(publicId);

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

// ── POST /api/upload/hero/:weddingId ─────────────────────────────
router.post('/hero/:weddingId', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const Wedding = require('../models/Wedding');
    const wedding = await Wedding.findOne({ _id: req.params.weddingId, userId: req.userId });
    if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });

    const result = await uploadToCloudinary(req.file.buffer, {
      folder:         'weddingapp/hero',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto' }],
    });

    await Wedding.findByIdAndUpdate(
      req.params.weddingId,
      { $set: { 'settings.theme.heroImage': result.secure_url } },
      { new: true }
    );

    res.json({ success: true, heroImage: result.secure_url });
  } catch (err) {
    console.error('Hero upload error:', err);
    res.status(500).json({ error: 'Erreur upload hero' });
  }
});

module.exports = router;
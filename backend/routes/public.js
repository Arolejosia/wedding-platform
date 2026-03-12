// backend/routes/public.js - ROUTES PUBLIQUES POUR SYSTÈME MULTI-MARIAGE
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Wedding = require('../models/Wedding');
const GuestbookMessage = require('../models/GuestbookMessage');
const Photo = require('../models/Photo');
const Guest = require('../models/Guest');

// ========================================
// CONFIG CLOUDINARY
// ========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ========================================
// CONFIG MULTER
// ========================================
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'));
    }
  }
});

// ========================================
// CONSTANTES
// ========================================
const POST_IT_COLORS = [
  '#FFF8DC', '#FFF0C4', '#F4E5C2', 
  '#EEF4FF', '#F0F8F0', '#FFF0F5'
];

const EMOJIS = ['💛', '💍', '🌸', '✨', '💫', '🎉', '💝', '🥂', '🌹', '💒'];

// ========================================
// 1. GET WEDDING BY SLUG (Public)
// ========================================
router.get('/wedding/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const wedding = await Wedding.findOne({ customSlug: slug })
      .select('-userId'); // Ne pas exposer l'userId
    
    if (!wedding) {
      return res.status(404).json({ 
        success: false,
        error: 'Mariage introuvable' 
      });
    }
    
    res.json({ 
      success: true,
      wedding 
    });
    
  } catch (error) {
    console.error('Erreur chargement wedding:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
});

// ========================================
// 2. GUESTBOOK - AJOUTER MESSAGE
// ========================================
router.post('/guestbook', async (req, res) => {
  try {
    const { weddingId, name, message, guestCode } = req.body;
    
    // Validation
    if (!weddingId || !name || !message) {
      return res.status(400).json({ 
        error: 'weddingId, nom et message requis' 
      });
    }
    
    if (name.length > 100) {
      return res.status(400).json({ 
        error: 'Nom trop long (max 100 caractères)' 
      });
    }
    
    if (message.length > 500) {
      return res.status(400).json({ 
        error: 'Message trop long (max 500 caractères)' 
      });
    }
    
    // Vérifier que le wedding existe
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) {
      return res.status(404).json({ error: 'Mariage introuvable' });
    }
    
    // Couleur et emoji aléatoires
    const color = POST_IT_COLORS[Math.floor(Math.random() * POST_IT_COLORS.length)];
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    
    // Créer le message
    const newMessage = new GuestbookMessage({
      weddingId,
      name,
      message,
      color,
      emoji,
      guestCode,
      approved: !wedding.guestbook?.requireApproval // Auto-approve si pas requis
    });
    
    await newMessage.save();
    
    // Incrémenter stats
    await Wedding.findByIdAndUpdate(weddingId, {
      $inc: { 'stats.guestbookMessages': 1 }
    });
    
    res.status(201).json({
      success: true,
      message: newMessage
    });
    
  } catch (error) {
    console.error('Erreur ajout message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du message' });
  }
});

// ========================================
// 3. GUESTBOOK - LISTER MESSAGES
// ========================================
router.get('/guestbook', async (req, res) => {
  try {
    const { weddingId } = req.query;
    
    if (!weddingId) {
      return res.status(400).json({ error: 'weddingId requis' });
    }
    
    // Résoudre le weddingId (slug ou ObjectId)
    let resolvedId = weddingId;
    if (!weddingId.match(/^[a-f\d]{24}$/i)) {
      const wedding = await Wedding.findOne({ customSlug: weddingId });
      if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });
      resolvedId = wedding._id;
    }
    
    const messages = await GuestbookMessage.find({ 
      weddingId: resolvedId,
      approved: true 
    })
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ success: true, messages, total: messages.length });
    
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: 'Erreur récupération messages' });
  }
});

// ========================================
// 4. PHOTOS - UPLOAD
// ========================================
router.post('/photos/upload', upload.array('photos', 10), async (req, res) => {
  try {
    const { weddingId, category, guestCode, guestName } = req.body;
    
    if (!weddingId) {
      return res.status(400).json({ error: 'weddingId requis' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucune photo reçue' });
    }
    
    // Vérifier que le wedding existe
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) {
      return res.status(404).json({ error: 'Mariage introuvable' });
    }
    
    // Upload vers Cloudinary
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `weddings/${weddingId}/${category || 'other'}`,
            tags: [weddingId, category || 'other', guestCode || 'anonymous'],
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                thumbnailUrl: result.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill/'),
                publicId: result.public_id
              });
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    });
    
    const uploadedFiles = await Promise.all(uploadPromises);
    
    // Sauvegarder dans MongoDB
    const photos = await Promise.all(
      uploadedFiles.map(file => {
        const photo = new Photo({
          weddingId,
          category: category || 'other',
          url: file.url,
          thumbnailUrl: file.thumbnailUrl,
          guestCode,
          guestName
        });
        return photo.save();
      })
    );
    
    // Incrémenter stats
    await Wedding.findByIdAndUpdate(weddingId, {
      $inc: { 'stats.photosUploaded': photos.length }
    });
    
    res.json({
      success: true,
      photos,
      count: photos.length
    });
    
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// ========================================
// 5. PHOTOS - LISTER
// ========================================
router.get('/photos', async (req, res) => {
  try {
    const { weddingId, category } = req.query;
    
    if (!weddingId) {
      return res.status(400).json({ error: 'weddingId requis' });
    }
    
    // Résoudre le weddingId (slug ou ObjectId)
    let resolvedId = weddingId;
    if (!weddingId.match(/^[a-f\d]{24}$/i)) {
      const wedding = await Wedding.findOne({ customSlug: weddingId });
      if (!wedding) return res.status(404).json({ error: 'Mariage introuvable' });
      resolvedId = wedding._id;
    }
    
    const query = { weddingId: resolvedId, approved: true };
    if (category) query.category = category;
    
    const photos = await Photo.find(query)
      .sort({ createdAt: -1 })
      .limit(500);
    
    res.json({ success: true, photos, total: photos.length });
    
  } catch (error) {
    console.error('Erreur récupération photos:', error);
    res.status(500).json({ error: 'Erreur récupération photos' });
  }
});
// ========================================
// 6. RSVP - VÉRIFIER CODE
// ========================================
router.post('/rsvp/verify', async (req, res) => {
  try {
    const { code, weddingId } = req.body;
    
    if (!code || !weddingId) {
      return res.status(400).json({ 
        error: 'Code et weddingId requis' 
      });
    }
    
    const guest = await Guest.findOne({ 
      code: code.toUpperCase(),
      weddingId
    });
    
    if (!guest) {
      return res.status(404).json({ 
        error: 'Code invalide' 
      });
    }
    
    res.json({
      success: true,
      guest: {
        code: guest.code,
        person1Name: guest.person1Name,
        person2Name: guest.person2Name,
        ticketType: guest.ticketType,
        rsvpStatus: guest.rsvpStatus,
        hasRsvp: guest.rsvpStatus !== 'pending',
        email: guest.email,
        phone: guest.phone,
        attendanceType: guest.attendanceType,
        dietaryRestrictions: guest.dietaryRestrictions
      }
    });
    
  } catch (error) {
    console.error('Erreur vérification code:', error);
    res.status(500).json({ error: 'Erreur vérification' });
  }
});

// ========================================
// 7. RSVP - CONFIRMER PRÉSENCE
// ========================================
router.post('/rsvp', async (req, res) => {
  try {
    const {
      weddingId,
      code,
      person1Name,
      person2Name,
      email,
      phone,
      rsvpStatus,
      attendanceType,
      dietaryRestrictions
    } = req.body;
    
    // Validation
    if (!weddingId || !code) {
      return res.status(400).json({ 
        error: 'weddingId et code requis' 
      });
    }
    
    // Trouver l'invité
    const guest = await Guest.findOne({ 
      code: code.toUpperCase(),
      weddingId
    });
    
    if (!guest) {
      return res.status(404).json({ 
        error: 'Code invalide' 
      });
    }
    
    // Mettre à jour
    guest.person1Name = person1Name;
    guest.person2Name = person2Name || null;
    guest.email = email;
    guest.phone = phone || null;
    guest.rsvpStatus = rsvpStatus;
    guest.attendanceType = attendanceType || null;
    guest.dietaryRestrictions = dietaryRestrictions || null;
    guest.rsvpDate = new Date();
    
    await guest.save();
    
    // Mettre à jour les stats du wedding
    if (rsvpStatus === 'confirmed') {
      await Wedding.findByIdAndUpdate(weddingId, {
        $inc: { 'stats.confirmedGuests': guest.ticketType === 'couple' ? 2 : 1 }
      });
    } else if (rsvpStatus === 'declined') {
      await Wedding.findByIdAndUpdate(weddingId, {
        $inc: { 'stats.declinedGuests': guest.ticketType === 'couple' ? 2 : 1 }
      });
    }
    
    res.json({
      success: true,
      message: rsvpStatus === 'confirmed' 
        ? 'Merci ! Votre présence est confirmée 🎉' 
        : 'Nous avons bien reçu votre réponse',
      guest: {
        code: guest.code,
        person1Name: guest.person1Name,
        person2Name: guest.person2Name,
        rsvpStatus: guest.rsvpStatus
      }
    });
    
  } catch (error) {
    console.error('Erreur RSVP:', error);
    res.status(500).json({ error: 'Erreur lors de la confirmation' });
  }
});
// À ajouter dans backend/routes/public.js
// DELETE /api/public/photos/:id
// Accessible par l'invité (guestCode) OU les mariés (weddingId owner)

router.delete('/photos/:id', async (req, res) => {
  try {
    const { guestCode, weddingId } = req.query;
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo introuvable' });

    // Vérification : invité (même guestCode) OU marié (possède le weddingId)
    const isGuest  = guestCode && photo.guestCode === guestCode;
    const isOwner  = weddingId && photo.weddingId.toString() === weddingId;

    if (!isGuest && !isOwner) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Supprimer de Cloudinary si publicId existe
    if (photo.publicId) {
      const cloudinary = require('cloudinary').v2;
      await cloudinary.uploader.destroy(photo.publicId);
    }

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression photo:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
module.exports = router;
const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images uniquement')),
});

// ── POST /api/public/photos/upload
router.post('/upload', upload.array('photos', 10), async (req, res) => {
  try {
    const { category, guestCode, weddingId } = req.body;
    if (!req.files?.length) return res.status(400).json({ error: 'Aucune photo reçue' });
    if (!weddingId)         return res.status(400).json({ error: 'weddingId requis' });

    // ✅ Folder par mariage : wedding-{id}/{category}
    const folder = `wedding-${weddingId}/${category || 'general'}`;

    const uploadPromises = req.files.map(file => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          tags:          [category || 'general', guestCode || 'anonymous', 'wedding', weddingId],
          resource_type: 'image',
          // Stocker weddingId + category en metadata
          context:       `weddingId=${weddingId}|category=${category || 'general'}|guestCode=${guestCode || 'anonymous'}`,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve({
            publicId:     result.public_id,
            url:          result.secure_url,
            thumbnailUrl: result.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill/'),
            category:     category || 'general',
            guestCode:    guestCode || 'anonymous',
            uploadedAt:   result.created_at,
          });
        }
      );
      stream.end(file.buffer);
    }));

    const photos = await Promise.all(uploadPromises);
    res.json({ success: true, photos, count: photos.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/public/photos?weddingId=xxx&limit=10&next_cursor=xxx&category=moments
// Pagination via next_cursor Cloudinary (plus efficace que skip/offset)
router.get('/', async (req, res) => {
  try {
    const { weddingId, limit = 24, next_cursor, category } = req.query;
    if (!weddingId) return res.status(400).json({ error: 'weddingId requis' });

    const prefix = category
      ? `wedding-${weddingId}/${category}`
      : `wedding-${weddingId}/`;

    const options = {
      type:          'upload',
      prefix,
      max_results:   Number(limit),
      resource_type: 'image',
      context:       true,
    };
    // next_cursor = token de pagination Cloudinary
    if (next_cursor) options.next_cursor = next_cursor;

    const result = await cloudinary.api.resources(options);

    const photos = result.resources.map(r => {
      const parts    = r.public_id.split('/');
      const cat      = parts.length >= 2 ? parts[parts.length - 2] : 'general';
      return {
        publicId:     r.public_id,
        url:          r.secure_url,
        thumbnailUrl: r.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill/'),
        category:     cat,
        uploadedAt:   r.created_at,
      };
    });

    res.json({
      success:     true,
      photos,
      total:       result.total_count || photos.length,
      // next_cursor présent = il reste des photos
      next_cursor: result.next_cursor || null,
      hasMore:     !!result.next_cursor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/public/photos/:publicId
router.delete('/:publicId', async (req, res) => {
  try {
    await cloudinary.uploader.destroy(decodeURIComponent(req.params.publicId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
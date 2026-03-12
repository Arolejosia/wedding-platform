const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

const POST_IT_COLORS = ['#FFF8DC','#FFF0C4','#F4E5C2','#EEF4FF','#F0F8F0','#FFF0F5'];
const EMOJIS         = ['💛','💍','🌸','✨','💫','🎉','💝','🥂','🌹','💒'];

const messageSchema = new mongoose.Schema({
  weddingId:   { type: String, required: true, index: true },
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  message:     { type: String, required: true, trim: true, maxlength: 500 },
  emoji:       { type: String, default: '💛' },
  color:       { type: String, default: '#FFF8DC' },
  isFromCouple:{ type: Boolean, default: false },
  approved:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// ── GET /api/public/guestbook?weddingId=xxx&limit=2&page=1&priority=true
router.get('/', async (req, res) => {
  try {
    const { weddingId, limit = 15, page = 1, priority } = req.query;
    if (!weddingId) return res.status(400).json({ error: 'weddingId requis' });

    const skip  = (Number(page) - 1) * Number(limit);
    const filter = { weddingId, approved: true };

    // Tri : mariés en premier si priority=true, sinon plus récents
    const sort = priority === 'true'
      ? { isFromCouple: -1, createdAt: -1 }
      : { createdAt: -1 };

    const [messages, total] = await Promise.all([
      Message.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Message.countDocuments(filter),
    ]);

    res.json({
      success:    true,
      messages,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      hasMore:    skip + messages.length < total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/public/guestbook
router.post('/', async (req, res) => {
  try {
    const { weddingId, name, message } = req.body;
    if (!weddingId || !name || !message)
      return res.status(400).json({ error: 'weddingId, nom et message requis' });
    if (name.length > 100)    return res.status(400).json({ error: 'Nom trop long (max 100)' });
    if (message.length > 500) return res.status(400).json({ error: 'Message trop long (max 500)' });

    const newMessage = new Message({
      weddingId,
      name,
      message,
      color: POST_IT_COLORS[Math.floor(Math.random() * POST_IT_COLORS.length)],
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    });
    await newMessage.save();
    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/public/guestbook/:id  (admin)
router.delete('/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = { router, Message };
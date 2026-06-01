const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const col  = mongoose.connection.collection('guestbookmessages');
  const msgs = await col.find({ weddingId: '69a8f9384f4806389aab22c8' }).toArray();
  console.log('Messages à convertir:', msgs.length);
  
  for (const m of msgs) {
    await col.updateOne(
      { _id: m._id },
      { $set: { weddingId: new mongoose.Types.ObjectId('69a8f9384f4806389aab22c8') } }
    );
  }
  
  console.log('✅ Conversion terminée');
  process.exit(0);
});
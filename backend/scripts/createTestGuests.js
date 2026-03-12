// Script pour recréer les invités de test
// À exécuter dans : backend/scripts/createTestGuests.js

const mongoose = require('mongoose');
const Guest = require('../models/Guest');

// Connexion MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/wedding-db')
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

const testGuests = [
  {
    code: 'TEST',
    person1Name: 'Test',
    person2Name: 'Demo',
    ticketType: 'couple',
    category: 'JF',
    email: 'test@test.com',
    phone: '+237690000000',
    confirmed: false
  },
  {
    code: 'JF01',
    person1Name: 'Jean',
    person2Name: 'Marie',
    ticketType: 'couple',
    category: 'JF',
    email: 'jean@test.com',
    phone: '+237690111111',
    confirmed: false
  },
  {
    code: 'JF02',
    person1Name: 'Sophie',
    person2Name: null,
    ticketType: 'simple',
    category: 'JF',
    email: 'sophie@test.com',
    phone: '+237690222222',
    confirmed: false
  },
  {
    code: 'JA01',
    person1Name: 'Thomas',
    person2Name: 'Emma',
    ticketType: 'couple',
    category: 'JA',
    email: 'thomas@test.com',
    phone: '+237690333333',
    confirmed: false
  },
  {
    code: 'UF01',
    person1Name: 'Paul',
    person2Name: 'Claire',
    ticketType: 'couple',
    category: 'UF',
    email: 'paul@test.com',
    phone: '+237690444444',
    confirmed: false
  },
  {
    code: 'UA01',
    person1Name: 'Lucas',
    person2Name: null,
    ticketType: 'simple',
    category: 'UA',
    email: 'lucas@test.com',
    phone: '+237690555555',
    confirmed: false
  }
];

async function createGuests() {
  try {
    console.log('🚀 Création des invités de test...\n');

    for (const guestData of testGuests) {
      const guest = await Guest.create(guestData);
      console.log(`✅ Créé: ${guest.code} - ${guest.person1Name} ${guest.person2Name || ''}`);
    }

    console.log('\n🎉 Tous les invités ont été créés !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createGuests();
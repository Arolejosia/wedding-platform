const mongoose = require('mongoose');
const Guest = require('../models/Guest');
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Connexion MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/wedding-db')
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Invités de test
const testGuests = [
  { person1Name: 'Jean', person2Name: 'Marie', category: 'JF', ticketType: 'couple', email: 'jean@test.com', phone: '+237690111111' },
  { person1Name: 'Sophie', person2Name: null, category: 'JF', ticketType: 'simple', email: 'sophie@test.com', phone: '+237690222222' },
  { person1Name: 'Thomas', person2Name: 'Emma', category: 'JA', ticketType: 'couple', email: 'thomas@test.com', phone: '+237690333333' },
  { person1Name: 'Paul', person2Name: 'Claire', category: 'UF', ticketType: 'couple', email: 'paul@test.com', phone: '+237690444444' },
  { person1Name: 'Lucas', person2Name: null, category: 'UA', ticketType: 'simple', email: 'lucas@test.com', phone: '+237690555555' },
  { person1Name: 'Pierre', person2Name: 'Anne', category: 'JF', ticketType: 'couple', email: 'pierre@test.com', phone: '+237690666666' },
  { person1Name: 'Marie', person2Name: null, category: 'JA', ticketType: 'simple', email: 'marie2@test.com', phone: '+237690777777' },
  { person1Name: 'David', person2Name: 'Sarah', category: 'UF', ticketType: 'couple', email: 'david@test.com', phone: '+237690888888' },
  { person1Name: 'Julie', person2Name: null, category: 'UA', ticketType: 'simple', email: 'julie@test.com', phone: '+237690999999' },
  { person1Name: 'Marc', person2Name: 'Laura', category: 'JF', ticketType: 'couple', email: 'marc@test.com', phone: '+237690000000' }
];

// Compteurs pour les codes
const counters = { JF: 1, JA: 1, UF: 1, UA: 1 };

// Fonction pour générer un code
function generateCode(category) {
  const num = counters[category].toString().padStart(2, '0');
  counters[category]++;
  return `${category}${num}`;
}

// Fonction pour créer la carte digitale
function createInvitationCard(guest, code) {
  // Dimensions optimisées pour WhatsApp (portrait)
  const width = 1080;
  const height = 1920;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fond dégradé bleu royal
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0A2463');
  gradient.addColorStop(1, '#061539');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Motif géométrique subtil
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 35; j++) {
      const x = i * 60;
      const y = j * 60;
      ctx.strokeRect(x, y, 40, 40);
    }
  }

  // Bordure dorée
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Ornements supérieurs
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('✦ ─── ✦ ─── ✦', width / 2, 150);

  // INVITATION
  ctx.font = 'bold 70px Arial';
  ctx.fillStyle = '#F4E5C2';
  ctx.fillText('👑 INVITATION 👑', width / 2, 250);

  // Ornements
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 50px Arial';
  ctx.fillText('✦ ─── ✦ ─── ✦', width / 2, 330);

  // Familles
  ctx.font = '35px Arial';
  ctx.fillStyle = '#FFF8E7';
  ctx.fillText('LES FAMILLES TANKEU ET DEFO', width / 2, 420);
  ctx.fillText('ONT LE PRIVILÈGE DE VOUS CONVIER', width / 2, 470);

  // au Mariage traditionnel
  ctx.font = 'italic 40px Arial';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('au Mariage traditionnel', width / 2, 550);

  // DE LEURS ENFANTS
  ctx.font = '35px Arial';
  ctx.fillStyle = '#FFF8E7';
  ctx.fillText('DE LEURS ENFANTS', width / 2, 620);

  // Ligne séparatrice
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(150, 680);
  ctx.lineTo(width - 150, 680);
  ctx.stroke();

  // Noms des mariés (style script simulé avec italic)
  ctx.font = 'italic bold 80px Arial';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('Josia & Ulrich', width / 2, 800);

  // Ligne séparatrice
  ctx.beginPath();
  ctx.moveTo(150, 860);
  ctx.lineTo(width - 150, 860);
  ctx.stroke();

  // Date
  ctx.font = 'bold 120px Arial';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('16', width / 2, 1000);
  
  ctx.font = 'bold 60px Arial';
  ctx.fillText('JUIN 2026', width / 2, 1080);

  // Ligne séparatrice
  ctx.beginPath();
  ctx.moveTo(150, 1140);
  ctx.lineTo(width - 150, 1140);
  ctx.stroke();

  // Lieu et programme
  ctx.font = 'bold 45px Arial';
  ctx.fillStyle = '#F4E5C2';
  ctx.fillText('📍 CITÉ CRÉMER, DOUALA', width / 2, 1230);

  ctx.font = '38px Arial';
  ctx.fillStyle = '#FFF8E7';
  ctx.fillText('10H00 • Civil + Religieux', width / 2, 1310);
  ctx.fillText('Suivi d\'un Cocktail', width / 2, 1365);
  ctx.fillText('19H00 • Soirée Dansante', width / 2, 1430);

  // Ligne séparatrice
  ctx.strokeStyle = '#D4AF37';
  ctx.beginPath();
  ctx.moveTo(150, 1490);
  ctx.lineTo(width - 150, 1490);
  ctx.stroke();

  // Invité(s) privilégié(s)
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#F4E5C2';
  ctx.fillText('INVITÉ(S) PRIVILÉGIÉ(S) :', width / 2, 1570);

  // Noms des invités
  const guestNames = guest.person2Name 
    ? `${guest.person1Name} & ${guest.person2Name}`
    : guest.person1Name;
  
  ctx.font = 'italic bold 55px Arial';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText(guestNames, width / 2, 1650);

  // Code d'accès
  ctx.font = 'bold 38px Arial';
  ctx.fillStyle = '#FFF8E7';
  ctx.fillText('Votre Code d\'Accès :', width / 2, 1750);

  // Boîte du code
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 4;
  ctx.strokeRect(width / 2 - 120, 1770, 240, 80);
  
  ctx.font = 'bold 50px monospace';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText(code, width / 2, 1830);

  // Lien site
  ctx.font = '35px Arial';
  ctx.fillStyle = '#F4E5C2';
  ctx.fillText('👉 Confirmez sur :', width / 2, 1940);
  
  ctx.font = 'bold 38px Arial';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('josia-ulrich-wedding.com', width / 2, 1995);

  // Ornements bas
  ctx.font = 'bold 50px Arial';
  ctx.fillText('✦ ─── ✦ ─── ✦', width / 2, 2075);

  return canvas;
}

// Fonction principale
async function generateAll() {
  try {
    console.log('🚀 Début de la génération...\n');

    // Créer le dossier output
    const outputDir = path.join(__dirname, '../invitations-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const results = [];

    for (const guestData of testGuests) {
      const code = generateCode(guestData.category);
      
      // Créer l'invité en base de données
      const guest = await Guest.create({
        code,
        ...guestData
      });

      console.log(`✅ Invité créé: ${guest.person1Name} ${guest.person2Name || ''} - Code: ${code}`);

      // Générer la carte
      const canvas = createInvitationCard(guestData, code);
      
      // Sauvegarder l'image
      const filename = `${guestData.person1Name}${guestData.person2Name ? '_' + guestData.person2Name : ''}_${code}.png`;
      const filepath = path.join(outputDir, filename);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filepath, buffer);
      
      console.log(`📸 Carte générée: ${filename}\n`);

      results.push({ guest, code, filename });
    }

    console.log('═══════════════════════════════════');
    console.log('🎉 GÉNÉRATION TERMINÉE !');
    console.log(`📊 ${results.length} invités créés`);
    console.log(`📂 Cartes dans: ${outputDir}`);
    console.log('═══════════════════════════════════');

    // Créer un récapitulatif
    const recap = results.map(r => `${r.code} - ${r.guest.person1Name} ${r.guest.person2Name || ''}`).join('\n');
    fs.writeFileSync(path.join(outputDir, 'CODES_RECAPITULATIF.txt'), recap);

    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Lancer la génération
generateAll();
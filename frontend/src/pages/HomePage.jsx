// pages/HomePage.jsx - VOTRE SITE AVEC DONNÉES EN DUR
import React from 'react';

// Composants dynamiques
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Story from '../components/Story';
import EventInfo from '../components/EventInfo';
import DressCode from '../components/DressCode';
import PhotoChallenge from '../components/PhotoChallenge';
import GuestBook from '../components/GuestBook';
import RSVP from '../components/RSVP';
import Footer from '../components/Footer';

//import './HomePage.css';

const HomePage = () => {
  // ========== DONNÉES DE VOTRE MARIAGE EN DUR ==========
  const josiaUlrichWedding = {
    _id: "josia-ulrich-wedding-id",
    
    couple: {
      person1: {
        firstName: "Josia",
        lastName: "Arole",
        photo: "/images/couple.png"
      },
      person2: {
        firstName: "Ulrich",
        lastName: "Lele",
        photo: ""
      }
    },
    
    weddingDate: "2026-06-16T10:00:00",
    
    venue: {
      name: "Cité des Palmiers",
      address: "Carrefour Mosquée",
      city: "Douala",
      country: "Cameroun"
    },
    
    story: {
      enabled: true,
      title: "Notre Histoire",
      // Version simple ou versions multiples selon votre contenu actuel
      content: "<p>Votre histoire ici...</p>"
    },
    
    eventInfo: {
      enabled: true,
      title: "Programme",
      ceremony: {
        title: "Mariage Civil",
        time: "10:00",
        location: "Cité des Palmiers carrefour Mosquée",
        address: "Douala, Cameroun"
      },
      cocktail: {
        title: "Benediction Nuptiale",
        time: "12:00",
        location: "Cité des Palmiers carrefour Mosquée",
        address: "Douala, Cameroun"
      },
      reception: {
        title: "Soirée Dansante",
        time: "21:00",
        location: "Bonamousaddi",
        address: "Douala, Cameroun"
      }
    },
    
    dressCode: {
      enabled: true,
      title: "Code Vestimentaire",
      theme: "BLEU ROYAL & OR CHAMPAGNE",
      description: "Préparez-vous à rayonner et à vivre une journée d'élégance royale. Laissez votre style refléter la sophistication et le charme d'une soirée de gala.",
      men: "Costume bleu roi ou noir avec cravate or champagne",
      women: "Robe longue bleu roi, or champagne ou tons complémentaires",
      colors: ["Bleu Royal", "Or Champagne"],
      notes: "Ces images sont proposées à titre d'inspiration pour vous guider dans le respect du thème Élégance Royale – Bleu roi & Or champagne.",
      showCarousel: true
    },
    
    photoChallenge: {
      enabled: true,
      title: "Mission Photos",
      description: "Capturez les moments magiques et partagez-les avec tous les invités en temps réel !",
      hashtag: "JosiaUlrich2026",
      uploadEnabled: true
    },
    
    guestbook: {
      enabled: true,
      title: "Livre d'Or",
      requireApproval: false
    },
    
    invitation: {
      message: "Nous serons honorés et heureux de votre présence à notre cérémonie et notre réception de mariage ! Pour une meilleure organisation, veuillez confirmer votre présence."
    },
    
    navigation: {
      showStory: true,
      showEventInfo: true,
      showDressCode: true,
      showPhotos: true,
      showGuestbook: true,
      customLinks: []
    },
    
    footer: {
      message: "Avec amour",
      socialLinks: {
        instagram: "",
        facebook: "",
        twitter: ""
      }
    },
    
    settings: {
      language: "fr",
      currency: "FCFA",
      timezone: "Africa/Douala",
      theme: {
        primaryColor: "#0A2463",
        secondaryColor: "#D4AF37",
        fontFamily: "Playfair Display",
        style: "classic"
      },
      features: {
        countdown: true,
        music: false,
        animations: true
      }
    }
  };

  console.log('🔍 Wedding Object:', josiaUlrichWedding);
  console.log('📖 Story enabled?', josiaUlrichWedding.story?.enabled);
  console.log('📅 EventInfo enabled?', josiaUlrichWedding.eventInfo?.enabled);
  console.log('👔 DressCode enabled?', josiaUlrichWedding.dressCode?.enabled);
  

  return (
    <div 
      className="homepage"
      style={{
        '--site-primary': josiaUlrichWedding.settings.theme.primaryColor,
        '--site-secondary': josiaUlrichWedding.settings.theme.secondaryColor,
      }}
    >
      {/* Navigation */}
      <Navbar wedding={josiaUlrichWedding} />

      {/* Hero Section */}
      <Hero wedding={josiaUlrichWedding} />

      {/* Story Section */}
       {console.log('🎬 Rendering Story')}
      <Story wedding={josiaUlrichWedding} />

      {/* Event Info Section */}
      <EventInfo wedding={josiaUlrichWedding} />

      {/* RSVP Section */}
      <RSVP wedding={josiaUlrichWedding} />

      {/* Dress Code Section */}
      <DressCode wedding={josiaUlrichWedding} />

      {/* Photo Challenge Section */}
      <PhotoChallenge wedding={josiaUlrichWedding} />

      {/* Guest Book Section */}
      <GuestBook wedding={josiaUlrichWedding} />

      {/* Footer */}
      <Footer wedding={josiaUlrichWedding} />
    </div>
  );
};

export default HomePage;

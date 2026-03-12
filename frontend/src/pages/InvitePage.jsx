import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Story from '../components/Story';
import EventInfo from '../components/EventInfo';
import RSVP from '../components/RSVP';
import DressCode from '../components/DressCode';
import PhotoChallenge from '../components/PhotoChallenge';
import GuestBook from '../components/GuestBook';
import Footer from '../components/Footer';

function InvitePage() {
  const { code } = useParams();
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/api/guests/invite/${code}`)
      .then(res => {
        if (!res.ok) throw new Error('Code invalide');
        return res.json();
      })
      .then(data => {
        setGuest(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A2463 0%, #061539 100%)',
        color: '#D4AF37',
        fontSize: '1.5rem',
        fontFamily: 'Cormorant Garamond, serif'
      }}>
        Chargement de votre invitation...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A2463 0%, #061539 100%)',
        color: '#D4AF37',
        fontSize: '1.5rem',
        fontFamily: 'Cormorant Garamond, serif',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>❌ Code d'invitation invalide</div>
        <div style={{ fontSize: '1rem', opacity: 0.7 }}>
          Veuillez vérifier votre code
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Hero />
      <Story />
      <EventInfo />
      <RSVP guestCode={code} prefilledGuest={guest} />
      <DressCode />
      <PhotoChallenge />
      <GuestBook />
      <Footer />
    </>
  );
}

export default InvitePage;
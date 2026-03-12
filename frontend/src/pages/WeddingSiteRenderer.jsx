import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Story from '../components/Story';
import EventInfo from '../components/EventInfo';
import DressCode from '../components/DressCode';
import PhotoChallenge from '../components/PhotoChallenge';
import GuestBook from '../components/GuestBook';
import RSVP from '../components/RSVP';
import Footer from '../components/Footer';
import Gifts from '../components/Gifts';

const WeddingSiteRenderer = ({ wedding, isPreview=false }) => {

  if (!wedding) return null;

  return (
    <div
      className="public-wedding-site"
      style={{
        '--site-primary': wedding.settings?.theme?.primaryColor,
        '--site-secondary': wedding.settings?.theme?.secondaryColor,
        '--site-font': wedding.settings?.theme?.fontFamily
      }}
    >

      <Navbar wedding={wedding} />

      <Hero wedding={wedding} />

      {wedding.story?.enabled && (
        <Story wedding={wedding} isPreview={isPreview}/>
      )}

      {wedding.eventInfo?.enabled && (
        <EventInfo wedding={wedding} isPreview={isPreview}/>
      )}

      <RSVP wedding={wedding} isPreview={isPreview}/>

      {wedding.dressCode?.enabled && (
        <DressCode wedding={wedding}/>
      )}

      {wedding.photoChallenge?.enabled && (
        <PhotoChallenge wedding={wedding} isPreview={isPreview}/>
      )}

      {wedding.guestbook?.enabled && (
        <GuestBook wedding={wedding} isPreview={isPreview}/>
      )}

      {wedding.gifts?.enabled && (
        <Gifts wedding={wedding} isPreview={isPreview}/>
      )}

      <Footer wedding={wedding} />

    </div>
  );
};

export default WeddingSiteRenderer;
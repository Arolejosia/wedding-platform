import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";

const SiteCreated = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();

  const wedding = location.state?.wedding;

  const siteUrl = `${window.location.origin}/wedding/${slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(siteUrl);
    alert("Lien copié !");
  };

  return (
    <div style={{
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      minHeight:"100vh",
      fontFamily:"Playfair Display, serif"
    }}>

      <h1>🎉 Votre site est prêt !</h1>

      <p style={{marginBottom:"20px"}}>
        Partagez ce lien avec vos invités :
      </p>

      <input
        value={siteUrl}
        readOnly
        style={{
          padding:"10px",
          width:"320px",
          textAlign:"center",
          marginBottom:"10px"
        }}
      />

      <button onClick={copyLink}>
        📋 Copier le lien
      </button>

      <div style={{margin:"30px"}}>
        <QRCode value={siteUrl} size={180} />
      </div>

      <div style={{display:"flex", gap:"15px"}}>

        <button onClick={() => window.open(siteUrl, "_blank")}>
          🌐 Voir mon site
        </button>

        <button onClick={() => navigate(`/admin/${wedding?._id}`)}>
          ⚙️ Tableau de bord
        </button>

      </div>

    </div>
  );
};

export default SiteCreated;
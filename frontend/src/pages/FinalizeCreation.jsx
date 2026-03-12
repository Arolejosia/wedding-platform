// src/pages/FinalizeCreation.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTheme } from "../config/themes";

const FinalizeCreation = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const createWedding = async () => {

      try {

        let previewData = null;

        try {
          previewData = JSON.parse(sessionStorage.getItem("previewData"));
        } catch {
          previewData = null;
        }

        const selectedPlan  = sessionStorage.getItem("selectedPlan");
        const selectedTheme = sessionStorage.getItem("selectedTheme");
        const token         = localStorage.getItem("token");

        if (!previewData || !selectedPlan || !selectedTheme || !token) {
          navigate("/choose-theme");
          return;
        }

        const themeConfig = getTheme(selectedTheme);

        const [p1, p2] = (previewData.names || "")
          .split("&")
          .map(n => n.trim());

        const payload = {

          weddingDate: previewData.date,

          plan: selectedPlan,

          theme: selectedTheme,

          couple: {
            person1: { firstName: previewData.person1 || p1 || "" },
            person2: { firstName: previewData.person2 || p2 || "" }
          },

          venue: {
            city: previewData.city || "",
            country: previewData.country || ""
          },

          settings: {
            theme: {
              id: themeConfig.id,
              primaryColor: themeConfig.primary,
              secondaryColor: themeConfig.secondary,
              accentColor: themeConfig.accent,
              fontFamily: themeConfig.font,
              heroLayout: themeConfig.heroLayout,
              navStyle: themeConfig.navStyle,
              sectionBg: themeConfig.sectionBg
            },
            features: {
              countdown: true
            }
          }

        };

        const response = await fetch("API_URL/api/weddings", {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify(payload)

        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur création");
        }

        sessionStorage.removeItem("previewData");
        sessionStorage.removeItem("selectedPlan");
        sessionStorage.removeItem("selectedTheme");

        localStorage.setItem("activeWeddingId", data.wedding._id);

        navigate(`/site-created/${data.wedding.customSlug}`, {
          state: { wedding: data.wedding }
        });

      } catch (err) {

        console.error("Erreur création wedding:", err);
        setError(err.message || "Une erreur est survenue.");
        setLoading(false);

      }

    };

    createWedding();

  }, []); // eslint-disable-line


  if (loading) {

    return (

      <div style={{
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        minHeight:"100vh",
        background:"linear-gradient(135deg,#0A2463,#071A3D)",
        color:"white",
        fontFamily:"Playfair Display, serif"
      }}>

        <div style={{fontSize:"3rem", marginBottom:"20px"}}>✨</div>

        <h2>Création de votre site...</h2>

        <p style={{opacity:0.7}}>Quelques secondes...</p>

      </div>

    );

  }


  return (

    <div style={{
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      minHeight:"100vh",
      fontFamily:"sans-serif"
    }}>

      <h2>{error}</h2>

      <button
        onClick={() => navigate("/choose-theme")}
        style={{
          padding:"12px 24px",
          background:"#0A2463",
          color:"white",
          border:"none",
          borderRadius:"8px",
          cursor:"pointer"
        }}
      >
        Réessayer
      </button>

    </div>

  );

};

export default FinalizeCreation;
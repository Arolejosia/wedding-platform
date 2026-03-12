import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import "./ShareSite.css";
import API_URL from '../../config/api';

const ShareSite = () => {

  const { weddingId } = useParams();

  const [wedding,setWedding] = useState(null);

  const qrRef = useRef(null);

  useEffect(()=>{

    const fetchWedding = async ()=>{

      try{

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/weddings/${weddingId}`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
          }
        );

        const data = await res.json();

        if(data.success){
          setWedding(data.wedding);
        }

      }catch(err){
        console.error(err);
      }

    };

    fetchWedding();

  },[weddingId]);


  if(!wedding){
    return <div style={{padding:"40px"}}>Chargement...</div>;
  }
const siteUrl = `${window.location.origin}/w/${wedding.customSlug}`;
  

  const copyLink = ()=>{
    navigator.clipboard.writeText(siteUrl);
    alert("Lien copié !");
  };


  const downloadQR = ()=>{

    const svg = qrRef.current.querySelector("svg");

    const serializer = new XMLSerializer();

    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    const img = new Image();

    img.onload = function(){

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img,0,0);

      const png = canvas.toDataURL("image/png");

      const link = document.createElement("a");

      link.download = "qr-mariage.png";
      link.href = png;

      link.click();

    };

    img.src = "data:image/svg+xml;base64," + btoa(svgString);

  };


  const printQR = ()=>{

    const svg = qrRef.current.querySelector("svg").outerHTML;

    const win = window.open("","","width=600,height=600");

    win.document.write(`

      <html>
      <head>

      <title>QR Code mariage</title>

      <style>

      body{
      text-align:center;
      font-family:sans-serif;
      padding:40px;
      }

      h2{
      margin-bottom:30px;
      }

      svg{
      width:250px;
      }

      </style>

      </head>

      <body>

      <h2>Scannez pour accéder à notre site</h2>

      ${svg}

      <p>${siteUrl}</p>

      </body>

      </html>

    `);

    win.document.close();

    win.print();

  };

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(siteUrl)}`;

  const email = `mailto:?subject=Invitation au mariage&body=${encodeURIComponent(siteUrl)}`;


  return(

    <div className="share-container">

      <h1 className="share-title">🔗 Partager mon site</h1>

      <p className="share-subtitle">
        Envoyez ce lien à vos invités
      </p>

      <div className="share-link-box">

        <input
          value={siteUrl}
          readOnly
          className="share-link-input"
        />

        <button
          className="btn-copy"
          onClick={copyLink}
        >
          Copier
        </button>

      </div>

      <div
        className="qr-container"
        ref={qrRef}
      >

        <QRCode
          value={siteUrl}
          size={180}
        />

      </div>


      <div className="share-buttons">

        <button
          className="share-btn"
          onClick={downloadQR}
        >
          📄 Télécharger QR
        </button>

        <button
          className="share-btn"
          onClick={printQR}
        >
          🖨 Imprimer QR
        </button>

      </div>


      <div className="share-buttons">

        <a href={whatsapp} target="_blank" rel="noreferrer">
          <button className="share-btn">💬 WhatsApp</button>
        </a>

        <a href={email}>
          <button className="share-btn">📧 Email</button>
        </a>

        <button
          className="share-btn"
          onClick={copyLink}
        >
          📸 Instagram
        </button>

      </div>

    </div>

  );

};

export default ShareSite;
// src/components/Adminpage.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from './Adminlayout';
import API_URL from '../config/api';

const AdminPage = () => {
  const { weddingId } = useParams();
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [wedding, setWedding] = useState(null);

  const getToken = () =>
    token || localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    if (!weddingId) return;
    const fetchWedding = async () => {
      try {
        const res = await fetch(`${API_URL}/weddings/${weddingId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (data.success) setWedding(data.wedding);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };
    fetchWedding();
  }, [weddingId]); // eslint-disable-line

  const handleLogout = () => { logout(); navigate('/login'); };

  const coupleName = wedding
    ? `${wedding.couple?.person1?.firstName || ''}${wedding.couple?.person2?.firstName ? ' & ' + wedding.couple.person2.firstName : ''}`
    : '';

  return (
    <AdminLayout
      weddingId={weddingId}
      weddingSlug={wedding?.customSlug}
      coupleName={coupleName}
      onLogout={handleLogout}
    >
      <Outlet />
    </AdminLayout>
  );
};

export default AdminPage;
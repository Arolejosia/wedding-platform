// frontend/src/App.jsx - CORRIGÉ
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques
import LandingPage from './pages/LandingPage';
import InvitePage from './pages/InvitePage';
import PublicWeddingSite from './pages/PublicWeddingSite';
import PreviewWeddingSite from './pages/PreviewWeddingSite';
import ChooseTheme from './pages/ChooseTheme';
import FinalizeCreation from './pages/FinalizeCreation';


// Auth
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ChoosePlan from './pages/ChoosePlan';

// Dashboard
import Dashboard from './pages/Dashboard';
import RegisterWedding from './pages/RegisterWedding';
import StartPreview from "./pages/StartPreview";

// Settings
import Settings from './pages/Settings';

// Admin (existant)
import AdminPage from './components/Adminpage';
import AdminDashboard from './components/Admindashboard';
import WeddingChecklist from './components/Weddingchecklist';
import seatingPlan from './components/seatingplan';
import BudgetTracker from './components/Budgettracker';
import FullAlbum from "./pages/FullAlbum";
import AllMessages from "./pages/AllMessages";
import SiteCreated from "./pages/SiteCreated";
import ShareSite from "./pages/admin/ShareSite";
import AdminPhotos from './pages/AdminPhotos';


import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        
        {/* ========== ROUTES PUBLIQUES ========== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invite/:code" element={<InvitePage />} />
        <Route path="/w/:slug" element={<PublicWeddingSite />} />
<Route path="/wedding/:slug" element={<PublicWeddingSite />} />
        <Route path="/wedding/:weddingSlug/photos" element={<FullAlbum />}/>
        <Route path="/wedding/:weddingSlug/guestbook" element={<AllMessages />} />
        <Route path="/site-created/:slug" element={<SiteCreated />} />
        <Route path="/admin/:weddingId/share" element={<ShareSite />} />

        <Route path="/admin/:weddingId/photos" element={<AdminPhotos />} />
        
        {/* ========== DASHBOARD ========== */}
        <Route path="/start-preview" element={<StartPreview />} />
        <Route path="/preview/:theme" element={<PreviewWeddingSite />} />
        <Route path="/choose-plan" element={<ChoosePlan />} />
        <Route path="/choose-theme" element={<ChooseTheme />} />
        <Route path="/finalize-creation" element={<FinalizeCreation />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* ========== REGISTER WEDDING ========== */}
        <Route path="/register-wedding" element={
          <ProtectedRoute>
            <RegisterWedding />
          </ProtectedRoute>
        } />
        
        {/* ========== WORKSPACE ADMIN ========== */}
       <Route
  path="/admin/:weddingId"
  element={
    <ProtectedRoute requireWedding={false}>
      <AdminPage />
    </ProtectedRoute>
  }
>
          <Route index element={<AdminDashboard />} />
          <Route path="checklist" element={<WeddingChecklist />} />
          <Route path="seating" element={<SeatingPlan />} />
          <Route path="budget" element={<BudgetTracker />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* ========== REDIRECTION PAR DÉFAUT ========== */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;
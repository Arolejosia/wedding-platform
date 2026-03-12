import axios from 'axios';

// URL de base du backend
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api`;

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ========== GUESTS ==========
export const getGuests = () => api.get('/guests');
export const getGuest = (code) => api.get(`/guests/${code}`);
export const createGuest = (data) => api.post('/guests', data);
export const updateGuest = (code, data) => api.put(`/guests/${code}`, data);
export const deleteGuest = (code) => api.delete(`/guests/${code}`);

// ========== TABLES ==========
export const getTables = () => api.get('/tables');
export const getTable = (number) => api.get(`/tables/${number}`);
export const createTable = (data) => api.post('/tables', data);
export const updateTable = (number, data) => api.put(`/tables/${number}`, data);
export const deleteTable = (number) => api.delete(`/tables/${number}`);

// ========== EVENTS ==========
export const getEvents = () => api.get('/events');
export const createEvent = (data) => api.post('/events', data);

// ========== RSVP ==========
export const verifyCode = (code) => api.get(`/rsvp/verify/${code}`);
export const submitRSVP = (data) => api.post('/rsvp', data);

// ========== GENERATE ==========
export const generateCodes = (data) => api.post('/generate/codes', data);
export const generateTables = (data) => api.post('/generate/tables', data);

// ========== ASSIGN ==========
export const autoAssignTables = () => api.post('/assign');
export const manualAssign = (data) => api.put('/assign/manual', data);
export const unassignGuest = (code) => api.delete(`/assign/${code}`);

// ========== STATS ==========
export const getStats = () => api.get('/stats');
export const getSeatingPlan = () => api.get('/stats/seating-plan');
export const getUnassigned = () => api.get('/stats/unassigned');

export default api;
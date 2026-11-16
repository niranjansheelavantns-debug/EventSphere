import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// Events
export const getEvents = (params) => API.get('/events', { params });
export const getEventById = (id) => API.get(`/events/${id}`);
export const getFeaturedEvents = () => API.get('/events/featured');
export const getUpcomingEvents = () => API.get('/events/upcoming');
export const createEvent = (data) => API.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateEvent = (id, data) => API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const getMyEvents = () => API.get('/events/my');
export const getEventBookings = (id) => API.get(`/events/${id}/bookings`);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const cancelBooking = (id, data) => API.delete(`/bookings/${id}`, { data });

// Payments
export const createPaymentOrder = (data) => API.post('/payments/create-order', data);
export const verifyPayment = (data) => API.post('/payments/verify', data);
export const getPaymentHistory = () => API.get('/payments/history');

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const blockUser = (id) => API.put(`/admin/users/${id}/block`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const updateUserRole = (id, data) => API.put(`/admin/users/${id}/role`, data);
export const getAdminEvents = (params) => API.get('/admin/events', { params });
export const approveEvent = (id, data) => API.put(`/admin/events/${id}/status`, data);

export default API;

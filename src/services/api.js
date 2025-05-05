import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Auth endpoints
export const auth = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    formData.append('scope', '');
    return api.post('/auth/jwt/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  
  logout: () => 
    api.post('/auth/jwt/logout'),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  forgotPassword: (email) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token, password) => 
    api.post('/auth/reset-password', { token, password }),
  
  requestVerification: (email) => 
    api.post('/auth/request-verify-token', { email }),
  
  verify: (token) => 
    api.post('/auth/verify', { token }),
};

// User endpoints
export const users = {
  getCurrentUser: () => 
    api.get('/users/me'),
  
  updateCurrentUser: (userData) => 
    api.patch('/users/me', userData),
  
  getUser: (id) => 
    api.get(`/users/${id}`),
  
  updateUser: (id, userData) => 
    api.patch(`/users/${id}`, userData),
  
  deleteUser: (id) => 
    api.delete(`/users/${id}`),
};

// Task endpoints
export const tasks = {
  getAssignments: () => 
    api.get('/upcoming/assignments'),
  
  scheduleNotification: (taskData) => 
    api.post('/schedule/notification', taskData),
  
  getReminders: () =>
    api.get('/active/reminders'),

  deleteReminder: (task_id) =>
    api.delete('/delete/reminder', { params: { task_id } }),

  saveToken: (token) =>
    api.post('/save/token', null, { params: { token } }),

  sendFakeNotification: (taskData) =>
    api.post('/send/fake/notification', taskData),
};

export default api; 
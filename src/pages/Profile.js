import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { users, auth, tasks } from '../services/api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const Profile = () => {
  const { user, refreshUser, setUser } = useAuth();
  const [form, setForm] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [verifLoading, setVerifLoading] = useState(false);
  const [verifMsg, setVerifMsg] = useState('');
  const [token, setToken] = useState('');
  const [tokenMsg, setTokenMsg] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ username: user.username || '', email: user.email || '' });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await users.updateCurrentUser({ username: form.username, email: form.email });
      setSuccess('Profile updated successfully');
      refreshUser();
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    setVerifLoading(true);
    setVerifMsg('');
    try {
      await auth.requestVerification(form.email);
      setVerifMsg('Verification email sent! Please check your inbox.');
    } catch (err) {
      setVerifMsg('Failed to send verification email.');
    } finally {
      setVerifLoading(false);
    }
  };

  const handleSaveToken = async () => {
    if (!user.is_verified) {
      setTokenMsg('You must verify your account before storing a token.');
      return;
    }
    setTokenLoading(true);
    setTokenMsg('');
    try {
      await tasks.saveToken(token);
      setTokenMsg('Token saved successfully!');
    } catch (err) {
      setTokenMsg('Failed to save token.');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await users.deleteCurrentUser();
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Your session may have expired. Please try logging out and logging back in before deleting your account.');
      } else {
        setError(err.response?.data?.detail || 'Failed to delete account. Please try again later.');
      }
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!user) return <CircularProgress sx={{ mt: 8 }} />;

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          User Profile
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={<Switch checked={user.is_active} disabled />}
              label="Active"
            />
            <FormControlLabel
              control={<Switch checked={user.is_verified} disabled />}
              label="Verified"
            />
          </Box>
          {!user.is_verified && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={handleRequestVerification}
                disabled={verifLoading}
                fullWidth
              >
                {verifLoading ? <CircularProgress size={20} /> : 'Request Verification Email'}
              </Button>
              {verifMsg && (
                <Alert severity={verifMsg.startsWith('Verification') ? 'success' : 'error'} sx={{ mt: 2 }}>{verifMsg}</Alert>
              )}
            </Box>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </form>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Store Token
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Go to Canvas profile using Laptop or PC, go to settings, New Access Token, Leave datetime fields empty to generate non expirable token
          </Typography>
          <TextField
            fullWidth
            id="token"
            name="token"
            label="Token"
            value={token}
            onChange={e => setToken(e.target.value)}
            margin="normal"
            disabled={!user.is_verified}
          />
          <Button
            variant="contained"
            onClick={handleSaveToken}
            disabled={tokenLoading || !token || !user.is_verified}
            fullWidth
          >
            {tokenLoading ? <CircularProgress size={20} /> : 'Save Token'}
          </Button>
          {tokenMsg && (
            <Alert severity={tokenMsg.includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>{tokenMsg}</Alert>
          )}
          {!user.is_verified && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You must verify your account before storing a token.
            </Alert>
          )}
        </Box>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete Account'}
          </Button>
        </Box>
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete your account? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
            <Button onClick={handleDeleteAccount} color="error" disabled={deleteLoading}>
              {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Profile; 
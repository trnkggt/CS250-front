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
} from '@mui/material';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [verifLoading, setVerifLoading] = useState(false);
  const [verifMsg, setVerifMsg] = useState('');
  const [token, setToken] = useState('');
  const [tokenMsg, setTokenMsg] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);

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
      </Paper>
    </Container>
  );
};

export default Profile; 
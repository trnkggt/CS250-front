import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Container, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    const verifyToken = async () => {
      try {
        await auth.verify(token);
        setStatus('success');
        setMessage('Your account has been verified!');
        refreshUser && refreshUser();
      } catch (err) {
        setStatus('error');
        setMessage('Verification failed. The link may be invalid or expired.');
      }
    };
    verifyToken();
    // eslint-disable-next-line
  }, []);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: 'center' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Email Verification
        </Typography>
        {status === 'pending' && <CircularProgress sx={{ mt: 2 }} />}
        {status === 'success' && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
        {status === 'error' && <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>}
        <Button sx={{ mt: 4 }} variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Paper>
    </Container>
  );
};

export default Verify; 
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password, twoFactorCode);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const demoCredentials = [
    { email: 'admin@nccr.gov.in', password: 'admin123', role: 'Administrator' },
    { email: 'verifier@nccr.gov.in', password: 'verify123', role: 'MRV Verifier' },
    { email: 'analyst@nccr.gov.in', password: 'analyze123', role: 'Data Analyst' },
  ];

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <Lock />
        </Avatar>
        
        <Typography component="h1" variant="h4" gutterBottom>
          NCCR Portal
        </Typography>
        
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Blue Carbon Registry - MRV System
        </Typography>

        <Card sx={{ mt: 3, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {showTwoFactor && (
                <TextField
                  margin="normal"
                  fullWidth
                  name="twoFactorCode"
                  label="2FA Code"
                  id="twoFactorCode"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  disabled={loading}
                  placeholder="Enter 6-digit code"
                />
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Demo Credentials:
                </Typography>
                {demoCredentials.map((cred, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="caption" display="block">
                      <strong>{cred.role}:</strong> {cred.email} / {cred.password}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            National Centre for Coastal Research (NCCR)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Ministry of Earth Sciences, Government of India
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;

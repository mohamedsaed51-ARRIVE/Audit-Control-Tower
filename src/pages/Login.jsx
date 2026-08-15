import { useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';

import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlineRoundedIcon from '@mui/icons-material/LockOutlineRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import logo from '../assets/logo.png';
import LogisticsGraphic from '../components/common/LogisticsGraphic';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError('Enter your work email and password to continue.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(normalizedEmail, password);

      if (!result?.success) {
        setError(result?.error || 'Invalid email or password.');
        return;
      }

      navigate(location.state?.from?.pathname || '/', {
        replace: true,
      });
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 940,
        display: 'flex',
        overflow: 'hidden',
        borderRadius: 5,
        boxShadow: (t) => t.shadows[16],
        minHeight: 560,
      }}
    >
      {/* Branding / logistics panel */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          zIndex: 0,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 5,
          color: '#fff',
          background: (t) =>
            `linear-gradient(
              150deg,
              ${t.palette.primary.dark},
              ${t.palette.primary.main} 55%,
              ${t.palette.brand.cyan700}
            )`,
          overflow: 'hidden',
        }}
      >
        <LogisticsGraphic />

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="ARRIVE"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '11px',
            }}
          />

          <Typography variant="h6">
            ARRIVE Control Tower
          </Typography>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 1.5,
              maxWidth: 360,
            }}
          >
            Every shipment. Every branch. One command center.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              opacity: 0.85,
              maxWidth: 340,
            }}
          >
            Real-time visibility into operations, audits, and compliance
            across the entire ARRIVE Express network.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{
              mt: 3,
            }}
          >
            <Chip
              icon={
                <VerifiedRoundedIcon
                  sx={{
                    color: '#fff !important',
                    fontSize: 16,
                  }}
                />
              }
              label="12 branches connected"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.14)',
                color: '#fff',
              }}
            />

            <Chip
              label="96.4% SLA"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.14)',
                color: '#fff',
              }}
            />
          </Stack>
        </Box>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          p: {
            xs: 3.5,
            sm: 5.5,
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Mobile logo */}
        <Stack
          spacing={0.5}
          alignItems="center"
          sx={{
            mb: 3.5,
            display: {
              xs: 'flex',
              md: 'none',
            },
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="ARRIVE"
            sx={{
              width: 46,
              height: 46,
              borderRadius: '12px',
              mb: 1,
            }}
          />
        </Stack>

        <Typography variant="h5">
          Welcome back
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3.5,
          }}
        >
          Sign in to the ARRIVE Control Tower
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        <Stack
          component="form"
          spacing={2.25}
          onSubmit={handleSubmit}
        >
          {/* Email */}
          <TextField
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            autoComplete="username"
            disabled={loading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon
                      fontSize="small"
                      sx={{
                        color: 'text.secondary',
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Password */}
          <TextField
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            autoComplete="current-password"
            disabled={loading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlineRoundedIcon
                      fontSize="small"
                      sx={{
                        color: 'text.secondary',
                      }}
                    />
                  </InputAdornment>
                ),

                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((s) => !s)}
                      edge="end"
                      size="small"
                      disabled={loading}
                      aria-label={
                        showPw
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPw ? (
                        <VisibilityOffRoundedIcon fontSize="small" />
                      ) : (
                        <VisibilityRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Remember / Forgot */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  defaultChecked
                  disabled={loading}
                />
              }
              label={
                <Typography variant="body2">
                  Remember me
                </Typography>
              }
            />

            <Typography
              variant="body2"
              sx={{
                color: 'secondary.main',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Forgot password?
            </Typography>
          </Stack>

          {/* Login button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.3,
              borderRadius: 2.5,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Stack>

        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          textAlign="center"
          sx={{
            mt: 4,
          }}
        >
          © {new Date().getFullYear()} ARRIVE Express. All rights reserved.
        </Typography>
      </Box>
    </Card>
  );
}
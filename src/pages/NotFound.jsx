import { Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Stack spacing={2} sx={{ minHeight: '70vh', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h1" sx={{ fontSize: '5rem', color: 'primary.main' }}>404</Typography>
      <Typography variant="h5">Page not found</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        The page you're looking for doesn't exist or has moved.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Back to Dashboard</Button>
    </Stack>
  );
}

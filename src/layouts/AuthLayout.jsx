import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (t) =>
          t.palette.mode === 'dark'
            ? `radial-gradient(1200px 600px at 15% 10%, rgba(18,198,211,0.10), transparent), radial-gradient(1000px 700px at 90% 90%, rgba(18,48,156,0.35), transparent), ${t.palette.background.default}`
            : `radial-gradient(1200px 600px at 15% 10%, rgba(18,198,211,0.14), transparent), radial-gradient(1000px 700px at 90% 90%, rgba(18,48,156,0.10), transparent), ${t.palette.background.default}`,
        p: 2,
      }}
    >
      <Outlet />
    </Box>
  );
}

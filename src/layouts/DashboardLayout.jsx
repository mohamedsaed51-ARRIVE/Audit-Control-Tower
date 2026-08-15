import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import TopBar from '../components/navigation/TopBar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <Sidebar variant="mobile" mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar onOpenMobileNav={() => setMobileOpen(true)} />
        <Box component="main" sx={{ flex: 1, p: { xs: 1.75, sm: 2.5, lg: 3 }, maxWidth: 1800, width: '100%', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

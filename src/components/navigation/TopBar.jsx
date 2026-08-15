import { useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, Stack, Tooltip, useMediaQuery } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useTheme } from '@mui/material/styles';
import { TOPBAR_HEIGHT } from '../../theme';
import { useColorMode } from '../../context/ColorModeContext';
import NotificationsMenu from './NotificationsMenu';
import ProfileMenu from './ProfileMenu';
import SearchSpotlight from './SearchSpotlight';

export default function TopBar({ onOpenMobileNav }) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { mode, toggleMode } = useColorMode();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          height: TOPBAR_HEIGHT,
          justifyContent: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(17,22,42,0.75)' : 'rgba(255,255,255,0.78)',
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          {!isMdUp && (
            <IconButton onClick={onOpenMobileNav}>
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box
            onClick={() => setSearchOpen(true)}
            sx={{
              flex: 1,
              maxWidth: 420,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.75,
              py: 0.9,
              borderRadius: 3,
              cursor: 'pointer',
              color: 'text.secondary',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(11,15,50,0.045)',
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': { borderColor: theme.palette.secondary.main },
            }}
          >
            <SearchRoundedIcon fontSize="small" />
            <Box component="span" sx={{ fontSize: '0.85rem', flex: 1 }}>
              Search shipments, branches, audit, reports...
            </Box>
            <Box
              component="span"
              sx={{
                fontSize: '0.68rem',
                px: 0.8,
                py: 0.15,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                color: 'text.disabled',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Ctrl K
            </Box>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton onClick={toggleMode}>
                {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>
            <NotificationsMenu />
            <ProfileMenu />
          </Stack>
        </Toolbar>
      </AppBar>
      <SearchSpotlight open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

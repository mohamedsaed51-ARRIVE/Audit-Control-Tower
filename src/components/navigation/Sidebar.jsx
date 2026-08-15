import { Box, Drawer, Stack, Typography, Tooltip, alpha, IconButton, Chip } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { navSections } from '../../app/navConfig';
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from '../../theme';
import logo from '../../assets/logo.png';

function NavItem({ item, collapsed }) {
  const location = useLocation();
  const active = location.pathname === item.path;
  const Icon = item.icon;

  const content = (
    <Stack
      component={NavLink}
      to={item.path}
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        px: collapsed ? 0 : 1.75,
        py: 1.1,
        borderRadius: 2.5,
        textDecoration: 'none',
        color: active ? 'primary.contrastText' : 'text.secondary',
        bgcolor: active ? 'primary.main' : 'transparent',
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition: 'all .15s ease',
        position: 'relative',
        '&:hover': {
          bgcolor: active ? 'primary.main' : (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.18 : 0.08),
          color: active ? 'primary.contrastText' : 'text.primary',
        },
      }}
    >
      <Icon sx={{ fontSize: 21 }} />
      {!collapsed && (
        <Typography
          variant="body2"
          sx={{ fontWeight: active ? 700 : 600, whiteSpace: 'nowrap', flex: 1 }}
        >
          {item.label}
        </Typography>
      )}
      {!collapsed && item.badge && (
        <Chip
          label={item.badge}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.6rem',
            bgcolor: active ? 'rgba(255,255,255,0.25)' : 'secondary.main',
            color: active ? '#fff' : 'secondary.contrastText',
          }}
        />
      )}
    </Stack>
  );

  return collapsed ? (
    <Tooltip title={item.label} placement="right" arrow>
      {content}
    </Tooltip>
  ) : (
    content
  );
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile, variant }) {
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

  const body = (
    <Stack sx={{ height: '100%', px: collapsed ? 1.25 : 2, py: 2.5 }} spacing={2.5}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: collapsed ? 0 : 0.75, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Box
          component="img"
          src={logo}
          alt="ARRIVE"
          sx={{ width: collapsed ? 32 : 34, height: collapsed ? 32 : 34, borderRadius: '9px', objectFit: 'cover' }}
        />
        {!collapsed && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.1, fontFamily: (t) => t.typography.h6.fontFamily }}>
              ARRIVE
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
              CONTROL TOWER
            </Typography>
          </Box>
        )}
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', mx: -0.5, px: 0.5 }}>
        <Stack spacing={2.25}>
          {navSections.map((section) => (
            <Stack key={section.heading} spacing={0.5}>
              {!collapsed && (
                <Typography
                  variant="overline"
                  sx={{ px: 1.75, color: 'text.disabled', fontSize: '0.68rem' }}
                >
                  {section.heading}
                </Typography>
              )}
              {section.items.map((item) => (
                <NavItem key={item.path} item={item} collapsed={collapsed} />
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>

      {!collapsed && (
        <Box
          sx={{
            p: 1.75,
            borderRadius: 3,
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(18,198,211,0.08)' : 'rgba(18,198,211,0.1)'),
            border: (t) => `1px solid ${alpha(t.palette.secondary.main, 0.25)}`,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.25 }}>
            Phase 1 · UI Preview
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Live data connects in Phase 2.
          </Typography>
        </Box>
      )}
    </Stack>
  );

  if (variant === 'mobile') {
    return (
      <Drawer
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH, border: 'none' } } }}
      >
        {body}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      slotProps={{
        paper: {
          sx: {
            width,
            border: 'none',
            borderRight: (t) => `1px solid ${t.palette.divider}`,
            transition: 'width .2s ease',
            overflowX: 'hidden',
          },
        },
      }}
      sx={{ width, flexShrink: 0, display: { xs: 'none', md: 'block' } }}
    >
      {body}
      <IconButton
        onClick={onToggle}
        size="small"
        sx={{
          position: 'absolute',
          top: 26,
          right: -14,
          width: 28,
          height: 28,
          bgcolor: 'background.paper',
          border: (t) => `1px solid ${t.palette.divider}`,
          '&:hover': { bgcolor: 'background.paper' },
        }}
      >
        <ChevronLeftRoundedIcon
          fontSize="small"
          sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }}
        />
      </IconButton>
    </Drawer>
  );
}

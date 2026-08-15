import { useState } from 'react';
import { Box, IconButton, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Typography, Divider, Stack } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProfileMenu() {
  const [anchor, setAnchor] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const close = () => setAnchor(null);

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.4 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: user.avatarColor, fontSize: '0.8rem', fontWeight: 700 }}>
          {user.initials}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 260, borderRadius: 3, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 42, height: 42, bgcolor: user.avatarColor, fontWeight: 700 }}>
              {user.initials}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {user.role}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            close();
            navigate('/profile');
          }}
        >
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            close();
            navigate('/settings');
          }}
        >
          <ListItemIcon>
            <SettingsRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            close();
            logout();
            navigate('/login');
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

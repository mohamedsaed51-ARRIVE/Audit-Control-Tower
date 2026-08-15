import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  Box,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useNavigate } from 'react-router-dom';
import { flatNavItems } from '../../app/navConfig';
import { branches, operationsCases, auditCases } from '../../data/mockData';

const reportNames = [
  'Daily Operations Summary',
  'Weekly Branch Scorecard',
  'Monthly Audit Report',
  'Missing Shipments Report',
  'Executive KPI Pack',
  'Repeated Case Analysis',
];

const settingsSections = ['Appearance', 'Notifications', 'Regional', 'Danger Zone'];

function ResultGroup({ label, children }) {
  return (
    <>
      <Typography variant="overline" sx={{ px: 2, color: 'text.disabled' }}>{label}</Typography>
      <List dense sx={{ mb: 0.5 }}>{children}</List>
    </>
  );
}

export default function SearchSpotlight({ open, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const results = useMemo(() => {
    if (!query) {
      return { pages: flatNavItems.slice(0, 6), branches: [], shipments: [], audit: [], reports: [], settings: [] };
    }
    const q = query.toLowerCase();
    return {
      pages: flatNavItems.filter((p) => p.label.toLowerCase().includes(q)),
      branches: branches.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 4),
      shipments: operationsCases.filter((c) => c.id.toLowerCase().includes(q) || c.branch.toLowerCase().includes(q)).slice(0, 5),
      audit: auditCases.filter((c) => c.id.toLowerCase().includes(q) || c.branch.toLowerCase().includes(q)).slice(0, 5),
      reports: reportNames.filter((r) => r.toLowerCase().includes(q)).slice(0, 4),
      settings: settingsSections.filter((s) => s.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [query]);

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  const totalResults =
    results.pages.length + results.branches.length + results.shipments.length + results.audit.length + results.reports.length + results.settings.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
    >
      <Box sx={{ p: 1.5, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
        <TextField
          autoFocus
          fullWidth
          variant="standard"
          placeholder="Search shipments, branches, audit cases, reports, settings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { fontSize: '1.05rem', px: 1, py: 0.5 },
            },
          }}
        />
      </Box>
      <Box sx={{ maxHeight: 440, overflowY: 'auto', p: 1 }}>
        {results.pages.length > 0 && (
          <ResultGroup label="Pages">
            {results.pages.map((p) => (
              <ListItemButton key={p.path} onClick={() => goTo(p.path)} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <p.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={p.label} />
              </ListItemButton>
            ))}
          </ResultGroup>
        )}
        {results.branches.length > 0 && (
          <ResultGroup label="Branches">
            {results.branches.map((b) => (
              <ListItemButton key={b.id} onClick={() => goTo('/branches')} sx={{ borderRadius: 2 }}>
                <ListItemText primary={b.name} secondary={`${b.region} · Health ${b.healthScore}`} />
                <Chip size="small" label={`${b.compliance}%`} />
              </ListItemButton>
            ))}
          </ResultGroup>
        )}
        {results.shipments.length > 0 && (
          <ResultGroup label="Shipments">
            {results.shipments.map((c) => (
              <ListItemButton key={c.id} onClick={() => goTo('/operations')} sx={{ borderRadius: 2 }}>
                <ListItemText primary={c.id} secondary={`${c.branch} · ${c.type}`} />
                <Chip size="small" label={c.status} />
              </ListItemButton>
            ))}
          </ResultGroup>
        )}
        {results.audit.length > 0 && (
          <ResultGroup label="Audit Cases">
            {results.audit.map((c) => (
              <ListItemButton key={c.id} onClick={() => goTo('/audit')} sx={{ borderRadius: 2 }}>
                <ListItemText primary={c.id} secondary={`${c.branch} · ${c.auditor}`} />
                <Chip size="small" label={c.status} />
              </ListItemButton>
            ))}
          </ResultGroup>
        )}
        {results.reports.length > 0 && (
          <ResultGroup label="Reports">
            {results.reports.map((r) => (
              <ListItemButton key={r} onClick={() => goTo('/reports')} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <DescriptionRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={r} />
              </ListItemButton>
            ))}
          </ResultGroup>
        )}
        {results.settings.length > 0 && (
          <ResultGroup label="Settings">
            {results.settings.map((s) => (
              <ListItemButton key={s} onClick={() => goTo('/settings')} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <SettingsRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={s} />
              </ListItemButton>
            ))}
          </ResultGroup>
        )}
        {query && totalResults === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            No results for "{query}"
          </Typography>
        )}
      </Box>
    </Dialog>
  );
}

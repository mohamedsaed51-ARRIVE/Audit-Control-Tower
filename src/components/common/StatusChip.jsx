import { Chip } from '@mui/material';

const MAP = {
  // case statuses
  Open: 'info',
  'Pending Branch': 'warning',
  'Awaiting Reply': 'warning',
  'Under Review': 'info',
  Escalated: 'error',
  Closed: 'success',
  Missing: 'error',
  // compliance
  Compliant: 'success',
  'Non-Compliant': 'error',
  Partial: 'warning',
  // priority
  Critical: 'error',
  High: 'warning',
  Medium: 'info',
  Low: 'default',
  // system health
  operational: 'success',
  degraded: 'warning',
  outage: 'error',
};

export default function StatusChip({ label, size = 'small' }) {
  const color = MAP[label] || 'default';
  return (
    <Chip
      size={size}
      label={label}
      color={color === 'default' ? undefined : color}
      variant={color === 'default' ? 'outlined' : 'filled'}
      sx={{
        fontWeight: 600,
        ...(color !== 'default' && {
          bgcolor: (t) => (t.palette.mode === 'dark' ? undefined : `${t.palette[color].main}1A`),
          color: (t) => t.palette[color].main,
        }),
      }}
    />
  );
}

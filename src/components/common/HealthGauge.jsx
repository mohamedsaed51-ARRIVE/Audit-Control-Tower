import { useTheme, Box, Typography, Stack } from '@mui/material';

// Polar-to-cartesian helper for the arc path
function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function HealthGauge({ value = 0, size = 168, label = 'Health Score', sublabel }) {
  const theme = useTheme();
  const sweep = 270; // total gauge sweep in degrees
  const startAngle = 135;
  const endAngle = 405; // 270 degree sweep starting at 135
  const valueAngle = startAngle + (Math.min(100, Math.max(0, value)) / 100) * sweep;

  const r = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const gradId = 'healthGaugeGradient';

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.secondary.main} />
            <stop offset="100%" stopColor={theme.palette.primary.main} />
          </linearGradient>
        </defs>
        <path
          d={arcPath(cx, cy, r, startAngle, endAngle)}
          fill="none"
          stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(11,15,50,0.08)'}
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d={arcPath(cx, cy, r, startAngle, valueAngle)}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={12}
          strokeLinecap="round"
        />
      </svg>
      <Stack
        sx={{ position: 'absolute', inset: 0, textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}
      >
        <Typography variant="h3" sx={{ lineHeight: 1 }}>
          {Math.round(value)}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mt: 0.5 }}>
          {label}
        </Typography>
        {sublabel && (
          <Typography variant="caption" color="text.secondary">
            {sublabel}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

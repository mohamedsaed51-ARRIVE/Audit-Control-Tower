import { useEffect, useRef, useState } from 'react';
import { Card, Box, Typography, Stack, alpha, useTheme } from '@mui/material';
import TrendChip from './TrendChip';

function useCountUp(target, durationMs = 900) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = 0;
    startRef.current = null;
    let raf;
    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min(1, (ts - startRef.current) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

export default function KpiCard({ label, value, suffix = '', icon, color = 'primary', trend, trendValue, decimals = 0, subtitle, dense = false }) {
  const theme = useTheme();
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? animated.toFixed(decimals) : value;
  // `color` may be an MUI palette key ("primary") or a literal hex from the
  // KPI color vocabulary (theme.palette.kpi) — resolve whichever was passed.
  const paletteColor = theme.palette[color]?.main || (typeof color === 'string' && color.startsWith('#') ? color : theme.palette.primary.main);

  return (
    <Card
      sx={{
        p: dense ? 2 : 2.5,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[8] },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 3,
          height: '100%',
          bgcolor: paletteColor,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: alpha(paletteColor, theme.palette.mode === 'dark' ? 0.16 : 0.1),
        }}
      />
      <Stack spacing={dense ? 0.75 : 1.25} sx={{ position: 'relative' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            sx={{
              width: dense ? 34 : 40,
              height: dense ? 34 : 40,
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(paletteColor, 0.14),
              color: paletteColor,
            }}
          >
            {icon}
          </Box>
          {trend && <TrendChip direction={trend} value={trendValue} />}
        </Stack>
        <Typography variant={dense ? 'h5' : 'h4'} sx={{ lineHeight: 1.1 }}>
          {display}
          {suffix}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: dense ? '0.78rem' : undefined }}>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}

import { Chip } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

export default function TrendChip({ direction = 'flat', value, invertColor = false }) {
  const isUp = direction === 'up';
  const isDown = direction === 'down';
  let good = isUp;
  if (invertColor) good = isDown;

  const color = direction === 'flat' ? 'default' : good ? 'success' : 'error';
  const icon = isUp ? <ArrowUpwardRoundedIcon sx={{ fontSize: '14px !important' }} /> : isDown ? <ArrowDownwardRoundedIcon sx={{ fontSize: '14px !important' }} /> : <RemoveRoundedIcon sx={{ fontSize: '14px !important' }} />;

  return (
    <Chip
      size="small"
      icon={icon}
      label={value !== undefined ? `${value}%` : direction}
      color={color}
      variant={color === 'default' ? 'outlined' : 'filled'}
      sx={{
        height: 24,
        fontSize: '0.7rem',
        '& .MuiChip-icon': { ml: '6px' },
        ...(color !== 'default' && {
          bgcolor: (t) => (t.palette.mode === 'dark' ? undefined : `${t.palette[color].main}1A`),
          color: (t) => t.palette[color].main,
        }),
      }}
    />
  );
}

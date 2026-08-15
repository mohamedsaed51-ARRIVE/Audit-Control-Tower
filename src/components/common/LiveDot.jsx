import { Box, keyframes } from '@mui/material';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(18,198,211,0.55); }
  70% { box-shadow: 0 0 0 8px rgba(18,198,211,0); }
  100% { box-shadow: 0 0 0 0 rgba(18,198,211,0); }
`;

export default function LiveDot({ color = '#12C6D3', size = 8 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        animation: `${pulse} 2s infinite`,
      }}
    />
  );
}

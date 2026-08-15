import { Card, Stack, Typography, Box } from '@mui/material';

export default function SectionCard({ title, subtitle, action, children, sx, noPadding = false }) {
  return (
    <Card sx={{ p: noPadding ? 0 : 2.5, height: '100%', ...sx }}>
      {(title || action) && (
        <Stack
          direction="row"
          sx={{ mb: 2, px: noPadding ? 2.5 : 0, pt: noPadding ? 2.5 : 0, justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Box>
            {title && (typeof title === 'string' ? <Typography variant="h6">{title}</Typography> : title)}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
      )}
      {children}
    </Card>
  );
}

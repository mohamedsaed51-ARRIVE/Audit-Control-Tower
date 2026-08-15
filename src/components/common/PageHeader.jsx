import { Box, Stack, Typography, Breadcrumbs, Link as MLink } from '@mui/material';
import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, crumbs = [], actions }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ mb: 3, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
    >
      <Box>
        {crumbs.length > 0 && (
          <Breadcrumbs sx={{ mb: 0.5, fontSize: '0.8rem' }}>
            {crumbs.map((c, i) =>
              c.to ? (
                <MLink key={i} component={Link} to={c.to} underline="hover" color="text.secondary" fontSize="0.8rem">
                  {c.label}
                </MLink>
              ) : (
                <Typography key={i} fontSize="0.8rem" color="text.secondary">
                  {c.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}
        <Typography variant="h4">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Stack>
  );
}

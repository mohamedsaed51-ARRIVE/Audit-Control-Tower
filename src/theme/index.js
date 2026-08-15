import { createTheme, alpha } from '@mui/material/styles';
import { brand, semantic, neutrals, fonts } from './tokens';

export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_WIDTH_COLLAPSED = 80;
export const TOPBAR_HEIGHT = 68;

export function buildTheme(mode) {
  const isDark = mode === 'dark';

  const background = isDark
    ? { default: neutrals.slate950, paper: neutrals.slate900, canvas: '#0D1226' }
    : { default: neutrals.slate50, paper: neutrals.white, canvas: '#F3F5FB' };

  const text = isDark
    ? { primary: '#F3F5FC', secondary: neutrals.slate300, disabled: neutrals.slate600 }
    : { primary: neutrals.slate900, secondary: neutrals.slate500, disabled: neutrals.slate300 };

  const divider = isDark ? alpha('#8891B8', 0.14) : alpha(neutrals.slate500, 0.14);

  let theme = createTheme({
    palette: {
      mode,
      primary: { main: brand.navy600, light: brand.navy400, dark: brand.navy800, contrastText: '#fff' },
      secondary: { main: brand.cyan500, light: brand.cyan300, dark: brand.cyan700, contrastText: '#04222A' },
      success: { main: semantic.success, light: semantic.successBg },
      warning: { main: semantic.warning, light: semantic.warningBg },
      error: { main: semantic.critical, light: semantic.criticalBg },
      info: { main: semantic.info, light: semantic.infoBg },
      background,
      text,
      divider,
      brand,
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: fonts.body,
      h1: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: -0.5 },
      h2: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: -0.5 },
      h3: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: -0.3 },
      h4: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: -0.3, fontSize: '1.75rem' },
      h5: { fontFamily: fonts.display, fontWeight: 700, fontSize: '1.25rem' },
      h6: { fontFamily: fonts.display, fontWeight: 600, fontSize: '1.05rem' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
      body2: { fontSize: '0.875rem' },
      caption: { fontSize: '0.75rem' },
      button: { fontWeight: 600, textTransform: 'none' },
      overline: { fontWeight: 700, letterSpacing: 1.2 },
    },
    shadows: isDark
      ? Array(25).fill('none').map((_, i) =>
          i === 0
            ? 'none'
            : `0 ${Math.min(2 + i, 24)}px ${Math.min(6 + i * 2, 48)}px rgba(0,0,0,${Math.min(0.28 + i * 0.01, 0.55)})`
        )
      : Array(25).fill('none').map((_, i) =>
          i === 0
            ? 'none'
            : `0 ${Math.min(2 + i, 20)}px ${Math.min(8 + i * 2, 40)}px rgba(15,30,90,${Math.min(0.05 + i * 0.004, 0.16)})`
        ),
  });

  theme = createTheme(theme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: theme.palette.background.canvas,
          },
          '::selection': {
            backgroundColor: alpha(brand.cyan400, 0.35),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 16 },
          containedPrimary: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
        defaultProps: { disableElevation: true },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: '0.72rem',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: theme.palette.text.secondary,
            backgroundColor: isDark ? neutrals.slate900 : neutrals.slate50,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? neutrals.slate700 : neutrals.slate900,
            fontSize: '0.75rem',
            borderRadius: 8,
            padding: '6px 10px',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 6, height: 6 } },
      },
    },
  });

  return theme;
}

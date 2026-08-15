// ==========================================================================
// ARRIVE Control Tower — Design Tokens
// Palette derived from brand mark: deep navy field + cyan locator pin.
// Every color below is a deliberate derivation of those two source hues,
// not a stock MUI swatch.
// ==========================================================================

export const brand = {
  navy900: '#050E33', // darkest ink — dark-mode canvas
  navy800: '#0A1B5C',
  navy700: '#0F2680', // = logo navy, deepened
  navy600: '#12309C', // = logo navy field #07269B, tuned for AA contrast
  navy500: '#1B3FBF',
  navy400: '#3A5CDB',
  navy300: '#7C93EA',
  navy100: '#E8ECFB',
  navy50: '#F4F6FD',

  cyan700: '#007580',
  cyan600: '#00939F',
  cyan500: '#00ADBB', // = logo pin, deepened slightly for UI legibility
  cyan400: '#12C6D3', // = logo pin true tone
  cyan300: '#5FE0EA',
  cyan100: '#D6F7FA',
  cyan50: '#EEFCFD',
};

export const semantic = {
  success: '#1AA971',
  successBg: '#E5F7EF',
  warning: '#E8A317',
  warningBg: '#FDF3DE',
  critical: '#E0473F',
  criticalBg: '#FCE9E7',
  info: brand.cyan500,
  infoBg: brand.cyan50,
  neutral: '#6B7590',
  neutralBg: '#F1F2F7',
};

// One unmistakable color per operational KPI type — never reused, never an
// adjacent shade of another metric's hue. This is the color vocabulary the
// whole platform uses to talk about shipment/case state.
export const kpiColor = {
  shipments: brand.navy600, // Today's Shipments — brand navy (the baseline metric)
  open: '#2065D1', // Open — blue
  missing: '#E8720C', // Missing — orange
  repeated: '#7C4DFF', // Repeated — purple
  critical: '#E0473F', // Critical — red
  closed: '#1AA971', // Closed — green
  sla: brand.cyan600, // SLA — cyan
  compliance: '#0E8F7A', // Compliance — teal
  health: brand.navy500, // Health Score — deep blue
};

export const neutrals = {
  slate950: '#0B0F1E',
  slate900: '#11162A',
  slate850: '#161C33',
  slate800: '#1D2440',
  slate700: '#2A3358',
  slate600: '#48517A',
  slate500: '#6B7590',
  slate400: '#9198B5',
  slate300: '#B9BFD6',
  slate200: '#DCE0EE',
  slate100: '#EEF0F8',
  slate50: '#F7F8FC',
  white: '#FFFFFF',
};

// Health-score gradient stops (used by the radial gauge signature element)
export const healthGradient = [brand.cyan400, brand.navy500];

export const chartPalette = [
  brand.navy600,
  brand.cyan400,
  semantic.success,
  semantic.warning,
  brand.navy300,
  semantic.critical,
  brand.cyan700,
  neutrals.slate500,
];

export const fonts = {
  display: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
};

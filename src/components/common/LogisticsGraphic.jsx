import { Box } from '@mui/material';

// Original abstract illustration: a dotted shipment route across a stylised
// map grid, with location pins at waypoints — the login screen's one
// deliberate visual flourish, echoing the ARRIVE pin mark.
export default function LogisticsGraphic() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        opacity: 0.9,
        pointerEvents: 'none',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 520 700" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="520" height="700" fill="url(#grid)" />

        {/* route path */}
        <path
          d="M 40 560 C 140 520, 120 420, 210 400 S 300 320, 320 240 S 420 160, 470 90"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2.5"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />

        {/* waypoint pins */}
        {[
          { x: 40, y: 560, r: 5 },
          { x: 210, y: 400, r: 5 },
          { x: 320, y: 240, r: 5 },
        ].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="rgba(255,255,255,0.55)" />
        ))}

        {/* destination pin (larger, brand cyan) */}
        <g transform="translate(470, 90)">
          <circle cx="0" cy="0" r="22" fill="rgba(18,198,211,0.18)" />
          <path
            d="M0 -14 C7.2 -14 13 -8.2 13 -1 C13 8.6 0 20 0 20 C0 20 -13 8.6 -13 -1 C-13 -8.2 -7.2 -14 0 -14 Z"
            fill="#12C6D3"
          />
          <circle cx="0" cy="-1" r="4.4" fill="#0A1B5C" />
        </g>

        {/* scattered secondary nodes for depth */}
        <circle cx="90" cy="130" r="2.5" fill="rgba(255,255,255,0.3)" />
        <circle cx="150" cy="90" r="2.5" fill="rgba(255,255,255,0.3)" />
        <circle cx="60" cy="260" r="2.5" fill="rgba(255,255,255,0.3)" />
        <circle cx="420" cy="470" r="2.5" fill="rgba(255,255,255,0.3)" />
        <circle cx="380" cy="560" r="2.5" fill="rgba(255,255,255,0.3)" />
      </svg>
    </Box>
  );
}

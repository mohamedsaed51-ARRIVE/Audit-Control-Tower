# ARRIVE Control Tower

Enterprise operations command center for ARRIVE Express — a React dashboard for shipment auditing, branch performance, KPIs, and operations monitoring, backed by a Google Apps Script automation layer on top of Google Sheets.

## Project Structure

```
├── src/                      # React frontend (Vite)
│   ├── app/                  # App shell, routing, nav config, protected routes
│   ├── components/
│   │   ├── common/           # Shared UI: cards, tables, gauges, chips, headers
│   │   └── navigation/       # Sidebar, top bar, profile/notifications menus
│   ├── context/               # Auth and color-mode (theme) React contexts
│   ├── data/                  # Mock data used by the dashboard views
│   ├── layouts/                # Auth layout and dashboard shell layout
│   ├── pages/                  # Route-level views (Dashboard, Audit, KPI, Reports, ...)
│   └── theme/                  # MUI theme tokens and theme factory
│
├── Config.js                 # Apps Script: sheet names, column names, status constants
├── Utils.js                  # Apps Script: shared spreadsheet helpers (Utils object)
├── Init.js / Menu.js         # Apps Script: onOpen trigger + custom spreadsheet menu
├── Import.js                 # Apps Script: import branch replies into the day sheet
├── OpenCases.js / Missing.js / Repeated.js / History.js
│                              # Apps Script: build the corresponding report sheets
├── KPI.js                    # Apps Script: computes and writes KPI figures
├── Dashboard.js / AuditActions.js
│                              # Apps Script: reserved/placeholder entry points (see notes below)
├── Backup.js                 # Apps Script: legacy/manual test utilities (not wired into the menu)
└── appsscript.json / .clasp.json  # Apps Script project + clasp deployment config
```

## Frontend — Getting Started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run lint      # oxlint
npm run preview   # preview a production build
```

The frontend currently renders from `src/data/mockData.js`. There is no live API layer wired up yet — connecting the dashboard to the Apps Script backend (or a proper API) is a future integration step.

## Backend — Google Apps Script

The `.js` files at the project root are Google Apps Script source files (managed via `clasp`, see `.clasp.json`), bound to the ARRIVE Audit Management System spreadsheet. `Menu.js` builds the in-sheet "AAMS" menu, which drives the daily workflow: import replies → rebuild Open Cases / Missing / Repeated / History → rebuild KPIs.

See `CHANGELOG.md` and the accompanying architecture review for a full breakdown of current findings and recommendations.

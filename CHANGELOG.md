# Cleanup Changelog — Enterprise Prep Pass

Scope: safe cleanup only. No business logic, UI, or feature changes.

## Removed

- **`arrive-control-tower-v2.zip`** (root, ~201 KB)
  Stray backup archive of an older `src/` snapshot, committed by accident. Not referenced by any build step, import, or Apps Script file. Confirmed unused before removal.

- **`Utils.clear(sheet)`** method in `Utils.js`
  Dead utility function — defined but never called anywhere in the project (verified via full-repo search). Every place that needed to clear a sheet's contents does it inline instead. Removing it does not affect any call site.

## Added

- **`.gitignore`**: added `*.zip` so stray archives like the one above don't get committed again.
- **`README.md`**: replaced the default Vite template README with real project documentation — folder structure, frontend setup/scripts, and an overview of the Apps Script backend.
- **`CHANGELOG.md`** (this file).

## Explicitly NOT changed

Everything below was identified during review but intentionally left untouched because it's either still in use, ambiguous, or would require a judgment call about intended behavior — see the architecture review report for details and recommendations:

- `Dashboard.js`, `AuditActions.js` — empty placeholder Apps Script files
- `Backup.js` — legacy/manual test functions, not wired into the menu but not proven dead beyond doubt (could be run ad hoc from the Apps Script editor)
- Menu items `"createTodaySheet"` and `"refreshDashboard"` in `Menu.js` — reference functions that don't exist anywhere in the project
- Single large JS bundle (no code-splitting) on the frontend
- No API layer — frontend runs entirely on mock data
- `react/only-export-components` fast-refresh warnings in `AuthContext.jsx` / `ColorModeContext.jsx`

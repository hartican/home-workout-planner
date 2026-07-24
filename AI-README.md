# Do Less AI Notes

Jack's low-admin movement PWA. Keep it simple: plain `coach.html`, static assets,
`localStorage`, no build step, no auth, no backend, and no cloud sync.

## Project Shape

- Main app: `coach.html`.
- State/profile migration seam: `coach-state-core.js`.
- Exercise prescription/logging seam: `coach-prescription-core.js`.
- Regression tests: `tests/*.test.js` using Node's built-in test runner.
- Canonical spec: `Planning/coach-app-spec.md`.
- Do Less marketing copy SSOT: `context/marketing-site-hero-copy.md`.
- PWA files: `manifest.json`, `sw.js`, `version.json`, `assets/icon-180.png`.
- Static hosting: Vercel or equivalent. Keep rewrites in `vercel.json` from `/`,
  `/app.html`, and `/home-workout-planner.html` to `/coach.html`.

## Rules

- Every deploy-facing change must bump `version.json` and `CACHE_NAME` in
  `sw.js` together using the same UTC timestamp.
- Use `context/marketing-site-hero-copy.md` as the single source of truth for
  all Do Less marketing materials. Update it first when the positioning changes, then
  keep app copy aligned without replacing clear operational labels.
- Do not add auth, remote persistence, package-manager tooling, or a build step
  unless explicitly requested.
- Keep app data local to the browser. Backup/restore should use JSON export and
  import from Settings.
- Keep generated prescription values as hard minimums. User-entered rep, time,
  and load adjustments may only increase them, and completed logs must retain
  both generated and completed values.
- Run `node --test tests/*.test.js` after persistence or prescription changes.
- Verify mobile layout around 390px width for user-facing changes.
- Verify service-worker precache paths exist before shipping.
- Report outcomes in plain language.

## Current Direction

- Standalone mobile-first browser app, intended for home-screen use.
- Reliable, shareable static deployment without an install package.
- Local-only ownership: export backup, import backup, and reset Do Less data.
- Do Less quality priorities: visible check-in impact, plain-language session
  rationale, safe home-training prescriptions, and fallback sessions counting
  fully toward streaks.

# Coach

Mobile-first workout coach app built from `coach-app-spec.md`. Single-file SPA, no build step, localStorage persistence.

Files:
- coach.html — the Coach app (Today / Plan / Library / Streak), served at the site root
- coach-app-spec.md — product spec the app implements
- coach-classic.html — the original static planner, still available at its own URL
- assets/ — app icons (💪🏿 PNGs + legacy SVG)
- manifest.json — PWA manifest (add to home screen)
- sw.js / version.json — service worker cache + deploy versioning

App features:
- 3-question check-in (mood, energy, what to train) that builds the one circuit you need, shaped by the current global goal
- Quick start: a random session within your tolerances, pointed at the goal, with a reshuffle option
- Global goal, changeable on the Plan tab (visible abs / anterior & posterior chain / upper body)
- Technique library tab: every exercise, filterable by category, tap to expand a brief explainer with its technique video
- Session generator: standard / momentum-reset / travel / harder-day modes, block-based, with exercise variant rotation and phase-aware targets
- 8-week progression map with key-lift tracking (push-up, goblet squat, reverse lunge, plank, glute bridge)
- Streak mechanic — any completed session counts, fallback included
- Evening "beer check" prompt suggesting an 8-minute reset before alcohol
- Time-of-day behavior: lighter pre-breakfast sessions, dark theme in the evening

Background signals (optional): the app reads `localStorage["hwc_signals"]`
(`{"dateISO":"YYYY-MM-DD","steps":1234,"alcoholUnits":0}`) to bias session
suggestions. Feed it from a phone automation (e.g. an iOS Shortcut); nothing
is logged manually in the app.

Old URLs (`/app.html`, `/home-workout-planner.html`) are rewritten to the new
file names, so existing links and installed apps keep working.

Usage: open the deployed root URL on a phone and add to home screen.

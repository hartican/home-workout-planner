# Do Less pipeline improvements not covered by the 24 July Codex task spec

Compared:

- `planning-coach/do-less-codex-task-spec-24-JUL.md`
- `planning-coach/PIPELINE-do-less-improvements.md`

The task spec already includes or explicitly defers the timer and session flow, swapping and randomisation, exercise preferences, environment-aware planning, logging, progression, Settings refactor, profile and avatar work, key lifts, expanded goals, full bio modelling, the sport configurator, and the algorithm builder.

Only the following pipeline work is not included in that spec.

## 1. Clean up profile persistence

Audit and repair profile persistence across save, reload, backup import, schema migration, and reset. Define which profile values are authoritative, ensure partial legacy profiles merge safely with new defaults, and add regression coverage so newly introduced fields do not disappear or revive removed fields.

**Implemented 24 July 2026.** The authoritative profile is now limited to name, username, avatar, height, age, sex, weight, and fitness level. Reload and backup import share the same versioned migration path; reset uses the same canonical defaults. Regression tests cover partial legacy profiles, retired fields, nested backup merging, reset, and JSON round-trips.

## 2. Upwards-only weight and rep adjustment

Add in-session controls that let users increase prescribed weight or reps without reducing them below the generated target. Store the actual adjusted prescription with the completed exercise log and define sensible increments for bodyweight reps, timed holds, and loaded lifts.

**Implemented 24 July 2026.** In-session controls use +1 rep, +5 seconds for holds, +15 seconds for minute-plus work, and +2.5 kg for loaded lifts. The minus control can only reverse user-added increases and is disabled at the generated minimum. Completed logs retain both the generated and completed prescription.

## 3. Clarify the unresolved load-tracking note

The source pipeline says a note may refer to load tracking, but the shorthand is unclear. Recover or clarify the intended requirement before implementation, then decide whether it belongs with upwards-only adjustments, completed-exercise logging, or Key lifts.

**Resolved 24 July 2026.** Load tracking belongs across all three connected surfaces: users raise prescribed load in-session, the completed exercise stores prescribed and completed load, and Key-lift suggestions use those completed load values. There is no separate free-form load note or algorithm-builder change in this implementation.

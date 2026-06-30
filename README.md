# OpenEyeSim (EyeGenius5)

A real-time, browser-based 3-D ophthalmic surgical simulator built with React, Three.js (`@react-three/fiber`), and a TanStack Start app shell. It models a draped, speculum-fixed surgical eye under a microscope, with a guided 7-step cataract curriculum, AI-driven coaching feedback, instrument biomechanics, and live scoring.

**Live deployment:** https://eyegenius5.lovable.app

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
- [User Manual](#user-manual)
  - [1. First Launch](#1-first-launch)
  - [2. The Operative Field](#2-the-operative-field)
  - [3. Modes](#3-modes)
  - [4. Performing a Procedure](#4-performing-a-procedure)
  - [5. Instruments](#5-instruments)
  - [6. The Cataract Curriculum (7 Steps)](#6-the-cataract-curriculum-7-steps)
  - [7. Eye Fixation](#7-eye-fixation)
  - [8. The Microscope Panel](#8-the-microscope-panel)
  - [9. Scoring & AI Coach](#9-scoring--ai-coach)
  - [10. Keyboard Shortcuts](#10-keyboard-shortcuts)
  - [11. Mouse & Touch Controls](#11-mouse--touch-controls)
  - [12. HUD Panels Reference](#12-hud-panels-reference)
  - [13. Glossary](#13-glossary)
  - [14. Replay & Analytics](#14-replay--analytics)
  - [15. Troubleshooting](#15-troubleshooting)
- [Contributing](#contributing)

---

## Quick Start

```bash
npm install
npm run dev       # local dev server
npm run build     # production build (outputs to .output/)
```

Requires Node.js 18+ and npm. The app is a TanStack Start project with server-side rendering; `npm run build` produces a deployable Nitro bundle.

---

## Project Structure

```
src/
  routes/                  TanStack Start route tree (app shell, error boundaries)
  eyeball/                 The simulator itself — all surgical app code lives here
    App.tsx                Root simulator component (canvas + HUD composition)
    components/
      eyeball/              3-D anatomy: Sclera, Cornea, Iris, Lens, SurgicalField, etc.
      scene/                 Scene composition, lighting, click handling
      needle/                Instrument tip geometry, depth ruler
      trajectory/             RCM/entry-point indicators, safety cone, annotations
      hud/                    All 2-D UI panels (Instrument, Microscope, Curriculum, etc.)
    stores/                 Zustand state — one slice per concern (rcm, needle, fluidics,
                             curriculum, scoring, microscope, fixation, ui, etc.), composed
                             into a single useSimulationStore
    hooks/                  Per-frame and lifecycle logic (useBiomechanics, useFluidics,
                             useCurriculum, useMouseControl, useKeyboardShortcuts, ...)
    lib/                    Pure geometry/math helpers (rcm.ts, phaseMachine.ts, transforms.ts)
    constants/              Scene scale constants, color palette, terminology dictionary
packages/                  Independently-versioned "engine" packages consumed by the app:
  anatomy-engine/           Lens/capsule/cortex/nucleus geometry data
  physics-engine/           Biomechanics, tissue deformation, collision detection
  fluid-engine/              Chamber pressure/volume/stability simulation
  instrument-engine/         Instrument pose computation, RCM constraint math
  microscope-engine/         Coaxial light, red-reflex, zoom/focus simulation
  curriculum/                 Step-by-step validation logic for guided procedures
  replay-engine/              Session recording/playback
```

---

## Architecture Notes

- **State**: a single composed Zustand store (`simulationStore.ts`) built from per-concern slices. Each slice owns one area of state (RCM/entry point, needle pose, instrument selection, fluidics, curriculum progress, scoring, microscope settings, eye fixation, UI visibility, etc.).
- **Naming**: the codebase originated from a robotics/teleoperation prototype. Internal state values still use that vocabulary (`VIEW`/`PLACE`/`EDIT`/`REPLAY` modes, "RCM" = Remote Center of Motion, "Kinematics", "Tilt Alpha/Beta"). These are **not** renamed in code — they're wired through 40+ files. Instead, every string a user actually sees is routed through `src/eyeball/constants/terminology.ts`, which translates robotics terms into surgical language (e.g. RCM → "Entry Point", EDIT mode → "Operate"). When changing user-facing wording, edit that file — never hardcode robotics terms directly into component JSX.
- **Per-frame logic**: anything that needs to run every render frame (instrument pose sync, biomechanics collision checks, fluidics updates, curriculum re-validation) lives in a `use*` hook called once from `Scene.tsx`, using `useFrame` from `@react-three/fiber`.
- **Procedural textures**: anatomy surfaces (sclera vessels, iris fibers, periocular skin, surgical drape fabric) are generated with seeded `<canvas>` 2-D drawing rather than image assets, so they're deterministic, lightweight, and easy to art-direct in code. See `Sclera.tsx`, `Cornea.tsx`, `SurgicalField.tsx` for the pattern.

---

## User Manual

### 1. First Launch

On first visit, a 4-page onboarding overlay walks through: what the simulator is, how to place the entry point, instrument controls, and how to start the guided curriculum. It only appears once (tracked in `localStorage`) — to see it again, clear the `openeyesim-onboarded-v1` key in your browser's local storage, or use a private/incognito window.

If you skip or dismiss onboarding, an always-visible instruction pill at the top-center of the screen ("Step Guide") tells you what to do at every stage, and a bottom-left status bar shows the current Phase and Mode at all times.

### 2. The Operative Field

The simulator shows a draped, speculum-fixed eye exactly as it would appear under a surgical microscope:

- **The globe** — sclera, cornea, iris, pupil, and lens, rendered with anatomically informed procedural materials (natural iris fiber/crypt/collarette detail, a corneal catchlight reflection, a visible capsular reflex on the lens).
- **Periocular skin** — the strip of skin and lid margin visible at the fissure, including lash stubble and the medial canthus (correctly mirrored for OD/right-eye vs OS/left-eye cases).
- **Lid speculum** — a wire eyelid retractor holding the lids open, as in a real case.
- **Surgical drape** — sterile fenestrated fabric covering the rest of the field, with an adhesive aperture border and iodine-prep tint near the opening.
- **Red reflex** — raise the coaxial light intensity in the Microscope panel to see the fundal glow through the dilated pupil, just as a real surgeon uses it to judge capsule visibility.

The pupil is shown already pharmacologically dilated (mydriasis), since by the time a real eye is draped and speculum-fixed, dilating drops have already taken full effect.

### 3. Modes

The simulator has four modes, switchable via the Mode panel or keyboard:

| Mode | Display name | What it does |
|---|---|---|
| `VIEW` | **Observe** | Free camera orbit. No entry point placed yet. |
| `PLACE` | **Mark Entry** | Click anywhere on the eye surface to set the instrument entry point. |
| `EDIT` | **Operate** | Active instrument manipulation (drag to swing/insert, scroll for depth). Requires an entry point. |
| `REPLAY` | **Playback** | Step through a recorded trajectory. Requires a prior recorded trail. |

Once an entry point is placed, the camera automatically locks (see [Eye Fixation](#7-eye-fixation)) to prevent accidental rotation while operating.

### 4. Performing a Procedure

1. Select a procedure from the **Procedure** panel: Cataract Surgery, Vitreoretinal Surgery, Glaucoma Surgery, or Corneal Surgery. (Cataract is currently the only one with a full guided curriculum; the others are free-practice instrument sandboxes.)
2. Press **P** (or use the Mode panel) to enter Mark Entry mode, then click the sclera/limbus to set your entry point.
3. The simulator switches to **Operate** mode automatically. Select an instrument from the Instrument panel.
4. Drag to swing the instrument and adjust insertion; scroll for fine depth control.
5. For the guided cataract curriculum, open **☰ Help → Cataract Curriculum** and click **Start Procedure** — the simulator will validate each step as you work and tell you when you can advance.

### 5. Instruments

Available instruments (filtered automatically to those relevant for the selected procedure):

| Instrument | Used for |
|---|---|
| Keratome | Corneal incision |
| Capsulorhexis Forceps | Anterior capsule tear (CCC) |
| Hydrodissection Cannula | Separating cortex from capsule; wound hydration |
| Phaco Tip | Ultrasonic nucleus fragmentation/aspiration |
| Irrigation/Aspiration (I/A) | Cortex removal |
| IOL Injector | Intraocular lens delivery |
| Vitrector | Vitreous removal (vitreoretinal procedures) |
| Endolaser | Retinal laser (vitreoretinal procedures) |
| Micro Forceps | Membrane peeling (vitreoretinal procedures) |

### 6. The Cataract Curriculum (7 Steps)

Each step shows its instruction directly in the top-center Step Guide pill, and validates automatically as you move the selected instrument:

1. **Incision** — Insert the Keratome 2.5–4 mm at a shallow angle into the limbal zone.
2. **Capsulorhexis** — Advance the Capsulorhexis Forceps 1.5–4.5 mm into the anterior chamber at a low approach angle to perform a continuous curvilinear tear. A pulsing yellow guide ring shows the ideal CCC zone on the anterior capsule.
3. **Hydrodissection** — Insert the Hydro Cannula 1–3 mm under the capsule edge and inject a gentle fluid wave to free the lens.
4. **Phacoemulsification** — Advance the Phaco Tip 5–8 mm into the nucleus while watching chamber stability in the Fluidics readout.
5. **Cortex Removal** — Use I/A to aspirate remaining cortex; keep vacuum under ~280 mmHg and chamber stability above ~70%.
6. **IOL Insertion** — Advance the IOL Injector 0.5–3.5 mm through the incision, delivering the lens slowly into the capsular bag.
7. **Wound Hydration** — Hydrate the incision with the cannula to seal the wound and confirm watertight closure.

If validation doesn't auto-trigger after you move the instrument, use the **↻ Validate current step** button in the Curriculum panel to force a re-check. Complications (e.g. posterior capsule rupture, zonular dialysis) can be triggered by deviating from the safe technique described in each step — these affect your score and generate AI coaching feedback.

### 7. Eye Fixation

A 🔒/🔓 pill appears in the bottom-left status bar once an entry point exists:

- **🔒 Fixed** (default) — the eye is treated as speculum-locked; camera orbit is disabled so you can't accidentally rotate the globe while manipulating instruments.
- **🔓 Unlocked** — click the pill to free the camera for inspection/repositioning, then click again to re-lock before continuing surgery.

### 8. The Microscope Panel

Controls the simulated operating microscope: zoom, focus, and coaxial light intensity. Raising coaxial intensity increases the red-reflex glow visible through the pupil — useful both for realism and for judging capsule visibility during capsulorhexis.

### 9. Scoring & AI Coach

The **Score & AI Coach** panel (in the sidebar, collapsed by default) shows live scoring based on technique accuracy, complications, and curriculum step completion, along with generated coaching feedback explaining what went well or what to adjust.

### 10. Keyboard Shortcuts

| Key | Action |
|---|---|
| `V` | Switch to Observe (VIEW) mode |
| `P` | Switch to Mark Entry (PLACE) mode |
| `E` | Switch to Operate (EDIT) mode — requires entry point |
| `R` | Switch to Playback (REPLAY) mode — requires a recorded trail |
| `↑` / `↓` | Insert / withdraw instrument 0.5 mm (Operate mode only) |
| `←` / `→` | Rotate instrument azimuth (Operate mode only) |
| `1` `2` `3` `4` | Preset approach angles: 0° / 15° / 30° / 45° (Operate mode only) |
| `Esc` | Reset simulation to initial state |
| `C` | Clear instrument trails |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` | Redo |

Key bindings are configurable in the Controls panel if you prefer different keys.

### 11. Mouse & Touch Controls

- **Observe / Playback mode**: standard orbit — drag to rotate the camera, scroll to zoom (disabled once the eye is fixation-locked; see [§7](#7-eye-fixation)).
- **Mark Entry mode**: click the eye surface to place the entry point; drag an existing point to move it.
- **Operate mode**: drag left/right to swing the instrument azimuth, drag up/down to insert/withdraw, scroll wheel for fine depth control. Touch devices support pinch-to-zoom.

### 12. HUD Panels Reference

| Panel | Contents |
|---|---|
| Procedure | Choose Cataract / Retina / Glaucoma / Cornea |
| Instrument | Select the active instrument for the current procedure |
| Mode | Switch VIEW/PLACE/EDIT/REPLAY |
| Microscope | Zoom, focus, coaxial light intensity |
| Instrument Telemetry | Live pose readout (approach angle, swing angle, insertion depth) |
| Cataract Curriculum | Step instructions, validation status, Start/Advance/Validate controls |
| Controls | Key binding configuration |
| Entry Points | List of placed entry points (multi-incision procedures) |
| Score & AI Coach | Live scoring + generated feedback |
| Glossary | Searchable ophthalmic terminology reference (see [§13](#13-glossary)) |

On narrow viewports, panels collapse into a scrollable bottom drawer; on desktop/tablet, side columns scroll independently if more panels are open than fit on screen.

### 13. Glossary

Open **☰ Help → Glossary** for a categorized reference of ~37 terms (Anatomy, Procedure, Instrument, Fluidics, Complication) covering everything from "Limbus" to "Posterior Capsule Rupture" — useful as a quick refresher while working through the curriculum.

### 14. Replay & Analytics

Every operate-mode session records a trajectory. Switch to **Playback (REPLAY)** mode (requires `R`, or via Mode panel, once a trail exists) to step through the recorded instrument path with adjustable playback speed via the Controls panel.

### 15. Troubleshooting

- **Curriculum step won't advance**: move the correct instrument to the depth/angle described in the Step Guide pill, then press **↻ Validate current step** in the Curriculum panel.
- **Camera won't rotate**: check the fixation lock — click 🔓 in the bottom-left status bar to unlock orbit.
- **HUD panel missing / cut off**: panels scroll independently when more are open than fit the viewport — scroll within the panel column, or collapse panels you're not using.
- **3-D scene fails to load / blank canvas**: this can occur if a network-dependent texture/HDRI asset fails to fetch in a sandboxed environment. Refresh; if it persists, check the browser console for the specific failed request.

---

## Contributing

This is a working clinical-education tool under active development by a solo maintainer. Issues and PRs should include: a clear description of the surgical or technical inaccuracy being addressed, and (for visual changes) a screenshot or description of the before/after. Type-check (`tsc --noEmit`) and a production build (`npm run build`) should both pass cleanly before submitting changes.

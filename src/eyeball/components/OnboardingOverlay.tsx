import { useState, type ReactNode } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

export const STORAGE_KEY = 'openeyesim-onboarded-v3';

// ─── Surgery data ────────────────────────────────────────────────────────────

type SurgeryId = 'cataract' | 'retina' | 'glaucoma' | 'cornea';

interface SurgeryStep {
  num: string;
  title: string;
  icon: string;
  action: string;
  tip: string;
}

interface SurgeryInfo {
  id: SurgeryId;
  name: string;
  subtitle: string;
  accent: string;          // Tailwind colour token (text-*)
  border: string;          // Tailwind colour token (border-*)
  bg: string;              // Tailwind colour token (bg-*)
  badge: string;           // coloured pill on the card
  emoji: string;
  tagline: string;
  curriculum: boolean;
  steps: SurgeryStep[];
}

const SURGERIES: SurgeryInfo[] = [
  {
    id: 'cataract',
    name: 'Cataract Surgery',
    subtitle: 'Phacoemulsification + IOL Implantation',
    accent: 'text-blue-400',
    border: 'border-blue-500/50',
    bg: 'bg-blue-600',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    emoji: '🔵',
    tagline: 'Full 7-step guided curriculum with live scoring',
    curriculum: true,
    steps: [
      {
        num: 'Setup',
        title: "You're ready to go",
        icon: '📍',
        action: "When you finish this walkthrough, you'll land in Mark Entry mode with the Cataract Curriculum already started — just click the eye surface near the limbus (3 o'clock position for a right eye) to place your entry point. A green marker locks the keratome entry, and the eye fixates automatically.",
        tip: 'Open the ☰ Help button any time to see all panels, replay this intro, or switch procedures.',
      },
      {
        num: 'Place',
        title: 'Mark the entry point',
        icon: '📍',
        action: 'Click the eye surface near the limbus (3 o\'clock position for a right eye). A green marker locks the keratome entry. (If you ever need to re-enter Mark Entry mode later, press P.)',
        tip: 'The camera locks once the entry point is marked — you can no longer orbit the eye.',
      },
      {
        num: 'Controls',
        title: 'Instrument controls',
        icon: '🖱️',
        action: 'In Operate mode (auto after marking the entry point): drag ↔ to swing the instrument · drag ↕ to advance / withdraw · scroll wheel for fine depth · keys 1-4 for approach-angle presets (0° 15° 30° 45°).',
        tip: 'Dragging DOWN pushes the needle into the eye. Dragging UP retracts it.',
      },
      {
        num: '1 / 7',
        title: 'Incision — Keratome',
        icon: '🔪',
        action: 'Keratome is pre-selected. Press preset 2 (key 2) for a 15° approach angle, then drag down until depth reaches > 2.5 mm. Click Validate, then Next Step.',
        tip: 'A slight downward angle creates a self-sealing triplanar wound architecture.',
      },
      {
        num: '2 / 7',
        title: 'Capsulorhexis — Forceps',
        icon: '✂️',
        action: 'In the Instrument panel click "Forceps" (auto-switch button in the Curriculum card). Drag to 1.5 – 4.5 mm at a low angle to perform the continuous tear.',
        tip: 'Depth > 4.5 mm risks posterior capsule rupture — stay in the safe zone.',
      },
      {
        num: '3 / 7',
        title: 'Hydrodissection — Hydro Cannula',
        icon: '💧',
        action: 'Switch to Hydro Cannula. Keep the needle in the eye (depth > 0.1 mm). Watch the Chamber Stability bar in the Curriculum panel — once it turns green (≥ 65 %) advance to > 1 mm depth.',
        tip: 'Fluid injected beneath the capsule edge separates the lens cortex and allows free rotation.',
      },
      {
        num: '4 / 7',
        title: 'Phacoemulsification — Phaco Tip',
        icon: '⚡',
        action: 'Switch to Phaco Tip. Drag to 3 – 8 mm (nuclear zone). The stability bar must stay green. Avoid going deeper than 8 mm.',
        tip: 'An unstable chamber during phaco is the leading cause of posterior capsule rupture.',
      },
      {
        num: '5 / 7',
        title: 'Cortex Removal — I/A Handpiece',
        icon: '🔄',
        action: 'Switch to I/A Handpiece. Drag deeper to build vacuum (watch the Vacuum bar → green at > 100 mmHg). Both Stability and Vacuum bars must be green.',
        tip: 'High vacuum on unstable zonules causes zonular dialysis — always stabilise first.',
      },
      {
        num: '6 / 7',
        title: 'IOL Insertion — IOL Injector',
        icon: '🔵',
        action: 'Switch to IOL Injector. Advance to 0.5 – 3.5 mm for a slow, controlled lens delivery into the empty capsular bag.',
        tip: 'Rushing the injection folds the lens unevenly — let it unroll naturally.',
      },
      {
        num: '7 / 7',
        title: 'Wound Hydration — Hydro Cannula',
        icon: '💦',
        action: 'Switch back to Hydro Cannula. Advance to 0.5 – 2.0 mm to inject BSS into the corneal stroma at the wound edges. Validate → Advance → Surgery Complete.',
        tip: 'A watertight wound is essential to prevent post-operative endophthalmitis.',
      },
    ],
  },

  {
    id: 'retina',
    name: 'Vitreoretinal Surgery',
    subtitle: 'PPV · Membrane Peeling · Endolaser',
    accent: 'text-purple-400',
    border: 'border-purple-500/50',
    bg: 'bg-purple-600',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    emoji: '🔴',
    tagline: 'Free-practice instruments — no scored curriculum yet',
    curriculum: false,
    steps: [
      {
        num: 'Setup',
        title: 'Select the procedure',
        icon: '⚙️',
        action: 'Press ☰ Help → Procedure panel → click "Vitreoretinal". The instrument panel will show only PPV instruments: Vitrector, Micro Forceps, Endolaser.',
        tip: 'No step-by-step curriculum for vitreoretinal yet — free practice mode only.',
      },
      {
        num: 'Place',
        title: 'Place pars plana entry',
        icon: '📍',
        action: 'Press P and click the sclera ~3.5 mm posterior to the limbus (the pars plana zone). This is your trocar entry site for all three instruments.',
        tip: 'Three-port vitrectomy normally uses three separate trocar sites. The simulator uses a single entry point.',
      },
      {
        num: 'Step 1',
        title: 'Core vitrectomy — Vitrector',
        icon: '🌀',
        action: 'Select Vitrector. Drag down into the vitreous cavity (4 – 14 mm depth). The cutter removes vitreous gel to create working space.',
        tip: 'Stay well away from the retinal surface — a safe working distance prevents iatrogenic breaks.',
      },
      {
        num: 'Step 2',
        title: 'Membrane peeling — Micro Forceps',
        icon: '🦾',
        action: 'Switch to Micro Forceps. Work at 2 – 5 mm depth near the posterior pole. Gentle, precise rotational movements to peel the epiretinal membrane or ILM.',
        tip: 'ILM peeling requires the highest level of precision in all of vitreoretinal surgery.',
      },
      {
        num: 'Step 3',
        title: 'Photocoagulation — Endolaser',
        icon: '🔴',
        action: 'Switch to Endolaser. Position near retinal breaks or neovascularization (3 – 8 mm depth). Each virtual "burn" creates a chorioretinal adhesion scar.',
        tip: 'Laser burns should surround, not hit, the break itself. Two rows of confluent burns is standard.',
      },
    ],
  },

  {
    id: 'glaucoma',
    name: 'Glaucoma Surgery',
    subtitle: 'Trabeculectomy · Tube Shunt · MIGS',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-600',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    emoji: '💧',
    tagline: 'Free-practice instruments — no scored curriculum yet',
    curriculum: false,
    steps: [
      {
        num: 'Setup',
        title: 'Select the procedure',
        icon: '⚙️',
        action: 'Press ☰ Help → Procedure panel → click "Glaucoma". Instruments available: Keratome (for scleral entry) and Micro Forceps (for suturing and tissue manipulation).',
        tip: 'Glaucoma surgery lowers intra-ocular pressure by creating a new drainage pathway.',
      },
      {
        num: 'Place',
        title: 'Place the scleral entry',
        icon: '📍',
        action: 'Press P and click the superior sclera at the limbus (12 o\'clock). This is the standard trabeculectomy site — superior filtration bleb drains under the upper lid.',
        tip: 'Temporal sites are used for tube shunts when superior conjunctiva is scarred.',
      },
      {
        num: 'Step 1',
        title: 'Scleral flap — Keratome',
        icon: '🔪',
        action: 'Select Keratome. Make a partial-thickness scleral incision (depth 1 – 3 mm). Controlled depth is critical — premature AC entry collapses the chamber.',
        tip: 'A half-thickness scleral flap is the gold standard. Too thin → buttonhole; too thick → poor drainage.',
      },
      {
        num: 'Step 2',
        title: 'Suturing — Micro Forceps',
        icon: '🦾',
        action: 'Switch to Micro Forceps. Simulate flap suturing and releasable suture placement. The tightness of sutures determines early post-op IOP control.',
        tip: 'Tight sutures = low flow and higher IOP early. Loose sutures = over-filtration and hypotony.',
      },
    ],
  },

  {
    id: 'cornea',
    name: 'Corneal Surgery',
    subtitle: 'PK · DALK · DSAEK · DMEK',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-600',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    emoji: '👁️',
    tagline: 'Free-practice instruments — no scored curriculum yet',
    curriculum: false,
    steps: [
      {
        num: 'Setup',
        title: 'Select the procedure',
        icon: '⚙️',
        action: 'Press ☰ Help → Procedure panel → click "Corneal". Instruments: Keratome (trephination / incision) and Micro Forceps (donor graft manipulation and suturing).',
        tip: 'Corneal surgery replaces diseased stromal or endothelial layers with donor tissue.',
      },
      {
        num: 'Place',
        title: 'Place the limbal entry',
        icon: '📍',
        action: 'Press P and click the limbus at 12 o\'clock. For lamellar keratoplasty (DSAEK/DMEK) a small 3 – 4 mm incision is used; for PK the trephine circle defines the entry.',
        tip: 'DMEK uses a much smaller incision than penetrating keratoplasty — less surgically induced astigmatism.',
      },
      {
        num: 'Step 1',
        title: 'Corneal trephination — Keratome',
        icon: '🔵',
        action: 'Select Keratome. Carefully trace the graft outline (depth 1 – 4 mm). For full-thickness PK, full AC entry is required. For DALK, stay in the stroma (< 4 mm).',
        tip: 'Premature AC entry during DALK forces conversion to PK — controlled depth is everything.',
      },
      {
        num: 'Step 2',
        title: 'Graft manipulation — Micro Forceps',
        icon: '🦾',
        action: 'Switch to Micro Forceps to handle the donor graft, position it, and simulate suture placement. For DMEK, use minimal touch technique to protect the endothelium.',
        tip: 'Corneal endothelial cells do not regenerate — every unnecessary touch reduces the graft\'s lifespan.',
      },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type Screen = 'welcome' | 'select' | 'guide';

interface Props {
  onDismiss: (selectedProcedure: SurgeryId) => void;
}

export function OnboardingOverlay({ onDismiss }: Props) {
  const [screen,      setScreen]      = useState<Screen>('welcome');
  const [selected,    setSelected]    = useState<SurgeryInfo>(SURGERIES[0]);
  const [stepIndex,   setStepIndex]   = useState(0);

  const totalSteps = selected.steps.length;
  const step       = selected.steps[stepIndex];
  const isLastStep = stepIndex === totalSteps - 1;

  function selectSurgery(s: SurgeryInfo) {
    setSelected(s);
    setStepIndex(0);
    setScreen('guide');
  }

  function finish() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* */ }
    onDismiss(selected.id);
  }

  // ── Welcome ──────────────────────────────────────────────────────────────
  if (screen === 'welcome') {
    return (
      <Overlay>
        <div className="flex flex-col items-center text-center">
          {/* Eye logo */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-blue-500/40 bg-blue-950/60 text-5xl shadow-lg shadow-blue-500/20">
            👁️
          </div>

          <h1 className="mb-1 text-3xl font-bold tracking-tight text-white">OpenEyeSim</h1>
          <p className="mb-1 text-sm font-semibold tracking-wider text-blue-400 uppercase">
            Real-time 3D Eye Surgery Simulator
          </p>
          <p className="mb-8 max-w-sm text-xs leading-relaxed text-blue-200/60">
            Practice cataract, vitreoretinal, glaucoma, and corneal procedures on a
            physically-accurate 3D eye model — guided by live AI coaching and step-by-step scoring.
          </p>

          {/* Quick legend */}
          <div className="mb-8 grid w-full max-w-xs grid-cols-2 gap-2 text-left">
            {[
              ['☰ Help',    'Toggle panels on / off'],
              ['P key',     'Mark the entry point'],
              ['Drag ↕',    'Insert / withdraw needle'],
              ['1 2 3 4',   'Elevation angle presets'],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col rounded border border-blue-500/20 bg-blue-950/40 px-2 py-1.5">
                <span className="font-mono text-[11px] font-bold text-blue-300">{k}</span>
                <span className="text-[10px] text-blue-200/60">{v}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setScreen('select'); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors"
          >
            Choose a Procedure <ChevronRight size={16} />
          </button>

          <button onClick={finish} className="mt-3 text-[11px] text-blue-400/40 hover:text-blue-300/60 transition-colors">
            Skip intro and open simulator
          </button>
        </div>
      </Overlay>
    );
  }

  // ── Surgery selector ─────────────────────────────────────────────────────
  if (screen === 'select') {
    return (
      <Overlay>
        <div className="w-full max-w-xl">
          <button
            onClick={() => { setScreen('welcome'); }}
            className="mb-4 flex items-center gap-1 text-xs text-blue-400/60 hover:text-blue-300 transition-colors"
          >
            <ChevronLeft size={13} /> Back
          </button>

          <h2 className="mb-1 text-xl font-bold text-white">Select a Surgical Procedure</h2>
          <p className="mb-5 text-xs text-blue-200/50">
            Each module shows a step-by-step walkthrough before you enter the simulator.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SURGERIES.map((s) => (
              <button
                key={s.id}
                onClick={() => { selectSurgery(s); }}
                className={`group relative flex flex-col items-start rounded-xl border bg-gray-900 p-4 text-left transition-all hover:bg-gray-800 hover:shadow-lg ${s.border}`}
              >
                {/* Curriculum badge */}
                <span className={`mb-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.badge}`}>
                  {s.curriculum ? '★ Full Curriculum' : 'Free Practice'}
                </span>

                <div className="mb-1 flex items-center gap-2">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="font-bold text-white">{s.name}</span>
                </div>
                <p className="mb-1 text-[11px] text-blue-200/60">{s.subtitle}</p>
                <p className={`text-[10px] font-medium ${s.accent}`}>{s.tagline}</p>

                <ChevronRight
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-hover:text-blue-400"
                />
              </button>
            ))}
          </div>
        </div>
      </Overlay>
    );
  }

  // ── Surgery-specific step guide ───────────────────────────────────────────
  return (
    <Overlay>
      <div className="w-full max-w-lg">
        {/* Back + surgery name */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => { setScreen('select'); setStepIndex(0); }}
            className="flex items-center gap-1 text-xs text-blue-400/60 hover:text-blue-300 transition-colors"
          >
            <ChevronLeft size={13} /> All procedures
          </button>
          <span className={`text-xs font-semibold ${selected.accent}`}>{selected.name}</span>
        </div>

        {/* Progress bar */}
        <div className="mb-1 flex items-center justify-between text-[10px] text-blue-300/50">
          <span>Step {stepIndex + 1} of {totalSteps}</span>
          <span>{step.num}</span>
        </div>
        <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-gray-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${selected.bg}`}
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step card */}
        <div className={`mb-4 rounded-xl border bg-gray-900 p-5 ${selected.border}`}>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-3xl">{step.icon}</span>
            <h3 className="text-base font-bold text-white">{step.title}</h3>
          </div>

          {/* Action */}
          <p className="mb-4 text-sm leading-relaxed text-blue-100/80">{step.action}</p>

          {/* Tip */}
          <div className="flex items-start gap-2 rounded-lg bg-blue-950/50 px-3 py-2">
            <span className="mt-0.5 text-xs text-yellow-400">💡</span>
            <p className="text-[11px] leading-snug text-blue-200/70">{step.tip}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {stepIndex > 0 && (
            <button
              onClick={() => { setStepIndex(i => i - 1); }}
              className="flex items-center gap-1 rounded-lg border border-blue-500/30 px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/10 transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
          )}

          {!isLastStep ? (
            <button
              onClick={() => { setStepIndex(i => i + 1); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 ${selected.bg}`}
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={finish}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-colors"
            >
              Enter Simulation →
            </button>
          )}
        </div>

        {/* Dot indicators */}
        <div className="mt-4 flex justify-center gap-1">
          {selected.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => { setStepIndex(i); }}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex
                  ? `w-5 ${selected.bg}`
                  : i < stepIndex
                  ? 'w-2.5 bg-gray-500'
                  : 'w-2.5 bg-gray-700'
              }`}
            />
          ))}
        </div>

        <button onClick={finish} className="mt-3 block w-full text-center text-[11px] text-blue-400/40 hover:text-blue-300/60 transition-colors">
          Skip and open simulator
        </button>
      </div>
    </Overlay>
  );
}

// ─── Overlay shell ───────────────────────────────────────────────────────────

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl py-8">
        {children}
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

export function hasSeenOnboarding(): boolean {
  try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
}

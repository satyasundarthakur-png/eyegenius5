import { useState, useEffect } from 'react';
import { Eye, MousePointer, Hand, Play, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'openeyesim-onboarded-v1';

const STEPS = [
  {
    icon: Eye,
    title: 'Welcome to OpenEyeSim',
    body: 'A real-time 3-D cataract surgery simulator with AI coaching and a full 7-step curriculum. No prior setup needed — your keyboard and mouse are the instruments.',
    color: 'text-blue-400',
  },
  {
    icon: MousePointer,
    title: 'Step 1 — Place the Entry Point',
    body: 'Press P (or tap "Place" in the Mode panel) to enter PLACE mode. Then click anywhere on the white sclera of the eye. A green RCM marker will appear — this is your incision entry point.',
    color: 'text-green-400',
  },
  {
    icon: Hand,
    title: 'Step 2 — Control the Instrument',
    body: (
      <>
        In <b>Edit mode</b> (automatic after placing the entry point):
        <ul className="mt-1 list-none space-y-0.5 text-left text-[11px] text-blue-200/80">
          <li>🖱️ <b>Drag left/right</b> — rotate needle azimuth</li>
          <li>🖱️ <b>Drag down/up</b> — insert / withdraw</li>
          <li>🖱️ <b>Scroll wheel</b> — fine depth control</li>
          <li>⌨️ <b>Arrow keys</b> — move 0.5 mm / 3° per press</li>
          <li>⌨️ <b>1 2 3 4</b> — elevation presets (0° 15° 30° 45°)</li>
        </ul>
      </>
    ),
    color: 'text-amber-400',
  },
  {
    icon: Play,
    title: 'Step 3 — Follow the Curriculum',
    body: 'Open the ☰ Help panel and click "Start Procedure" in the Cataract Curriculum section. The AI will guide you through 7 steps: Incision → Capsulorhexis → Hydrodissection → Phaco → Cortex Removal → IOL → Wound Hydration. Switch instruments in the Instrument panel for each step.',
    color: 'text-purple-400',
  },
];

export function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [page, setPage] = useState(0);
  const step = STEPS[page];
  const Icon = step.icon;
  const isLast = page === STEPS.length - 1;

  function finish() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* */ }
    onDismiss();
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-blue-500/30 bg-gray-950 p-6 shadow-2xl">
        {/* Step dots */}
        <div className="mb-4 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${i === page ? 'bg-blue-400' : 'bg-gray-700'}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`mb-3 flex justify-center ${step.color}`}>
          <Icon size={36} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-lg font-semibold text-white">
          {step.title}
        </h2>

        {/* Body */}
        <div className="mb-6 text-center text-xs leading-relaxed text-blue-200/80">
          {typeof step.body === 'string' ? step.body : step.body}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {page > 0 && (
            <button
              onClick={() => { setPage(p => p - 1); }}
              className="flex-1 rounded-lg border border-blue-500/30 py-2 text-sm text-blue-300 hover:bg-blue-500/10"
            >
              Back
            </button>
          )}
          {!isLast ? (
            <button
              onClick={() => { setPage(p => p + 1); }}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={finish}
              className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              Start Simulating →
            </button>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={finish}
          className="mt-3 block w-full text-center text-[11px] text-blue-400/50 hover:text-blue-300/70"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}

/** Returns true if the user has already seen the onboarding. */
export function hasSeenOnboarding(): boolean {
  try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
}

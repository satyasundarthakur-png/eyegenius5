import { useState, useRef, type ReactNode } from "react";
import {
  Eye,
  Layers,
  Wrench,
  Microscope as MicroscopeIcon,
  Activity,
  Map,
  LifeBuoy,
  GraduationCap,
  Award,
  Settings,
  ChevronRight,
  LogOut,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { useSimulationStore } from "../../stores/simulationStore";
import { STORAGE_KEY as ONBOARDING_STORAGE_KEY } from "../OnboardingOverlay";

// ─── Accordion item ────────────────────────────────────────────────────────────
interface SectionProps {
  id: string;
  icon: typeof Eye;
  label: string;
  accent: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}
function Section({ icon: Icon, label, accent, open, onToggle, children }: SectionProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className="overflow-hidden border-b border-white/5 last:border-0">
      <button
        onClick={onToggle}
        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors
          ${open ? "bg-white/5" : "hover:bg-white/[0.03]"}`}
      >
        <Icon size={13} className={`shrink-0 ${accent}`} strokeWidth={2} />
        <span className={`flex-1 text-[11px] font-semibold uppercase tracking-widest ${accent}`}>
          {label}
        </span>
        <ChevronRight
          size={12}
          className={`shrink-0 text-white/25 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>

      {/* Animated expand/collapse */}
      <div
        ref={bodyRef}
        style={{
          maxHeight: open ? "900px" : "0px",
          transition: "max-height 0.25s ease",
          overflow: "hidden",
        }}
      >
        <div className="px-3 pb-3 pt-1">{children}</div>
      </div>
    </div>
  );
}

// ─── The sidebar shell ─────────────────────────────────────────────────────────
interface LeftSidebarProps {
  procedurePanel: ReactNode;
  instrumentPanel: ReactNode;
  modePanel: ReactNode;
  microscopePanel: ReactNode;
  kinematicsPanel: ReactNode;
  minimapPanel: ReactNode;
  curriculumPanel: ReactNode;
  scorePanel: ReactNode;
  controlPanel: ReactNode;
  operativeFieldBadge: ReactNode;
  glossaryPanel: ReactNode;
  onClose?: () => void;
}

type SectionId =
  | "procedure"
  | "instrument"
  | "mode"
  | "microscope"
  | "telemetry"
  | "minimap"
  | "curriculum"
  | "score"
  | "controls"
  | "manual"
  | "glossary";

export function LeftSidebar({
  procedurePanel,
  instrumentPanel,
  modePanel,
  microscopePanel,
  kinematicsPanel,
  minimapPanel,
  curriculumPanel,
  scorePanel,
  controlPanel,
  operativeFieldBadge,
  glossaryPanel,
  onClose,
}: LeftSidebarProps) {
  const [openSection, setOpenSection] = useState<SectionId>("curriculum");

  function toggle(id: SectionId) {
    setOpenSection((prev) => (prev === id ? ("" as SectionId) : id));
  }

  return (
    <div
      className="pointer-events-auto fixed left-4 top-4 bottom-4 z-30 flex flex-col"
      style={{ width: "264px" }}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-blue-500/20 bg-gray-950/92 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2.5">
          <Eye size={14} className="text-blue-400" strokeWidth={2} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">
            OpenEyeSim
          </span>
          <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-400">
            Control Panel
          </span>
          {onClose && (
            <button
              onClick={onClose}
              title="Close panel"
              className="ml-auto flex h-5 w-5 items-center justify-center rounded border border-white/10 text-white/30 hover:border-red-500/40 hover:text-red-400 transition-colors"
            >
              <span className="text-[11px] leading-none">✕</span>
            </button>
          )}
        </div>

        {/* Scrollable accordion body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(59,130,246,0.2) transparent" }}
        >
          {/* Operative field badge — always visible, no expand needed */}
          <div className="border-b border-white/5 px-3 py-2">{operativeFieldBadge}</div>

          <Section
            id="curriculum"
            icon={GraduationCap}
            label="Surgery Curriculum"
            accent="text-purple-400"
            open={openSection === "curriculum"}
            onToggle={() => {
              toggle("curriculum");
            }}
          >
            {curriculumPanel}
          </Section>

          <Section
            id="procedure"
            icon={Layers}
            label="Procedure"
            accent="text-blue-400"
            open={openSection === "procedure"}
            onToggle={() => {
              toggle("procedure");
            }}
          >
            {procedurePanel}
          </Section>

          <Section
            id="instrument"
            icon={Wrench}
            label="Instrument"
            accent="text-green-400"
            open={openSection === "instrument"}
            onToggle={() => {
              toggle("instrument");
            }}
          >
            {instrumentPanel}
          </Section>

          <Section
            id="mode"
            icon={Settings}
            label="Mode & Controls"
            accent="text-blue-400"
            open={openSection === "mode"}
            onToggle={() => {
              toggle("mode");
            }}
          >
            <div className="space-y-3">
              {modePanel}
              <div className="border-t border-white/8 pt-3">{controlPanel}</div>
            </div>
          </Section>

          <Section
            id="microscope"
            icon={MicroscopeIcon}
            label="Microscope"
            accent="text-cyan-400"
            open={openSection === "microscope"}
            onToggle={() => {
              toggle("microscope");
            }}
          >
            {microscopePanel}
          </Section>

          <Section
            id="telemetry"
            icon={Activity}
            label="Instrument Telemetry"
            accent="text-amber-400"
            open={openSection === "telemetry"}
            onToggle={() => {
              toggle("telemetry");
            }}
          >
            {kinematicsPanel}
          </Section>

          <Section
            id="score"
            icon={Award}
            label="Score & AI Coach"
            accent="text-amber-400"
            open={openSection === "score"}
            onToggle={() => {
              toggle("score");
            }}
          >
            {scorePanel}
          </Section>

          <Section
            id="minimap"
            icon={Map}
            label="Minimap"
            accent="text-blue-400"
            open={openSection === "minimap"}
            onToggle={() => {
              toggle("minimap");
            }}
          >
            {minimapPanel}
          </Section>

          <Section
            id="glossary"
            icon={BookOpen}
            label="Surgical Glossary"
            accent="text-purple-400"
            open={openSection === "glossary"}
            onToggle={() => {
              toggle("glossary");
            }}
          >
            {glossaryPanel}
          </Section>

          <Section
            id="manual"
            icon={LifeBuoy}
            label="User Manual"
            accent="text-emerald-400"
            open={openSection === "manual"}
            onToggle={() => {
              toggle("manual");
            }}
          >
            <UserManual />
          </Section>
        </div>

        {/* Footer — Exit button */}
        <ExitFooter />
      </div>
    </div>
  );
}

// ─── Exit confirmation ─────────────────────────────────────────────────────────
function ExitFooter() {
  const [confirming, setConfirming] = useState(false);
  const reset = useSimulationStore((s) => s.reset);
  const toggleHUD = useSimulationStore((s) => s.toggleHUD);

  function handleExit() {
    reset();
    toggleHUD(); // close the sidebar so the user lands on the clean intro state
    setConfirming(false);
    // Clear localStorage onboarding flag so the intro overlay shows again
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {
      /* */
    }
    // Force a page reload — cleanest way to return to the intro state
    window.location.reload();
  }

  return (
    <>
      {/* Confirmation modal */}
      {confirming && (
        <div className="absolute inset-0 z-50 flex items-end justify-center pb-16">
          <div className="pointer-events-auto mx-3 w-full overflow-hidden rounded-xl border border-red-500/30 bg-gray-950/98 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-red-500/20 px-3 py-2.5">
              <AlertTriangle size={13} className="text-red-400" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-red-300">Exit Session?</span>
            </div>
            <div className="px-3 py-2.5">
              <p className="mb-3 text-[11px] text-blue-200/60 leading-relaxed">
                This will reset all progress, entry points, and recorded trails. The intro screen
                will reopen.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setConfirming(false);
                  }}
                  className="flex-1 rounded-lg border border-blue-500/30 py-1.5 text-[11px] font-semibold text-blue-300 hover:bg-blue-500/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExit}
                  className="flex-1 rounded-lg bg-red-600/80 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Exit & Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-white/8 px-3 py-2 flex items-center gap-2">
        <p className="flex-1 text-[9px] text-blue-300/25 tracking-wider uppercase">
          LVPEI · OpenEyeSim v2
        </p>
        <button
          onClick={() => {
            setConfirming(true);
          }}
          title="Exit session and return to intro"
          className="pointer-events-auto flex items-center gap-1 rounded border border-red-500/20 bg-red-500/8 px-2 py-1 text-[10px] font-semibold text-red-400/70 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300 transition-colors"
        >
          <LogOut size={10} strokeWidth={2} />
          Exit
        </button>
      </div>
    </>
  );
}

// ─── Integrated User Manual ────────────────────────────────────────────────────
type ManualTab = "quickstart" | "controls" | "curriculum" | "glossary";

const GLOSSARY = [
  { term: "Limbus", def: "Corneoscleral junction — standard incision site." },
  { term: "Capsulorhexis", def: "Circular tear of the anterior lens capsule (CCC)." },
  { term: "Phacoemulsification", def: "Ultrasonic fragmentation and aspiration of the nucleus." },
  {
    term: "Red Reflex",
    def: "Fundal orange-red glow through the dilated pupil under coaxial light.",
  },
  {
    term: "Mydriasis",
    def: "Pharmacological dilation of the pupil with drops (tropicamide / phenylephrine).",
  },
  { term: "IOL", def: "Intraocular lens inserted into the capsular bag after nucleus removal." },
  {
    term: "Hydrodissection",
    def: "Injection of fluid under the capsule to free the cortex from the capsular bag.",
  },
  {
    term: "Nuclear Sclerosis",
    def: "Age-related hardening and yellowing of the lens nucleus (the cataract itself).",
  },
  {
    term: "Capsular Bag",
    def: "The thin membrane envelope that holds the lens and receives the IOL.",
  },
  { term: "Anterior Chamber", def: "Fluid-filled space between the cornea and iris." },
  { term: "Cortex", def: "Soft outer layer of the lens between the capsule and nucleus." },
  { term: "Zonules", def: "Ciliary fibres suspending the lens inside the eye." },
  {
    term: "Wound Hydration",
    def: "Injecting BSS into the corneal incision stroma to seal it watertight.",
  },
  {
    term: "Entry Point",
    def: "The incision site on the sclera/limbus through which instruments are inserted.",
  },
  { term: "RCM", def: "Remote Centre of Motion — the geometric pivot point at the incision site." },
];

const STEPS = [
  {
    n: 1,
    name: "Incision",
    inst: "Keratome",
    tip: "Insert 2.5–4 mm at a shallow angle into the limbal zone.",
  },
  {
    n: 2,
    name: "Capsulorhexis",
    inst: "Capsulorhexis Forceps",
    tip: "Advance 1.5–4.5 mm. Stay low angle. Follow the yellow guide ring.",
  },
  {
    n: 3,
    name: "Hydrodissection",
    inst: "Hydro Cannula",
    tip: "Insert 1–3 mm under the capsule edge and inject a fluid wave.",
  },
  {
    n: 4,
    name: "Phacoemulsification",
    inst: "Phaco Tip",
    tip: "Advance 5–8 mm into the nucleus. Watch chamber stability.",
  },
  {
    n: 5,
    name: "Cortex Removal",
    inst: "I/A Handpiece",
    tip: "Aspirate cortex. Keep vacuum < 280 mmHg, stability > 70%.",
  },
  {
    n: 6,
    name: "IOL Insertion",
    inst: "IOL Injector",
    tip: "Advance 0.5–3.5 mm. Slow, controlled delivery into the bag.",
  },
  {
    n: 7,
    name: "Wound Hydration",
    inst: "Hydro Cannula",
    tip: "Hydrate incision stroma to seal. Confirm watertight closure.",
  },
];

function UserManual() {
  const [tab, setTab] = useState<ManualTab>("quickstart");
  const [glossaryQuery, setGlossaryQuery] = useState("");

  const tabs: { id: ManualTab; label: string }[] = [
    { id: "quickstart", label: "Quick Start" },
    { id: "controls", label: "Controls" },
    { id: "curriculum", label: "7 Steps" },
    { id: "glossary", label: "Glossary" },
  ];

  const filteredGlossary = GLOSSARY.filter(
    (g) =>
      !glossaryQuery ||
      g.term.toLowerCase().includes(glossaryQuery.toLowerCase()) ||
      g.def.toLowerCase().includes(glossaryQuery.toLowerCase()),
  );

  return (
    <div className="text-[11px]">
      {/* Tab row */}
      <div className="mb-3 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
            }}
            className={`flex-1 rounded py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors
              ${
                tab === t.id
                  ? "bg-emerald-600/30 text-emerald-300"
                  : "text-blue-300/40 hover:text-blue-300/70"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Quick Start ── */}
      {tab === "quickstart" && (
        <div className="space-y-2.5 text-blue-200/70 leading-relaxed">
          <p className="font-semibold text-blue-300">Get operating in 3 steps:</p>
          {[
            {
              n: "1",
              title: "Select Procedure",
              body: "Open Procedure section → choose Cataract Surgery.",
            },
            {
              n: "2",
              title: "Place Entry Point",
              body: "Press P → click anywhere on the white sclera to place your incision site.",
            },
            {
              n: "3",
              title: "Start Curriculum",
              body: "Open Surgery Curriculum → click Start Procedure. Follow the Step Guide at the top of the screen.",
            },
          ].map((s) => (
            <div key={s.n} className="flex gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-400">
                {s.n}
              </span>
              <div>
                <p className="font-semibold text-blue-300">{s.title}</p>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-amber-200/70">
            <p className="font-semibold text-amber-300 mb-0.5">Eye Fixation</p>
            <p>
              Once you place an entry point, the eye locks (🔒). Click the pill in the bottom-left
              to unlock camera orbit for inspection, then re-lock before operating.
            </p>
          </div>
          <div className="mt-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 text-blue-200/70">
            <p className="font-semibold text-blue-300 mb-0.5">Validation not advancing?</p>
            <p>
              Move the correct instrument to the depth shown in the Step Guide, then press ↻
              Validate in the Curriculum section.
            </p>
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      {tab === "controls" && (
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 font-semibold text-blue-300">Mode Switching</p>
            <table className="w-full text-blue-200/70">
              <tbody>
                {[
                  ["V", "Observe (orbit camera)"],
                  ["P", "Mark Entry Point"],
                  ["E", "Operate instrument"],
                  ["R", "Replay recording"],
                  ["Esc", "Reset simulation"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-white/5">
                    <td className="py-1 pr-2">
                      <kbd className="rounded border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-mono text-blue-300">
                        {k}
                      </kbd>
                    </td>
                    <td className="py-1">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="mb-1.5 font-semibold text-blue-300">Operate Mode (E)</p>
            <table className="w-full text-blue-200/70">
              <tbody>
                {[
                  ["↑ / ↓", "Insert / withdraw 0.5 mm"],
                  ["← / →", "Rotate azimuth"],
                  ["1 2 3 4", "Angle presets 0°/15°/30°/45°"],
                  ["Drag ↕", "Insert / withdraw"],
                  ["Drag ↔", "Rotate azimuth"],
                  ["Scroll", "Fine depth control"],
                  ["C", "Clear trails"],
                  ["Z / Y", "Undo / Redo"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-white/5">
                    <td className="py-1 pr-2">
                      <kbd className="rounded border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-mono text-blue-300 whitespace-nowrap">
                        {k}
                      </kbd>
                    </td>
                    <td className="py-1">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7 Steps ── */}
      {tab === "curriculum" && (
        <div className="space-y-2">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-lg border border-blue-500/15 bg-blue-500/5 p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-500/25 text-[9px] font-bold text-purple-300">
                  {s.n}
                </span>
                <span className="font-semibold text-blue-300">{s.name}</span>
                <span className="ml-auto rounded bg-green-500/15 px-1 py-0.5 text-[9px] text-green-400">
                  {s.inst}
                </span>
              </div>
              <p className="text-blue-200/60 leading-relaxed pl-6">{s.tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Glossary ── */}
      {tab === "glossary" && (
        <div>
          <input
            type="text"
            placeholder="Search terms…"
            value={glossaryQuery}
            onChange={(e) => {
              setGlossaryQuery(e.target.value);
            }}
            className="mb-2 w-full rounded border border-blue-500/25 bg-blue-500/10 px-2 py-1.5 text-[11px] text-blue-200 placeholder:text-blue-400/40 outline-none focus:border-blue-400/50"
          />
          <div className="space-y-1.5">
            {filteredGlossary.map((g) => (
              <div key={g.term} className="border-b border-white/5 pb-1.5 last:border-0">
                <p className="font-semibold text-blue-300">{g.term}</p>
                <p className="text-blue-200/55 leading-relaxed">{g.def}</p>
              </div>
            ))}
            {filteredGlossary.length === 0 && (
              <p className="text-blue-300/30 text-center py-4">No terms match "{glossaryQuery}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

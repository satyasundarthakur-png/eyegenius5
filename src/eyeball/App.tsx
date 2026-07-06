import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useState } from "react";
import { Scene } from "./components/scene/Scene";
import { KinematicsPanel } from "./components/hud/KinematicsPanel";
import { ControlPanel } from "./components/hud/ControlPanel";
import { ModePanel } from "./components/hud/ModePanel";
import { RCMPointList } from "./components/hud/RCMPointList";
import { RealTimeChart } from "./components/hud/RealTimeChart";
import { MiniMap } from "./components/hud/MiniMap";
import { InstrumentPanel } from "./components/hud/InstrumentPanel";
import { MicroscopePanel } from "./components/hud/MicroscopePanel";
import { CurriculumPanel } from "./components/hud/CurriculumPanel";
import { ScoreCoachPanel } from "./components/hud/ScoreCoachPanel";
import { ProcedureMenu } from "./components/hud/ProcedureMenu";
import { OperativeFieldBadge } from "./components/hud/OperativeFieldBadge";
import { SurgicalStatusBar } from "./components/hud/SurgicalStatusBar";
import { GlossaryPanel } from "./components/hud/GlossaryPanel";
import { StepGuide } from "./components/hud/StepGuide";
import { OnboardingOverlay, hasSeenOnboarding } from "./components/OnboardingOverlay";
import { LeftSidebar } from "./components/hud/LeftSidebar";
import { useThemeStore } from "./stores/themeStore";
import { useSimulationStore } from "./stores/simulationStore";
import type { SurgicalProcedure } from "./stores/procedureSlice";

/**
 * App — OpenEyeSim root shell
 *
 * Layout:
 *   LEFT  — single unified LeftSidebar (accordion, one section open at a time)
 *            Contains: Curriculum, Procedure, Instrument, Mode/Controls,
 *            Microscope, Telemetry, Score, Minimap, User Manual
 *   RIGHT — slim depth-chart strip (always visible when HUD is open)
 *   TOP   — StepGuide pill (always visible)
 *   BOTTOM-LEFT — SurgicalStatusBar (always visible)
 *   TOP-RIGHT   — ☰ Help toggle
 */
function App() {
  const theme = useThemeStore((s) => s.theme);
  const setProcedure = useSimulationStore((s) => s.setProcedure);
  const setMode = useSimulationStore((s) => s.setMode);
  const startProcedure = useSimulationStore((s) => s.startProcedure);

  const [showIntro, setShowIntro] = useState(() => !hasSeenOnboarding());
  const showHUD = useSimulationStore((s) => s.showHUD);
  const toggleHUD = useSimulationStore((s) => s.toggleHUD);

  const bgColor = theme === "dark" ? "#0a0a1a" : "#f5f5f0";

  function handleIntroDismiss(selectedProcedure: SurgicalProcedure) {
    setProcedure(selectedProcedure);
    // Drop the user straight into Mark Entry mode and (for the fully-guided
    // Cataract procedure) auto-start the curriculum, so finishing onboarding
    // is enough to begin — no need to hunt for "Start Procedure" in a panel.
    setMode("PLACE");
    if (selectedProcedure === "cataract") {
      startProcedure();
    }
    setShowIntro(false);
  }

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden ${theme === "dark" ? "" : "bg-gray-100"}`}
    >
      {/* Intro overlay */}
      {showIntro && <OnboardingOverlay onDismiss={handleIntroDismiss} />}

      {/* 3-D Canvas — always full-screen */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 2, 30], fov: 45, near: 1, far: 250 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
        >
          <color attach="background" args={[bgColor]} />
          <Scene />
        </Canvas>
      </div>

      {/* Always-visible overlays */}
      <StepGuide />
      <SurgicalStatusBar />

      {/* ── ☰ Help toggle ── */}
      <button
        onClick={toggleHUD}
        className={`
          pointer-events-auto fixed right-4 top-4 z-50
          flex items-center gap-1.5 rounded-lg border px-3 py-2
          text-xs font-semibold backdrop-blur transition-all duration-200
          ${
            showHUD
              ? "border-red-500/50 bg-gray-950/90 text-red-300 hover:border-red-400 hover:text-red-100"
              : "border-blue-500/50 bg-gray-950/80 text-blue-300 hover:border-blue-400 hover:text-blue-100"
          }
        `}
        title={showHUD ? "Hide panels" : "Show panels / Help"}
      >
        {showHUD ? "✕ Close" : "☰ Help"}
      </button>

      {/* Replay intro — always reachable, whether or not the HUD panel is open */}
      <button
        onClick={() => {
          setShowIntro(true);
        }}
        className="pointer-events-auto fixed right-4 top-14 z-50 rounded-lg border border-blue-500/20 bg-gray-950/70 px-3 py-1.5 text-[10px] text-blue-400/60 backdrop-blur hover:text-blue-300/80 transition-colors"
        title="Replay intro / change procedure"
      >
        ? Intro
      </button>

      {/* ── HUD panels — toggled by ☰ Help ── */}
      {showHUD && (
        <>
          {/* LEFT — unified accordion sidebar */}
          <LeftSidebar
            procedurePanel={<ProcedureMenu />}
            instrumentPanel={<InstrumentPanel />}
            modePanel={<ModePanel />}
            microscopePanel={<MicroscopePanel />}
            kinematicsPanel={<KinematicsPanel />}
            minimapPanel={<MiniMap />}
            curriculumPanel={<CurriculumPanel />}
            scorePanel={<ScoreCoachPanel />}
            controlPanel={<ControlPanel />}
            glossaryPanel={<GlossaryPanel />}
            operativeFieldBadge={<OperativeFieldBadge />}
            onClose={toggleHUD}
          />

          {/* RIGHT — slim strip: depth chart + entry points stacked */}
          <div
            className="pointer-events-none fixed right-4 top-16 bottom-16 z-30 flex flex-col gap-2"
            style={{ width: "220px" }}
          >
            {/* Depth / real-time chart */}
            <div className="pointer-events-auto overflow-hidden rounded-xl border border-blue-500/20 bg-gray-950/92 backdrop-blur-md shadow-xl">
              <div className="border-b border-white/8 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
                  Depth Chart
                </span>
              </div>
              <div className="px-2 py-2">
                <RealTimeChart />
              </div>
            </div>

            {/* Entry points list */}
            <div className="pointer-events-auto overflow-hidden rounded-xl border border-blue-500/20 bg-gray-950/92 backdrop-blur-md shadow-xl">
              <div className="border-b border-white/8 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400">
                  Entry Points
                </span>
              </div>
              <div className="px-3 py-2">
                <RCMPointList />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

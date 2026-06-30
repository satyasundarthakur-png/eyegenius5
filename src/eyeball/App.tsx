import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useState } from 'react';
import { Scene } from './components/scene/Scene';
import { KinematicsPanel } from './components/hud/KinematicsPanel';
import { ControlPanel } from './components/hud/ControlPanel';
import { ModePanel } from './components/hud/ModePanel';
import { RCMPointList } from './components/hud/RCMPointList';
import { RealTimeChart } from './components/hud/RealTimeChart';
import { MiniMap } from './components/hud/MiniMap';
import { InstrumentPanel } from './components/hud/InstrumentPanel';
import { MicroscopePanel } from './components/hud/MicroscopePanel';
import { CurriculumPanel } from './components/hud/CurriculumPanel';
import { ScoreCoachPanel } from './components/hud/ScoreCoachPanel';
import { ProcedureMenu } from './components/hud/ProcedureMenu';
import { OperativeFieldBadge } from './components/hud/OperativeFieldBadge';
import { SurgicalStatusBar } from './components/hud/SurgicalStatusBar';
import { OnboardingOverlay, hasSeenOnboarding } from './components/OnboardingOverlay';
import { HUDLayout, HUDPanel } from './components/hud/ResponsiveHUD';
import { useThemeStore } from './stores/themeStore';
import { useSimulationStore } from './stores/simulationStore';
import type { SurgicalProcedure } from './stores/procedureSlice';

/**
 * App — OpenEyeSim root shell
 *
 * On first load (or after clearing localStorage), a full-screen intro flow runs:
 *   Screen 1 — Welcome splash + key-bindings cheat-sheet
 *   Screen 2 — Surgery selector (Cataract · Vitreoretinal · Glaucoma · Corneal)
 *   Screen 3 — Surgery-specific step-by-step walkthrough
 * "Enter Simulation" on the last step auto-selects the chosen procedure and
 * dismisses the overlay.
 *
 * During surgery the screen is clean (Canvas only). The ☰ Help button
 * (top-right) toggles all HUD panels. SurgicalStatusBar (bottom-left)
 * always shows phase + mode + a context hint.
 */
function App() {
  const theme        = useThemeStore((s) => s.theme);
  const setProcedure = useSimulationStore((s) => s.setProcedure);

  const [showIntro, setShowIntro] = useState(() => !hasSeenOnboarding());
  const [showHUD,   setShowHUD]   = useState(false);

  const bgColor = theme === 'dark' ? '#0a0a1a' : '#f5f5f0';

  function handleIntroDismiss(selectedProcedure: SurgicalProcedure) {
    // Auto-select the procedure the user chose during the intro walkthrough
    setProcedure(selectedProcedure);
    setShowIntro(false);
  }

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden ${
        theme === 'dark' ? '' : 'bg-gray-100'
      }`}
    >
      {/* ── Intro overlay (shown on first visit) ── */}
      {showIntro && (
        <OnboardingOverlay onDismiss={handleIntroDismiss} />
      )}

      {/* ── 3-D Canvas: always full-screen ── */}
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

      {/* ── Always visible: phase / mode / hint ── */}
      <SurgicalStatusBar />

      {/* ── HUD panels — hidden during surgery, revealed via ☰ Help ── */}
      {showHUD && (
        <>
          <HUDLayout
            topLeft={
              <HUDPanel title="Kinematics">
                <KinematicsPanel />
              </HUDPanel>
            }
            topRight={
              <div className="mr-28 space-y-2">
                <ModePanel />
                <HUDPanel title="Operative Eye">
                  <OperativeFieldBadge />
                </HUDPanel>
              </div>
            }
            midLeft={
              <>
                <HUDPanel title="Procedure">
                  <ProcedureMenu />
                </HUDPanel>
                <HUDPanel title="Instrument">
                  <InstrumentPanel />
                </HUDPanel>
                <HUDPanel title="Microscope" defaultOpen={false}>
                  <MicroscopePanel />
                </HUDPanel>
              </>
            }
            midRight={
              <>
                <HUDPanel title="Cataract Curriculum">
                  <CurriculumPanel />
                </HUDPanel>
                <HUDPanel title="Score & AI Coach" defaultOpen={false}>
                  <ScoreCoachPanel />
                </HUDPanel>
              </>
            }
            bottomRight={
              <HUDPanel title="Controls" defaultOpen={true}>
                <ControlPanel />
              </HUDPanel>
            }
            bottomLeft={
              <div className="mb-10">
                <HUDPanel title="Minimap" defaultOpen={true}>
                  <MiniMap />
                </HUDPanel>
              </div>
            }
          />
          <RCMPointList />
          <RealTimeChart />
        </>
      )}

      {/* ── ☰ Help toggle — always visible ── */}
      <button
        onClick={() => { setShowHUD((v) => !v); }}
        className={`
          pointer-events-auto fixed right-4 top-4 z-50
          flex items-center gap-1.5 rounded-lg border px-3 py-2
          text-xs font-semibold backdrop-blur transition-all duration-200
          ${showHUD
            ? 'border-red-500/50 bg-gray-950/90 text-red-300 hover:border-red-400 hover:text-red-100'
            : 'border-blue-500/50 bg-gray-950/80 text-blue-300 hover:border-blue-400 hover:text-blue-100'
          }
        `}
        title={showHUD ? 'Hide panels' : 'Show panels / Help'}
      >
        {showHUD ? '✕ Close' : '☰ Help'}
      </button>

      {/* ── Replay intro button (visible when HUD is closed) ── */}
      {!showHUD && (
        <button
          onClick={() => { setShowIntro(true); }}
          className="pointer-events-auto fixed right-4 top-14 z-50 rounded-lg border border-blue-500/20 bg-gray-950/70 px-3 py-1.5 text-[10px] text-blue-400/60 backdrop-blur hover:text-blue-300/80 transition-colors"
          title="Replay intro / change procedure"
        >
          ? Intro
        </button>
      )}
    </div>
  );
}

export default App;

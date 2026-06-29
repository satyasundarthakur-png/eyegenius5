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
import { HUDLayout, HUDPanel } from './components/hud/ResponsiveHUD';
import { useThemeStore } from './stores/themeStore';
import { useState as useOnboardState } from 'react';
import { OnboardingOverlay, hasSeenOnboarding } from './components/OnboardingOverlay';
import { StepGuide } from './components/hud/StepGuide';

/**
 * App — OpenEyeSim root shell
 *
 * Surgery-first UI: clean 3-D operative field by default.
 *
 * Always visible (zero HUD clutter during surgery):
 *   • SurgicalStatusBar — bottom-left phase / mode pill + 1-line control hint
 *   • ☰ Help toggle — top-right corner
 *
 * Revealed only when surgeon presses ☰ Help:
 *   • KinematicsPanel, all side panels, RCMPointList, RealTimeChart
 */
function App() {
  const theme = useThemeStore((s) => s.theme);
  const [showHUD, setShowHUD] = useState(false);
  const [showOnboarding, setShowOnboarding] = useOnboardState(() => !hasSeenOnboarding());

  const bgColor = theme === 'dark' ? '#0a0a1a' : '#f5f5f0';

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden ${
        theme === 'dark' ? '' : 'bg-gray-100'
      }`}
    >
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

      {/* ── Always visible: phase / mode status + control hint ── */}
      <SurgicalStatusBar />

      {/* ── HUD panel stack: hidden during surgery ── */}
      {showHUD && (
        <>
          <HUDLayout
            topLeft={
              <HUDPanel title="Kinematics">
                <KinematicsPanel />
              </HUDPanel>
            }
            topRight={
              /* Leave room for the Help button at top-right */
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
              /* Status bar lives at bottom-left; give minimap a slight offset */
              <div className="mb-10">
                <HUDPanel title="Minimap" defaultOpen={true}>
                  <MiniMap />
                </HUDPanel>
              </div>
            }
          />
          {/* RCMPointList is positioned absolute top-16 right-4 inside itself */}
          <RCMPointList />
          <RealTimeChart />
        </>
      )}

      {/* ── Always visible: step instruction strip ── */}
      <StepGuide />

      {/* ── First-visit onboarding overlay ── */}
      {showOnboarding && (
        <OnboardingOverlay onDismiss={() => { setShowOnboarding(false); setShowHUD(true); }} />
      )}

      {/* ── Always visible: ☰ Help toggle ── */}
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
    </div>
  );
}

export default App;

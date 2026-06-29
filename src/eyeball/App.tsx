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
import { HUDLayout, HUDPanel } from './components/hud/ResponsiveHUD';
import { useThemeStore } from './stores/themeStore';

/**
 * App — OpenEyeSim root shell
 *
 * Surgery-first UI: the 3-D scene fills the entire screen with NO panels
 * overlaid, giving the surgeon a clean operative field. A single floating
 * "☰ Help" button (always visible, top-right) slides in the full HUD panel
 * set. Pressing "✕ Close" returns to the clean surgical view.
 *
 * Components hidden during surgery:
 *   - KinematicsPanel  (was the black band across the upper-left)
 *   - RealTimeChart    (was the dark "depth chart" black spot at centre)
 *   - All side panels  (Procedure, Instrument, Microscope, Curriculum, etc.)
 *   - ModePanel, MiniMap, RCMPointList, OperativeFieldBadge
 */
function App() {
  const theme = useThemeStore((s) => s.theme);
  const [showHUD, setShowHUD] = useState(false);

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

      {/* ── HUD panel stack: hidden during surgery, revealed via Help button ── */}
      {showHUD && (
        <>
          <HUDLayout
            topLeft={
              <HUDPanel title="Kinematics">
                <KinematicsPanel />
              </HUDPanel>
            }
            topRight={
              /* Leave space for the Help button (top-right corner) */
              <div className="mr-24 space-y-2">
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
              <HUDPanel title="Minimap" defaultOpen={true}>
                <MiniMap />
              </HUDPanel>
            }
          />
          <RCMPointList />
          <RealTimeChart />
        </>
      )}

      {/* ── Always-visible toggle: sole UI element during surgery ── */}
      <button
        onClick={() => { setShowHUD((v) => !v); }}
        className={`
          pointer-events-auto fixed right-4 top-4 z-50
          flex items-center gap-2 rounded-lg px-3 py-2
          text-xs font-semibold backdrop-blur transition-all duration-200
          border
          ${showHUD
            ? 'border-red-500/50 bg-gray-950/90 text-red-300 hover:border-red-400 hover:text-red-100'
            : 'border-blue-500/50 bg-gray-950/80 text-blue-300 hover:border-blue-400 hover:text-blue-100'
          }
        `}
        title={showHUD ? 'Hide panels (return to surgical view)' : 'Show panels (Help / Settings)'}
      >
        {showHUD ? '✕ Close' : '☰ Help'}
      </button>
    </div>
  );
}

export default App;

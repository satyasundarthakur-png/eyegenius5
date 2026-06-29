import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
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


function App() {
  const theme = useThemeStore((s) => s.theme);

  const bgColor = theme === 'dark' ? '#0a0a1a' : '#f5f5f0';

  return (
    <div className={`relative h-screen w-screen overflow-hidden ${theme === 'dark' ? '' : 'bg-gray-100'}`}>
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
      <HUDLayout
        topLeft={
          <HUDPanel title="Kinematics">
            <KinematicsPanel />
          </HUDPanel>
        }
        topRight={
          <div className="space-y-2">
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
    </div>
  );
}

export default App;

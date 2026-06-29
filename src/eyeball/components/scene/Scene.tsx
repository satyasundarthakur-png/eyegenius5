import { OrbitControls, Environment } from '@react-three/drei';
import { Eyeball } from '../eyeball/Eyeball';
import { Needle } from '../needle/Needle';
import { DepthRuler } from '../needle/DepthRuler';
import { TrajectoryLines } from '../trajectory/TrajectoryLines';
import { RCMIndicator } from '../trajectory/RCMIndicator';
import { RCMConstraintLine } from '../trajectory/RCMConstraintLine';
import { NormalIndicator } from '../trajectory/NormalIndicator';
import { SafetyCone } from '../trajectory/SafetyCone';
import { ObjectLabels } from '../trajectory/ObjectLabels';
import { CollisionIndicator } from '../trajectory/CollisionIndicator';
import { Annotations3D } from '../trajectory/Annotations3D';
import { Lighting } from './Lighting';
import { ScleraClickHandler } from './ScleraClickHandler';
import { useTrajectoryRecorder } from '../../hooks/useTrajectory';
import { useTouchPinch } from '../../hooks/useTouchPinch';
import { useChartDataCollector } from '../../hooks/useChartDataCollector';
import { useAutoPhaseTransition } from '../../hooks/useAutoPhaseTransition';
import { usePhaseTransitionSound } from '../../hooks/usePhaseTransition';
import { useBiomechanics } from '../../hooks/useBiomechanics';
import { useFluidics } from '../../hooks/useFluidics';
import { useCurriculum } from '../../hooks/useCurriculum';
import { useScoringAI } from '../../hooks/useScoringAI';
import { useReplayAnalytics } from '../../hooks/useReplayAnalytics';
import { useSimulationStore } from '../../stores/simulationStore';

export function Scene() {
  useTrajectoryRecorder();
  useTouchPinch();
  useChartDataCollector();
  useAutoPhaseTransition();
  usePhaseTransitionSound();
  useBiomechanics(); // Step 5 - capsule elasticity & collision response
  useFluidics();       // Step 6 - irrigation, aspiration, chamber stability
  useCurriculum();     // Step 7 - cataract workflow validation & complications
  useScoringAI();        // Step 8 - real-time scoring + AI coaching
  useReplayAnalytics();  // Step 9 - enhanced replay with event annotations
  const mode = useSimulationStore((s) => s.mode);

  return (
    <>
      <Lighting />
      <Eyeball />
      <Needle />
      <DepthRuler />
      <TrajectoryLines />
      <RCMConstraintLine />
      <RCMIndicator />
      <NormalIndicator />
      <SafetyCone />
      <ObjectLabels />
      <Annotations3D />
      <CollisionIndicator />
      <ScleraClickHandler />
      <Environment preset="studio" background={false} />
      <OrbitControls
        enabled={mode !== 'EDIT'}
        enablePan={false}
        minDistance={15}
        maxDistance={60}
        target={[0, 0, 0]}
      />
    </>
  );
}

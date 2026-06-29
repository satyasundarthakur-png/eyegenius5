import { useEffect } from 'react';
import { useSimulationStore } from '../stores/simulationStore';

/**
 * useReplayAnalytics (Step 9)
 * Automatically starts/stops enhanced replay recording and logs key surgical events.
 */
export function useReplayAnalytics() {
  const currentInstrument = useSimulationStore((s) => s.currentInstrument);
  const isRecording = useSimulationStore((s) => s.isRecordingReplay);
  const startReplayRecording = useSimulationStore((s) => s.startReplayRecording);
  const logSurgicalEvent = useSimulationStore((s) => s.logSurgicalEvent);
  const stopReplayRecording = useSimulationStore((s) => s.stopReplayRecording);
  const scoring = useSimulationStore((s) => s.scoring);
  const complications = useSimulationStore((s) => s.complications);
  const currentStep = useSimulationStore((s) => s.currentCurriculumStep);

  // Auto-start recording when first instrument becomes active
  useEffect(() => {
    if (currentInstrument && !isRecording) {
      startReplayRecording(currentInstrument.getType());
      logSurgicalEvent('SESSION_START', { instrument: currentInstrument.getType() });
    }
  }, [currentInstrument, isRecording, startReplayRecording, logSurgicalEvent]);

  // Log important events from curriculum / complications
  useEffect(() => {
    if (complications.length > 0) {
      const last = complications[complications.length - 1];
      logSurgicalEvent('COMPLICATION', { type: last.type, cause: last.cause });
    }
  }, [complications, logSurgicalEvent]);

  // Auto-stop and save when curriculum completes
  useEffect(() => {
    if (currentStep === 'complete' && isRecording) {
      const session = stopReplayRecording(
        scoring.performance.overall,
        complications.length,
        currentStep
      );
      if (session) {
        console.log('[Replay] Session saved:', session.id);
      }
    }
  }, [currentStep, isRecording, stopReplayRecording, scoring, complications]);
}

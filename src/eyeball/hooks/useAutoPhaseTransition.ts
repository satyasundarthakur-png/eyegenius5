import { useEffect, useRef } from "react";
import { useSimulationStore } from "../stores/simulationStore";
import { SurgicalPhase } from "../types";
import { MAX_INSERTION_DEPTH } from "../constants";

/**
 * Hook that automatically transitions surgical phases based on:
 * - INSERTING → WITHDRAWING: when depth reaches max for >1 second
 * - WITHDRAWING → COMPLETE: when depth returns to 0
 *
 * All transitions go through store actions (completeSurgery)
 * which use the centralized transitionPhase() state machine.
 */
export function useAutoPhaseTransition() {
  const phase = useSimulationStore((s) => s.phase);
  const insertionDepth = useSimulationStore((s) => s.insertionDepth);
  const maxDepthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (maxDepthTimerRef.current) {
      clearTimeout(maxDepthTimerRef.current);
      maxDepthTimerRef.current = null;
    }

    // Auto-transition: INSERTING → WITHDRAWING when depth stays at max for 1s
    if (phase === SurgicalPhase.INSERTING && insertionDepth >= MAX_INSERTION_DEPTH) {
      maxDepthTimerRef.current = setTimeout(() => {
        useSimulationStore.getState().setPhase(SurgicalPhase.WITHDRAWING);
      }, 1000);
    }

    // Auto-transition: WITHDRAWING → COMPLETE when depth is 0
    if (phase === SurgicalPhase.WITHDRAWING && insertionDepth <= 0.1) {
      useSimulationStore.getState().completeSurgery();
    }

    return () => {
      if (maxDepthTimerRef.current) {
        clearTimeout(maxDepthTimerRef.current);
      }
    };
  }, [phase, insertionDepth]);
}

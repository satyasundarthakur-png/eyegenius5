import { useEffect, useRef } from "react";
import { useSimulationStore } from "../stores/simulationStore";
import { MAX_INSERTION_DEPTH } from "../constants";

/**
 * Handles touch pinch-to-zoom gestures for adjusting insertion depth on mobile devices.
 * Two-finger pinch gesture adjusts the needle insertion depth.
 *
 * Listeners are attached once (empty dependency array) and always read the
 * live store state via getState() inside the handlers, rather than re-adding
 * the listeners on every render — re-adding on every render (as before) could
 * drop touch events mid-gesture if a re-render happened between touchstart
 * and touchend.
 */
export function useTouchPinch() {
  const initialPinchDistance = useRef<number | null>(null);
  const initialDepth = useRef<number>(0);

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    function getPinchDistance(touches: TouchList): number {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function handleTouchStart(e: TouchEvent) {
      const { mode, rcmPoint, insertionDepth } = useSimulationStore.getState();
      if (mode !== "EDIT" || !rcmPoint) return;
      if (e.touches.length === 2) {
        initialPinchDistance.current = getPinchDistance(e.touches);
        initialDepth.current = insertionDepth;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      const { mode, rcmPoint, setInsertionDepth } = useSimulationStore.getState();
      if (mode !== "EDIT" || !rcmPoint) return;
      if (e.touches.length === 2 && initialPinchDistance.current !== null) {
        e.preventDefault();
        const currentDistance = getPinchDistance(e.touches);
        const delta = (currentDistance - initialPinchDistance.current) / 50;
        const newDepth = Math.max(0, Math.min(initialDepth.current + delta, MAX_INSERTION_DEPTH));
        setInsertionDepth(newDepth);
      }
    }

    function handleTouchEnd() {
      initialPinchDistance.current = null;
    }

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
}

import type { StateCreator } from "zustand";
import type { SimulationState } from "./simulationStore";
import { replayEngine, type ReplaySession } from "../../../packages/replay-engine/src";

export interface ReplayAnalyticsSlice {
  currentReplaySession: ReplaySession | null;
  isRecordingReplay: boolean;
  activeReplaySessionId: string | null;

  startReplayRecording: (instrumentType: string) => void;
  logSurgicalEvent: (type: string, data?: Record<string, unknown>) => void;
  stopReplayRecording: (
    finalScore: number,
    complications: number,
    curriculumStep?: string,
  ) => ReplaySession | null;
  exportCurrentSession: () => string | null;
  loadReplaySession: (json: string) => boolean;
  clearReplay: () => void;
}

export const createReplayAnalyticsSlice: StateCreator<
  SimulationState,
  [],
  [],
  ReplayAnalyticsSlice
> = (set, get) => ({
  currentReplaySession: null,
  isRecordingReplay: false,
  activeReplaySessionId: null,

  startReplayRecording: (instrumentType) => {
    const id = replayEngine.startNewSession(instrumentType);
    set({
      isRecordingReplay: true,
      currentReplaySession: null,
      activeReplaySessionId: id,
    });
  },

  logSurgicalEvent: (type, data = {}) => {
    replayEngine.logEvent(type, data);
  },

  stopReplayRecording: (finalScore, complications, curriculumStep) => {
    const session = replayEngine.endSession(finalScore, complications, curriculumStep);
    set({
      isRecordingReplay: false,
      currentReplaySession: session,
      activeReplaySessionId: null,
    });
    return session;
  },

  exportCurrentSession: () => {
    const session = get().currentReplaySession;
    if (!session) return null;
    return replayEngine.exportSession(session);
  },

  loadReplaySession: (json) => {
    const session = replayEngine.importSession(json);
    if (session) {
      set({ currentReplaySession: session });
      return true;
    }
    return false;
  },

  clearReplay: () => {
    set({
      currentReplaySession: null,
      isRecordingReplay: false,
    });
  },
});

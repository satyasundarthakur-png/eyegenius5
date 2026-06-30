import type { ReplayEvent, EnhancedTrailPoint, ReplaySession } from './types/replay';
import type { Vec3 } from '../../../src/eyeball/types';

/**
 * OpenEyeSim AI — Enhanced Replay Engine (Step 9)
 *
 * Extends the original trajectory system with:
 * - Timestamped surgical events and annotations
 * - Session metadata (score, complications, instrument)
 * - Easy export/import for review and instructor feedback
 */

export class ReplayEngine {
  private currentSession: ReplaySession | null = null;
  private events: ReplayEvent[] = [];

  startNewSession(instrumentType: string): string {
    const id = `session-${Date.now().toString()}`;
    this.currentSession = {
      id,
      startTime: Date.now(),
      duration: 0,
      trailData: [],
      events: [],
      metadata: {
        instrumentUsed: instrumentType,
        finalScore: 0,
        complications: 0,
      },
    };
    this.events = [];
    return id;
  }

  addTrailPoint(point: {
    tipPosition: Vec3;
    tiltAlpha: number;
    tiltBeta: number;
    insertionDepth: number;
    timestamp: number;
  }) {
    if (!this.currentSession) return;

    const enhancedPoint: EnhancedTrailPoint = {
      ...point,
      events: this.events.filter(e => Math.abs(e.timestamp - point.timestamp) < 80),
    };

    this.currentSession.trailData.push(enhancedPoint);
    this.events = []; // clear consumed events
  }

  logEvent(type: string, data: Record<string, unknown>, position?: Vec3) {
    const event: ReplayEvent = {
      timestamp: Date.now(),
      type,
      data,
      position,
    };

    if (this.currentSession) {
      this.currentSession.events.push(event);
    }
    this.events.push(event); // buffer for next trail point
  }

  endSession(finalScore: number, complications: number, curriculumStep?: string): ReplaySession | null {
    if (!this.currentSession) return null;

    this.currentSession.duration = Date.now() - this.currentSession.startTime;
    this.currentSession.metadata.finalScore = finalScore;
    this.currentSession.metadata.complications = complications;
    if (curriculumStep) {
      this.currentSession.metadata.curriculumStep = curriculumStep;
    }

    const session = { ...this.currentSession };
    this.currentSession = null;
    return session;
  }

  exportSession(session: ReplaySession): string {
    return JSON.stringify(session, null, 2);
  }

  importSession(json: string): ReplaySession | null {
    try {
      return JSON.parse(json) as ReplaySession;
    } catch {
      return null;
    }
  }

  getCurrentEvents(): ReplayEvent[] {
    return [...this.events];
  }
}

// Singleton
export const replayEngine = new ReplayEngine();

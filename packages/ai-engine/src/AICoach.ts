import type { ScoringSession } from '../../scoring-engine/src/types/scoring';
import type { CataractStep } from '../../curriculum/src/types/curriculum';

/**
 * OpenEyeSim AI — Intelligent Coaching Engine (Step 8)
 *
 * Provides context-aware, natural language feedback based on real-time metrics.
 * Fully offline and deterministic (rule + template based).
 */

export interface CoachingFeedback {
  /** Short headline shown prominently in the HUD. */
  message: string;
  /** Longer, actionable explanation of why this matters and what to change. */
  detail: string;
  priority: 'low' | 'medium' | 'high';
  category: 'tremor' | 'precision' | 'safety' | 'efficiency' | 'technique' | 'fluidics';
  step?: CataractStep;
}

export class AICoach {
  private lastFeedbackTime = 0;
  private feedbackHistory: CoachingFeedback[] = [];

  generateFeedback(
    scoring: ScoringSession,
    currentStep: CataractStep,
    complicationsCount: number
  ): CoachingFeedback | null {
    const now = Date.now();
    if (now - this.lastFeedbackTime < 4500) return null; // throttle

    const { performance, motionMetrics, safetyMetrics } = scoring;

    const candidate = this.pickFeedback(performance, motionMetrics, safetyMetrics, currentStep, complicationsCount, scoring.totalTime);
    if (!candidate) return null;

    // Avoid nagging with the exact same message twice in a row.
    const historyLength = this.feedbackHistory.length;
    if (historyLength > 0 && this.feedbackHistory[historyLength - 1].message === candidate.message) {
      return null;
    }

    this.lastFeedbackTime = now;
    this.feedbackHistory.push(candidate);
    if (this.feedbackHistory.length > 20) this.feedbackHistory.shift();

    return candidate;
  }

  /** Returns the most recent coaching messages, newest last (e.g. for replay annotation / debrief). */
  getHistory(): readonly CoachingFeedback[] {
    return this.feedbackHistory;
  }

  private pickFeedback(
    performance: ScoringSession['performance'],
    motionMetrics: ScoringSession['motionMetrics'],
    safetyMetrics: ScoringSession['safetyMetrics'],
    currentStep: CataractStep,
    complicationsCount: number,
    totalTime: number
  ): CoachingFeedback | null {
    // === High priority safety issues first ===
    if (safetyMetrics.tissueDamage > 25) {
      return {
        message: 'Excessive tissue force detected',
        detail: `Tissue damage is at ${Math.round(safetyMetrics.tissueDamage).toString()}/100. Ease off pressure on the capsule and use smaller, more controlled movements — high force at this stage risks capsule tear or zonular stress.`,
        priority: 'high',
        category: 'safety',
        step: currentStep,
      };
    }

    if (safetyMetrics.endothelialRisk > 40) {
      return {
        message: 'Instrument is too close to the corneal endothelium',
        detail: `Endothelial risk is at ${Math.round(safetyMetrics.endothelialRisk).toString()}/100. Increase your working distance from the posterior cornea — endothelial cell loss from instrument contact does not regenerate.`,
        priority: 'high',
        category: 'safety',
        step: currentStep,
      };
    }

    if (safetyMetrics.chamberStability < 55) {
      return {
        message: 'Anterior chamber is becoming unstable',
        detail: `Chamber stability has dropped to ${Math.round(safetyMetrics.chamberStability).toString()}/100. Balance irrigation inflow against aspiration outflow before continuing — an unstable chamber increases the risk of iris prolapse and capsule collapse.`,
        priority: 'high',
        category: 'fluidics',
      };
    }

    // === Complication-aware follow-up ===
    if (complicationsCount > 0) {
      return {
        message: 'A complication occurred this session',
        detail: 'Pause, reassess instrument position relative to the capsule/iris, and proceed more conservatively. Reviewing this attempt in Replay mode afterward will show exactly where the deviation started.',
        priority: 'medium',
        category: 'safety',
      };
    }

    // === Tremor feedback ===
    if (motionMetrics.tremorScore < 65) {
      return {
        message: 'Hand tremor is affecting precision',
        detail: `Tremor score is ${Math.round(motionMetrics.tremorScore).toString()}/100. Brace your wrist against a stable support and favor small wrist/finger movements over larger arm movements.`,
        priority: 'medium',
        category: 'tremor',
      };
    }

    // === Step-specific technique guidance ===
    switch (currentStep) {
      case 'incision':
        if (motionMetrics.precisionScore < 70) {
          return {
            message: 'Incision angle needs more control',
            detail: 'Enter at a consistent, shallow angle to create a self-sealing tunnel. A wandering blade angle widens the wound and weakens the seal.',
            priority: 'medium',
            category: 'precision',
            step: 'incision',
          };
        }
        break;
      case 'capsulorhexis':
        if (motionMetrics.smoothness < 70) {
          return {
            message: 'Capsulorhexis motion is uneven',
            detail: `Smoothness is at ${Math.round(motionMetrics.smoothness).toString()}/100. Maintain a continuous, circular tearing motion with steady forceps tension — jerky pulls risk a runaway rhexis that extends to the equator.`,
            priority: 'medium',
            category: 'precision',
            step: 'capsulorhexis',
          };
        }
        break;
      case 'hydrodissection':
        return {
          message: 'Inject slowly beneath the capsule edge',
          detail: 'A single, gentle, complete fluid wave beneath the anterior capsule separates the cortex cleanly. Rapid or excessive injection raises posterior chamber pressure and can rupture the posterior capsule.',
          priority: 'low',
          category: 'technique',
          step: 'hydrodissection',
        };
      case 'phacoemulsification':
        if (performance.efficiency < 65) {
          return {
            message: 'Phaco energy time is running high',
            detail: 'Use lower ultrasound power with good followability rather than chasing fragments at high power — this reduces corneal endothelial cell loss and shortens total surgical time.',
            priority: 'medium',
            category: 'efficiency',
            step: 'phacoemulsification',
          };
        }
        break;
      case 'iol_insertion':
        return {
          message: 'Deliver the lens slowly and watch the haptics',
          detail: 'Advance the injector tip just through the incision before unfolding — rapid delivery can cause haptic misplacement or capsule stress at the equator.',
          priority: 'low',
          category: 'technique',
          step: 'iol_insertion',
        };
    }

    // === Efficiency ===
    if (performance.efficiency < 60 && totalTime > 120000) {
      return {
        message: 'Instrument path could be more direct',
        detail: `Efficiency score is ${Math.round(performance.efficiency).toString()}/100 after ${Math.round(totalTime / 1000).toString()}s. Plan your next movement before making it, rather than repositioning mid-motion.`,
        priority: 'low',
        category: 'efficiency',
      };
    }

    // === Positive reinforcement ===
    if (performance.overall > 88 && complicationsCount === 0) {
      return {
        message: 'Excellent control and tissue respect',
        detail: `Overall score is ${Math.round(performance.overall).toString()}/100 with zero complications. Keep this same steady pace and instrument economy through the remaining steps.`,
        priority: 'low',
        category: 'technique',
      };
    }

    return null;
  }

  reset() {
    this.lastFeedbackTime = 0;
    this.feedbackHistory = [];
  }
}

// Singleton
export const aiCoach = new AICoach();

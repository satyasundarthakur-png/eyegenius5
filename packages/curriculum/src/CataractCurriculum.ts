import type { CataractStep, StepValidation, Complication, CataractSession } from './types/curriculum';
import { biomechanics } from '../../physics-engine/src/Biomechanics';
import { fluidics } from '../../fluid-engine/src/Fluidics';

/**
 * OpenEyeSim AI — Cataract Surgery Curriculum (Step 7)
 *
 * Manages the structured cataract surgery workflow and complication logic.
 * This is the "brain" that turns the simulator into a guided training system.
 */

const CATARACT_STEPS: CataractStep[] = [
  'incision',
  'capsulorhexis',
  'hydrodissection',
  'phacoemulsification',
  'cortex_removal',
  'iol_insertion',
  'wound_hydration',
];

export class CataractCurriculum {
  private session: CataractSession;

  constructor() {
    this.session = this.createNewSession();
  }

  private createNewSession(): CataractSession {
    const validations = CATARACT_STEPS.reduce<Record<CataractStep, StepValidation>>((acc, step) => {
      acc[step] = {
        step,
        isValid: false,
        score: 0,
        feedback: [],
        complications: [],
      };
      return acc;
    }, {} as Record<CataractStep, StepValidation>);

    return {
      currentStep: 'incision',
      completedSteps: [],
      validations,
      complications: [],
      overallScore: 0,
      startTime: Date.now(),
    };
  }

  getSession(): CataractSession {
    return { ...this.session };
  }

  getCurrentStep(): CataractStep {
    return this.session.currentStep;
  }

  /** Advance to next step (called when validation passes) */
  advanceStep() {
    const idx = CATARACT_STEPS.indexOf(this.session.currentStep);
    if (idx === -1 || idx === CATARACT_STEPS.length - 1) {
      this.session.currentStep = 'complete';
      return;
    }
    const nextStep = CATARACT_STEPS[idx + 1];
    this.session.completedSteps.push(this.session.currentStep);
    this.session.currentStep = nextStep;
  }

  /**
   * Validate current step based on instrument state + biomechanics + fluidics.
   * This is where the "smart" training logic lives.
   */
  validateCurrentStep(instrumentType: string, insertionDepth: number, tiltAlpha: number): StepValidation {
    const step = this.session.currentStep;
    const validation: StepValidation = {
      step,
      isValid: false,
      score: 0,
      feedback: [],
      complications: [],
    };

    const fluidState = fluidics.getState();
    const capsuleDef = biomechanics.getDeformation('lens-capsule');

    switch (step) {
      case 'incision':
        if (instrumentType === 'keratome') {
          validation.score = Math.min(100, 60 + insertionDepth * 8);
          if (insertionDepth > 2.5 && Math.abs(tiltAlpha) < 0.4) {
            validation.isValid = true;
            validation.feedback.push('Good incision depth and angle.');
          } else {
            validation.feedback.push('Maintain proper incision architecture (slightly downward then parallel).');
          }
        }
        break;

      case 'capsulorhexis': {
        // Capsulorhexis is validated by instrument type + a brief mid-chamber dwell.
        // (Tear-propagation mechanics are a future step; for now we use insertion-depth
        //  as a proxy for the continuous curvilinear tearing motion: 1.5–4.5 mm means
        //  the forceps tip is inside the anterior chamber at a safe capsular working depth.)
        if (instrumentType === 'capsulorhexis_forceps') {
          if (insertionDepth >= 1.5 && insertionDepth <= 4.5 && Math.abs(tiltAlpha) < 0.5) {
            validation.isValid = true;
            validation.score = 85;
            validation.feedback.push('Good continuous curvilinear capsulorhexis — forceps at ideal depth and angle.');
          } else if (insertionDepth > 4.5) {
            validation.score = 40;
            validation.feedback.push('Forceps too deep — risk of posterior capsule rupture. Pull back slightly.');
            this.triggerComplication('posterior_capsule_rupture', 'Excessive forceps depth during capsulorhexis');
          } else {
            validation.feedback.push('Advance the forceps to 1.5–4.5 mm depth, maintaining a low approach angle, to perform CCC.');
          }
        } else {
          validation.feedback.push('Select Capsulorhexis Forceps from the Instrument panel to perform this step.');
        }
        break;
      }

      case 'phacoemulsification':
        if (instrumentType === 'phaco_tip') {
          if (!fluidState.isStable) {
            validation.score = 35;
            validation.feedback.push('Chamber instability detected — high risk of PCR.');
            this.triggerComplication('posterior_capsule_rupture', 'Operating in unstable chamber');
          } else if (insertionDepth > 5.5 && capsuleDef && capsuleDef.intensity > 1.2) {
            validation.score = 50;
            validation.feedback.push('Deep phaco tip — monitor posterior capsule.');
          } else {
            validation.isValid = true;
            validation.score = 80;
          }
        }
        break;

      case 'cortex_removal':
        if (instrumentType === 'irrigation_aspiration') {
          if (fluidState.vacuumLevel > 280 && !fluidState.isStable) {
            this.triggerComplication('zonular_dialysis', 'High vacuum on unstable zonules');
          }
          validation.isValid = fluidState.stability > 0.7;
          validation.score = Math.floor(fluidState.stability * 100);
        }
        break;

      case 'hydrodissection':
        if (instrumentType === 'hydrodissection_cannula') {
          if (insertionDepth >= 4) {
            validation.score = 40;
            validation.feedback.push('Cannula inserted too deep — risk of posterior capsule rupture.');
            this.triggerComplication('posterior_capsule_rupture', 'Excessive cannula depth during hydrodissection');
          } else if (fluidState.isStable && insertionDepth > 1) {
            validation.isValid = true;
            validation.score = 82;
            validation.feedback.push('Good fluid wave beneath the anterior capsule, lens rotates freely.');
          } else {
            validation.feedback.push('Inject gently just beneath the capsule edge to create a complete fluid wave.');
          }
        }
        break;

      case 'iol_insertion':
        if (instrumentType === 'iol_injector') {
          if (capsuleDef && capsuleDef.intensity > 1.5) {
            validation.score = 45;
            validation.feedback.push('High capsule stress during IOL delivery — slow the injection.');
          } else if (insertionDepth > 0.5 && insertionDepth < 3.5) {
            validation.isValid = true;
            validation.score = 88;
            validation.feedback.push('Controlled, slow lens delivery into the capsular bag.');
          } else {
            validation.feedback.push('Advance the injector tip just through the incision before unfolding the lens.');
          }
        }
        break;

      default:
        validation.isValid = true;
        validation.score = 70;
    }

    this.session.validations[step] = validation;
    this.updateOverallScore();
    return validation;
  }

  private triggerComplication(type: Complication['type'], cause: string) {
    const comp: Complication = {
      type,
      severity: type === 'posterior_capsule_rupture' ? 'severe' : 'moderate',
      timestamp: Date.now(),
      cause,
    };
    this.session.complications.push(comp);
    // In future steps we can pause simulation or show dramatic visual feedback
  }

  private updateOverallScore() {
    const vals = Object.values(this.session.validations);
    const avg = vals.reduce((sum, v) => sum + v.score, 0) / Math.max(1, vals.length);
    const complicationPenalty = this.session.complications.length * 12;
    this.session.overallScore = Math.max(0, Math.floor(avg - complicationPenalty));
  }

  reset() {
    this.session = this.createNewSession();
  }
}

// Singleton for easy access
export const cataractCurriculum = new CataractCurriculum();

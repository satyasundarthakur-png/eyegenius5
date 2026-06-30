import type { CataractStep, StepValidation, Complication, CataractSession } from './types/curriculum';
import { biomechanics } from '../../physics-engine/src/Biomechanics';
import { fluidics } from '../../fluid-engine/src/Fluidics';

/**
 * OpenEyeSim AI — Cataract Surgery Curriculum (Step 7)
 *
 * Manages the structured cataract surgery workflow and complication logic.
 *
 * Step validation hardening (see bug-fix log):
 *   incision        — now requires a proper downward-then-parallel approach angle
 *   hydrodissection — requires active irrigation to have stabilised the AC first
 *   phacoemulsification — requires correct nuclear working depth (3–8 mm)
 *   cortex_removal  — requires vacuum to actually be built (> 100 mmHg)
 *   wound_hydration — no longer falls to default; needs cannula at stromal depth
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
      acc[step] = { step, isValid: false, score: 0, feedback: [], complications: [] };
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

  getSession(): CataractSession { return { ...this.session }; }
  getCurrentStep(): CataractStep { return this.session.currentStep; }

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

  validateCurrentStep(instrumentType: string, insertionDepth: number, tiltAlpha: number): StepValidation {
    const step = this.session.currentStep;
    const validation: StepValidation = {
      step, isValid: false, score: 0, feedback: [], complications: [],
    };

    const fluidState  = fluidics.getState();
    const capsuleDef  = biomechanics.getDeformation('lens-capsule');

    switch (step) {

      // ── 1. INCISION (keratome) ─────────────────────────────────────────────
      // Requires a slight downward approach angle (tiltAlpha 0.05–0.40 rad),
      // not flat, to create a proper self-sealing triplanar wound.
      case 'incision':
        if (instrumentType === 'keratome') {
          if (insertionDepth > 2.5 && tiltAlpha >= 0.05 && tiltAlpha < 0.4) {
            validation.isValid = true;
            validation.score   = Math.min(100, 60 + insertionDepth * 8);
            validation.feedback.push('Good incision depth and approach angle — triplanar wound architecture achieved.');
          } else if (tiltAlpha < 0.05) {
            validation.score = 30;
            validation.feedback.push('Approach angle too flat — tilt the keratome slightly downward to create a proper self-sealing wound (use preset 15° or 30°).');
          } else if (tiltAlpha >= 0.4) {
            validation.score = 35;
            validation.feedback.push('Approach angle too steep — risk of iris damage. Reduce tilt before advancing.');
          } else {
            validation.feedback.push('Advance the keratome to adequate depth with a slight downward then parallel trajectory.');
          }
        } else {
          validation.feedback.push('Select the Keratome from the Instrument panel to make the corneal incision.');
        }
        break;

      // ── 2. CAPSULORHEXIS (forceps) ────────────────────────────────────────
      case 'capsulorhexis': {
        if (instrumentType === 'capsulorhexis_forceps') {
          if (insertionDepth >= 1.5 && insertionDepth <= 4.5 && Math.abs(tiltAlpha) < 0.5) {
            validation.isValid = true;
            validation.score   = 85;
            validation.feedback.push('Good continuous curvilinear capsulorhexis — forceps at ideal depth and angle.');
          } else if (insertionDepth > 4.5) {
            validation.score = 40;
            validation.feedback.push('Forceps too deep — risk of posterior capsule rupture. Pull back slightly.');
            this.triggerComplication('posterior_capsule_rupture', 'Excessive forceps depth during capsulorhexis');
          } else {
            validation.feedback.push('Advance forceps to 1.5–4.5 mm depth with a low approach angle to perform CCC.');
          }
        } else {
          validation.feedback.push('Select Capsulorhexis Forceps from the Instrument panel.');
        }
        break;
      }

      // ── 3. HYDRODISSECTION (cannula) ──────────────────────────────────────
      // Requires the AC to already be stable (surgeon must have started irrigation).
      case 'hydrodissection':
        if (instrumentType === 'hydrodissection_cannula') {
          if (insertionDepth >= 4) {
            validation.score = 40;
            validation.feedback.push('Cannula inserted too deep — risk of posterior capsule rupture. Withdraw.');
            this.triggerComplication('posterior_capsule_rupture', 'Excessive cannula depth during hydrodissection');
          } else if (!fluidState.isStable) {
            validation.score = 20;
            validation.feedback.push('Anterior chamber not yet pressurised — run irrigation briefly before hydrodissection.');
          } else if (insertionDepth > 1) {
            validation.isValid = true;
            validation.score   = 82;
            validation.feedback.push('Good fluid wave beneath the anterior capsule — lens rotates freely.');
          } else {
            validation.feedback.push('Insert cannula just beneath the capsule edge and inject gently to create a complete fluid wave.');
          }
        } else {
          validation.feedback.push('Select the Hydrodissection Cannula from the Instrument panel.');
        }
        break;

      // ── 4. PHACOEMULSIFICATION (phaco tip) ────────────────────────────────
      // Now also validates working depth: tip must be in the nuclear zone (3–8 mm).
      // An overly shallow or deep tip is dangerous and fails validation.
      case 'phacoemulsification':
        if (instrumentType === 'phaco_tip') {
          if (!fluidState.isStable) {
            validation.score = 35;
            validation.feedback.push('Chamber instability detected — high risk of PCR. Stabilise irrigation before emulsifying.');
            this.triggerComplication('posterior_capsule_rupture', 'Operating in unstable chamber during phaco');
          } else if (insertionDepth < 3) {
            validation.score = 30;
            validation.feedback.push('Phaco tip too shallow — not yet engaged in the nucleus. Advance to the nuclear zone (3–8 mm).');
          } else if (insertionDepth > 8) {
            validation.score = 40;
            validation.feedback.push('Phaco tip too deep — posterior capsule at risk. Withdraw to 3–8 mm working depth.');
            if (capsuleDef && capsuleDef.intensity > 1.2) {
              this.triggerComplication('posterior_capsule_rupture', 'Phaco tip beyond posterior capsule zone');
            }
          } else {
            // Correct depth range and stable chamber
            validation.isValid = true;
            validation.score   = capsuleDef && capsuleDef.intensity > 1.2 ? 60 : 80;
            if (capsuleDef && capsuleDef.intensity > 1.2) {
              validation.feedback.push('Phaco tip at correct depth but capsule stress is high — ease up on ultrasound power.');
            } else {
              validation.feedback.push('Good nuclear emulsification — tip in correct zone with stable chamber.');
            }
          }
        } else {
          validation.feedback.push('Select the Phaco Tip from the Instrument panel to begin nuclear emulsification.');
        }
        break;

      // ── 5. CORTEX REMOVAL (irrigation/aspiration) ─────────────────────────
      // Requires both chamber stability AND vacuum actually being built (> 100 mmHg).
      // Previously only checked stability — vacuum never rises without active I/A.
      case 'cortex_removal':
        if (instrumentType === 'irrigation_aspiration') {
          if (fluidState.vacuumLevel > 280 && !fluidState.isStable) {
            this.triggerComplication('zonular_dialysis', 'High vacuum with unstable zonules during cortex removal');
            validation.score = 25;
            validation.feedback.push('Dangerously high vacuum in an unstable chamber — release foot pedal and wait for stability.');
          } else if (!fluidState.isStable) {
            validation.score = 30;
            validation.feedback.push('Chamber unstable — engage irrigation first to pressurise the AC before aspirating cortex.');
          } else if (fluidState.vacuumLevel < 100) {
            validation.score = 40;
            validation.feedback.push('Vacuum too low to aspirate cortex — increase aspiration (scroll up or use foot pedal).');
          } else {
            validation.isValid = fluidState.stability > 0.7;
            validation.score   = Math.floor(fluidState.stability * 100);
            if (validation.isValid) {
              validation.feedback.push('Good I/A technique — stable chamber with effective cortex aspiration.');
            } else {
              validation.feedback.push('Continue aspirating — maintain stability above 70 % to complete cortex removal.');
            }
          }
        } else {
          validation.feedback.push('Select the Irrigation/Aspiration handpiece from the Instrument panel.');
        }
        break;

      // ── 6. IOL INSERTION (injector) ───────────────────────────────────────
      case 'iol_insertion':
        if (instrumentType === 'iol_injector') {
          if (capsuleDef && capsuleDef.intensity > 1.5) {
            validation.score = 45;
            validation.feedback.push('High capsule stress during IOL delivery — slow the injection rate.');
          } else if (insertionDepth > 0.5 && insertionDepth < 3.5) {
            validation.isValid = true;
            validation.score   = 88;
            validation.feedback.push('Controlled, slow lens delivery into the capsular bag.');
          } else {
            validation.feedback.push('Advance the injector tip just through the incision before unfolding the lens.');
          }
        } else {
          validation.feedback.push('Select the IOL Injector from the Instrument panel.');
        }
        break;

      // ── 7. WOUND HYDRATION (cannula) ──────────────────────────────────────
      // Previously fell to default → auto-valid. Now requires the hydrodissection
      // cannula to be placed at stromal depth (0.5–2.0 mm) to seal the wound edges.
      case 'wound_hydration':
        if (instrumentType === 'hydrodissection_cannula') {
          if (insertionDepth > 2.0) {
            validation.score = 30;
            validation.feedback.push('Cannula too deep for stromal hydration — withdraw to wound-edge level (0.5–2.0 mm).');
          } else if (insertionDepth >= 0.5) {
            validation.isValid = true;
            validation.score   = 90;
            validation.feedback.push('Wound hydrated — corneal stroma sealed, incision is now watertight.');
          } else {
            validation.feedback.push('Insert the cannula into the corneal stroma at the wound edges to hydrate and seal the incision.');
          }
        } else {
          validation.feedback.push('Use the hydrodissection cannula to hydrate and seal the wound edges (re-select from Instrument panel).');
        }
        break;

      // No default auto-pass — unrecognised steps return isValid: false
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
  }

  private updateOverallScore() {
    const vals = Object.values(this.session.validations);
    const avg  = vals.reduce((sum, v) => sum + v.score, 0) / Math.max(1, vals.length);
    const complicationPenalty = this.session.complications.length * 12;
    this.session.overallScore = Math.max(0, Math.floor(avg - complicationPenalty));
  }

  reset() {
    this.session = this.createNewSession();
  }
}

export const cataractCurriculum = new CataractCurriculum();

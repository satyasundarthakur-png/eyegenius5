export type CataractStep =
  | 'idle'
  | 'incision'           // Keratome
  | 'capsulorhexis'      // Forceps or needle
  | 'hydrodissection'    // Cannula
  | 'phacoemulsification'// Phaco tip
  | 'cortex_removal'     // I/A
  | 'iol_insertion'      // IOL injector
  | 'wound_hydration'    // Final step
  | 'complete';

export interface StepValidation {
  step: CataractStep;
  isValid: boolean;
  score: number;           // 0-100
  feedback: string[];
  complications: string[];
}

export interface Complication {
  type: 'posterior_capsule_rupture' | 'zonular_dialysis' | 'iris_prolapse' | 'wound_leak' | 'dropped_nucleus' | 'chamber_collapse';
  severity: 'minor' | 'moderate' | 'severe';
  timestamp: number;
  cause: string;
}

export interface CataractSession {
  currentStep: CataractStep;
  completedSteps: CataractStep[];
  validations: Record<CataractStep, StepValidation>;
  complications: Complication[];
  overallScore: number;
  startTime: number;
}

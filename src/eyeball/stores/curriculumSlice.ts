import type { StateCreator } from 'zustand';
import type { SimulationState } from './simulationStore';
import { cataractCurriculum, type CataractStep, type StepValidation, type Complication } from '../../../packages/curriculum/src';

export interface CurriculumSlice {
  currentCurriculumStep: CataractStep;
  curriculumValidation: StepValidation | null;
  complications: Complication[];
  /** Whether the user has explicitly started operating (vs. free observation/exploration). */
  procedureStarted: boolean;

  advanceCurriculumStep: () => void;
  validateCurrentCurriculumStep: (instrumentType: string, insertionDepth: number, tiltAlpha: number) => StepValidation;
  resetCurriculum: () => void;
  startProcedure: () => void;
  endProcedure: () => void;
}

export const createCurriculumSlice: StateCreator<SimulationState, [], [], CurriculumSlice> = (set) => ({
  currentCurriculumStep: cataractCurriculum.getCurrentStep(),
  curriculumValidation: null,
  complications: [],
  procedureStarted: false,

  advanceCurriculumStep: () => {
    cataractCurriculum.advanceStep();
    set({
      currentCurriculumStep: cataractCurriculum.getCurrentStep(),
    });
  },

  validateCurrentCurriculumStep: (instrumentType, insertionDepth, tiltAlpha) => {
    const validation = cataractCurriculum.validateCurrentStep(instrumentType, insertionDepth, tiltAlpha);
    set({
      curriculumValidation: validation,
      complications: cataractCurriculum.getSession().complications,
    });
    return validation;
  },

  resetCurriculum: () => {
    cataractCurriculum.reset();
    set({
      currentCurriculumStep: cataractCurriculum.getCurrentStep(),
      curriculumValidation: null,
      complications: [],
      procedureStarted: false,
    });
  },

  startProcedure: () => {
    set({ procedureStarted: true });
  },

  endProcedure: () => {
    set({ procedureStarted: false });
  },
});

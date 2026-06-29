import type { StateCreator } from 'zustand';
import type { SimulationState } from './simulationStore';
import type { InstrumentType } from '../../packages/instrument-engine/src/types/instrument';

export type SurgicalProcedure = 'cataract' | 'retina' | 'glaucoma' | 'cornea';
export type EyeSide = 'OD' | 'OS';

/**
 * Standard temporal-approach surgeon positioning, by eye side.
 * Convention: for a temporal-incision approach the surgeon sits opposite
 * the operative eye's temporal side — typically the patient's right side
 * for OD (right eye) and the patient's left side for OS (left eye), with
 * the microscope/instrument tray oriented accordingly.
 */
export function getOperatorPosition(eyeSide: EyeSide): string {
  return eyeSide === 'OD'
    ? "Temporal approach — surgeon seated at the patient's right side (~3 o'clock)"
    : "Temporal approach — surgeon seated at the patient's left side (~9 o'clock)";
}

export interface ProcedureInfo {
  id: SurgicalProcedure;
  name: string;
  description: string;
  /** Whether a fully validated, step-by-step curriculum exists for this procedure yet. */
  hasGuidedCurriculum: boolean;
  /** Instruments relevant to this procedure — filters the InstrumentPanel. */
  instruments: InstrumentType[];
}

export const PROCEDURES: ProcedureInfo[] = [
  {
    id: 'cataract',
    name: 'Cataract Surgery',
    description: 'Phacoemulsification with IOL implantation — incision through wound hydration.',
    hasGuidedCurriculum: true,
    instruments: [
      'keratome',
      'capsulorhexis_forceps',
      'hydrodissection_cannula',
      'phaco_tip',
      'irrigation_aspiration',
      'iol_injector',
    ],
  },
  {
    id: 'retina',
    name: 'Vitreoretinal Surgery',
    description: 'Pars plana vitrectomy, membrane peeling, and endolaser. Free-practice instruments only.',
    hasGuidedCurriculum: false,
    instruments: ['vitrector', 'micro_forceps', 'endolaser'],
  },
  {
    id: 'glaucoma',
    name: 'Glaucoma Surgery',
    description: 'Trabeculectomy, tube shunt, and MIGS. Free-practice instruments only.',
    hasGuidedCurriculum: false,
    instruments: ['micro_forceps', 'keratome'],
  },
  {
    id: 'cornea',
    name: 'Corneal Surgery',
    description: 'PK, DALK, DSAEK, DMEK lamellar techniques. Free-practice instruments only.',
    hasGuidedCurriculum: false,
    instruments: ['keratome', 'micro_forceps'],
  },
];

export interface ProcedureSlice {
  selectedProcedure: SurgicalProcedure;
  setProcedure: (procedure: SurgicalProcedure) => void;
  eyeSide: EyeSide;
  setEyeSide: (side: EyeSide) => void;
}

export const createProcedureSlice: StateCreator<SimulationState, [], [], ProcedureSlice> = (set, get) => ({
  selectedProcedure: 'cataract',
  eyeSide: 'OD',

  setEyeSide: (side) => {
    set({ eyeSide: side });
  },

  setProcedure: (procedure) => {
    set({ selectedProcedure: procedure });

    const info = PROCEDURES.find((p) => p.id === procedure);
    const firstInstrument = info?.instruments[0];
    if (firstInstrument) {
      get().setCurrentInstrument(firstInstrument);
    }

    // Cataract is the only procedure with a real curriculum right now — reset
    // it whenever we switch procedures so stale step/score state doesn't leak
    // into a different (or freshly re-selected) workflow.
    get().resetCurriculum();
    get().resetScoringAndCoaching();
  },
});

import { Instrument } from '../Instrument';
import type { InstrumentConfig, TipGeometryDescriptor } from '../types/instrument';

/**
 * Micro Forceps
 * Fine-tipped forceps used for internal limiting membrane (ILM) peeling
 * in vitreoretinal surgery and fine tissue handling in glaucoma/MIGS
 * procedures. Reuses the 'forceps' tip geometry at a smaller scale than
 * the cataract capsulorhexis forceps.
 */
export class MicroForceps extends Instrument {
  constructor() {
    const config: InstrumentConfig = {
      type: 'micro_forceps',
      name: 'Micro Forceps',
      usesRCM: true,
      maxInsertionDepth: 11,
      maxTiltAngle: Math.PI / 3.2,
      tipLength: 4,
      color: '#7f8c8d', // steel
    };
    super(config);
  }

  getDisplayName(): string {
    return 'Micro Forceps';
  }

  getTipGeometry(): TipGeometryDescriptor {
    return { type: 'forceps', jawLength: 1.8, opening: 0.6 };
  }
}

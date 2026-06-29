import { Instrument } from '../Instrument';
import type { InstrumentConfig, TipGeometryDescriptor } from '../types/instrument';

/**
 * Capsulorhexis Forceps
 * Used for continuous curvilinear capsulorhexis (CCC).
 * RCM-constrained.
 */
export class CapsulorhexisForceps extends Instrument {
  constructor() {
    const config: InstrumentConfig = {
      type: 'capsulorhexis_forceps',
      name: 'Capsulorhexis Forceps',
      usesRCM: true,
      maxInsertionDepth: 6,
      maxTiltAngle: Math.PI / 4,
      tipLength: 2.8,
      color: '#a8a8a8',
    };
    super(config);
  }

  getDisplayName(): string {
    return 'Capsulorhexis Forceps';
  }

  getTipGeometry(): TipGeometryDescriptor {
    return { type: 'forceps', jawLength: 2.8, opening: 1.2 };
  }
}

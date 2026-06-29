import { Instrument } from '../Instrument';
import type { InstrumentConfig, TipGeometryDescriptor } from '../types/instrument';

/**
 * Hydrodissection Cannula
 * Thin blunt cannula used to inject a fluid wave beneath the anterior capsule,
 * separating the cortex/lens from the capsular bag prior to phacoemulsification.
 * RCM-constrained; shallow working depth.
 */
export class HydrodissectionCannula extends Instrument {
  constructor() {
    const config: InstrumentConfig = {
      type: 'hydrodissection_cannula',
      name: 'Hydrodissection Cannula',
      usesRCM: true,
      maxInsertionDepth: 5,
      maxTiltAngle: Math.PI / 4,
      tipLength: 3.2,
      color: '#7ec8e3', // pale blue, associated with balanced salt solution
    };
    super(config);
  }

  getDisplayName(): string {
    return 'Hydrodissection Cannula';
  }

  getTipGeometry(): TipGeometryDescriptor {
    return { type: 'cannula', diameter: 0.45, length: 3.2, curved: true };
  }
}
